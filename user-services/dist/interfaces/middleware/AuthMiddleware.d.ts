import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../domain/enums/UserRole';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        userRole: UserRole;
    };
}
export declare class AuthMiddleware {
    static authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    static authorizeRoles(...roles: UserRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
}
export {};
//# sourceMappingURL=AuthMiddleware.d.ts.map