import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"
import WorkspaceSwitcher from "./WorkspaceSwitcher"

// WiFi status with Material Symbols and signal strength
const wifiStatus = createPoll("wifi_off", 5000, async () => {
  try {
    const activeConns = await execAsync("nmcli connection show --active")
    const wifiLines = activeConns.split('\n').filter(line => line.includes('wifi'))
    
    if (wifiLines.length > 0) {
      // Try to get signal strength for more accurate icon
      try {
        const wifiDetails = await execAsync("nmcli -f SIGNAL dev wifi")
        const signalMatch = wifiDetails.match(/(\d+)/)
        const signal = signalMatch ? parseInt(signalMatch[1]) : 100
        
        if (signal >= 80) return "signal_wifi_4_bar"
        if (signal >= 60) return "network_wifi_3_bar" 
        if (signal >= 40) return "network_wifi_2_bar"
        if (signal >= 20) return "network_wifi_1_bar"
        return "signal_wifi_0_bar"
      } catch {
        return "wifi" // Fallback to generic wifi icon
      }
    }
    
    const radioState = await execAsync("nmcli radio wifi")
    return radioState.trim() === "enabled" ? "wifi_off" : "wifi_off"
  } catch (error) {
    return "signal_wifi_off"
  }
})

const wifiLabel = createPoll("Checking...", 5000, async () => {
  try {
    const activeConns = await execAsync("nmcli connection show --active")
    const wifiLines = activeConns.split('\n').filter(line => line.includes('wifi'))
    
    if (wifiLines.length > 0) {
      const connectionName = wifiLines[0].split(/\s+/)[0]
      return connectionName
    }
    
    const radioState = await execAsync("nmcli radio wifi")
    return radioState.trim() === "enabled" ? "Available" : "Disabled"
  } catch (error) {
    return "Error"
  }
})

// Material 3 Time formatting - 12-hour format
const timeDisplay = createPoll("", 1000, () => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
})

const dateDisplay = createPoll("", 60000, () => {
  const now = new Date()
  return now.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
})

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name="bar"
      class="material-bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox class="bar-container">
        {/* Left Section - App Launcher & Workspace Switcher */}
        <box $type="start" class="section-start">
          <button 
            class="fab-button"
            tooltipText="App Launcher"
            onClicked={() => execAsync("rofi -show drun || dmenu_run").then(console.log)}
          >
            <box class="fab-content" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
              <label label="apps" class="material-icon" />
            </box>
          </button>
          <WorkspaceSwitcher />
        </box>

        {/* Center Section - System Status */}
        <box $type="center" class="section-center">
          <button 
            class="status-chip"
            tooltipText="Network Status"
            onClicked={() => execAsync("nmcli device wifi").then(console.log)}
          >
            <box class="chip-content">
              <label label={wifiStatus} class="material-icon" />
              <label label={wifiLabel} class="chip-text" />
            </box>
          </button>
        </box>

        {/* Right Section - Time & Quick Settings */}
        <box $type="end" class="section-end">
          <menubutton class="time-container">
            <box class="time-display" orientation={Gtk.Orientation.HORIZONTAL}>
              <label label={timeDisplay} class="time-text" />
              <label label={dateDisplay} class="date-text" />
            </box>
            <popover class="time-popover">
              <box class="popover-content">
                <Gtk.Calendar class="material-calendar" />
                <box class="quick-actions">
                  <button class="quick-action-btn">
                    <label label="settings" class="material-icon" />
                  </button>
                  <button class="quick-action-btn">
                    <label label="notifications" class="material-icon" />
                  </button>
                  <button class="quick-action-btn">
                    <label label="power_settings_new" class="material-icon" />
                  </button>
                </box>
              </box>
            </popover>
          </menubutton>
        </box>
      </centerbox>
    </window>
  )
}
