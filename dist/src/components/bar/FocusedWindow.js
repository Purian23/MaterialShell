import { jsx as _jsx } from "ags/gtk4/jsx-runtime";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
const focusedWindowTitle = createPoll("Desktop", 1000, async () => {
    try {
        if (process.env.NIRI_SOCKET) {
            const result = await execAsync("niri msg windows");
            const windows = JSON.parse(result);
            const focused = windows.find((w) => w.is_focused);
            return focused ? focused.title : "Desktop";
        }
    }
    catch {
        return "Desktop";
    }
    return "Desktop";
});
export default function FocusedWindow() {
    return (_jsx("box", { class: "focused-window-widget", children: _jsx("label", { class: "focused-window-title", label: focusedWindowTitle, maxWidthChars: 50, ellipsize: 3, halign: Gtk.Align.START }) }));
}
