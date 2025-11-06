import { Bounds, parseBounds, parseDocumentSize } from './css/layout/bounds';
import { COLORS, parseColor } from './css/types/color';
import { isTransparent } from './css/types/color-utilities';
import { CloneConfigurations, CloneOptions, DocumentCloner, WindowOptions } from './dom/document-cloner';
import { isBodyElement, isHTMLElement, parseTree } from './dom/node-parser';
import { CacheStorage } from './core/cache-storage';
import { CanvasRenderer, RenderConfigurations, RenderOptions } from './render/canvas/canvas-renderer';
import { ForeignObjectRenderer } from './render/canvas/foreignobject-renderer';
import { Context, ContextOptions } from './core/context';

export type Options = CloneOptions &
    WindowOptions &
    RenderOptions &
    ContextOptions & {
        backgroundColor: string | null;
        foreignObjectRendering: boolean;
        removeContainer?: boolean;
    };

const html2canvas = <T extends HTMLElement | HTMLElement[]>(
    element: T,
    options: Partial<Options> = {}
): Promise<T extends HTMLElement[] ? HTMLCanvasElement[] : HTMLCanvasElement> => {
    return renderElement(element, options) as Promise<
        T extends HTMLElement[] ? HTMLCanvasElement[] : HTMLCanvasElement
    >;
};

export default html2canvas;

if (typeof window !== 'undefined') {
    CacheStorage.setContext(window);
}

const renderElement = async (
    element: HTMLElement | HTMLElement[],
    opts: Partial<Options>
): Promise<HTMLCanvasElement | HTMLCanvasElement[]> => {
    if (!element || typeof element !== 'object' || (Array.isArray(element) && element.length === 0)) {
        return Promise.reject('Invalid element provided as first argument');
    }

    let ownerDocument: Document;
    if (Array.isArray(element)) {
        ownerDocument = element[0]?.ownerDocument;
    } else {
        ownerDocument = element.ownerDocument;
    }

    if (!ownerDocument) {
        throw new Error(`Element is not attached to a Document`);
    }

    const defaultView = ownerDocument.defaultView;

    if (!defaultView) {
        throw new Error(`Document is not attached to a Window`);
    }

    const resourceOptions = {
        allowTaint: opts.allowTaint ?? false,
        imageTimeout: opts.imageTimeout ?? 15000,
        proxy: opts.proxy,
        useCORS: opts.useCORS ?? false,
        customIsSameOrigin: opts.customIsSameOrigin
    };

    const contextOptions = {
        logging: opts.logging ?? true,
        cache: opts.cache,
        ...resourceOptions
    };

    const windowOptions = {
        windowWidth: opts.windowWidth ?? defaultView.innerWidth,
        windowHeight: opts.windowHeight ?? defaultView.innerHeight,
        scrollX: opts.scrollX ?? defaultView.pageXOffset,
        scrollY: opts.scrollY ?? defaultView.pageYOffset
    };

    const windowBounds = new Bounds(
        windowOptions.scrollX,
        windowOptions.scrollY,
        windowOptions.windowWidth,
        windowOptions.windowHeight
    );

    const context = new Context(contextOptions, windowBounds);

    const foreignObjectRendering = opts.foreignObjectRendering ?? false;

    const cloneOptions: CloneConfigurations = {
        allowTaint: opts.allowTaint ?? false,
        onclone: opts.onclone,
        ignoreElements: opts.ignoreElements,
        inlineImages: foreignObjectRendering,
        copyStyles: foreignObjectRendering
    };

    context.logger.debug(
        `Starting document clone with size ${windowBounds.width}x${
            windowBounds.height
        } scrolled to ${-windowBounds.left},${-windowBounds.top}`
    );

    const documentCloner = new DocumentCloner(context, element, cloneOptions);
    const clonedElement = documentCloner.clonedReferenceElement;
    if (!clonedElement) {
        return Promise.reject(`Unable to find element in cloned iframe`);
    }

    const container = await documentCloner.toIFrame(ownerDocument, windowBounds);

    // Handle array of elements
    const clonedElements = Array.isArray(clonedElement) ? clonedElement : [clonedElement];
    const isArray = Array.isArray(clonedElement);

    // Calculate bounds for all elements
    let combinedBounds: { width: number; height: number; left: number; top: number };

    if (isArray && clonedElements.length > 1) {
        // Calculate combined bounding box for all elements
        const boundsList: Array<{ width: number; height: number; left: number; top: number }> = [];

        for (const el of clonedElements) {
            if (!el) continue;
            const bounds =
                isBodyElement(el) || isHTMLElement(el) ? parseDocumentSize(el.ownerDocument) : parseBounds(context, el);
            boundsList.push(bounds);
        }

        if (boundsList.length === 0) {
            return Promise.reject(`Unable to calculate bounds for any elements`);
        }

        const minLeft = Math.min(...boundsList.map((b) => b.left));
        const minTop = Math.min(...boundsList.map((b) => b.top));
        const maxRight = Math.max(...boundsList.map((b) => b.left + b.width));
        const maxBottom = Math.max(...boundsList.map((b) => b.top + b.height));

        combinedBounds = {
            left: minLeft,
            top: minTop,
            width: maxRight - minLeft,
            height: maxBottom - minTop
        };
    } else {
        // Single element case
        const singleElement = clonedElements[0];
        if (!singleElement) {
            return Promise.reject(`Unable to find element in cloned iframe`);
        }
        combinedBounds =
            isBodyElement(singleElement) || isHTMLElement(singleElement)
                ? parseDocumentSize(singleElement.ownerDocument)
                : parseBounds(context, singleElement);
    }

    const { width, height, left, top } = combinedBounds;

    // Use first element for background color calculation
    const firstElement = clonedElements[0];
    if (!firstElement) {
        return Promise.reject(`Unable to find element in cloned iframe`);
    }
    const backgroundColor = parseBackgroundColor(context, firstElement, opts.backgroundColor);

    const renderOptions: RenderConfigurations = {
        canvas: opts.canvas,
        backgroundColor,
        scale: opts.scale ?? defaultView.devicePixelRatio ?? 1,
        x: (opts.x ?? 0) + left,
        y: (opts.y ?? 0) + top,
        width: opts.width ?? Math.ceil(width),
        height: opts.height ?? Math.ceil(height)
    };

    let canvas: HTMLCanvasElement | HTMLCanvasElement[];

    if (foreignObjectRendering) {
        context.logger.debug(`Document cloned, using foreign object rendering`);

        if (isArray && clonedElements.length > 1) {
            // Return array of canvases - one per element
            // Process elements sequentially with promises to reduce memory usage
            const canvasArray: HTMLCanvasElement[] = [];

            // Store original display styles for all elements
            const originalStyles: Array<{ element: HTMLElement; display: string }> = [];
            for (const el of clonedElements) {
                if (el) {
                    originalStyles.push({
                        element: el,
                        display: el.style.display || ''
                    });
                }
            }

            // Process each element sequentially (one at a time) to minimize memory usage
            for (let i = 0; i < clonedElements.length; i++) {
                const el = clonedElements[i];
                if (!el) continue;

                // Create promise for this element - process one at a time
                const elementCanvas = await new Promise<HTMLCanvasElement>(async (resolve, reject) => {
                    try {
                        // Hide all other elements completely using display: none
                        // This removes them from layout flow, preventing iframe boundary issues
                        for (let j = 0; j < clonedElements.length; j++) {
                            const otherEl = clonedElements[j];
                            if (otherEl) {
                                if (j === i) {
                                    // Show current element (restore original display)
                                    otherEl.style.display = originalStyles[j].display || '';
                                } else {
                                    // Completely hide other elements - removes from layout
                                    otherEl.style.display = 'none';
                                }
                            }
                        }

                        const elementBounds =
                            isBodyElement(el) || isHTMLElement(el)
                                ? parseDocumentSize(el.ownerDocument)
                                : parseBounds(context, el);

                        const elementRenderOptions: RenderConfigurations = {
                            canvas: undefined, // Each element gets its own canvas
                            backgroundColor: renderOptions.backgroundColor,
                            scale: renderOptions.scale,
                            x: (opts.x ?? 0) + elementBounds.left,
                            y: (opts.y ?? 0) + elementBounds.top,
                            width: elementBounds.width,
                            height: elementBounds.height
                        };

                        const renderer = new ForeignObjectRenderer(context, elementRenderOptions);
                        const canvas = await renderer.render(el);

                        resolve(canvas);
                    } catch (error) {
                        reject(error);
                    }
                });

                // Add this canvas to the array (one element per canvas)
                canvasArray.push(elementCanvas);

                // Clear references to help with garbage collection
                // The canvas is now in the array, we can release local references
            }

            // Restore original display styles
            for (const style of originalStyles) {
                style.element.style.display = style.display;
            }

            canvas = canvasArray;
        } else {
            const renderer = new ForeignObjectRenderer(context, renderOptions);
            canvas = await renderer.render(firstElement);
        }
    } else {
        context.logger.debug(
            `Document cloned, element${
                isArray ? 's' : ''
            } located at ${left},${top} with size ${width}x${height} using computed rendering`
        );

        if (isArray && clonedElements.length > 1) {
            // Return array of canvases - one per element
            // Process elements sequentially with promises to reduce memory usage
            const canvasArray: HTMLCanvasElement[] = [];

            // Store original display styles for all elements
            const originalStyles: Array<{ element: HTMLElement; display: string }> = [];
            for (const el of clonedElements) {
                if (el) {
                    originalStyles.push({
                        element: el,
                        display: el.style.display || ''
                    });
                }
            }

            // Process each element sequentially (one at a time) to minimize memory usage
            for (let i = 0; i < clonedElements.length; i++) {
                const el = clonedElements[i];
                if (!el) continue;

                // Create promise for this element - process one at a time
                const elementCanvas = await new Promise<HTMLCanvasElement>(async (resolve, reject) => {
                    try {
                        // Hide all other elements completely using display: none
                        // This removes them from layout flow, preventing iframe boundary issues
                        // and reduces memory usage by processing one element at a time
                        for (let j = 0; j < clonedElements.length; j++) {
                            const otherEl = clonedElements[j];
                            if (otherEl) {
                                if (j === i) {
                                    // Show current element (restore original display)
                                    otherEl.style.display = originalStyles[j].display || '';
                                } else {
                                    // Completely hide other elements - removes from layout
                                    otherEl.style.display = 'none';
                                }
                            }
                        }

                        context.logger.debug(`Starting DOM parsing for element ${i + 1}/${clonedElements.length}`);
                        const root = parseTree(context, el);

                        // Calculate element-specific background color
                        const elementBackgroundColor = parseBackgroundColor(context, el, opts.backgroundColor);

                        if (elementBackgroundColor === root.styles.backgroundColor) {
                            root.styles.backgroundColor = COLORS.TRANSPARENT;
                        }

                        const elementBounds =
                            isBodyElement(el) || isHTMLElement(el)
                                ? parseDocumentSize(el.ownerDocument)
                                : parseBounds(context, el);

                        const elementRenderOptions: RenderConfigurations = {
                            canvas: undefined, // Each element gets its own canvas
                            backgroundColor: elementBackgroundColor,
                            scale: renderOptions.scale,
                            x: (opts.x ?? 0) + elementBounds.left,
                            y: (opts.y ?? 0) + elementBounds.top,
                            width: elementBounds.width,
                            height: elementBounds.height
                        };

                        context.logger.debug(
                            `Starting renderer for element at ${elementRenderOptions.x},${elementRenderOptions.y} with size ${elementRenderOptions.width}x${elementRenderOptions.height}`
                        );

                        const renderer = new CanvasRenderer(context, elementRenderOptions);
                        const canvas = await renderer.render(root);

                        resolve(canvas);
                    } catch (error) {
                        reject(error);
                    }
                });

                // Add this canvas to the array (one element per canvas)
                canvasArray.push(elementCanvas);

                // Clear references to help with garbage collection
                // The canvas is now in the array, we can release local references
            }

            // Restore original display styles for all elements
            for (const style of originalStyles) {
                style.element.style.display = style.display;
            }

            canvas = canvasArray;
        } else {
            context.logger.debug(`Starting DOM parsing`);
            const root = parseTree(context, firstElement);

            if (backgroundColor === root.styles.backgroundColor) {
                root.styles.backgroundColor = COLORS.TRANSPARENT;
            }

            context.logger.debug(
                `Starting renderer for element at ${renderOptions.x},${renderOptions.y} with size ${renderOptions.width}x${renderOptions.height}`
            );

            const renderer = new CanvasRenderer(context, renderOptions);
            canvas = await renderer.render(root);
        }
    }

    if (opts.removeContainer ?? true) {
        if (!DocumentCloner.destroy(container)) {
            context.logger.error(`Cannot detach cloned iframe as it is not in the DOM anymore`);
        }
    }

    context.logger.debug(`Finished rendering`);
    return canvas;
};

const parseBackgroundColor = (context: Context, element: HTMLElement, backgroundColorOverride?: string | null) => {
    const ownerDocument = element.ownerDocument;
    // http://www.w3.org/TR/css3-background/#special-backgrounds
    const documentBackgroundColor = ownerDocument.documentElement
        ? parseColor(context, getComputedStyle(ownerDocument.documentElement).backgroundColor as string)
        : COLORS.TRANSPARENT;
    const bodyBackgroundColor = ownerDocument.body
        ? parseColor(context, getComputedStyle(ownerDocument.body).backgroundColor as string)
        : COLORS.TRANSPARENT;

    const defaultBackgroundColor =
        typeof backgroundColorOverride === 'string'
            ? parseColor(context, backgroundColorOverride)
            : backgroundColorOverride === null
            ? COLORS.TRANSPARENT
            : 0xffffffff;

    return element === ownerDocument.documentElement
        ? isTransparent(documentBackgroundColor)
            ? isTransparent(bodyBackgroundColor)
                ? defaultBackgroundColor
                : bodyBackgroundColor
            : documentBackgroundColor
        : defaultBackgroundColor;
};
