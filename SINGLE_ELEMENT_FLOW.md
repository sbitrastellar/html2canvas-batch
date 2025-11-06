# Single Element Flow Analysis

## Current Implementation Behavior

When a **single element** is passed (not an array):

### Flow Trace

1. **Input**: `html2canvas(singleElement)`
   - Type: `HTMLElement` (not array)

2. **Function Signature**:
   ```typescript
   html2canvas<T extends HTMLElement | HTMLElement[]>(
       element: T
   ): Promise<T extends HTMLElement[] ? HTMLCanvasElement[] : HTMLCanvasElement>
   ```
   - For single element: Returns `Promise<HTMLCanvasElement>`

3. **Processing**:
   ```typescript
   // Line 115-116
   const clonedElements = Array.isArray(clonedElement) ? clonedElement : [clonedElement];
   const isArray = Array.isArray(clonedElement);
   ```
   - `clonedElement` = single `HTMLElement` (from document cloner)
   - `clonedElements` = `[clonedElement]` (wrapped in array for consistency)
   - `isArray` = `false` (single element, not array)

4. **Condition Check**:
   ```typescript
   // Line 183 / 270
   if (isArray && clonedElements.length > 1) {
       // Array processing...
   } else {
       // Single element processing
   }
   ```
   - Condition: `false && true` = `false`
   - **Goes to `else` branch** (single element path)

5. **Single Element Rendering**:
   ```typescript
   // Line 259-261 (ForeignObject) or 361-374 (Normal)
   else {
       const renderer = new ForeignObjectRenderer(context, renderOptions);
       canvas = await renderer.render(firstElement);
   }
   ```
   - Creates single renderer
   - Renders single element
   - Returns **single `HTMLCanvasElement`** (not array)

6. **Return Value**:
   - Type: `Promise<HTMLCanvasElement>`
   - Value: Single canvas containing the single element

## Expected Behavior ✅

✅ **Returns**: `Promise<HTMLCanvasElement>` (single canvas)
✅ **Contains**: Only the single element
✅ **Backward Compatible**: Works exactly like before
✅ **Type Safety**: TypeScript correctly infers return type

## Test Cases

### Test 1: Single Element
```typescript
const element = document.getElementById('myElement');
const canvas = await html2canvas(element);

// Type: HTMLCanvasElement (not array)
console.assert(!Array.isArray(canvas));
console.assert(canvas instanceof HTMLCanvasElement);

// Can use toDataURL
const imageData = canvas.toDataURL('image/png');
```

### Test 2: Single Element in Array (Edge Case)
```typescript
const element = document.getElementById('myElement');
const canvases = await html2canvas([element]);

// Type: HTMLCanvasElement[] (array)
// But condition: isArray=true, length=1
// However, condition checks: isArray && length > 1
// So: true && false = false
// Goes to else branch, returns single canvas wrapped in logic?

// WAIT - let me check this...
```

## Edge Case: Array with Single Element ✅ FIXED

**Input**: `html2canvas([singleElement])` (array with one element)

```typescript
const clonedElements = Array.isArray(clonedElement) ? clonedElement : [clonedElement];
const isArray = Array.isArray(clonedElement);
// isArray = true
// clonedElements.length = 1

if (isArray) {
    // Now enters this branch even for single element in array
    // Returns array with one canvas
}
```

**Fixed Behavior**: 
- ✅ Array with single element: Returns `HTMLCanvasElement[]` with one canvas
- ✅ TypeScript type matches: `Promise<HTMLCanvasElement[]>`
- ✅ Consistent: Array input always returns array output

## Current Implementation ✅

```typescript
if (isArray) {
    // Always return array when array is passed
    // Even if array has only one element
    // Returns: HTMLCanvasElement[]
} else {
    // Single element (not in array) - return single canvas
    // Returns: HTMLCanvasElement
}
```

## Test Cases

### Test 1: Single Element (Not Array)
```typescript
const element = document.getElementById('myElement');
const canvas = await html2canvas(element);
// Type: HTMLCanvasElement
// Value: Single canvas
console.assert(!Array.isArray(canvas));
```

### Test 2: Array with Single Element
```typescript
const element = document.getElementById('myElement');
const canvases = await html2canvas([element]);
// Type: HTMLCanvasElement[]
// Value: Array with one canvas
console.assert(Array.isArray(canvases));
console.assert(canvases.length === 1);
console.assert(canvases[0] instanceof HTMLCanvasElement);
```

### Test 3: Array with Multiple Elements
```typescript
const elements = [el1, el2, el3];
const canvases = await html2canvas(elements);
// Type: HTMLCanvasElement[]
// Value: Array with three canvases
console.assert(Array.isArray(canvases));
console.assert(canvases.length === 3);
```

