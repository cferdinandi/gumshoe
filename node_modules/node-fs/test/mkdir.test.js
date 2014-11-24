var fs = require('../lib/fs');
var assert = require('assert');

// Define the base temporary directory where tests will be written
var tmpBaseDir = '/tmp/_node-fs-test';

/**
 * Tests the recursive creation of a directory
 */
exports.testRecursiveMkdir = function() {
  fs.mkdir(tmpBaseDir + '/a/b/c/d/e', 0777, true, function (err) {
    assert.isUndefined(err);
  });
}

/**
 * Tests the synchronous creation of a directory
 */
exports.testRecursiveMkdirSync = function() {
  assert.doesNotThrow(
  	function () {
    	fs.mkdirSync(tmpBaseDir + '/_sync/a/b/c/d/e', 0777, true);
    }
  );
}
