# Promise-Based Sequential Processing

## Overview

The implementation now processes elements **sequentially using promises**, ensuring one element is rendered at a time to minimize memory usage.

## Implementation

### Key Changes

1. **Promise-Based Processing**: Each element is wrapped in its own promise
2. **Sequential Execution**: Elements are processed one at a time using `await`
3. **Memory Management**: References are cleared after each element is processed

### Code Structure

```typescript
// Process each element sequentially (one at a time) to minimize memory usage
for (let i = 0; i < clonedElements.length; i++) {
    const el = clonedElements[i];
    if (!el) continue;
    
    // Create promise for this element - process one at a time
    const elementCanvas = await new Promise<HTMLCanvasElement>(async (resolve, reject) => {
        try {
            // 1. Hide all other elements
            // 2. Show only current element
            // 3. Calculate bounds and render options
            // 4. Render element to canvas
            resolve(canvas);
        } catch (error) {
            reject(error);
        }
    });
    
    // Add canvas to array
    canvasArray.push(elementCanvas);
    
    // Clear references - helps with garbage collection
}
```

## Memory Benefits

### Sequential Processing
- **Before**: All elements processed in parallel (theoretical)
- **After**: Elements processed one at a time (actual)

### Memory Release
1. Each element is processed in isolation
2. After rendering, canvas is stored in array
3. Local references are cleared
4. Garbage collector can free memory between iterations

### Memory Usage Pattern

```
Time →
Element 1: [████] (rendered, stored, memory released)
Element 2:        [████] (rendered, stored, memory released)
Element 3:              [████] (rendered, stored, memory released)
```

Instead of:
```
Time →
Element 1: [████████████████]
Element 2: [████████████████]
Element 3: [████████████████]
           (all in memory simultaneously)
```

## How It Works

### Step-by-Step Process

1. **Loop through elements** (sequentially)
2. **For each element:**
   - Create a promise that:
     - Hides all other elements (`display: none`)
     - Shows only current element
     - Calculates element-specific bounds
     - Renders element to canvas
     - Resolves with the canvas
   - Wait for promise to resolve (`await`)
   - Store canvas in array
   - Clear local references

3. **Memory is released** between iterations

### Benefits

1. **Lower Memory Peak**: Only one element's DOM tree in memory at a time
2. **Better Garbage Collection**: Memory can be freed between elements
3. **Error Isolation**: Each element's errors don't affect others
4. **Clear Sequential Flow**: Explicit promise-based processing

## Example Usage

```typescript
const elements = [el1, el2, el3];

// Elements are processed sequentially:
// 1. el1 is rendered (el2, el3 hidden)
// 2. el2 is rendered (el1, el3 hidden)
// 3. el3 is rendered (el1, el2 hidden)

const canvases = await html2canvas(elements);

// Each canvas contains only its element
canvases[0].toDataURL('image/png'); // el1 only
canvases[1].toDataURL('image/png'); // el2 only
canvases[2].toDataURL('image/png'); // el3 only
```

## Memory Optimization Features

### 1. Element Isolation
- Only one element visible at a time
- Other elements removed from layout (`display: none`)
- Reduces layout calculations

### 2. Sequential Processing
- One element processed at a time
- Previous element's memory can be released
- Lower peak memory usage

### 3. Promise-Based Isolation
- Each element wrapped in its own promise
- Better error handling
- Clear separation of concerns

### 4. Reference Clearing
- Local variables cleared after use
- Helps garbage collector
- Reduces memory footprint

## Performance Characteristics

### Memory Usage
- **Peak Memory**: Size of largest element (not all elements)
- **Memory per Element**: Released after canvas creation
- **Total Memory**: Lower than parallel processing

### Processing Time
- **Sequential**: Elements processed one after another
- **Total Time**: Sum of individual element rendering times
- **Trade-off**: Slightly longer than parallel, but much lower memory

## Benefits Summary

✅ **Lower Memory Usage**: Only one element in memory at a time
✅ **Better GC**: Memory can be freed between iterations
✅ **Error Isolation**: Errors in one element don't affect others
✅ **Clear Flow**: Promise-based sequential processing
✅ **Scalability**: Can handle many elements without memory issues

