game = {}


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

	engine.c.font = "12px Arial";
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

function idToPosition(i, num_states, mid, dist) {
	var ang = 2 * 3.1415 * i / num_states + 3.1415;
	var x = mid.x + Math.cos(ang) * dist;
	var y = mid.y + Math.sin(ang) * dist;
	return {x: x, y: y};
}

function draw(ce, c) {
	engine.draw_fps();

	const mid = {
		x: ce.width / 2,
		y: ce.height / 2
	};

	var dist = mid.y;
	if (mid.x < dist)
		dist = mid.x;
	dist = 0.75 * dist;

	function drawState(id, pos, accept) {
		c.strokeStyle = "#CCC";
		if (accept) {
			c.beginPath();
			c.arc(pos.x, pos.y, 40, 0, 2 * Math.PI, false);
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
		c.arc(pos.x, pos.y, 30, 0, 2 * Math.PI, false);
		c.fill();
		c.stroke();

		c.fillStyle = "black";
		c.textAlign = "center";
		c.textBaseline = "middle";
		c.fillText(id, pos.x, pos.y);
	}

	function drawArcsFromState(state, pos) {
		function drawLabel(midpoint, arc) {
			c.fillStyle = "rgba(255, 255, 255, 0.5)";
			var w = 50;
			h = 20;
			c.fillRect(midpoint.x - w/2, midpoint.y - h/2, w, h);
			c.fillStyle = "black";
			c.textAlign = "center";
			c.textBaseline = "middle";
			c.fillText(arc, midpoint.x, midpoint.y);
		}
		for (var arc in state.arcs) {
			if (state.arcs.hasOwnProperty(arc)) {
				for (var j = 0; j < state.arcs[arc].length; j++) {
					var to = state.arcs[arc][j];
					var id = game.m.getIdFromState(to);
					var pos2 = idToPosition(id, num_states, mid, dist);
					var do_curve = game.m.states[String(to)].isConnectedTo(state.id);

					c.beginPath();
					c.moveTo(pos.x, pos.y);
					var midpoint = null;
					if (do_curve) {
						var dir = {
							x: pos2.x - pos.x,
							y: pos2.y - pos.y
						};
						var mag = Math.sqrt(dir.x*dir.x + dir.y*dir.y);
						dir.x *= 100 / mag;
						dir.y *= 100 / mag;

						var perp = {
							x: -dir.y,
							y: dir.x
						};

						midpoint = {
							x: (pos2.x + pos.x) / 2 + perp.x,
							y: (pos2.y + pos.y) / 2 + perp.y
						};

						//c.lineTo(midpoint.x, midpoint.y);
						//c.lineTo(pos2.x, pos2.y);
						c.quadraticCurveTo(midpoint.x, midpoint.y, pos2.x, pos2.y);
					} else {
						midpoint = {
							x: (pos2.x + pos.x) / 2,
							y: (pos2.y + pos.y) / 2
						};
						c.lineTo(pos2.x, pos2.y);
					}
					c.stroke();
					drawLabel(midpoint, arc);
				}
			}
		}
	}

	var num_states = len(game.m.states);
	var i = 0;
	for (var key in game.m.states) {
		if (game.m.states.hasOwnProperty(key)) {
			var pos = idToPosition(i, num_states, mid, dist);
			var state = game.m.states[key];
			drawArcsFromState(state, pos);
			i++;
		}
	}

	var start = idToPosition(game.m.getIdFromState(game.m.initial), num_states, mid, dist);
	c.beginPath();
	c.strokeStyle = "#ccc";
	c.moveTo(start.x - 100, start.y);
	c.lineTo(start.x, start.y);
	c.stroke();

	i = 0;
	for (var key in game.m.states) {
		if (game.m.states.hasOwnProperty(key)) {
			var pos = idToPosition(i, num_states, mid, dist);
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
