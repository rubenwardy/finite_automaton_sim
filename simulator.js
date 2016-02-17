function Simulator(machine) {
	this.states = [machine.initial];
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
	console.log("Stepping machine! At " + this.states);

	// Dictionary used to ensure uniqueness
	var next = {};

	for (var i = 0; i < this.states.length; i++) {
		var state = this.m.states[this.states[i]];
		var res = this.m.delta(state, alpha);
		console.log("State delta returned: " + res.length)
		for (var j = 0; j < res.length; j++) {
			next[res[j]] = true;
		}
	}

	this.states = [];
	for (var i in next) {
		if (next.hasOwnProperty(i)) {
			this.states.push(i);
			console.log("In state " + i);
		}
	}
}

module.exports = Simulator;
