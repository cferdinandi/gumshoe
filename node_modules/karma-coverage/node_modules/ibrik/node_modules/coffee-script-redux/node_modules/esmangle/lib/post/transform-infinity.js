/*
  Copyright (C) 2012 Michael Ficarra <esmangle.copyright@michael.ficarra.me>
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
/*global module:true, require:true*/
(function () {
    'use strict';

    var Name, Syntax, common;

    Name = 'transform-infinity';
    common = require('../common');
    Syntax = common.Syntax;

    function transformInfinity(tree, options) {
        var result, modified;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;

        result = common.replace(result, {
            enter: function enter(node) {
                if (node.type === Syntax.Literal && typeof node.value === 'number') {
                    if (node.value === Infinity) {
                        modified = true;
                        return common.moveLocation(node, {
                            type: Syntax.BinaryExpression,
                            operator: '/',
                            left: {type: Syntax.Literal, value: 1},
                            right: {type: Syntax.Literal, value: 0}
                        });
                    }
                }
            }
        });

        return {
            result: result,
            modified: modified
        };
    }

    transformInfinity.passName = Name;
    module.exports = transformInfinity;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
