import { Logger } from '../utils/Logger';
export interface IStorageService {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
}
export declare class StorageService implements IStorageService {
    private logger;
    private prefix;
    private storage;
    constructor(logger: Logger, prefix?: string);
    initialize(): Promise<void>;
    private getKey;
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
    getObject<T>(key: string): Promise<T | null>;
    setObject(key: string, value: any): Promise<void>;
}
//# sourceMappingURL=StorageService.d.ts.map