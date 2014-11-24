/*
  Copyright (C) 2012 Michael Ficarra <esmangle.copyright@michael.ficarra.me>
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

    var Name, Syntax, common;

    Name = 'transform-static-to-dynamic-property-access';
    common = require('../common');
    Syntax = common.Syntax;

    function transformStaticToDynamicPropertyAccess(tree, options) {
        var result, modified;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);
        modified = false;

        common.traverse(result, {
            enter: function enter(node) {
                var property;

                if (node.type !== Syntax.MemberExpression || node.computed || node.property.type !== Syntax.Identifier) {
                    return;
                }

                property = node.property;
                switch (property.name) {
                case 'undefined':
                    modified = true;
                    node.computed = true;
                    node.property = common.moveLocation(property, {
                        type: Syntax.UnaryExpression,
                        operator: 'void',
                        argument: {type: Syntax.Literal, value: 0}
                    });
                    break;
                case 'true':
                case 'false':
                    modified = true;
                    node.computed = true;
                    node.property = common.moveLocation(property, {
                        type: Syntax.Literal,
                        value: property.name === 'true'
                    });
                    break;
                case 'Infinity':
                    modified = true;
                    node.computed = true;
                    node.property = common.moveLocation(property, {
                        type: Syntax.BinaryExpression,
                        operator: '/',
                        left: {type: Syntax.Literal, value: 1},
                        right: {type: Syntax.Literal, value: 0}
                    });
                    break;
                }
            }
        });

        return {
            result: result,
            modified: modified
        };
    }

    transformStaticToDynamicPropertyAccess.passName = Name;
    module.exports = transformStaticToDynamicPropertyAccess;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
