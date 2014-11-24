var os = require('os');
var path = require('path');
var fs = require('fs');
var builder = require('xmlbuilder');

var HTMLReporter = function(baseReporterDecorator, config, emitter, logger, helper, formatError) {
  var outputFile = config.htmlReporter.outputFile;
  var log = logger.create('reporter.html');
 
  var html;
  var body;
  var suites;
  var pendingFileWritings = 0;
  var fileWritingFinished = function() {};
  var allMessages = [];
  
  baseReporterDecorator(this);
  
  // TODO: remove if public version of this method is available
  var basePathResolve = function(relativePath) {

    if (helper.isUrlAbsolute(relativePath)) {
      return relativePath;
    }

    if (!helper.isDefined(config.basePath) || !helper.isDefined(relativePath)) {
      return '';
    }

    return path.resolve(config.basePath, relativePath);
  };

  var htmlHelpers = {
    createHead: function() {
      var head = html.ele('head');
      head.ele('meta', {charset: 'utf-8'});
      head.ele('title', {}, 'Unit Test Results');
      head.ele('style', {type: 'text/css'}, 'html,body{font-family:Arial,sans-serif;margin:0;padding:0;}body{padding:10px 40px;}table{width:100%;margin-bottom:20px;}tr.header{background:#ddd;font-weight:bold;border-bottom:none;}td{padding:7px;border-top:none;border-left:1px black solid;border-bottom:1px black solid;border-right:none;}tr.pass td{color:#003b07;background:#86e191;}tr.skip td{color:#7d3a00;background:#ffd24a;}tr.fail td{color:#5e0e00;background:#ff9c8a;}tr:first-child td{border-top:1px black solid;}td:last-child{border-right:1px black solid;}tr.overview{font-weight:bold;color:#777;}tr.overview td{padding-bottom:0px;border-bottom:none;}tr.system-out td{color:#777;}hr{height:2px;margin:30px 0;background:#000;border:none;}');
    },
    createBody: function() {
      body = html.ele('body');
      body.ele('h1', {}, 'Unit Test Results');
    }
  };

  this.adapters = [function(msg) {
    allMessages.push(msg);
  }];

  this.onRunStart = function(browsers) {
    suites = {};
    html = builder.create('html', null, 'html');
    html.documentObject.children.shift();
  };

  this.onBrowserStart = function (browser){
    var suite;
    var header;
    var timestamp = (new Date()).toISOString().substr(0, 19);
    htmlHelpers.createHead();
    htmlHelpers.createBody();
    suite = suites[browser.id] = body.ele('table', {cellspacing:'0', cellpadding:'0', border:'0'});
    suite.ele('tr', {class:'overview'}).ele('td', {colspan:'3', title:browser.fullName}, 'Browser: ' + browser.name);
    suite.ele('tr', {class:'overview'}).ele('td', {colspan:'3'}, 'Timestamp: ' + timestamp);
    suites[browser.id]['results'] = suite.ele('tr').ele('td', {colspan:'3'});
    header = suite.ele('tr', {class:'header'});
    header.ele('td', {}, 'Status');
    header.ele('td', {}, 'Spec');
    header.ele('td', {}, 'Suite / Results');
    body.ele('hr');
  };

  this.onBrowserComplete = function(browser) {
    var suite = suites[browser.id];
    var result = browser.lastResult;

    suite['results'].txt(result.total + ' tests / ');
    suite['results'].txt((result.disconnected || result.error ? 1 : 0) + ' errors / ');
    suite['results'].txt(result.failed + ' failures / ');
    suite['results'].txt(result.skipped + ' skipped / ');
    suite['results'].txt('runtime: ' + ((result.netTime || 0) / 1000) + 's');

    if (allMessages.length > 0) {
        suite.ele('tr', {class:'system-out'}).ele('td', {colspan:'3'}).raw('<strong>System output:</strong><br />' + allMessages.join('<br />'));
    }
  };

  this.onRunComplete = function() {
    var htmlToOutput = html;

    pendingFileWritings++;

    config.basePath = path.resolve(config.basePath || '.');
    outputFile = basePathResolve(outputFile);
    helper.normalizeWinPath(outputFile);

    helper.mkdirIfNotExists(path.dirname(outputFile), function() {
      fs.writeFile(outputFile, htmlToOutput.end({pretty: true}), function(err) {
        if (err) {
          log.warn('Cannot write HTML report\n\t' + err.message);
        } else {
          log.debug('HTML results written to "%s".', outputFile);
        }

        if (!--pendingFileWritings) {
          fileWritingFinished();
        }
      });
    });

    suites = html = null;
    allMessages.length = 0;
  };

  this.specSuccess = this.specSkipped = this.specFailure = function(browser, result) {
    var specClass = result.skipped ? 'skip' : (result.success ? 'pass' : 'fail');
    var spec = suites[browser.id].ele('tr', {class:specClass});
    var suiteColumn;

    spec.ele('td', {}, result.skipped ? 'Skipped' : (result.success ? ('Passed in ' + ((result.time || 0) / 1000) + 's') : 'Failed'));
    spec.ele('td', {}, result.description);
    suiteColumn = spec.ele('td', {}).raw(result.suite.join(' &raquo; '));

    if (!result.success) {
      result.log.forEach(function(err) {
        suiteColumn.raw('<br />' + formatError(err));
      });
    }
  };

  // TODO(vojta): move to onExit
  // wait for writing all the html files, before exiting
  emitter.on('exit', function(done) {
    if (pendingFileWritings) {
      fileWritingFinished = done;
    } else {
      done();
    }
  });
};

HTMLReporter.$inject = ['baseReporterDecorator', 'config', 'emitter', 'logger',
    'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:html': ['type', HTMLReporter]
};