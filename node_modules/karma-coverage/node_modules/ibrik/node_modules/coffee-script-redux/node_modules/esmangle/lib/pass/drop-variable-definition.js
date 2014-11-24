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

    var Name, Syntax, common, modified, escope, evaluator;

    Name = 'drop-variable-definition';
    common = require('../common');
    escope = require('escope');
    evaluator = require('../evaluator');
    Syntax = common.Syntax;

    function getCandidates(scope) {
        var i, iz, j, jz, identifiers, slots, v;

        if (!scope.candidates) {
            slots = [];
            identifiers = [];
            for (i = 0, iz = scope.variables.length; i < iz; ++i) {
                v = scope.variables[i];
                for (j = 0, jz = v.identifiers.length; j < jz; ++j) {
                    identifiers.push(v.identifiers[j]);
                    slots.push(v);
                }
            }

            scope.candidates = {
                slots: slots,
                identifiers: identifiers
            };
        }

        return scope.candidates;
    }

    function isRemovableDefinition(slot) {
        var i, iz, ref, parent;
        if (slot.identifiers.length !== 1) {
            return false;
        }

        if (slot.references.length === 0) {
            return true;
        }

        for (i = 0, iz = slot.references.length; i < iz; ++i) {
            ref = slot.references[i];
            if (ref.isRead()) {
                return false;
            }
            if (ref.isWrite()) {
                if (!ref.writeExpr) {
                    return false;
                }
                parent = ref.writeExpr.__$parent$__;
                if (!parent) {
                    return false;
                }
                if (parent.type !== Syntax.AssignmentExpression &&
                    parent.type !== Syntax.VariableDeclarator) {
                    return false;
                }
                if (evaluator.hasSideEffect(ref.writeExpr, ref.from)) {
                    return false;
                }
            }
        }

        return true;
    }

    function overrideExpression(from, to) {
        var key;
        for (key in from) {
            delete from[key];
        }
        for (key in to) {
            from[key] = to[key];
        }
        return from;
    }

    function removeDefinition(node, index, slot) {
        var i, iz, ref, parent;

        // remove from declaration list
        node.declarations.splice(index, 1);
        for (i = 0, iz = slot.references.length; i < iz; ++i) {
            ref = slot.references[i];
            common.assert(!ref.isRead());
            if (ref.isWrite()) {
                parent = ref.writeExpr.__$parent$__;
                if (parent.type === Syntax.AssignmentExpression) {
                    overrideExpression(ref.writeExpr.__$parent$__, ref.writeExpr);
                }
            }
        }
    }

    function attachParent(tree) {
        return common.traverse(tree, {
            enter: function (node, parent) {
                node.__$parent$__ = parent;
            }
        });
    }

    function removeParent(tree) {
        return common.traverse(tree, {
            enter: function (node) {
                delete node.__$parent$__;
                delete node.__$escope$__;
            }
        });
    }

    function dropVariableDefinition(tree, options) {
        var result, manager, scope;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;
        scope = null;

        manager = escope.analyze(result, { directive: true });
        manager.attach();
        attachParent(result);

        result = common.replace(result, {
            enter: function enter(node, parent) {
                var i, decl, cand, index, slot, ret;
                ret = node;
                if (scope) {
                    if (scope.variableScope.isStatic()) {
                        cand = getCandidates(scope.variableScope);

                        // remove unused variable
                        if (node.type === Syntax.VariableDeclaration && node.kind === 'var') {
                            i = node.declarations.length;
                            while (i--) {
                                decl = node.declarations[i];
                                index = cand.identifiers.indexOf(decl.id);
                                if (index !== -1) {
                                    slot = cand.slots[index];
                                    if (isRemovableDefinition(slot)) {
                                        // ok, remove this variable
                                        modified = true;
                                        removeDefinition(node, i, slot);
                                        continue;
                                    }
                                }
                            }
                            if (node.declarations.length === 0) {
                                if (parent.type === Syntax.ForStatement) {
                                    ret = null;
                                } else {
                                    ret = common.moveLocation(node, {
                                        type: Syntax.EmptyStatement
                                    });
                                }
                            }
                        }

                        // remove unused function declaration
                        if (node.type === Syntax.FunctionDeclaration) {
                            index = cand.identifiers.indexOf(node.id);
                            if (index !== -1) {
                                slot = cand.slots[index];
                                if (slot.identifiers.length === 1 && slot.references.length === 0) {
                                    // ok, remove this function declaration
                                    modified = true;
                                    ret = common.moveLocation(node, {
                                        type: Syntax.EmptyStatement
                                    });
                                    return ret;
                                }
                            }
                        }
                    }
                }

                scope = manager.acquire(node) || scope;
                return ret;
            },
            leave: function leave(node) {
                scope = manager.release(node) || scope;
            }
        });

        manager.detach();
        removeParent(result);

        return {
            result: result,
            modified: modified
        };
    }

    dropVariableDefinition.passName = Name;
    module.exports = dropVariableDefinition;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
