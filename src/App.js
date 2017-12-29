import React, { Component } from 'react';
import './App.css';
import {
	VictoryAxis,
	VictoryChart,
	VictoryLine,
	VictoryScatter,
	VictoryTheme
} from 'victory';

import { GradientDescentOptimizer, randomLinear } from './GradientDescent';


const chartProps = {
	theme: VictoryTheme.material,
	domainPadding: 1
};


class App extends Component {
	constructor() {
		super();

		// This isn't directly tied to UI state and thus will be kept
		// as an instance variable, not in component state.
		this.optimizer = new GradientDescentOptimizer(randomLinear(), 0.03);

		this.state = {
			costs: [],
			trainingData: this.optimizer.trainingData,
			predictionsData: this.optimizer.predictionsData,
			input: {
				learningRate: this.optimizer.learningRate,
				weightB: this.optimizer.weightB,
				weightX: this.optimizer.weightX,
			},
			isPlaying: false,
		}

		this.handleTick = this.handleTick.bind(this);
		this.handleTogglePlaying = this.handleTogglePlaying.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.handleNewData = this.handleNewData.bind(this);
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
				input: {
					...this.state.input,
					weightB: this.optimizer.weightB,
					weightX: this.optimizer.weightX,
				}
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
			trainingData: this.optimizer.trainingData,
			predictionsData: this.optimizer.predictionsData,
		});
	}

	handleNewData() {
		this.optimizer = new GradientDescentOptimizer(
			randomLinear(),
			this.state.input.learningRate
		);
		this.handleReset();
	}

	render() {
		const {
			costs,
			trainingData,
			predictionsData,
			input,
			isPlaying
		} = this.state;

		const maxY = trainingData.reduce((m, d) => Math.max(m, d.y), 1);

		return (
			<span className="App">
				<span>
					<button onClick={this.handleTogglePlaying}>
						{isPlaying ? 'Pause' : 'Play'}
					</button>

					<button onClick={this.handleReset}>
						Reset
					</button>

					<button onClick={this.handleNewData}>
						New Data!
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

					<label>
						Learned Weights:

						<input
							type="number"
							step={0.25}
							value={input.weightB}
							onChange={this.handleChange.bind(this, 'weightB')}
							disabled={isPlaying}
						/>

						<input
							type="number"
							step={0.25}
							value={input.weightX}
							onChange={this.handleChange.bind(this, 'weightX')}
							disabled={isPlaying}
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
								domain={{ x: [0, 10], y: [0, maxY] }}
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
