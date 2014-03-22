/*!
 * amanda-wedding v1.0.0 (dev)
 * Wedding website
 *
 * Copyright(c): 2014
 * Build Date: 2014-03-22
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


/**
 * Initial application setup. Runs once upon every page load.
 *
 * @class App
 * @constructor
 */
var App = function() {
    this.init();
};

var proto = App.prototype;

/**
 * Initializes the application and kicks off loading of prerequisites.
 *
 * @method init
 * @private
 */
proto.init = function() {
    // Create your views here
};

module.exports = App;

},{}],2:[function(require,module,exports){
'use strict';

// The only purpose of this file is to kick off your application's top-level
// controller at the appropriate time. All other code should be written as
// separate modules in their own files.

// Require
var App = require('./App');

// Initialize
window.app = new App();

},{"./App":1}]},{},[2])