suite 'Switch', ->

  #test 'basic switch', ->
  #  eq """
  #  switch a
  #    when b then c
  #  """, generate new CS.Switch (new CS.Identifier 'a'), [[(new CS.Identifier 'b'), new CS.Identifier 'c']], null
