# Gumshoe [![Build Status](https://travis-ci.org/cferdinandi/gumshoe.svg)](https://travis-ci.org/cferdinandi/gumshoe)
A simple, framework-agnostic scrollspy script. Gumshoe works great with [Smooth Scroll](https://github.com/cferdinandi/smooth-scroll).

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
<nav data-gumshoe-header>
	<ul data-gumshoe>
		<li class="active"><a class="active" href="#eenie">Eenie</a></li>
		<li><a href="#meanie">Meanie</a></li>
		<li><a href="#minnie">Minnie</a></li>
		<li><a href="#moe">Moe</a></li>
	</ul>
</nav>
```

Add the `[data-gumshoe]` attribute to the navigation list that Gumshoe should watch.

If you're using a fixed header, add the `[data-gumshoe-header]` attribute and Gumshoe will automatically offset it's calculations based on the header's height and distance from the top of the page.  If you have multiple fixed headers, add `[data-gumshoe-header]` to the last one in the markup.

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
	* `gulp watch` automatically compiles files and applies changes using [LiveReload](http://livereload.com/).



## Options and Settings

Gumshoe includes smart defaults and works right out of the box. But if you want to customize things, it also has a robust API that provides multiple ways for you to adjust the default options and settings.

### Global Settings

You can pass options and callbacks into Gumshoe through the `init()` function:

```javascript
gumshoe.init({
	offset: 0, // Distance in pixels to offset calculations
	activeClass: 'active', // Class to apply to active navigation link and it's parent list item
	callbackBefore: function (nav) {}, // Callback to before setting active link
	callbackAfter: function (nav) {} // Callback to run after setting active link
});
```

### Use Gumshoe events in your own scripts

You can also call Gumshoe events in your own scripts.

#### setDistances()
Recalculate the height of document, the height of the fixed header, and how far navigation targets are from the top of the document.

```javascript
gumshoe.setDistances();
```

#### getCurrentNav()
Determine which navigation element is currently active and add active classes.

```javascript
gumshoe.getCurrentNav();
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

* v1.0.0 - November 24, 2014
	* Initial release.