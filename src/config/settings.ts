import { readFile, writeFile } from "ags/file"

export interface MaterialShellSettings {
  topBarWidgets: string[]
  pinnedApps: string[]
  theme: {
    mode: "light" | "dark" | "auto"
    color?: "blue" | "purple"
    primaryColor?: string
    wallpaperPath?: string
  }
  dock: {
    enabled: boolean
    position: "bottom" | "left" | "right" | "top"
    autohide: boolean
  }
  notifications: {
    enabled: boolean
    timeout: number
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  }
}

const defaultSettings: MaterialShellSettings = {
  topBarWidgets: [
    "workspaces", 
    "focused-window", 
    "spacer", 
    "system-tray", 
    "clock"
  ],
  pinnedApps: [
    "firefox.desktop",
    "org.gnome.Nautilus.desktop",
    "code.desktop",
    "org.gnome.Terminal.desktop"
  ],
  theme: {
    mode: "dark",
    color: "blue"
  },
  dock: {
    enabled: true,
    position: "bottom",
    autohide: false
  },
  notifications: {
    enabled: true,
    timeout: 5000,
    position: "top-right"
  }
}

export function loadSettings(): MaterialShellSettings {
  try {
    const homeDir = "/home/purian23" // Hardcoded for now
    const configPath = `${homeDir}/.config/MaterialShell/settings.json`
    const contents = readFile(configPath)
    if (contents) {
      const userSettings = JSON.parse(contents)
      return { ...defaultSettings, ...userSettings }
    }
  } catch (error) {
    console.warn("Failed to load settings, using defaults:", error)
  }
  
  return defaultSettings
}

export function saveSettings(settings: MaterialShellSettings): void {
  try {
    const homeDir = "/home/purian23" // Hardcoded for now  
    const configPath = `${homeDir}/.config/MaterialShell/settings.json`
    const contents = JSON.stringify(settings, null, 2)
    writeFile(configPath, contents)
  } catch (error) {
    console.error("Failed to save settings:", error)
  }
}