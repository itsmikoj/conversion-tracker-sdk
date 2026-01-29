import { Event } from '../models/Event';
export declare class Validator {
    static isValidEmail(email: string): boolean;
    static isValidPhone(phone: string): boolean;
    static isValidCurrency(currency: string): boolean;
    static validateEvent(event: Event): {
        valid: boolean;
        errors: string[];
    };
    static validateConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
    static sanitizeString(input: string): string;
    static sanitizeParameters(parameters: Record<string, any>): Record<string, any>;
}
//# sourceMappingURL=Validator.d.ts.map