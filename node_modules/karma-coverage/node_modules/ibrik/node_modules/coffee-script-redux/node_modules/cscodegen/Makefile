default: all

SRC = $(shell find src -name "*.coffee" -type f | sort)
LIB = $(SRC:src/%.coffee=lib/%.js)
TESTS = $(shell find test -name "*.coffee" -type f | sort)

COFFEE = node_modules/coffee-script/bin/coffee
MOCHA = node_modules/mocha/bin/mocha --compilers coffee:coffee-script -u tdd

all: $(LIB)
build: all

lib/%.js: src/%.coffee lib
	$(COFFEE) -sc < "$<" > "$@"

lib:
	mkdir lib

test: $(LIB) $(TESTS)
	$(MOCHA) -R spec

install: $(LIB)
	npm install -g .

coverage: $(LIB)
	@which jscoverage || (echo "install node-jscoverage"; exit 1)
	rm -rf instrumented
	jscoverage -v lib instrumented
	$(MOCHA) -R dot
	$(MOCHA) $(LIB:lib/%=-r instrumented/%) -R html-cov > coverage.html
	@xdg-open coverage.html &> /dev/null

clean:
	rm -rf instrumented
	rm coverage.html

.PHONY: test coverage clean install
