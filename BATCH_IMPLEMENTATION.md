# Html2CanvasBatch Implementation

## Overview

This implementation creates a separate `Html2CanvasBatch` class that extends html2canvas functionality for batch processing, while keeping the original `html2canvas` function **completely unchanged**. This allows for easy forking and merging of upstream changes from the original library.

## Architecture

### Original Implementation (Unchanged)
- **File**: `src/index.ts`
- **Function**: `html2canvas(element: HTMLElement, options): Promise<HTMLCanvasElement>`
- **Status**: ✅ **Unchanged** - Only handles single elements
- **Compatibility**: Full backward compatibility with original library

### New Batch Implementation
- **File**: `src/html2canvas-batch.ts`
- **Class**: `Html2CanvasBatch`
- **Function**: `html2canvasBatch(elements: HTMLElement[], options): Promise<HTMLCanvasElement[]>`
- **Features**: All batch optimizations (sequential processing, memory optimization, etc.)

## Key Benefits

### ✅ Independent Implementation
- Original `html2canvas` remains untouched
- Can fork/merge upstream changes without conflicts
- Batch functionality is completely separate

### ✅ Easy Forking
- Original library code is unchanged
- All batch features in separate file
- No merge conflicts when pulling upstream updates

### ✅ Backward Compatible
- Original `html2canvas` works exactly as before
- Existing code continues to work
- No breaking changes

## Usage

### Single Element (Original)
```typescript
import html2canvas from 'html2canvas-pro';

const element = document.getElementById('myElement');
const canvas = await html2canvas(element);
// Returns: HTMLCanvasElement
const imageData = canvas.toDataURL('image/png');
```

### Batch Processing (New)
```typescript
import { html2canvasBatch } from 'html2canvas-pro';

const elements = [el1, el2, el3];
const canvases = await html2canvasBatch(elements);
// Returns: HTMLCanvasElement[]
canvases.forEach((canvas, index) => {
    const imageData = canvas.toDataURL('image/png');
    console.log(`Element ${index} rendered`);
});
```

### Using the Class
```typescript
import { Html2CanvasBatch } from 'html2canvas-pro';

const elements = [el1, el2, el3];
const canvases = await Html2CanvasBatch.render(elements, options);
// Returns: HTMLCanvasElement[]
```

## Implementation Details

### Html2CanvasBatch Class

The class provides:

1. **Static Method**: `Html2CanvasBatch.render(elements, options)`
   - Main entry point for batch rendering
   - Handles document cloning, iframe creation, and rendering

2. **Private Methods**:
   - `renderBatchForeignObject()` - ForeignObject rendering mode
   - `renderBatchNormal()` - Normal/computed rendering mode
   - `parseBackgroundColor()` - Background color parsing

3. **Features**:
   - Sequential promise-based processing
   - Display: none isolation for memory optimization
   - One canvas per element
   - Full memory optimization

### File Structure

```
src/
├── index.ts              # Original html2canvas (unchanged)
└── html2canvas-batch.ts  # New batch implementation
```

## Migration Guide

### If You Were Using Array Support

**Before** (array support in html2canvas):
```typescript
const canvases = await html2canvas([el1, el2, el3]);
```

**After** (using batch class):
```typescript
import { html2canvasBatch } from 'html2canvas-pro';
const canvases = await html2canvasBatch([el1, el2, el3]);
```

### If You Were Using Single Elements

**No changes needed** - works exactly the same:
```typescript
const canvas = await html2canvas(element);
```

## Export Strategy

### Option 1: Export from main index
```typescript
// src/index.ts
export { html2canvasBatch, Html2CanvasBatch } from './html2canvas-batch';
```

### Option 2: Separate import (recommended for separation)
```typescript
// Users import from separate file
import { html2canvasBatch } from 'html2canvas-pro/html2canvas-batch';
```

### Option 3: Re-export from main (current)
```typescript
// Users can import both from main
import html2canvas, { html2canvasBatch } from 'html2canvas-pro';
```

## Benefits for Forking

1. **Clean Separation**: Batch code is in separate file
2. **No Conflicts**: Original code untouched
3. **Easy Updates**: Can pull upstream changes without conflicts
4. **Clear Boundaries**: Batch features are clearly separated

## Testing

### Test Original Implementation
```typescript
import html2canvas from 'html2canvas-pro';
// Test single element rendering
```

### Test Batch Implementation
```typescript
import { html2canvasBatch } from 'html2canvas-pro';
// Test array rendering
```

Both implementations are independent and can be tested separately.

## Future Maintenance

### Pulling Upstream Changes

1. Pull latest changes from upstream repository
2. Original `src/index.ts` will merge cleanly (no conflicts)
3. Batch implementation in `src/html2canvas-batch.ts` is independent
4. Update batch implementation if needed for new features

### Adding New Features

- **Original library**: Add to `src/index.ts` (if contributing upstream)
- **Batch features**: Add to `src/html2canvas-batch.ts` (your customizations)

