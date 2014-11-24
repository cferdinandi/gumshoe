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

    Name = 'hoist-variable-to-arguments';
    escope = require('escope');
    common = require('../common');

    Syntax = common.Syntax;

    function hoist(callee) {
        function hoisting(ident) {
            var hoisted, i, iz;
            hoisted = false;
            for (i = 0, iz = callee.params.length; i < iz; ++i) {
                if (ident.name === callee.params[i].name) {
                    // already hoisted name
                    hoisted = true;
                    break;
                }
            }
            if (!hoisted) {
                callee.params.push(ident);
            }
        }

        callee.body = common.replace(callee.body, {
            enter: function (node, parent) {
                var i, iz, expressions, declaration, forstmt, expr;

                if (node.type === Syntax.FunctionExpression || node.type === Syntax.FunctionDeclaration) {
                    this.skip();
                    return;
                }

                if (node.type === Syntax.VariableDeclaration && node.kind === 'var') {
                    // We should consider following pattern
                    //
                    //   for (var i = 0;;);
                    // or
                    //   for (var i in []);
                    // specialize pass for `for-in`
                    if (parent.type === Syntax.ForInStatement) {
                        common.assert(node.declarations.length === 1, 'for-in declaration length should be 1');
                        declaration = node.declarations[0];
                        // not optimize
                        //   for (var i = 1 in []);
                        if (declaration.init) {
                            return;
                        }

                        // TODO(Constellation)
                        // in the future, destructuring pattern may come
                        if (declaration.id.type !== Syntax.Identifier) {
                            return;
                        }
                        hoisting(declaration.id);
                        modified = true;
                        return declaration.id;
                    }

                    forstmt = parent.type === Syntax.ForStatement;

                    expressions = [];
                    for (i = 0, iz = node.declarations.length; i < iz; ++i) {
                        declaration = node.declarations[i];

                        // TODO(Constellation)
                        // in the future, destructuring pattern may come
                        if (declaration.id.type !== Syntax.Identifier) {
                            return;
                        }
                        hoisting(declaration.id);
                        if (declaration.init) {
                            expressions.push(common.moveLocation(declaration, {
                                type: Syntax.AssignmentExpression,
                                operator: '=',
                                left: declaration.id,
                                right: declaration.init
                            }));
                        }
                    }

                    modified = true;
                    if (expressions.length === 0) {
                        if (forstmt) {
                            return null;
                        }
                        return common.moveLocation(node, {
                            type: Syntax.EmptyStatement
                        });
                    }

                    if (expressions.length === 1) {
                        expr = expressions[0];
                    } else {
                        expr = common.moveLocation(node, {
                            type: Syntax.SequenceExpression,
                            expressions: expressions
                        });
                    }

                    if (forstmt) {
                        return expr;
                    }

                    return common.moveLocation(node, {
                        type: Syntax.ExpressionStatement,
                        expression: expr
                    });
                }
            }
        });
    }

    function hoistVariableToArguments(tree, options) {
        var result, scope, manager;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;
        scope = null;

        manager = escope.analyze(result, { directive: true });
        manager.attach();

        common.traverse(result, {
            enter: function enter(node) {
                var callee;
                if (node.type === Syntax.CallExpression || node.type === Syntax.NewExpression) {
                    callee = node.callee;
                    if (callee.type === Syntax.FunctionExpression && !callee.id) {
                        if (callee.params.length === node['arguments'].length) {
                            scope = manager.acquire(callee);
                            if (!scope.isArgumentsMaterialized() && (node.type !== Syntax.NewExpression || !scope.isThisMaterialized())) {
                                // ok, arguments is not used
                                hoist(callee);
                            }
                        }
                    }
                }
            }
        });

        manager.detach();

        return {
            result: result,
            modified: modified
        };
    }

    hoistVariableToArguments.passName = Name;
    module.exports = hoistVariableToArguments;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
