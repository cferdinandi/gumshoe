var should = require('should');
var flatten = require('../');
var File = require('gulp-util').File;

var file = new File({
  cwd: '/some/project/',
  base: '/some/project/src/',
  path: '/some/project/src/assets/css/app.css',
  contents: new Buffer('html { background-color: #777; }')
});

describe('gulp-flatten', function () {
  describe('flatten()', function () {
    it('should strip relative path without options', function (done) {
      var stream = flatten();
      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);

        newFile.relative.should.equal('app.css');
        done();
      });
      stream.write(file);
    });

    it('should replace relative path with option path', function (done) {
      var stream = flatten({newPath: 'new/path'});
      stream.on('error', done);
      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);

        newFile.relative.should.equal('new/path/app.css');
        done();
      });
      stream.write(file);
    });

    it('should emit arg error with nonstring option', function (done) {
      var stream = flatten(123);
      stream.on('error', function (err) {
        should.exist(err);
        should.exist(err.message);
        err.message.should.equal('Arguments to path.join must be strings');
        done();
      });
      stream.write(file);
    })
  });
});
