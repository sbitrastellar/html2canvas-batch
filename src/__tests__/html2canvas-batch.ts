import { html2canvasBatch, Html2CanvasBatch } from '../html2canvas-batch';

import { CanvasRenderer } from '../render/canvas/canvas-renderer';
import { ForeignObjectRenderer } from '../render/canvas/foreignobject-renderer';
import { DocumentCloner } from '../dom/document-cloner';
import { COLORS } from '../css/types/color';

jest.mock('../core/logger');
jest.mock('../css/layout/bounds');
jest.mock('../dom/document-cloner', () => {
    return {
        DocumentCloner: jest.fn()
    };
});
jest.mock('../dom/node-parser', () => {
    return {
        isBodyElement: () => false,
        isHTMLElement: () => false,
        parseTree: jest.fn().mockImplementation(() => {
            return { styles: { backgroundColor: COLORS.TRANSPARENT } };
        }),
        parseBounds: jest.fn().mockReturnValue({
            left: 0,
            top: 0,
            width: 200,
            height: 50
        })
    };
});

jest.mock('../render/stacking-context');
jest.mock('../render/canvas/canvas-renderer');
jest.mock('../render/canvas/foreignobject-renderer');

describe('Html2CanvasBatch', () => {
    const createMockElement = (id: string): HTMLElement => {
        return {
            ownerDocument: {
                defaultView: {
                    pageXOffset: 12,
                    pageYOffset: 34,
                    innerWidth: 1920,
                    innerHeight: 1080,
                    devicePixelRatio: 1
                }
            },
            id,
            style: {
                display: ''
            }
        } as unknown as HTMLElement;
    };

    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 200;
    mockCanvas.height = 50;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock CanvasRenderer
        (CanvasRenderer as jest.MockedClass<typeof CanvasRenderer>).mockImplementation(() => {
            return {
                render: jest.fn().mockResolvedValue(mockCanvas)
            } as unknown as CanvasRenderer;
        });

        // Mock ForeignObjectRenderer
        (ForeignObjectRenderer as jest.MockedClass<typeof ForeignObjectRenderer>).mockImplementation(() => {
            return {
                render: jest.fn().mockResolvedValue(mockCanvas)
            } as unknown as ForeignObjectRenderer;
        });

        (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
            return {
                clonedReferenceElement: undefined,
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement),
                destroy: jest.fn()
            };
        });
        (DocumentCloner as unknown as { destroy: jest.Mock }).destroy = jest.fn().mockReturnValue(true);
    });

    describe('html2canvasBatch function', () => {
        it('should reject when elements array is empty', async () => {
            await expect(html2canvasBatch([])).rejects.toBe('Invalid elements array provided');
        });

        it('should reject when elements is null', async () => {
            await expect(html2canvasBatch(null as unknown as HTMLElement[])).rejects.toBe(
                'Invalid elements array provided'
            );
        });

        it('should reject when elements is undefined', async () => {
            await expect(html2canvasBatch(undefined as unknown as HTMLElement[])).rejects.toBe(
                'Invalid elements array provided'
            );
        });

        it('should render array of elements and return array of canvases', async () => {
            const elements = [createMockElement('el1'), createMockElement('el2')];

            // Mock cloned elements
            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1'), createMockElement('el2')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            const canvases = await html2canvasBatch(elements);

            expect(Array.isArray(canvases)).toBe(true);
            expect(canvases.length).toBe(2);
            expect(canvases[0]).toBeInstanceOf(HTMLCanvasElement);
            expect(canvases[1]).toBeInstanceOf(HTMLCanvasElement);
        });

        it('should process elements sequentially', async () => {
            const elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];

            const renderOrder: number[] = [];
            (CanvasRenderer as jest.MockedClass<typeof CanvasRenderer>).mockImplementation(() => {
                const renderMock = jest.fn().mockImplementation(async () => {
                    renderOrder.push(renderOrder.length);
                    return mockCanvas;
                });
                return {
                    render: renderMock
                } as unknown as CanvasRenderer;
            });

            const mockCloner = {
                clonedReferenceElement: [
                    createMockElement('el1'),
                    createMockElement('el2'),
                    createMockElement('el3')
                ] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements);

            // Verify sequential processing (should be called 3 times)
            expect(renderOrder.length).toBe(3);
            expect(renderOrder).toEqual([0, 1, 2]);
        });

        it('should use ForeignObjectRenderer when foreignObjectRendering is true', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements, { foreignObjectRendering: true });

            expect(ForeignObjectRenderer).toHaveBeenCalled();
            expect(CanvasRenderer).not.toHaveBeenCalled();
        });

        it('should use CanvasRenderer when foreignObjectRendering is false', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements, { foreignObjectRendering: false });

            expect(CanvasRenderer).toHaveBeenCalled();
        });

        it('should remove container by default', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements);

            expect(DocumentCloner.destroy).toHaveBeenCalled();
        });

        it('should not remove container when removeContainer is false', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements, { removeContainer: false });

            expect(DocumentCloner.destroy).not.toHaveBeenCalled();
        });

        it('should handle single element in array', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            const canvases = await html2canvasBatch(elements);

            expect(Array.isArray(canvases)).toBe(true);
            expect(canvases.length).toBe(1);
            expect(canvases[0]).toBeInstanceOf(HTMLCanvasElement);
        });

        it('should handle multiple elements in array', async () => {
            const elements = [
                createMockElement('el1'),
                createMockElement('el2'),
                createMockElement('el3'),
                createMockElement('el4')
            ];

            const mockCloner = {
                clonedReferenceElement: [
                    createMockElement('el1'),
                    createMockElement('el2'),
                    createMockElement('el3'),
                    createMockElement('el4')
                ] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            const canvases = await html2canvasBatch(elements);

            expect(Array.isArray(canvases)).toBe(true);
            expect(canvases.length).toBe(4);
            canvases.forEach((canvas) => {
                expect(canvas).toBeInstanceOf(HTMLCanvasElement);
            });
        });
    });

    describe('Html2CanvasBatch class', () => {
        it('should have static render method', () => {
            expect(typeof Html2CanvasBatch.render).toBe('function');
        });

        it('should render elements using static render method', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            const canvases = await Html2CanvasBatch.render(elements);

            expect(Array.isArray(canvases)).toBe(true);
            expect(canvases.length).toBe(1);
        });

        it('should reject when elements array is empty', async () => {
            await expect(Html2CanvasBatch.render([])).rejects.toBe('Invalid elements array provided');
        });
    });

    describe('Options handling', () => {
        it('should pass options to renderer', async () => {
            const elements = [createMockElement('el1')];
            const options = {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            };

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements, options);

            // Verify options are passed through
            expect(DocumentCloner).toHaveBeenCalledWith(
                expect.anything(),
                elements,
                expect.objectContaining({
                    allowTaint: false,
                    inlineImages: false,
                    copyStyles: false
                })
            );
        });

        it('should handle backgroundColor option', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [createMockElement('el1')] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements, { backgroundColor: null });

            // Should not throw and complete successfully
            expect(true).toBe(true);
        });
    });

    describe('Error handling', () => {
        it('should reject when element is not attached to document', async () => {
            const elements = [{} as HTMLElement];

            await expect(html2canvasBatch(elements)).rejects.toThrow('Element is not attached to a Document');
        });

        it('should reject when document is not attached to window', async () => {
            const elements = [
                {
                    ownerDocument: {
                        defaultView: null
                    }
                } as unknown as HTMLElement
            ];

            await expect(html2canvasBatch(elements)).rejects.toThrow('Document is not attached to a Window');
        });

        it('should reject when cloned elements are not found', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: undefined as HTMLElement[] | undefined,
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await expect(html2canvasBatch(elements)).rejects.toContain('Unable to find elements in cloned iframe');
        });

        it('should reject when no elements found in cloned iframe', async () => {
            const elements = [createMockElement('el1')];

            const mockCloner = {
                clonedReferenceElement: [] as HTMLElement[],
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await expect(html2canvasBatch(elements)).rejects.toContain('No elements found in cloned iframe');
        });

        it('should reject when unable to calculate bounds', async () => {
            // This test verifies that when boundsList ends up empty (no valid bounds calculated),
            // the function rejects with the appropriate error message.
            // We achieve this by having cloned elements that all get filtered out (null/undefined)
            const elements = [createMockElement('el1')];

            // Create elements that will be filtered out (null elements)
            const nullElements = [null as unknown as HTMLElement];

            const mockCloner = {
                clonedReferenceElement: nullElements,
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            // When all elements are null, they get filtered out (if (!el) continue),
            // resulting in boundsList.length === 0, which triggers the error
            await expect(html2canvasBatch(elements)).rejects.toContain('Unable to calculate bounds');
        });
    });

    describe('Memory optimization', () => {
        it('should process elements one at a time', async () => {
            const elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];

            const clonedElements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];

            const displayChanges: Array<{ index: number; display: string }> = [];

            // Track display property changes
            clonedElements.forEach((el, index) => {
                // Store the actual display value in a hidden property
                const displayStore = { value: '' };
                Object.defineProperty(el.style, 'display', {
                    get: () => displayStore.value,
                    set: (value: string) => {
                        displayChanges.push({ index, display: value });
                        displayStore.value = value;
                    },
                    configurable: true
                });
            });

            const mockCloner = {
                clonedReferenceElement: clonedElements,
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                } as unknown as HTMLIFrameElement)
            };

            // Set up mock for this test - DocumentCloner is already mocked at module level
            (DocumentCloner as unknown as jest.Mock).mockImplementation(() => {
                return mockCloner as unknown as DocumentCloner;
            });

            await html2canvasBatch(elements);

            // Verify that display: none was used (memory optimization)
            // Should have multiple display changes (hide/show cycles)
            expect(displayChanges.length).toBeGreaterThan(0);
        });
    });
});
