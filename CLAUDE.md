# MaterialShell - AGS Implementation

## Project Overview
MaterialShell is a desktop shell built with AGS (Aylur's GTK Shell) for the niri Wayland compositor, following Material Design 3 principles. This project is a reimplementation of the quickshell-based DankMaterialShell using the AGS framework.

## Architecture

### Directory Structure
```
MaterialShell/
├── widget/           # UI widgets and components
├── service/          # System integration services  
├── style.scss        # Material 3 styling
└── app.ts            # Main application entry
```

### Core Principles
1. **Modular Design**: Each widget should be self-contained and reusable
2. **Material 3 Compliance**: Follow Google's Material Design 3 guidelines
3. **Niri Integration**: Seamless integration with niri compositor features
4. **Performance**: Target 60 FPS, minimize resource usage
5. **TypeScript**: Strongly typed development with proper error handling

## Development Guidelines

### Code Style
- Use 2-space indentation
- Prefer TypeScript over JavaScript
- Use arrow functions for callbacks
- Import statements at the top, grouped logically
- No unnecessary comments - code should be self-documenting

### Widget Development
- Use AGS native widgets and properties
- Leverage `halign` and `valign` for alignment with `Gtk.Align` enum
- Implement proper error handling for external commands
- Use `createPoll` for periodic updates
- Handle niri unavailability gracefully

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
- Use `createPoll` for regular data updates
- Implement proper cleanup and error handling
- Expose reactive properties for widgets to bind to

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
1. Use TypeScript for all new code
2. Test changes with `ags --config .`
3. Run TypeScript compilation to check for errors
4. Follow the existing component patterns
5. Update this document when adding new patterns

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

### Polling Services
```typescript
const exampleService = createPoll("default", 5000, async () => {
  try {
    const result = await execAsync("command")
    return processResult(result)
  } catch (error) {
    return "fallback"
  }
})
```

### Widget Structure
```tsx
export default function MyWidget() {
  return (
    <box class="my-widget" halign={Gtk.Align.CENTER}>
      <label label={serviceData} class="widget-text" />
    </box>
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
- This project targets niri compositor specifically
- AGS version 4 with GTK4 backend
- TypeScript is preferred for type safety
- Material 3 dark theme implementation
- Focus on performance and user experience