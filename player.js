game = {}
var STATE_RADIUS = 40;


function init() {
	console.log("[Player] Init!");

	game.input = ['a', 'b', 'a', 'a', 'a', 'b', 'a', 'a'];
	game.title = "DFA to accept strings ending in aa";
	game.m = new Machine({a: true, b: true});
	game.m.connect(0, 1, "a");
	game.m.connect(1, 2, "a");
	game.m.connect(2, 2, "a");
	game.m.connect(0, 0, "b");
	game.m.connect(1, 0, "b");
	game.m.connect(2, 0, "b");
	game.m.makeAccept(2);
	game.s = new Simulator(game.m);
	start();

	console.log("[Player] Created default machine");

	if (!game.m.isValid()) {
		throw("Invalid DFA!");
	}

	var c = engine.c;
	c.textAlign = "center";
	c.textBaseline = "middle";
	c.font = "12px Arial";
}

function start() {
	$("#title").text(game.title);
	var res = "";
	for (var i = 0; i < game.input.length; i++) {
		res += "<li>" + game.input[i] + "</li>";
	}
	$("#input").html(res);
}

function step() {
	if (game.input.length > 0) {
		var alpha = game.input[0];
		game.s.step(alpha);
		game.input = game.input.splice(1, game.input.length - 1);
		console.log("Popped " + alpha + " remaining: " + game.input);
		var obj_list = $("#input > li");
		$(obj_list[obj_list.length - game.input.length - 1]).addClass("done");
	} else {
		console.log("Finished. Accept: " + game.s.isAccept());
	}
}

var count = 0;
function update(ce, c, dtime) {
	count += dtime;
	if (count > 0.5) {
		count = 0;
		step();
	}
}

function len(dict) {
	var count = 0;
	for (var i in dict) {
		if (dict.hasOwnProperty(i)) {
			count++;
		}
	}
	return count;
}

function idToPosition(i, num_states, screen_mid, state_dist_from_origin) {
	var ang = 2 * 3.1415 * i / num_states + 3.1415;
	var res = new Vector(screen_mid);
	res.x += Math.cos(ang) * state_dist_from_origin;
	res.y += Math.sin(ang) * state_dist_from_origin;
	return res;
}

function draw(ce, c) {
	const screen_mid = {
		x: ce.width / 2,
		y: ce.height / 2
	};

	var state_dist_from_origin = screen_mid.y;
	if (screen_mid.x < state_dist_from_origin) {
		state_dist_from_origin = screen_mid.x;
	}
	state_dist_from_origin = 0.75 * state_dist_from_origin;

	function drawState(id, pos, accept) {
		c.strokeStyle = "#CCC";
		if (accept) {
			c.beginPath();
			c.arc(pos.x, pos.y, STATE_RADIUS, 0, 2 * Math.PI, false);
			c.stroke();
		}
		if (game.s.states.indexOf(id) >= 0) {
			if (game.input.length == 0 && game.m.isAccept(game.m.states[id])) {
				c.fillStyle = "#6F6";
			} else {
				c.fillStyle = "#66F";
			}
		} else {
			c.fillStyle = "#666";
		}
		c.beginPath();
		c.arc(pos.x, pos.y, STATE_RADIUS - 10, 0, 2 * Math.PI, false);
		c.fill();
		c.stroke();

		c.fillStyle = "black";
		c.fillText(id, pos.x, pos.y);
	}

	function drawArcsFromState(state, pos) {
		function drawLabel(midpoint, arc) {
			c.fillStyle = "rgba(255, 255, 255, 0.5)";
			var w = 50;
			h = 20;
			c.fillRect(midpoint.x - w/2, midpoint.y - h/2, w, h);
			c.fillStyle = "black";
			c.fillText(arc, midpoint.x, midpoint.y);
		}
		for (var arc in state.arcs) {
			if (state.arcs.hasOwnProperty(arc)) {
				for (var j = 0; j < state.arcs[arc].length; j++) {
					var to = state.arcs[arc][j];
					var to_id = game.m.getIdFromState(to); // target state id
					var to_pos = idToPosition(to_id, num_states, screen_mid, state_dist_from_origin); // other state pos

					// Only curve if there are returning arcs
					var loop_back = (to_id == state.id);
					var do_curve = game.m.states[String(to)].isConnectedTo(state.id);

					// Normalised direction
					var dir = pos.direction(to_pos);

					// Draw line (and find midpoint of line)
					c.beginPath();
					var midpoint = null;
					var endpoint = to_pos;
					c.moveTo(pos.x, pos.y);
					if (loop_back) {
						midpoint = pos.copy().add(new Vector(0, 3*STATE_RADIUS));
						c.moveTo(pos.x - STATE_RADIUS*0.5, pos.y);
						c.lineTo(midpoint.x, midpoint.y);
						endpoint = new Vector(pos.x + STATE_RADIUS*0.5, pos.y);
						c.lineTo(endpoint.x, endpoint.y);
					} else if (do_curve) {
						var perp = dir.perp().mul(100);
						midpoint = to_pos.copy().add(pos).mul(0.5).add(perp);

						//c.lineTo(midpoint.x, midpoint.y);
						//c.lineTo(to_pos.x, to_pos.y);
						c.quadraticCurveTo(midpoint.x, midpoint.y, to_pos.x, to_pos.y);
					} else {
						midpoint = to_pos.copy().add(pos).mul(0.5);
						c.lineTo(to_pos.x, to_pos.y);
					}
					c.stroke();

					// Arrow tip
					var dir_midpoint = endpoint.direction(midpoint);
					var arrow_perp = dir_midpoint.perp().mul(10);
					var tip = dir_midpoint.copy().mul(STATE_RADIUS + 10).add(endpoint);
					var tail = dir_midpoint.copy().mul(STATE_RADIUS * 1.5 + 10).add(endpoint);
					var left = tail.copy().add(arrow_perp);
					var right = tail.copy().sub(arrow_perp);
					c.beginPath();
					c.moveTo(tip.x, tip.y);
					c.lineTo(left.x, left.y);
					c.lineTo(right.x, right.y);
					c.lineTo(tip.x, tip.y);
					c.fillStyle = "white";
					c.fill();

					// Draw arc label
					drawLabel(midpoint, arc);
				} // end for each arc in arcs
			} // end if has own property
		} //end for arcs in state.arcs
	} // end drawArcsFromState()

	var num_states = len(game.m.states);
	var i = 0;
	for (var key in game.m.states) {
		if (game.m.states.hasOwnProperty(key)) {
			var pos = idToPosition(i, num_states, screen_mid, state_dist_from_origin);
			var state = game.m.states[key];
			drawArcsFromState(state, pos);
			i++;
		}
	}

	var start = idToPosition(game.m.getIdFromState(game.m.initial), num_states, screen_mid, state_dist_from_origin);
	c.beginPath();
	c.strokeStyle = "#ccc";
	c.moveTo(start.x - 100, start.y);
	c.lineTo(start.x, start.y);
	c.stroke();

	i = 0;
	for (var key in game.m.states) {
		if (game.m.states.hasOwnProperty(key)) {
			var pos = idToPosition(i, num_states, screen_mid, state_dist_from_origin);
			var state = game.m.states[key];
			drawState(key, pos, state.accept);
			i++;
		}
	}
}

function tick(ce, c, dtime) {
	update(ce, c, dtime);
	draw(ce, c);
}
