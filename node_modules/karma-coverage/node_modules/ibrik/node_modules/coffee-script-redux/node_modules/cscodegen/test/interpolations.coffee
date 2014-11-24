suite 'Interpolations', ->

  setup ->
    for letter in ['a', 'b']
      @["str#{letter.toUpperCase()}"] = new CS.String letter
      @["var#{letter.toUpperCase()}"] = new CS.Identifier letter


  test 'simple interpolations', ->
    eq '"ab"'          , generate new CS.ConcatOp @strA, @strB
    eq '"a#{b}"'       , generate new CS.ConcatOp @strA, @varB
    eq '"#{a}b"'       , generate new CS.ConcatOp @varA, @strB
    eq '"#{a}#{b}"'    , generate new CS.ConcatOp @varA, @varB
    eq '"aab"'         , generate new CS.ConcatOp @strA, new CS.ConcatOp (@strA), @strB
    eq '"#{a}ab"'      , generate new CS.ConcatOp @varA, new CS.ConcatOp (@strA), @strB
    eq '"a#{a}b"'      , generate new CS.ConcatOp @strA, new CS.ConcatOp (@varA), @strB
    eq '"aa#{b}"'      , generate new CS.ConcatOp @strA, new CS.ConcatOp (@strA), @varB
    eq '"#{a}#{a}b"'   , generate new CS.ConcatOp @varA, new CS.ConcatOp (@varA), @strB
    eq '"#{a}a#{b}"'   , generate new CS.ConcatOp @varA, new CS.ConcatOp (@strA), @varB
    eq '"a#{a}#{b}"'   , generate new CS.ConcatOp @strA, new CS.ConcatOp (@varA), @varB
    eq '"#{a}#{a}#{b}"', generate new CS.ConcatOp @varA, new CS.ConcatOp (@varA), @varB
