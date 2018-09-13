function Gpio() {
	console.log('Instantiating pigpio Gpio stub');
	function dw() {
		console.log('Executing pigpio digitalWrite stub');
	}
	function trigger() {
		console.log('Executing pigpio trigger stub');
	}
	function on() {
		console.log('Executing pigpio on stub');
	}
	return {
		digitalWrite: dw,
		trigger: trigger,
		on: on
	};
}

module.exports = {
	Gpio: Gpio,
	OUTPUT: 'stub',
	INPUT: 'stub'
};