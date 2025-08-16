import { jsx as _jsx } from "ags/gtk4/jsx-runtime";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
const workspaces = createPoll([], 1000, async () => {
    try {
        if (process.env.NIRI_SOCKET) {
            const result = await execAsync("niri msg workspaces");
            const ws = JSON.parse(result);
            return ws.map((w, index) => ({
                id: index + 1,
                name: w.name || (index + 1).toString(),
                focused: w.is_focused || false
            }));
        }
    }
    catch {
        // Fallback to simulated workspaces
        return [
            { id: 1, name: "1", focused: true },
            { id: 2, name: "2", focused: false },
            { id: 3, name: "3", focused: false },
            { id: 4, name: "4", focused: false }
        ];
    }
    return [];
});
async function switchWorkspace(id) {
    try {
        if (process.env.NIRI_SOCKET) {
            await execAsync(`niri msg action focus-workspace ${id}`);
        }
        else {
            console.log(`Simulated switch to workspace ${id}`);
        }
    }
    catch (error) {
        console.error(`Failed to switch to workspace ${id}:`, error);
    }
}
export default function Workspaces() {
    return (_jsx("box", { class: "workspaces-widget", orientation: Gtk.Orientation.HORIZONTAL, children: workspaces().map(workspace => (_jsx("button", { class: `workspace-button ${workspace.focused ? "focused" : ""}`, onClicked: () => switchWorkspace(workspace.id), children: _jsx("label", { label: workspace.name }) }))) }));
}
