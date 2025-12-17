import { Request, Response, NextFunction } from 'express';
import { JWTProvider } from '../../infrastructure/security/JWTProvider';
import { UserRole } from '../../domain/enums/UserRole';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    userRole: UserRole;
  };
}

export class AuthMiddleware {
  static authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      try {
        const decoded = JWTProvider.verifyToken(token);
        req.user = {
          userId: decoded.userId,
          userRole: decoded.userRole
        };
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  static authorizeRoles(...roles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!roles.includes(req.user.userRole)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }
}
