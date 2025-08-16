import app from "ags/gtk4/app"
import Gtk from "gi://Gtk?version=4.0"

function DebugWindow() {
  console.log("Creating debug window...")
  
  const window = (
    <window
      name="debug-window"
      title="Debug Window"
      visible={true}
      defaultWidth={400}
      defaultHeight={200}
    >
      <box orientation="vertical" spacing={10}>
        <label label="DEBUG: Can you see this window?" />
        <label label="If yes, layer shell issue" />
        <label label="If no, fundamental AGS issue" />
        <button onClicked={() => console.log("Button clicked!")}>
          <label label="Test Button" />
        </button>
      </box>
    </window>
  )
  
  console.log("Window created:", window)
  return window
}

app.start({
  main() {
    console.log("App starting...")
    DebugWindow()
  },
})