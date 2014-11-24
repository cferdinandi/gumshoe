/* jshint node:true */

'use strict';

var gulp   = require('gulp'),
    mocha  = require('gulp-mocha'),
    jshint = require('gulp-jshint');

gulp.task('lint', function() {
    gulp.src('*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function() {
    gulp.src('test.js', {read: false})
        .pipe(mocha());
});

gulp.task('watch', function() {
    gulp.watch('*.js', ['dev']);
});

gulp.task('dev', ['lint', 'test']);

gulp.task('default', ['dev', 'watch']);
