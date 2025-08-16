import app from "ags/gtk4/app"
import { Gdk } from "ags/gtk4"
import TopBar from "./src/components/bar/TopBar"
import { loadSettings } from "./src/config/settings"
import { themeService } from "./src/services/theme"
import style from "./src/styles/main.scss"

const settings = loadSettings()
// Initialize theme service to apply theme settings
themeService.state

app.start({
  css: style,
  main() {
    const display = Gdk.Display.get_default()
    if (display) {
      const monitors = display.get_monitors()
      for (let i = 0; i < monitors.get_n_items(); i++) {
        const monitor = monitors.get_item(i) as Gdk.Monitor
        TopBar(monitor, settings)
      }
    }
  },
})
