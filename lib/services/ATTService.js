"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTService = void 0;
const react_native_1 = require("react-native");
const TrackingTransparency = __importStar(require("expo-tracking-transparency"));
class ATTService {
    constructor(logger) {
        this.status = 'not-determined';
        this.logger = logger;
    }
    async initialize() {
        if (react_native_1.Platform.OS !== 'ios') {
            this.status = 'unavailable';
            return;
        }
        try {
            const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
            this.status = this.mapStatus(status);
            this.logger.info(`ATT Status: ${this.status}`);
            if (this.status === 'authorized') {
                await this.loadAdvertisingId();
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize ATT', error);
            this.status = 'unavailable';
        }
    }
    async requestPermission() {
        if (react_native_1.Platform.OS !== 'ios') {
            this.status = 'unavailable';
            return this.status;
        }
        try {
            const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
            this.status = this.mapStatus(status);
            this.logger.info(`ATT Permission requested: ${this.status}`);
            if (this.status === 'authorized') {
                await this.loadAdvertisingId();
            }
            return this.status;
        }
        catch (error) {
            this.logger.error('Failed to request ATT permission', error);
            this.status = 'denied';
            return this.status;
        }
    }
    isAuthorized() {
        return this.status === 'authorized';
    }
    getStatus() {
        return this.status;
    }
    getAdvertisingId() {
        return this.advertisingId;
    }
    canRequestPermission() {
        return react_native_1.Platform.OS === 'ios' && this.status === 'not-determined';
    }
    async loadAdvertisingId() {
        try {
            const id = await TrackingTransparency.getAdvertisingId();
            this.advertisingId = id;
            this.logger.debug(`Advertising ID loaded: ${id ? 'available' : 'unavailable'}`);
        }
        catch (error) {
            this.logger.warn('Failed to load advertising ID', error);
        }
    }
    mapStatus(status) {
        switch (status) {
            case 'granted':
                return 'authorized';
            case 'denied':
                return 'denied';
            case 'restricted':
                return 'restricted';
            case 'undetermined':
                return 'not-determined';
            default:
                return 'unavailable';
        }
    }
    getStatusMessage() {
        switch (this.status) {
            case 'authorized':
                return 'Tracking is authorized';
            case 'denied':
                return 'Tracking permission was denied';
            case 'restricted':
                return 'Tracking is restricted by device settings';
            case 'not-determined':
                return 'Tracking permission not requested yet';
            case 'unavailable':
                return 'Tracking transparency not available on this platform';
            default:
                return 'Unknown status';
        }
    }
}
exports.ATTService = ATTService;
