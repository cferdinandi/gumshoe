# gulp-karma [![NPM version][npm-image]][npm-url]
<!-- [![Build status][travis-image]][travis-url]-->
> Karma plugin for gulp 3

## Usage

First, install `gulp-karma` as a development dependency:

```shell
npm install --save-dev gulp-karma
```

Then, add it to your `gulpfile.js`:

```javascript
var karma = require('gulp-karma');

var testFiles = [
  'client/todo.js',
  'client/todo.util.js',
  'client/todo.App.js',
  'test/client/*.js'
];

gulp.task('test', function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});

gulp.task('default', function() {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});
```

## API

### karma(options)

#### options.configFile
Type: `String`

The path to the Karma configuration file.

#### options.action
Type: `String`  
Default: `run`

One of the following:

  * **`run`**: Start the server, run tests once, then exit.
  * **`watch`**: Start the server, run tests once, then watch for changes and run when files change.

#### options.*

Any Karma option can be passed as part of the options object. See [Karma Configuration] for a complete list of options. **Note:** It's best practice to put options in your Karma config file.


## Notes

## Task return value

Karma runs asynchronously. When using `action: 'run'` in a task, you should return the stream so gulp knows the task finished.

## Watching

Due to the way Karma works, using `gulp.watch` to watch files results in contrived usage that doesn't work as expected in some cases. As a result, Karma's watch mechanism is employed to make usage of this plugin as straight forward as possible.

## Globs

Globs are resolved before they're sent to Karma, so if you add a new file that matches a glob you passed using `gulp.src('test/*').pipe(karma)`, it won't be caught by Karma.


[Karma Configuration]: http://karma-runner.github.io/0.10/config/configuration-file.html
[travis-url]: http://travis-ci.org/lazd/gulp-karma
[travis-image]: https://secure.travis-ci.org/lazd/gulp-karma.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-karma
[npm-image]: https://badge.fury.io/js/gulp-karma.png
