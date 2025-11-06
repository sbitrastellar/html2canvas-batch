# Memory Optimization Analysis: Element-by-Element Rendering

## Current Implementation

### Document Cloning (✓ Optimized)
- **Location**: `src/dom/document-cloner.ts`
- **Status**: Document is cloned **once** for all elements
- **Memory Impact**: Good - avoids multiple document clones

### Iframe Creation (✓ Optimized)
- **Location**: `src/dom/document-cloner.ts::toIFrame()`
- **Status**: Single iframe contains all cloned elements
- **Memory Impact**: Good - single iframe instance

### Rendering Process (⚠️ Needs Optimization)

#### ForeignObject Rendering Mode (✓ Already Optimized)
- **Location**: `src/index.ts` lines 218-258
- **Status**: Elements are hidden/shown correctly
- **Implementation**: 
  - Loops through elements
  - Hides all other elements using `visibility: hidden`
  - Shows only current element
  - Renders one element at a time
  - Composites results

#### Normal Rendering Mode (❌ Problem Identified)
- **Location**: `src/index.ts` lines 275-332
- **Status**: **All elements remain visible during rendering**
- **Problem**: 
  - When rendering element A, elements B, C, D are still visible
  - Renderer processes all visible elements, causing overlap
  - Memory usage is high because all elements are processed simultaneously
  - Each element's canvas includes overlapping content

## Optimization Strategy

### Goal
Process **one element at a time** during rendering to reduce memory usage, while keeping the document cloning optimization (clone once).

### Solution
Apply the same visibility hiding logic from `foreignObjectRendering` mode to the normal rendering mode:

1. **Before rendering each element:**
   - Hide all other elements using `visibility: hidden`
   - Show only the current element

2. **After rendering each element:**
   - Restore original visibility states

3. **Benefits:**
   - Memory usage reduced: Only one element's DOM tree is processed at a time
   - No overlap: Other elements don't interfere with current element's rendering
   - Same cloning optimization: Document still cloned once

## Implementation Details

### Changes Required
1. **File**: `src/index.ts`
2. **Section**: Normal rendering path (lines 275-332)
3. **Action**: Add visibility hiding logic similar to foreignObject rendering

### Code Pattern
```typescript
// Store original display styles (not visibility - display: none removes from layout)
const originalStyles: Array<{ element: HTMLElement; display: string }> = [];
for (const el of clonedElements) {
    if (el) {
        originalStyles.push({
            element: el,
            display: el.style.display || ''
        });
    }
}

// Render each element one at a time
for (let i = 0; i < clonedElements.length; i++) {
    const el = clonedElements[i];
    if (!el) continue;
    
    // Hide all other elements completely (removes from layout flow)
    for (let j = 0; j < clonedElements.length; j++) {
        const otherEl = clonedElements[j];
        if (otherEl) {
            if (j === i) {
                // Show current element (restore original display)
                otherEl.style.display = originalStyles[j].display || '';
            } else {
                // Hide other elements completely - removes from layout
                otherEl.style.display = 'none';
            }
        }
    }
    
    // Render element...
    
    // Restore styles after rendering (optional, can do at end)
}

// Restore all original styles at the end
for (const style of originalStyles) {
    style.element.style.display = style.display;
}
```

**Note**: Using `display: none` instead of `visibility: hidden` is critical because:
- `visibility: hidden` still takes up space in the layout, affecting iframe boundaries
- `display: none` completely removes the element from the layout flow
- This ensures accurate iframe sizing and prevents layout interference

## Memory Impact

### Before Optimization
- All elements visible in cloned document
- Renderer processes all elements simultaneously
- Memory: O(n) where n = total DOM nodes in all elements

### After Optimization
- Only one element visible at a time
- Renderer processes only current element's DOM tree
- Memory: O(m) where m = max DOM nodes in a single element
- **Memory reduction**: Significant when elements have large DOM trees

## Testing Considerations

1. Verify elements don't overlap in final canvas
2. Ensure visibility restoration works correctly
3. Test with various element sizes and complexities
4. Verify single element rendering (non-array) still works

