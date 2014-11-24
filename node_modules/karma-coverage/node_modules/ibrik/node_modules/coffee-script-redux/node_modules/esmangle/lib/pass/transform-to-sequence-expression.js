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

    Name = 'transform-to-sequence-expression';
    common = require('../common');
    Syntax = common.Syntax;

    function transform(node) {
        var i, iz, expressions, stmt, prev, body;

        function constructSeq(expressions, stmt) {
            var seq;

            if (expressions.length !== 1) {
                modified = true;
                seq = {
                    type: Syntax.SequenceExpression,
                    expressions: expressions
                };

                if (stmt.type === Syntax.ExpressionStatement) {
                    stmt.expression = seq;
                } else {
                    stmt.argument = seq;
                }
            }

            return stmt;
        }

        body = [];
        expressions = [];

        for (i = 0, iz = node.body.length; i < iz; ++i) {
            prev = stmt;
            stmt = node.body[i];

            if (stmt.type === Syntax.ExpressionStatement) {
                expressions.push(stmt.expression);
            } else if ((stmt.type === Syntax.ReturnStatement && stmt.argument != null) || stmt.type === Syntax.ThrowStatement) {
                // Not distinguishing between null or undefined in argument
                expressions.push(stmt.argument);
                body.push(constructSeq(expressions, stmt));
                expressions = [];
            } else if (stmt.type === Syntax.ForStatement && (!stmt.init || stmt.init.type !== Syntax.VariableDeclaration)) {
                // insert expressions to for (<init>;;);
                if (expressions.length) {
                    modified = true;
                    if (stmt.init) {
                        expressions.push(stmt.init);
                    }
                    if (expressions.length === 1) {
                        stmt.init = expressions[0];
                    } else {
                        stmt.init = {
                            type: Syntax.SequenceExpression,
                            expressions: expressions
                        };
                    }
                    expressions = [];
                }
                body.push(stmt);
            } else if (stmt.type === Syntax.IfStatement) {
                if (expressions.length) {
                    modified = true;
                    expressions.push(stmt.test);
                    stmt.test = {
                        type: Syntax.SequenceExpression,
                        expressions: expressions
                    };
                    expressions = [];
                }
                body.push(stmt);
            } else {
                if (expressions.length) {
                    body.push(constructSeq(expressions, prev));
                    expressions = [];
                }
                body.push(stmt);
            }
        }

        if (expressions.length) {
            body.push(constructSeq(expressions, stmt));
        }

        node.body = body;
    }

    function transformToSequenceExpression(tree, options) {
        var result;

        modified = false;
        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);

        common.traverse(result, {
            enter: function enter(node) {
                switch (node.type) {
                case Syntax.BlockStatement:
                case Syntax.Program:
                    transform(node);
                    break;
                }
            }
        });

        return {
            result: result,
            modified: modified
        };
    }

    transformToSequenceExpression.passName = Name;
    module.exports = transformToSequenceExpression;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
