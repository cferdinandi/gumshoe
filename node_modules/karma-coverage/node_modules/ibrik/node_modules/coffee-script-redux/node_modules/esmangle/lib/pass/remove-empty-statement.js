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

    Name = 'remove-empty-statement';
    common = require('../common');
    Syntax = common.Syntax;

    function remove(array) {
        var i, iz, node, result;
        result = [];
        for (i = 0, iz = array.length; i < iz; ++i) {
            node = array[i];
            if (node.type === Syntax.EmptyStatement) {
                modified = true;
            } else {
                result.push(node);
            }
        }
        return result;
    }

    function removeAlternate(node) {
        if (node.alternate) {
            if (node.alternate.type === Syntax.EmptyStatement) {
                modified = true;
                node.alternate = null;
            } else if (node.consequent.type === Syntax.EmptyStatement) {
                modified = true;
                node.consequent = node.alternate;
                node.alternate = null;
                node.test = common.moveLocation(node.test, {
                    type: Syntax.UnaryExpression,
                    operator: '!',
                    argument: node.test
                });
            }
        }
    }

    function removeEmptyStatement(tree, options) {
        var result;

        modified = false;
        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);

        common.traverse(result, {
            enter: function enter(node) {
                var clause;
                switch (node.type) {
                case Syntax.BlockStatement:
                case Syntax.Program:
                    node.body = remove(node.body);
                    break;

                case Syntax.SwitchCase:
                    node.consequent = remove(node.consequent);
                    break;

                case Syntax.IfStatement:
                    removeAlternate(node);
                    break;

                // drop unused default block
                case Syntax.SwitchStatement:
                    if (node.cases.length) {
                        clause = common.Array.last(node.cases);
                        if (!clause.test && common.Array.empty(clause.consequent)) {
                            // this is wasted default case
                            modified = true;
                            node.cases.pop();
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

    removeEmptyStatement.passName = Name;
    module.exports = removeEmptyStatement;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
