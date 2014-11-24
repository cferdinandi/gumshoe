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

    var Name, Syntax, common;

    Name = 'annotate-directive';
    common = require('./common');
    Syntax = common.Syntax;

    function isDirective(stmt) {
        var expr;
        if (stmt.type === Syntax.ExpressionStatement) {
            expr = stmt.expression;
            if (expr.type === Syntax.Literal && typeof expr.value === 'string') {
                return true;
            }
        }
        return false;
    }

    function escapeAllowedCharacter(ch, next) {
        var code = ch.charCodeAt(0), hex = code.toString(16), result = '\\';

        switch (ch) {
        case '\b':
            result += 'b';
            break;
        case '\f':
            result += 'f';
            break;
        case '\t':
            result += 't';
            break;
        default:
            if (code > 0xff) {
                result += 'u' + '0000'.slice(hex.length) + hex;
            } else if (ch === '\u0000' && '0123456789'.indexOf(next) < 0) {
                result += '0';
            } else if (ch === '\v') {
                result += 'v';
            } else {
                result += 'x' + '00'.slice(hex.length) + hex;
            }
            break;
        }

        return result;
    }

    function escapeDisallowedCharacter(ch) {
        var result = '\\';
        switch (ch) {
        case '\\':
            result += '\\';
            break;
        case '\n':
            result += 'n';
            break;
        case '\r':
            result += 'r';
            break;
        case '\u2028':
            result += 'u2028';
            break;
        case '\u2029':
            result += 'u2029';
            break;
        default:
            throw new Error('Incorrectly classified character');
        }

        return result;
    }

    function escapeString(str) {
        var result = '', i, len, ch;

        if (typeof str[0] === 'undefined') {
            str = common.stringToArray(str);
        }

        for (i = 0, len = str.length; i < len; i += 1) {
            ch = str[i];
            if (ch === '\'') {
                result += '\\\'';
                continue;
            } else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
                result += escapeDisallowedCharacter(ch);
                continue;
            } else if (!(ch >= ' ' && ch <= '~')) {
                result += escapeAllowedCharacter(ch, str[i + 1]);
                continue;
            }
            result += ch;
        }

        return result;
    }

    function annotateDirective(tree, options) {
        var result;

        result = options.get('destructive', { pathName: Name }) ? tree : common.deepCopy(tree);

        common.traverse(result, {
            enter: function enter(node, parent) {
                var stmt, i, iz;

                if (!(node.type === Syntax.Program ||
                        (node.type === Syntax.BlockStatement && (parent.type === Syntax.FunctionExpression || parent.type === Syntax.FunctionDeclaration)))) {
                    return;
                }

                for (i = 0, iz = node.body.length; i < iz; ++i) {
                    stmt = node.body[i];
                    if (isDirective(stmt)) {
                        stmt.type = Syntax.DirectiveStatement;
                        if (stmt.expression.raw) {
                            stmt.directive = stmt.expression.raw.substring(1, stmt.expression.raw.length - 1);
                            stmt.value = stmt.expression.value;
                            stmt.raw = stmt.expression.raw;
                        } else {
                            stmt.directive = escapeString(stmt.expression.value);
                            stmt.value = stmt.expression.value;
                            stmt.raw = '\'' + stmt.directive + '\'';
                        }
                        delete stmt.expression;
                    } else {
                        return;
                    }
                }
            }
        });

        return result;
    }

    annotateDirective.passName = Name;
    module.exports = annotateDirective;
}());
/* vim: set sw=4 ts=4 et tw=80 : */
