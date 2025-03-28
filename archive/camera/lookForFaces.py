from __future__ import division

import sys
import time
import signal
import datetime
import traceback
import argparse # easy parsing of command line
from facedetect import FaceDetect

# Define possible command line arguments
parser = argparse.ArgumentParser(description='Look for faces on the PI Camera')

parser.add_argument('-hf',
	action='store_true',
	dest='hflip',
	help='Horizontal camera flip')

parser.add_argument('-vf',
	action='store_true',
	dest='vflip',
	help='Vertical camera flip')

parser.add_argument('-v',
	action='store_true',
	dest='verbose',
	help='Verbose output')

parser.add_argument('--cf',
	nargs='?',
	dest='cascade',
	help='Pattern recognition cascade filename as it is found in folder "cascades"')

parser.add_argument('--iw',
	nargs='?', type=int, default=640,
	dest='width',
	help='Image width')

parser.add_argument('--ih',
	nargs='?', type=int, default=480,
	dest='height',
	help='Image height')

parser.add_argument('--fr',
	nargs='?', type=int, default=5,
	dest='framerate',
	help='Video framerate')

parser.add_argument('--sf',
	nargs='?', type=float, default=1.1,
	dest='scaleFactor',
	help='Face detection: image pyramid scale factor')

parser.add_argument('--mn',
	nargs='?', type=int, default=5,
	dest='minNeighbors',
	help='Face detection: number of neighbors for verified detection')

parser.add_argument('--mins',
	nargs='?', type=int, default=20,
	dest='minSize',
	help='Face detection: minimum face size mins*mins for detection')

parser.add_argument('--maxs',
	nargs='?', type=int, default=100,
	dest='maxSize',
	help='Face detection: maximum face size maxs*maxs for detection')

parser.add_argument('-s',
	action='store_true',
	dest='store',
	help='Store images with detected faces in folder "detected-faces"')

parser.add_argument('-sa',
	action='store_true',
	dest='storeall',
	help='Store all images in folder "snapshots"')

# Parse command line arguments and see if something useful was provided
args = parser.parse_args()

def writeLog(msg):
	timestamp = datetime.datetime.now()
	ts = timestamp.strftime('[%Y.%m.%d_%I:%M:%S]: ')
	print(ts + msg)

def faceHasBeenDetected(arrFaces):
	numF = len(arrFaces)
	xPerc = arrFaces[0][4]*100
	if args.verbose:
		writeLog('New face(s) detected ({}), nearest at {:.2f}%'.format(numF, xPerc))
	i = 0
	for pic in arrFaces:
		arr = list(str(v) for v in pic) # cast to strings... really?!
		writeLog('#{}|{}'.format(i, '|'.join(arr)))
		i += 1

detector = None
def exitHandler(*args):
	writeLog('Killed! Bye!')
	detector.stop()
	sys.exit(0)

signal.signal(signal.SIGINT, exitHandler)
signal.signal(signal.SIGTERM, exitHandler)

try:
	detector = FaceDetect(
		res=(args.width, args.height),
		framerate=args.framerate,
		hflip=(args.hflip==True),
		vflip=(args.vflip==True),
		scaleFactor=args.scaleFactor,
		minNeighbors=args.minNeighbors,
		minSize=(args.minSize, args.minSize),
		maxSize=(args.maxSize, args.maxSize),
		cascade=args.cascade,
		storeDetections=args.store,
		storeAllImages=args.storeall,
		verbose=(args.verbose==True)
	)
	detector.run(faceHasBeenDetected)

except:
	traceback.print_exc()

finally:
	detector.stop()
