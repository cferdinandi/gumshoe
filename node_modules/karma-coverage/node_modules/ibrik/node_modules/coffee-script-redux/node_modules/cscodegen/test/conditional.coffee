suite 'Conditionals', ->

  test 'basic', ->
    eq 'if 0 then 1', generate new CS.Conditional (new CS.Int 0), new CS.Block [new CS.Int 1]
    eq 'if 0 then 1', generate new CS.Conditional (new CS.Int 0), new CS.Int 1

  test 'basic with else', ->
    eq 'if 0 then 1 else 2', generate new CS.Conditional (new CS.Int 0), (new CS.Block [new CS.Int 1]), new CS.Block [new CS.Int 2]
    eq 'if 0 then 1 else 2', generate new CS.Conditional (new CS.Int 0), (new CS.Int 1), new CS.Int 2

  test 'multiline', ->
    eq '''
    if 0
      1
      2
    ''', generate new CS.Conditional (new CS.Int 0), new CS.Block [(new CS.Int 1), new CS.Int 2]

  test 'multiline with else', ->
    eq '''
    if 0
      1
      2
    else
      3
      4
    ''', generate new CS.Conditional (new CS.Int 0), (new CS.Block [(new CS.Int 1), new CS.Int 2]), new CS.Block [(new CS.Int 3), new CS.Int 4]

  test 'multiline with basic else', ->
    eq '''
    if 0
      1
      2
    else
      3
    ''', generate new CS.Conditional (new CS.Int 0), (new CS.Block [(new CS.Int 1), new CS.Int 2]), new CS.Block [new CS.Int 3]

    eq '''
    if 0
      1
      2
    else
      3
    ''', generate new CS.Conditional (new CS.Int 0), (new CS.Block [(new CS.Int 1), new CS.Int 2]), new CS.Int 3

  test 'basic with multiline else', ->
    eq '''
    if 0
      1
    else
      2
      3
    ''', generate new CS.Conditional (new CS.Int 0), (new CS.Block [new CS.Int 1]), new CS.Block [(new CS.Int 2), new CS.Int 3]

    eq '''
    if 0
      1
    else
      2
      3
    ''', generate new CS.Conditional (new CS.Int 0), (new CS.Int 1), new CS.Block [(new CS.Int 2), new CS.Int 3]
