import { Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

// State for focused window info
const [focusedWindow, setFocusedWindow] = createState("")

// Get focused window from niri
async function getFocusedWindow() {
  try {
    const output = await execAsync("niri msg -j windows")
    const windows = JSON.parse(output)
    const focused = windows.find((w: any) => w.is_focused)
    
    if (focused) {
      const title = focused.title || "Unknown"
      const appId = focused.app_id || "Unknown App"
      setFocusedWindow(`${appId} - ${title}`)
    } else {
      setFocusedWindow("No focused window")
    }
  } catch (error) {
    setFocusedWindow("Desktop")
  }
}

// Initialize and poll for changes
getFocusedWindow()
setInterval(getFocusedWindow, 1000)

export default function FocusedWindow() {
  return (
    <Gtk.Box class="focused-window-widget" orientation={Gtk.Orientation.HORIZONTAL}>
      <Gtk.Label 
        label={focusedWindow((text) => text.length > 50 ? text.substring(0, 47) + "..." : text)}
        class="focused-window-title"
        ellipsize={3} // PANGO_ELLIPSIZE_END
      />
    </Gtk.Box>
  )
}