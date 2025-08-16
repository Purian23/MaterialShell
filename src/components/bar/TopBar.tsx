import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Clock from "./Clock"
import Workspaces from "./Workspaces"
import FocusedWindow from "./FocusedWindow"
import SystemTray from "./SystemTray"
import type { MaterialShellSettings } from "../../config/settings"

export default function TopBar(gdkmonitor: Gdk.Monitor, settings: MaterialShellSettings) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
  
  const widgets = settings.topBarWidgets || [
    "workspaces", "focused-window", "spacer", 
    "system-tray", "clock"
  ]
  
  function renderWidget(widget: string, index: number) {
    switch(widget) {
      case "workspaces": 
        return <Workspaces />
      case "focused-window": 
        return <FocusedWindow />
      case "clock": 
        return <Clock />
      case "system-tray": 
        return <SystemTray />
      case "spacer": 
        return <box hexpand />
      default: 
        return null
    }
  }
  
  return (
    <window
      visible
      name="material-top-bar"
      class="material-top-bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox class="bar-container">
        <box $type="start" class="section-start">
          {widgets.map(renderWidget)}
        </box>
      </centerbox>
    </window>
  )
}