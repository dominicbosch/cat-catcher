#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo 'Please provide the IP or DNS name of your raspi!'
    exit 1
fi

raspi=$1
catdir="cat-catcher"

echo "Updating git repo on Raspi '${raspi}'"
ssh pi@${raspi} "cd ${catdir} && git checkout master && git pull && gulp run"
