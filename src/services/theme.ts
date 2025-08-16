import { loadSettings, saveSettings } from "../config/settings"

export type ThemeMode = "light" | "dark" | "auto"
export type ThemeColor = "blue" | "purple"

export interface ThemeState {
  mode: ThemeMode
  color: ThemeColor
}

class ThemeService {
  private _state: ThemeState = { mode: "dark", color: "blue" }
  
  constructor() {
    this.loadThemeFromSettings()
  }

  get state() {
    return this._state
  }

  get mode() {
    return this._state.mode
  }

  get color() {
    return this._state.color
  }

  setMode(mode: ThemeMode) {
    this._state = { ...this._state, mode }
    this.applyTheme()
    this.saveToSettings()
  }

  setColor(color: ThemeColor) {
    this._state = { ...this._state, color }
    this.applyTheme()
    this.saveToSettings()
  }

  private loadThemeFromSettings() {
    try {
      const settings = loadSettings()
      const mode = settings.theme?.mode || "dark"
      const color = (settings.theme as any)?.color || "blue"
      
      this._state = { mode, color }
      this.applyTheme()
    } catch (error) {
      console.warn("Failed to load theme from settings:", error)
    }
  }

  private saveToSettings() {
    try {
      const settings = loadSettings()
      
      settings.theme = {
        ...settings.theme,
        mode: this._state.mode,
        color: this._state.color as any
      }
      
      saveSettings(settings)
    } catch (error) {
      console.error("Failed to save theme to settings:", error)
    }
  }

  private applyTheme() {
    const { mode, color } = this._state
    
    // For AGS, we need to update the CSS dynamically since we can't access DOM
    // This is a limitation - CSS custom properties can't be changed at runtime in AGS
    console.log(`Applying theme: ${color} (${mode} mode)`)
    
    // Note: In a full implementation, we'd need to rebuild the CSS with different variables
    // or use a different approach for dynamic theming in AGS
  }

  // Get Material 3 color tokens for current theme
  getCurrentColors() {
    const { mode, color } = this._state
    
    if (color === "purple") {
      return {
        primary: "#bb86fc",
        onPrimary: "#000000",
        surface: mode === "dark" ? "#1c1b1f" : "#fffbfe",
        onSurface: mode === "dark" ? "#e6e1e5" : "#1c1b1f"
      }
    } else {
      return {
        primary: "#6750a4", 
        onPrimary: "#ffffff",
        surface: mode === "dark" ? "#1c1b1f" : "#fffbfe",
        onSurface: mode === "dark" ? "#e6e1e5" : "#1c1b1f"
      }
    }
  }
}

export const themeService = new ThemeService()