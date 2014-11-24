#!/usr/bin/env node
/*
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>

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

/*jslint node:true */

var fs = require('fs'),
    path = require('path'),
    root = path.join(path.dirname(fs.realpathSync(__filename)), '..'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    estraverse = require('estraverse'),
    optimist = require('optimist'),
    esmangle,
    common,
    argv,
    post,
    passes,
    multipleFilesSpecified;

Error.stackTraceLimit = Infinity;

esmangle = require(root);
common = require(path.join(root, 'lib', 'common'));

argv = optimist.usage("Usage: $0 file")
    .describe('help', 'show help')
    .boolean('source-map')
    .describe('source-map', 'dump source-map')
    .boolean('preserve-completion-value')
    .describe('preserve-completion-value', 'preserve completion values if needed')
    .boolean('preserve-license-comment')
    .describe('preserve-license-comment', 'preserve comments with @license, @preserve. But these comment may be lost if attached node is transformed or a comment isn\'t attached to any statement.')
    .boolean('propagate-license-comment-to-header')
    .describe('propagate-license-comment-to-header', 'preserve comments with @license, @preserve. But these comment may be propagated to the script header.')
    .string('o')
    .alias('o', 'output')
    .describe('o', 'output file')
    .wrap(80)
    .argv;

multipleFilesSpecified = (argv.output && Array.isArray(argv.output) && argv.output.length > 1);

if (argv.help || multipleFilesSpecified) {
    optimist.showHelp();
    if (multipleFilesSpecified) {
        console.error('multiple output files are specified');
    }

    if (argv.help) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

if (argv['preserve-license-comment'] && argv['propagate-license-comment-to-header']) {
    console.error('cannot specify --preserve-license-comment and --propagate-license-comment-to-header both');
    process.exit(1);
}

function output(code) {
    if (argv.output) {
        fs.writeFileSync(argv.output, code);
    } else {
        console.log(code);
    }
}

function compile(content, filename) {
    var tree, licenses, generated, header, preserveLicenseComment, propagateLicenseComment;

    preserveLicenseComment = argv['preserve-license-comment'];
    propagateLicenseComment = argv['propagate-license-comment-to-header'];

    tree = esprima.parse(content, {
        loc: true,
        range: true,
        raw: true,
        tokens: true,
        comment: preserveLicenseComment || propagateLicenseComment
    });

    if (preserveLicenseComment || propagateLicenseComment) {
        licenses = tree.comments.filter(function (comment) {
            return /@(?:license|preserve)/i.test(comment.value);
        });
    }

    if (preserveLicenseComment) {
        // Attach comments to the tree.
        estraverse.attachComments(tree, licenses, tree.tokens);
    }

    tree = esmangle.optimize(tree, null, {
        destructive: true,
        directive: true,
        preserveCompletionValue: argv['preserve-completion-value']
    });
    tree = esmangle.mangle(tree, {
        destructive: true
    });

    if (propagateLicenseComment) {
        tree.leadingComments = licenses;
    }

    formatOption = common.deepCopy(escodegen.FORMAT_MINIFY);
    formatOption.indent.adjustMultilineComment = true;

    return escodegen.generate(tree, {
        format: formatOption,
        sourceMap: argv['source-map'] && filename,
        directive: true,
        comment: preserveLicenseComment || propagateLicenseComment
    });
}

if (argv._.length === 0) {
    // no file is specified, so use stdin as input
    (function () {
        var code = '';
        process.stdin.on('data', function (data) {
            code += data;
        });
        process.stdin.on('end', function (err) {
            output(compile(code, 'stdin'));
        });
        process.stdin.resume();
    }());
} else {
    argv._.forEach(function (filename) {
        var content, result;
        content = fs.readFileSync(filename, 'utf-8');
        result = compile(content, filename);
        output(result);
    });
}
/* vim: set sw=4 ts=4 et tw=80 : */
