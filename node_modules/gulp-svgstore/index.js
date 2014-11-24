var libxml = require('libxmljs')
var path = require('path')
var through2 = require('through2')
var gutil = require('gulp-util')

module.exports = function (config) {

  config = config || {}
  var isEmpty = true

  var prefix = config.prefix || ''
  var fileName = config.fileName || 'svgstore.svg'
  var inlineSvg = config.inlineSvg || false
  var transformSvg = config.transformSvg || false

  var combinedDoc = new libxml.Document()
  var combinedSvg = combinedDoc.node('svg')
  combinedDoc.setDtd( 'svg'
                    , '-//W3C//DTD SVG 1.1//EN'
                    , 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
                    )
  combinedSvg.attr({ xmlns: 'http://www.w3.org/2000/svg' })

  return through2.obj(

    function transform (file, encoding, cb) {

      if (file.isStream()) {
        return cb(new gutil.PluginError('gulp-svgstore', 'Streams are not supported!'))
      }

      if (file && isEmpty) {
        isEmpty = false
      }

      var xmlDoc = libxml.parseXml(file.contents.toString('utf8'))
      var contents = xmlDoc.root().childNodes()
      var idAttr = prefix + path.basename(file.relative, path.extname(file.relative))
      var viewBoxAttr = xmlDoc.root().attr('viewBox')
      if (viewBoxAttr) viewBoxAttr = viewBoxAttr.value()
      var symbol = libxml.Element(combinedDoc, 'symbol')

      symbol.attr({ id: idAttr })
      if (viewBoxAttr) symbol.attr({ viewBox: viewBoxAttr })

      contents.forEach(function (child) {
        child.namespace(null)
        symbol.addChild(child)
      })

      combinedSvg.addChild(symbol)

      cb(null)
    }

  , function flush (cb) {
      var self = this

      function done (err) {
        var file
        var contents
        if (err) return cb(err)
        contents = inlineSvg ? combinedSvg : combinedDoc
        file = new gutil.File({ path: fileName, contents: new Buffer(contents.toString()) })
        self.push(file)
        cb(null)
      }

      if (isEmpty) return cb()

      if (transformSvg) {
        transformSvg(combinedSvg, done)
      } else {
        done (null, combinedSvg)
      }

    }
  )
}
