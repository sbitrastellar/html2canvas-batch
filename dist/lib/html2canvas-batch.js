"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.html2canvasBatch = exports.Html2CanvasBatch = void 0;
var bounds_1 = require("./css/layout/bounds");
var color_1 = require("./css/types/color");
var color_utilities_1 = require("./css/types/color-utilities");
var document_cloner_1 = require("./dom/document-cloner");
var node_parser_1 = require("./dom/node-parser");
var canvas_renderer_1 = require("./render/canvas/canvas-renderer");
var foreignobject_renderer_1 = require("./render/canvas/foreignobject-renderer");
var context_1 = require("./core/context");
/**
 * Batch rendering class that extends html2canvas functionality
 * to handle arrays of elements with memory-optimized sequential processing.
 *
 * This class is independent of the original html2canvas implementation,
 * allowing for easy forking and merging of upstream changes.
 */
var Html2CanvasBatch = /** @class */ (function () {
    function Html2CanvasBatch() {
    }
    /**
     * Renders an array of HTML elements to an array of canvases.
     * Each canvas contains only one element, processed sequentially to minimize memory usage.
     *
     * @param elements - Array of HTMLElements to render
     * @param options - Rendering options (same as html2canvas)
     * @returns Promise resolving to array of HTMLCanvasElement, one per input element
     */
    Html2CanvasBatch.render = function (elements_1) {
        return __awaiter(this, arguments, void 0, function (elements, options) {
            var ownerDocument, defaultView, resourceOptions, contextOptions, windowOptions, windowBounds, context, foreignObjectRendering, cloneOptions, documentCloner, clonedElement, clonedElements, container, boundsList, _i, clonedElements_1, el, bounds, minLeft, minTop, maxRight, maxBottom, combinedBounds, width, height, left, top, firstElement, initialBackgroundColor, renderOptions, canvasArray, _a, _b, _c, _d, _e, _f;
            var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_0) {
                switch (_0.label) {
                    case 0:
                        if (!elements || !Array.isArray(elements) || elements.length === 0) {
                            return [2 /*return*/, Promise.reject('Invalid elements array provided')];
                        }
                        ownerDocument = (_g = elements[0]) === null || _g === void 0 ? void 0 : _g.ownerDocument;
                        if (!ownerDocument) {
                            throw new Error("Element is not attached to a Document");
                        }
                        defaultView = ownerDocument.defaultView;
                        if (!defaultView) {
                            throw new Error("Document is not attached to a Window");
                        }
                        resourceOptions = {
                            allowTaint: (_h = options.allowTaint) !== null && _h !== void 0 ? _h : false,
                            imageTimeout: (_j = options.imageTimeout) !== null && _j !== void 0 ? _j : 15000,
                            proxy: options.proxy,
                            useCORS: (_k = options.useCORS) !== null && _k !== void 0 ? _k : false,
                            customIsSameOrigin: options.customIsSameOrigin
                        };
                        contextOptions = __assign({ logging: (_l = options.logging) !== null && _l !== void 0 ? _l : true, cache: options.cache }, resourceOptions);
                        windowOptions = {
                            windowWidth: (_m = options.windowWidth) !== null && _m !== void 0 ? _m : defaultView.innerWidth,
                            windowHeight: (_o = options.windowHeight) !== null && _o !== void 0 ? _o : defaultView.innerHeight,
                            scrollX: (_p = options.scrollX) !== null && _p !== void 0 ? _p : defaultView.pageXOffset,
                            scrollY: (_q = options.scrollY) !== null && _q !== void 0 ? _q : defaultView.pageYOffset
                        };
                        windowBounds = new bounds_1.Bounds(windowOptions.scrollX, windowOptions.scrollY, windowOptions.windowWidth, windowOptions.windowHeight);
                        context = new context_1.Context(contextOptions, windowBounds);
                        foreignObjectRendering = (_r = options.foreignObjectRendering) !== null && _r !== void 0 ? _r : false;
                        cloneOptions = {
                            allowTaint: (_s = options.allowTaint) !== null && _s !== void 0 ? _s : false,
                            onclone: options.onclone,
                            ignoreElements: options.ignoreElements,
                            inlineImages: foreignObjectRendering,
                            copyStyles: foreignObjectRendering
                        };
                        context.logger.debug("Starting batch document clone with size ".concat(windowBounds.width, "x").concat(windowBounds.height, " scrolled to ").concat(-windowBounds.left, ",").concat(-windowBounds.top));
                        documentCloner = new document_cloner_1.DocumentCloner(context, elements, cloneOptions);
                        clonedElement = documentCloner.clonedReferenceElement;
                        if (!clonedElement) {
                            return [2 /*return*/, Promise.reject("Unable to find elements in cloned iframe")];
                        }
                        clonedElements = Array.isArray(clonedElement) ? clonedElement : [clonedElement];
                        if (clonedElements.length === 0) {
                            return [2 /*return*/, Promise.reject("No elements found in cloned iframe")];
                        }
                        return [4 /*yield*/, documentCloner.toIFrame(ownerDocument, windowBounds)];
                    case 1:
                        container = _0.sent();
                        boundsList = [];
                        for (_i = 0, clonedElements_1 = clonedElements; _i < clonedElements_1.length; _i++) {
                            el = clonedElements_1[_i];
                            if (!el)
                                continue;
                            bounds = (0, node_parser_1.isBodyElement)(el) || (0, node_parser_1.isHTMLElement)(el) ? (0, bounds_1.parseDocumentSize)(el.ownerDocument) : (0, bounds_1.parseBounds)(context, el);
                            boundsList.push(bounds);
                        }
                        if (boundsList.length === 0) {
                            return [2 /*return*/, Promise.reject("Unable to calculate bounds for any elements")];
                        }
                        minLeft = Math.min.apply(Math, boundsList.map(function (b) { return b.left; }));
                        minTop = Math.min.apply(Math, boundsList.map(function (b) { return b.top; }));
                        maxRight = Math.max.apply(Math, boundsList.map(function (b) { return b.left + b.width; }));
                        maxBottom = Math.max.apply(Math, boundsList.map(function (b) { return b.top + b.height; }));
                        combinedBounds = {
                            left: minLeft,
                            top: minTop,
                            width: maxRight - minLeft,
                            height: maxBottom - minTop
                        };
                        width = combinedBounds.width, height = combinedBounds.height, left = combinedBounds.left, top = combinedBounds.top;
                        firstElement = clonedElements[0];
                        if (!firstElement) {
                            return [2 /*return*/, Promise.reject("Unable to find element in cloned iframe")];
                        }
                        initialBackgroundColor = this.parseBackgroundColor(context, firstElement, options.backgroundColor);
                        renderOptions = {
                            canvas: options.canvas,
                            backgroundColor: initialBackgroundColor,
                            scale: (_u = (_t = options.scale) !== null && _t !== void 0 ? _t : defaultView.devicePixelRatio) !== null && _u !== void 0 ? _u : 1,
                            x: ((_v = options.x) !== null && _v !== void 0 ? _v : 0) + left,
                            y: ((_w = options.y) !== null && _w !== void 0 ? _w : 0) + top,
                            width: (_x = options.width) !== null && _x !== void 0 ? _x : Math.ceil(width),
                            height: (_y = options.height) !== null && _y !== void 0 ? _y : Math.ceil(height)
                        };
                        canvasArray = [];
                        if (!foreignObjectRendering) return [3 /*break*/, 3];
                        context.logger.debug("Document cloned, using foreign object rendering for batch");
                        _b = (_a = canvasArray.push).apply;
                        _c = [canvasArray];
                        return [4 /*yield*/, this.renderBatchForeignObject(context, clonedElements, renderOptions, options)];
                    case 2:
                        _b.apply(_a, _c.concat([(_0.sent())]));
                        return [3 /*break*/, 5];
                    case 3:
                        context.logger.debug("Document cloned, batch rendering ".concat(clonedElements.length, " elements located at ").concat(left, ",").concat(top, " with size ").concat(width, "x").concat(height, " using computed rendering"));
                        _e = (_d = canvasArray.push).apply;
                        _f = [canvasArray];
                        return [4 /*yield*/, this.renderBatchNormal(context, clonedElements, renderOptions, options)];
                    case 4:
                        _e.apply(_d, _f.concat([(_0.sent())]));
                        _0.label = 5;
                    case 5:
                        if ((_z = options.removeContainer) !== null && _z !== void 0 ? _z : true) {
                            if (!document_cloner_1.DocumentCloner.destroy(container)) {
                                context.logger.error("Cannot detach cloned iframe as it is not in the DOM anymore");
                            }
                        }
                        context.logger.debug("Finished batch rendering ".concat(canvasArray.length, " canvases"));
                        return [2 /*return*/, canvasArray];
                }
            });
        });
    };
    /**
     * Renders batch using ForeignObject rendering mode
     */
    Html2CanvasBatch.renderBatchForeignObject = function (context, clonedElements, renderOptions, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var canvasArray, originalStyles, _i, clonedElements_2, el, _loop_1, i, _a, originalStyles_1, style;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        canvasArray = [];
                        originalStyles = [];
                        for (_i = 0, clonedElements_2 = clonedElements; _i < clonedElements_2.length; _i++) {
                            el = clonedElements_2[_i];
                            if (el) {
                                originalStyles.push({
                                    element: el,
                                    display: el.style.display || ''
                                });
                            }
                        }
                        _loop_1 = function (i) {
                            var el, elementCanvas;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        el = clonedElements[i];
                                        if (!el)
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                                var j, otherEl, elementBounds, elementRenderOptions, renderer, canvas, error_1;
                                                var _a, _b;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            _c.trys.push([0, 2, , 3]);
                                                            // Hide all other elements completely using display: none
                                                            // This removes them from layout flow, preventing iframe boundary issues
                                                            for (j = 0; j < clonedElements.length; j++) {
                                                                otherEl = clonedElements[j];
                                                                if (otherEl) {
                                                                    if (j === i) {
                                                                        // Show current element (restore original display)
                                                                        otherEl.style.display = originalStyles[j].display || '';
                                                                    }
                                                                    else {
                                                                        // Completely hide other elements - removes from layout
                                                                        otherEl.style.display = 'none';
                                                                    }
                                                                }
                                                            }
                                                            elementBounds = (0, node_parser_1.isBodyElement)(el) || (0, node_parser_1.isHTMLElement)(el)
                                                                ? (0, bounds_1.parseDocumentSize)(el.ownerDocument)
                                                                : (0, bounds_1.parseBounds)(context, el);
                                                            elementRenderOptions = {
                                                                canvas: undefined, // Each element gets its own canvas
                                                                backgroundColor: renderOptions.backgroundColor,
                                                                scale: renderOptions.scale,
                                                                x: ((_a = opts.x) !== null && _a !== void 0 ? _a : 0) + elementBounds.left,
                                                                y: ((_b = opts.y) !== null && _b !== void 0 ? _b : 0) + elementBounds.top,
                                                                width: elementBounds.width,
                                                                height: elementBounds.height
                                                            };
                                                            renderer = new foreignobject_renderer_1.ForeignObjectRenderer(context, elementRenderOptions);
                                                            return [4 /*yield*/, renderer.render(el)];
                                                        case 1:
                                                            canvas = _c.sent();
                                                            resolve(canvas);
                                                            return [3 /*break*/, 3];
                                                        case 2:
                                                            error_1 = _c.sent();
                                                            reject(error_1);
                                                            return [3 /*break*/, 3];
                                                        case 3: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        elementCanvas = _c.sent();
                                        // Add this canvas to the array (one element per canvas)
                                        canvasArray.push(elementCanvas);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < clonedElements.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // Restore original display styles
                        for (_a = 0, originalStyles_1 = originalStyles; _a < originalStyles_1.length; _a++) {
                            style = originalStyles_1[_a];
                            style.element.style.display = style.display;
                        }
                        return [2 /*return*/, canvasArray];
                }
            });
        });
    };
    /**
     * Renders batch using normal/computed rendering mode
     */
    Html2CanvasBatch.renderBatchNormal = function (context, clonedElements, renderOptions, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var canvasArray, originalStyles, _i, clonedElements_3, el, _loop_2, i, _a, originalStyles_2, style;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        canvasArray = [];
                        originalStyles = [];
                        for (_i = 0, clonedElements_3 = clonedElements; _i < clonedElements_3.length; _i++) {
                            el = clonedElements_3[_i];
                            if (el) {
                                originalStyles.push({
                                    element: el,
                                    display: el.style.display || ''
                                });
                            }
                        }
                        _loop_2 = function (i) {
                            var el, elementCanvas;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        el = clonedElements[i];
                                        if (!el)
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                                var j, otherEl, root, elementBackgroundColor, elementBounds, elementRenderOptions, renderer, canvas, error_2;
                                                var _a, _b;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            _c.trys.push([0, 2, , 3]);
                                                            // Hide all other elements completely using display: none
                                                            // This removes them from layout flow, preventing iframe boundary issues
                                                            // and reduces memory usage by processing one element at a time
                                                            for (j = 0; j < clonedElements.length; j++) {
                                                                otherEl = clonedElements[j];
                                                                if (otherEl) {
                                                                    if (j === i) {
                                                                        // Show current element (restore original display)
                                                                        otherEl.style.display = originalStyles[j].display || '';
                                                                    }
                                                                    else {
                                                                        // Completely hide other elements - removes from layout
                                                                        otherEl.style.display = 'none';
                                                                    }
                                                                }
                                                            }
                                                            context.logger.debug("Starting DOM parsing for element ".concat(i + 1, "/").concat(clonedElements.length));
                                                            root = (0, node_parser_1.parseTree)(context, el);
                                                            elementBackgroundColor = this.parseBackgroundColor(context, el, opts.backgroundColor);
                                                            if (elementBackgroundColor === root.styles.backgroundColor) {
                                                                root.styles.backgroundColor = color_1.COLORS.TRANSPARENT;
                                                            }
                                                            elementBounds = (0, node_parser_1.isBodyElement)(el) || (0, node_parser_1.isHTMLElement)(el)
                                                                ? (0, bounds_1.parseDocumentSize)(el.ownerDocument)
                                                                : (0, bounds_1.parseBounds)(context, el);
                                                            elementRenderOptions = {
                                                                canvas: undefined, // Each element gets its own canvas
                                                                backgroundColor: elementBackgroundColor,
                                                                scale: renderOptions.scale,
                                                                x: ((_a = opts.x) !== null && _a !== void 0 ? _a : 0) + elementBounds.left,
                                                                y: ((_b = opts.y) !== null && _b !== void 0 ? _b : 0) + elementBounds.top,
                                                                width: elementBounds.width,
                                                                height: elementBounds.height
                                                            };
                                                            context.logger.debug("Starting renderer for element at ".concat(elementRenderOptions.x, ",").concat(elementRenderOptions.y, " with size ").concat(elementRenderOptions.width, "x").concat(elementRenderOptions.height));
                                                            renderer = new canvas_renderer_1.CanvasRenderer(context, elementRenderOptions);
                                                            return [4 /*yield*/, renderer.render(root)];
                                                        case 1:
                                                            canvas = _c.sent();
                                                            resolve(canvas);
                                                            return [3 /*break*/, 3];
                                                        case 2:
                                                            error_2 = _c.sent();
                                                            reject(error_2);
                                                            return [3 /*break*/, 3];
                                                        case 3: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        elementCanvas = _c.sent();
                                        // Add this canvas to the array (one element per canvas)
                                        canvasArray.push(elementCanvas);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < clonedElements.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_2(i)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // Restore original display styles for all elements
                        for (_a = 0, originalStyles_2 = originalStyles; _a < originalStyles_2.length; _a++) {
                            style = originalStyles_2[_a];
                            style.element.style.display = style.display;
                        }
                        return [2 /*return*/, canvasArray];
                }
            });
        });
    };
    /**
     * Parses background color for an element (same logic as original html2canvas)
     */
    Html2CanvasBatch.parseBackgroundColor = function (context, element, backgroundColorOverride) {
        var ownerDocument = element.ownerDocument;
        // http://www.w3.org/TR/css3-background/#special-backgrounds
        var documentBackgroundColor = ownerDocument.documentElement
            ? (0, color_1.parseColor)(context, getComputedStyle(ownerDocument.documentElement).backgroundColor)
            : color_1.COLORS.TRANSPARENT;
        var bodyBackgroundColor = ownerDocument.body
            ? (0, color_1.parseColor)(context, getComputedStyle(ownerDocument.body).backgroundColor)
            : color_1.COLORS.TRANSPARENT;
        var defaultBackgroundColor = typeof backgroundColorOverride === 'string'
            ? (0, color_1.parseColor)(context, backgroundColorOverride)
            : backgroundColorOverride === null
                ? color_1.COLORS.TRANSPARENT
                : 0xffffffff;
        return element === ownerDocument.documentElement
            ? (0, color_utilities_1.isTransparent)(documentBackgroundColor)
                ? (0, color_utilities_1.isTransparent)(bodyBackgroundColor)
                    ? defaultBackgroundColor
                    : bodyBackgroundColor
                : documentBackgroundColor
            : defaultBackgroundColor;
    };
    return Html2CanvasBatch;
}());
exports.Html2CanvasBatch = Html2CanvasBatch;
/**
 * Convenience function for batch rendering
 * @param elements - Array of HTMLElements to render
 * @param options - Rendering options
 * @returns Promise resolving to array of HTMLCanvasElement
 */
var html2canvasBatch = function (elements, options) {
    if (options === void 0) { options = {}; }
    return Html2CanvasBatch.render(elements, options);
};
exports.html2canvasBatch = html2canvasBatch;
exports.default = exports.html2canvasBatch;
//# sourceMappingURL=html2canvas-batch.js.map