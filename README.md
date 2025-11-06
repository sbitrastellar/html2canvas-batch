<p align="center">
<img src="https://raw.githubusercontent.com/yorickshan/html2canvas-batch/main/docs/public/logo.png" height="150">
</p>
<h1 align="center">
html2canvas-batch
</h1>
<p align="center">
Next generation JavaScript screenshots tool.
<p>
<p align="center">
  <a href="https://github.com/yorickshan/html2canvas-batch/actions/workflows/ci.yml"><img src="https://github.com/yorickshan/html2canvas-batch/actions/workflows/ci.yml/badge.svg?branch=main" alt="build status"></a>
  <a href=https://npm.im/html2canvas-batch><img src="https://badgen.net/npm/v/html2canvas-batch" alt="npm version"></a>
  <a href=http://npm.im/html2canvas-batch><img src="https://badgen.net/npm/dm/html2canvas-batch" alt="npm downloads"></a>
  <a href="https://www.jsdelivr.com/package/npm/html2canvas-batch"><img src="https://data.jsdelivr.com/v1/package/npm/html2canvas-batch/badge" /></a>
<p>
<p align="center">
  <a href="https://yorickshan.github.io/html2canvas-batch/getting-started.html">Getting Started</a>
  | <a href="https://deepwiki.com/yorickshan/html2canvas-batch">DeepWiki</a>
</p>
<br>

## Why html2canvas-batch?

html2canvas-batch is a fork of [niklasvh/html2canvas](https://github.com/niklasvh/html2canvas) that includes various fixes and new features. It offers several advantages over the original html2canvas, such as:
- support color function ```color()``` (including relative colors)
- support color function ```lab()```
- support color function ```lch()```
- support color function ```oklab()```
- support color function ```oklch()```
- Support object-fit of ```<img/>```
- Fixed some [issues](./CHANGELOG.md)

If you found this helpful, don't forget to
leave a star 🌟.

## Installation

```sh
npm install html2canvas-batch
pnpm / yarn add html2canvas-batch
```

## Usage
```javascript
import html2canvas from 'html2canvas-batch';
```

To render an `element` with html2canvas-batch with some (optional) [options](/docs/configuration.md), simply call `html2canvas(element, options);`

```javascript
html2canvas(document.body).then(function(canvas) {
    document.body.appendChild(canvas);
});
```

## Contribution

If you want to add some features, feel free to submit PR.

If you want to become a maintainer on it, please contact me.

## Credits

This project is a fork of [html2canvas-pro](https://github.com/yorickshan/html2canvas-pro) by [yorickshan](https://github.com/yorickshan), which is itself a fork of the original [html2canvas](https://github.com/niklasvh/html2canvas) by [niklasvh](https://github.com/niklasvh).

We would like to thank:
- [niklasvh](https://github.com/niklasvh) and all [html2canvas contributors](https://github.com/niklasvh/html2canvas/graphs/contributors) for the original work
- [yorickshan](https://github.com/yorickshan) for the html2canvas-pro fork with additional features

## License

[MIT](LICENSE).
