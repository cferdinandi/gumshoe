suite 'Combinations', ->

  # TODO: this was just an early test; replace it with more modular tests
  test 'program . assignment . application . function . maths . maths', ->
    eq 'a = ((x, y) -> x * (y + z)) b'
    , generate new CS.Program new CS.Block [
      new CS.AssignOp (new CS.Identifier "a"),
      new CS.FunctionApplication (new CS.Function [(new CS.Identifier "x"), (new CS.Identifier "y")], new CS.Block [
        new CS.MultiplyOp (new CS.Identifier "x"), new CS.PlusOp (new CS.Identifier "y"), (new CS.Identifier "z")
      ]), [new CS.Identifier "b"]
    ]
