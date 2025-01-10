# Cat-catcher Raspberry Setup

- Download [Raspbian Stretch Lite](https://www.raspberrypi.org/downloads/raspbian/)
- Flash to (minimum) 16 GB SD card and plug SD card into raspberry.

This instruction is updated for Raspbian Stretch Lite 4.14

## Configure SSH, Safety and Wireless

- Boot with screen and keyboard connected to raspberry. It is not necessary to fiddle with the locales. After connecting to the wireless, we will only connect via ssh to the raspberry.
- Login with user `pi` password `raspberry`
- `sudo passwd pi` (change password to something safe)
- `sudo raspi-config`:
	- `[2]` Change hostname to something savage (e.g. `cat-catcher-1`)
	- `[5 -> P2]` Enable SSH
- Connect to wireless:
	- `wpa_passphrase "[ESSID]" "[PASSWORD]" | sudo tee -a /etc/wpa_supplicant/wpa_supplicant.conf`
	- `sudo nano /etc/wpa_supplicant/wpa_supplicant.conf`, delete commented line (#) with clear text password
- `sudo shutdown now`, unplug power, then unplug monitor and keyboard


## Update & Install Raspberry

- Plug in power
- Connect to raspi via SSH using new hostname (e.g. `ssh pi@cat-catcher-1`)
- Install Prerequisites:

	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	sudo apt install python-smbus i2c-tools feh git python-skimage python-picamera pigpio nodejs
	npm install gulp-cli -g

- Change Configuration `sudo raspi-config`: 

  - `[7 -> A1]` Expand filesystem
  - `[5 -> P1]` Enable camera
  - `[5 -> P5]` Enable I2C
  - `[4]` Add Locale `de_CH.UTF-8 UTF-8` but keep default Locale `en_GB.UTF-8` for the system environment
	
- Verify & Reboot:

	mkdir ~/projects
	sudo i2cdetect -y 1 # (verify PWM Hat is connected)
	sudo reboot now


## Install Movidius Neural Compute Stick

We currently use Version 1:

	git clone https://github.com/movidius/ncsdk.git
	cd ncsdk
	make install
	make examples (say no to OpenCV installation)

## Clone yoloNCS

Great framework for location detection of classified object in image

	cd ~/projects
	git clone https://github.com/gudovskiy/yoloNCS.git
	cd yoloNCS
	mkdir .weights

- Store caffemodel from [here](https://drive.google.com/file/d/0Bzy9LxvTYIgKNFEzOEdaZ3U0Nms/view?usp=sharing) in `~/projects/yoloNCS/.weights` folder

## Clone cat-Catcher Project

	cd ~/projects
	git clone https://github.com/dominicbosch/cat-catcher.git
	cd cat-catcher
	npm install
	gulp build


## Compile yoloNCS graph

	cd ~/projects/yoloNCS
	mvNCCompile prototxt/yolo_tiny_deploy.prototxt -w .weights/yolo_tiny.caffemodel -s 12
	mv graph ~/projects/cat-catcher/build
