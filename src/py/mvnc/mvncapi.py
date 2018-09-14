import numpy as np

class mvncapi():
    def __init__(self):
        print('STUB: mvncapi __init__')

class GlobalOption:
    LOG_LEVEL = 0
    
class GraphOption:
    ITERATIONS = 0   

def SetGlobalOption(i, j):
    print('STUB: mvncapi SetGlobalOption')

def EnumerateDevices():
    print('STUB: mvncapi EnumerateDevices')
    return [Device(1)]

class Device:
    def __init__(self, dev):
        print('STUB: mvncapi Device init')

    def OpenDevice(self):
        print('STUB: mvncapi Device OpenDevice')

    def AllocateGraph(self, blob):
        print('STUB: mvncapi Device AllocateGraph')
        return Graph()

    def CloseDevice(self):
        print('STUB: mvncapi Device CloseDevice')

class Graph:
    def SetGraphOption(self, i, j):
        print('STUB: mvncapi Graph SetGraphOption')

    def LoadTensor(self, i, j):
        print('STUB: mvncapi Graph LoadTensor')

    def GetResult(self):
        print('STUB: mvncapi Graph GetResult')
        return np.array([0]), 'None'

    def DeallocateGraph(self):
        print('STUB: mvncapi Graph DeallocateGraph')
