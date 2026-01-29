"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(identifiers, properties) {
        this.identifiers = identifiers;
        this.properties = properties || {};
    }
    setProperty(key, value) {
        this.properties[key] = value;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
    }
    getProperties() {
        return { ...this.properties };
    }
    getIdentifiers() {
        return { ...this.identifiers };
    }
    setUserId(userId) {
        this.identifiers.userId = userId;
        this.properties.userId = userId;
    }
    getUserId() {
        return this.identifiers.userId;
    }
    setHashedProperties(hashed) {
        this.hashedProperties = hashed;
    }
    getHashedProperties() {
        return this.hashedProperties ? { ...this.hashedProperties } : undefined;
    }
    toJSON() {
        return {
            identifiers: this.identifiers,
            properties: this.properties,
        };
    }
}
exports.User = User;
