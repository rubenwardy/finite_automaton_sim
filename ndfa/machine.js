var DFA = 1;
var NFA = 2;
var EPS = -1;

function State(id, arcs)
{
	this.id = id;
	this.arcs = arcs || {};
	this.accept = false;
}

State.prototype.isConnectedTo = function(other) {
	for (var key in this.arcs) {
		if (this.arcs.hasOwnProperty(key)) {
			if (this.arcs[key].indexOf(other) >= 0) {
				return true;
			}
		}
	}
	return false;
}

function Machine(alpha, type)
{
	this.initial = 0;
	this.states = {};
	this.type = type || DFA;
	this.alpha = alpha || {};
}

Machine.prototype.isInAlpha = function(alpha) {
	return this.alpha[alpha];
}

Machine.prototype.getIdFromState = function(key2find) {
	var i = 0;
	for (var key in game.m.states) {
		if (game.m.states.hasOwnProperty(key)) {
			if (key == key2find) {
				return i;
			}
			i++;
		}
	}
	return -1;
}

Machine.prototype.getOrMakeState = function(id) {
	var state = this.states[id];
	if (!state) {
		state = new State(id, {});
		this.states[id] = state;
	}
	return state;
}

Machine.prototype.connect = function(from, to, alpha) {
	from = String(from);
	to = String(to);
	// console.log("Conecting "  + from + " to " + to + " (given: " + alpha + ")");

	var one = this.states[from];
	if (!one) {
		one = new State(from, {});
		this.states[from] = one;
	}

	var two = this.states[to];
	if (!two) {
		two = new State(to, {});
		this.states[to] = two;
	}

	if (!one.arcs[alpha]) {
		one.arcs[alpha] = [to];
	} else if (this.type == NFA || one.arcs[alpha].length == 0) {
		one.arcs[alpha].push(to);
	} else {
		throw new Error("Incorrect DFA: only one outgoing allowed per alphabet");
	}
}

Machine.prototype.makeInitial = function(id) {
	this.initial = String(id);
}

Machine.prototype.makeAccept = function(id) {
	var state = this.states[String(id)];
	state.accept = true;
}

Machine.prototype.isAccept = function(state) {
	if (state) {
		return state.accept;
	} else {
		return false;
	}
};

Machine.prototype.getAccepts = function() {
	var res = [];
	for (var sid in this.states) {
		if (!this.states.hasOwnProperty(sid)) continue;
		var state = this.states[sid];
		if (this.isAccept(state)) {
			res.push(sid);
		}
	}
	return res;
}

Machine.prototype.isValid = function() {
	for (var sid in this.states) {
		if (!this.states.hasOwnProperty(sid)) continue;

		var state = this.states[sid];
		for (var alpha in state.arcs) {
			if (!state.arcs.hasOwnProperty(alpha)) continue;

			if (!this.isInAlpha(alpha) && (this.type != NFA || alpha != EPS)) {
				//console.log(alpha + " is not in alphabet!");
				return false;
			}
		}

		if (this.type == DFA) {
			for (var alpha in this.alpha) {
				if (!this.alpha.hasOwnProperty(alpha)) continue;

				if (!state.arcs[alpha]) {
					//console.log(alpha + " is in alphabet but is not an arc!");
					return false;
				}
			}
		}
	}

	return true;
}

Machine.prototype.getReachableStates = function(state) {
	var res = [state.id];
	if (this.type == NFA && state.arcs[EPS]) {
		for (var i = 0; i < state.arcs[EPS].length; i++) {
			res.push(state.arcs[EPS][i]);
		}
	}
	return res;
}

Machine.prototype.delta = function(state, alpha) {
	var next = state.arcs[alpha];
	if (this.type == DFA) {
		if (next) {
			return next;
		} else {
    		throw new Error("Incorrect DFA or invalid input.");
		}
	} else if (this.type == NFA) {
		var res = [];
		if (next) {
			for (var i = 0; i < next.length; i++) {
				var node = this.states[next[i]];
				var reachable = this.getReachableStates(node);
				for (var j = 0; j < reachable.length; j++) {
					res.push(reachable[j]);
				}
			}
		}

		return res;
	} else {
		console.log("Unknown machine type!");
	}
};

Machine.prototype.makeValid = function() {
	for (var sid in this.states) {
		if (this.states.hasOwnProperty(sid)) {
			var state = this.states[sid];

			// Check for deleted states and alphabet letters in trans func
			for (var alpha in state.arcs) {
				if (this.alpha[alpha]) {
					var arc = state.arcs[alpha];
					var new_arc = [];
					for (var i = 0; i < arc.length; i++) {
						var sid2 = arc[i];
						if (this.states[sid2]) {
							new_arc.push(sid2);
						}
					}
					state.arcs[alpha] = new_arc;
				} else {
					delete state.arcs[alpha];
				}
			}

			// Check for new alphabet letters or empty trans func cells
			for (var alpha in this.alpha) {
				var arc = state.arcs[alpha];
				if (this.type == DFA) {
					if (!arc || arc.length != 1) {
						state.arcs[alpha] = [ sid ];
					}
				} else if (!arc) {
					state.arcs[alpha] = [];
				}
			}

		}
	}
}

module.exports = Machine;
