const Ultrasonic = require('../build/js/ultrasonic');

let us = new Ultrasonic();

us.onObstacle(console.log);
us.start();