#  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
#
#  Redistribution and use in source and binary forms, with or without
#  modification, are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright
#      notice, this list of conditions and the following disclaimer.
#    * Redistributions in binary form must reproduce the above copyright
#      notice, this list of conditions and the following disclaimer in the
#      documentation and/or other materials provided with the distribution.
#
#  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
#  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
#  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
#  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
#  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
#  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
#  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

fs = require 'fs'
path = require 'path'
child_process = require 'child_process'
root = path.join __dirname, '..'
coffee = require 'coffee-script-redux'
compiler = path.join(root, 'node_modules', '.bin', 'coffee')

libdir = path.join root, '' + process.argv[2]
srcdir = path.join root, '' + process.argv[3]
watchers = []

if not fs.watch
    console.error 'fs.watch is not provided'
    process.exit 1

timeLog = (message) ->
    console.log "#{(new Date).toLocaleTimeString()} - #{message}"

compile = (src, dst) ->
    child_process.exec "#{compiler} -j < #{JSON.stringify src} > #{JSON.stringify dst}", (err) ->
        timeLog "compiled #{path.relative root, src}"

fs.mkdir libdir, ->
    fs.readdir srcdir, (err, files) ->
        for file in files
            do ->
                src = path.join srcdir, file
                dst = path.join libdir, "#{path.basename file, '.coffee'}.js"
                compile src, dst

        refresh = ->
            console.log 'watch', srcdir
            watcher.close() for watcher in watchers
            fs.readdir srcdir, (err, files) ->
                console.log files
                for file in files
                    do ->
                        src = path.join srcdir, file
                        dst = path.join libdir, "#{path.basename file, '.coffee'}.js"
                        watcher = fs.watch src, (event, filename) ->
                            console.log 'starting...', event
                            if event is 'change'
                                compile src, dst
                        watchers.push watcher

        # notify directory file list change
        # fs.watch srcdir, (event, filename) ->
        #     console.log event
        #     do refresh

        do refresh

# vim: set sw=4 ts=4 et tw=80 :
