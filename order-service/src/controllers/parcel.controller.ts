import { Request, Response } from 'express';
import prisma from '../config/database';

export const createParcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;
    const { 
      parcel_number, description, weight_kg, 
      length_cm, width_cm, height_cm, 
      declared_value, category, is_fragile, 
      is_perishable, requires_signature 
    } = req.body;

    const parcel = await prisma.parcel.create({
      data: {
        order_id,
        parcel_number: parcel_number || `PAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        description,
        weight_kg,
        length_cm,
        width_cm,
        height_cm,
        declared_value,
        category,
        is_fragile: is_fragile || false,
        is_perishable: is_perishable || false,
        requires_signature: requires_signature || false
      }
    });

    res.status(201).json(parcel);
  } catch (error) {
    console.error('Create parcel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listParcels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;
    const parcels = await prisma.parcel.findMany({
      where: { order_id }
    });
    res.json(parcels);
  } catch (error) {
    console.error('List parcels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getParcelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parcel_id } = req.params;
    const parcel = await prisma.parcel.findUnique({
      where: { parcel_id }
    });
    
    if (!parcel) {
      res.status(404).json({ message: 'Parcel not found' });
      return;
    }
    res.json(parcel);
  } catch (error) {
    console.error('Get parcel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateParcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parcel_id } = req.params;
    const updateData = req.body;

    const parcel = await prisma.parcel.update({
      where: { parcel_id },
      data: updateData
    });

    res.json(parcel);
  } catch (error) {
    console.error('Update parcel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteParcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parcel_id } = req.params;
    await prisma.parcel.delete({
      where: { parcel_id }
    });
    res.json({ message: 'Parcel deleted successfully' });
  } catch (error) {
    console.error('Delete parcel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
