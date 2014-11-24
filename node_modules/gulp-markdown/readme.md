# [gulp](http://gulpjs.com)-markdown [![Build Status](https://travis-ci.org/sindresorhus/gulp-markdown.svg?branch=master)](https://travis-ci.org/sindresorhus/gulp-markdown)

> Markdown to HTML with [marked](https://github.com/chjj/marked)

*Issues with the output should be reported on the marked [issue tracker](https://github.com/chjj/marked/issues).*


## Install

```sh
$ npm install --save-dev gulp-markdown
```


## Usage

```js
var gulp = require('gulp');
var markdown = require('gulp-markdown');

gulp.task('default', function () {
	return gulp.src('intro.md')
		.pipe(markdown())
		.pipe(gulp.dest('dist'));
});
```


## API

### markdown(options)

See the marked [options](https://github.com/chjj/marked#options-1).


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
