CJSIFY=node_modules/.bin/cjsify --minify

default:
bundle: esmangle.js

esmangle.js: lib/esmangle.js
	$(CJSIFY) -x esmangle lib/esmangle.js >"$@"

.PHONY: clean

clean:
	rm -f esmangle.js
