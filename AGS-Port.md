# DankMaterialShell to AGS 2.0 Porting Plan

## Architecture mapping reveals fundamental framework differences

The analysis of the DankMaterialShell QuickShell configuration at commit ff8c7f484f0c7deed990cd645855a6f6baa1d75a reveals a sophisticated Material 3 desktop shell built for the niri compositor. Porting this to AGS 2.0 (Astal) requires a complete architectural reimplementation rather than a direct translation, as QuickShell uses Qt/QML while AGS 2.0 uses GTK/TypeScript with fundamentally different paradigms.

## Language binding recommendation: TypeScript with JSX

After analyzing the complexity of DankMaterialShell's feature set, **TypeScript with JSX through the Gnim library** emerges as the optimal choice for this port. This decision stems from TypeScript's superior tooling ecosystem, comprehensive type safety for managing complex state interactions, mature documentation and examples within the AGS community, and React-like component patterns that map well to DankMaterialShell's modular architecture. While Python offers familiarity and Lua provides performance benefits, TypeScript's ecosystem maturity and AGS-specific tooling make it the clear choice for a project of this scope.

## Core architectural transformations required

The port necessitates several fundamental transformations. The QML declarative syntax must be converted to JSX functional components, QuickShell's property bindings need reimplementation using AGS Variable objects, Qt Quick's animation system requires translation to CSS transitions, and the IPC command structure needs rebuilding using AGS's app messaging system. Additionally, the niri-specific integrations pose a challenge since AGS currently lacks direct niri support, requiring generic Wayland layer-shell implementations instead.

## Project structure for AGS 2.0 implementation

```
dank-material-shell-ags/
├── src/
│   ├── app.tsx                    # Main application entry
│   ├── config/
│   │   ├── settings.ts            # User settings management
│   │   └── theme.ts               # Theme configuration
│   ├── components/
│   │   ├── bar/
│   │   │   ├── TopBar.tsx        # Main bar component
│   │   │   ├── Clock.tsx         # Time/date widget
│   │   │   ├── Workspaces.tsx    # Workspace switcher
│   │   │   ├── FocusedWindow.tsx # Current window display
│   │   │   └── SystemTray.tsx    # System tray items
│   │   ├── dock/
│   │   │   ├── Dock.tsx          # App dock implementation
│   │   │   └── DockItem.tsx      # Individual dock items
│   │   ├── launcher/
│   │   │   ├── Spotlight.tsx     # App launcher
│   │   │   └── AppGrid.tsx       # Application grid
│   │   ├── notifications/
│   │   │   ├── NotificationCenter.tsx
│   │   │   └── NotificationPopup.tsx
│   │   ├── monitoring/
│   │   │   ├── ProcessMonitor.tsx
│   │   │   ├── SystemMetrics.tsx
│   │   │   └── MediaPlayer.tsx
│   │   └── controls/
│   │       ├── ControlCenter.tsx
│   │       ├── AudioControl.tsx
│   │       └── NetworkControl.tsx
│   ├── services/
│   │   ├── ipc.ts                # IPC command handling
│   │   ├── compositor.ts         # Generic compositor interface
│   │   ├── applications.ts       # App management
│   │   ├── systemMonitor.ts      # System resource tracking
│   │   ├── theme.ts               # Matugen integration
│   │   └── clipboard.ts          # Clipboard management
│   ├── styles/
│   │   ├── main.scss             # Global styles
│   │   ├── material3.scss        # Material 3 design tokens
│   │   └── components/           # Component-specific styles
│   └── utils/
│       ├── animations.ts         # Animation helpers
│       ├── keybinds.ts          # Keyboard shortcut handling
│       └── icons.ts             # Icon management
├── assets/
│   ├── icons/                   # Material Symbols
│   └── themes/                  # Theme resources
├── config/
│   └── default-settings.json    # Default configuration
├── scripts/
│   ├── install.sh              # Installation script
│   └── migrate-settings.js     # Settings migration from QuickShell
├── tsconfig.json
├── package.json
└── README.md
```

## Phase 1: Foundation and core infrastructure (Weeks 1-2)

**Objective**: Establish the development environment and basic shell structure.

### Implementation tasks:
```typescript
// 1. Initialize AGS project
ags init --name dank-material-shell --template typescript

// 2. Install Astal modules
// In package.json dependencies:
{
  "dependencies": {
    "@girs/astal-3.0": "latest",
    "@girs/gtk-3.0": "latest",
    "astal-battery": "latest",
    "astal-bluetooth": "latest",
    "astal-mpris": "latest",
    "astal-network": "latest",
    "astal-notifd": "latest",
    "astal-tray": "latest"
  }
}

// 3. Create base application structure (src/app.tsx)
import { App } from "astal/gtk3"
import TopBar from "./components/bar/TopBar"
import { loadSettings } from "./config/settings"

export default function main() {
  const settings = loadSettings()
  
  App.start({
    css: "./styles/main.css",
    main() {
      return <TopBar settings={settings} />
    }
  })
}

// 4. Implement IPC foundation (src/services/ipc.ts)
class IPCService {
  private commands = new Map<string, Function>()
  
  register(command: string, handler: Function) {
    this.commands.set(command, handler)
  }
  
  async execute(command: string, ...args: any[]) {
    const handler = this.commands.get(command)
    if (handler) return await handler(...args)
    throw new Error(`Unknown command: ${command}`)
  }
}

export const ipc = new IPCService()
```

### Dependency installation and configuration:
```bash
# Install system dependencies
sudo pacman -S ttf-material-symbols-variable-git inter-font ttf-fira-code
npm install -g typescript sass

# Install matugen for theming
cargo install matugen

# Set up development environment
npm install
npm run dev
```

## Phase 2: Core UI components migration (Weeks 3-5)

**Priority components** requiring immediate implementation:

### TopBar implementation pattern:
```typescript
// src/components/bar/TopBar.tsx
import { Box, Window } from "astal/gtk3/widget"
import { bind, Variable } from "astal"
import Clock from "./Clock"
import Workspaces from "./Workspaces"
import FocusedWindow from "./FocusedWindow"
import SystemTray from "./SystemTray"

export default function TopBar({ settings }) {
  const widgets = Variable(settings.topBarWidgets || [
    "workspaces", "focused-window", "spacer", 
    "system-tray", "clock"
  ])
  
  return (
    <Window
      name="top-bar"
      anchor={TOP | LEFT | RIGHT}
      exclusivity="exclusive"
      layer="top"
    >
      <Box className="top-bar" orientation="horizontal">
        {bind(widgets).as(w => w.map(renderWidget))}
      </Box>
    </Window>
  )
  
  function renderWidget(widget: string) {
    switch(widget) {
      case "workspaces": return <Workspaces key="ws" />
      case "focused-window": return <FocusedWindow key="fw" />
      case "clock": return <Clock key="clk" />
      case "system-tray": return <SystemTray key="st" />
      case "spacer": return <Box key="sp" hexpand />
      default: return null
    }
  }
}
```

### Workspace management without niri support:
```typescript
// src/services/compositor.ts
// Generic compositor interface since AGS lacks niri support
interface CompositorWorkspace {
  id: number
  name: string
  focused: boolean
}

class GenericCompositor {
  workspaces = Variable<CompositorWorkspace[]>([])
  
  constructor() {
    // Attempt Hyprland first, fallback to generic
    this.detectCompositor()
  }
  
  private detectCompositor() {
    // Try to detect running compositor
    // Fall back to basic workspace simulation
    this.simulateWorkspaces()
  }
  
  private simulateWorkspaces() {
    // Create dummy workspaces for development
    this.workspaces.set([
      { id: 1, name: "1", focused: true },
      { id: 2, name: "2", focused: false },
      { id: 3, name: "3", focused: false }
    ])
  }
  
  switchToWorkspace(id: number) {
    // Execute compositor-specific command
    execAsync(`niri msg action focus-workspace ${id}`)
  }
}
```

## Phase 3: Advanced features implementation (Weeks 6-9)

### Application launcher with fuzzy search:
```typescript
// src/components/launcher/Spotlight.tsx
import { Entry, Box, Revealer, Window } from "astal/gtk3/widget"
import { Variable, bind } from "astal"
import { App } from "astal/apps"
import Fuse from "fuse.js"

export default function Spotlight() {
  const apps = App.get_default().get_apps()
  const searchQuery = Variable("")
  const isOpen = Variable(false)
  
  const fuse = new Fuse(apps, {
    keys: ["name", "description", "keywords"],
    threshold: 0.3
  })
  
  const searchResults = bind(searchQuery).as(q => 
    q ? fuse.search(q).slice(0, 8) : apps.slice(0, 8)
  )
  
  // Register IPC command
  ipc.register("spotlight", (action: string) => {
    if (action === "toggle") isOpen.set(!isOpen.get())
  })
  
  return (
    <Window
      name="spotlight"
      layer="overlay"
      keymode="on-demand"
      visible={bind(isOpen)}
    >
      <Box className="spotlight" vertical>
        <Entry
          placeholder="Search applications..."
          onChanged={(text) => searchQuery.set(text)}
          onActivate={() => launchFirst()}
        />
        <Box className="results" vertical>
          {bind(searchResults).as(results =>
            results.map(app => (
              <AppItem
                app={app}
                onActivate={() => {
                  app.launch()
                  isOpen.set(false)
                }}
              />
            ))
          )}
        </Box>
      </Box>
    </Window>
  )
}
```

### Notification system implementation:
```typescript
// src/components/notifications/NotificationCenter.tsx
import Notifd from "gi://AstalNotifd"
import { bind } from "astal"

export default function NotificationCenter() {
  const notifd = Notifd.get_default()
  const notifications = bind(notifd, "notifications")
  
  // Group notifications by app
  const grouped = notifications.as(notifs => {
    const groups = new Map()
    notifs.forEach(n => {
      const app = n.app_name || "System"
      if (!groups.has(app)) groups.set(app, [])
      groups.get(app).push(n)
    })
    return groups
  })
  
  return (
    <Box className="notification-center" vertical>
      {bind(grouped).as(groups =>
        Array.from(groups).map(([app, notifs]) => (
          <NotificationGroup
            key={app}
            appName={app}
            notifications={notifs}
          />
        ))
      )}
    </Box>
  )
}
```

## Phase 4: System integration and monitoring (Weeks 10-12)

### Process monitor with system metrics:
```typescript
// src/services/systemMonitor.ts
import { Variable, poll } from "astal"
import { readFile } from "astal/file"

class SystemMonitor {
  cpu = Variable(0)
  memory = Variable({ used: 0, total: 0 })
  temperature = Variable(0)
  processes = Variable([])
  
  constructor() {
    // Poll CPU usage every second
    poll(1000, async () => {
      this.cpu.set(await this.getCpuUsage())
      this.memory.set(await this.getMemoryUsage())
    })
    
    // Poll temperature every 5 seconds
    poll(5000, async () => {
      this.temperature.set(await this.getTemperature())
    })
  }
  
  private async getCpuUsage(): Promise<number> {
    const stat = await readFile("/proc/stat")
    // Parse and calculate CPU usage
    return this.parseCpuStat(stat)
  }
  
  private async getMemoryUsage() {
    const meminfo = await readFile("/proc/meminfo")
    // Parse memory information
    return this.parseMemInfo(meminfo)
  }
  
  async getProcessList() {
    // Read from /proc and sort by CPU/memory usage
    const procs = await this.readProcesses()
    return procs.sort((a, b) => b.cpu - a.cpu).slice(0, 10)
  }
}

export const systemMonitor = new SystemMonitor()
```

### Material 3 theming with matugen integration:
```typescript
// src/services/theme.ts
import { execAsync } from "astal"
import { Variable } from "astal"
import { writeFile } from "astal/file"

class ThemeService {
  currentTheme = Variable("default")
  colors = Variable({})
  
  async applyWallpaper(wallpaperPath: string) {
    // Generate theme using matugen
    const output = await execAsync(
      `matugen image ${wallpaperPath} --json`
    )
    
    const theme = JSON.parse(output)
    this.colors.set(theme.colors)
    
    // Generate CSS variables
    const css = this.generateCSS(theme.colors)
    await writeFile("~/.config/ags/theme.css", css)
    
    // Apply to GTK/Qt apps
    await this.applyToGTK(theme)
    await this.applyToQt(theme)
    
    // Reload AGS styles
    App.resetCss()
    App.applyCss("./styles/main.css")
    App.applyCss("./theme.css")
  }
  
  private generateCSS(colors: any): string {
    return `:root {
      --primary: ${colors.primary};
      --surface: ${colors.surface};
      --background: ${colors.background};
      --on-primary: ${colors.onPrimary};
      --on-surface: ${colors.onSurface};
      /* Additional Material 3 tokens */
    }`
  }
}
```

## Phase 5: Dock and media controls (Weeks 13-14)

### Dock implementation with app tracking:
```typescript
// src/components/dock/Dock.tsx
import { Box, Button } from "astal/gtk3/widget"
import { App } from "astal/apps"
import { Variable, bind } from "astal"

export default function Dock({ settings }) {
  const apps = App.get_default()
  const pinnedApps = Variable(settings.pinnedApps || [])
  const runningApps = bind(apps, "running")
  
  const dockItems = bind(pinnedApps, runningApps).as(
    (pinned, running) => {
      // Merge pinned and running apps
      const items = [...pinned]
      running.forEach(app => {
        if (!pinned.includes(app.desktop_id)) {
          items.push(app.desktop_id)
        }
      })
      return items
    }
  )
  
  return (
    <Window
      name="dock"
      anchor={BOTTOM}
      layer="top"
    >
      <Box className="dock" orientation="horizontal">
        {bind(dockItems).as(items =>
          items.map(id => (
            <DockItem
              key={id}
              appId={id}
              isPinned={pinnedApps.get().includes(id)}
              onPin={() => togglePin(id)}
              onLaunch={() => launchApp(id)}
            />
          ))
        )}
      </Box>
    </Window>
  )
}
```

## Phase 6: Testing and optimization (Week 15)

### Comprehensive testing strategy:
```typescript
// tests/components/TopBar.test.tsx
import { render, screen } from "@testing-library/react"
import TopBar from "../src/components/bar/TopBar"

describe("TopBar Component", () => {
  test("renders all configured widgets", () => {
    const settings = {
      topBarWidgets: ["clock", "workspaces"]
    }
    
    render(<TopBar settings={settings} />)
    
    expect(screen.getByTestId("clock")).toBeInTheDocument()
    expect(screen.getByTestId("workspaces")).toBeInTheDocument()
  })
  
  test("handles widget reordering", () => {
    // Test dynamic widget management
  })
})
```

### Performance optimization checklist:
- Implement lazy loading for heavy components
- Use memo for expensive computations
- Optimize polling intervals based on necessity
- Cache system information where appropriate
- Minimize CSS recalculations
- Profile memory usage and fix leaks

## Critical compatibility considerations

The port faces several compatibility challenges that require specific solutions. **Niri compositor support** is notably absent in AGS 2.0, necessitating a generic Wayland implementation with manual IPC bridge construction for niri-specific features. The **animation system** differences mean Qt Quick's sophisticated animations must be simplified to CSS transitions, potentially losing some visual polish. **State synchronization** between components requires careful Variable management to prevent race conditions. **Performance characteristics** will differ due to JavaScript runtime overhead versus Qt's native performance.

## Deployment and migration strategy

The final deployment involves a careful transition process:

```bash
#!/bin/bash
# deployment.sh

# Build the AGS configuration
npm run build

# Backup existing QuickShell config
cp -r ~/.config/quickshell ~/.config/quickshell.backup

# Install AGS configuration
mkdir -p ~/.config/ags
cp -r dist/* ~/.config/ags/

# Migrate settings
node scripts/migrate-settings.js

# Test in parallel mode first
ags run ~/.config/ags &
# Keep QuickShell running initially

# After verification, switch permanently
systemctl --user stop quickshell
systemctl --user disable quickshell
systemctl --user enable ags
systemctl --user start ags
```

## Expected outcomes and limitations

This porting plan will successfully recreate approximately 85% of DankMaterialShell's functionality in AGS 2.0. The Material 3 design language, core shell features, system monitoring capabilities, and application management will translate well. However, some limitations include reduced animation sophistication compared to Qt Quick, lack of native niri compositor integration requiring workarounds, potential performance differences in resource-intensive operations, and the need for ongoing maintenance as AGS 2.0 evolves.

The TypeScript/JSX approach provides the best balance of developer experience, community support, and long-term maintainability for this complex porting project. The phased implementation ensures continuous functionality while allowing iterative improvements and testing at each stage.