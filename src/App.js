import React, { Component } from 'react';
import './App.css';
import math from 'mathjs';
import {
	VictoryAxis,
	VictoryChart,
	VictoryLine,
	VictoryScatter,
	VictoryTheme
} from 'victory';

import { GradientDescentOptimizer, random_linear } from './GradientDescent';

const f = random_linear(math.matrix([[ Math.random() * 300, Math.random() * 10 ]]));


const chartProps = {
	theme: VictoryTheme.material,
	domainPadding: 1
};


class App extends Component {
	constructor() {
		super();

		// This isn't directly tied to UI state and thus will be kept
		// as an instance variable, not in component state.
		this.optimizer = new GradientDescentOptimizer(f, 0.03);

		this.state = {
			costs: [],
			trainingData: [],
			predictionsData: [],
			input: {
				learningRate: this.optimizer.learningRate
			},
			isPlaying: false,
		}

		this.handleTick = this.handleTick.bind(this);
		this.handleTogglePlaying = this.handleTogglePlaying.bind(this);
		this.handleReset = this.handleReset.bind(this);
	}

	componentDidMount() {
		window.requestAnimationFrame(this.handleTick);
	}

	handleTick() {
		if (this.state.isPlaying) {
			this.optimizer.minimize();
			this.setState({
				costs: this.optimizer.costs,
				trainingData: this.optimizer.trainingData,
				predictionsData: this.optimizer.predictionsData,
			});
		}

		window.requestAnimationFrame(this.handleTick);
	}

	handleChange(key, event) {
		this.optimizer[key] = event.target.value;
		this.setState({
			input: {
				...this.state.input,
				[key]: event.target.value,
			}
		});
	}

	handleTogglePlaying() {
		this.setState({
			isPlaying: !this.state.isPlaying
		});
	}

	handleReset() {
		this.optimizer.resetLearning();
		this.setState({
			costs: [],
			trainingData: [],
			predictionsData: [],
		});
	}

	render() {
		const {
			costs,
			trainingData,
			predictionsData,
			input,
			isPlaying
		} = this.state;

		return (
			<span className="App">
				<span>
					<button onClick={this.handleTogglePlaying}>
						{isPlaying ? 'Pause' : 'Play'}
					</button>

					<button onClick={this.handleReset}>
						Reset
					</button>

					<label>
						Learning Rate:
						<input
							type="number"
							step={0.001}
							value={input.learningRate}
							onChange={this.handleChange.bind(this, 'learningRate')}
						/>
					</label>
				</span>

				<span className="Charts">
					<span>
						<VictoryChart {...chartProps}>
							<VictoryLine
								data={costs}
							/>
							<VictoryAxis
								crossAxis={false}
							/>
							<VictoryAxis
								crossAxis={false}
								dependentAxis
							/>
						</VictoryChart>
					</span>

					<span>
						<VictoryChart {...chartProps}>
							<VictoryScatter
								data={trainingData}
							/>

							<VictoryLine
								data={predictionsData}
							/>

							<VictoryAxis
								crossAxis={false}
							/>
							<VictoryAxis
								crossAxis={false}
								dependentAxis
							/>
						</VictoryChart>
					</span>
				</span>
			</span>
		);
	}
}

export default App;
