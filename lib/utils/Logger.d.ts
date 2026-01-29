type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';
export declare class Logger {
    private level;
    private prefix;
    private enableTimestamp;
    private handlers;
    constructor(level?: LogLevel, prefix?: string, enableTimestamp?: boolean);
    setLevel(level: LogLevel): void;
    addHandler(handler: (level: string, message: string, data?: any) => void): void;
    error(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    info(message: string, data?: any): void;
    debug(message: string, data?: any): void;
    private log;
    group(label: string): void;
    groupEnd(): void;
    table(data: any): void;
}
export {};
//# sourceMappingURL=Logger.d.ts.map