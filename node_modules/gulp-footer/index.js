/* jshint node: true */
'use strict';

var es = require('event-stream');
var gutil = require('gulp-util');
var extend = require('lodash.assign');

var footerPlugin = function(footerText, data) {
  footerText = footerText || '';
  return es.map(function(file, cb){
    file.contents = Buffer.concat([
      file.contents,
      new Buffer(gutil.template(footerText, extend({file : file}, data)))
    ]);
    cb(null, file);
  });
};

module.exports = footerPlugin;
