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

    Name = 'remove-wasted-blocks';
    common = require('../common');
    Syntax = common.Syntax;

    function flattenBlockStatement(body) {
        var i, iz, j, jz, result, stmt, inner, ok;
        result = [];
        for (i = 0, iz = body.length; i < iz; ++i) {
            stmt = body[i];
            if (stmt.type === Syntax.BlockStatement) {
                ok = true;
                for (j = 0, jz = stmt.body.length; j < jz; ++j) {
                    inner = stmt.body[j];
                    if (common.isScopedDeclaration(inner)) {
                        // we cannot remove this block
                        ok = false;
                    }
                }
                if (ok) {
                    modified = true;
                    result = result.concat(stmt.body);
                } else {
                    result.push(stmt);
                }
            } else {
                result.push(stmt);
            }
        }
        return result;
    }

    function removeWastedBlocks(tree, options) {
        var result;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;

        result = common.replace(result, {
            leave: function leave(node, parent) {
                var i, iz, stmt;
                // remove nested blocks
                if (node.type === Syntax.BlockStatement || node.type === Syntax.Program) {
                    for (i = 0, iz = node.body.length; i < iz; ++i) {
                        stmt = node.body[i];
                        if (stmt.type === Syntax.BlockStatement) {
                            node.body = flattenBlockStatement(node.body);
                            break;
                        }
                    }
                }

                // These type needs BlockStatement
                if (parent.type === Syntax.FunctionDeclaration || parent.type === Syntax.FunctionExpression || parent.type === Syntax.TryStatement || parent.type === Syntax.CatchClause) {
                    return;
                }

                while (node.type === Syntax.BlockStatement && node.body.length === 1 && !common.isScopedDeclaration(node.body[0])) {
                    modified = true;
                    node = node.body[0];
                }
                // empty body
                if (node.type === Syntax.BlockStatement && node.body.length === 0) {
                    modified = true;
                    return {
                        type: Syntax.EmptyStatement
                    };
                }
                return node;
            }
        });

        return {
            result: result,
            modified: modified
        };
    }

    removeWastedBlocks.passName = Name;
    module.exports = removeWastedBlocks;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
