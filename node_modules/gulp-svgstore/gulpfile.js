var svgstore = require('./index')
var gulp = require('gulp')
var mocha = require('gulp-mocha')
var connect = require('connect')
var serveStatic = require('serve-static')
var http = require('http')
var inject = require('gulp-inject')


gulp.task('svg', function () {

  function transformSvg (svg, cb) {
    // remove all fill="none" attributes
    svg.find('//*[@fill="none"]').forEach(function (child) {
      child.attr('fill').remove()
    })
    cb(null)
  }

  return gulp
    .src('test/src/*.svg')
    .pipe(svgstore({ fileName: 'icons.svg'
                   , prefix: 'icon-'
                   , transformSvg: transformSvg
                   }))
    .pipe(gulp.dest('test/dest'))

})


gulp.task('inline-svg', function () {

  var svgs

  function transformSvg (svg, cb) {
    svg.attr({ style: 'display:none' })
    // remove all fill="none" attributes
    svg.find('//*[@fill="none"]').forEach(function (child) {
      child.attr('fill').remove()
    })
    cb(null)
  }

  function fileContents (filePath, file) {
    return file.contents.toString('utf8')
  }

  svgs = gulp.src('test/src/*.svg')
             .pipe(svgstore({ prefix: 'icon-'
                            , inlineSvg: true
                            , transformSvg: transformSvg
                            }))

  return gulp
    .src('test/src/inline-svg.html')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest('test/dest'))

})



gulp.task('test', ['svg', 'inline-svg'], function () {

  var app = connect().use(serveStatic('test'))
  var server = http.createServer(app)

  server.listen(process.env.PORT || 8888)

  function serverClose () {
    server.close()
  }

  return gulp
    .src('test.js', { read: false })
    .pipe(mocha())
    .on('end', serverClose)

})
