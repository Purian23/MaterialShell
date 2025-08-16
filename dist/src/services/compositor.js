import { Variable } from "astal";
import { execAsync } from "astal/process";
class GenericCompositor {
    constructor() {
        this.workspaces = Variable([]);
        this.windows = Variable([]);
        this.focusedWindow = Variable(null);
        this.compositor = "unknown";
        this.detectCompositor();
        this.initializeWorkspaces();
    }
    async detectCompositor() {
        try {
            if (process.env.NIRI_SOCKET) {
                await execAsync("niri msg version");
                this.compositor = "niri";
                console.log("Detected niri compositor");
                return;
            }
        }
        catch { }
        try {
            if (process.env.HYPRLAND_INSTANCE_SIGNATURE) {
                await execAsync("hyprctl version");
                this.compositor = "hyprland";
                console.log("Detected Hyprland compositor");
                return;
            }
        }
        catch { }
        try {
            await execAsync("swaymsg --version");
            this.compositor = "sway";
            console.log("Detected Sway compositor");
            return;
        }
        catch { }
        console.warn("Unknown compositor, using simulation mode");
        this.simulateWorkspaces();
    }
    async initializeWorkspaces() {
        switch (this.compositor) {
            case "niri":
                await this.loadNiriWorkspaces();
                break;
            case "hyprland":
                await this.loadHyprlandWorkspaces();
                break;
            case "sway":
                await this.loadSwayWorkspaces();
                break;
            default:
                this.simulateWorkspaces();
        }
    }
    async loadNiriWorkspaces() {
        try {
            const result = await execAsync("niri msg workspaces");
            const workspaces = JSON.parse(result);
            const formatted = workspaces.map((ws, index) => ({
                id: index + 1,
                name: ws.name || (index + 1).toString(),
                focused: ws.is_focused || false,
                monitor: ws.output
            }));
            this.workspaces.set(formatted);
        }
        catch (error) {
            console.error("Failed to load niri workspaces:", error);
            this.simulateWorkspaces();
        }
    }
    async loadHyprlandWorkspaces() {
        try {
            const result = await execAsync("hyprctl workspaces -j");
            const workspaces = JSON.parse(result);
            const formatted = workspaces.map((ws) => ({
                id: ws.id,
                name: ws.name,
                focused: false,
                monitor: ws.monitor
            }));
            this.workspaces.set(formatted);
        }
        catch (error) {
            console.error("Failed to load Hyprland workspaces:", error);
            this.simulateWorkspaces();
        }
    }
    async loadSwayWorkspaces() {
        try {
            const result = await execAsync("swaymsg -t get_workspaces");
            const workspaces = JSON.parse(result);
            const formatted = workspaces.map((ws) => ({
                id: ws.num,
                name: ws.name,
                focused: ws.focused,
                monitor: ws.output
            }));
            this.workspaces.set(formatted);
        }
        catch (error) {
            console.error("Failed to load Sway workspaces:", error);
            this.simulateWorkspaces();
        }
    }
    simulateWorkspaces() {
        const workspaces = [
            { id: 1, name: "1", focused: true },
            { id: 2, name: "2", focused: false },
            { id: 3, name: "3", focused: false },
            { id: 4, name: "4", focused: false }
        ];
        this.workspaces.set(workspaces);
        console.log("Using simulated workspaces");
    }
    async switchToWorkspace(id) {
        try {
            switch (this.compositor) {
                case "niri":
                    await execAsync(`niri msg action focus-workspace ${id}`);
                    break;
                case "hyprland":
                    await execAsync(`hyprctl dispatch workspace ${id}`);
                    break;
                case "sway":
                    await execAsync(`swaymsg workspace ${id}`);
                    break;
                default:
                    console.log(`Simulated switch to workspace ${id}`);
                    const workspaces = this.workspaces.get().map(ws => ({
                        ...ws,
                        focused: ws.id === id
                    }));
                    this.workspaces.set(workspaces);
            }
        }
        catch (error) {
            console.error(`Failed to switch to workspace ${id}:`, error);
        }
    }
    async createWorkspace(name) {
        try {
            switch (this.compositor) {
                case "niri":
                    await execAsync(`niri msg action spawn-workspace`);
                    break;
                case "hyprland":
                    // Hyprland creates workspaces automatically
                    break;
                case "sway":
                    // Sway creates workspaces automatically
                    break;
                default:
                    const workspaces = this.workspaces.get();
                    const newId = Math.max(...workspaces.map(w => w.id)) + 1;
                    workspaces.push({
                        id: newId,
                        name: name || newId.toString(),
                        focused: false
                    });
                    this.workspaces.set(workspaces);
            }
        }
        catch (error) {
            console.error("Failed to create workspace:", error);
        }
    }
}
export const compositor = new GenericCompositor();
