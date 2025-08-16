import { Astal, Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"

// Shared state for calendar visibility
export const [showCalendar, setShowCalendar] = createState(false)

// Auto-close calendar after 10 seconds
let timeoutId: number | null = null

function setupAutoClose() {
  // Clear any existing timeout
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  // Set a timeout to close the calendar after 10 seconds
  timeoutId = setTimeout(() => {
    if (showCalendar.get()) {
      setShowCalendar(false)
    }
  }, 10000)
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay()
}

function generateCalendarGrid(month: number, year: number) {
  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  const today = new Date()
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear()
  
  const weeks = []
  let currentWeek = []
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(
      <Gtk.Button class="calendar-day empty">
        <Gtk.Label label="" />
      </Gtk.Button>
    )
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && day === today.getDate()
    
    currentWeek.push(
      <Gtk.Button class={`calendar-day ${isToday ? 'today' : ''}`}>
        <Gtk.Label label={day.toString()} />
      </Gtk.Button>
    )
    
    // If we have 7 days in the week, start a new week
    if (currentWeek.length === 7) {
      weeks.push(
        <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} class="calendar-week">
          {currentWeek}
        </Gtk.Box>
      )
      currentWeek = []
    }
  }
  
  // Fill remaining days in the last week
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push(
      <Gtk.Button class="calendar-day empty">
        <Gtk.Label label="" />
      </Gtk.Button>
    )
  }
  
  // Add the last week if it has days
  if (currentWeek.length > 0) {
    weeks.push(
      <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} class="calendar-week">
        {currentWeek}
      </Gtk.Box>
    )
  }
  
  return weeks
}

export default function CalendarPopup() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = createState(today.getMonth())
  const [currentYear, setCurrentYear] = createState(today.getFullYear())

  function previousMonth() {
    const month = currentMonth.get()
    const year = currentYear.get()
    if (month === 0) {
      setCurrentMonth(11)
      setCurrentYear(year - 1)
    } else {
      setCurrentMonth(month - 1)
    }
  }

  function nextMonth() {
    const month = currentMonth.get()
    const year = currentYear.get()
    if (month === 11) {
      setCurrentMonth(0)
      setCurrentYear(year + 1)
    } else {
      setCurrentMonth(month + 1)
    }
  }

  // Setup auto-close when calendar becomes visible
  if (showCalendar.get()) {
    setupAutoClose()
  }

  return (
    <Astal.Window
      name="calendar-popup"
      class="calendar-popup"
      visible={showCalendar}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      marginTop={48}
      marginRight={16}
      widthRequest={280}
      heightRequest={320}
    >
      <Gtk.Box orientation={Gtk.Orientation.VERTICAL} class="calendar-container">
        {/* Header */}
        <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} class="calendar-header">
          <Gtk.Button class="calendar-nav" onClicked={previousMonth}>
            <Gtk.Label label="‹" />
          </Gtk.Button>
          
          <Gtk.Label 
            label={currentMonth((month) => `${monthNames[month]} ${currentYear.get()}`)}
            class="calendar-month-year"
            hexpand
          />
          
          <Gtk.Button class="calendar-nav" onClicked={nextMonth}>
            <Gtk.Label label="›" />
          </Gtk.Button>
        </Gtk.Box>

        {/* Day headers */}
        <Gtk.Box orientation={Gtk.Orientation.HORIZONTAL} class="calendar-day-headers">
          {dayNames.map(day => (
            <Gtk.Label label={day} class="calendar-day-header" hexpand />
          ))}
        </Gtk.Box>

        {/* Calendar grid */}
        <Gtk.Box orientation={Gtk.Orientation.VERTICAL} class="calendar-grid" vexpand>
          {currentMonth((month) => generateCalendarGrid(month, currentYear.get()))}
        </Gtk.Box>

      </Gtk.Box>
    </Astal.Window>
  )
}