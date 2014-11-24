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

    var Name, Syntax, Map, common, modified;

    Name = 'eliminate-duplicate-function-declarations';
    common = require('../common');
    Map = require ('../map');

    Syntax = common.Syntax;

    function unique(map, root) {
        return common.replace(root, {
            enter: function (node) {
                var name, info;
                if (node.type === Syntax.FunctionDeclaration) {
                    name = node.id.name;
                    info = map.get(name);
                    --info.count;
                    if (info.count !== 0) {
                        // Duplicate function declaration.
                        modified = true;
                        return common.moveLocation(node, { type: Syntax.EmptyStatement });
                    }
                }

                if (node !== root && node.type === Syntax.BlockStatement) {
                    return this.skip();
                }
            }
        });
    }

    function uniqueInGlobal(map, root) {
        return common.replace(root, {
            enter: function (node) {
                var name, info, first;
                if (node.type === Syntax.FunctionDeclaration) {
                    name = node.id.name;
                    info = map.get(name);
                    first = info.count === info.declarations.length;
                    --info.count;
                    if (info.declarations.length > 1) {
                        if (first) {
                            // replace the first declaration with the last declaration
                            modified = true;
                            return common.Array.last(info.declarations);
                        } else {
                            modified = true;
                            return common.moveLocation(node, { type: Syntax.EmptyStatement });
                        }
                    }
                }

                if (node !== root && node.type === Syntax.BlockStatement) {
                    return this.skip();
                }
            }
        });
    }

    function main(tree, options) {
        var result, stack, functionDepth, globalBlockFound;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;
        functionDepth = 0;
        globalBlockFound = false;

        stack = [ new Map() ];

        result = common.replace(result, {
            enter: function enter(node) {
                var map, name, info;
                if (node.type === Syntax.FunctionDeclaration) {
                    name = node.id.name;
                    map = common.Array.last(stack);
                    if (map.has(name)) {
                        info = map.get(name);
                        info.declarations.push(node);
                        ++info.count;
                    } else {
                        info = {
                            declarations: [ node ],
                            count: 1
                        };
                        map.set(name, info);
                    }
                }

                // To support Block scoped FunctionDeclaration (ES6)
                // Syntax.FunctionExpression and Syntax.FunctionDeclaration also hold block.
                if (node.type === Syntax.BlockStatement) {
                    stack.push(new Map());
                }
                if (node.type === Syntax.FunctionDeclaration || node.type === Syntax.FunctionExpression) {
                    ++functionDepth;
                }
            },
            leave: function leave(node) {
                var map, ret;
                if (node.type === Syntax.BlockStatement) {
                    map = stack.pop();
                    if (functionDepth === 0) {
                        if (map.keys().length !== 0) {
                            globalBlockFound = true;
                        }
                    } else {
                        ret = unique(map, node);
                    }
                }
                if (node.type === Syntax.FunctionDeclaration || node.type === Syntax.FunctionExpression) {
                    --functionDepth;
                }
                return ret;
            }
        });

        // If we had global block that contains function declaration, we
        // suppress this optimization on global code.
        common.assert(stack.length === 1, 'global map remains');
        if (!globalBlockFound) {
            result = uniqueInGlobal(stack[0], result);
        }

        return {
            result: result,
            modified: modified
        };
    }

    main.passName = Name;
    module.exports = main;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
