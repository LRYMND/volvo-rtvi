from flask import Flask, send_from_directory, render_template
from flask_socketio import SocketIO
from flask import request
from request_car_data import request_data_from_car
import os
import json

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), '..', 'dist'), static_folder=os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), static_url_path='/assets')
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Route to serve the index.html file
@app.route('/')
def serve_index():
    return render_template('index.html')

# Route to serve static files (js, css, etc.) from the 'dist/assets' folder
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), filename)

# APP Settings
@app.route('/api/appSettings', methods=['GET'])
def get_app_settings():
    with open('app_settings.json', 'r') as app_settings_file:
        settings = json.load(app_settings_file)
    return settings, 200

@app.route('/api/appSettings', methods=['POST'])
def update_app_settings():
    data = request.get_json()

    if data:
        with open('app_settings.json', 'w') as app_settings_file:
            json.dump(data, app_settings_file, indent=2)

        return {'message': 'App settings updated successfully'}, 200
    else:
        return {'message': 'Invalid data provided'}, 400

# CAR DATA
@app.route('/api/car/<request>', methods=['GET'])
def request_car_data(request):
    data = request_data_from_car(request)
    return data, 200

# Misc
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "Hello from the backend!"}
    return data, 200

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('FRONTEND_MESSAGE', namespace='/')
def handle_frontend_message(message):
    print('Received message: ' + message)
    # You can broadcast the message to all connected clients if needed.
    socketio.emit('BACKEND_MESSAGE', "HELLO FROM BACKEND")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=4001)
