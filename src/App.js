import React, { Component } from 'react';
import './App.css';
import math from 'mathjs';
import {
	VictoryChart,
	VictoryLine,
	VictoryScatter
} from 'victory';

function random_linear(theta) {
	return function(x) {
		const noise = math.ones(theta.size()[0], x.size()[1])
			.map(_ => Math.random() * 600);
		return math.add(math.multiply(theta, x), noise);
	};
}

const f = random_linear(math.matrix([[ 10, 40 ]]));
const x = math.matrix([
	math.ones(100),
	math.range(0, 100).map(x => x / 10)
]);
const y = f(x);


function cost(theta, x, y) {
	const error = math.subtract(math.multiply(theta, x), y);
	return math.sum(math.square(error)) / (2 * x.size()[1]);
}


function gradientDescent(theta, x, y, learning_rate) {
	const error = math.subtract(math.multiply(theta, x), y);
	const d = math.multiply(
		math.multiply(error, math.transpose(x)),
		learning_rate / x.size()[1]
	);
	return math.subtract(theta, d);
}


let candidate = math.matrix([[ 1, 1 ]]).map(_ => 2 * Math.random() - 1);
let costs = [];
for (let i = 0; i < 1000; i++) {
	candidate = gradientDescent(candidate, x, y, 0.03);
	costs.push(cost(candidate, x, y));
}

const trainingData = [];
for (let i = 0; i < 100; i++) {
	trainingData.push({
		x: i / 10,
		y: y.subset(math.index(0, i))
	});
}

const predictions = math.multiply(candidate, x);
const predictionsData = [];
for (let i = 0; i < 100; i++) {
	predictionsData.push({
		x: i / 10,
		y: predictions.subset(math.index(0, i))
	});
}


class App extends Component {
	render() {
		return (
			<span>
				<VictoryChart>
					<VictoryLine
						data={costs}
					/>
				</VictoryChart>

				<VictoryChart>
					<VictoryScatter
						data={trainingData}
					/>

					<VictoryLine
						data={predictionsData}
					/>
				</VictoryChart>
			</span>
		);
	}
}

export default App;
