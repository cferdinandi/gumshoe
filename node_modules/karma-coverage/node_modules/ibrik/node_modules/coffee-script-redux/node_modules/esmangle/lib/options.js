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

/*jslint bitwise:true */
(function () {
    'use strict';

    var common;

    common = require('./common');

    function extend(result, update) {
        var prop, lhs, rhs;

        for (prop in update) {
            if (!common.Object.has(update, prop)) {
                continue;
            }

            if (prop in result) {
                lhs = result[prop];
                rhs = update[prop];
                if (common.Object.isObject(rhs) && common.Object.isObject(lhs)) {
                    result[prop] = extend(lhs, rhs);
                } else {
                    result[prop] = update[prop];
                }
            } else {
                result[prop] = update[prop];
            }
        }

        return result;
    }

    function Options(override) {
        var defaults = {
            destructive: true,
            preserveCompletionValue: false
        };

        if (override == null) {
            this.data = defaults;
            return;
        }

        this.data = extend(defaults, override);
    }

    // options.get(name, {
    //   pathName: pathName
    // });
    Options.prototype.get = function get(name, details) {
        var local;
        if (details != null) {
            if (common.Object.has(details, 'pathName')) {
                local = this.data[details.pathName];
                if (local != null && common.Object.has(local, name)) {
                    return local[name];
                }
            }
        }
        return this.data[name];
    };

    module.exports = Options;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
