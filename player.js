game = {}


function init() {
	console.log("[Player] Init!");

	game.m = new Machine({a: true, b: true});
	game.m.connect(0, 1, "a");
	game.m.connect(1, 2, "a");
	game.m.connect(2, 2, "a");
	game.m.connect(0, 0, "b");
	game.m.connect(1, 0, "b");
	game.m.connect(2, 0, "b");
	game.m.makeAccept(2);
	game.s = new Simulator(game.m);

	console.log("[Player] Created default machine");

	engine.c.font = "12px Arial";
}

function update(ce, c, dtime) {

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

function draw(ce, c) {
	engine.draw_fps();

	var mid = {
		x: ce.width / 2,
		y: ce.height / 2
	};

	var dist = mid.y;
	if (mid.x < dist)
		dist = mid.x;
	dist = 0.75 * dist;

	var num_states = len(game.m.states);
	var i = 0;
	for (var key in game.m.states) {
		if (game.m.states.hasOwnProperty(key)) {
			var ang = 2 * 3.1415 * i / num_states + 3.1415;
			var x = mid.x + Math.cos(ang) * dist;
			var y = mid.y + Math.sin(ang) * dist;

			c.strokeStyle = "#666";
			if (game.m.states[key].accept) {
				c.beginPath();
				c.arc(x, y, 40, 0, 2 * Math.PI, false);
				c.stroke();
			}
			c.fillStyle = "#222";
			c.beginPath();
			c.arc(x, y, 30, 0, 2 * Math.PI, false);
			c.fill()
			c.stroke();
			i++;
		}
	}
}

function tick(ce, c, dtime) {
	update(ce, c, dtime);
	draw(ce, c);
}
