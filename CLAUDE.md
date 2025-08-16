# MaterialShell - AGS Latest Implementation

## Project Overview
MaterialShell is a desktop shell built with the latest AGS (v2.3.0+) for the niri Wayland compositor, following Material Design 3 principles. This project is a port of the quickshell-based DankMaterialShell to the latest AGS framework using TypeScript with JSX and the new Astal+Gnim architecture.

## AGS Version Policy
**IMPORTANT**: This project always uses the latest AGS version from the GitHub repository (https://github.com/Aylur/ags) to ensure:
- Access to the newest features and improvements
- Better performance with latest optimizations
- Enhanced TypeScript and JSX support
- Most up-to-date Astal+Gnim integration
- Latest bug fixes and stability improvements

Current target: AGS v2.3.0+ with the new Vala/C core rewrite and enhanced bundling system.

## Porting Context
This is a complete architectural reimplementation from QuickShell (Qt/QML) to latest AGS (GTK/TypeScript), requiring fundamental transformations:
- QML declarative syntax → JSX functional components with new Astal widgets
- QuickShell property bindings → AGS Variable/reactive system
- Qt Quick animations → CSS transitions and AGS animations
- IPC command structure → New AGS CLI and bundling system
- Direct niri support → Wayland layer-shell with compositor detection
- v1.x AGS patterns → v2.x+ Astal+Gnim architecture

## Architecture

### Directory Structure
```
MaterialShell/
├── src/
│   ├── app.tsx                    # Main application entry
│   ├── config/
│   │   ├── settings.ts            # User settings management
│   │   └── theme.ts               # Theme configuration
│   ├── components/
│   │   ├── bar/                   # Top bar components
│   │   ├── dock/                  # App dock implementation
│   │   ├── launcher/              # App launcher (Spotlight)
│   │   ├── notifications/         # Notification system
│   │   ├── monitoring/            # System monitoring widgets
│   │   └── controls/              # Control center components
│   ├── services/
│   │   ├── ipc.ts                # IPC command handling
│   │   ├── compositor.ts         # Generic compositor interface
│   │   ├── applications.ts       # App management
│   │   ├── systemMonitor.ts      # System resource tracking
│   │   ├── theme.ts              # Matugen integration
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

### Core Principles
1. **Modular Design**: Each widget should be self-contained and reusable
2. **Material 3 Compliance**: Follow Google's Material Design 3 guidelines
3. **Niri Integration**: Generic Wayland layer-shell with niri-specific workarounds
4. **Performance**: Target 60 FPS, minimize resource usage
5. **TypeScript with JSX**: Strongly typed development using Gnim library patterns

## Development Guidelines

### Code Style
- Use 2-space indentation
- Prefer TypeScript over JavaScript
- Use arrow functions for callbacks
- Import statements at the top, grouped logically
- No unnecessary comments - code should be self-documenting

### Widget Development
- Use Astal/GTK3 widgets with JSX syntax
- Leverage `halign` and `valign` for alignment with `Gtk.Align` enum
- Implement proper error handling for external commands
- Use `poll()` for periodic updates with Variable objects
- Handle niri unavailability gracefully with generic compositor fallbacks

### Naming Conventions
- PascalCase for widget files and components
- camelCase for variables and functions
- kebab-case for CSS classes
- SCREAMING_SNAKE_CASE for constants

### Material 3 Implementation
- Use defined color tokens from `style.scss`
- Follow Material 3 component specifications
- Implement proper state changes (hover, active, disabled)
- Use appropriate elevation and shadows
- Consistent corner radius per component type

### Niri Integration
- Use `niri msg` commands for workspace operations
- Handle JSON responses properly
- Implement event streaming where beneficial
- Provide fallbacks when niri is unavailable
- Use `$NIRI_SOCKET` for direct socket communication when needed

### Services Pattern
- Create singleton services for system integration
- Use `poll()` for regular data updates with Variable objects
- Implement proper cleanup and error handling
- Expose reactive Variable properties for widgets to bind to
- Use `bind()` function for reactive UI updates

### Testing & Quality
- Test on multi-monitor setups
- Verify performance under load
- Ensure graceful degradation
- Test with and without niri running

## Component Specifications

### Workspace Switcher
- Display current workspaces for active monitor
- Support clicking to switch workspaces
- Visual indication of active workspace
- Material 3 chip design with animations
- Handle workspace creation/deletion dynamically

### TopBar Layout
- Left: App launcher (FAB)
- Center: System status (network, etc.)
- Right: Time/date with quick settings

## Development Workflow
1. Use TypeScript with JSX for all new code (AGS v2.x+ standard)
2. Generate types with `ags types` for GObject libraries  
3. Test changes with `ags run .` during development
4. Bundle for distribution with `ags bundle`
5. Use `--verbose` flag for debugging type generation
6. Follow latest AGS v2.x+ Astal+Gnim patterns
7. Update this document when adopting new AGS features

## Dependencies
- **AGS v2.3.0+** - Latest from GitHub with Astal+Gnim architecture
- **TypeScript** - For type safety and modern JavaScript features
- **Node.js** - Runtime for development tools
- **esbuild** - Bundling system (included with AGS v2.x)
- **Material Symbols Variable** font
- **Inter** font family for UI text
- **Fira Code** for monospace text
- **matugen** for Material 3 theming integration
- **GObject libraries** - GTK4, GLib, etc. (type-generated by AGS)

## Best Practices
- Prefer AGS native solutions over custom implementations
- Use CSS for styling instead of inline styles where possible
- Implement responsive design for different screen sizes
- Handle edge cases (no network, niri not running, etc.)
- Document complex logic with inline comments only when necessary
- Use meaningful variable and function names
- Keep functions small and focused
- Separate concerns between UI and business logic

## Common Patterns

### AGS 2.0 Polling Services
```typescript
import { Variable, poll } from "astal"
import { execAsync } from "astal/process"

class ExampleService {
  data = Variable("default")
  
  constructor() {
    poll(5000, async () => {
      try {
        const result = await execAsync("command")
        this.data.set(processResult(result))
      } catch (error) {
        this.data.set("fallback")
      }
    })
  }
}

export const exampleService = new ExampleService()
```

### AGS 2.0 Widget Structure
```tsx
import { Box, Label } from "astal/gtk3/widget"
import { bind } from "astal"
import { exampleService } from "../services/example"

export default function MyWidget() {
  return (
    <Box className="my-widget" halign={Gtk.Align.CENTER}>
      <Label label={bind(exampleService.data)} className="widget-text" />
    </Box>
  )
}
```

### Window with Layer Shell
```tsx
import { Window, Box } from "astal/gtk3/widget"
import { App, Astal } from "astal/gtk3"

export default function TopBar() {
  return (
    <Window
      name="top-bar"
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
    >
      <Box className="bar" orientation={Gtk.Orientation.HORIZONTAL}>
        {/* widgets */}
      </Box>
    </Window>
  )
}
```

### Material 3 Styling
```scss
.my-widget {
  background: $md-sys-color-surface-container;
  color: $md-sys-color-on-surface;
  border-radius: $md-sys-shape-corner-medium;
  padding: 8px 16px;
  
  &:hover {
    background: rgba($md-sys-color-on-surface, 0.08);
  }
}
```

## Notes
- This project targets niri compositor specifically with compositor detection fallbacks
- **AGS v2.3.0+** with new Vala/C core, Astal+Gnim architecture, and esbuild bundling
- TypeScript with JSX is required (AGS v2.x+ standard)
- Material 3 dark theme implementation with matugen integration
- Leverages latest AGS performance improvements and features
- Port from DankMaterialShell QuickShell implementation
- Expected 90%+ feature parity with latest AGS capabilities

## Implementation Status
**Current Phase**: Foundation and Core Infrastructure
- ✅ Project structure aligned with AGS v2.x+ patterns
- ✅ TypeScript configuration for latest AGS
- ✅ Basic component architecture established
- 🔄 **Next**: Complete core UI components with latest Astal widgets

Implementation follows AGS v2.x+ best practices:
1. ✅ Foundation and core infrastructure  
2. 🔄 Core UI components with Astal widgets
3. ⏳ Advanced features using latest AGS APIs
4. ⏳ System integration with new bundling system
5. ⏳ Performance optimization with v2.x improvements
6. ⏳ Testing and deployment with `ags bundle`
- CLAUDE.md