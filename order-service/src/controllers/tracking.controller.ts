import { Request, Response } from 'express';
import prisma from '../config/database';

export const createTrackingEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;
    const { 
      event_type, location_text, latitude, 
      longitude, courier_id, notes 
    } = req.body;

    const event = await prisma.trackingEvent.create({
      data: {
        order_id,
        event_type,
        location_text,
        latitude,
        longitude,
        courier_id,
        notes
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create tracking event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listTrackingEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;
    const events = await prisma.trackingEvent.findMany({
      where: { order_id },
      orderBy: { event_timestamp: 'desc' }
    });
    res.json(events);
  } catch (error) {
    console.error('List tracking events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTrackingEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id } = req.params;
    const event = await prisma.trackingEvent.findUnique({
      where: { event_id }
    });
    
    if (!event) {
      res.status(404).json({ message: 'Tracking event not found' });
      return;
    }
    res.json(event);
  } catch (error) {
    console.error('Get tracking event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
