import { Request, Response } from 'express';
import { UserService } from '../../application/services/UserService';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    userRole: string;
  };
}

export class UserController {
  constructor(private userService: UserService) {}

  async getMyProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const profile = await this.userService.getUserProfile(req.user.userId);
      res.status(200).json(profile);
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async updateMyProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const profile = await this.userService.updateUserProfile(req.user.userId, req.body);
      res.status(200).json(profile);
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Only admins can get other users' profiles
      if (req.user.userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      const { id } = req.params;
      const profile = await this.userService.getUserProfile(id);
      res.status(200).json(profile);
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  async createCourierProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const profile = await this.userService.createCourierProfile(req.user.userId, req.body);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create courier profile' });
    }
  }

  async updateCourierAvailability(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Only couriers can update their availability
      if (req.user.userRole !== 'COURIER') {
        res.status(403).json({ error: 'Only couriers can update availability' });
        return;
      }

      await this.userService.updateCourierAvailability(req.user.userId, req.body);
      res.status(200).json({ message: 'Availability updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update availability' });
    }
  }

  async getMyCourierProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const profile = await this.userService.getCourierProfile(req.user.userId);
      res.status(200).json(profile);
    } catch (error: any) {
      if (error.message === 'Courier profile not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch courier profile' });
    }
  }
}