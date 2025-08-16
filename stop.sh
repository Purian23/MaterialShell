#!/bin/bash

# AGS Topbar Stop Script
# Stops the running AGS topbar

echo "Stopping AGS Topbar..."
pkill -f "ags run"

if [ $? -eq 0 ]; then
    echo "AGS Topbar stopped successfully"
else
    echo "No AGS instances found or already stopped"
fi
