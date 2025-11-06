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
exports.Html2CanvasBatch = exports.html2canvasBatch = void 0;
var bounds_1 = require("./css/layout/bounds");
var color_1 = require("./css/types/color");
var color_utilities_1 = require("./css/types/color-utilities");
var document_cloner_1 = require("./dom/document-cloner");
var node_parser_1 = require("./dom/node-parser");
var cache_storage_1 = require("./core/cache-storage");
var canvas_renderer_1 = require("./render/canvas/canvas-renderer");
var foreignobject_renderer_1 = require("./render/canvas/foreignobject-renderer");
var context_1 = require("./core/context");
var html2canvas = function (element, options) {
    if (options === void 0) { options = {}; }
    return renderElement(element, options);
};
exports.default = html2canvas;
if (typeof window !== 'undefined') {
    cache_storage_1.CacheStorage.setContext(window);
}
var renderElement = function (element, opts) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerDocument, defaultView, resourceOptions, contextOptions, windowOptions, windowBounds, context, foreignObjectRendering, cloneOptions, documentCloner, container, clonedElement, combinedBounds, width, height, left, top, backgroundColor, renderOptions, canvas, renderer, root, renderer;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    return __generator(this, function (_t) {
        switch (_t.label) {
            case 0:
                if (!element || typeof element !== 'object') {
                    return [2 /*return*/, Promise.reject('Invalid element provided as first argument')];
                }
                ownerDocument = element.ownerDocument;
                if (!ownerDocument) {
                    throw new Error("Element is not attached to a Document");
                }
                defaultView = ownerDocument.defaultView;
                if (!defaultView) {
                    throw new Error("Document is not attached to a Window");
                }
                resourceOptions = {
                    allowTaint: (_a = opts.allowTaint) !== null && _a !== void 0 ? _a : false,
                    imageTimeout: (_b = opts.imageTimeout) !== null && _b !== void 0 ? _b : 15000,
                    proxy: opts.proxy,
                    useCORS: (_c = opts.useCORS) !== null && _c !== void 0 ? _c : false,
                    customIsSameOrigin: opts.customIsSameOrigin
                };
                contextOptions = __assign({ logging: (_d = opts.logging) !== null && _d !== void 0 ? _d : true, cache: opts.cache }, resourceOptions);
                windowOptions = {
                    windowWidth: (_e = opts.windowWidth) !== null && _e !== void 0 ? _e : defaultView.innerWidth,
                    windowHeight: (_f = opts.windowHeight) !== null && _f !== void 0 ? _f : defaultView.innerHeight,
                    scrollX: (_g = opts.scrollX) !== null && _g !== void 0 ? _g : defaultView.pageXOffset,
                    scrollY: (_h = opts.scrollY) !== null && _h !== void 0 ? _h : defaultView.pageYOffset
                };
                windowBounds = new bounds_1.Bounds(windowOptions.scrollX, windowOptions.scrollY, windowOptions.windowWidth, windowOptions.windowHeight);
                context = new context_1.Context(contextOptions, windowBounds);
                foreignObjectRendering = (_j = opts.foreignObjectRendering) !== null && _j !== void 0 ? _j : false;
                cloneOptions = {
                    allowTaint: (_k = opts.allowTaint) !== null && _k !== void 0 ? _k : false,
                    onclone: opts.onclone,
                    ignoreElements: opts.ignoreElements,
                    inlineImages: foreignObjectRendering,
                    copyStyles: foreignObjectRendering
                };
                context.logger.debug("Starting document clone with size ".concat(windowBounds.width, "x").concat(windowBounds.height, " scrolled to ").concat(-windowBounds.left, ",").concat(-windowBounds.top));
                documentCloner = new document_cloner_1.DocumentCloner(context, element, cloneOptions);
                return [4 /*yield*/, documentCloner.toIFrame(ownerDocument, windowBounds)];
            case 1:
                container = _t.sent();
                clonedElement = documentCloner.clonedReferenceElement;
                if (!clonedElement || Array.isArray(clonedElement)) {
                    return [2 /*return*/, Promise.reject("Unable to find element in cloned iframe")];
                }
                combinedBounds = (0, node_parser_1.isBodyElement)(clonedElement) || (0, node_parser_1.isHTMLElement)(clonedElement)
                    ? (0, bounds_1.parseDocumentSize)(clonedElement.ownerDocument)
                    : (0, bounds_1.parseBounds)(context, clonedElement);
                width = combinedBounds.width, height = combinedBounds.height, left = combinedBounds.left, top = combinedBounds.top;
                backgroundColor = parseBackgroundColor(context, clonedElement, opts.backgroundColor);
                renderOptions = {
                    canvas: opts.canvas,
                    backgroundColor: backgroundColor,
                    scale: (_m = (_l = opts.scale) !== null && _l !== void 0 ? _l : defaultView.devicePixelRatio) !== null && _m !== void 0 ? _m : 1,
                    x: ((_o = opts.x) !== null && _o !== void 0 ? _o : 0) + left,
                    y: ((_p = opts.y) !== null && _p !== void 0 ? _p : 0) + top,
                    width: (_q = opts.width) !== null && _q !== void 0 ? _q : Math.ceil(width),
                    height: (_r = opts.height) !== null && _r !== void 0 ? _r : Math.ceil(height)
                };
                if (!foreignObjectRendering) return [3 /*break*/, 3];
                context.logger.debug("Document cloned, using foreign object rendering");
                renderer = new foreignobject_renderer_1.ForeignObjectRenderer(context, renderOptions);
                return [4 /*yield*/, renderer.render(clonedElement)];
            case 2:
                canvas = _t.sent();
                return [3 /*break*/, 5];
            case 3:
                context.logger.debug("Document cloned, element located at ".concat(left, ",").concat(top, " with size ").concat(width, "x").concat(height, " using computed rendering"));
                context.logger.debug("Starting DOM parsing");
                root = (0, node_parser_1.parseTree)(context, clonedElement);
                if (backgroundColor === root.styles.backgroundColor) {
                    root.styles.backgroundColor = color_1.COLORS.TRANSPARENT;
                }
                context.logger.debug("Starting renderer for element at ".concat(renderOptions.x, ",").concat(renderOptions.y, " with size ").concat(renderOptions.width, "x").concat(renderOptions.height));
                renderer = new canvas_renderer_1.CanvasRenderer(context, renderOptions);
                return [4 /*yield*/, renderer.render(root)];
            case 4:
                canvas = _t.sent();
                _t.label = 5;
            case 5:
                if ((_s = opts.removeContainer) !== null && _s !== void 0 ? _s : true) {
                    if (!document_cloner_1.DocumentCloner.destroy(container)) {
                        context.logger.error("Cannot detach cloned iframe as it is not in the DOM anymore");
                    }
                }
                context.logger.debug("Finished rendering");
                return [2 /*return*/, canvas];
        }
    });
}); };
var parseBackgroundColor = function (context, element, backgroundColorOverride) {
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
// Export batch functionality (separate from original implementation)
var html2canvas_batch_1 = require("./html2canvas-batch");
Object.defineProperty(exports, "html2canvasBatch", { enumerable: true, get: function () { return html2canvas_batch_1.html2canvasBatch; } });
Object.defineProperty(exports, "Html2CanvasBatch", { enumerable: true, get: function () { return html2canvas_batch_1.Html2CanvasBatch; } });
//# sourceMappingURL=index.js.map