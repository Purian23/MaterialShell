import { Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

// State for system metrics
const [cpuUsage, setCpuUsage] = createState("0%")
const [memUsage, setMemUsage] = createState("0%")

// Get CPU usage
async function getCpuUsage() {
  try {
    const output = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1")
    setCpuUsage(`${Math.round(parseFloat(output))}%`)
  } catch (error) {
    setCpuUsage("--")
  }
}

// Get memory usage
async function getMemUsage() {
  try {
    const output = await execAsync("free | grep Mem | awk '{printf(\"%.0f\", $3/$2 * 100.0)}'")
    setMemUsage(`${output}%`)
  } catch (error) {
    setMemUsage("--")
  }
}

// Initialize and poll for changes
getCpuUsage()
getMemUsage()
setInterval(() => {
  getCpuUsage()
  getMemUsage()
}, 2000)

export default function SystemMonitor() {
  return (
    <Gtk.Box class="system-monitor-widget" orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
      <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
        <Gtk.Label label="developer_board" class="material-icon" />
        <Gtk.Label label={cpuUsage((usage) => usage)} class="metric-text" />
      </Gtk.Box>
      <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
        <Gtk.Label label="memory" class="material-icon" />
        <Gtk.Label label={memUsage((usage) => usage)} class="metric-text" />
      </Gtk.Box>
    </Gtk.Box>
  )
}