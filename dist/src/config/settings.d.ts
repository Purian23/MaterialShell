export interface MaterialShellSettings {
    topBarWidgets: string[];
    pinnedApps: string[];
    theme: {
        mode: "light" | "dark" | "auto";
        primaryColor?: string;
        wallpaperPath?: string;
    };
    dock: {
        enabled: boolean;
        position: "bottom" | "left" | "right" | "top";
        autohide: boolean;
    };
    notifications: {
        enabled: boolean;
        timeout: number;
        position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
    };
}
export declare function loadSettings(): MaterialShellSettings;
export declare function saveSettings(settings: MaterialShellSettings): void;
