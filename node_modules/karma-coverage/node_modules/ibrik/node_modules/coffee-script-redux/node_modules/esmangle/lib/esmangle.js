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
/*global exports:true*/

(function () {
    'use strict';

    var esshorten,
        common,
        Options,
        Syntax,
        Pass,
        annotateDirective;

    esshorten = require('esshorten');
    common = require('./common');
    Options = require('./options');
    Pass = require('./pass');
    annotateDirective = require('./annotate-directive');
    Syntax = common.Syntax;

    // recover some broken AST

    function recover(tree, useDirectiveStatement) {
        function trailingIf(node) {
            while (true) {
                switch (node.type) {
                case Syntax.IfStatement:
                    if (!node.alternate) {
                        return true;
                    }
                    node = node.alternate;
                    continue;

                case Syntax.LabeledStatement:
                case Syntax.ForStatement:
                case Syntax.ForInStatement:
                case Syntax.WhileStatement:
                case Syntax.WithStatement:
                    node = node.body;
                    continue;
                }
                return false;
            }
        }

        common.traverse(tree, {
            leave: function leave(node) {
                if (node.type === Syntax.IfStatement && node.alternate) {
                    // force wrap up or not
                    if (node.consequent.type !== Syntax.BlockStatement) {
                        if (trailingIf(node.consequent)) {
                            node.consequent = {
                                type: Syntax.BlockStatement,
                                body: [ node.consequent ]
                            };
                        }
                    }
                }
                if (!useDirectiveStatement && node.type === Syntax.DirectiveStatement) {
                    node.type = Syntax.ExpressionStatement;
                    node.expression = common.moveLocation(node, {
                        type: Syntax.Literal,
                        value: node.value,
                        raw: node.raw
                    });
                    delete node.directive;
                    delete node.value;
                    delete node.raw;
                }
            }
        });

        return tree;
    }

    function iteration(tree, p, options) {
        var i, iz, pass, res, changed, statuses, passes, result;

        function addPass(pass) {
            var name;
            if (typeof pass !== 'function') {
                // automatic lookup pass (esmangle pass format)
                name = Object.keys(pass)[0];
                pass = pass[name];
            }
            if (pass.hasOwnProperty('passName')) {
                name = pass.passName;
            } else {
                name = pass.name;
            }
            passes.push(pass);
            statuses.push(true);
        }

        function fillStatuses(bool) {
            var i, iz;
            for (i = 0, iz = statuses.length; i < iz; ++i) {
                statuses[i] = bool;
            }
        }

        result = (options.get('destructive')) ? tree : common.deepCopy(tree);

        statuses = [];
        passes = [];


        for (i = 0, iz = p.length; i < iz; ++i) {
            addPass(p[i]);
        }

        do {
            changed = false;
            for (i = 0, iz = passes.length; i < iz; ++i) {
                pass = passes[i];
                if (statuses[i]) {
                    res = pass(result, options);
                    if (res.modified) {
                        changed = true;
                        fillStatuses(true);
                    } else {
                        statuses[i] = false;
                    }
                    result = res.result;
                }
            }
        } while (changed);

        return result;
    }

    function optimize(tree, pipeline, options) {
        var i, iz, j, jz, section, pass;

        tree = annotateDirective(tree, new Options({ destructive: false }));

        if (null == pipeline) {
            pipeline = Pass.__defaultPipeline;
        }

        options = new Options(options);

        for (i = 0, iz = pipeline.length; i < iz; ++i) {
            section = pipeline[i];
            // simple iterative pass
            if (common.Array.isArray(section)) {
                tree = iteration(tree, section, options);
            } else if (section.once) {
                pass = section.pass;
                for (j = 0, jz = pass.length; j < jz; ++j) {
                    tree = pass[j](tree, options).result;
                }
            }
        }

        return recover(tree, options.get('directive'));
    }

    exports.version = require('../package.json').version;
    exports.mangle = esshorten.mangle;
    exports.optimize = optimize;
    exports.pass = Pass;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
