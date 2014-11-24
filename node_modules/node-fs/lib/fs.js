(function () {
  'use strict';

  var fs = require('fs'),
      mkdirOrig = fs.mkdir,
      mkdirSyncOrig = fs.mkdirSync,
      osSep = process.platform === 'win32' ? '\\' : '/';
  
  /**
   * Offers functionality similar to mkdir -p
   *
   * Asynchronous operation. No arguments other than a possible exception
   * are given to the completion callback.
   */
  function mkdir_p (path, mode, callback, position) {
    var parts = require('path').normalize(path).split(osSep);

    mode = mode || process.umask();
    position = position || 0;
  
    if (position >= parts.length) {
      return callback();
    }
  
    var directory = parts.slice(0, position + 1).join(osSep) || osSep;
    fs.stat(directory, function(err) {    
      if (err === null) {
        mkdir_p(path, mode, callback, position + 1);
      } else {
        mkdirOrig(directory, mode, function (err) {
          if (err && err.code != 'EEXIST') {
            return callback(err);
          } else {
            mkdir_p(path, mode, callback, position + 1);
          }
        });
      }
    });
  }
  
  function mkdirSync_p(path, mode, position) {
    var parts = require('path').normalize(path).split(osSep);

    mode = mode || process.umask();
    position = position || 0;
  
    if (position >= parts.length) {
      return true;
    }
  
    var directory = parts.slice(0, position + 1).join(osSep) || osSep;
    try {
      fs.statSync(directory);
      mkdirSync_p(path, mode, position + 1);
    } catch (e) {
      try {
        mkdirSyncOrig(directory, mode);
        mkdirSync_p(path, mode, position + 1);
      } catch (e) {
        if (e.code != 'EEXIST') {
          throw e;
        }
        mkdirSync_p(path, mode, position + 1);
      }
    }
  }
  
  /**
   * Polymorphic approach to fs.mkdir()
   *
   * If the third parameter is boolean and true assume that
   * caller wants recursive operation.
   */
  fs.mkdir = function (path, mode, recursive, callback) {
    if (typeof recursive !== 'boolean') {
      callback = recursive;
      recursive = false;
    }
  
    if (typeof callback !== 'function') {
      callback = function () {};
    }
  
    if (!recursive) {
      mkdirOrig(path, mode, callback);
    } else {
      mkdir_p(path, mode, callback);
    }
  }
  
  /**
   * Polymorphic approach to fs.mkdirSync()
   *
   * If the third parameter is boolean and true assume that
   * caller wants recursive operation.
   */
  fs.mkdirSync = function (path, mode, recursive) {
    if (typeof recursive !== 'boolean') {
      recursive = false;
    }
  
    if (!recursive) {
      mkdirSyncOrig(path, mode);
    } else {
      mkdirSync_p(path, mode);
    }
  }

  module.exports = fs;
}());
