'use strict';

var fs = require('fs'),
  path = require('path'),
  concat = require('concat-stream'),
  es = require('event-stream'),
  gutil = require('gulp-util');

module.exports = function(options) {
  var prefix, basepath, filters;

  if (typeof options === 'object') {
    prefix = options.prefix || '@@';
    basepath = options.basepath || '@file';
    filters = options.filters;
  } else {
    prefix = options || '@@';
    basepath = '@file';
  }

  var includeRegExp = new RegExp(prefix + 'include\\s*\\([^)]*["\'](.*?)["\'](,\\s*({[\\s\\S]*?})){0,1}\\s*\\)+');

  function stripCommentedIncludes(content) {
    // remove single line html comments that use the format: <!-- @@include() -->
    var regex = new RegExp('<\!--(.*)' + prefix + 'include([\\s\\S]*?)-->', 'g');
    return content.replace(regex, '');
  }

  function fileInclude(file) {
    var self = this;

    if (file.isNull()) {
      self.emit('data', file);
    } else if (file.isStream()) {
      file.contents.pipe(concat(function(data) {
        var text = String(data);
        text = stripCommentedIncludes(text);

        try {
          self.emit('data', include(file, text, includeRegExp, prefix, basepath, filters));
        } catch (e) {
          self.emit('error', new gutil.PluginError('gulp-file-include', e.message));
        }
      }));
    } else if (file.isBuffer()) {
      try {
        self.emit('data', include(file, stripCommentedIncludes(String(file.contents)), includeRegExp, prefix, basepath, filters));
      } catch (e) {
        self.emit('error', new gutil.PluginError('gulp-file-include', e.message));
      }
    }
  }

  return es.through(fileInclude);
};

function include(file, text, includeRegExp, prefix, basepath, filters) {

  var matches = includeRegExp.exec(text);

  switch (basepath) {
    case '@file':
      basepath = path.dirname(file.path);
      break;
    case '@root':
      basepath = process.cwd();
      break;
    default:
      break;
  }

  basepath = path.resolve(process.cwd(), basepath);

  // for checking if we are not including the current file again
  var currentFilename = path.resolve(file.base, file.path);

  while (matches) {
    var match = matches[0];
    var includePath = path.resolve(basepath, matches[1]);

    if (currentFilename.toLowerCase() === includePath.toLowerCase()) {
      throw new Error('recursion detected in file: ' + currentFilename);
    }

    var includeContent = fs.readFileSync(includePath);

    // strip utf-8 BOM  https://github.com/joyent/node/issues/1918
    includeContent = includeContent.toString('utf-8').replace(/\uFEFF/, '');

    // need to double each `$` to escape it in the `replace` function
    includeContent = includeContent.replace(/\$/gi, '$$$$');

    // apply filters on include content
    if (typeof filters === 'object') {
      includeContent = applyFilters(filters, match, includeContent);
    }

    text = text.replace(match, includeContent);

    if (matches[3]) {
      // replace variables
      var data = JSON.parse(matches[3]);
      for (var k in data) {
        text = text.replace(new RegExp(prefix + k, 'g'), data[k]);
      }
    }

    matches = includeRegExp.exec(text);
  }

  file.contents = new Buffer(text);
  return file;
}

function applyFilters(filters, match, includeContent) {
  if (match.match(/\)+$/)[0].length === 1) {
    // nothing to filter return unchanged
    return includeContent;
  }

  // now get the ordered list of filters
  var filterlist = match.split('(').slice(1, -1);
  filterlist = filterlist.map(function(str) {
    return filters[str.trim()];
  });

  // compose them together into one function
  var filter = filterlist.reduce(compose);

  // and apply the composed function to the stringified content
  return filter(String(includeContent));
}

function compose(f, g) {
  return function(x) {
    return f(g(x));
  };
}
