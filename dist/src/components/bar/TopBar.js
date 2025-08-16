import { jsx as _jsx } from "ags/gtk4/jsx-runtime";
import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import Clock from "./Clock";
import Workspaces from "./Workspaces";
import FocusedWindow from "./FocusedWindow";
import SystemTray from "./SystemTray";
export default function TopBar(gdkmonitor, settings) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
    const widgets = settings.topBarWidgets || [
        "workspaces", "focused-window", "spacer",
        "system-tray", "clock"
    ];
    function renderWidget(widget, index) {
        switch (widget) {
            case "workspaces":
                return _jsx(Workspaces, {});
            case "focused-window":
                return _jsx(FocusedWindow, {});
            case "clock":
                return _jsx(Clock, {});
            case "system-tray":
                return _jsx(SystemTray, {});
            case "spacer":
                return _jsx("box", { hexpand: true });
            default:
                return null;
        }
    }
    return (_jsx("window", { visible: true, name: "material-top-bar", class: "material-top-bar", gdkmonitor: gdkmonitor, exclusivity: Astal.Exclusivity.EXCLUSIVE, anchor: TOP | LEFT | RIGHT, application: app, children: _jsx("centerbox", { class: "bar-container", children: _jsx("box", { "$type": "start", class: "section-start", children: widgets.map(renderWidget) }) }) }));
}
