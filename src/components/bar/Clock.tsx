import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"

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

export default function Clock() {
  return (
    <box class="clock-widget" orientation={Gtk.Orientation.VERTICAL}>
      <label 
        class="clock-time" 
        label={timeDisplay} 
        halign={Gtk.Align.CENTER}
      />
      <label 
        class="clock-date" 
        label={dateDisplay} 
        halign={Gtk.Align.CENTER}
      />
    </box>
  )
}