#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Removing dev stubs..."
rm -rf ${DIR}/src/py/cv2
rm -rf ${DIR}/src/py/mvnc
rm -rf ${DIR}/src/py/picamera

echo "Running Cat-Catcher..."

