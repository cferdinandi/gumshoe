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
/*global module:true, require:true*/
(function () {
    'use strict';

    var Name, Syntax, common, modified;

    Name = 'concatenate-variable-definition';

    common = require('../common');
    Syntax = common.Syntax;

    function concatenateVariableDefinition(tree, options) {
        var result;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;

        common.traverse(result, {
            leave: function leave(node) {
                var i, iz, j, jz, stmt, decl, target, body;
                if (node.type !== Syntax.BlockStatement && node.type !== Syntax.Program) {
                    return;
                }

                // concat sequencial variable definition to one
                target = null;
                body = [];

                for (i = 0, iz = node.body.length; i < iz; ++i) {
                    stmt = node.body[i];
                    if (stmt.type === Syntax.VariableDeclaration && stmt.kind === 'var') {
                        if (!target) {
                            target = stmt;
                            body.push(stmt);
                            continue;
                        }

                        modified = true;
                        for (j = 0, jz = stmt.declarations.length; j < jz; ++j) {
                            decl = stmt.declarations[j];
                            target.declarations.push(decl);
                        }
                    } else {
                        target = null;
                        body.push(stmt);
                    }
                }

                node.body = body;
            }
        });

        return {
            result: result,
            modified: modified
        };
    }

    concatenateVariableDefinition.passName = Name;
    module.exports = concatenateVariableDefinition;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
