#!/bin/bash
echo "Installing Volvo RTVI-web-app"

while true; do
    read -p "Update System? (Recommended) [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get update; sudo apt-get upgrade; break;;
        [Nn]* ) break;;
        * ) echo "Answer with Y or N";;
    esac
done

while true; do
    read -p "Install Prerequisites? (Recommended) [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get install ffmpeg; sudo apt-get install libudev-dev; break;;
        [Nn]* ) break;;
        * ) echo "Answer with Y or N";;
    esac
done

# Check if Python is installed
if command -v python3 &>/dev/null; then
    echo "Python is already installed."
else
    read -p "Python is not installed. Do you want to install it? [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get install python3; break;;
        [Nn]* ) echo "Python is required. Exiting."; exit;;
        * ) echo "Answer with Y or N";;
    esac
fi

# Check if pip is installed
if command -v pip3 &>/dev/null; then
    echo "pip is already installed."
else
    read -p "pip is not installed. Do you want to install it? [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get install python3-pip; break;;
        [Nn]* ) echo "pip is required. Exiting."; exit;;
        * ) echo "Answer with Y or N";;
    esac
fi

while true; do
    read -p "Install Volvo RTVI? [Y/N]" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Answer with Y or N";;
    esac
done

#create udev rule that grants access to carlinkit device
echo "Creating udev rules"

FILE=/etc/udev/rules.d/52-rtvi-web-app.rules
echo "SUBSYSTEM==\"usb\", ATTR{idVendor}==\"1314\", ATTR{idProduct}==\"152*\", MODE=\"0660\", GROUP=\"plugdev\"" | sudo tee $FILE

if [[ $? -eq 0 ]]; then
	echo -e Permissions created'\n'
    else
	echo -e Unable to create permissions'\n'
fi

echo "Downloading RTVI-web-app"
curl -L https://github.com/LRYMND/rtvi-web-app/releases/download/ --output /home/$USER/rtvi-web-app

# Install python backend (Required)
echo "Installing rtvi-web-app backend"
python3 -m venv /home/$USER/rtvi-web-app/backend
source /home/$USER/rtvi-web-app/backend/bin/activate
python3 -m pip install -r /home/$USER/rtvi-web-app/backend/requirements.txt
deactivate

while true; do
    read -p "Create autostart file for Volvo RTVI? [Y/N]" yn
    case $yn in
        [Yy]* ) sudo bash -c "echo '[RTVI Entry]
                Name=File Manager
                Exec=/home/$USER/rtvi-web-app/run.sh
                Type=Application' > /etc/xdg/autostart/rtvi-web-app.desktop"
                ;;
        [Nn]* ) exit;;
        * ) echo "Answer with Y or N";;
    esac
done

echo "All Done"

while true; do
    read -p "Do you want to start the Application now? [Y/N]" yn
    case $yn in
        [Yy]* ) /home/$USER/rtvi-web-app/run.sh;;
        [Nn]* ) exit;;
        * ) echo "Answer with Y or N";;
    esac
done
