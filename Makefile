test:
	./node_modules/mocha/bin/mocha \
	  --reporter list --recursive

.PHONY: test
