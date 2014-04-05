
build:
	@component build

lint: index.js
	eslint index.js

clean:
	rm -fr build components

.PHONY: clean build
