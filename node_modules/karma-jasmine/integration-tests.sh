#!/bin/bash

PKG_FILE="$PWD/$(npm pack)"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

git clone https://github.com/karma-runner/integration-tests.git --depth 1

cd integration-tests

if [ "$CURRENT_BRANCH" = "jasmine-1_0" ]; then
  ./run.sh -g "jasmine$" $PKG_FILE
else
  ./run.sh -g "jasmine_2" $PKG_FILE
fi
