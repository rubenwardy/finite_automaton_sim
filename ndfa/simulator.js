function Simulator(machine) {
	var node = machine.states[machine.initial];
	this.states = machine.getReachableStates(node);
	//console.log("Start states: " + this.states);
	this.m = machine;
}

Simulator.prototype.isAccept = function() {
	for (var i = 0; i < this.states.length; i++) {
		if (this.m.isAccept(this.m.states[this.states[i]])) {
			return true;
		}
	}
	return false;
}

Simulator.prototype.step = function(alpha) {
	// Dictionary used to ensure uniqueness
	var next = {};

	for (var i = 0; i < this.states.length; i++) {
		var state = this.m.states[this.states[i]];
		var res = this.m.delta(state, alpha);
		for (var j = 0; j < res.length; j++) {
			next[res[j]] = true;
		}
	}

	this.states = [];
	for (var i in next) {
		if (next.hasOwnProperty(i)) {
			this.states.push(i);
		}
	}

	//console.log("Stepped machine! Now at " + this.states);
}

module.exports = Simulator;
