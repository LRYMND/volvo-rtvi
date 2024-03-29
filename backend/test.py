import threading
import time
import can
import socketio
import sys
import settings

class Config:
    def __init__(self):
        self.settings = settings.load_settings("canbus")
        self.refresh_rate = self.settings["timing"]["refresh_rate"]
        self.interval = self.settings["timing"]["interval"]
        self.msg_hs = []
        self.msg_ls = []

        self.initialize_messages()

    def initialize_messages(self):
        for key, message in self.settings['messages'].items():
            req_id = int(message['req_id'], 16)
            rep_id = int(message['rep_id'], 16)
            target = int(message['target'], 16)
            action = int(message['action'], 16)
            parameter0 = int(message['parameter'][0], 16)
            parameter1 = int(message['parameter'][1], 16)

            dlc = 0xC8 + len([byte for byte in [rep_id, target, action, parameter0, parameter1] if byte != 0])

            req_id_bytes = [req_id]
            message_bytes = [dlc, target, action, parameter0, parameter1, 0x01, 0x00, 0x00]

            rep_id_bytes = [rep_id]
            scale = message['scale']
            is_16bit = message['is_16bit']
            rtvi_id = message['rtvi_id']

            refresh_rate = message['refresh_rate']
            if refresh_rate == "high":
                self.msg_hs.append((req_id_bytes, rep_id_bytes, message_bytes, scale, is_16bit, rtvi_id))
            elif refresh_rate == "low":
                self.msg_ls.append((req_id_bytes, rep_id_bytes, message_bytes, scale, is_16bit, rtvi_id))

class CanBusThread(threading.Thread):
    def __init__(self):
        super(CanBusThread, self).__init__()
        self._stop_event = threading.Event()
        self.daemon = True
        self.client = socketio.Client()
        self.config = Config()
        self.can_bus = None
        self.isDev = True

    def run(self):
        self.connect_to_socketio()
        self.initialize_canbus()
        self.run_can_bus()

    def initialize_canbus(self):
        try:
            if(self.isDev):
                print("Using Virtual CAN.")
                self.can_bus = can.interface.Bus(channel='vcan0', bustype='socketcan', bitrate=500000)
            else:    
                self.can_bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)    
        except Exception as e:
            print(f'Error initializing CAN Bus: {e}')

    def stop_thread(self):
        self._stop_event.set()
        self.stop_canbus()

    def stop_canbus(self):
        if self.can_bus:
            self.can_bus.shutdown()

    def connect_to_socketio(self):
        max_retries = 10
        current_retry = 0
        while not self.client.connected and current_retry < max_retries:
            try:
                self.client.connect('http://localhost:4001', namespaces=['/canbus'])
            except Exception as e:
                print(f"Socket.IO connection failed. Retry {current_retry}/{max_retries}. Error: {e}")
                time.sleep(.5)
                current_retry += 1

        if self.client.connected:
            print("Socket.IO connected successfully")
        else:
            print("Failed to connect to Socket.IO.")

    def emit_data_to_frontend(self, data):
        if self.client and self.client.connected:
            self.client.emit('data', data, namespace='/canbus')

    def request(self, messages):
        for message in messages:

            msg = can.Message(arbitration_id=message[0][0], data=message[2], is_extended_id=True)
            
            try:
                received = False
                print(msg)
                #print(self.can_bus)
                self.can_bus.send(msg)
                print("1")
                data = self.can_bus.recv()
                print(data)
                print("2")
                self.emit_data_to_frontend(self.filter(data, message))
                print("3")
                    

            except can.CanError as e:
                print(f"Error sending/receiving CAN message: {e}")

    def filter(self, data, message):
        if data.arbitration_id == message[1][0] and data.data[4] == message[2][4]:
            value = (data.data[5] << 8) | data.data[6] if message[4] else data.data[5]
            converted_value = eval(message[3], {'value': value})

            data = message[5] + str(float(converted_value))
            
            sys.stdout.flush()
            return data
        else:
            return None

    def run_can_bus(self):
        x = 0
        while not self._stop_event.is_set():
            print("0")
            if x <= self.config.interval:
                self.request(self.config.msg_hs)
                time.sleep(self.config.refresh_rate)
            x += 1
            if x == self.config.interval:
                self.request(self.config.msg_ls)
                x = 0


def main():
    can_thread = CanBusThread()
    can_thread.start()

    # Let the thread run for a while (you can adjust the duration)
    time.sleep(30)

    # Stop the thread
    can_thread.stop_thread()
    can_thread.join()

if __name__ == "__main__":
    main()