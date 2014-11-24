class StringScanner

	constructor: (@str = '') ->
		@str = '' + @str
		@pos = 0
		@lastMatch = {
			reset: ->
				@str = null
				@captures = []
				this
		}.reset()
		this

	bol: -> @pos<=0 || (this.str[this.pos-1] is "\n")

	captures: -> @lastMatch.captures

	check: (pattern) ->
		if @str.substr(@pos).search(pattern) isnt 0
			@lastMatch.reset()
			return null
		matches = @str.substr(@pos).match pattern
		@lastMatch.str = matches[0]
		@lastMatch.captures = matches.slice 1
		this.lastMatch.str

	checkUntil: (pattern) ->
		patternPos = @str.substr(@pos).search pattern
		if patternPos < 0
			@lastMatch.reset()
			return null
		matches = @str.substr(@pos+patternPos).match pattern
		@lastMatch.captures = matches.slice 1
		@lastMatch.str = @str.substr(@pos,patternPos) + matches[0]

	clone: ->
		clone = new @constructor(@str)
		clone.pos = @pos
		clone.lastMatch = {}
		clone.lastMatch[prop] = value for prop, value of @lastMatch
		clone

	concat: (str) ->
		@str += str
		this

	eos: -> @pos is @str.length

	exists: (pattern) ->
		patternPos = @str.substr(@pos).search pattern
		if patternPos < 0
			@lastMatch.reset()
			return null
		matches = @str.substr(@pos+patternPos).match pattern
		@lastMatch.str = matches[0]
		@lastMatch.captures = matches.slice 1
		patternPos

	getch: -> @scan /./

	# ruby equivalent: matched
	match: -> @lastMatch.str

	# ruby equivalent: match?
	matches: (pattern) ->
		@check pattern
		@matchSize()

	# ruby equivalent: matched?
	matched: -> @lastMatch.str?

	matchSize: -> if @matched() then this.match().length else null

	peek: (len) -> @str.substr @pos, len

	pointer: -> @pos

	setPointer: (pos) ->
		pos = +pos
		pos = 0 if pos < 0
		pos = @str.length if pos > @str.length
		@pos = pos

	reset: ->
		@lastMatch.reset()
		@pos = 0
		this

	rest: -> @str.substr @pos

	scan: (pattern) ->
		chk = @check pattern
		this.pos += chk.length if chk?
		chk

	scanUntil: (pattern) ->
		chk = @checkUntil pattern
		this.pos += chk.length if chk?
		chk

	skip: (pattern) ->
		@scan pattern
		@matchSize()

	skipUntil: (pattern) ->
		@scanUntil pattern
		@matchSize()

	string: -> @str

	terminate: ->
		@pos = @str.length
		@lastMatch.reset()
		this

	toString: ->
		"#<StringScanner #{if @eos() then 'fin' else "#{@pos}/#{@str.length} @ #{if @str.length>8 then "#{@str.substr(0,5)}..." else @str}"}>"


StringScanner::beginningOfLine = StringScanner::bol
StringScanner::clear           = StringScanner::terminate
StringScanner::dup             = StringScanner::clone
StringScanner::endOfString     = StringScanner::eos
StringScanner::exist           = StringScanner::exists
StringScanner::getChar         = StringScanner::getch
StringScanner::position        = StringScanner::pointer


StringScanner.StringScanner = StringScanner
module.exports = StringScanner
