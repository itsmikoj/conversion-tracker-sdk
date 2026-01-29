export declare class Crypto {
    static sha256(value: string): string;
    static hashUserData(data: Record<string, any>): Record<string, string>;
    static hashEmail(email: string): string;
    static hashPhone(phone: string): string;
    static generateUUID(): string;
    static anonymizeIP(ip: string): string;
}
//# sourceMappingURL=Crypto.d.ts.map