#!/bin/bash

# AGS Topbar Runner Script
# Sets up the required environment variables and runs the topbar

export GI_TYPELIB_PATH="/usr/local/lib64/girepository-1.0:$GI_TYPELIB_PATH"
export LD_LIBRARY_PATH="/usr/local/lib64:$LD_LIBRARY_PATH"

echo "Starting AGS Topbar..."
echo "Press Ctrl+C to stop"

ags run app.ts
