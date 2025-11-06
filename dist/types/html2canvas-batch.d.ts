import { Options } from './index';
/**
 * Batch rendering class that extends html2canvas functionality
 * to handle arrays of elements with memory-optimized sequential processing.
 *
 * This class is independent of the original html2canvas implementation,
 * allowing for easy forking and merging of upstream changes.
 */
export declare class Html2CanvasBatch {
    /**
     * Renders an array of HTML elements to an array of canvases.
     * Each canvas contains only one element, processed sequentially to minimize memory usage.
     *
     * @param elements - Array of HTMLElements to render
     * @param options - Rendering options (same as html2canvas)
     * @returns Promise resolving to array of HTMLCanvasElement, one per input element
     */
    static render(elements: HTMLElement[], options?: Partial<Options>): Promise<HTMLCanvasElement[]>;
    /**
     * Renders batch using ForeignObject rendering mode
     */
    private static renderBatchForeignObject;
    /**
     * Renders batch using normal/computed rendering mode
     */
    private static renderBatchNormal;
    /**
     * Parses background color for an element (same logic as original html2canvas)
     */
    private static parseBackgroundColor;
}
/**
 * Convenience function for batch rendering
 * @param elements - Array of HTMLElements to render
 * @param options - Rendering options
 * @returns Promise resolving to array of HTMLCanvasElement
 */
export declare const html2canvasBatch: (elements: HTMLElement[], options?: Partial<Options>) => Promise<HTMLCanvasElement[]>;
export default html2canvasBatch;
