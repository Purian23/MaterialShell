import { Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

// State for network info with reactive updates
const [networkIcon, setNetworkIcon] = createState("wifi_off")
const [networkName, setNetworkName] = createState("")

// Get network status using NetworkManager with better error handling
async function updateNetworkStatus() {
  try {
    // Check WiFi radio state
    const radioState = await execAsync("nmcli radio wifi")
    if (radioState.trim() === "disabled") {
      setNetworkIcon("wifi_off")
      setNetworkName("")
      return
    }

    // Get active WiFi connection
    const activeWifi = await execAsync("nmcli -t -f TYPE,NAME,DEVICE connection show --active")
    const wifiLine = activeWifi.split('\n').find(line => line.startsWith('802-11-wireless:'))
    
    if (wifiLine) {
      const connectionName = wifiLine.split(':')[1]
      setNetworkName(connectionName)
      
      // Get signal strength for the active connection
      try {
        const signalInfo = await execAsync("nmcli -t -f ACTIVE,SIGNAL,SSID device wifi")
        const activeLine = signalInfo.split('\n').find(line => line.startsWith('yes:'))
        
        if (activeLine) {
          const parts = activeLine.split(':')
          const signal = parseInt(parts[1]) || 0
          
          // Set icon based on signal strength
          if (signal >= 75) setNetworkIcon("wifi")
          else if (signal >= 50) setNetworkIcon("network_wifi_2_bar")
          else if (signal >= 25) setNetworkIcon("network_wifi_1_bar")
          else setNetworkIcon("wifi_off")
        } else {
          setNetworkIcon("wifi")
        }
        
      } catch {
        // Default to good signal if we can't get exact strength
        setNetworkIcon("wifi")
      }
    } else {
      // No active WiFi connection
      setNetworkIcon("wifi_off")
      setNetworkName("")
    }
  } catch (error) {
    // Fallback: basic connectivity check
    try {
      await execAsync("ping -c 1 -W 2 1.1.1.1")
      setNetworkIcon("wifi")
      setNetworkName("Connected")
    } catch {
      setNetworkIcon("wifi_off")
      setNetworkName("")
    }
  }
}

// Initialize and set up polling
updateNetworkStatus()
setInterval(updateNetworkStatus, 3000)

export default function NetworkWidget() {
  return (
    <Gtk.Box class="network-widget" orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
      <Gtk.Label 
        label={networkIcon((icon) => icon)}
        class="material-icon" 
      />
      <Gtk.Label 
        label={networkName((name) => name.length > 12 ? name.substring(0, 9) + "..." : name)}
        class="network-name"
      />
    </Gtk.Box>
  )
}