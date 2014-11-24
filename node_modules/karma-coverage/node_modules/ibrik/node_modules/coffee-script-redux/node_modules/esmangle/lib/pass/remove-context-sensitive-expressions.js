/*
  Copyright (C) 2012 Mihai Bazon <mihai.bazon@gmail.com>
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

    Name = 'remove-context-sensitive-expressions';
    common = require('../common');
    evaluator = require('../evaluator');
    escope = require('escope');
    Syntax = common.Syntax;


    function Transformer(trans, booleanFunction, voidFunction, scope) {
        this.transform = trans;
        this.booleanFunction = booleanFunction;
        this.voidFunction = voidFunction;
        this.scope = scope;
    }

    Transformer.prototype.booleanTransformation = function (expr) {
        var consequent;
        do {
            if (expr.type === Syntax.UnaryExpression) {
                if (expr.operator === '!' &&
                    expr.argument.type === Syntax.UnaryExpression && expr.argument.operator === '!') {
                    modified = true;
                    expr = expr.argument.argument;
                    continue;
                }
            } else if (expr.type === Syntax.LogicalExpression) {
                if (expr.left.type === Syntax.UnaryExpression && expr.left.operator === '!' &&
                    expr.right.type === Syntax.UnaryExpression && expr.right.operator === '!') {
                    // !cond && !ok() => !(cond || ok())
                    // this introduces more optimizations
                    modified = true;
                    expr.left = expr.left.argument;
                    expr.right = expr.right.argument;
                    expr.operator = (expr.operator === '||') ? '&&' : '||';
                    expr = common.moveLocation(expr, {
                        type: Syntax.UnaryExpression,
                        operator: '!',
                        argument: expr
                    });
                    continue;
                }
            } else if (expr.type === Syntax.ConditionalExpression) {
                if (expr.test.type === Syntax.UnaryExpression && expr.test.operator === '!') {
                    modified = true;
                    expr.test = expr.test.argument;
                    consequent = expr.consequent;
                    expr.consequent = expr.alternate;
                    expr.alternate = consequent;
                }
            }
            break;
        } while (true);
        return expr;
    };

    Transformer.prototype.voidTransformation = function (expr) {
        var leftHasSideEffect, rightHasSideEffect;
        do {
            expr = this.booleanTransformation(expr);
            if (expr.type === Syntax.UnaryExpression) {
                if (expr.operator === '!' || expr.operator === 'void') {
                    modified = true;
                    expr = expr.argument;
                    continue;
                }
            } else if (expr.type === Syntax.LogicalExpression) {
                if (expr.left.type === Syntax.UnaryExpression && expr.left.operator === '!') {
                    // !cond && ok() => cond || ok()
                    modified = true;
                    expr.left = expr.left.argument;
                    expr.operator = (expr.operator === '||') ? '&&' : '||';
                }
            } else if (expr.type === Syntax.ConditionalExpression) {
                // a?0:1 => a
                // a?0:b => a||b
                // a?b:0 => a&&b
                leftHasSideEffect = evaluator.hasSideEffect(expr.consequent, this.scope);
                rightHasSideEffect = evaluator.hasSideEffect(expr.alternate, this.scope);
                if (!leftHasSideEffect && !rightHasSideEffect) {
                    modified = true;
                    expr = expr.test;
                } else if (!leftHasSideEffect) {
                    modified = true;
                    expr = common.moveLocation(expr, {
                        type: Syntax.LogicalExpression,
                        operator: '||',
                        left: expr.test,
                        right: expr.alternate
                    });
                } else if (!rightHasSideEffect) {
                    modified = true;
                    expr = common.moveLocation(expr, {
                        type: Syntax.LogicalExpression,
                        operator: '&&',
                        left: expr.test,
                        right: expr.consequent
                    });
                }
            }
            break;
        } while (true);
        return expr;
    };

    Transformer.prototype.apply = function (expr) {
        var prev;
        do {
            prev = expr;
            expr = this.transform(expr);
            if (prev !== expr) {
                continue;
            }

            if (expr.type === Syntax.LogicalExpression) {
                expr.left = this.booleanFunction(expr.left, this.scope);
                expr.right = this.voidFunction(expr.right, this.scope);
            } else if (expr.type === Syntax.ConditionalExpression) {
                expr.consequent = this.voidFunction(expr.consequent, this.scope);
                expr.alternate = this.voidFunction(expr.alternate, this.scope);
            } else if (expr.type === Syntax.SequenceExpression) {
                expr.expressions[expr.expressions.length - 1] = this.voidFunction(common.Array.last(expr.expressions), this.scope);
            }
            break;
        } while (true);
        return expr;
    };

    function voidContext(expr, scope) {
        var trans = new Transformer(Transformer.prototype.voidTransformation, booleanContext, voidContext, scope);
        return trans.apply(expr);
    }

    function booleanContext(expr, scope) {
        var trans = new Transformer(Transformer.prototype.booleanTransformation, booleanContext, booleanContext, scope);
        return trans.apply(expr);
    }

    function removeContextSensitiveExpressions(tree, options) {
        var result, stackCount, preserveCompletionValue, scope, manager;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;
        stackCount = 0;
        preserveCompletionValue = options.get('preserveCompletionValue', { pathName: Name });

        scope = null;
        manager = escope.analyze(result, { directive: true });
        manager.attach();

        result = common.replace(result, {
            enter: function enter(node) {
                var i, iz;

                scope = manager.acquire(node) || scope;

                if (node.type === Syntax.FunctionExpression || node.type === Syntax.FunctionDeclaration) {
                    ++stackCount;
                }

                switch (node.type) {
                case Syntax.AssignmentExpression:
                    break;

                case Syntax.ArrayExpression:
                    break;

                case Syntax.BlockStatement:
                    break;

                case Syntax.BinaryExpression:
                    break;

                case Syntax.BreakStatement:
                    break;

                case Syntax.CallExpression:
                    break;

                case Syntax.CatchClause:
                    break;

                case Syntax.ConditionalExpression:
                    node.test = booleanContext(node.test, scope);
                    break;

                case Syntax.ContinueStatement:
                    break;

                case Syntax.DoWhileStatement:
                    node.test = booleanContext(node.test, scope);
                    break;

                case Syntax.DebuggerStatement:
                    break;

                case Syntax.EmptyStatement:
                    break;

                case Syntax.ExpressionStatement:
                    if (!preserveCompletionValue || stackCount !== 0) {
                        // not global context
                        node.expression = voidContext(node.expression, scope);
                    }
                    break;

                case Syntax.FunctionExpression:
                    break;

                case Syntax.ForInStatement:
                    break;

                case Syntax.FunctionDeclaration:
                    break;

                case Syntax.ForStatement:
                    if (node.init && node.init.type !== Syntax.VariableDeclaration) {
                        node.init = voidContext(node.init, scope);
                    }
                    if (node.test) {
                        node.test = booleanContext(node.test, scope);
                    }
                    if (node.update) {
                        node.update = voidContext(node.update, scope);
                    }
                    break;

                case Syntax.Identifier:
                    break;

                case Syntax.IfStatement:
                    node.test = booleanContext(node.test, scope);
                    break;

                case Syntax.Literal:
                    break;

                case Syntax.LabeledStatement:
                    break;

                case Syntax.LogicalExpression:
                    break;

                case Syntax.MemberExpression:
                    break;

                case Syntax.NewExpression:
                    break;

                case Syntax.ObjectExpression:
                    break;

                case Syntax.Program:
                    break;

                case Syntax.Property:
                    break;

                case Syntax.ReturnStatement:
                    break;

                case Syntax.SequenceExpression:
                    for (i = 0, iz = node.expressions.length - 1; i < iz; ++i) {
                        node.expressions[i] = voidContext(node.expressions[i], scope);
                    }
                    break;

                case Syntax.SwitchStatement:
                    break;

                case Syntax.SwitchCase:
                    break;

                case Syntax.ThisExpression:
                    break;

                case Syntax.ThrowStatement:
                    break;

                case Syntax.TryStatement:
                    break;

                case Syntax.UnaryExpression:
                    if (node.operator === '!') {
                        node.argument = booleanContext(node.argument, scope);
                    } else if (node.operator === 'void') {
                        node.argument = voidContext(node.argument, scope);
                    }
                    break;

                case Syntax.UpdateExpression:
                    break;

                case Syntax.VariableDeclaration:
                    break;

                case Syntax.VariableDeclarator:
                    break;

                case Syntax.WhileStatement:
                    node.test = booleanContext(node.test, scope);
                    break;

                case Syntax.WithStatement:
                    break;

                }
            },

            leave: function leave(node) {
                scope = manager.release(node) || scope;
                if (node.type === Syntax.FunctionExpression || node.type === Syntax.FunctionDeclaration) {
                    --stackCount;
                }
            }
        });

        manager.detach();

        return {
            result: result,
            modified: modified
        };
    }

    removeContextSensitiveExpressions.passName = Name;
    module.exports = removeContextSensitiveExpressions;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
