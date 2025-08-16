import { Astal, Gtk } from "ags/gtk4"
import { createState } from "ags"

const [currentMonth, setCurrentMonth] = createState(new Date().getMonth())
const [currentYear, setCurrentYear] = createState(new Date().getFullYear())

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay()
}

function CalendarHeader() {
  return (
    <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} class="calendar-header">
      <Gtk.Button 
        class="calendar-nav"
        onClicked={() => {
          if (currentMonth() === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear() - 1)
          } else {
            setCurrentMonth(currentMonth() - 1)
          }
        }}
      >
        <Gtk.Label label="‹" />
      </Gtk.Button>
      
      <Gtk.Label 
        label={`${monthNames[currentMonth()]} ${currentYear()}`}
        class="calendar-month-year"
        hexpand
      />
      
      <Gtk.Button 
        class="calendar-nav"
        onClicked={() => {
          if (currentMonth() === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear() + 1)
          } else {
            setCurrentMonth(currentMonth() + 1)
          }
        }}
      >
        <Gtk.Label label="›" />
      </Gtk.Button>
    </Gtk.Box>
  )
}

function CalendarGrid() {
  const today = new Date()
  const todayDate = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()
  
  const daysInMonth = getDaysInMonth(currentMonth(), currentYear())
  const firstDay = getFirstDayOfMonth(currentMonth(), currentYear())
  
  const days = []
  
  // Add day headers
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  for (const dayHeader of dayHeaders) {
    days.push(
      <Gtk.Label label={dayHeader} class="calendar-day-header" />
    )
  }
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<Gtk.Label label="" class="calendar-day-empty" />)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === todayDate && 
                   currentMonth() === todayMonth && 
                   currentYear() === todayYear
    
    days.push(
      <Gtk.Button class={`calendar-day ${isToday ? 'today' : ''}`}>
        <Gtk.Label label={day.toString()} />
      </Gtk.Button>
    )
  }
  
  return (
    <Gtk.Grid class="calendar-grid">
      {days.map((day, index) => {
        const row = Math.floor(index / 7)
        const col = index % 7
        return <div style={{gridColumn: col + 1, gridRow: row + 1}}>{day}</div>
      })}
    </Gtk.Grid>
  )
}

export default function Calendar({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  if (!visible) return null
  
  return (
    <window
      name="calendar-popup"
      class="calendar-popup"
      visible={true}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      marginTop={48}
      marginRight={16}
    >
      <Gtk.Box orientation={Gtk.Orientation.VERTICAL} class="calendar-container">
        <CalendarHeader />
        <CalendarGrid />
        <Gtk.Button 
          class="calendar-close"
          onClicked={onClose}
        >
          <Gtk.Label label="Close" />
        </Gtk.Button>
      </Gtk.Box>
    </window>
  )
}