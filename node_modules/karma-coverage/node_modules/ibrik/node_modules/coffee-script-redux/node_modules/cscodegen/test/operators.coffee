suite 'Operators', ->

  setup ->
    @emptyFunction = new CS.Function [], null
    @zero = new CS.Int 0
    @one = new CS.Int 1
    @[letter] = new CS.Identifier letter for letter in ['a', 'b', 'c', 'd', 'e', 'f', 'F']


  test 'unary prefix operators', ->
    eq '++0', generate new CS.PreIncrementOp @zero
    eq '--0', generate new CS.PreDecrementOp @zero
    eq '+0', generate new CS.UnaryPlusOp @zero
    eq '+(+0)', generate new CS.UnaryPlusOp new CS.UnaryPlusOp @zero
    eq '-0', generate new CS.UnaryNegateOp @zero
    eq '-(-0)', generate new CS.UnaryNegateOp new CS.UnaryNegateOp @zero
    eq 'not 0', generate new CS.LogicalNotOp @zero
    eq '!!0', generate new CS.LogicalNotOp new CS.LogicalNotOp @zero
    eq '!!!0', generate new CS.LogicalNotOp new CS.LogicalNotOp new CS.LogicalNotOp @zero
    eq '~0', generate new CS.BitNotOp @zero
    eq 'do 0', generate new CS.DoOp @zero
    eq 'typeof 0', generate new CS.TypeofOp @zero
    eq 'new 0', generate new CS.NewOp @zero, []

  test 'unary prefix operators and function literals', ->
    eq '+->', generate new CS.UnaryPlusOp @emptyFunction
    eq 'new ->', generate new CS.NewOp @emptyFunction, []

  test 'unary prefix operators and function application', ->
    eq 'not f 0', generate new CS.LogicalNotOp new CS.FunctionApplication @f, [@zero]
    eq 'new F 0', generate new CS.NewOp @F, [@zero]
    eq 'new (F 0) 1', generate new CS.NewOp (new CS.FunctionApplication @F, [@zero]), [@one]

  test 'unary prefix operators and application of function literals', ->
    eq 'new (->) 0, 1', generate new CS.NewOp @emptyFunction, [@zero, @one]


  test 'unary postfix operators', ->
    eq '0?', generate new CS.UnaryExistsOp @zero
    eq '0++', generate new CS.PostIncrementOp @zero
    eq '0--', generate new CS.PostDecrementOp @zero

  test 'unary postfix operators and function literals', ->
    eq '(->)?', generate new CS.UnaryExistsOp @emptyFunction

  test 'unary postfix operators and function application', ->
    eq '(f 0)?', generate new CS.UnaryExistsOp new CS.FunctionApplication @f, [@zero]
    eq 'f()?', generate new CS.UnaryExistsOp new CS.FunctionApplication @f, []


  test 'unary prefix operators and unary postfix operators', ->
    eq '+0++', generate new CS.UnaryPlusOp new CS.PostIncrementOp @zero
    eq '(+0)++', generate new CS.PostIncrementOp new CS.UnaryPlusOp @zero
    eq 'new (F?)', generate new CS.NewOp (new CS.UnaryExistsOp @F), []
    eq '(new F)?', generate new CS.UnaryExistsOp new CS.NewOp @F, []


  test 'binary operators', ->
    eq '0; 1', generate new CS.SeqOp @zero, @one
    eq '0 or 1', generate new CS.LogicalOrOp @zero, @one
    eq '0 and 1', generate new CS.LogicalAndOp @zero, @one
    eq '0 | 1', generate new CS.BitOrOp @zero, @one
    eq '0 ^ 1', generate new CS.BitXorOp @zero, @one
    eq '0 & 1', generate new CS.BitAndOp @zero, @one
    eq '0 is 1', generate new CS.EQOp @zero, @one
    eq '0 isnt 1', generate new CS.NEQOp @zero, @one
    eq '0 < 1', generate new CS.LTOp @zero, @one
    eq '0 <= 1', generate new CS.LTEOp @zero, @one
    eq '0 > 1', generate new CS.GTOp @zero, @one
    eq '0 >= 1', generate new CS.GTEOp @zero, @one
    eq '0 in 1', generate new CS.InOp @zero, @one
    eq '0 of 1', generate new CS.OfOp @zero, @one
    eq '0 instanceof 1', generate new CS.InstanceofOp @zero, @one
    eq '0 << 1', generate new CS.LeftShiftOp @zero, @one
    eq '0 >> 1', generate new CS.SignedRightShiftOp @zero, @one
    eq '0 >>> 1', generate new CS.UnsignedRightShiftOp @zero, @one
    eq '0 + 1', generate new CS.PlusOp @zero, @one
    eq '0 - 1', generate new CS.SubtractOp @zero, @one
    eq '0 * 1', generate new CS.MultiplyOp @zero, @one
    eq '0 / 1', generate new CS.DivideOp @zero, @one
    eq '0 % 1', generate new CS.RemOp @zero, @one
    eq 'a = 0', generate new CS.AssignOp @a, @zero

  test 'negated binary operators', ->
    eq '0 not in 1', generate new CS.LogicalNotOp new CS.InOp @zero, @one

  test 'binary operators and function literals', ->
    eq '(->) % 0', generate new CS.RemOp @emptyFunction, @zero
    eq '0 % ->', generate new CS.RemOp @zero, @emptyFunction
    eq '->; 0', generate new CS.SeqOp @emptyFunction, @zero
    eq '0; ->', generate new CS.SeqOp @zero, @emptyFunction

  test 'binary operators and function application', ->
    eq 'f() % 0', generate new CS.RemOp (new CS.FunctionApplication @f, []), @zero
    eq '(f 0) % 1', generate new CS.RemOp (new CS.FunctionApplication @f, [@zero]), @one
    eq '0 % f 1', generate new CS.RemOp @zero, new CS.FunctionApplication @f, [@one]
    eq 'f 0 % 1', generate new CS.FunctionApplication @f, [new CS.RemOp @zero, @one]

  test 'binary operators and unary operators on functions', ->
    eq '(do ->) % 0', generate new CS.RemOp (new CS.DoOp @emptyFunction), @zero


  test 'compound assignment operators', ->
    eq 'a += 0', generate new CS.CompoundAssignOp CS.PlusOp, @a, @zero
    eq 'a or= 0', generate new CS.CompoundAssignOp CS.LogicalOrOp, @a, @zero
    eq 'a &= 0', generate new CS.CompoundAssignOp CS.BitAndOp, @a, @zero
    eq 'a >>>= 0', generate new CS.CompoundAssignOp CS.UnsignedRightShiftOp, @a, @zero


  test 'static member access operators', ->
    eq 'a.b', generate new CS.MemberAccessOp @a, 'b'
    eq 'a.b.c', generate new CS.MemberAccessOp (new CS.MemberAccessOp @a, 'b'), 'c'
    eq 'f()?.a', generate new CS.SoakedMemberAccessOp (new CS.FunctionApplication @f, []), 'a'
    eq '(f 0)::a', generate new CS.ProtoMemberAccessOp (new CS.FunctionApplication @f, [@zero]), 'a'
    eq '(->)?::a', generate new CS.SoakedProtoMemberAccessOp @emptyFunction, 'a'
    eq '(-> 0).a', generate new CS.MemberAccessOp (new CS.Function [], new CS.Block [@zero]), 'a'
    eq '(new F).b', generate new CS.MemberAccessOp (new CS.NewOp @F, []), 'b'
    eq '(new F 0).b', generate new CS.MemberAccessOp (new CS.NewOp @F, [@zero]), 'b'

  test 'dynamic member access operators', ->
    eq 'a[0]', generate new CS.DynamicMemberAccessOp @a, @zero
    eq 'a[0][1]', generate new CS.DynamicMemberAccessOp (new CS.DynamicMemberAccessOp @a, @zero), @one
    eq 'a?[\'b\']', generate new CS.SoakedDynamicMemberAccessOp @a, new CS.String 'b'
    eq 'a::[c = 0]', generate new CS.DynamicProtoMemberAccessOp @a, new CS.AssignOp @c, @zero
    eq 'a?::[0; 1]', generate new CS.SoakedDynamicProtoMemberAccessOp @a, new CS.SeqOp @zero, @one
    eq 'f()[0]', generate new CS.DynamicMemberAccessOp (new CS.FunctionApplication @f, []), @zero
    eq '(f 0)[0]', generate new CS.DynamicMemberAccessOp (new CS.FunctionApplication @f, [@zero]), @zero
    eq '(->)[0]', generate new CS.DynamicMemberAccessOp @emptyFunction, @zero
    eq '(-> 0)[0]', generate new CS.DynamicMemberAccessOp (new CS.Function [], new CS.Block [@zero]), @zero
    eq '(new F)[0]', generate new CS.DynamicMemberAccessOp (new CS.NewOp @F, []), @zero
    eq '(new F 0)[1]', generate new CS.DynamicMemberAccessOp (new CS.NewOp @F, [@zero]), @one

  test 'combinations of static/dynamic member access operators', ->
    eq 'a.b[c]::d', generate new CS.ProtoMemberAccessOp (new CS.DynamicMemberAccessOp (new CS.MemberAccessOp @a, 'b'), @c), 'd'
