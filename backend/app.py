from flask import Flask, send_from_directory, render_template
from flask_socketio import SocketIO
#import canbus
import settings
import os
import subprocess
import threading

# Global variable to hold the reference to the CAN bus thread
can_thread = None

# Frontend port (Dev: 5173 | Production: 4001)
port = 5173

# Flask configuration
app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), '..', 'dist'), static_folder=os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), static_url_path='/assets')
app.config['SECRET_KEY'] = 'your_secret_key'

# Socket.io configuration
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Route to serve the index.html file
@app.route('/')
def serve_index():
    return render_template('index.html')

# Route to serve static files (js, css, etc.) from the 'dist/assets' folder
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), filename)

# Function to start Chromium in its own thread
def start_chromium():
    subprocess.Popen("chromium-browser --app=http://localhost:" + str(port) + " --window-size=800,440 --disable-features=OverlayScrollbar", shell=True)

# Function to stop Chromium
def stop_chromium():
    subprocess.Popen("pkill -o chromium", shell=True)

# Function to start the CAN bus thread
#def start_canbus():
#    global can_thread
#    if can_thread is None or not can_thread.is_alive():
#        can_thread = threading.Thread(target=canbus.main)
#        can_thread.start()

# Function to stop the CAN bus thread
#def stop_canbus():
#    global can_thread
#    if can_thread is not None and can_thread.is_alive():
#        # You might want to add logic to gracefully stop the CAN bus script
#        can_thread.join()  # Wait for the thread to finish

# Send notification when frontend connects via socket.io
@socketio.on('connect')
def handle_connect():
    print("Client connected")

# Activate canbus stream
@socketio.on('toggle', namespace='/canbus')
def handle_canbus_request(args):
    print('toggle canbus: ' + args)

    if args == 'on':
        start_canbus()
    elif args == 'off':
        stop_canbus()
    else:
        print('Unknown action:', args)

# Return settings object to frontend via socket.io
@socketio.on('requestSettings', namespace='/settings')
def handle_request_settings(args):
    print('settings requested for: ' + args)
    # You can broadcast the message to all connected clients if needed.
    socketio.emit(args, settings.load_settings(args), namespace='/settings')

# Save settings object from frontend to .config directory
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
        print('Unknown action:', args)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=4001)