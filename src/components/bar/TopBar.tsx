import { Astal, Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"
import FocusedWindow from "../widgets/FocusedWindow"
import SystemMonitor from "../widgets/SystemMonitor"
import NetworkWidget from "../widgets/NetworkWidget"

// Native state management
const [currentTime, setCurrentTime] = createState("")
const [currentDate, setCurrentDate] = createState("")
const [currentWorkspace, setCurrentWorkspace] = createState(1)

// Update time and date every second
setInterval(() => {
  const now = new Date()
  setCurrentTime(now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }))
  setCurrentDate(now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }))
}, 1000)

// Workspace switching function using native niri commands
async function switchToWorkspace(index: number) {
  try {
    await execAsync(`niri msg action focus-workspace ${index}`)
    setCurrentWorkspace(index)
  } catch (error) {
    console.warn(`Failed to switch to workspace ${index}:`, error)
  }
}

// Get current workspace on startup
async function getCurrentWorkspace() {
  try {
    const output = await execAsync("niri msg -j workspaces")
    const workspaces = JSON.parse(output)
    const active = workspaces.find((w: any) => w.is_active || w.is_focused)
    if (active) {
      setCurrentWorkspace(active.idx)
    }
  } catch (error) {
    console.warn("Failed to get current workspace:", error)
  }
}

// Initialize current workspace
getCurrentWorkspace()

// Poll workspace changes every 2 seconds to stay in sync
setInterval(() => {
  getCurrentWorkspace()
}, 2000)

export default function TopBar(monitor = 0) {
  return (
    <Astal.Window
      name="material-top-bar"
      class="material-top-bar"
      visible={true}
      monitor={monitor}
      layer={Astal.Layer.TOP}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      heightRequest={48}
    >
      <Gtk.Grid class="bar-container" columnHomogeneous>
        {/* Left Section - Column 0 */}
        <Gtk.Box spacing={8} class="section-left" halign={Gtk.Align.START}>
          <Gtk.Box spacing={8} class="workspace-switcher">
            <Gtk.Button 
              class={currentWorkspace((ws) => `workspace-button ${ws === 1 ? 'active' : ''}`)}
              onClicked={() => switchToWorkspace(1)}
            >
              <Gtk.Label label="1" class="workspace-label" />
            </Gtk.Button>
            <Gtk.Button 
              class={currentWorkspace((ws) => `workspace-button ${ws === 2 ? 'active' : ''}`)}
              onClicked={() => switchToWorkspace(2)}
            >
              <Gtk.Label label="2" class="workspace-label" />
            </Gtk.Button>
            <Gtk.Button 
              class={currentWorkspace((ws) => `workspace-button ${ws === 3 ? 'active' : ''}`)}
              onClicked={() => switchToWorkspace(3)}
            >
              <Gtk.Label label="3" class="workspace-label" />
            </Gtk.Button>
            <Gtk.Button 
              class={currentWorkspace((ws) => `workspace-button ${ws === 4 ? 'active' : ''}`)}
              onClicked={() => switchToWorkspace(4)}
            >
              <Gtk.Label label="4" class="workspace-label" />
            </Gtk.Button>
          </Gtk.Box>
          <FocusedWindow />
        </Gtk.Box>

        {/* Center Section - Column 1 */}
        <Gtk.Box class="section-center" halign={Gtk.Align.CENTER}>
          <Gtk.MenuButton class="time-container">
            <Gtk.Box class="time-display" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
              <Gtk.Label label={currentTime((time) => time)} class="time-text" />
              <Gtk.Label label={currentDate((date) => date)} class="date-text" />
            </Gtk.Box>
            <Gtk.Popover class="time-popover">
              <Gtk.Box class="popover-content">
                <Gtk.Calendar class="material-calendar" />
              </Gtk.Box>
            </Gtk.Popover>
          </Gtk.MenuButton>
        </Gtk.Box>

        {/* Right Section - Column 2 */}
        <Gtk.Box spacing={8} class="section-right" halign={Gtk.Align.END}>
          <NetworkWidget />
          <SystemMonitor />
        </Gtk.Box>
      </Gtk.Grid>
    </Astal.Window>
  )
}