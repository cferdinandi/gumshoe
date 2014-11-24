suite 'String Literals', ->

  test 'basic strings', ->
    eq "'string'", generate new CS.String 'string'

  test 'quotes within strings', ->
    eq "'\\''", generate new CS.String '\''
    eq "'\"'", generate new CS.String '"'

  test 'special escape sequences', ->
    eq "'\\0'", generate new CS.String '\0'
    eq "'\\b'", generate new CS.String '\b'
    eq "'\\t'", generate new CS.String '\t'
    eq "'\\n'", generate new CS.String '\n'
    eq "'\\f'", generate new CS.String '\f'
    eq "'\\r'", generate new CS.String '\r'
    eq "'\\\\'", generate new CS.String '\\'
    eq "'\\u0001'", generate new CS.String '\u0001'
