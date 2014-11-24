suite 'Function Literals', ->

  setup ->
    @x = new CS.Identifier 'x'
    @y = new CS.Identifier 'y'


  test 'basic function literals', ->
    eq '->', generate new CS.Function [], null
    eq '=>', generate new CS.BoundFunction [], null

  test 'basic parameter lists', ->
    eq '(x) ->', generate new CS.Function [@x], null
    eq '(x, y) ->', generate new CS.Function [@x, @y], null

  test 'basic function bodies', ->
    eq '-> x', generate new CS.Function [], new CS.Block [@x]

  test 'less basic function bodies', ->

    eq '''
      ->
        x
        y
    ''', generate new CS.Function [], new CS.Block [
      @x
      @y
    ]

    eq '''
      (x, y) =>
        x = (y; x)
        x; y
        x + y
    ''', generate new CS.BoundFunction [@x, @y], new CS.Block [
      new CS.AssignOp @x, new CS.SeqOp @y, @x
      new CS.SeqOp @x, @y
      new CS.PlusOp @x, @y
    ]
