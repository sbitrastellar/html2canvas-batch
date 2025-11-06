# Getting Started

## Installing

You can install `html2canvas-batch` through npm or [download a built release](https://github.com/yorickshan/html2canvas-batch/releases).

```sh
npm install html2canvas-batch
pnpm / yarn add html2canvas-batch
```

## Usage

```javascript
import html2canvas from 'html2canvas-batch';
```

To render an `element` with html2canvas-batch with some (optional) [options](./configuration), simply call `html2canvas(element, options);`

```javascript
html2canvas(document.body).then(function(canvas) {
    document.body.appendChild(canvas);
});
```
