
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// ==================== COURIER RATING SYSTEM ====================

export const submitCourierRating = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { courier_profile_id, order_reference_id, rating, review_text } = req.body;

        // Validate rating (1-5)
        if (rating < 1 || rating > 5) {
            res.status(400).json({ message: 'Rating must be between 1 and 5' });
            return;
        }

        // Check if courier profile exists
        const courierProfile = await prisma.courier_profiles.findUnique({
            where: { courier_profile_id }
        });

        if (!courierProfile) {
            res.status(404).json({ message: 'Courier profile not found' });
            return;
        }

        // Create rating
        const newRating = await prisma.courier_ratings.create({
            data: {
                courier_profile_id,
                customer_id: userId!,
                order_reference_id,
                rating,
                review_text
            }
        });

        // Update courier's average rating
        const allRatings = await prisma.courier_ratings.findMany({
            where: { courier_profile_id },
            select: { rating: true }
        });

        const averageRating = allRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allRatings.length;

        await prisma.courier_profiles.update({
            where: { courier_profile_id },
            data: { rating: averageRating }
        });

        res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
    } catch (error) {
        console.error('Submit courier rating error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCourierRatings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courierId } = req.params;

        // Get courier profile
        const courierProfile = await prisma.courier_profiles.findUnique({
            where: { courier_profile_id: courierId },
            select: {
                rating: true,
                total_deliveries_completed: true
            }
        });

        if (!courierProfile) {
            res.status(404).json({ message: 'Courier profile not found' });
            return;
        }

        // Get all ratings with customer info
        const ratings = await prisma.courier_ratings.findMany({
            where: { courier_profile_id: courierId },
            include: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({
            averageRating: courierProfile.rating,
            totalDeliveries: courierProfile.total_deliveries_completed,
            totalRatings: ratings.length,
            ratings
        });
    } catch (error) {
        console.error('Get courier ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyRatings = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        // Get ratings submitted by this customer
        const ratings = await prisma.courier_ratings.findMany({
            where: { customer_id: userId },
            include: {
                courier_profiles: {
                    include: {
                        users: {
                            select: {
                                first_name: true,
                                last_name: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(ratings);
    } catch (error) {
        console.error('Get my ratings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
