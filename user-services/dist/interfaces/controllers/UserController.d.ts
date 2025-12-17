import { Request, Response } from 'express';
import { UserService } from '../../application/services/UserService';
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        userRole: string;
    };
}
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserById(req: AuthenticatedRequest, res: Response): Promise<void>;
    createCourierProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateCourierAvailability(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMyCourierProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=UserController.d.ts.map