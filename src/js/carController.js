const pyFaces = require('./pythonFaces');
const car = require('./cardo');

var exports = module.exports = {};
let conf;
let reqConfig = [
	'slowDownDistance', // distance to obstacle when we start to slow down
	'stopDistance',		// distance to obstacle when to stop
	'obstacleCount',	// num of consecutive obstacle detections for a verified obstacle
	'turnTime',			// time to smoothly turn into the right direction
	'speedUpTime',		// we speed up over 3000ms
	'stayTime',			// we stay at full speed for 5000ms
	'stopTime',			// we slow down and stop until 10000ms passed
];
let isRunning = false;
let steerInterval;
let facePosition = 0;
let lastFaceDetect = 0;
let rampUpFace = 0;
let lastState;
let stateMessages = {
	accelerating: 'Accelerating because face detected!',
	fullspeed: 'Staying at full speed!',
	slowdown: 'Slowing down because no more faces!',
	nofacebreak: 'Breaking because no faces!',
	obstacle: 'Slowing down because of obstacle!',
	obstaclebreak: 'Breaking because of obstacle!'
};

exports.init = function(config) {
	conf = config || {};
	let miss = [];
	for (var i = 0; i < reqConfig.length; i++) {
		if(conf[reqConfig[i]]===undefined) miss.push(reqConfig[i]);
	}
	// This is an interesting way to return a rejected promise :-P
	if(miss.length > 0) return Promise.reject(new Error('Some confuration is missing: '+miss.join(', ')));

	if(conf.v) console.log('Initializing with config:\n'+JSON.stringify(conf, null, 2));
	pyFaces.init(conf);

	numMeasurements = conf.obstacleCount;

	pyFaces.on('warn', function(d) { console.log('pythonFaces Warning: ', d); });
	pyFaces.on('error', function(d) { console.log('pythonFaces Error: ', d); });
	pyFaces.on('fps', function(d) { emitEvent('camerafps', d); });
	pyFaces.on('face', handleNewFace);
	pyFaces.on('detectfps', function(d) { emitEvent('detectfps', d); });
	pyFaces.on('storedimage', function(d) { emitEvent('storedimage', d); });
	pyFaces.on('storedface', function(d) { emitEvent('storedface', d); });

	return car.init(conf);
};
exports.start = function() {
	if(conf.v) console.log('CarController started!');
	steerInterval = setInterval(adjustCarControls, 50);
	pyFaces.start();
	isRunning = true;
};
exports.stop = function() {
	if(conf.v) console.log('CarController stopped!');
	clearInterval(steerInterval);
	pyFaces.stop();
	isRunning = false;
};

exports.isRunning = () => (isRunning === true);

let arrEventListeners = [];
function emitEvent(type, msg) {
	if(arrEventListeners.length > 0) {
		let evt = {
			type: type,
			message: msg,
			timestamp: (new Date()).getTime()
		};
		for (var i = 0; i < arrEventListeners.length; i++) {
			putSendOnStack(arrEventListeners[i], evt);
		}
	}
}
/*
 * Emits events of type: camerafps, detectfps, facedetected, ultrasonic, speed, motorstate, steering
 */
exports.onEvent = (func) => {
	if(typeof func === 'function') {
		arrEventListeners.push(func);
	} else {
		console.warn('Please provide a valid function to carController.onEvent!');
	}
};
function putSendOnStack(func, evt) {
	setTimeout(() => func(evt), 0);
}

// we assume three consecutive obstacle measurements at initialization,
// which means we got a verified obstacle, which we define at a distance of zero.
let numMeasurements = 0;
let frontObstacle = 0;
let currentSpeed = 0;

function handleNewFace(oFace) {
	// the retrieved object of one face is: { id, x, y, w, h, relX, relY, relW, relH }
	// we only look for the first (biggest) face on an image: oFace.id === 0
	// IDs are sorted from biggest to smallest
	if(oFace.id === 0) {
		if(conf.v) console.log('Face detected at relX: ', oFace.relX);
		emitEvent('facedetected', oFace.relX);
		facePosition = oFace.relX;
		lastFaceDetect = (new Date()).getTime();
		//FIXME here it seems currentSpeed is zero when we are slowing down...
		console.log('in handleNewFace currentSpeed = '+currentSpeed+', lastFaceDetect = '+lastFaceDetect);
		if(currentSpeed > 0) {
			// if we do have a current speed and the rampUpFace has been reset, this
			// means we are already running and didn't detect any face for
			// conf.speedUpTime milliseconds. Therefore we need to adjust the new rampUpFace
			// to the current speed in order for a smooth transition
			
			console.log('adjusting ramp');
			// TODO TEST if this works
			rampUpFace = lastFaceDetect-currentSpeed*conf.speedUpTime;
		}
		else if(rampUpFace === 0) rampUpFace = lastFaceDetect;
		console.log('adjusting ramp: '+rampUpFace);
	}
}
// register the obstacle handler function in car
car.onFrontDistance((obst) => {
	emitEvent('ultrasonic', obst);
	frontObstacle = obst;
	if(frontObstacle < conf.slowDownDistance) numMeasurements++;
	else numMeasurements = 0;
});

function adjustCarControls() {
	adjustSpeed();
	adjustSteering();
}

function adjustSpeed() {
	let now = (new Date()).getTime();
	let timePassed = now - lastFaceDetect;
	let state;

	// we first check for obbstacles before we do anything else
	if(numMeasurements >= conf.obstacleCount) {

		// if the obstacle is not yet closer than the stop distance, we slow down
		if(conf.stopDistance < frontObstacle) {
			state = 'obstacle';
			currentSpeed = (frontObstacle-conf.stopDistance)/(conf.slowDownDistance-conf.stopDistance);
			car.setSpeed(currentSpeed);

		// if the obstacle is closer than the stop distance, we stop ;)
		} else {
			state = 'obstaclebreak';
			currentSpeed = 0;
			car.break();
		}
	
	// we are accelerating towards full speed with a linear ramp
	} else {
		if(now-rampUpFace < conf.speedUpTime) {
			state = 'accelerating';
			currentSpeed = (now-rampUpFace) / conf.speedUpTime;

		// we stay at full speed while no faces are detected 
		} else if(timePassed < conf.stayTime) {
			state = 'fullspeed';
			rampUpFace = 0; // We reset the ramp up face
			currentSpeed = 1;

		// we slow down with a negative linear ramp since no more faces were detected 
		} else if(timePassed < conf.stopTime) {
			state = 'slowdown';
			currentSpeed = 1-(timePassed-conf.stayTime)/(conf.stopTime-conf.stayTime);

		} else {
			state = 'nofacebreak';
			currentSpeed = 0;
		}
		car.setSpeed(currentSpeed);
	}
	emitEvent('speed', currentSpeed);
	emitEvent('motorstate', state);

	if(conf.v && state !== lastState) console.log(stateMessages[state] +', speed: '+currentSpeed);
	lastState = state;
}

function adjustSteering() {
	let now = (new Date()).getTime();
	let timePassed = now - lastFaceDetect;
	let steerPrct = 0;

	// we smoothly turn into the correct direction
	if(timePassed < conf.turnTime) {
		steerPrct = timePassed / conf.turnTime;
	}
	car.setSteering(facePosition*steerPrct);
	emitEvent('steering', facePosition*steerPrct);


	// TODO how long do we have to steer in the direction of the face?
	// TODO this depends on the current speed as well as on how far the
	// TODO face is off the center
}

/*
	now = time.time()
	
	# how much time since the last face detection passed 
	timePassed = now - lastFaceDetected
	relX = lastRelativeFacePosition
	writeLog('steer | time since last face {:.2f}s'.format(timePassed))

	# if we are still in valid turn time, we turn
	if timePassed < turnTime*timeFactor:
		if relX < 0:
			cmd = servoCenter+(servoCenter-servoLeft)*relX #relX will be negative
			# writeLog("steering left {}% = command to arduino: {}".format(relX*100, cmd))
			commandArduino(servoDevice, cmd)

		else:
			cmd = servoCenter+(servoRight-servoCenter)*relX
			# writeLog("steering right {}% = command to arduino: {}".format(relX*100, cmd))
			commandArduino(servoDevice, cmd)
		writeLog('STEER | TURNING: {}'.format(int(cmd)))

	# if we are under the detect time we assume we are heading the right direction, thus we stop turning
	elif timePassed < avgDetectTime*timeFactor:
		writeLog('steer | Heading straight')
		commandArduino(servoDevice, servoCenter)

	# if turn time passed, we don't know what to do anymore. So we start going left right
	else:
		writeLog('steer | TODO should go left, right, left,... until new face detected or stop')
		pass
		# print "else"
	# use sinus if face hasnt been detected for 3 seconds
	# steering will do a bit of left right left in order to acquire a new target
	
	# math.sin([0 .. 2*math.pi]) => left -> right -> center
	
	# we need to steer double the time to the right than to the left because we want to be
	# turning over the center

	# when all the way to the left again (5/2*math.pi) we stay for a full turn at the end
	
	# else head towards the face
*/