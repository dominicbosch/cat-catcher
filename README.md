# cat-catcher

## Prerequisites

* NodeJS 8.11.3. How about you use [n](https://www.npmjs.com/package/n) to get it?

* Gulp `npm install gulp-cli -g`

* Please follow installation instructions in [RaspiSetup.md](RaspiSetup.md) in order to properly setup a raspberry to run this project

## Run

    runCatcherOnRaspi.sh



# Old Procedure


Playing CATch

Using the Raspberry / Arduino / PWM Board / C / Python / Nodejs to create an autonmously driving car that chases faces or other recognized things in your garden or wherever they are not supposed to be :wink:


Hardware Requirements
------------

* Raspberry Pi 3

  ![raspberry pi 3](devdocs/raspi3.jpg)

* Raspicam / Raspicam NoIR

  ![raspi cam](devdocs/raspicam.jpg)  ![raspi cam NoIR](devdocs/raspicam-noir.jpg)

* Adafruit PWM Servo HAT

  ![pwm servo hat](devdocs/pwmhat.jpg)

* An ultrasonic sensor HC-SR04 (wired as shown below)

  ![HC-SR04](devdocs/ultrasonic.jpg)

* A lot of car hardware (see Architecture)


Prerequisites
-------------

* OpenCV and Python bindings:

      sudo apt-get install libopencv-dev python-opencv


Test Camera Classification
--------------------------

	cd ~/projects/family-project/examples
	python testYoloCamera.py

The detected images will be found in `camera/output`


Recommended Parameters
----------------------

Since face detection is limited through the raspbrerry's hardware, our tests showed a feasible 2FPS with a resolution of 640x480, minNeighbors=5, scaleFactor=1.15, minSize=(30, 30), maxSize=(200, 200)


Architecture
------------

1. The car consists of several sensors and actuators: 
	- Sensors: RaspiCam (for face/pattern detection), Distance (front and back), Temperature (if distance sensor is temperature prone, i.e. ultrasonic), x-y-z axis Gyro (blackbox), Compass
	- Actuators: Steering, Motor, Camera (horizontal & vertical)
2. A PWM board on top of a RaspberryPi wires all servos and sensors together
3. Python code using OpenCV (in folder `camera`) deals with the RaspiCam and pattern recognition
4. C / NodeJS code (in folder `i2c`) deals with sensor polling and actuators
5. NodeJS wrapper  (in folder `autonomous-systems`) glues the whole application together and provides the autonomous aspect, such as controlling the car depending on sensor input.


Hardware
--------

cardo sends commands to the wonderful:yum: hardware devices. The first argument addresses the `device`, the second argument defines the `value` to be sent to the `device` and the third argument is the required control value 255 to ensure commands arrived completely. The possible values depend on each device respectively. The return value of the command is a string. In case of a read, the value from the device is located on line number one. If said value is 255, an error has occurred.

    cardo [device] [value] 255

Available Device(s):

#### Virtual Device ####

* `[0]` Initiate : Initializes the hardware
* `[20]` Calibrate : tbd.

#### Servos ####

* `[0]` Steering Servo : `value` has to be an integer in the range `[-100 .. 100]`, -100=full left, 100=full right
* `[1]` Motor Servo : `value` has to be an integer in the range `[-200 .. 100]`, -100=full backwards, 100=full forward, -200=full break
* `[2]` Camera Servo - Horizontal : `value` has to be an integer in the range `[-100 .. 100]`, -100=full left, 100=full right
* `[3]` Camera Servo - Vertical : `value` has to be an integer in the range `[-100 .. 100]`, -100=full up, 100=full down

#### Sensors ####

* `[10]` Distance : Returns the distance to the next obstacle. `value` can be any integer.
* `[11]` Temperature : Returns the current temperature. `value` can be any integer.
* `[12]` Gyro : Returns the acceleration along the x, y or z axis. `value` defines the axis to be returned:
    * `[0]` x-Axis
    * `[1]` y-Axis
    * `[2]` z-Axis

 TODO
