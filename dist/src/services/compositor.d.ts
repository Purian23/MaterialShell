export interface CompositorWorkspace {
    id: number;
    name: string;
    focused: boolean;
    monitor?: string;
}
export interface CompositorWindow {
    id: string;
    title: string;
    class: string;
    workspace: number;
    focused: boolean;
}
declare class GenericCompositor {
    workspaces: any;
    windows: any;
    focusedWindow: any;
    private compositor;
    constructor();
    private detectCompositor;
    private initializeWorkspaces;
    private loadNiriWorkspaces;
    private loadHyprlandWorkspaces;
    private loadSwayWorkspaces;
    private simulateWorkspaces;
    switchToWorkspace(id: number): Promise<void>;
    createWorkspace(name?: string): Promise<void>;
}
export declare const compositor: GenericCompositor;
export {};
