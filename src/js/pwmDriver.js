const I2C = require('./i2cWrapper');
const NanoTimer = require('nanotimer');

function usleep(micros) {
	return new Promise(
		function (resolve) {
			const timer = new NanoTimer();
			timer.setTimeout(() => resolve(micros), '', `${micros}u`);
			timer.clearInterval();
		});
}

// ============================================================================
// Adafruit PCA9685 16-Channel PWM Servo Driver
// ============================================================================
module.exports = makePwmDriver;

function makePwmDriver(options) {
	// Registers/etc.
	const MODE1 = 0x00;
	const MODE2 = 0x01;
	const PRESCALE = 0xFE;
	const LED0_ON_L = 0x06;
	const LED0_ON_H = 0x07;
	const LED0_OFF_L = 0x08;
	const LED0_OFF_H = 0x09;
	const ALL_LED_ON_L = 0xFA;
	const ALL_LED_ON_H = 0xFB;
	const ALL_LED_OFF_L = 0xFC;
	const ALL_LED_OFF_H = 0xFD;

	// Bits
	const SLEEP = 0x10;
	const ALLCALL = 0x01;
	const OUTDRV = 0x04;

	const defaults = {
		address: 0x40,
		device: '/dev/i2c-1',
		debug: false
	};
	const { address, device, debug } = Object.assign({}, defaults, options);
	const i2c = I2C(address, { device, debug });
	let prescale;

	const init = () => {
		if (debug) {
			console.log(`device //{device}, adress:${address}, debug:${debug}`);
			console.log(`Reseting PCA9685, mode1: ${MODE1}`);
		}
		return setAllPWM(0, 0)
			.then(() => i2c.writeBytes(MODE2, OUTDRV))
			.then(() => i2c.writeBytes(MODE1, ALLCALL))
			.then(() => usleep(5000))
			.then(() => i2c.readBytes(MODE1, 1))
			.then((mode1) => {
				mode1 = mode1 & ~SLEEP; // wake up (reset sleep)
				return i2c.writeBytes(MODE1, mode1);
			})
			.then(() => usleep(5000)) // wait for oscillator)
			.then(() => debug ? console.log('init done ') : '');
	};

	const setPWMFreq = freq => {
		// "Sets the PWM frequency"
		let prescaleval = 25000000.0; // 25MHz
		prescaleval /= 4096.0; // 12-bit
		prescaleval /= freq;
		prescaleval -= 1.0;

		if (debug) {
			console.log(`Setting PWM frequency to ${freq} Hz`);
			console.log(`Estimated pre-scale: ${prescaleval}`);
		}
		prescale = Math.floor(prescaleval + 0.5);
		if (debug) {
			console.log(`Final pre-scale: ${prescale}`);
		}
		let oldmode;
		let newmode;
		return i2c.readBytes(MODE1, 1)
			.then(function (data) {
				oldmode = data[0];
				newmode = (oldmode & 0x7F) | 0x10; // sleep
				if (debug) {
					console.log(`prescale ${Math.floor(prescale)}, newMode: newmode.toString(16)`);
				}
				return i2c.writeBytes(MODE1, newmode); // go to sleep
			})
			.then(() => i2c.writeBytes(PRESCALE, Math.floor(prescale)))
			.then(() => i2c.writeBytes(MODE1, oldmode))
			.then(() => usleep(5000))
			.then(() => i2c.writeBytes(MODE1, oldmode | 0x80));
	};

	// Sets a single PWM channel
	const setPWM = (channel, on, off) => {
		if (debug) {
			console.log(`Setting PWM channel, channel: ${channel}, on : ${on} off ${off}`);
		}
		return i2c.writeBytes(LED0_ON_L + 4 * channel, on & 0xFF)
			.then(() => i2c.writeBytes(LED0_ON_H + 4 * channel, on >> 8))
			.then(() => i2c.writeBytes(LED0_OFF_L + 4 * channel, off & 0xFF))
			.then(() => i2c.writeBytes(LED0_OFF_H + 4 * channel, off >> 8));
	};

	const setAllPWM = (on, off) => {
		return i2c.writeBytes(ALL_LED_ON_L, on & 0xFF)
			.then(() => i2c.writeBytes(ALL_LED_ON_H, on >> 8))
			.then(() => i2c.writeBytes(ALL_LED_OFF_L, off & 0xFF))
			.then(() => i2c.writeBytes(ALL_LED_OFF_H, off >> 8));
	};

	const stop = () => i2c.writeBytes(ALL_LED_OFF_H, 0x01);

	// actual init

	return {
		init,
		setPWM,
		setAllPWM,
		setPWMFreq,
		stop
	};
}