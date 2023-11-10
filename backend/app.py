from flask import Flask, send_from_directory, render_template
from flask_socketio import SocketIO
from flask import request
#from canbus import request_data_from_car
import settings
import os
import json
import subprocess
import threading

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), '..', 'dist'), static_folder=os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), static_url_path='/assets')
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Function to start Chromium in its own thread
def start_chromium():
    subprocess.Popen("chromium-browser --app=http://localhost:5173 --window-size=800,440 --disable-features=OverlayScrollbar", shell=True)

# Function to stop Chromium
def stop_chromium():
    subprocess.Popen("pkill -o chromium", shell=True)

# Route to serve the index.html file
@app.route('/')
def serve_index():
    return render_template('index.html')

# Route to serve static files (js, css, etc.) from the 'dist/assets' folder
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), filename)

# CAR DATA
#@app.route('/api/car/<request>', methods=['GET'])
#def request_car_data(request):
#    data = request_data_from_car(request)
#    return data, 200

# Misc
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "Hello from the backend!"}
    return data, 200

@socketio.on('connect')
def handle_connect():
    print("Client connected")

# Return settings object to frontend via socket.io
@socketio.on('requestSettings', namespace='/settings')
def handle_request_settings(args):
    print('settings requested for: ' + args)
    # You can broadcast the message to all connected clients if needed.
    socketio.emit(args, settings.load_settings(args), namespace='/settings')

@socketio.on('saveSettings', namespace='/settings')
def handle_save_settings(args, data):
    print('settings saving for: ' + args)
    settings.save_settings(args, data)
    # You can broadcast the message to all connected clients if needed.
    socketio.emit(args, settings.load_settings(args), namespace='/settings')

@socketio.on('performIO', namespace='/io')
def handle_perform_io(args):
    print('Executing io: ' + args)

    if args == 'reboot':
        subprocess.run("sudo reboot -h now", shell=True)
    elif args == 'restart':
        stop_chromium()
        start_chromium()
    elif args == 'quit':
        stop_chromium()
    elif args == 'reset':
        settings.reset_settings("application")
        socketio.emit("application", settings.load_settings("application"), namespace='/settings')
    else:
        # Default case if args is not 'one', 'two', or 'three'
        print('Unknown action:', args)





@socketio.on('message', namespace='/testchannel')
def handle_frontend_message(message):
    print('Received message: ' + message)
    # You can broadcast the message to all connected clients if needed.
    socketio.emit('message', 'Hello from Backend', namespace='/testchannel')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=4001)