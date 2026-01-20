
import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { rabbitMQ } from '../config/rabbitmq';

// Helper to calculate distance in KM using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { 
      pickup_lat, pickup_lng, pickup_address,
      dropoff_lat, dropoff_lng, dropoff_address,
      receiver_name, receiver_phone,
      package_type, weight
    } = req.body;

    // 1. Calculate Distance-Based Price
    const distance = calculateDistance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng);
    const basePrice = 50; 
    const pricePerKm = 15;
    const price = Math.round(basePrice + (distance * pricePerKm));

    // 2. Set Expiry (30 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const order = await prisma.order.create({
      data: {
        user_id: userId!,
        pickup_lat, pickup_lng, pickup_address,
        dropoff_lat, dropoff_lng, dropoff_address,
        receiver_name, receiver_phone,
        package_type, weight,
        price,
        expires_at: expiresAt,
        status: 'PENDING'
      }
    });

    // Publish event
    await rabbitMQ.publish('package.created', {
      orderId: order.id,
      userId,
      pickup: { lat: pickup_lat, lng: pickup_lng },
      dropoff: { lat: dropoff_lat, lng: dropoff_lng },
      price,
      expires_at: expiresAt
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const userId = user?.userId;
    const role = user?.role;

    let orders;
    if (role === 'COURIER') {
        // Return orders assigned to this courier (assignments or pickups)
        // Note: For simplicity, show ASSIGNED or PICKED_UP or DELIVERED where courier_id matches
        orders = await prisma.order.findMany({
            where: { courier_id: userId },
            orderBy: { updated_at: 'desc' }
        });
    } else {
        // Default: Customer's created orders
        orders = await prisma.order.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAvailableOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const orders = await prisma.order.findMany({
            where: { 
                status: 'PENDING',
                OR: [
                    { expires_at: null },
                    { expires_at: { gt: now } }
                ]
            },
            orderBy: { created_at: 'asc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCourierLocation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;
        const courierId = (req as AuthRequest).user?.userId;

        const order = await prisma.order.findUnique({ where: { id } });
        if (!order || order.courier_id !== courierId) {
            res.status(403).json({ message: 'Unauthorized or order not found' });
            return;
        }

        await prisma.order.update({
            where: { id },
            data: { 
                courier_lat: lat,
                courier_lng: lng
            }
        });

        res.json({ message: 'Location updated' });
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

export const assignCourier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { courier_id } = req.body;

    // Check if order exists
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ message: 'Order is not in PENDING state' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        courier_id,
        status: 'ASSIGNED'
      }
    });

    // Publish event
    await rabbitMQ.publish('order.assigned', {
      orderId: id,
      courierId: courier_id,
      status: 'ASSIGNED'
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Assign courier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
       res.status(400).json({ message: 'Invalid status' });
       return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Publish event
    await rabbitMQ.publish('order.status_updated', {
      orderId: id,
      status,
      prevStatus: order.status
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
