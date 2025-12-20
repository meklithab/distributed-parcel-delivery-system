import { Request, Response } from 'express';
import prisma from '../config/database';

export const createAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;
    const { 
      address_type, contact_name, contact_phone, 
      street_address, subcity, kebele, woreda, 
      house_number, landmark, instructions 
    } = req.body;

    const address = await prisma.orderAddress.create({
      data: {
        order_id,
        address_type,
        contact_name,
        contact_phone,
        street_address,
        subcity,
        kebele,
        woreda,
        house_number,
        landmark,
        instructions
      }
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;
    const addresses = await prisma.orderAddress.findMany({
      where: { order_id }
    });
    res.json(addresses);
  } catch (error) {
    console.error('List addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAddressById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address_id } = req.params;
    const address = await prisma.orderAddress.findUnique({
      where: { address_id }
    });
    
    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }
    res.json(address);
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address_id } = req.params;
    const updateData = req.body;

    const address = await prisma.orderAddress.update({
      where: { address_id },
      data: updateData
    });

    res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address_id } = req.params;
    await prisma.orderAddress.delete({
      where: { address_id }
    });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
