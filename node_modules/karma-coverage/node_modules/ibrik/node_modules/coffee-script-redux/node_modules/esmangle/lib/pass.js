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
/*global exports:true*/

(function () {
    'use strict';

    var query, Registry, pass, post, common;

    common = require('./common');
    query = require('./query');

    Registry = {};
    Registry.__direct = {};

    // initialization

    function initialize(kind, passes) {
        var i, iz, pass;
        Registry[kind] = {};
        for (i = 0, iz = passes.length; i < iz; ++i) {
            pass = passes[i];
            common.assert(Registry[kind][pass.passName] == null, 'don\'t create duplicate pass names');
            Registry[kind][pass.passName] = pass;
        }
        common.assert(Registry.__direct[pass.passName] == null, 'don\'t create duplicate pass names');
        Registry.__direct[pass.passName] = pass;
    }

    pass = [
        require('./pass/hoist-variable-to-arguments'),
        require('./pass/transform-dynamic-to-static-property-access'),
        require('./pass/transform-dynamic-to-static-property-definition'),
        require('./pass/transform-immediate-function-call'),
        require('./pass/transform-logical-association'),
        require('./pass/reordering-function-declarations'),
        require('./pass/remove-unused-label'),
        require('./pass/remove-empty-statement'),
        require('./pass/remove-wasted-blocks'),
        require('./pass/transform-to-compound-assignment'),
        require('./pass/transform-to-sequence-expression'),
        require('./pass/transform-branch-to-expression'),
        require('./pass/transform-typeof-undefined'),
        require('./pass/reduce-sequence-expression'),
        require('./pass/reduce-branch-jump'),
        require('./pass/reduce-multiple-if-statements'),
        require('./pass/dead-code-elimination'),
        require('./pass/remove-side-effect-free-expressions'),
        require('./pass/remove-context-sensitive-expressions'),
        require('./pass/tree-based-constant-folding'),
        require('./pass/concatenate-variable-definition'),
        require('./pass/drop-variable-definition'),
        require('./pass/remove-unreachable-branch'),
        require('./pass/eliminate-duplicate-function-declarations')
    ];

    post = [
        require('./post/transform-static-to-dynamic-property-access'),
        require('./post/transform-infinity'),
        require('./post/rewrite-boolean'),
        require('./post/rewrite-conditional-expression'),
        require('./post/omit-parens-in-void-context-iife')
    ];

    initialize('pass', pass);
    initialize('post', post);

    function passRequire(name) {
        if (common.Object.has(Registry.__direct, name)) {
            return Registry.__direct[name];
        }
        return query.get(Registry, name.split('/'));
    }

    exports.require = passRequire;
    exports.Registry = Registry;

    // CAUTION:(Constellation)
    // This API would be cahnged
    exports.__defaultPipeline = [
        pass,
        {
            once: true,
            pass: post
        }
    ];
}());
