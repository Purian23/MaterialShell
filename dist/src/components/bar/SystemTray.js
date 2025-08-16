import { jsx as _jsx } from "ags/gtk4/jsx-runtime";
import { Gtk } from "ags/gtk4";
export default function SystemTray() {
    return (_jsx("box", { class: "system-tray-widget", orientation: Gtk.Orientation.HORIZONTAL, children: _jsx("label", { label: "system_tray_placeholder", class: "material-icon" }) }));
}
