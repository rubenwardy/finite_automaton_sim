# Finite Automaton Sim

Simulates DFAs and NFAs in Javascript.
Can run both in NodeJS and in HTML5.

Created by rubenwardy  
License: LGPL 2.1 or later.

## API Example

```Javascript
const assert = require('assert');
var Machine = require('./machine');
var Simulator = require('./simulator');

// DFA to accept even number of "a"s
var m = new Machine({a:true, b:true});
m.connect(0, 1, "a");
m.connect(1, 0, "a");
m.connect(0, 0, "b");
m.connect(1, 1, "b");
// implicit: m.makeInitial(0);
m.makeAccept(1);
assert(m.isValid()); // You should always check this

// Test
assert(len(m.states) == 2);
assert(!m.isAccept(m.states[0]));
assert(m.isAccept(m.states[1]));

// Run
var s = new Simulator(m);
assert(!s.isAccept());
s.step("a");
assert(s.isAccept());
```

## Command Line Usage (TODO)

Whilst in ndfa folder:

	nodejs .

Then use the command prompt

## Tests

Whilst in ndfa folder:

	mocha

	# or

	npm test
