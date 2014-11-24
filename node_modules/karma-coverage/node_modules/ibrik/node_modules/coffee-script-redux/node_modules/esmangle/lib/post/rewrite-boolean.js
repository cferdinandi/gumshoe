/*
  Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>

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

    var Name, Syntax, common, modified;

    Name = 'rewrite-boolean';
    common = require('../common');
    Syntax = common.Syntax;

    function isBooleanLiteral(node) {
        return node.type === Syntax.Literal && typeof node.value === 'boolean';
    }

    function rewrite(node) {
        if (isBooleanLiteral(node)) {
            modified = true;
            return common.moveLocation(node, {
                type: Syntax.UnaryExpression,
                operator: '!',
                argument: common.moveLocation(node, {
                    type: Syntax.Literal,
                    value: +!node.value
                })
            });
        }

        if (node.type === Syntax.BinaryExpression && node.operator === '==' || node.operator === '!=') {
            if (isBooleanLiteral(node.left)) {
                modified = true;
                node.left = common.moveLocation(node.left, {
                    type: Syntax.Literal,
                    value: +node.left.value
                });
                return node;
            }
            if (isBooleanLiteral(node.right)) {
                modified = true;
                node.right = common.moveLocation(node.right, {
                    type: Syntax.Literal,
                    value: +node.right.value
                });
                return node;
            }
        }

        return node;
    }

    function rewriteBoolean(tree, options) {
        var result;

        modified = false;
        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);

        result = common.replace(result, {
            enter: rewrite
        });

        return {
            result: result,
            modified: modified
        };
    }

    rewriteBoolean.passName = Name;
    module.exports = rewriteBoolean;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
