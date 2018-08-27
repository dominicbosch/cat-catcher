const Gpio = require('pigpio').Gpio;

const arrEventListeners = [];
// The number of microseconds it takes sound to travel 1cm at 20 degrees celsius:
const MICROSECDONDS_PER_CM = 1e6/34321;

module.exports = class Ultrasonic {
	constructor(pinTrigger, pinEcho, interval) {
		this.trigger = new Gpio(pinTrigger || 4, {mode: Gpio.OUTPUT});
		this.echo = new Gpio(pinEcho || 17, {mode: Gpio.INPUT, alert: true});
		this.trigger.digitalWrite(0); // Make sure trigger is low
		this.interval = interval || 1000;
	}
	
	// Allow registration of event listeners
	onObstacle(func) {
		if(typeof func === 'function') {
			arrEventListeners.push(func);
		} else {
			console.error('onObstacle event handler needs to be a function!');
		}
	}

	start() {
		// Register echo handler
		echo.on('alert', (level, tick) => {
			if (level == 1) {
				this.startTick = tick;
			} else {
				let endTick = tick;
				 // Unsigned 32 bit arithmetic:
				let diff = (endTick >> 0) - (this.startTick >> 0);
				emitEvent(diff / 2 / MICROSECDONDS_PER_CM);
			}
		});

		// Trigger a distance measurement once per interval
		this.ivFunc = setInterval(() => {
			// Set trigger high for 10 microseconds
			this.trigger.trigger(10, 1);
		}, this.interval);
	}

	stop() {
		if(this.ivFunc) {
			clearInterval(this.ivFunc);
			this.ivFunc = undefined;
		} 
	}
};

function emitEvent(data) {
	for (let i = 0; i < arrEventListeners.length; i++) {
		// we put the callbacks on top of the event stack with setTimeout(cb, 0) which will
		// execute them as soon as there are available resources (JS best practice).
		// This will not block the current scope even if one of the callbacks causes
		// heavy CPU or I/O load
		setTimeout(() => { arrEventListeners[i](data) }, 0);
	}
}