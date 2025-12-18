
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { rabbitMQ } from '../config/rabbitmq';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { 
      pickup_lat, pickup_lng, pickup_address,
      dropoff_lat, dropoff_lng, dropoff_address,
      receiver_name, receiver_phone,
      package_type, weight
    } = req.body;

    // Calculate price (mock logic)
    const distanceInfo = Math.sqrt(Math.pow(dropoff_lat - pickup_lat, 2) + Math.pow(dropoff_lng - pickup_lng, 2));
    const price = Math.max(50, Math.round(distanceInfo * 1000)); // Minimum 50 ETB

    const order = await prisma.order.create({
      data: {
        user_id: userId!,
        pickup_lat, pickup_lng, pickup_address,
        dropoff_lat, dropoff_lng, dropoff_address,
        receiver_name, receiver_phone,
        package_type, weight,
        price,
        status: 'PENDING'
      }
    });

    // Publish event
    await rabbitMQ.publish('package.created', {
      orderId: order.id,
      userId,
      pickup: { lat: pickup_lat, lng: pickup_lng },
      dropoff: { lat: dropoff_lat, lng: dropoff_lng },
      price
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
   try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    res.json(order);
   } catch (error) {
    res.status(500).json({ message: 'Server error' });
   }
};
