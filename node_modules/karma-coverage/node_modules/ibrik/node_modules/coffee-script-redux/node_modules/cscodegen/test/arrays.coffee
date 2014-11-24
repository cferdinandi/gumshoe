suite 'Array Literals', ->

  test 'simple arrays', ->
    eq '[]', generate new CS.ArrayInitialiser []
    eq '[0]', generate new CS.ArrayInitialiser [new CS.Int 0]
    eq '[0, 1]', generate new CS.ArrayInitialiser [(new CS.Int 0), new CS.Int 1]

  test 'larger arrays', ->
    eq '''
    [
      aaaaaaaaaa
      bbbbbbbbbb
      cccccccccc
      dddddddddd
      eeeeeeeeee
    ]
    ''', generate new CS.ArrayInitialiser [
      new CS.Identifier 'aaaaaaaaaa'
      new CS.Identifier 'bbbbbbbbbb'
      new CS.Identifier 'cccccccccc'
      new CS.Identifier 'dddddddddd'
      new CS.Identifier 'eeeeeeeeee'
    ]

  test 'function literals in arrays', ->
    eq '[->]', generate new CS.ArrayInitialiser [new CS.Function []]
    eq '[(->), ->]', generate new CS.ArrayInitialiser [(new CS.Function []), new CS.Function []]

  test 'function application in arrays', ->
    eq '[f a]', generate new CS.ArrayInitialiser [
      new CS.FunctionApplication (new CS.Identifier 'f'), [new CS.Identifier 'a']
    ]
    eq '[(f a), f b]', generate new CS.ArrayInitialiser [
      new CS.FunctionApplication (new CS.Identifier 'f'), [new CS.Identifier 'a']
      new CS.FunctionApplication (new CS.Identifier 'f'), [new CS.Identifier 'b']
    ]
    eq '''
    [
      f a
      f b
      f c
      f d
    ]
    ''', generate new CS.ArrayInitialiser [
      new CS.FunctionApplication (new CS.Identifier 'f'), [new CS.Identifier 'a']
      new CS.FunctionApplication (new CS.Identifier 'f'), [new CS.Identifier 'b']
      new CS.FunctionApplication (new CS.Identifier 'f'), [new CS.Identifier 'c']
      new CS.FunctionApplication (new CS.Identifier 'f'), [new CS.Identifier 'd']
    ]
