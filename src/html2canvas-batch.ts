import { Bounds, parseBounds, parseDocumentSize } from './css/layout/bounds';
import { COLORS, parseColor } from './css/types/color';
import { isTransparent } from './css/types/color-utilities';
import { CloneConfigurations, DocumentCloner } from './dom/document-cloner';
import { isBodyElement, isHTMLElement, parseTree } from './dom/node-parser';
import { CanvasRenderer, RenderConfigurations } from './render/canvas/canvas-renderer';
import { ForeignObjectRenderer } from './render/canvas/foreignobject-renderer';
import { Context } from './core/context';
import { Options } from './index';

/**
 * Batch rendering class that extends html2canvas functionality
 * to handle arrays of elements with memory-optimized sequential processing.
 *
 * This class is independent of the original html2canvas implementation,
 * allowing for easy forking and merging of upstream changes.
 */
export class Html2CanvasBatch {
    /**
     * Renders an array of HTML elements to an array of canvases.
     * Each canvas contains only one element, processed sequentially to minimize memory usage.
     *
     * @param elements - Array of HTMLElements to render
     * @param options - Rendering options (same as html2canvas)
     * @returns Promise resolving to array of HTMLCanvasElement, one per input element
     */
    static async render(elements: HTMLElement[], options: Partial<Options> = {}): Promise<HTMLCanvasElement[]> {
        if (!elements || !Array.isArray(elements) || elements.length === 0) {
            return Promise.reject('Invalid elements array provided');
        }

        const ownerDocument: Document = elements[0]?.ownerDocument;
        if (!ownerDocument) {
            throw new Error(`Element is not attached to a Document`);
        }

        const defaultView = ownerDocument.defaultView;
        if (!defaultView) {
            throw new Error(`Document is not attached to a Window`);
        }

        const resourceOptions = {
            allowTaint: options.allowTaint ?? false,
            imageTimeout: options.imageTimeout ?? 15000,
            proxy: options.proxy,
            useCORS: options.useCORS ?? false,
            customIsSameOrigin: options.customIsSameOrigin
        };

        const contextOptions = {
            logging: options.logging ?? true,
            cache: options.cache,
            ...resourceOptions
        };

        const windowOptions = {
            windowWidth: options.windowWidth ?? defaultView.innerWidth,
            windowHeight: options.windowHeight ?? defaultView.innerHeight,
            scrollX: options.scrollX ?? defaultView.pageXOffset,
            scrollY: options.scrollY ?? defaultView.pageYOffset
        };

        const windowBounds = new Bounds(
            windowOptions.scrollX,
            windowOptions.scrollY,
            windowOptions.windowWidth,
            windowOptions.windowHeight
        );

        const context = new Context(contextOptions, windowBounds);

        const foreignObjectRendering = options.foreignObjectRendering ?? false;

        const cloneOptions: CloneConfigurations = {
            allowTaint: options.allowTaint ?? false,
            onclone: options.onclone,
            ignoreElements: options.ignoreElements,
            inlineImages: foreignObjectRendering,
            copyStyles: foreignObjectRendering
        };

        context.logger.debug(
            `Starting batch document clone with size ${windowBounds.width}x${
                windowBounds.height
            } scrolled to ${-windowBounds.left},${-windowBounds.top}`
        );

        // Clone document once for all elements
        const documentCloner = new DocumentCloner(context, elements, cloneOptions);
        const clonedElement = documentCloner.clonedReferenceElement;
        if (!clonedElement) {
            return Promise.reject(`Unable to find elements in cloned iframe`);
        }

        const clonedElements = Array.isArray(clonedElement) ? clonedElement : [clonedElement];
        if (clonedElements.length === 0) {
            return Promise.reject(`No elements found in cloned iframe`);
        }

        const container = await documentCloner.toIFrame(ownerDocument, windowBounds);

        // Calculate combined bounds for all elements (for initial setup)
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

        const combinedBounds = {
            left: minLeft,
            top: minTop,
            width: maxRight - minLeft,
            height: maxBottom - minTop
        };

        const { width, height, left, top } = combinedBounds;

        // Use first element for initial background color calculation
        const firstElement = clonedElements[0];
        if (!firstElement) {
            return Promise.reject(`Unable to find element in cloned iframe`);
        }
        const initialBackgroundColor = this.parseBackgroundColor(context, firstElement, options.backgroundColor);

        const renderOptions: RenderConfigurations = {
            canvas: options.canvas,
            backgroundColor: initialBackgroundColor,
            scale: options.scale ?? defaultView.devicePixelRatio ?? 1,
            x: (options.x ?? 0) + left,
            y: (options.y ?? 0) + top,
            width: options.width ?? Math.ceil(width),
            height: options.height ?? Math.ceil(height)
        };

        const canvasArray: HTMLCanvasElement[] = [];

        if (foreignObjectRendering) {
            context.logger.debug(`Document cloned, using foreign object rendering for batch`);
            canvasArray.push(...(await this.renderBatchForeignObject(context, clonedElements, renderOptions, options)));
        } else {
            context.logger.debug(
                `Document cloned, batch rendering ${clonedElements.length} elements located at ${left},${top} with size ${width}x${height} using computed rendering`
            );
            canvasArray.push(...(await this.renderBatchNormal(context, clonedElements, renderOptions, options)));
        }

        if (options.removeContainer ?? true) {
            if (!DocumentCloner.destroy(container)) {
                context.logger.error(`Cannot detach cloned iframe as it is not in the DOM anymore`);
            }
        }

        context.logger.debug(`Finished batch rendering ${canvasArray.length} canvases`);
        return canvasArray;
    }

    /**
     * Renders batch using ForeignObject rendering mode
     */
    private static async renderBatchForeignObject(
        context: Context,
        clonedElements: HTMLElement[],
        renderOptions: RenderConfigurations,
        opts: Partial<Options>
    ): Promise<HTMLCanvasElement[]> {
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
        }

        // Restore original display styles
        for (const style of originalStyles) {
            style.element.style.display = style.display;
        }

        return canvasArray;
    }

    /**
     * Renders batch using normal/computed rendering mode
     */
    private static async renderBatchNormal(
        context: Context,
        clonedElements: HTMLElement[],
        renderOptions: RenderConfigurations,
        opts: Partial<Options>
    ): Promise<HTMLCanvasElement[]> {
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
                    const elementBackgroundColor = this.parseBackgroundColor(context, el, opts.backgroundColor);

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
        }

        // Restore original display styles for all elements
        for (const style of originalStyles) {
            style.element.style.display = style.display;
        }

        return canvasArray;
    }

    /**
     * Parses background color for an element (same logic as original html2canvas)
     */
    private static parseBackgroundColor(
        context: Context,
        element: HTMLElement,
        backgroundColorOverride?: string | null
    ) {
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
    }
}

/**
 * Convenience function for batch rendering
 * @param elements - Array of HTMLElements to render
 * @param options - Rendering options
 * @returns Promise resolving to array of HTMLCanvasElement
 */
export const html2canvasBatch = (
    elements: HTMLElement[],
    options: Partial<Options> = {}
): Promise<HTMLCanvasElement[]> => {
    return Html2CanvasBatch.render(elements, options);
};

export default html2canvasBatch;
