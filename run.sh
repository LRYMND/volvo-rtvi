#!/bin/bash
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "\e[91mPython Virtual environment (venv) is not activated. Please activate it first by running:\e[0m"
    echo -e "\e[93msource /home/$USER/rtvi-web-app/backend/bin/activate\e[0m"
    
    exit 1
fi

source /home/$USER/rtvi-web-app/backend/bin/activate
python3 /home/$USER/rtvi-web-app/backend/app.py &
chromium-browser --app=http://localhost:4001/ --window-size=800,480 --hide-scrollbars --disable-cloud-management --enable-experimental-web-platform-features --enable-features=JavaScriptExperimentalSharedMemory