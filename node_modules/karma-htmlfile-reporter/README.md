karma-htmlfile-reporter
=======================

## A karma plugin for exporting unit test results as styled HTML file

This is a plugin for the [Karma Test Runner]. By adding this reporter to your karma configuration, unit test results will be exported as a styled HTML file. For each test browser, a separate table is generated. The plugin is  based on the [karma-junit-reporter plugin].

<img src="http://matthias-schuetz.github.io/karma-htmlfile-reporter/karma-htmlfile-reporter.png" />

## HTML test result page
<a href="http://matthias-schuetz.github.io/karma-htmlfile-reporter/units.html">Click here to see an example of the exported unit test result page.</a>

## Installation

The easiest way is to keep `karma-htmlfile-reporter` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-htmlfile-reporter": "~0.1"
  }
}
```

You can simple do it by:
```bash
npm install karma-htmlfile-reporter --save-dev
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    plugins : [
	  'karma-htmlfile-reporter'
    ],

    reporters: ['progress', 'html'],

    htmlReporter: {
      outputFile: 'tests/units.html'
    }
  });
};
```

You can pass list of reporters as a CLI argument too:
```bash
karma start --reporters html,dots
```

----

For more information on Karma see the [homepage].

[Karma Test Runner]: https://github.com/karma-runner/karma
[karma-junit-reporter plugin]: https://github.com/karma-runner/karma-junit-reporter
[homepage]: http://karma-runner.github.com