suite 'Numbers', ->

  test 'simple integers', ->
    eq '0', generate new CS.Int 0
    eq '10', generate new CS.Int 10

  test 'extremely large numbers should be represented in hex', ->
    eq '0xe8d4a51000', generate new CS.Int 1e12

  test 'powers of two should be represented in hex', ->
    eq '0x4000', generate new CS.Int 0x4000
