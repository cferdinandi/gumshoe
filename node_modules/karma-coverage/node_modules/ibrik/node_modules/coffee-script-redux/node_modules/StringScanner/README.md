StringScanner
=============

StringScanner performs lexical scanning operations on a string.
Inspired by [Ruby's StringScanner class](http://www.ruby-doc.org/stdlib-1.9.3/libdoc/strscan/rdoc/StringScanner.html)


How To Use
----------

Instantiate a new `StringScanner` by passing its constructor the string to scan.

    var StringScanner = require("StringScanner");
    var ss = new StringScanner("abc123 def456");
    // #<StringScanner 0/13 @ "abc12...">

For the following examples, `ss` represents the `StringScanner` instance
defined above.

### bol / beginningOfLine
Returns `true` if the scan pointer is at the beginning of a line (right after
`\n`) or the beginning of the string, `false` otherwise.

    ss.reset()    // #<StringScanner 0/13 @ "abc12...">
    ss.pointer()  // 0
    ss.bol()      // true
    ss.scan(/./)  // "a"
    ss.pointer()  // 1
    ss.bol()      // false

### captures
Returns an Array containing the contents of the capturing groups in the last
evaluated pattern match.

    ss.reset()              // #<StringScanner 0/13 @ "abc12...">
    ss.check(/.*(..) (..)/  // "abc123 de"
    ss.captures()           // ["23","de"]
    ss.check(/\w+/)         // "abc123"
    ss.captures()           // []
    ss.check(/\s+/)         // null
    ss.captures()           // []


### check(pattern)
*Note: this method alters last match results*

Checks if a `scan` of the given pattern would succeed without advancing the
scan pointer. Returns the portion of the string matched on successful match,
`null` otherwise.

    ss.reset()           // #<StringScanner 0/13 @ "abc12...">
    ss.check(/[a-z]+/i)  // "abc"
    ss.check(/[a-z]+/i)  // "abc"
    ss.scan(/[a-z]+/i)   // "abc"
    ss.check(/[a-z]+/i)  // null
    ss.check(/[\d\s]+/)  // "123 "

### checkUntil(pattern)
*Note: this method alters last match results*

Checks if a `scanUntil` would succeed without advancing the scan pointer.
Returns the portion of the string being scanned from the scan pointer to the
end of the matched string on successful match, `null` otherwise.

    ss.reset()           // #<StringScanner 0/13 @ "abc12...">
    ss.checkUntil(/\s/)  // "abc123 "
    ss.checkUntil(/\s/)  // "abc123 "
    ss.checkUntil(/r/)   // null
    ss.scanUntil(/e/)    // "abc123 de"
    ss.checkUntil(/\s/)  // null

### clone / dup
Creates a duplicate of this instance of `StringScanner`.

### concat(str)
Appends the given string to the string being scanned.

    ss.reset()            // #<StringScanner 0/13 @ "abc12...">
    ss.checkUntil(/h/)    // null
    ss.concat(" ghi789")  // #<StringScanner 0/20 @ "abc12..."
    ss.checkUntil(/h/)    // "abc123 def456 gh"

### eos / endOfString
Returns `true` if the scan pointer is at the end of the string being scanned,
`false` otherwise.

    ss.reset()     // #<StringScanner 0/13 @ "abc12...">
    ss.pointer()   // 0
    ss.eos()       // false
    ss.scan(/.*/)  // "abc123 def456"
    ss.pointer()   // 13
    ss.eos()       // true

### exists(pattern) / exist(pattern)
*Note: this method alters last match results*

*Warning: this method may return `0` on a successful operation. Use `===`
comparision to `null` for failure check, for example: `ss.exists(/a/i)===null`*

Checks if the given pattern matches anywhere after the current scan pointer.
This will determine if a `scanUntil` operation will succeed.  Returns the
number of characters between the scan pointer and the position in which the
match was found on success, `null` otherwise.

    ss.reset()
    // ----
    ss.exists(/c/)   // 2
    ss.match()       // "c"
    ss.matched()     // true
    // ----
    ss.exists(/a/)   // 0
    ss.match()       // "a"
    ss.matched()     // true
    // ----
    ss.exists(/b*/)  // 0
    ss.match()       // ""
    ss.matched()     // true
    // ----
    ss.exists(/m/)   // null
    ss.match()       // null
    ss.matched()     // false

### getch / getChar
*Note: this method alters last match results*

*Note: Ruby equivalent: `get_byte`*

`scan`s one character and returns it; exactly equivalent to `scan(/./)`.

    ss.reset()    // #<StringScanner 0/13 @ "abc12...">
    ss.getch()    // "a"
    ss.reset()    // #<StringScanner 0/13 @ "abc12...">
    ss.scan(/./)  // "a"

### match
*Note: Ruby equivalent: `matched`*

Returns the last string matched or `null` if the last attempted match failed.

    ss.reset()           // #<StringScanner 0/13 @ "abc12...">
    ss.scan(/[a-z]+/i)   // "abc"
    ss.match()           // "abc"
    ss.check(/[a-z]+/i)  // null
    ss.match()           // null

### matches(pattern)
*Note: Ruby equivalent: `match?`*

Checks if a scan of the given pattern would succeed without advancing the scan
pointer. Returns the length of the string matched on successful match, `null`
otherwise.

    ss.reset()             // #<StringScanner 0/13 @ "abc12...">
    ss.matches(/[a-z]+/i)  // 3
    ss.matches(/[a-z]+/i)  // 3
    ss.scan(/[a-z]+/i)     // "abc"
    ss.matches(/[a-z]+/i)  // null
    ss.matches(/[\d\s]+/)  // 4

### matched
*Note: Ruby equivalent: `matched?`*

Returns `true` if the last attempted match was successful, `false` otherwise.

    ss.reset()      // #<StringScanner 0/13 @ "abc12...">
    ss.scan(/\w+/)  // "abc123"
    ss.matched()    // true
    ss.scan(/\w+/)  // null
    ss.matched()    // false

### matchSize
*Warning: this method may return `0` on a successful operation. Use `===`
comparision to `null` for failure check, for example: `ss.matchSize()===null`*

Returns the length of the most recently matched string if the most recent match
attempt succeeded, `null` otherwise.

    ss.reset()       // #<StringScanner 0/13 @ "abc12...">
    ss.scan(/\w+/)   // "abc123"
    ss.matchSize()   // 6
    ss.check(/\w*/)  // ""
    ss.matchSize()   // 0
    ss.check(/\w+/)  // null
    ss.matchSize()   // null

### peek(len)
Returns *len* characters after the scan pointer, or the rest of the string,
whichever is shorter.

    ss.reset()      // #<StringScanner 0/13 @ "abc12...">
    ss.scan(/.*d/)  // "abc123 d"
    ss.peek(3)      // "ef4"
    ss.peek(9001)   // "ef456"
    ss.peek(0)      // ""
    ss.peek(-3)     // ""

### pointer / position
Returns the scan pointer position as an integer.

    ss.reset()            // #<StringScanner 0/13 @ "abc12...">
    ss.pointer()          // 0
    ss.scan(/\w+\d+\s+/)  // "abc123 "
    ss.pointer()          // 7
    ss.scan([a-z]+)       // "def"
    ss.pointer()          // 10

### setPointer(pos)
Manually move the scan pointer to *pos* characters from the beginning of the
string. The scan pointer is bounded between zero and the scanning string's
length. Returns the position to which the scan pointer was moved. `setPointer`
neither resets nor modifies the last match results.

    ss.reset()         // #<StringScanner 0/13 @ "abc12...">
    ss.setPointer(4)   // 4
    ss.scan(/\d+/)     // "23"
    ss.pointer()       // 6
    ss.setPointer(-4)  // 0
    ss.setPointer(99)  // 13

### reset
Moves the scan pointer back to the beginning of the string being scanned and
clears the last match results.

    ss.reset()            // #<StringScanner 0/13 @ "abc12...">
    ss.scanUntil(/(\s)/)  // "abc123 "
    ss.pointer()          // 7
    ss.match()            // "abc123 "
    ss.captures()         // [" "]
    ss.reset()            // #<StringScanner 0/13 @ "abc12...">
    ss.pointer()          // 0
    ss.match()            // null
    ss.captures()         // []

### rest
Returns the portion of the string being scanned after the scan pointer.

    ss.reset()          // #<StringScanner 0/13 @ "abc12...">
    ss.scanUntil(/\s/)  // "abc123 "
    ss.rest()           // "def456"

### scan(pattern)
*Note: this method alters last match results*

Attempts to match the given pattern at the position of the scan pointer.
Returns the matched string and advances the string pointer upon successful
match. A failed match will result in a `null` value being returned.

    ss.reset()         // #<StringScanner 0/13 @ "abc12...">
    ss.scan(/[a-z]+/)  // "abc"
    ss                 // #<StringScanner 3/13 @ "abc12...">
    ss.scan(/[a-z]+/)  // null
    ss                 // #<StringScanner 3/13 @ "abc12...">
    ss.scan(/[0-9]+/)  // "123"
    ss                 // #<StringScanner 6/13 @ "abc12...">

### scanUntil(pattern)
*Note: this method alters last match results*

Attempts to match the pattern against the string being scanned. On a successful
match, the scan pointer is advanced to the end of the matched portion of the
string and the portion of the string being scanned up to and including the
matched string is returned. On a failed match, `null` is returned.

    ss.reset()         // #<StringScanner 0/13 @ "abc12...">
    ss.scanUntil(/ /)  // "abc123 "
    ss.scanUntil(/f/)  // "def"
    ss.scanUntil(/f/)  // null

### skip(pattern)
*Note: this method alters last match results*

Performs a `scan`, returning the length of the matched string on successful
match, `null` otherwise.

    ss.reset()         // #<StringScanner 0/13 @ "abc12...">
    ss.skip(/[a-z]+/)  // 3
    ss.skip(/[a-z]+/)  // null
    ss.skip(/[0-9]+/)  // 3

### skipUntil(pattern)
*Note: this method alters last match results*

Performs a `scanUntil`, returning the length of the matched string on
successful match, `null` otherwise.

    ss.reset()         // #<StringScanner 0/13 @ "abc12...">
    ss.skipUntil(/ /)  // 7
    ss.skipUntil(/f/)  // 3
    ss.skipUntil(/f/)  // null

### string
Returns the entire string being scanned.

    ss.string()  // "abc123 def456"
    ss.getch()   // "a"
    ss.string()  // "abc123 def456"

### terminate / clear
Advances the scan pointer to the end of the string being scanned and resets the
last match results.

    ss.reset()      // #<StringScanner 0/13 @ "abc12...">
    ss.getch()      // "a"
    ss.pointer()    // 1
    ss.terminate()  // #<StringScanner fin>
    ss.pointer()    // 13
    ss.eos()        // true
    ss.match()      // null

Known Issues
------------

Not really an issue, but `StringScanner` assumes the global flag (g) is
disabled on any RegExp objects passed as patterns to any of its methods. If the
global flag is enabled, `StringScanner` may produce unexpected results.

Additional Info
---------------

I am always open for feature requests or any feedback.  I can be reached at
[Github](http://github.com/michaelficarra).

Thanks to the Ruby community for the original idea and implementation.
