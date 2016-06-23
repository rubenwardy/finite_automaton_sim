function Vector(x, y) {
	if (typeof x == "object") {
		this.x = x.x;
		this.y = x.y;
		// console.log("new vector from vector. " + this.toString());
	} else {
		this.x = x || 0;
		this.y = y || 0;
		// console.log("new vector from params. " + this.toString());
	}
}

Vector.prototype.copy = function() {
	return new Vector(this);
}

Vector.prototype.toString = function() {
	return this.x + ", " + this.y;
};

Vector.prototype.mag = function() {
	// console.log("mag " + this.toString());
	return Math.sqrt(this.x*this.x + this.y*this.y);
};

Vector.prototype.nor = function() {
	var mag = this.mag();
	this.x /= mag;
	this.y /= mag;
	// console.log("normalised " + this.toString());
	return this;
};

Vector.prototype.add = function(other) {
	this.x += other.x;
	this.y += other.y;
	// console.log("add " + this.toString());
	return this;
};

Vector.prototype.sub = function(other) {
	this.x -= other.x;
	this.y -= other.y;
	// console.log("sub " + this.toString());
	return this;
};

Vector.prototype.mul = function(other) {
	if (other && other instanceof Vector) {
		this.x *= other.x;
		this.y *= other.y;

		// console.log("mul/v " + this.toString());
	} else {
		this.x *= other;
		this.y *= other;

		// console.log("mul/s " + this.toString());
	}
	return this;
};

Vector.prototype.direction = function(to) {
	// console.log("dir " + this.toString() + " to " + to.toString());
	return (new Vector(to)).sub(this).nor();
};
