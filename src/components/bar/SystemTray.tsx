import { Gtk } from "ags/gtk4"

export default function SystemTray() {
  return (
    <box class="system-tray-widget" orientation={Gtk.Orientation.HORIZONTAL}>
      {/* System tray implementation will be added later with proper tray service */}
      <label label="system_tray_placeholder" class="material-icon" />
    </box>
  )
}