const Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celsius:
const MICROSECDONDS_PER_CM = 1e6/34321;
const MAX_VAL = 200;

module.exports = class Ultrasonic {
	constructor(pinTrigger, pinEcho, interval, numDebounce) {
		this._trigger = new Gpio(pinTrigger || 23, {mode: Gpio.OUTPUT});
		this._echo = new Gpio(pinEcho || 24, {mode: Gpio.INPUT, alert: true});
		this._trigger.digitalWrite(0); // Make sure trigger is low
		this._numDebounce = numDebounce || 10; // We average over a few measurements
		this._interval = (interval || 1000) / this._numDebounce;
		this._arrEventListeners = [];
		this._arrMeasurements = [];
	}
	// Allow registration of event listeners
	onObstacle(func) {
		if(typeof func === 'function') {
			this._arrEventListeners.push(func);
		} else {
			console.error('onObstacle event handler needs to be a function!');
		}
	}

	start() {
		// Register echo handler
		this._echo.on('alert', (level, tick) => {
			if (level == 1) {
				this.startTick = tick;
			} else {
				let endTick = tick;
				// Unsigned 32 bit arithmetic:
				let diff = (endTick >> 0) - (this.startTick >> 0);
				this._newDistance(diff / 2 / MICROSECDONDS_PER_CM);
			}
		});

		// Trigger a distance measurement once per interval
		this.ivFunc = setInterval(() => {
			// Set trigger high for 10 microseconds
			this._trigger.trigger(10, 1);
		}, this._interval);
	}

	stop() {
		if(this.ivFunc) {
			clearInterval(this.ivFunc);
			this.ivFunc = undefined;
		} 
	}

	_newDistance(dist) {
		this._arrMeasurements.push((dist > MAX_VAL) ? MAX_VAL : dist);
		if(this._arrMeasurements.length === this._numDebounce) {
			this._arrMeasurements.sort((a, b) => a - b);
			let val = this._getDebounced();
			this._emitEvent(val);
			this._arrMeasurements = [];
		}
	}

	_getDebounced() {
		let start = Math.floor(this._numDebounce/3);
		let end = Math.ceil(this._numDebounce*2/3);
		return this._arrMeasurements
			.slice(start, end)
			.reduce((p, c) => p + c, 0) / (end - start);
	}

	_emitEvent(data) {
		for (let i = 0; i < this._arrEventListeners.length; i++) {
			// we put the callbacks on top of the event stack with setTimeout(cb, 0) which will
			// execute them as soon as there are available resources (JS best practice).
			// This will not block the current scope even if one of the callbacks causes
			// heavy CPU or I/O load
			setTimeout(() => { this._arrEventListeners[i](data); }, 0);
		}
	}
};
