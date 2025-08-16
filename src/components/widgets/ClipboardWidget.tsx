import { Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

// State for clipboard history
const [clipboardHistory, setClipboardHistory] = createState<string[]>([])
const [showClipboard, setShowClipboard] = createState(false)

// Get clipboard content
async function getClipboardContent(): Promise<string> {
  try {
    const content = await execAsync("wl-paste")
    return content.trim()
  } catch {
    return ""
  }
}

// Add to clipboard history
function addToHistory(content: string) {
  if (!content || content.length < 2) return
  
  const history = clipboardHistory.get()
  const newHistory = [content, ...history.filter(item => item !== content)].slice(0, 10)
  setClipboardHistory(newHistory)
}

// Set clipboard content
async function setClipboardContent(content: string) {
  try {
    await execAsync(`echo -n "${content.replace(/"/g, '\\"')}" | wl-copy`)
    setShowClipboard(false)
  } catch (error) {
    console.warn("Failed to set clipboard:", error)
  }
}

// Monitor clipboard changes
let lastClipboard = ""
async function monitorClipboard() {
  const current = await getClipboardContent()
  if (current && current !== lastClipboard) {
    addToHistory(current)
    lastClipboard = current
  }
}

// Initialize clipboard monitoring
monitorClipboard()
setInterval(monitorClipboard, 2000)

export { showClipboard, setShowClipboard }

export default function ClipboardWidget() {
  return (
    <Gtk.MenuButton class="clipboard-widget">
      <Gtk.Label label="content_paste" class="material-icon" />
      <Gtk.Popover class="clipboard-popover">
        <Gtk.Box class="clipboard-container" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
          <Gtk.Label label="Clipboard History" class="clipboard-title" />
          
          <Gtk.ScrolledWindow class="clipboard-scroll" heightRequest={200}>
            <Gtk.Box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
              {clipboardHistory((history) => 
                history.length === 0 ? (
                  <Gtk.Label label="No clipboard history" class="clipboard-empty" />
                ) : (
                  history.map((item, index) => (
                    <Gtk.Button 
                      class="clipboard-item"
                      onClicked={() => setClipboardContent(item)}
                    >
                      <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
                        <Gtk.Label 
                          label={index === 0 ? "content_paste" : "history"}
                          class="material-icon clipboard-item-icon" 
                        />
                        <Gtk.Label 
                          label={item.length > 50 ? item.substring(0, 47) + "..." : item}
                          class="clipboard-item-text"
                          hexpand
                          halign={Gtk.Align.START}
                          ellipsize={3}
                        />
                      </Gtk.Box>
                    </Gtk.Button>
                  ))
                )
              )}
            </Gtk.Box>
          </Gtk.ScrolledWindow>
          
          <Gtk.Button 
            class="clipboard-clear"
            onClicked={() => setClipboardHistory([])}
          >
            <Gtk.Label label="Clear History" />
          </Gtk.Button>
        </Gtk.Box>
      </Gtk.Popover>
    </Gtk.MenuButton>
  )
}