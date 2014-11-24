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

    var Name, Syntax, common, evaluator, modified;

    Name = 'tree-based-constant-folding';
    common = require('../common');
    evaluator = require('../evaluator');
    Syntax = common.Syntax;


    function isModifiedConstant(node) {
        // consider
        //   (undefined) `void 0`
        //   (negative value) `-1`,
        //   (NaN) `0/0`
        if (common.SpecialNode.isUndefined(node)) {
            return false;
        }
        if (common.SpecialNode.isNegative(node)) {
            return false;
        }
        if (common.SpecialNode.isNaN(node)) {
            return false;
        }
        return evaluator.constant.isConstant(node, false);
    }

    function isFoldableConditional(node) {
        if (node.type !== Syntax.ConditionalExpression) {
            return false;
        }
        return evaluator.constant.isConstant(node.consequent) || evaluator.constant.isConstant(node.alternate);
    }

    function foldConditional(node) {
        var binary, unary, operator, left, right;
        switch (node.type) {
        case Syntax.BinaryExpression:
            if (node.operator === 'in' || node.operator === 'instanceof') {
                // cannot fold this
                return node;
            }

            if (evaluator.constant.isConstant(node.left) && isFoldableConditional(node.right)) {
                modified = true;
                binary = node;
                operator = binary.operator;
                left = evaluator.constant.evaluate(binary.left);

                node = node.right;
                if (evaluator.constant.isConstant(node.consequent)) {
                    node.consequent = common.SpecialNode.generateFromValue(evaluator.constant.doBinary(operator, left, evaluator.constant.evaluate(node.consequent)));
                } else {
                    // cannot fold left
                    binary.right = node.consequent;
                    node.consequent = binary;
                }
                if (evaluator.constant.isConstant(node.alternate)) {
                    node.alternate = common.SpecialNode.generateFromValue(evaluator.constant.doBinary(operator, left, evaluator.constant.evaluate(node.alternate)));
                } else {
                    // cannot fold right
                    binary.right = node.alternate;
                    node.alternate = binary;
                }
            } else if (evaluator.constant.isConstant(node.right) && isFoldableConditional(node.left)) {
                modified = true;
                binary = node;
                operator = binary.operator;
                right = evaluator.constant.evaluate(binary.right);

                node = node.left;
                if (evaluator.constant.isConstant(node.consequent)) {
                    node.consequent = common.SpecialNode.generateFromValue(evaluator.constant.doBinary(operator, evaluator.constant.evaluate(node.consequent), right));
                } else {
                    // cannot fold left
                    binary.left = node.consequent;
                    node.consequent = binary;
                }
                if (evaluator.constant.isConstant(node.alternate)) {
                    node.alternate = common.SpecialNode.generateFromValue(evaluator.constant.doBinary(operator, evaluator.constant.evaluate(node.alternate), right));
                } else {
                    // cannot fold right
                    binary.left = node.alternate;
                    node.alternate = binary;
                }
            }
            break;

        case Syntax.LogicalExpression:
            break;

        case Syntax.UnaryExpression:
            if (isFoldableConditional(node.argument)) {
                modified = true;
                unary = node;
                operator = unary.operator;
                node = unary.argument;
                if (evaluator.constant.isConstant(node.consequent)) {
                    node.consequent = common.SpecialNode.generateFromValue(evaluator.constant.doUnary(operator, evaluator.constant.evaluate(node.consequent)));
                } else {
                    // cannot fold left
                    unary.argument = node.consequent;
                    node.consequent = unary;
                }
                if (evaluator.constant.isConstant(node.alternate)) {
                    node.alternate = common.SpecialNode.generateFromValue(evaluator.constant.doUnary(operator, evaluator.constant.evaluate(node.alternate)));
                } else {
                    // cannot fold right
                    unary.argument = node.alternate;
                    node.alternate = unary;
                }
            }
            break;
        }

        return node;
    }

    function treeBasedConstantFolding(tree, options) {
        var result;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;

        result = common.replace(result, {
            leave: function leave(node) {
                var con, alt;
                switch (node.type) {
                case Syntax.BinaryExpression:
                case Syntax.LogicalExpression:
                case Syntax.UnaryExpression:
                    if (isModifiedConstant(node)) {
                        modified = true;
                        return common.moveLocation(node, common.SpecialNode.generateFromValue(evaluator.constant.evaluate(node)));
                    }
                    return foldConditional(node);

                case Syntax.ConditionalExpression:
                    if (evaluator.constant.isConstant(node.consequent) && evaluator.constant.isConstant(node.alternate)) {
                        con = evaluator.constant.evaluate(node.consequent);
                        alt = evaluator.constant.evaluate(node.alternate);
                        if (common.sameValue(con, alt)) {
                            modified = true;
                            return common.moveLocation(node, {
                                type: Syntax.SequenceExpression,
                                expressions: [
                                    node.test,
                                    common.SpecialNode.generateFromValue(con)
                                ]
                            });
                        }
                    }
                    break;
                }
            }
        });

        return {
            result: result,
            modified: modified
        };
    }

    treeBasedConstantFolding.passName = Name;
    module.exports = treeBasedConstantFolding;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
