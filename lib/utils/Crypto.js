"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
class Crypto {
    static sha256(value) {
        return crypto_js_1.default.SHA256(value.toLowerCase().trim()).toString();
    }
    static hashUserData(data) {
        const hashed = {};
        for (const [key, value] of Object.entries(data)) {
            if (value && typeof value === 'string') {
                hashed[key] = this.sha256(value);
            }
        }
        return hashed;
    }
    static hashEmail(email) {
        return this.sha256(email.toLowerCase().trim());
    }
    static hashPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return this.sha256(cleaned);
    }
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    static anonymizeIP(ip) {
        const parts = ip.split('.');
        if (parts.length === 4) {
            parts[3] = '0';
            return parts.join('.');
        }
        const ipv6Parts = ip.split(':');
        if (ipv6Parts.length > 4) {
            return ipv6Parts.slice(0, 4).join(':') + '::';
        }
        return ip;
    }
}
exports.Crypto = Crypto;
