class IPCService {
    constructor() {
        this.commands = new Map();
    }
    register(command, handler) {
        this.commands.set(command, handler);
    }
    async execute(command, ...args) {
        const handler = this.commands.get(command);
        if (handler) {
            try {
                return await handler(...args);
            }
            catch (error) {
                console.error(`Error executing command ${command}:`, error);
                throw error;
            }
        }
        throw new Error(`Unknown command: ${command}`);
    }
    listCommands() {
        return Array.from(this.commands.keys());
    }
    unregister(command) {
        return this.commands.delete(command);
    }
}
export const ipc = new IPCService();
ipc.register("ping", () => "pong");
ipc.register("list-commands", () => ipc.listCommands());
ipc.register("reload", () => {
    console.log("Reloading MaterialShell...");
    // App.quit() - will implement later
});
