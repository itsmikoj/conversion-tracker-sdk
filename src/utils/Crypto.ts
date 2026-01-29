import CryptoJS from 'crypto-js';

export class Crypto {

  static sha256(value: string): string {
    return CryptoJS.SHA256(value.toLowerCase().trim()).toString();
  }

  static hashUserData(data: Record<string, any>): Record<string, string> {
    const hashed: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'string') {
        hashed[key] = this.sha256(value);
      }
    }

    return hashed;
  }

  static hashEmail(email: string): string {
    return this.sha256(email.toLowerCase().trim());
  }

  static hashPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return this.sha256(cleaned);
  }

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static anonymizeIP(ip: string): string {
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
