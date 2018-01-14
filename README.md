# Gumshoe [![Build Status](https://travis-ci.org/cferdinandi/gumshoe.svg)](https://travis-ci.org/cferdinandi/gumshoe)
A simple, framework-agnostic scrollspy script. Gumshoe works great with [Smooth Scroll](https://github.com/cferdinandi/smooth-scroll).

*See Gumshoe in action on Apple's [Swift.org website](https://swift.org/).*

[Download Gumshoe](https://github.com/cferdinandi/gumshoe/archive/master.zip) / [View the demo](http://cferdinandi.github.io/gumshoe/)


<hr>

### Want to learn how to write your own vanilla JS plugins? Check out ["The Vanilla JS Guidebook"](https://gomakethings.com/vanilla-js-guidebook/) and level-up as a web developer. 🚀

<hr>



## Getting Started

Compiled and production-ready code can be found in the `dist` directory. The `src` directory contains development code.

### 1. Include Gumshoe on your site.

```html
<script src="dist/js/gumshoe.js"></script>
```

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

If you're using a fixed header, add the `[data-gumshoe-header]` attribute and Gumshoe will automatically offset its calculations based on the header's height and distance from the top of the page.  If you have multiple fixed headers, add `[data-gumshoe-header]` to the last one in the markup.

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

If you would prefer, you can work with the development code in the `src` directory using the included [Gulp build system](http://gulpjs.com/). This compiles, lints, and minifies code.

### Dependencies
Make sure these are installed first.

* [Node.js](http://nodejs.org)
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
	selector: '[data-gumshoe] a', // Default link selector (must use a valid CSS selector)
	selectorHeader: '[data-gumshoe-header]', // Fixed header selector (must use a valid CSS selector)
	container: window, // The element to spy on scrolling in (must be a valid DOM Node)
	offset: 0, // Distance in pixels to offset calculations
	activeClass: 'active', // Class to apply to active navigation link and its parent list item
	scrollDelay: false, // Wait until scrolling has stopped before updating the navigation
	callback: function (nav) {}, // Callback to run after setting active link
	/**
	 * Whenever the link `domNode` is activated:
	 * activate also the Node returned by this function.
	 *
	 * For example, if domNode is a link nested inside some category:
	 * you could return the category heading Node.
	 *
	 * Return a falsey value if you don't want this node to activate other nodes.
	 * 
	 * @param {Node} domNode The dom element (selected by `selector`) that has been activated
	 * @return {Node} An element to activate
	 */
	activateAlso: function(domNode) {
		return null;
	}
});
```

***Note:*** *The `scrollDelay` option can be useful in preventing the elements of your navigation from being highlighted and unhighlighted in rapid succession when quickly scrolling (e.g., with [Smooth Scroll](https://github.com/cferdinandi/smooth-scroll)) through a page with many navigation items (e.g. a long document with a table of contents in the sidebar).*

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

Gumshoe works in all modern browsers, and IE 10 and above. You can extend browser support back to IE 9 with the [classList.js polyfill](https://github.com/eligrey/classList.js/).



## How to Contribute

Please review the  [contributing guidelines](CONTRIBUTING.md).



## License

The code is available under the [MIT License](LICENSE.md).
