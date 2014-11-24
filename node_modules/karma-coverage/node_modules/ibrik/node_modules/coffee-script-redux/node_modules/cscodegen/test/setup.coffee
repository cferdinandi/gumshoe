util = require 'util'
inspect = (o) -> util.inspect o, no, 2, yes

global[name] = func for name, func of require 'assert'
libDir = if typeof _$jscoverage is 'undefined' then 'lib' else 'instrumented'
{generate: global.generate} = require "../#{libDir}/cscodegen"
global.CS = require 'CoffeeScriptRedux/lib/coffee-script/nodes'

# See http://wiki.ecmascript.org/doku.php?id=harmony:egal
egal = (a, b) ->
  if a is b
    a isnt 0 or 1/a is 1/b
  else
    a isnt a and b isnt b

# A recursive functional equivalence helper; uses egal for testing equivalence.
arrayEgal = (a, b) ->
  if egal a, b then yes
  else if a instanceof Array and b instanceof Array
    return no unless a.length is b.length
    return no for el, idx in a when not arrayEgal el, b[idx]
    yes

global.eq      = (a, b, msg) -> ok egal(a, b), msg ? "#{inspect a} === #{inspect b}"
global.arrayEq = (a, b, msg) -> ok arrayEgal(a,b), msg ? "#{inspect a} === #{inspect b}"
