/*
 * Load required libraries and wire them.
 * These libraries are constantly linked to the variables.
 */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cp = require('child_process');

// We will keep track of the number of users. as soon as there is at least one connected
// we start polling the accelerator on a certain interval basis and stop otherwise.
let numUsers = 0;
let intervalIdx;
let intervalLength = 5000; // milliseconds

// We statically redirect all HTTP requests for the URL '/' to the directory 'www'.
// This determines from which folder we serve the files for the HTTP requests from client browsers
app.use('/', express.static(__dirname+'/www'));


// we start the server to listen on port 8080
// Open the browser and enter: http://localhost:8080/accelerator.html to see the web page
// Press Ctrl + Shift + I to open the developer tools in the browser and go to the console tab 
server.listen(8080, () => {
	console.log('Server running! Access webpages on http://localhost:8080');
	console.log('\n --> Open your browser and enter following URL: '
		+ 'http://localhost:8080/accelerator.html\n');
});

// As soon as the accelerator.html web page has been loaded by the browser,
// it will request other resources, such as the socket connection to this server.
// The console will show that the client browser has connected to this server.
io.on('connection', function (socket) {
	console.log('Client connected on socket from IP "'+socket.conn.remoteAddress
		+'" and has been assigned the SocketID "'+socket.id+'"');

	// If a new client connected we increse the user counter and check whether
	// we should start polling or maybe we are already doing so.
	numUsers++;
	checkNeedsToRun();

	// ping and pong are reserved events, hence we use myping and mypong
	// We first register the event listener for mypong, before emitting the event
	// myping which will cause the client to return mypong.
	socket.on('mypong', function () {
		console.log('Received PONG from client '+socket.id);
	});
	console.log('Sending PING to client '+socket.id);
	socket.emit('myping');

	// We use the event 'command' for commands sent by the client to the server
	socket.on('command', function (msg) {
		console.log('The server received a command from '+socket.id);
		console.log(JSON.stringify(msg, null, 2)); // pretty format with indent of 2

		console.log('\nBROADCASTING: '+msg.commandValue+'\n');
		io.emit('currentcommand', { cmd: msg.commandValue })
	});

	socket.on('disconnect', function () {
		numUsers--;
		checkNeedsToRun();
		console.log(socket.id+' disconnected!');
	});
});

function pollAccelerator() {
	// this is the concept of promise chaining in order to cope for async executions
	Promise.all([callArduino(0), callArduino(1), callArduino(2)])
		.then(function(values) {
			// All Promises successfully executed over time until here, hence we have a valid result.
			// values holds the last promise's result (in this case all return values from the array)
			let measured = {
				x: values[0],
				y: values[1],
				z: values[2]
			};
			console.log('broadcasting measurement: \n', JSON.stringify(measured, null, 2));
			// broadcast
			io.emit('measurement', measured);

		})
		.catch(function(reason) {
			console.error('Promise rejected: '+reason);
		});
}

/*
 * Check whether users are connected and start the polling interval,
 * otherwise stop the polling interval.
 */
function checkNeedsToRun() {
	if(numUsers < 1) {
		console.log('Last client disconnected, stopping polling');
		clearInterval(intervalIdx);
	} else if(numUsers === 1) {
		console.log('Client connected, starting polling');
		clearInterval(intervalIdx); // just to be sure nothing else is running
		intervalIdx = setInterval(pollAccelerator, intervalLength);
	} else {
		console.log('Accelerator is already being polled!');
	}
}

function callArduino(attr, store) {
	// We need promises (for simplicity) because the call to arduino is asynchronous
	return new Promise(function(resolve, reject) {
		// we also pass the attr attribute to the arduino command. this gives the arduino
		// the instruction on which axis he should get the current value. (0, 1 or 2?)
		cp.exec('./arduinoSimulation.out '+attr, (error, stdout, stderr) => {
			// if an error happens, we have to reject the promise which will immediately
			// let the runtime jump into the catch handler of the promise
			if(error) reject(`exec error for attribute ${attr}: ${error}`)
			else {
				try {
					resolve(parseFloat(stdout));
				} catch(err) {
					reject(`parseFloat failed for attribute ${attr}: ${err}`);
				}
			}
		});
	})
}