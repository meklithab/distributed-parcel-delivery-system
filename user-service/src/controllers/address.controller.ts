
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// ==================== ADDRESS MANAGEMENT ====================

export const getUserAddresses = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.userId;

        const addresses = await prisma.addresses.findMany({
            where: { user_id: userId },
            orderBy: [
                { is_default: 'desc' },
                { created_at: 'desc' }
            ]
        });

        res.json(addresses);
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const {
            address_type,
            street_address,
            subcity,
            kebele,
            woreda,
            house_number,
            landmark,
            is_default
        } = req.body;

        // If this is set as default, unset other defaults
        if (is_default) {
            await prisma.addresses.updateMany({
                where: { user_id: userId },
                data: { is_default: false }
            });
        }

        const address = await prisma.addresses.create({
            data: {
                user_id: userId!,
                address_type,
                street_address,
                subcity,
                kebele,
                woreda,
                house_number,
                landmark,
                is_default: is_default || false
            }
        });

        res.status(201).json(address);
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { addressId } = req.params;
        const {
            address_type,
            street_address,
            subcity,
            kebele,
            woreda,
            house_number,
            landmark,
            is_default
        } = req.body;

        // Verify ownership
        const existingAddress = await prisma.addresses.findFirst({
            where: {
                address_id: addressId,
                user_id: userId
            }
        });

        if (!existingAddress) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }

        // If setting as default, unset other defaults
        if (is_default) {
            await prisma.addresses.updateMany({
                where: {
                    user_id: userId,
                    address_id: { not: addressId }
                },
                data: { is_default: false }
            });
        }

        const updatedAddress = await prisma.addresses.update({
            where: { address_id: addressId },
            data: {
                address_type,
                street_address,
                subcity,
                kebele,
                woreda,
                house_number,
                landmark,
                is_default,
                updated_at: new Date()
            }
        });

        res.json(updatedAddress);
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { addressId } = req.params;

        // Verify ownership
        const existingAddress = await prisma.addresses.findFirst({
            where: {
                address_id: addressId,
                user_id: userId
            }
        });

        if (!existingAddress) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }

        await prisma.addresses.delete({
            where: { address_id: addressId }
        });

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const { addressId } = req.params;

        // Verify ownership
        const existingAddress = await prisma.addresses.findFirst({
            where: {
                address_id: addressId,
                user_id: userId
            }
        });

        if (!existingAddress) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }

        // Unset all defaults for this user
        await prisma.addresses.updateMany({
            where: { user_id: userId },
            data: { is_default: false }
        });

        // Set this address as default
        const updatedAddress = await prisma.addresses.update({
            where: { address_id: addressId },
            data: { is_default: true }
        });

        res.json(updatedAddress);
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
