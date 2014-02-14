
build: components lint
	@component build --dev

lint: index.js
	eslint index.js

components: component.json
	@component install --dev

clean:
	rm -fr build components

.PHONY: clean build
