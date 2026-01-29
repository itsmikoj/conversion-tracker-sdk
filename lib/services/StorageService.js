"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
class StorageService {
    constructor(logger, prefix = '@conversion_tracker:') {
        this.storage = new Map();
        this.logger = logger;
        this.prefix = prefix;
    }
    async initialize() {
        this.logger.info('Storage service initialized');
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    async setItem(key, value) {
        try {
            this.storage.set(this.getKey(key), value);
            this.logger.debug(`Storage set: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to set storage item: ${key}`, error);
            throw error;
        }
    }
    async getItem(key) {
        try {
            const value = this.storage.get(this.getKey(key)) || null;
            this.logger.debug(`Storage get: ${key}`, value ? 'found' : 'not found');
            return value;
        }
        catch (error) {
            this.logger.error(`Failed to get storage item: ${key}`, error);
            return null;
        }
    }
    async removeItem(key) {
        try {
            this.storage.delete(this.getKey(key));
            this.logger.debug(`Storage remove: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove storage item: ${key}`, error);
            throw error;
        }
    }
    async clear() {
        try {
            const keys = await this.getAllKeys();
            keys.forEach(key => this.storage.delete(this.getKey(key)));
            this.logger.info('Storage cleared');
        }
        catch (error) {
            this.logger.error('Failed to clear storage', error);
            throw error;
        }
    }
    async getAllKeys() {
        try {
            return Array.from(this.storage.keys())
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        }
        catch (error) {
            this.logger.error('Failed to get all keys', error);
            return [];
        }
    }
    async getObject(key) {
        try {
            const value = await this.getItem(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            this.logger.error(`Failed to get object: ${key}`, error);
            return null;
        }
    }
    async setObject(key, value) {
        try {
            await this.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            this.logger.error(`Failed to set object: ${key}`, error);
            throw error;
        }
    }
}
exports.StorageService = StorageService;
