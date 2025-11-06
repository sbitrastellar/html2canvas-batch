# Array Elements Return Implementation

## Summary

Modified `html2canvas` to return an **array of canvases** when an array of elements is passed, instead of a single combined canvas. Each canvas contains only one element and can be used with `toDataURL()` to generate images.

## Changes Made

### 1. Function Signature Update

**Before:**
```typescript
const html2canvas = (element: HTMLElement | HTMLElement[], options: Partial<Options> = {}): Promise<HTMLCanvasElement>
```

**After:**
```typescript
const html2canvas = <T extends HTMLElement | HTMLElement[]>(
    element: T,
    options: Partial<Options> = {}
): Promise<T extends HTMLElement[] ? HTMLCanvasElement[] : HTMLCanvasElement>
```

**Benefits:**
- TypeScript correctly infers return type based on input
- Single element → `Promise<HTMLCanvasElement>`
- Array of elements → `Promise<HTMLCanvasElement[]>`

### 2. Return Type Update

**Before:**
```typescript
const renderElement = async (element: HTMLElement | HTMLElement[], opts: Partial<Options>): Promise<HTMLCanvasElement>
```

**After:**
```typescript
const renderElement = async (element: HTMLElement | HTMLElement[], opts: Partial<Options>): Promise<HTMLCanvasElement | HTMLCanvasElement[]>
```

### 3. Rendering Logic Changes

#### ForeignObject Rendering Mode

**Before:** Composited all elements onto a single combined canvas

**After:** Returns array of canvases, one per element

```typescript
if (isArray && clonedElements.length > 1) {
    const canvasArray: HTMLCanvasElement[] = [];
    
    // Render each element onto its own canvas
    for (let i = 0; i < clonedElements.length; i++) {
        // Hide other elements, show current element
        // Render to canvas
        canvasArray.push(elementCanvas);
    }
    
    canvas = canvasArray; // Return array
}
```

#### Normal Rendering Mode

**Before:** Composited all elements onto a single combined canvas

**After:** Returns array of canvases, one per element

```typescript
if (isArray && clonedElements.length > 1) {
    const canvasArray: HTMLCanvasElement[] = [];
    
    // Render each element onto its own canvas
    for (let i = 0; i < clonedElements.length; i++) {
        // Hide other elements, show current element
        // Parse DOM tree and render to canvas
        canvasArray.push(elementCanvas);
    }
    
    canvas = canvasArray; // Return array
}
```

## Key Features

### ✅ One Element Per Canvas
- Each canvas contains only one element
- No overlap or compositing
- Clean separation of elements

### ✅ Individual Canvas Properties
- Each canvas has dimensions matching its element
- Element-specific background color
- Element-specific rendering options

### ✅ toDataURL Support
- Each canvas supports `toDataURL()` method
- Can generate images independently
- Supports different image formats (PNG, JPEG, etc.)

### ✅ Memory Optimization Maintained
- Document still cloned once (not per element)
- Iframe created once (not per element)
- Elements processed one at a time using `display: none`
- No compositing overhead

## Usage Example

```typescript
// Array of elements
const elements = [
    document.getElementById('element1'),
    document.getElementById('element2'),
    document.getElementById('element3')
];

// Call html2canvas
const canvases = await html2canvas(elements);

// TypeScript knows this is HTMLCanvasElement[]
console.log(canvases.length); // 3

// Each canvas can be used with toDataURL
canvases.forEach((canvas, index) => {
    const imageData = canvas.toDataURL('image/png');
    console.log(`Element ${index} rendered to ${imageData.length} bytes`);
    
    // Create image from canvas
    const img = document.createElement('img');
    img.src = imageData;
    document.body.appendChild(img);
});

// Single element (backward compatible)
const singleCanvas = await html2canvas(document.getElementById('single'));
// TypeScript knows this is HTMLCanvasElement
const imageData = singleCanvas.toDataURL('image/png');
```

## Implementation Details

### Element Isolation
Elements are isolated using `display: none` during rendering:
- Completely removes elements from layout flow
- Prevents iframe boundary issues
- Ensures each canvas contains only one element

### Canvas Creation
Each element gets its own canvas:
- Created with `document.createElement('canvas')`
- Sized to match element dimensions
- Background color calculated per element
- Independent rendering context

### Background Color
- For arrays: Background color calculated per element
- Each canvas can have different background color
- Respects element-specific background settings

## Testing

### Test Cases

1. **Single Element** (Backward Compatibility)
   - Input: `HTMLElement`
   - Output: `Promise<HTMLCanvasElement>`
   - Should work as before

2. **Array of Elements**
   - Input: `HTMLElement[]`
   - Output: `Promise<HTMLCanvasElement[]>`
   - Each canvas contains one element

3. **toDataURL Usage**
   - All canvases support `toDataURL()`
   - Can generate PNG, JPEG, etc.
   - Images are valid and can be displayed

4. **Element Isolation**
   - Verify no overlap between elements
   - Each canvas has correct dimensions
   - Elements don't interfere with each other

## Benefits

1. **Separation**: Each element gets its own canvas
2. **Flexibility**: Can process canvases independently
3. **Memory**: Optimized with one clone, one iframe
4. **Type Safety**: TypeScript correctly infers return types
5. **Backward Compatible**: Single element still works as before

## Notes

- The `canvas` option in options is ignored when rendering arrays (each element needs its own canvas)
- Background color is calculated per element for arrays
- All optimization benefits are maintained (one clone, one iframe, element isolation)

