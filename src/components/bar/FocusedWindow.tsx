import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"

declare const GLib: any

const focusedWindowTitle = createPoll("Desktop", 1000, async () => {
  try {
    if (GLib.getenv("NIRI_SOCKET")) {
      const result = await execAsync("niri msg windows")
      const windows = JSON.parse(result)
      const focused = windows.find((w: any) => w.is_focused)
      return focused ? focused.title : "Desktop"
    }
  } catch {
    return "Desktop"
  }
  return "Desktop"
})

export default function FocusedWindow() {
  return (
    <box class="focused-window-widget">
      <label 
        class="focused-window-title"
        label={focusedWindowTitle}
        maxWidthChars={50}
        ellipsize={3}
        halign={Gtk.Align.START}
      />
    </box>
  )
}