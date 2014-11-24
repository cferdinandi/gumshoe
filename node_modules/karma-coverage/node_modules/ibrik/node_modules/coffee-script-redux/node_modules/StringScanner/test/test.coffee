StringScanner = require '../lib/StringScanner'
assert = require 'assert'
[eq, ok] = [assert.strictEqual, assert.ok]

arrayEqual = (a, b) ->
  if a is b
    # 0 isnt -0
    a isnt 0 or 1/a is 1/b
  else if a instanceof Array and b instanceof Array
    return no unless a.length is b.length
    return no for el, idx in a when not arrayEqual el, b[idx]
    yes
  else
    # NaN is NaN
    a isnt a and b isnt b

arrayEq = (a, b, msg) -> ok arrayEqual(a, b), msg

test = (feature, fn) -> fn new StringScanner 'abc123 def456'

console.log '\033[0m(' + new Date().toLocaleTimeString() + ') Running tests...\033[0;31m'


test 'StringScanner::bol and StringScanner::beginningOfLine', (ss) ->
	# beginning of string
	eq true , ss.bol()
	eq true , ss.beginningOfLine()
	# neither
	ss.getch()
	eq false, ss.bol()
	eq false, ss.beginningOfLine()
	# beginning of string after returning false
	ss.reset()
	eq true , ss.bol()
	eq true , ss.beginningOfLine()
	# beginning of line
	ss = new StringScanner 'abc\ndef'
	ss.scan /\w{3}\n/
	eq true , ss.bol()
	eq true , ss.beginningOfLine()

test 'StringScanner::captures', (ss) ->
	# reports multiple captures correctly
	ss.scan /([a-z]+)\d+(\s*)/
	arrayEq ['abc', ' '], ss.captures()
	# a successful match with no capturing groups produces `[]`
	ss.scan /[a-z]+\d+/
	arrayEq [], ss.captures()
	# unsuccessful match produces `[]`
	eq null, ss.check /(\s+)/
	arrayEq [], ss.captures()
	# captures work as expected after a reset
	ss.reset()
	ss.check /.*(..) (..)/
	arrayEq ['23', 'de'], ss.captures()

test 'StringScanner::check', (ss) ->
	eq 'abc' , ss.check /[a-z]+/i
	eq 'abc' , ss.check /[a-z]+/i
	eq 'abc' , ss.scan /[a-z]+/i
	eq null  , ss.check /[a-z]+/i
	eq '123 ', ss.check /[\d\s]+/

test 'StringScanner::checkUntil', (ss) ->
	eq 'abc123 ', ss.checkUntil /\s/
	# does not advance pointer
	eq 'abc123 ', ss.checkUntil /\s/
	# produces `null` on unsuccessful match
	eq null     , ss.checkUntil /r/
	# only looks from pointer position
	ss.scanUntil /e/
	eq null     , ss.checkUntil /\s/

test 'StringScanner::clone', (ss) ->
	ss.scan /([a-z])[a-z]+/
	eq 'abc', ss.match()
	arrayEq ['a'], ss.captures()
	clone0 = ss.clone()
	eq 'abc', clone0.match()
	arrayEq ['a'], clone0.captures()
	ss.scan /\d+(\d)/
	eq '123', ss.match()
	arrayEq ['3'], ss.captures()
	eq 'abc', clone0.match()
	arrayEq ['a'], clone0.captures()
	clone1 = ss.clone()
	clone1.scan /\s+/
	eq '123', ss.match()
	arrayEq ['3'], ss.captures()
	eq 'abc', clone0.match()
	arrayEq ['a'], clone0.captures()
	eq ' ', clone1.match()
	arrayEq [], clone1.captures()

test 'StringScanner::concat', (ss) ->
	eq null, ss.checkUntil /h/
	ss.concat ' ghi789'
	eq 'abc123 def456 ghi789', ss.string()

test 'StringScanner::eos and StringScanner::endOfString', (ss) ->
	eq ss.eos, ss.endOfString
	eq false, ss.eos()
	ss.scan /.*/
	eq true , ss.eos()
	ss.reset()
	eq false, ss.eos()

test 'StringScanner::exists and StringScanner::exist', (ss) ->
	eq ss.exists, ss.exist
	eq 2    , ss.exists /c/
	eq 'c'  , ss.match()
	eq true , ss.matched()
	eq 0    , ss.exists /a/
	eq 'a'  , ss.match()
	eq true , ss.matched()
	eq 0    , ss.exists /b*/
	eq ''   , ss.match()
	eq true , ss.matched()
	eq null , ss.exists /m/
	eq null , ss.match()
	eq false, ss.matched()

test 'StringScanner::getch and StringScanner::getChar', (ss) ->
	eq ss.getch, ss.getChar
	eq 'a' , ss.getch()
	eq 'b' , ss.getch()
	ss.scan /.*/
	eq null, ss.getch()
	ss.reset()
	eq 'a' , ss.getch()

test 'StringScanner::match', (ss) ->
	eq null , ss.match()
	ss.scan /[a-z]+/i
	eq 'abc', ss.match()
	ss.scan /[a-z]+/i
	eq null , ss.match()

test 'StringScanner::matches', (ss) ->
	eq 3   , ss.matches /[a-z]+/i
	eq 3   , ss.matches /[a-z]+/i
	ss.scan /[a-z]+/i
	eq null, ss.matches /[a-z]+/i
	eq 4   , ss.matches /\d+\s*/i

test 'StringScanner::matched', (ss) ->
	eq false, ss.matched()
	ss.scan /\w+/
	eq true , ss.matched()
	ss.scan /\w+/
	eq false, ss.matched()

test 'StringScanner::matchSize', (ss) ->
	eq null, ss.matchSize()
	ss.scan /\w+/
	eq 6, ss.matchSize()
	ss.check /\w*/
	eq 0, ss.matchSize()
	ss.check /\w+/
	eq null, ss.matchSize()

test 'StringScanner::peek', (ss) ->
	eq 'ab', ss.peek 2
	eq '', ss.peek 0
	eq '', ss.peek -3
	eq ss.string(), ss.peek()
	ss.scan /.*d/
	eq 'ef4', ss.peek 3
	eq 'ef456', ss.peek()
	eq 'ef456', ss.peek 9001
	eq '', ss.peek 0
	eq '', ss.peek -1

test 'StringScanner::pointer and StringScanner::position', (ss) ->
	eq ss.pointer, ss.position
	eq 0, ss.pointer()
	ss.scan /\w+\d+\s+/i
	eq 7, ss.pointer()
	ss.scan /[a-z]+/i
	eq 10, ss.pointer()
	ss.reset()
	eq 0, ss.pointer()

test 'StringScanner::setPointer', (ss) ->
	eq 0 , ss.pointer()
	eq 4 , ss.setPointer 4
	eq 4 , ss.pointer()
	ss.getch()
	eq 5 , ss.pointer()
	eq 0 , ss.setPointer -3
	eq 0 , ss.pointer()
	eq 13, ss.setPointer 9001
	eq 13, ss.pointer()

test 'StringScanner::reset', (ss) ->
	ss.scan /\w+/
	eq 'abc123', ss.match()
	eq true    , ss.matched()
	eq 6       , ss.matchSize()
	eq 6       , ss.pointer()
	ss.reset()
	eq null    , ss.match()
	eq false   , ss.matched()
	eq null    , ss.matchSize()
	eq 0       , ss.pointer()
	ok ss.check /\w+/

test 'StringScanner::rest', (ss) ->
	eq ss.string(), ss.rest()
	ss.scanUntil /\s/
	eq 'def456'   , ss.rest()
	ss.reset()
	eq ss.string(), ss.rest()
	ss.setPointer 12
	eq '6'        , ss.rest()

test 'StringScanner::scan', (ss) ->
	eq 'abc'   , ss.scan /[a-z]+/
	eq null    , ss.scan /[a-z]+/
	eq ''      , ss.scan /[a-z]*/
	eq '123'   , ss.scan /[0-9]+/
	ss.check /\s+/
	eq ' '     , ss.scan /\s+/
	eq 'def456', ss.scan /.*/
	eq ''      , ss.scan /.*/
	eq null    , ss.scan /./

test 'StringScanner::scanUntil', (ss) ->
	eq 'abc1'  , ss.scanUntil /\d/
	eq 4       , ss.position()
	eq '23 '   , ss.scanUntil /\s/
	eq 7       , ss.position()
	eq null    , ss.scanUntil /z/
	eq ''      , ss.scanUntil /(?:)/
	eq ''      , ss.scanUntil()
	eq 7       , ss.position()
	eq 'def456', ss.scanUntil /$/
	ok ss.eos()

test 'StringScanner::skip', (ss) ->
	eq 3   , ss.skip /[a-z]+/
	eq 0   , ss.skip /[a-z]*/
	eq null, ss.skip /[a-z]+/
	eq 3   , ss.position()
	eq 4   , ss.skip /(\d|\s)+/
	eq 7   , ss.position()
	eq 6   , ss.skip /.*/
	ok ss.eos()

test 'StringScanner::skipUntil', (ss) ->
	eq 0   , ss.position()
	eq 7   , ss.skipUntil /\s/
	eq 7   , ss.position()
	eq 3   , ss.skipUntil /f/
	eq null, ss.skipUntil /f/
	eq 3   , ss.skipUntil /$/
	ok ss.eos()

test 'StringScanner::string', (ss) ->
	eq 'abc123 def456', ss.string()
	eq '', (new StringScanner '').string()
	eq 'abc', (new StringScanner 'abc').string()
	eq '', (new StringScanner null).string()
	eq '', (new StringScanner undefined).string()
	eq '0', (new StringScanner 0).string()

test 'StringScanner::terminate and StringScanner::clear', (ss) ->
	eq ss.terminate, ss.clear
	eq 0, ss.pointer()
	ss.terminate()
	ok ss.eos()
	ss.reset()
	eq 0, ss.pointer()
	ss.terminate()
	ok ss.eos()


console.log '\033[0;32mall tests passed\033[0m'
