export interface UserProperties {
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    [key: string]: any;
}
export interface UserIdentifiers {
    userId?: string;
    anonymousId: string;
    deviceId: string;
    advertisingId?: string;
    fbLoginId?: string;
    googleId?: string;
    appleId?: string;
}
export declare class User {
    private properties;
    private identifiers;
    private hashedProperties?;
    constructor(identifiers: UserIdentifiers, properties?: UserProperties);
    setProperty(key: string, value: any): void;
    setProperties(properties: UserProperties): void;
    getProperties(): UserProperties;
    getIdentifiers(): UserIdentifiers;
    setUserId(userId: string): void;
    getUserId(): string | undefined;
    setHashedProperties(hashed: Record<string, string>): void;
    getHashedProperties(): Record<string, string> | undefined;
    toJSON(): object;
}
//# sourceMappingURL=User.d.ts.map