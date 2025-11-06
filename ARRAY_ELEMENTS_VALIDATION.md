# Array Elements Validation - End-to-End Flow

## Overview

When an array of elements is passed to `html2canvas`, the function now returns an array of canvases - one canvas per element. Each canvas contains only one element and can be used with `toDataURL()` to generate images.

## Function Signature

```typescript
const html2canvas = <T extends HTMLElement | HTMLElement[]>(
    element: T,
    options: Partial<Options> = {}
): Promise<T extends HTMLElement[] ? HTMLCanvasElement[] : HTMLCanvasElement>
```

**Return Types:**
- Single element: `Promise<HTMLCanvasElement>`
- Array of elements: `Promise<HTMLCanvasElement[]>`

## Implementation Details

### 1. Document Cloning (Optimized)
- Document is cloned **once** for all elements
- Single iframe contains all cloned elements
- Memory efficient - no multiple clones

### 2. Element Isolation During Rendering
- For each element:
  - Hide all other elements using `display: none` (removes from layout)
  - Show only current element
  - Render to its own canvas
  - Each canvas contains only one element

### 3. Return Value
- **Array input** → **Array of canvases** (one per element)
- **Single input** → **Single canvas**

## Usage Example

```typescript
// Example: Render multiple elements
const elements = [
    document.getElementById('element1'),
    document.getElementById('element2'),
    document.getElementById('element3')
];

// Call html2canvas with array
const canvases = await html2canvas(elements);

// Verify: Should return array of canvases
console.assert(Array.isArray(canvases), 'Should return array');
console.assert(canvases.length === 3, 'Should have 3 canvases');

// Each canvas can be used with toDataURL
canvases.forEach((canvas, index) => {
    const imageData = canvas.toDataURL('image/png');
    console.log(`Canvas ${index} size: ${canvas.width}x${canvas.height}`);
    
    // Use the image data
    const img = document.createElement('img');
    img.src = imageData;
    document.body.appendChild(img);
});
```

## Validation Checklist

### ✅ Function Signature
- [x] Single element returns `Promise<HTMLCanvasElement>`
- [x] Array of elements returns `Promise<HTMLCanvasElement[]>`
- [x] TypeScript types correctly infer return type

### ✅ Rendering Behavior
- [x] Document cloned once (not per element)
- [x] Iframe created once (not per element)
- [x] Elements isolated using `display: none` during rendering
- [x] Each element rendered to its own canvas
- [x] Each canvas contains only one element

### ✅ Canvas Properties
- [x] Each canvas has correct dimensions for its element
- [x] Each canvas can use `toDataURL()` method
- [x] Canvas contains only the rendered element (no overlap)

### ✅ Memory Optimization
- [x] Only one element visible at a time during rendering
- [x] Elements removed from layout flow when hidden
- [x] No memory overhead from compositing multiple elements

## Testing Scenarios

### Test 1: Single Element (Backward Compatibility)
```typescript
const element = document.getElementById('myElement');
const canvas = await html2canvas(element);
// Should return single HTMLCanvasElement
console.assert(!Array.isArray(canvas));
const imageData = canvas.toDataURL('image/png');
```

### Test 2: Array of Elements
```typescript
const elements = [el1, el2, el3];
const canvases = await html2canvas(elements);
// Should return array of HTMLCanvasElement
console.assert(Array.isArray(canvases));
console.assert(canvases.length === 3);
canvases.forEach(canvas => {
    const imageData = canvas.toDataURL('image/png');
    // Each canvas should be valid
    console.assert(imageData.startsWith('data:image/'));
});
```

### Test 3: Element Isolation
```typescript
// Verify each canvas contains only one element
const elements = [el1, el2];
const canvases = await html2canvas(elements);

// Each canvas should have dimensions matching its element
const bounds1 = el1.getBoundingClientRect();
const bounds2 = el2.getBoundingClientRect();

console.assert(canvases[0].width === bounds1.width);
console.assert(canvases[1].width === bounds2.width);
```

### Test 4: toDataURL Usage
```typescript
const elements = [el1, el2, el3];
const canvases = await html2canvas(elements);

// All canvases should support toDataURL
canvases.forEach((canvas, index) => {
    const png = canvas.toDataURL('image/png');
    const jpeg = canvas.toDataURL('image/jpeg', 0.9);
    
    console.assert(png.startsWith('data:image/png'));
    console.assert(jpeg.startsWith('data:image/jpeg'));
    
    // Create image from canvas
    const img = new Image();
    img.src = png;
    document.body.appendChild(img);
});
```

## Key Implementation Points

### 1. Conditional Return Type
The function uses TypeScript conditional types to return the correct type based on input:
- `HTMLElement` → `Promise<HTMLCanvasElement>`
- `HTMLElement[]` → `Promise<HTMLCanvasElement[]>`

### 2. Element Isolation
Elements are isolated using `display: none` which:
- Completely removes them from layout flow
- Prevents iframe boundary issues
- Ensures each canvas contains only one element

### 3. Individual Canvas Creation
Each element gets its own canvas with:
- Element-specific dimensions
- Element-specific background color
- Element-specific rendering options

### 4. Memory Efficiency
- Document cloned once (not per element)
- Elements processed one at a time
- No compositing overhead

## Expected Behavior

### Input: `[element1, element2, element3]`
### Output: `[canvas1, canvas2, canvas3]`

Where:
- `canvas1` contains only `element1`
- `canvas2` contains only `element2`
- `canvas3` contains only `element3`
- Each canvas can be used with `toDataURL()`

## Notes

- The `canvas` option in `opts` is ignored when rendering arrays (each element gets its own canvas)
- Background color is calculated per element when rendering arrays
- All optimization benefits (one clone, one iframe) are maintained

