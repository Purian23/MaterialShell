declare class IPCService {
    private commands;
    register(command: string, handler: Function): void;
    execute(command: string, ...args: any[]): Promise<any>;
    listCommands(): string[];
    unregister(command: string): boolean;
}
export declare const ipc: IPCService;
export {};
