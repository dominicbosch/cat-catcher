module.exports = class i2c {
	readBytes(a, b, cb) {
		console.log('readBytes stub i2c');
		cb(null, []);
	}
	writeBytes(a, b, cb) {
		console.log('writeBytes stub i2c');
		cb();
	}
};