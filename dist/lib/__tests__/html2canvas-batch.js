"use strict";
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
var html2canvas_batch_1 = require("../html2canvas-batch");
var canvas_renderer_1 = require("../render/canvas/canvas-renderer");
var foreignobject_renderer_1 = require("../render/canvas/foreignobject-renderer");
var document_cloner_1 = require("../dom/document-cloner");
var color_1 = require("../css/types/color");
jest.mock('../core/logger');
jest.mock('../css/layout/bounds');
jest.mock('../dom/document-cloner', function () {
    return {
        DocumentCloner: jest.fn()
    };
});
jest.mock('../dom/node-parser', function () {
    return {
        isBodyElement: function () { return false; },
        isHTMLElement: function () { return false; },
        parseTree: jest.fn().mockImplementation(function () {
            return { styles: { backgroundColor: color_1.COLORS.TRANSPARENT } };
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
describe('Html2CanvasBatch', function () {
    var createMockElement = function (id) {
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
            id: id,
            style: {
                display: ''
            }
        };
    };
    var mockCanvas = document.createElement('canvas');
    mockCanvas.width = 200;
    mockCanvas.height = 50;
    beforeEach(function () {
        jest.clearAllMocks();
        // Mock CanvasRenderer
        canvas_renderer_1.CanvasRenderer.mockImplementation(function () {
            return {
                render: jest.fn().mockResolvedValue(mockCanvas)
            };
        });
        // Mock ForeignObjectRenderer
        foreignobject_renderer_1.ForeignObjectRenderer.mockImplementation(function () {
            return {
                render: jest.fn().mockResolvedValue(mockCanvas)
            };
        });
        document_cloner_1.DocumentCloner.mockImplementation(function () {
            return {
                clonedReferenceElement: undefined,
                toIFrame: jest.fn().mockResolvedValue({
                    parentNode: document.createElement('div'),
                    removeChild: jest.fn()
                }),
                destroy: jest.fn()
            };
        });
        document_cloner_1.DocumentCloner.destroy = jest.fn().mockReturnValue(true);
    });
    describe('html2canvasBatch function', function () {
        it('should reject when elements array is empty', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)([])).rejects.toBe('Invalid elements array provided')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject when elements is null', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)(null)).rejects.toBe('Invalid elements array provided')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject when elements is undefined', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)(undefined)).rejects.toBe('Invalid elements array provided')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should render array of elements and return array of canvases', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner, canvases;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1'), createMockElement('el2')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1'), createMockElement('el2')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements)];
                    case 1:
                        canvases = _a.sent();
                        expect(Array.isArray(canvases)).toBe(true);
                        expect(canvases.length).toBe(2);
                        expect(canvases[0]).toBeInstanceOf(HTMLCanvasElement);
                        expect(canvases[1]).toBeInstanceOf(HTMLCanvasElement);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should process elements sequentially', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, renderOrder, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
                        renderOrder = [];
                        canvas_renderer_1.CanvasRenderer.mockImplementation(function () {
                            var renderMock = jest.fn().mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    renderOrder.push(renderOrder.length);
                                    return [2 /*return*/, mockCanvas];
                                });
                            }); });
                            return {
                                render: renderMock
                            };
                        });
                        mockCloner = {
                            clonedReferenceElement: [
                                createMockElement('el1'),
                                createMockElement('el2'),
                                createMockElement('el3')
                            ],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements)];
                    case 1:
                        _a.sent();
                        // Verify sequential processing (should be called 3 times)
                        expect(renderOrder.length).toBe(3);
                        expect(renderOrder).toEqual([0, 1, 2]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should use ForeignObjectRenderer when foreignObjectRendering is true', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements, { foreignObjectRendering: true })];
                    case 1:
                        _a.sent();
                        expect(foreignobject_renderer_1.ForeignObjectRenderer).toHaveBeenCalled();
                        expect(canvas_renderer_1.CanvasRenderer).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should use CanvasRenderer when foreignObjectRendering is false', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements, { foreignObjectRendering: false })];
                    case 1:
                        _a.sent();
                        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should remove container by default', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements)];
                    case 1:
                        _a.sent();
                        expect(document_cloner_1.DocumentCloner.destroy).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not remove container when removeContainer is false', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements, { removeContainer: false })];
                    case 1:
                        _a.sent();
                        expect(document_cloner_1.DocumentCloner.destroy).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle single element in array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner, canvases;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements)];
                    case 1:
                        canvases = _a.sent();
                        expect(Array.isArray(canvases)).toBe(true);
                        expect(canvases.length).toBe(1);
                        expect(canvases[0]).toBeInstanceOf(HTMLCanvasElement);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle multiple elements in array', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner, canvases;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [
                            createMockElement('el1'),
                            createMockElement('el2'),
                            createMockElement('el3'),
                            createMockElement('el4')
                        ];
                        mockCloner = {
                            clonedReferenceElement: [
                                createMockElement('el1'),
                                createMockElement('el2'),
                                createMockElement('el3'),
                                createMockElement('el4')
                            ],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements)];
                    case 1:
                        canvases = _a.sent();
                        expect(Array.isArray(canvases)).toBe(true);
                        expect(canvases.length).toBe(4);
                        canvases.forEach(function (canvas) {
                            expect(canvas).toBeInstanceOf(HTMLCanvasElement);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Html2CanvasBatch class', function () {
        it('should have static render method', function () {
            expect(typeof html2canvas_batch_1.Html2CanvasBatch.render).toBe('function');
        });
        it('should render elements using static render method', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner, canvases;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, html2canvas_batch_1.Html2CanvasBatch.render(elements)];
                    case 1:
                        canvases = _a.sent();
                        expect(Array.isArray(canvases)).toBe(true);
                        expect(canvases.length).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject when elements array is empty', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(html2canvas_batch_1.Html2CanvasBatch.render([])).rejects.toBe('Invalid elements array provided')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Options handling', function () {
        it('should pass options to renderer', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, options, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        options = {
                            scale: 2,
                            backgroundColor: '#ffffff',
                            logging: false
                        };
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements, options)];
                    case 1:
                        _a.sent();
                        // Verify options are passed through
                        expect(document_cloner_1.DocumentCloner).toHaveBeenCalledWith(expect.anything(), elements, expect.objectContaining({
                            allowTaint: false,
                            inlineImages: false,
                            copyStyles: false
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle backgroundColor option', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [createMockElement('el1')],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements, { backgroundColor: null })];
                    case 1:
                        _a.sent();
                        // Should not throw and complete successfully
                        expect(true).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error handling', function () {
        it('should reject when element is not attached to document', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [{}];
                        return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)(elements)).rejects.toThrow('Element is not attached to a Document')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject when document is not attached to window', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [
                            {
                                ownerDocument: {
                                    defaultView: null
                                }
                            }
                        ];
                        return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)(elements)).rejects.toThrow('Document is not attached to a Window')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject when cloned elements are not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: undefined,
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)(elements)).rejects.toContain('Unable to find elements in cloned iframe')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject when no elements found in cloned iframe', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        mockCloner = {
                            clonedReferenceElement: [],
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)(elements)).rejects.toContain('No elements found in cloned iframe')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject when unable to calculate bounds', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, nullElements, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1')];
                        nullElements = [null];
                        mockCloner = {
                            clonedReferenceElement: nullElements,
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        // When all elements are null, they get filtered out (if (!el) continue),
                        // resulting in boundsList.length === 0, which triggers the error
                        return [4 /*yield*/, expect((0, html2canvas_batch_1.html2canvasBatch)(elements)).rejects.toContain('Unable to calculate bounds')];
                    case 1:
                        // When all elements are null, they get filtered out (if (!el) continue),
                        // resulting in boundsList.length === 0, which triggers the error
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Memory optimization', function () {
        it('should process elements one at a time', function () { return __awaiter(void 0, void 0, void 0, function () {
            var elements, clonedElements, displayChanges, mockCloner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
                        clonedElements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
                        displayChanges = [];
                        // Track display property changes
                        clonedElements.forEach(function (el, index) {
                            // Store the actual display value in a hidden property
                            var displayStore = { value: '' };
                            Object.defineProperty(el.style, 'display', {
                                get: function () { return displayStore.value; },
                                set: function (value) {
                                    displayChanges.push({ index: index, display: value });
                                    displayStore.value = value;
                                },
                                configurable: true
                            });
                        });
                        mockCloner = {
                            clonedReferenceElement: clonedElements,
                            toIFrame: jest.fn().mockResolvedValue({
                                parentNode: document.createElement('div'),
                                removeChild: jest.fn()
                            })
                        };
                        // Set up mock for this test - DocumentCloner is already mocked at module level
                        document_cloner_1.DocumentCloner.mockImplementation(function () {
                            return mockCloner;
                        });
                        return [4 /*yield*/, (0, html2canvas_batch_1.html2canvasBatch)(elements)];
                    case 1:
                        _a.sent();
                        // Verify that display: none was used (memory optimization)
                        // Should have multiple display changes (hide/show cycles)
                        expect(displayChanges.length).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=html2canvas-batch.js.map