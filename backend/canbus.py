import json
import time
import os
import sys 
import can

with open('can_settings.json', 'r') as config_file:
    config = json.load(config_file)

REQ_ID = config['REQ_ID']
CAN_BUS_CONFIG = config['CAN_BUS']
CAN_MESSAGES = config['CAN_MESSAGES']

#DEFINE BUS
CAN_BUS = can.interface.Bus(interface=CAN_BUS_CONFIG['interface'], channel=CAN_BUS_CONFIG['channel'], bitrate=CAN_BUS_CONFIG['bitrate'])

#DEFINE MESSAGE FILTER
def filter(received_message, message):
    if(received_message.arbitration_id == message['rep_id'] and received_message.data[4] == message['req_msg'][3]):
        value = 0
        if(message['is_16bit'] == True):
            value = (received_message.data[5] << 8) | received_message.data[6]
        else:
            value = received_message.data[5]
        sys.stdout.flush()
        return value # TODO: Perform scaling and add unit to value, then return as string 
    else:
        return None


#DEFINE MESSAGE REQUEST
def request_data_from_car(request_parameter):
    message = next((msg for msg in CAN_MESSAGES if msg['name'] == request_parameter), None)

    if message:
        i = 0
        msg = can.Message(arbitration_id=REQ_ID, data=message['req_msg'],is_extended_id=True)

        try:
            received = False
            CAN_BUS.send(msg)

            retries = 10

            while not received == True or retries == 0:
                received_message = CAN_BUS.recv()
                value = filter(received_message, message)
                if value is not None:
                    return value
                retries -= 1

        except can.CanError:
            print("Error")
        i += 1
    else:
        print(f'Could not find can message in configuration : {request_parameter}')
