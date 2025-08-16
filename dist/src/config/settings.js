import { GLib } from "ags/gtk4";
const defaultSettings = {
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
        mode: "dark"
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
};
export function loadSettings() {
    try {
        const homeDir = GLib.get_home_dir();
        const configPath = `${homeDir}/.config/MaterialShell/settings.json`;
        // Simple file existence check
        if (GLib.file_test(configPath, GLib.FileTest.EXISTS)) {
            const [success, contents] = GLib.file_get_contents(configPath);
            if (success && contents) {
                const userSettings = JSON.parse(new TextDecoder().decode(contents));
                return { ...defaultSettings, ...userSettings };
            }
        }
    }
    catch (error) {
        console.warn("Failed to load settings, using defaults:", error);
    }
    return defaultSettings;
}
export function saveSettings(settings) {
    try {
        const homeDir = GLib.get_home_dir();
        const configPath = `${homeDir}/.config/MaterialShell/settings.json`;
        const contents = JSON.stringify(settings, null, 2);
        GLib.file_set_contents(configPath, contents);
    }
    catch (error) {
        console.error("Failed to save settings:", error);
    }
}
