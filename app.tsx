import app from "ags/gtk4/app"
import TopBar from "./src/components/bar/TopBar"
import style from "./src/styles/main.scss"

app.start({
  css: style,
  main() {
    TopBar(0)
  },
})
