import time

class PiCamera():
    def __init__(self, camera_num=0, stereo_mode='none', stereo_decimate=False,
            resolution=None, framerate=None, sensor_mode=0, led_pin=None,
            clock_mode='reset', framerate_range=None):
        print('STUB: PiCamera __init__')

    def capture_continuous(
            self, output, format=None, use_video_port=False, resize=None,
            splitter_port=0, burst=False, bayer=False, **options):
        
        # outp = list({'array': 'stub'})
        
        while True:
            print('STUB: PiCamera capture_continuous')
            # FIXME generate frame array to be returned
            # outp.extend({ 'array': 'stub' })
            # yield outp
            yield 'stub'

    def close(self):
        print('STUB: PiCamera close')
