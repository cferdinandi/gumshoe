do (exports = exports ? this.cscodegen = {}) ->

  TAB = '  '
  indent = (code) -> ("#{TAB}#{line}" for line in code.split '\n').join '\n'
  parens = (code) -> "(#{code})"

  formatStringData = (data) ->
    data.replace /[^\x20-\x7e]|['\\]/, (c) ->
      switch c
        when '\0' then '\\0'
        when '\b' then '\\b'
        when '\t' then '\\t'
        when '\n' then '\\n'
        when '\f' then '\\f'
        when '\r' then '\\r'
        when '\'' then '\\\''
        when '\\' then '\\\\'
        else
          escape = (c.charCodeAt 0).toString 16
          pad = "0000"[escape.length...]
          "\\u#{pad}#{escape}"

  formatInterpolation = (ast, options) ->
    switch ast.className
      when "ConcatOp"
        left = formatInterpolation ast.left, options
        right = formatInterpolation ast.right, options
        "#{left}#{right}"
      when "String"
        formatStringData ast.data
      else
        "\#{#{generate ast, options}}"

  needsParensWhenOnLeft = (ast) ->
    switch ast.className
      when 'Function', 'BoundFunction', 'NewOp' then yes
      when 'Conditional', 'Switch', 'While', 'Block' then yes
      when 'PreIncrementOp', 'PreDecrementOp', 'UnaryPlusOp', 'UnaryNegateOp', 'LogicalNotOp', 'BitNotOp', 'DoOp', 'TypeofOp', 'DeleteOp'
        needsParensWhenOnLeft ast.expression
      when 'FunctionApplication' then ast.arguments.length > 0
      else no

  eq = (nodeA, nodeB) ->
    for own prop, val of nodeA
      continue if prop in ['raw', 'line', 'column']
      switch Object::toString.call val
        when '[object Object]' then return no unless eq nodeB[prop], val
        when '[object Array]'
          for v, i in val
            return no unless eq nodeB[prop][i], v
        else return no unless nodeB[prop] is val
    yes

  clone = (obj, overrides = {}) ->
    newObj = {}
    newObj[prop] = val for own prop, val of obj
    newObj[prop] = val for own prop, val of overrides
    newObj

  levels = [
    ['SeqOp'] # Sequence
    ['Conditional', 'ForIn', 'ForOf', 'While'] # Control Flow
    ['FunctionApplication', 'SoakedFunctionApplication'] # Application
    ['AssignOp', 'CompoundAssignOp', 'ExistsAssignOp'] # Assignment
    ['LogicalOrOp'] # Logical OR
    ['LogicalAndOp'] # Logical AND
    ['BitOrOp'] # Bitwise OR
    ['BitXorOp'] # Bitwise XOR
    ['BitAndOp'] # Bitwise AND
    ['ExistsOp'] # Existential
    ['EQOp', 'NEQOp'] # Equality
    ['LTOp', 'LTEOp', 'GTOp', 'GTEOp', 'InOp', 'OfOp', 'InstanceofOp'] # Relational
    ['LeftShiftOp', 'SignedRightShiftOp', 'UnsignedRightShiftOp'] # Bitwise Shift
    ['PlusOp', 'SubtractOp'] # Additive
    ['MultiplyOp', 'DivideOp', 'RemOp'] # Multiplicative
    ['UnaryPlusOp', 'UnaryNegateOp', 'LogicalNotOp', 'BitNotOp', 'DoOp', 'TypeofOp', 'PreIncrementOp', 'PreDecrementOp', 'DeleteOp'] # Unary
    ['UnaryExistsOp', 'ShallowCopyArray', 'PostIncrementOp', 'PostDecrementOp', 'Spread'] # Postfix
    ['NewOp'] # New
    ['MemberAccessOp', 'SoakedMemberAccessOp', 'DynamicMemberAccessOp', 'SoakedDynamicMemberAccessOp', 'ProtoMemberAccessOp', 'DynamicProtoMemberAccessOp', 'SoakedProtoMemberAccessOp', 'SoakedDynamicProtoMemberAccessOp'] # Member
  ]

  precedence = {}
  do ->
    for ops, level in levels
      for op in ops
        precedence[op] = level

  operators =
    # Binary
    SeqOp: ';'
    LogicalOrOp: 'or', LogicalAndOp: 'and'
    BitOrOp: '|', BitXorOp: '^', BitAndOp: '&'
    EQOp: 'is', NEQOp: 'isnt', LTOp: '<', LTEOp: '<=', GTOp: '>', GTEOp: '>='
    InOp: 'in', OfOp: 'of', InstanceofOp: 'instanceof'
    LeftShiftOp: '<<', SignedRightShiftOp: '>>', UnsignedRightShiftOp: '>>>'
    PlusOp: '+', SubtractOp: '-', MultiplyOp: '*', DivideOp: '/', RemOp: '%'
    # Prefix
    UnaryPlusOp: '+', UnaryNegateOp: '-', LogicalNotOp: 'not ', BitNotOp: '~'
    DoOp: 'do ', NewOp: 'new ', TypeofOp: 'typeof '
    PreIncrementOp: '++', PreDecrementOp: '--'
    # Postfix
    UnaryExistsOp: '?'
    ShallowCopyArray: '[..]'
    PostIncrementOp: '++'
    PostDecrementOp: '--'
    Spread: '...'
    # Application
    FunctionApplication: ''
    SoakedFunctionApplication: '?'
    # Member
    MemberAccessOp: '.'
    SoakedMemberAccessOp: '?.'
    ProtoMemberAccessOp: '::'
    SoakedProtoMemberAccessOp: '?::'
    DynamicMemberAccessOp: ''
    SoakedDynamicMemberAccessOp: '?'
    DynamicProtoMemberAccessOp: '::'
    SoakedDynamicProtoMemberAccessOp: '?::'

  # TODO: DRY this function
  # TODO: ast as context?
  exports.generate = generate = (ast, options = {}) ->
    needsParens = no
    options.precedence ?= 0
    options.ancestors ?= []
    parent = options.ancestors[0]
    parentClassName = parent?.className
    usedAsExpression = parent? and parentClassName isnt 'Block'
    src = switch ast.className

      when 'Program'
        options.ancestors = [ast, options.ancestors...]
        if ast.body? then generate ast.body, options else ''

      when 'Block'
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: 0
        if ast.statements.length is 0 then generate (new Undefined).g(), options
        else
          sep = if parentClassName is 'Program' then '\n\n' else '\n'
          (generate s, options for s in ast.statements).join sep

      when 'Conditional'
        options.ancestors.unshift ast
        options.precedence = 0

        hasAlternate = ast.consequent? and ast.alternate?
        _consequent = generate (ast.consequent ? (new Undefined).g()), options
        _alternate = if hasAlternate then generate ast.alternate, options else ""

        isMultiline =
          _consequent.length > 90 or
          _alternate.length > 90 or
          '\n' in _alternate or
          '\n' in _consequent

        _consequent = if isMultiline then "\n#{indent _consequent}" else " then #{_consequent}"
        if hasAlternate
          _alternate =
            if isMultiline then "\nelse\n#{indent _alternate}"
            else " else #{_alternate}"
        "if #{generate ast.condition, options}#{_consequent}#{_alternate}"

      when 'Identifier' then ast.data

      when 'Null' then 'null'
      when 'This' then 'this'
      when 'Undefined' then 'undefined'

      when 'Int'
        absNum = if ast.data < 0 then -ast.data else ast.data
        # if number is a power of two (at least 2^4) or hex is a shorter
        # representation, represent it as hex
        if absNum >= 1e12 or (absNum >= 0x10 and 0 is (absNum & (absNum - 1)))
          "0x#{ast.data.toString 16}"
        else
          ast.data.toString 10

      when 'Float' then ast.data.toString 10

      when 'String'
        "'#{formatStringData ast.data}'"

      when 'ArrayInitialiser'
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: precedence.AssignmentExpression
        members_ = (generate m, options for m in ast.members)
        switch ast.members.length
          when 0 then '[]'
          when 1, 2
            for m, i in members_ when i + 1 isnt members_.length
              members_[i] = parens m if needsParensWhenOnLeft ast.members[i]
            "[#{members_.join ', '}]"
          else "[\n#{indent members_.join '\n'}\n]"

      when 'ObjectInitialiser'
        options.ancestors = [ast, options.ancestors...]
        members_ = (generate m, options for m in ast.members)
        switch ast.members.length
          when 0 then '{}'
          when 1 then "{#{members_.join ', '}}"
          else "{\n#{indent members_.join '\n'}\n}"

      when 'ObjectInitialiserMember'
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: precedence.AssignmentExpression
        key_ = generate ast.key, options
        expression_ = generate ast.expression, options
        memberAccessOps = ['MemberAccessOp', 'ProtoMemberAccessOp', 'SoakedMemberAccessOp', 'SoakedProtoMemberAccessOp']
        if eq ast.key, ast.expression
          "#{key_}"
        else if ast.expression.className in memberAccessOps and ast.key.data is ast.expression.memberName
          "#{expression_}"
        else
          "#{key_}: #{expression_}"

      when 'Function', 'BoundFunction'
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: precedence.AssignmentExpression
        parameters = (generate p, options for p in ast.parameters)
        options.precedence = 0
        _body = if !ast.body? or ast.body.className is 'Undefined' then '' else generate ast.body, options
        _paramList = if ast.parameters.length > 0 then "(#{parameters.join ', '}) " else ''
        _block =
          if _body.length is 0 then ''
          else if _paramList.length + _body.length < 100 and '\n' not in _body then " #{_body}"
          else "\n#{indent _body}"
        switch ast.className
          when 'Function' then "#{_paramList}->#{_block}"
          when 'BoundFunction' then "#{_paramList}=>#{_block}"

      when 'AssignOp'
        prec = precedence[ast.className]
        needsParens = prec < options.precedence
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        _assignee = generate ast.assignee, options
        _expr = generate ast.expression, options
        "#{_assignee} = #{_expr}"

      when 'CompoundAssignOp'
        prec = precedence[ast.className]
        needsParens = prec < options.precedence
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        _op = operators[ast.op::className]
        _assignee = generate ast.assignee, options
        _expr = generate ast.expression, options
        "#{_assignee} #{_op}= #{_expr}"

      when 'SeqOp'
        prec = precedence[ast.className]
        needsParens = prec < options.precedence
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        _left = generate ast.left, options
        _right = generate ast.right, options
        "#{_left}; #{_right}"

      when 'LogicalOrOp', 'LogicalAndOp', 'BitOrOp', 'BitXorOp', 'BitAndOp', 'LeftShiftOp', 'SignedRightShiftOp', 'UnsignedRightShiftOp', 'EQOp', 'NEQOp', 'LTOp', 'LTEOp', 'GTOp', 'GTEOp', 'InOp', 'OfOp', 'InstanceofOp', 'PlusOp', 'SubtractOp', 'MultiplyOp', 'DivideOp', 'RemOp', 'ExistsOp'
        _op = operators[ast.className]
        if ast.className in ['InOp', 'OfOp', 'InstanceofOp'] and parentClassName is 'LogicalNotOp'
          _op = "not #{_op}"
        prec = precedence[ast.className]
        needsParens = prec < options.precedence
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        _left = generate ast.left, options
        _left = parens _left if needsParensWhenOnLeft ast.left
        _right = generate ast.right, options
        "#{_left} #{_op} #{_right}"

      when 'UnaryPlusOp', 'UnaryNegateOp', 'LogicalNotOp', 'BitNotOp', 'DoOp', 'TypeofOp', 'PreIncrementOp', 'PreDecrementOp'
        _op = operators[ast.className]
        prec = precedence[ast.className]
        if ast.className is 'LogicalNotOp'
          if ast.expression.className in ['InOp', 'OfOp', 'InstanceofOp']
            _op = '' # these will be treated as negated variants
            prec = precedence[ast.expression.className]
          if 'LogicalNotOp' in [parentClassName, ast.expression.className]
            _op = '!'
        needsParens = prec < options.precedence
        needsParens = yes if parentClassName is ast.className and ast.className in ['UnaryPlusOp', 'UnaryNegateOp']
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        "#{_op}#{generate ast.expression, options}"

      when 'UnaryExistsOp', 'PostIncrementOp', 'PostDecrementOp', 'Spread'
        _op = operators[ast.className]
        prec = precedence[ast.className]
        needsParens = prec < options.precedence
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        _expr = generate ast.expression, options
        _expr = parens _expr if needsParensWhenOnLeft ast.expression
        "#{_expr}#{_op}"

      when 'NewOp'
        _op = operators[ast.className]
        prec = precedence[ast.className]
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        _ctor = generate ast.ctor, options
        _ctor = parens _ctor if ast.arguments.length > 0 and needsParensWhenOnLeft ast.ctor
        options.precedence = precedence['AssignOp']
        args = for a, i in ast.arguments
          arg = generate a, options
          arg = parens arg if (needsParensWhenOnLeft a) and i + 1 isnt ast.arguments.length
          arg
        _args = if ast.arguments.length is 0 then '' else " #{args.join ', '}"
        "#{_op}#{_ctor}#{_args}"

      when 'FunctionApplication', 'SoakedFunctionApplication'
        if ast.className is 'FunctionApplication' and ast.arguments.length is 0 and not usedAsExpression
          generate (new DoOp ast.function), options
        else
          options = clone options,
            ancestors: [ast, options.ancestors...]
            precedence: precedence[ast.className]
          _op = operators[ast.className]
          _fn = generate ast.function, options
          _fn = parens _fn if needsParensWhenOnLeft ast.function
          args = for a, i in ast.arguments
            arg = generate a, options
            arg = parens arg if (needsParensWhenOnLeft a) and i + 1 isnt ast.arguments.length
            arg
          _argList = if ast.arguments.length is 0 then '()' else " #{args.join ', '}"
          "#{_fn}#{_op}#{_argList}"

      when 'MemberAccessOp', 'SoakedMemberAccessOp', 'ProtoMemberAccessOp', 'SoakedProtoMemberAccessOp'
        _op = operators[ast.className]
        prec = precedence[ast.className]
        needsParens = prec < options.precedence
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        if ast.expression.className is 'This'
          _expr = '@'
          _op = '' if ast.className is 'MemberAccessOp'
        else
          _expr = generate ast.expression, options
          _expr = parens _expr if needsParensWhenOnLeft ast.expression
        "#{_expr}#{_op}#{ast.memberName}"

      when 'DynamicMemberAccessOp', 'SoakedDynamicMemberAccessOp', 'DynamicProtoMemberAccessOp', 'SoakedDynamicProtoMemberAccessOp'
        _op = operators[ast.className]
        prec = precedence[ast.className]
        needsParens = prec < options.precedence
        options = clone options,
          ancestors: [ast, options.ancestors...]
          precedence: prec
        if ast.expression.className is 'This'
          _expr = '@'
        else
          _expr = generate ast.expression, options
          _expr = parens _expr if needsParensWhenOnLeft ast.expression
        options.precedence = 0
        _indexingExpr = generate ast.indexingExpr, options
        "#{_expr}#{_op}[#{_indexingExpr}]"

      when 'ConcatOp'
        _left = formatInterpolation ast.left, options
        _right = formatInterpolation ast.right, options
        "\"#{_left}#{_right}\""

      else
        throw new Error "Non-exhaustive patterns in case: #{ast.className}"

    if needsParens then (parens src) else src
