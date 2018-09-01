#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'Please provide the IP or DNS name of your raspi!'
    exit 1
fi

raspi=$1
catdir="cat-catcher"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Copying resources to Raspi '${raspi}'"
ssh pi@${raspi} "rm -rf ${catdir}"
ssh pi@${raspi} "mkdir ${catdir}/src"
ssh pi@${raspi} "cd ${catdir} && npm install pigpio"
scp -rp ${DIR}/src/* pi@${raspi}:${catdir}/src

echo "Running cat-catcher on Raspi '${raspi}'"
ssh pi@${raspi} "${catdir}/src/runCatcher.sh"
