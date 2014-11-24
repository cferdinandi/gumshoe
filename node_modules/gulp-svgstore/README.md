gulp-svgstore
=============

[![Build Status](https://api.travis-ci.org/w0rm/gulp-svgstore.png)](https://travis-ci.org/w0rm/gulp-svgstore)

Combine svg files into one with `<symbol>` elements.
Read more about this in [CSS Tricks article](http://css-tricks.com/svg-symbol-good-choice-icons/).

If you need similar plugin for grunt, I encourage you to check [grunt-svgstore](https://github.com/FWeinb/grunt-svgstore).

## Options:

* fileName — the name of result file, default: 'svgstore.svg'
* prefix — prefix for ids of the <symbol> elements, default: ''
* inlineSvg — output only `<svg>` element without `<?xml ?>` and `DOCTYPE` to use inline, default: false
* transformSvg(svg, cb) — callback to modify svg [libxmljs element](https://github.com/polotek/libxmljs/wiki/Element) and call `cb(err)` when done

## Usage

The following script will combine circle.svg and square.svg into single svg file with
`<symbol>` elements. Additionally pass through [gulp-svgmin](https://github.com/ben-eb/gulp-svgmin) to minimize svg payload size.

```js
var svgstore = require('gulp-svgstore')
var gulp = require('gulp')
var svgmin = require('gulp-svgmin')
gulp.task('default', function () {
  return gulp.src('test/src/*.svg')
             .pipe(svgmin())
             .pipe(svgstore({ fileName: 'icons.svg', prefix: 'icon-' }))
             .pipe(gulp.dest('test/'))
})
```

### Inlining svgstore result into html body

To inline combined svg into html body I suggest using [gulp-inject](https://github.com/klei/gulp-inject).
The following gulp task will inject svg into
`<!-- inject:svg --><!-- endinject -->` placeholder of test/src/inline-svg.html.


```js
var svgstore = require('gulp-svgstore')
var inject = require('gulp-inject')
var gulp = require('gulp')
gulp.task('default', function () {
  var svgs = gulp.src('test/src/*.svg')
                 .pipe(svgstore({ prefix: 'icon-', inlineSvg: true }))
  function fileContents (filePath, file) {
    return file.contents.toString('utf8')
  }
  return gulp
    .src('test/src/inline-svg.html')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest('test/dest'))
})

```

### Using svg as external file

There is a problem with `<use xlink:href="external.svg#icon-name">` in Internet Explorer,
so you should either inline everything into body with a
[simple script like this](https://gist.github.com/w0rm/621a56a353f7b2a6b0db) or
polyfil with [svg4everybody](https://github.com/jonathantneal/svg4everybody).


## Transform result svg

### Add display:none

To add `style="display:none"` use the following transformSvg function:

```js
function transformSvg (svg, cb) {
  svg.attr({ style: 'display:none' })
  cb(null)
}
```

### Remove fills

To remove all fill attributes (so you can set fill from css) use the following transformSvg function:

```js
function transformSvg (svg, cb) {
  svg.find('//*[@fill]').forEach(function (child) {
    child.attr('fill').remove()
  })
  cb(null)
}
```

Remove only particular fills (e.g. fill="none"):

```js
function transformSvg (svg, cb) {
  svg.find('//*[@fill="none"]').forEach(function (child) {
    child.attr('fill').remove()
  })
  cb(null)
}
```

## Changelog

* 2.0.0
  * Added check for inputs before generating SVG.

* 1.0.1
  * Added check for missing viewBox in original svg.

* 1.0.0
  * Initial release.
