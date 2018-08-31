import numpy as np

class GlobalOption:
    LOG_LEVEL = 0
    
class GraphOption:
    ITERATIONS = 0   

def SetGlobalOption(i, j):
    print('stub mvncapi SetGlobalOption')

def EnumerateDevices():
    print('stub mvncapi EnumerateDevices')
    return [Device(1)]

class Device:
    def __init__(self, dev):
        print('stub mvncapi Device init')

    def OpenDevice(self):
        print('stub mvncapi Device OpenDevice')

    def AllocateGraph(self, blob):
        print('stub mvncapi Device AllocateGraph')
        return Graph(0)

    def CloseDevice(self):
        print('stub mvncapi Device CloseDevice')

class Graph:
    def SetGraphOption(self, i, j):
        print('stub mvncapi Graph SetGraphOption')

    def LoadTensor(self, i, j):
        print('stub mvncapi Graph LoadTensor')

    def GetResult(self):
        print('stub mvncapi Graph GetResult')
        return np.array([0]), 'None'

    def DeallocateGraph(self):
        print('stub mvncapi Graph DeallocateGraph')
