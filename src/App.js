import React, { Component } from 'react';
import './App.css';
import {
	VictoryAxis,
	VictoryChart,
	VictoryLabel,
	VictoryLine,
	VictoryScatter,
	VictoryTheme,
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
				<span className="Controls">
					<p>
					We want to draw a straight line through the <span style={{ color: 'tomato' }}>red data points</span> below, but not just any line!
					In the future, we might be given a new <span style={{ color: 'tomato' }}>red data point</span> without knowing exactly where to put it.
					We want to be able to put it on the straight line as the best prediction of where it should go as a straight line can offer.
					The gradient descent algorithm lets us do this.
					We start with a random initial assumption of the coefficients of our line.
					Then we determine how far off this line is from all our <span style={{ color: 'tomato' }}>red data points</span> and call this our loss.
					In one iteration, we adjust the coefficients so that our line takes a small step towards reducing the loss we just calculated.
					Then we keep repeating!
					This is called a <b>gradient descent algorithm</b> because we take the derivative of the function that computes our loss and look at which direction we can descend to reduce our loss.
					This is ultimately an optimization problem where we are trying to minimize the loss as much as possible, best fitting our <span style={{ color: 'tomato' }}>red data points</span>.
					</p>

					<span>
						<button onClick={this.handleTogglePlaying}>
							{isPlaying ? 'Pause' : 'Play'}
						</button>

						<p>
							Hitting Play will start running the optimizer!
							It will keep computing iterations that have our <span style={{ color: 'magenta' }}>magenta line</span> get closer to fitting our <span style={{ color: 'tomato' }}>red data points</span> until you hit Pause.
						</p>
					</span>

					<span>
						<button onClick={this.handleReset}>
							Reset
						</button>

						<p>
							This will wipe out the iterations we’ve computed so far, but won’t touch your carefully chosen learning rate.
						</p>
					</span>

					<span>
						<button onClick={this.handleNewData}>
							New Data!
						</button>

						<p>
							Maybe you’re tired of these <span style={{ color: 'tomato' }}>red data points</span> and want to exchange them for some new ones.
						</p>
					</span>

					<span>
						<label>
							Learning Rate:
							<input
								type="number"
								step={0.001}
								value={input.learningRate}
								onChange={this.handleChange.bind(this, 'learningRate')}
							/>
						</label>

						<p>
							This value tells our optimizer how large a step to take each iteration.
							If the graph on the left blows up and makes no sense at all, the optimizer probably descended too far and overshot back up a hill — lower the value.
							If the <span style={{ color: 'magenta' }}>magenta line</span> takes too long to fit the points — raise this value.
							If the <span stlye={{ color: 'magenta' }}>magenta line</span> changes its slope but doesn’t seem to change its offset — raise this value.
						</p>
					</span>

					<span>
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

						<p>
							These are the coefficients of our <span style={{ color: 'magenta' }}>magenta line</span>!
							They will be randomly selected at first, and then will change as you run the optimizer.
						</p>
					</span>
				</span>

				<span className="Charts">
					<span>
						<VictoryChart {...chartProps}>
							<VictoryLabel
								text="Mean Squared Error over descent iterations"
								x={50}
								y={30}
							/>

							<VictoryLine
								data={costs}
							/>
							<VictoryAxis
								crossAxis={false}
							/>
							<VictoryAxis
								fixLabelOverlap={true}
								crossAxis={false}
								dependentAxis
							/>

							{!isPlaying && costs.length === 0 &&
								<VictoryLabel
									text="Press Play!"
									x={175}
									y={175}
									textAnchor="middle"
									style={{
										fontSize: 24,
										fill: 'grey',
										stroke: 'grey'
									}}
								/>
							}

						</VictoryChart>
					</span>

					<span>
						<VictoryChart {...chartProps}>
							<VictoryScatter
								data={trainingData}
								style={{
									data: {
										fill: 'tomato'
									}
								}}
							/>

							<VictoryLine
								data={predictionsData}
								domain={{ x: [0, 10], y: [0, maxY] }}
								style={{
									data: {
										stroke: 'magenta',
										strokeWidth: 3,
										strokeLinecap: 'round'
									}
								}}
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
