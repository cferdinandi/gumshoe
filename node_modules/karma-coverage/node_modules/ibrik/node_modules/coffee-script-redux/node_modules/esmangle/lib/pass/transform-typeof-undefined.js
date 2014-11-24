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

    var Name, Syntax, common, escope, modified;

    Name = 'transform-typeof-undefined';
    escope = require('escope');
    common = require('../common');
    Syntax = common.Syntax;

    function isUndefinedStringLiteral(node) {
        return node.type === Syntax.Literal && node.value === 'undefined';
    }

    function transformTypeofUndefined(tree, options) {
        var result, manager, scope;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;
        scope = null;

        manager = escope.analyze(result, { directive: true });
        manager.attach();

        common.traverse(result, {
            enter: function enter(node) {
                var target, undef, argument, ref;
                scope = manager.acquire(node) || scope;
                if (node.type === Syntax.BinaryExpression &&
                    (node.operator === '===' || node.operator === '!==' || node.operator === '==' || node.operator === '!=')) {
                    if (isUndefinedStringLiteral(node.left)) {
                        undef = 'left';
                        target = 'right';
                    } else if (isUndefinedStringLiteral(node.right)) {
                        undef = 'right';
                        target = 'left';
                    } else {
                        return;
                    }

                    if (node[target].type === Syntax.UnaryExpression && node[target].operator === 'typeof') {
                        argument = node[target].argument;
                        if (argument.type === Syntax.Identifier) {
                            ref = scope.resolve(argument);
                            if (!ref || !ref.isStatic() || !ref.resolved) {
                                // may raise ReferenceError
                                return;
                            }
                        }
                        modified = true;
                        node[undef] = common.SpecialNode.generateUndefined();
                        node[target] = argument;
                        node.operator = node.operator.charAt(0) === '!' ? '!==' : '===';
                    }
                }
            },
            leave: function leave(node) {
                scope = manager.release(node) || scope;
            }
        });

        manager.detach();

        return {
            result: result,
            modified: modified
        };
    }

    transformTypeofUndefined.passName = Name;
    module.exports = transformTypeofUndefined;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
