COFFEE = ./node_modules/.bin/coffee
WATCH = $(COFFEE) ./tools/watch.coffee

LIBDIR = lib
SRCDIR = src

SRC = $(wildcard $(SRCDIR)/*.coffee)
LIB = $(SRC:$(SRCDIR)/%.coffee=$(LIBDIR)/%.js)

.SUFFIXES: .coffee .js
.PHONY: all build watch clean

all: build
build: $(LIB)

$(LIB): $(LIBDIR)

$(LIBDIR):
	@mkdir -p "$@"

$(LIBDIR)/%.js: $(SRCDIR)/%.coffee $(LIBDIR)
	$(COFFEE) -j < "$<" > "$@"

clean:
	@rm -r $(LIBDIR)

publish: build
	npm publish .

watch:
	$(WATCH) $(LIBDIR) $(SRCDIR)
