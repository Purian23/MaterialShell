import app from "ags/gtk4/app"
import { Gdk } from "ags/gtk4"
import style from "./style.scss"
import Bar from "./widget/Bar"

app.start({
  css: style,
  main() {
    const display = Gdk.Display.get_default()
    if (display) {
      const monitors = display.get_monitors()
      for (let i = 0; i < monitors.get_n_items(); i++) {
        const monitor = monitors.get_item(i) as Gdk.Monitor
        Bar(monitor)
      }
    }
  },
})
