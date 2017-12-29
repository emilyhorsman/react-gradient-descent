import math from 'mathjs';


export function randomLinear() {
	const theta = math.matrix([[ Math.random() * 350, Math.random() * 50 - 25 ]]);
	return function(x) {
		const noise = math.ones(theta.size()[0], x.size()[1])
			.map(_ => Math.random() * 200);
		return math.add(math.multiply(theta, x), noise);
	};
}

function cost(theta, x, y) {
	const error = math.subtract(math.multiply(theta, x), y);
	return math.sum(math.square(error)) / (2 * x.size()[1]);
}


function gradientDescent(theta, x, y, learningRate) {
	const error = math.subtract(math.multiply(theta, x), y);
	const d = math.multiply(
		math.multiply(error, math.transpose(x)),
		learningRate / x.size()[1]
	);
	return math.subtract(theta, d);
}


export class GradientDescentOptimizer {
	constructor(f, learningRate) {
		this.f = f;
		this.learningRate = learningRate;
		this.x = math.matrix([
			math.ones(100),
			math.range(0, 100).map(x => x / 10)
		]);
		this.y = f(this.x);
		this.resetLearning();
	}

	resetLearning() {
		this.candidate = math.matrix([[ 1, 1 ]]).map(_ => 2 * Math.random() - 1);
		this.costs = [];
	}

	minimize() {
		for (let i = 0; i < 10; i++) {
			this.candidate = gradientDescent(
				this.candidate,
				this.x,
				this.y,
				this.learningRate
			);
			this.costs.push(cost(this.candidate, this.x, this.y));
		}
	}

	get trainingData() {
		const trainingData = [];
		for (let i = 0; i < 100; i++) {
			trainingData.push({
				x: i / 10,
				y: this.y.subset(math.index(0, i))
			});
		}
		return trainingData;
	}

	get predictionsData() {
		const predictions = math.multiply(this.candidate, this.x);
		const predictionsData = [];
		for (let i = 0; i < 100; i++) {
			predictionsData.push({
				x: i / 10,
				y: predictions.subset(math.index(0, i))
			});
		}
		return predictionsData;
	}

	get weightB() {
		return this.candidate.subset(math.index(0, 0));
	}

	get weightX() {
		return this.candidate.subset(math.index(0, 1));
	}

	set weightB(value) {
		this.candidate.subset(math.index(0, 0), value);
	}

	set weightX(value) {
		this.candidate.subset(math.index(0, 1), value);
	}
}
