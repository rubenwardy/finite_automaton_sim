var Machine = require('./machine');
var Simulator = require('./simulator');

var expect = require("chai").expect;

describe("Vectors", function() {
	it("should has a magnitude", function() {
		var v = Vector(1, 0);
		expect(v.mag()).to.equal(1);
	});
});
