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

export class User {
  private properties: UserProperties;
  private identifiers: UserIdentifiers;
  private hashedProperties?: Record<string, string>;

  constructor(identifiers: UserIdentifiers, properties?: UserProperties) {
    this.identifiers = identifiers;
    this.properties = properties || {};
  }

  setProperty(key: string, value: any): void {
    this.properties[key] = value;
  }

  setProperties(properties: UserProperties): void {
    this.properties = { ...this.properties, ...properties };
  }

  getProperties(): UserProperties {
    return { ...this.properties };
  }

  getIdentifiers(): UserIdentifiers {
    return { ...this.identifiers };
  }

  setUserId(userId: string): void {
    this.identifiers.userId = userId;
    this.properties.userId = userId;
  }

  getUserId(): string | undefined {
    return this.identifiers.userId;
  }

  setHashedProperties(hashed: Record<string, string>): void {
    this.hashedProperties = hashed;
  }

  getHashedProperties(): Record<string, string> | undefined {
    return this.hashedProperties ? { ...this.hashedProperties } : undefined;
  }

  toJSON(): object {
    return {
      identifiers: this.identifiers,
      properties: this.properties,
    };
  }
}
