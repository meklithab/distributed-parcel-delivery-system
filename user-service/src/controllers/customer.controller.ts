
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get Customer Profile (with addresses)
export const getCustomerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    const profile = await prisma.customer_profiles.findUnique({
      where: { user_id: userId },
      include: {
        users: { select: { email: true, first_name: true, last_name: true, phone_number: true } }
      }
    });

    // Also fetch addresses
    const addresses = await prisma.addresses.findMany({
      where: { user_id: userId }
    });

    res.json({ profile, addresses });
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add Address
export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const {
      address_type,
      street_address,
      subcity,
      kebele,
      house_number,
      landmark
    } = req.body;

    const address = await prisma.addresses.create({
      data: {
        user_id: userId,
        address_type,
        street_address,
        subcity,
        kebele,
        house_number,
        landmark
      }
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Addresses
export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const addresses = await prisma.addresses.findMany({
      where: { user_id: userId }
    });
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Notification Preferences
export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const {
      preferred_notification_method,
      email_notifications_enabled,
      sms_notifications_enabled
    } = req.body;

    // Check if customer profile exists
    const existingProfile = await prisma.customer_profiles.findUnique({
      where: { user_id: userId }
    });

    if (!existingProfile) {
      res.status(404).json({ message: 'Customer profile not found' });
      return;
    }

    const updatedProfile = await prisma.customer_profiles.update({
      where: { user_id: userId },
      data: {
        preferred_notification_method,
        email_notifications_enabled,
        sms_notifications_enabled,
        updated_at: new Date()
      }
    });

    res.json({ message: 'Notification preferences updated', profile: updatedProfile });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

