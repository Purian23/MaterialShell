import { Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

// State for launcher visibility and search
const [showLauncher, setShowLauncher] = createState(false)
const [searchQuery, setSearchQuery] = createState("")
const [applications, setApplications] = createState<Array<{name: string, exec: string, icon?: string}>>([])

// Get installed applications
async function getApplications() {
  try {
    const output = await execAsync("find /usr/share/applications -name '*.desktop' 2>/dev/null || true")
    const desktopFiles = output.trim().split('\n').filter(f => f)
    
    const apps: Array<{name: string, exec: string, icon?: string}> = []
    
    for (const file of desktopFiles.slice(0, 50)) { // Limit for performance
      try {
        const content = await execAsync(`cat "${file}"`)
        const lines = content.split('\n')
        
        let name = ""
        let exec = ""
        let icon = ""
        let hidden = false
        
        for (const line of lines) {
          if (line.startsWith('Name=') && !name) {
            name = line.substring(5)
          } else if (line.startsWith('Exec=')) {
            exec = line.substring(5).split(' ')[0] // Get just the command
          } else if (line.startsWith('Icon=')) {
            icon = line.substring(5)
          } else if (line.startsWith('Hidden=true') || line.startsWith('NoDisplay=true')) {
            hidden = true
            break
          }
        }
        
        if (name && exec && !hidden) {
          apps.push({ name, exec, icon })
        }
      } catch {
        // Skip files we can't read
      }
    }
    
    setApplications(apps.sort((a, b) => a.name.localeCompare(b.name)))
  } catch (error) {
    console.warn("Failed to get applications:", error)
  }
}

// Launch application
async function launchApp(exec: string) {
  try {
    await execAsync(exec)
    setShowLauncher(false)
    setSearchQuery("")
  } catch (error) {
    console.warn("Failed to launch app:", error)
  }
}

// Filter applications based on search query
function getFilteredApps(): Array<{name: string, exec: string, icon?: string}> {
  const query = searchQuery.get().toLowerCase()
  if (!query) return applications.get().slice(0, 8) // Show first 8 when no search
  
  return applications.get()
    .filter(app => app.name.toLowerCase().includes(query))
    .slice(0, 8) // Limit results
}

// Initialize applications list
getApplications()

export { showLauncher, setShowLauncher }

export default function AppLauncher() {
  return (
    <Gtk.Popover 
      class="app-launcher-popover"
      visible={showLauncher}
    >
      <Gtk.Box class="launcher-container" orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        {/* Search Entry */}
        <Gtk.Entry 
          class="launcher-search"
          placeholderText="Search applications..."
          text={searchQuery((q) => q)}
          onChanged={(entry) => setSearchQuery(entry.get_text())}
        />
        
        {/* Applications List */}
        <Gtk.ScrolledWindow class="launcher-scroll" heightRequest={300}>
          <Gtk.Box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
            {searchQuery((query) => {
              const filteredApps = getFilteredApps()
              return filteredApps.map(app => (
                <Gtk.Button 
                  class="launcher-app-item"
                  onClicked={() => launchApp(app.exec)}
                >
                  <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
                    <Gtk.Label label="apps" class="material-icon" />
                    <Gtk.Label label={app.name} class="app-name" hexpand halign={Gtk.Align.START} />
                  </Gtk.Box>
                </Gtk.Button>
              ))
            })}
          </Gtk.Box>
        </Gtk.ScrolledWindow>
      </Gtk.Box>
    </Gtk.Popover>
  )
}