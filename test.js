//const assert = require('assert');
var EPS = -1;
var Machine = require('./machine');
var Simulator = require('./simulator');

var expect = require("chai").expect;

function len(dict) {
	var count = 0;
	for (var i in dict) {
		if (dict.hasOwnProperty(i)) {
			count++;
		}
	}
	return count;
}

describe("Machine", function() {
	it("should have an alphabet", function() {
		var m = new Machine({a:true, b:true});

		expect(len(m.alpha)).to.equal(2);
		expect(m.isInAlpha("a")).is.true;
		expect(m.isInAlpha("b")).is.true;
		expect(m.isInAlpha("c")).is.not.true;
	})

	it("should connect two nodes", function() {
		var m = new Machine({a:true, b:true});
		m.connect(0, 1, "a");

		expect(len(m.states)).to.equal(2);
		expect(m.states).to.have.property(0);
		expect(m.states).to.have.property(1);

		var one = m.states[0];
		var two = m.states[1];
		expect(len(one.arcs)).to.equal(1);
		expect(len(two.arcs)).to.equal(0);
		expect(one.arcs).to.have.property("a");
		expect(one.arcs["a"].length).to.equal(1);
		expect(one.arcs["a"][0]).to.equal(1);
	});

	it("should recognise accept states", function() {
		var m = new Machine({a:true, b:true});
		m.connect(0, 1, "a");
		expect(m.isAccept(m.states[0])).is.not.true;
		expect(m.isAccept(m.states[1])).is.not.true;
		m.makeAccept(0);
		expect(m.isAccept(m.states[0])).is.true;
		expect(m.isAccept(m.states[1])).is.not.true;
		m.makeAccept(1);
		expect(m.isAccept(m.states[0])).is.true;
		expect(m.isAccept(m.states[1])).is.true;
	});

	describe("DFA", function() {
		it("should validate correctly", function() {
			var m = new Machine({a:true, b:true});
			m.connect(0, 1, "a");
			m.connect(1, 0, "a");

			expect(m.isValid()).is.not.true;

			m.connect(0, 0, "b");
			m.connect(1, 1, "b");
			m.makeInitial(0);

			expect(m.isValid()).is.true;
		});

		it("should return next state", function() {
			var m = new Machine({a:true, b:true});
			m.connect(0, 1, "a");

			var res = m.delta(m.states[0], "a");
			expect(res).is.not.undefined;
			expect(res).is.not.null;
			expect(res.length).to.equal(1);
			expect(res[0]).to.equal(1);
		});
	});

	describe("NFA", function() {
		it("should validate correctly", function() {
			var m = new Machine({a:true, b:true}, 2);

			m.connect(0, 1, "a");
			m.connect(1, 0, "a");
			expect(m.isValid()).is.true;

			m.connect(0, 0, "b");
			m.connect(1, 1, "b");
			expect(m.isValid()).is.true;

			m.connect(0, 0, "a");
			expect(m.isValid()).is.true;

			m.connect(0, 0, EPS);
			expect(m.isValid()).is.true;

			m.connect(0, 1, "c");
			expect(m.isValid()).is.not.true;
		});

		it("should connect more than one output", function() {
			var m = new Machine({a:true, b:true}, 2);
			m.connect(0, 0, "a");
			m.connect(0, 1, "a");

			expect(len(m.states)).to.equal(2);
			expect(m.states).to.have.property(0);
			expect(m.states).to.have.property(1);

			var one = m.states[0];
			var two = m.states[1];
			expect(len(one.arcs)).to.equal(1);
			expect(len(two.arcs)).to.equal(0);
			expect(one.arcs).to.have.property("a");
			expect(one.arcs["a"].length).to.equal(2);
			expect(one.arcs["a"][0]).to.equal(0);
			expect(one.arcs["a"][1]).to.equal(1);
		});

		it("should return next state", function() {
			var m = new Machine({a:true, b:true}, 2);
			m.connect(0, 1, "a");

			var res = m.delta(m.states[0], "a");
			expect(res).is.not.undefined;
			expect(res).is.not.null;
			expect(res.length).to.equal(1);
			expect(res[0]).to.equal(1);
		});

		it("should return empty list on bad input", function() {
			var m = new Machine({a:true, b:true}, 2);
			m.connect(0, 1, "a");

			var res = m.delta(m.states[0], "b");
			expect(res).is.not.undefined;
			expect(res).is.not.null;
			expect(res.length).to.equal(0);
		});

		it("should return multiple next nodes", function() {
			var m = new Machine({a:true, b:true}, 2);
			m.connect(0, 0, "a");
			m.connect(0, 1, "a");

			var res = m.delta(m.states[0], "a");
			expect(res).is.not.undefined;
			expect(res).is.not.null;
			expect(res.length).to.equal(2);
			expect(res[0]).to.equal(0);
			expect(res[1]).to.equal(1);
		});
	});
});


describe("Simulator", function() {
	describe("DFA", function() {
		it("should recognise accept states", function() {
			var m = new Machine({a:true, b:true});
			m.connect(0, 1, "a");

			var s = new Simulator(m);
			expect(s.isAccept()).is.not.true;

			m.makeAccept(0);
			expect(s.isAccept()).is.true;
		});
	});


	describe("NFA", function() {
		it("should recognise accept states", function() {
			var m = new Machine({a:true, b:true}, 2);
			m.connect(0, 1, "a");
			m.connect(0, 2, "a");

			var s = new Simulator(m);
			expect(s.isAccept()).is.not.true;
			s.step("a");
			expect(s.isAccept()).is.not.true;
			m.makeAccept(2);
			expect(s.isAccept()).is.true;
		});
	});
});
