# Gumshoe [![Build Status](https://travis-ci.org/cferdinandi/gumshoe.svg)](https://travis-ci.org/cferdinandi/gumshoe)
A simple vanilla JS scrollspy script. Gumshoe works great with [Smooth Scroll](https://github.com/cferdinandi/smooth-scroll).

**[View the Demo on CodePen &rarr;](https://codepen.io/cferdinandi/pen/aMvxKr)**

[Getting Started](#getting-started) | [Nested Navigation](#nested-navigation) | [Reflows](#catching-reflows) | [Fixed Headers](#accounting-for-fixed-headers) | [API](#api) | [What's new?](#whats-new) | [Browser Compatibility](#browser-compatibility) | [License](#license)

<hr>

### Want to learn how to write your own vanilla JS plugins? Check out my [Vanilla JS Pocket Guides](https://vanillajsguides.com/) or join the [Vanilla JS Academy](https://vanillajsacademy.com) and level-up as a web developer. 🚀

<hr>


## Getting Started

Compiled and production-ready code can be found in the `dist` directory. The `src` directory contains development code.

### 1. Include Gumshoe on your site.

There are two versions of Gumshoe: the standalone version, and one that comes preloaded with polyfills for `closest()` and `CustomEvent()`, which are only supported in newer browsers.

If you're including your own polyfills or don't want to enable this feature for older browsers, use the standalone version. Otherwise, use the version with polyfills.

**Direct Download**

You can [download the files directly from GitHub](https://github.com/cferdinandi/gumshoe/archive/master.zip).

```html
<script src="path/to/gumshoe.polyfills.min.js"></script>
```

**CDN**

You can also use the [jsDelivr CDN](https://cdn.jsdelivr.net/gh/cferdinandi/gumshoe/dist/). I recommend linking to a specific version number or version range to prevent major updates from breaking your site. Gumshoe uses semantic versioning.

```html
<!-- Always get the latest version -->
<!-- Not recommended for production sites! -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/gumshoe/dist/gumshoe.polyfills.min.js"></script>

<!-- Get minor updates and patch fixes within a major version -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/gumshoe@4/dist/gumshoe.polyfills.min.js"></script>

<!-- Get patch fixes within a minor version -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/gumshoe@4.0/dist/gumshoe.polyfills.min.js"></script>

<!-- Get a specific version -->
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/gumshoe@4.0.0/dist/gumshoe.polyfills.min.js"></script>
```

**NPM**

You can also use NPM (or your favorite package manager).

```bash
npm install gumshoejs
```

### 2. Add the markup to your HTML.

The only thing Gumshoe needs to work is a list of anchor links. They can be ordered or unordered, inline or unstyled, or even nested.

```html
<ul id="my-awesome-nav">
	<li><a href="#eenie">Eenie</a></li>
	<li><a href="#meenie">Meenie</a></li>
	<li><a href="#miney">Miney</a></li>
	<li><a href="#mo">Mo</a></li>
</ul>
```

### 3. Initialize Gumshoe.

In the footer of your page, after the content, initialize Gumshoe by passing in a selector for the navigation links that should be detected as the user scrolls.

```html
<script>
	var spy = new Gumshoe('#my-awesome-nav a');
</script>
```

### 4. Add styling.

Gumshoe adds the `.active` class to the list item (`<li></li>`) and content for the active link, but does not include any styling.

Add styles to your CSS as desired. And that's it, you're done. Nice work!

```css
#my-awesome-nav li.active a {
	font-weight: bold;
}
```

**[View a Demo on CodePen &rarr;](https://codepen.io/cferdinandi/pen/aMvxKr)**

*__Note:__ you can customize the class names with [user options](#options-and-settings).*



## Nested navigation

If you have a nested navigation menu with multiple levels, Gumshoe can also apply an `.active` class to the parent list items of the currently active link.

```html
<ul id="my-awesome-nav">
	<li><a href="#eenie">Eenie</a></li>
	<li>
		<a href="#meenie">Meenie</a>
		<ul>
			<li><a href="#hickory">Hickory</a></li>
			<li><a href="#dickory">Dickory</a></li>
			<li><a href="#doc">Doc</a></li>
		</ul>
	</li>
	<li><a href="#miney">Miney</a></li>
	<li><a href="#mo">Mo</a></li>
</ul>
```

Set `nested` to `true` when instantiating Gumshoe. You can also customize the class name.

```js
var spy = new Gumshoe('#my-awesome-nav a', {
	nested: true,
	nestedClass: 'active-parent'
});
```

**[Try nested navigation on CodePen &rarr;](https://codepen.io/cferdinandi/pen/JzYVxj)**


## Catching reflows

If the content that's linked to by your navigation has different layouts at different viewports, Gumshoe will need to detect these changes and update some calculations behind-the-scenes.

Set `reflow` to `true` to enable this (it's off by default).

```js
var spy = new Gumshoe('#my-awesome-nav a', {
	reflow: true
});
```


## Accounting for fixed headers

If you have a fixed header on your page, you may want to offset when a piece of content is considered "active."

The `offset` user setting accepts either a number, or a function that returns a number. If you need to dynamically calculate dimensions, a function is the preferred method.

Here's an example that automatically calculates a header's height and offsets by that amount.

```js
// Get the header
var header = document.querySelector('#my-header');

// Initialize Gumshoe
var spy = new Gumshoe('#my-awesome-nav a', {
	offset: function () {
		return header.getBoundingClientRect().height;
	}
});
```

**[Try using an offset on CodePen &rarr;](https://codepen.io/cferdinandi/pen/eXpLqo)**



## API

Gumshoe includes smart defaults and works right out of the box. But if you want to customize things, it also has a robust API that provides multiple ways for you to adjust the default options and settings.

### Options and Settings

You can pass options into Gumshoe when instantiating.

```javascript
var spy = new Gumshoe('#my-awesome-nav a', {

	// Active classes
	navClass: 'active', // applied to the nav list item
	contentClass: 'active', // applied to the content

	// Nested navigation
	nested: false, // if true, add classes to parents of active link
	nestedClass: 'active', // applied to the parent items

	// Offset & reflow
	offset: 0, // how far from the top of the page to activate a content area
	reflow: false, // if true, listen for reflows

	// Event support
	events: true // if true, emit custom events

});
```

### Custom Events

Gumshoe emits two custom events:

- `gumshoeActivate` is emitted when a link is activated.
- `gumshoeDeactivate` is emitted when a link is deactivated.

Both events are emitted on the list item and bubble up. You can listen for them with the `addEventListener()` method. The `event.detail` object includes the `link` and `content` elements, and the `settings` for the current instantiation.

```js
// Listen for activate events
document.addEventListener('gumshoeActivate', function (event) {

	// The list item
	var li = event.target;

	// The link
	var link = event.detail.link;

	// The content
	var content = event.detail.content;

}, false);
```

### Methods

Gumshoe also exposes several public methods.

#### setup()
Setups all of the calculations Gumshoe needs behind-the-scenes. If you dynamically add navigation items to the DOM after Gumshoe is instantiated, you can run this method to update the calculations.

**Example**

```javascript
var spy = new Gumshoe('#my-awesome-nav a');
spy.setup();
```

#### detect()
Activate the navigation link that's content is currently in the viewport.

**Example**

```javascript
var spy = new Gumshoe('#my-awesome-nav a');
spy.detect();
```

#### destroy()
Destroy the current instantiation of Gumshoe.

**Example**

```javascript
var spy = new Gumshoe('#my-awesome-nav a');
spy.destroy();
```




## What's new?

Gumshoe 4 is a ground-up rewrite.

### New Features

- Multiple instantiations can be run with different settings for each.
- An active class is now added to the content as well.
- Nested navigation is now supported.
- Offsets can be dynamically calculated instead of set just once at initialization.
- Special and non-Roman characters can now be used in anchor links and IDs.
- Custom events provide a more flexible way to react to DOM changes.

### Breaking Changes

- Gumshoe must now be instantiated as a new object (`new Gumshoe()`) instead of being initialized `gumshoe.init()`.
- Callback methods have been removed in favor of events.
- Automatic header offsetting has been removed.
- The public `init()` method has been deprecated.



## Browser Compatibility

Gumshoe works in all modern browsers, and IE 9 and above.

### Polyfills

Support back to IE9 requires polyfills for `closest()` and `CustomEvent()`. Without them, support starts with Edge.

Use the included polyfills version of Gumshoe, or include your own.



## License

The code is available under the [MIT License](LICENSE.md).
