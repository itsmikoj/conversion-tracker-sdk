"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkService = void 0;
class NetworkService {
    constructor(logger) {
        this.listeners = [];
        this.logger = logger;
        this.currentStatus = {
            isConnected: true,
            type: 'wifi',
            isInternetReachable: true,
        };
    }
    async initialize() {
        this.logger.info('Network service initialized (mock implementation)');
    }
    dispose() {
        this.listeners = [];
    }
    getStatus() {
        return { ...this.currentStatus };
    }
    isConnected() {
        return this.currentStatus.isConnected && this.currentStatus.isInternetReachable;
    }
    addListener(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    async refresh() {
        return this.getStatus();
    }
}
exports.NetworkService = NetworkService;
