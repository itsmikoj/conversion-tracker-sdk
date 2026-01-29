"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    providers: {},
    batchSize: 10,
    batchInterval: 5000,
    maxQueueSize: 100,
    persistEvents: true,
    offlineMode: true,
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
    retryMultiplier: 2,
    enableATT: true,
    hashUserData: true,
    anonymizeIP: true,
    dataRetentionDays: 30,
    debug: false,
    debugPanel: false,
    logLevel: 'error',
    enablePerformanceMonitoring: true,
};
