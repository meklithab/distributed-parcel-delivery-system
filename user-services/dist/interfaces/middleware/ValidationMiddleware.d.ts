import { Request, Response, NextFunction } from 'express';
export declare class ValidationMiddleware {
    static validateEmail(email: string): boolean;
    static validatePhoneNumber(phoneNumber: string): boolean;
    static validatePassword(password: string): boolean;
    static validateRegisterRequest(req: Request, res: Response, next: NextFunction): void;
    static validateLoginRequest(req: Request, res: Response, next: NextFunction): void;
    static validateRefreshTokenRequest(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=ValidationMiddleware.d.ts.map