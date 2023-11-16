#!/bin/bash

# Function to check command success
check_command() {
  if [ $? -eq 0 ]; then
    echo "Success: $1"
  else
    echo "Error: $1"
    exit 1
  fi
}

# Set the default port
port="5137"

# Check if the first argument is "dev" or "prod"
if [ "$1" == "dev" ]; then
  echo "App running at: http://localhost:5137"
  port="5137"
elif [ "$1" == "app" ]; then
  echo "App running at: http://localhost:4001"
fi

# Start Vite in the background if "dev" was passed
if [ "$1" == "dev" ]; then
  echo "Start Vite Server"
  check_command "npm run dev"
fi

# Start the Python server in the background
echo "Start Python Server"
check_command "python ./backend/server.py"

# Wait for a moment to ensure servers have started
sleep 3

# Start Chromium with the Vite app
echo "Start Frontend"
chromium-browser --app=http://localhost:$port/ --window-size=800,480 --enable-features=SharedArrayBuffer

# All commands executed successfully
echo "All commands executed successfully"
