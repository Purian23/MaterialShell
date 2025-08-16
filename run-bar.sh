#!/bin/bash

# Set environment variables for AGS to find Astal libraries
export GI_TYPELIB_PATH="/usr/local/lib64/girepository-1.0:$GI_TYPELIB_PATH"
export LD_LIBRARY_PATH="/usr/local/lib64:$LD_LIBRARY_PATH"

# Run the AGS topbar
cd "$(dirname "$0")"
ags run app.ts
