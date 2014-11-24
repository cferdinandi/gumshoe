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

    var Name, Syntax, common, evaluator, escope, modified;

    Name = 'reduce-sequence-expression';
    escope = require('escope');
    common = require('../common');
    evaluator = require('../evaluator');
    Syntax = common.Syntax;

    function reduce(node) {
        var i, iz, j, jz, expr, result;
        result = [];
        for (i = 0, iz = node.expressions.length; i < iz; ++i) {
            expr = node.expressions[i];
            if (expr.type === Syntax.SequenceExpression) {
                modified = true;
                // delete SequenceExpression location information,
                // because information of SequenceExpression is not used effectively in source-map.
                common.deleteLocation(node);
                for (j = 0, jz = expr.expressions.length; j < jz; ++j) {
                    result.push(expr.expressions[j]);
                }
            } else {
                result.push(expr);
            }
        }
        node.expressions = result;
    }

    function isLoadSideEffectFree(node, scope) {
        var ref, value;
        if (evaluator.constant.isConstant(node)) {
            value = evaluator.constant.evaluate(node);
            if (value === null || typeof value !== 'object') {
                return true;
            }
        }
        if (node.type === Syntax.Identifier) {
            ref = scope.resolve(node);
            return ref && ref.isStatic();
        }
        return false;
    }

    function isStoreSideEffectFree(node, scope) {
        if (!evaluator.hasSideEffect(node, scope)) {
            return true;
        }
        if (node.type === Syntax.Identifier) {
            return true;
        }
        if (node.type === Syntax.MemberExpression) {
            if (!evaluator.hasSideEffect(node.object, scope)) {
                // Because of toString operation
                if (!node.computed || isLoadSideEffectFree(node.property, scope)) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    function reduceSequenceExpression(tree, options) {
        var result, scope, manager;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;
        scope = null;

        manager = escope.analyze(result, { directive: true });
        manager.attach();

        result = common.replace(result, {
            enter: function enter(node) {
                scope = manager.acquire(node) || scope;
            },
            leave: function leave(node) {
                var result, last;
                switch (node.type) {
                case Syntax.SequenceExpression:
                    reduce(node);
                    break;

                case Syntax.ConditionalExpression:
                    if (node.test.type === Syntax.SequenceExpression) {
                        modified = true;
                        result = node.test;
                        node.test = common.Array.last(result.expressions);
                        result.expressions[result.expressions.length - 1] = node;
                    }
                    break;

                case Syntax.LogicalExpression:
                    if (node.left.type === Syntax.SequenceExpression) {
                        modified = true;
                        result = node.left;
                        node.left = common.Array.last(result.expressions);
                        result.expressions[result.expressions.length - 1] = node;
                    }
                    break;

                case Syntax.BinaryExpression:
                    if (node.left.type === Syntax.SequenceExpression) {
                        modified = true;
                        result = node.left;
                        node.left = common.Array.last(result.expressions);
                        result.expressions[result.expressions.length - 1] = node;
                    } else if (node.right.type === Syntax.SequenceExpression && !evaluator.hasSideEffect(node.left, scope)) {
                        modified = true;
                        result = node.right;
                        node.right = common.Array.last(result.expressions);
                        result.expressions[result.expressions.length - 1] = node;
                    }
                    break;

                case Syntax.UpdateExpression:
                case Syntax.UnaryExpression:
                    if (node.argument.type === Syntax.SequenceExpression) {
                        // Don't transform
                        //   typeof (0, ident)
                        // to
                        //   0, typeof ident
                        //
                        //   delete (0, 1, t.t)
                        // to
                        //   delete t.t
                        last = common.Array.last(node.argument.expressions);
                        if (!common.SpecialNode.canExtractSequence(last, node, scope)) {
                            break;
                        }
                        modified = true;
                        result = node.argument;
                        node.argument = common.Array.last(result.expressions);
                        result.expressions[result.expressions.length - 1] = node;
                    }
                    break;

                case Syntax.AssignmentExpression:
                    if (node.operator === '=' && node.right.type === Syntax.SequenceExpression && isStoreSideEffectFree(node.left, scope)) {
                        modified = true;
                        result = node.right;
                        node.right = common.Array.last(result.expressions);
                        result.expressions[result.expressions.length - 1] = node;
                    }
                    break;
                }
                scope = manager.release(node) || scope;
                return result;
            }
        });

        manager.detach();

        return {
            result: result,
            modified: modified
        };
    }

    reduceSequenceExpression.passName = Name;
    module.exports = reduceSequenceExpression;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
