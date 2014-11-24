/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*global module:true*/
(function () {
    'use strict';

    var Set, Map;

    Map = require('./map');

    if (typeof global.Set !== 'undefined') {
        // ES6 Set
        Set = global.Set;
    } else {
        Set = function Set() {
            this.__map = new Map();
        };

        Set.prototype.has = function SetHas(key) {
            return this.__map.has(key);
        };

        Set.prototype.add = function SetAdd(key) {
            return this.__map.set(key, true);
        };

        Set.prototype['delete'] = function SetDelete(key) {
            return this.__map['delete'](key);
        };

        Set.prototype.clear = function SetClear() {
            return this.__map.clear();
        };

        Set.prototype.forEach = function SetForEach(callback, thisArg) {
            var that = this;
            this.__map.forEach(function (value, key) {
                callback.call(thisArg, key, that);
            });
        };

        Set.prototype.values = function SetValues() {
            return this.__map.keys();
        };

        Set.prototype.keys = Set.prototype.values;
    }

    module.exports = Set;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
