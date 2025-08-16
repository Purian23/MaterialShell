import { Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

// State for network info
const [networkStatus, setNetworkStatus] = createState("disconnected")
const [networkName, setNetworkName] = createState("")
const [signalStrength, setSignalStrength] = createState(0)

// Get network status using NetworkManager
async function getNetworkStatus() {
  try {
    // Check if connected to WiFi
    const wifiStatus = await execAsync("nmcli -t -f WIFI g")
    if (wifiStatus.trim() === "enabled") {
      // Get current connection
      const activeConnection = await execAsync("nmcli -t -f NAME,TYPE,DEVICE connection show --active")
      const wifiConnection = activeConnection.split('\n').find(line => line.includes('wireless') || line.includes('wifi'))
      
      if (wifiConnection) {
        const connectionName = wifiConnection.split(':')[0]
        setNetworkName(connectionName)
        setNetworkStatus("connected")
        
        // Get signal strength
        try {
          const signalOutput = await execAsync("nmcli -t -f IN-USE,SIGNAL dev wifi | grep '^\\*'")
          const signal = parseInt(signalOutput.split(':')[1]) || 0
          setSignalStrength(signal)
        } catch {
          setSignalStrength(75) // Default if we can't get signal
        }
      } else {
        setNetworkStatus("disconnected")
        setNetworkName("")
        setSignalStrength(0)
      }
    } else {
      setNetworkStatus("disabled")
      setNetworkName("")
      setSignalStrength(0)
    }
  } catch (error) {
    // Fallback: check basic connectivity
    try {
      await execAsync("ping -c 1 -W 1 8.8.8.8")
      setNetworkStatus("connected")
      setNetworkName("Network")
      setSignalStrength(75)
    } catch {
      setNetworkStatus("disconnected")
      setNetworkName("")
      setSignalStrength(0)
    }
  }
}

// Get network icon based on signal strength and status
function getNetworkIcon(status: string, signal: number): string {
  if (status === "disconnected" || status === "disabled") {
    return "wifi_off"
  }
  
  if (signal >= 75) return "wifi"
  if (signal >= 50) return "network_wifi_2_bar"
  if (signal >= 25) return "network_wifi_1_bar"
  return "wifi_off"
}

// Initialize and poll for changes
getNetworkStatus()
setInterval(getNetworkStatus, 5000)

export default function NetworkWidget() {
  return (
    <Gtk.Box class="network-widget" orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
      <Gtk.Label 
        label={networkStatus((status) => getNetworkIcon(status, signalStrength.get()))}
        class="material-icon" 
      />
      <Gtk.Label 
        label={networkName((name) => name.length > 12 ? name.substring(0, 9) + "..." : name)}
        class="network-name"
      />
    </Gtk.Box>
  )
}