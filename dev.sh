#!/bin/bash

# AGS Development Hot Reload Script
# Watches for file changes and automatically restarts AGS

echo "🔥 Starting AGS Hot Reload Development Mode"
echo "Press Ctrl+C to stop"
echo "Watching files: app.ts, widget/*.tsx, style.scss, *.tsx"

# Function to start AGS
start_ags() {
    echo "🚀 Starting AGS..."
    export GI_TYPELIB_PATH="/usr/local/lib64/girepository-1.0:$GI_TYPELIB_PATH"
    export LD_LIBRARY_PATH="/usr/local/lib64:$LD_LIBRARY_PATH"
    ags run app.ts &
    AGS_PID=$!
    echo "   AGS started with PID: $AGS_PID"
}

# Function to stop AGS
stop_ags() {
    if [ ! -z "$AGS_PID" ] && kill -0 $AGS_PID 2>/dev/null; then
        echo "🛑 Stopping AGS (PID: $AGS_PID)..."
        kill $AGS_PID
        wait $AGS_PID 2>/dev/null
    fi
    pkill -f "ags run" 2>/dev/null || true
}

# Function to restart AGS
restart_ags() {
    echo ""
    echo "📁 File change detected, reloading..."
    stop_ags
    sleep 1
    start_ags
    echo "✅ Hot reload complete!"
    echo ""
}

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    stop_ags
    echo "👋 Development mode stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start AGS initially
start_ags

# Check if inotify-tools is available
if ! command -v inotifywait &> /dev/null; then
    echo "⚠️  inotify-tools not found. Installing..."
    sudo dnf install -y inotify-tools
fi

# Watch for file changes and restart AGS
inotifywait -m -e modify,move,create,delete \
    --format '%w%f %e' \
    --recursive \
    app.ts style.scss widget/ . 2>/dev/null | \
    while read file event; do
        # Ignore temporary files and swap files
        if [[ "$file" =~ \.(tmp|swp|swo|~)$ ]] || [[ "$file" =~ \.#.*$ ]]; then
            continue
        fi
        
        # Only restart for relevant file types
        if [[ "$file" =~ \.(ts|tsx|scss|css)$ ]]; then
            echo "📝 Changed: $file"
            # Debounce - wait a bit to avoid multiple rapid restarts
            sleep 0.5
            restart_ags
        fi
    done
