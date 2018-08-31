import time

class PiCamera(camera_num=0, stereo_mode='none', stereo_decimate=False,
        resolution=None, framerate=None, sensor_mode=0, led_pin=None,
        clock_mode='reset', framerate_range=None):

    def capture_continuous(
            self, output, format=None, use_video_port=False, resize=None,
            splitter_port=0, burst=False, bayer=False, **options):
        while True:
            print('stub PiCamera capture_continuous')
            time.sleep(5)
            yield output

    def close(self):
        print('stub PiCamera close')
