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

    Name = 'transform-branch-to-expression';
    common = require('../common');
    Syntax = common.Syntax;

    function transformBranchToExpression(tree, options) {
        var result, preserveCompletionValue;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        preserveCompletionValue = options.get('preserveCompletionValue', { pathName: Name });
        modified = false;

        result = common.replace(result, {
            leave: function leave(node) {
                var consequent, alternate, ancestors;
                if (node.type === Syntax.IfStatement) {
                    ancestors = this.parents();
                    if (preserveCompletionValue && common.mayBeCompletionValue(node, ancestors)) {
                        return;
                    }

                    if (node.alternate) {
                        if (node.consequent.type === Syntax.ExpressionStatement && node.alternate.type === Syntax.ExpressionStatement) {
                            // ok, we can reconstruct this to ConditionalExpression
                            modified = true;
                            return common.moveLocation(node, {
                                type: Syntax.ExpressionStatement,
                                expression: common.moveLocation(node, {
                                    type: Syntax.ConditionalExpression,
                                    test: node.test,
                                    consequent: node.consequent.expression,
                                    alternate: node.alternate.expression
                                })
                            });
                        }
                        if (node.consequent.type === Syntax.ReturnStatement && node.alternate.type === Syntax.ReturnStatement) {
                            // pattern:
                            //   if (cond) return a;
                            //   else return b;
                            modified = true;

                            if (!node.consequent.argument && !node.alternate.argument) {
                                // if (cond) return;
                                // else return;
                                return common.moveLocation(node, {
                                    type: Syntax.ReturnStatement,
                                    argument: common.moveLocation(node, {
                                        type: Syntax.SequenceExpression,
                                        expressions: [node.test, common.SpecialNode.generateUndefined() ]
                                    })
                                });
                            }
                            consequent = node.consequent.argument || common.SpecialNode.generateUndefined();
                            alternate = node.alternate.argument || common.SpecialNode.generateUndefined();

                            return common.moveLocation(node, {
                                type: Syntax.ReturnStatement,
                                argument: common.moveLocation(node, {
                                    type: Syntax.ConditionalExpression,
                                    test: node.test,
                                    consequent: consequent,
                                    alternate: alternate
                                })
                            });
                        }
                        if (node.consequent.type === Syntax.ThrowStatement && node.alternate.type === Syntax.ThrowStatement) {
                            // pattern:
                            //   if (cond) throw a;
                            //   else throw b;
                            modified = true;
                            return common.moveLocation(node, {
                                type: Syntax.ThrowStatement,
                                argument: common.moveLocation(node, {
                                    type: Syntax.ConditionalExpression,
                                    test: node.test,
                                    consequent: node.consequent.argument,
                                    alternate: node.alternate.argument
                                })
                            });
                        }
                    } else {
                        if (node.consequent.type === Syntax.ExpressionStatement) {
                            // ok, we can reconstruct this to LogicalExpression
                            modified = true;
                            return common.moveLocation(node, {
                                type: Syntax.ExpressionStatement,
                                expression: common.moveLocation(node, {
                                    type: Syntax.LogicalExpression,
                                    operator: '&&',
                                    left: node.test,
                                    right: node.consequent.expression
                                })
                            });
                        } else if (node.consequent.type === Syntax.EmptyStatement) {
                            // ok, we can reconstruct this to expression statement
                            modified = true;
                            return common.moveLocation(node, {
                                type: Syntax.ExpressionStatement,
                                expression: node.test
                            });
                        }
                    }
                }
            }
        });

        return {
            result: result,
            modified: modified
        };
    }

    transformBranchToExpression.passName = Name;
    module.exports = transformBranchToExpression;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
