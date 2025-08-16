import { execAsync } from "ags/process"
import { createPoll } from "ags/time"

interface NiriWorkspace {
  id: number
  idx: number
  name: string | null
  output: string
  is_urgent: boolean
  is_active: boolean
  is_focused: boolean
  active_window_id: number | null
}

const workspaces = createPoll([] as NiriWorkspace[], 1000, async () => {
  try {
    const output = await execAsync("niri msg -j workspaces")
    return JSON.parse(output) as NiriWorkspace[]
  } catch (error) {
    console.warn("Failed to get niri workspaces:", error)
    return [
      { id: 1, idx: 1, name: null, output: "default", is_urgent: false, is_active: true, is_focused: true, active_window_id: null },
      { id: 2, idx: 2, name: null, output: "default", is_urgent: false, is_active: false, is_focused: false, active_window_id: null },
      { id: 3, idx: 3, name: null, output: "default", is_urgent: false, is_active: false, is_focused: false, active_window_id: null }
    ]
  }
})

async function switchToWorkspace(index: number) {
  try {
    await execAsync(`niri msg action focus-workspace ${index}`)
  } catch (error) {
    console.warn(`Failed to switch to workspace ${index}:`, error)
  }
}

function WorkspaceButton({ workspace }: { workspace: NiriWorkspace }) {
  const isActive = workspace.is_active || workspace.is_focused
  const hasWindows = workspace.active_window_id !== null
  
  return (
    <button
      class={`workspace-button ${isActive ? 'active' : ''} ${hasWindows ? 'has-windows' : ''} ${workspace.is_urgent ? 'urgent' : ''}`}
      tooltipText={workspace.name || `Workspace ${workspace.idx}`}
      onClicked={() => switchToWorkspace(workspace.idx)}
    >
      <label
        label={workspace.name || workspace.idx.toString()}
        class="workspace-label"
      />
    </button>
  )
}

export default function Workspaces() {
  return (
    <box class="workspace-switcher" spacing={8}>
      {workspaces((ws) => ws.map((workspace) => (
        <WorkspaceButton workspace={workspace} />
      )))}
    </box>
  )
}