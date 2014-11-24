# Gumshoe [![Build Status](https://travis-ci.org/cferdinandi/gumshoe.svg)](https://travis-ci.org/cferdinandi/gumshoe)
A simple, framework-agnostic scrollspy script.

[Download Gumshoe](https://github.com/cferdinandi/gumshoe/archive/master.zip) / [View the demo](http://cferdinandi.github.io/gumshoe/)

**In This Documentation**

1. [Getting Started](#getting-started)
2. [Installing with Package Managers](#installing-with-package-managers)
3. [Working with the Source Files](#working-with-the-source-files)
4. [Options & Settings](#options-and-settings)
5. [Browser Compatibility](#browser-compatibility)
6. [How to Contribute](#how-to-contribute)
7. [License](#license)
8. [Changelog](#changelog)



## Getting Started

Compiled and production-ready code can be found in the `dist` directory. The `src` directory contains development code. Unit tests are located in the `test` directory. It's the same build system that's used by [Kraken](http://cferdinandi.github.io/kraken/), so it includes some unnecessary tasks but can be dropped right in to the boilerplate without any configuration.

### 1. Include Gumshoe on your site.

```html
<script src="dist/js/classList.js"></script>
<script src="dist/js/gumshoe.js"></script>
```

Gumshoe requires [classList.js](https://github.com/eligrey/classList.js), a polyfill that extends ECMAScript 5 API support to more browsers.

### 2. Add the markup to your HTML.

```html
Markup here...
```

Details.

### 3. Initialize Gumshoe.

```html
<script>
	gumshoe.init();
</script>
```

In the footer of your page, after the content, initialize Gumshoe. And that's it, you're done. Nice work!



## Installing with Package Managers

You can install Gumshoe with your favorite package manager.

* **NPM:** `npm install cferdinandi/gumshoe`
* **Bower:** `bower install https://github.com/cferdinandi/gumshoe.git`
* **Component:** `component install cferdinandi/gumshoe`



## Working with the Source Files

If you would prefer, you can work with the development code in the `src` directory using the included [Gulp build system](http://gulpjs.com/). This compiles, lints, and minifies code, and runs unit tests. It's the same build system that's used by [Kraken](http://cferdinandi.github.io/kraken/), so it includes some unnecessary tasks but can be dropped right in to the boilerplate without any configuration.

### Dependencies
Make sure these are installed first.

* [Node.js](http://nodejs.org)
* [Ruby Sass](http://sass-lang.com/install)
* [Gulp](http://gulpjs.com) `sudo npm install -g gulp`

### Quick Start

1. In bash/terminal/command line, `cd` into your project directory.
2. Run `npm install` to install required files.
3. When it's done installing, run one of the task runners to get going:
	* `gulp` manually compiles files.
	* `gulp watch` automatically compiles files when changes are made.
	* `gulp reload` automatically compiles files and applies changes using [LiveReload](http://livereload.com/).



## Options and Settings

Gumshoe includes smart defaults and works right out of the box. But if you want to customize things, it also has a robust API that provides multiple ways for you to adjust the default options and settings.

### Global Settings

You can pass options and callbacks into Gumshoe through the `init()` function:

```javascript
gumshoe.init();
```

### Use Gumshoe events in your own scripts

You can also call Gumshoe events in your own scripts.

#### functionName()
Description

```javascript
// Functions here...
```

**Example**

```javascript
// Example here...
```

#### destroy()
Destroy the current `gumshoe.init()`. This is called automatically during the init function to remove any existing initializations.

```javascript
gumshoe.destroy();
```



## Browser Compatibility

Gumshoe works in all modern browsers, and IE 9 and above.



## How to Contribute

In lieu of a formal style guide, take care to maintain the existing coding style. Don't forget to update the version number, the changelog (in the `readme.md` file), and when applicable, the documentation.



## License

Gumshoe is licensed under the [MIT License](http://gomakethings.com/mit/).



## Changelog

Gumshoe uses [semantic versioning](http://semver.org/).

* v0.0.1 - DATE
	* Initial release.