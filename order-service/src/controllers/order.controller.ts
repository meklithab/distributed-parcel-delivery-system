import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { rabbitMQ } from '../config/rabbitmq';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { 
      customer_id, 
      service_type, 
      priority, 
      scheduled_pickup_time, 
      scheduled_delivery_time, 
      notes 
    } = req.body;

    // Use customer_id from body if provided, otherwise from auth token
    const finalCustomerId = customer_id || userId;

    if (!finalCustomerId) {
        res.status(400).json({ message: 'Customer ID is required' });
        return;
    }

    // Generate a simple order number (e.g., ORD-TIMESTAMP-RANDOM)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        customer_id: finalCustomerId,
        order_number: orderNumber,
        service_type,
        priority,
        scheduled_pickup_time: scheduled_pickup_time ? new Date(scheduled_pickup_time) : null,
        scheduled_delivery_time: scheduled_delivery_time ? new Date(scheduled_delivery_time) : null,
        notes,
        status: 'PENDING'
      }
    });

    // Publish event
    await rabbitMQ.publish('order.created', {
      orderId: order.order_id,
      customerId: finalCustomerId,
      orderNumber: order.order_number,
      status: order.status
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, customer_id, courier_id } = req.query;
    
    // Build filter object
    const where: any = {};
    if (status) where.status = String(status);
    if (customer_id) where.customer_id = String(customer_id);
    if (courier_id) where.courier_id = String(courier_id);

    // If user is a customer, limit to their orders (unless they are admin/courier - simplifying here)
    // Assuming the AuthRequest might have role info, but for now let's trust the query or enforce it if needed.
    // If it's a customer endpoint, we might want to enforce customer_id = userId
    const userId = (req as AuthRequest).user?.userId;
    // For now, if no filters provided and user is logged in, show their orders? 
    // The requirement says "List all orders", optional params.
    // I'll leave it open but usually we filter by user.

    const orders = await prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        addresses: true,
        parcels: true
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('List orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
   try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ 
        where: { order_id: id },
        include: {
            addresses: true,
            parcels: true,
            tracking_events: {
                orderBy: { event_timestamp: 'desc' }
            }
        }
    });
    
    if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
    }
    res.json(order);
   } catch (error) {
    res.status(500).json({ message: 'Server error' });
   }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, priority, scheduled_delivery_time, notes } = req.body;

        const updatedOrder = await prisma.order.update({
            where: { order_id: id },
            data: {
                status,
                priority,
                scheduled_delivery_time: scheduled_delivery_time ? new Date(scheduled_delivery_time) : undefined,
                notes
            }
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        // Ideally checking if status allows cancellation
        await prisma.order.delete({
            where: { order_id: id }
        });
        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
