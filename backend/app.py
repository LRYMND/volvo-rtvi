from flask import Flask, render_template
from flask_socketio import SocketIO
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with your own secret key
socketio = SocketIO(app, cors_allowed_origins="*")

# Get the path to the frontend/dist folder relative to the backend/app.py file.
frontend_dist_path = os.path.join(os.path.dirname(__file__), '..', 'dist')

# Define a route to serve your React app.
@app.route('/')
def index():
    # Construct the path to the index.html file in the React app's 'dist' folder.
    index_path = os.path.join(frontend_dist_path, 'index.html')

    # Render the index.html file.
    return render_template(index_path)

# Define additional routes and API endpoints as needed.
@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "Hello from the backend!"}
    return data, 200

@socketio.on('connect')
def test_connect():
    print("client connected")

@socketio.on('FRONTEND_MESSAGE', namespace='/')
def handle_frontend_message(message):
    print('Received message: ' + message)
    # You can broadcast the message to all connected clients if needed.
    socketio.emit('BACKEND_MESSAGE', "HELLO FROM BACKEND")



if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=4001)  # Adjust the host and port as needed.
