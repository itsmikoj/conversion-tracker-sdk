"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaConfigFromExpo = void 0;
const expo_constants_1 = __importDefault(require("expo-constants"));
function getMetaConfigFromExpo() {
    const expoConfig = expo_constants_1.default.expoConfig;
    const fbPlugin = expoConfig?.plugins?.find((plugin) => {
        if (Array.isArray(plugin)) {
            return plugin[0] === 'react-native-fbsdk-next';
        }
        return false;
    });
    if (!fbPlugin || !Array.isArray(fbPlugin)) {
        console.warn('Facebook SDK plugin not found in app.json/app.config.js');
        return null;
    }
    const fbConfig = fbPlugin[1];
    return {
        appId: fbConfig.appID,
        clientToken: fbConfig.clientToken,
    };
}
exports.getMetaConfigFromExpo = getMetaConfigFromExpo;
