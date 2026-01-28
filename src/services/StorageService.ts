import { Logger } from '../utils/Logger';

export interface IStorageService {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

export class StorageService implements IStorageService {
  private logger: Logger;
  private prefix: string;
  private storage: Map<string, string> = new Map();

  constructor(logger: Logger, prefix: string = '@conversion_tracker:') {
    this.logger = logger;
    this.prefix = prefix;
  }

  async initialize(): Promise<void> {
    this.logger.info('Storage service initialized');
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.set(this.getKey(key), value);
      this.logger.debug(`Storage set: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set storage item: ${key}`, error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const value = this.storage.get(this.getKey(key)) || null;
      this.logger.debug(`Storage get: ${key}`, value ? 'found' : 'not found');
      return value;
    } catch (error) {
      this.logger.error(`Failed to get storage item: ${key}`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.delete(this.getKey(key));
      this.logger.debug(`Storage remove: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to remove storage item: ${key}`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      keys.forEach(key => this.storage.delete(this.getKey(key)));
      this.logger.info('Storage cleared');
    } catch (error) {
      this.logger.error('Failed to clear storage', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Array.from(this.storage.keys())
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      this.logger.error('Failed to get all keys', error);
      return [];
    }
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get object: ${key}`, error);
      return null;
    }
  }

  async setObject(key: string, value: any): Promise<void> {
    try {
      await this.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Failed to set object: ${key}`, error);
      throw error;
    }
  }
}
