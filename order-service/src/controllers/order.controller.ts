import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { orderProducer } from '../events/producers/order.producer';

/**
 * Price calculation rules stored as constants (can be moved to DB later)
 */
const PRICING_RULES = {
  baseFee: 100, // Base delivery fee in ETB
  weightPerKg: 10, // Fee per kg
  distancePerKm: 5, // Fee per km (if distance is provided)
  priorityMultipliers: {
    STANDARD: 1,
    EXPRESS: 1.5,
    SAME_DAY: 2
  },
  serviceTypeMultipliers: {
    DOOR_TO_DOOR: 1,
    PICKUP_STATION: 0.8,
    LOCKER: 0.7
  },
  fragileMultiplier: 1.2,
  perishableMultiplier: 1.3,
  signatureMultiplier: 1.1
  ,
  insuranceRate: 0.02, // 2% of declared value
  taxRate: 0.15 // 15% VAT
};

/**
 * Calculate price estimate based on order details
 */
const calculatePriceEstimate = (data: {
  priority?: string;
  serviceType?: string;
  parcels: Array<{
    weightKg: number;
    isFragile?: boolean;
    isPerishable?: boolean;
    requiresSignature?: boolean;
    declaredValue?: number;
  }>;
}): { totalPrice: number; breakdown: any } => {
  const { priority = 'STANDARD', serviceType = 'DOOR_TO_DOOR', parcels } = data;

  // Calculate total weight and parcel-specific fees
  let totalWeight = 0;
  let parcelModifiers = 1;
  let insuranceFee = 0;

  for (const parcel of parcels) {
    totalWeight += Number(parcel.weightKg) || 0;
    if (parcel.isFragile) parcelModifiers *= PRICING_RULES.fragileMultiplier;
    if (parcel.isPerishable) parcelModifiers *= PRICING_RULES.perishableMultiplier;
    if (parcel.requiresSignature) parcelModifiers *= PRICING_RULES.signatureMultiplier;
    // Insurance fee is 2% of declared value
    if (parcel.declaredValue) {
      insuranceFee += Number(parcel.declaredValue) * 0.02;
    }
  }

  const baseFee = PRICING_RULES.baseFee;
  const weightFee = totalWeight * PRICING_RULES.weightPerKg;
  const priorityMultiplier = PRICING_RULES.priorityMultipliers[priority as keyof typeof PRICING_RULES.priorityMultipliers] || 1;
  const serviceMultiplier = PRICING_RULES.serviceTypeMultipliers[serviceType as keyof typeof PRICING_RULES.serviceTypeMultipliers] || 1;

  const subtotal = (baseFee + weightFee) * priorityMultiplier * serviceMultiplier * parcelModifiers;
  const taxAmount = subtotal * PRICING_RULES.taxRate;
  const totalPrice = Number((subtotal + insuranceFee + taxAmount).toFixed(2));

  return {
    totalPrice,
    breakdown: {
      baseFee,
      weightFee,
      totalWeight,
      priorityMultiplier,
      serviceMultiplier,
      parcelModifiers,
      insuranceFee,
      subtotal: Number(subtotal.toFixed(2)),
      taxRate: PRICING_RULES.taxRate,
      taxAmount: Number(taxAmount.toFixed(2)),
      total: totalPrice,
      currency: 'ETB'
    }
  };
};


/**
 * Generate a unique order number
 */
const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate a unique parcel number
 */
const generateParcelNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PCL-${timestamp}-${random}`;
};

/**
 * Estimate price for an order without creating it
 * This allows customers to preview the delivery cost before placing an order
 */
export const estimatePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priority, serviceType, parcels } = req.body;

    // Validate required fields
    if (!parcels || !Array.isArray(parcels) || parcels.length === 0) {
      res.status(400).json({ message: 'At least one parcel is required for price estimation' });
      return;
    }

    // Calculate price estimate
    const estimate = calculatePriceEstimate({
      priority: priority || 'STANDARD',
      serviceType: serviceType || 'DOOR_TO_DOOR',
      parcels: parcels.map((p: any) => ({
        weightKg: Number(p.weightKg) || 0,
        isFragile: p.isFragile || false,
        isPerishable: p.isPerishable || false,
        requiresSignature: p.requiresSignature || false,
        declaredValue: p.declaredValue ? Number(p.declaredValue) : undefined
      }))
    });

    res.json({
      estimatedPrice: estimate.totalPrice,
      breakdown: estimate.breakdown,
      pricingRules: {
        baseFee: PRICING_RULES.baseFee,
        weightPerKg: PRICING_RULES.weightPerKg,
        priorityOptions: PRICING_RULES.priorityMultipliers,
        serviceTypeOptions: PRICING_RULES.serviceTypeMultipliers
      }
    });
  } catch (error) {
    console.error('Estimate price error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

/**
 * Create a new order with addresses and parcels
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const {
      priority,
      serviceType,
      scheduledPickupTime,
      scheduledDeliveryTime,
      notes,
      addresses,
      parcels
    } = req.body;

    // Validate required fields
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      res.status(400).json({ message: 'At least one address is required' });
      return;
    }

    if (!parcels || !Array.isArray(parcels) || parcels.length === 0) {
      res.status(400).json({ message: 'At least one parcel is required' });
      return;
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Calculate price using the comprehensive pricing rules
    const priceEstimate = calculatePriceEstimate({
      priority,
      serviceType,
      parcels: parcels.map((p: any) => ({
        weightKg: Number(p.weightKg) || 0,
        isFragile: p.isFragile || false,
        isPerishable: p.isPerishable || false,
        requiresSignature: p.requiresSignature || false,
        declaredValue: p.declaredValue ? Number(p.declaredValue) : undefined
      }))
    });
    const calculatedPrice = priceEstimate.totalPrice;

    // Create order with nested relations
    const order = await (prisma as any).order.create({
      data: {
        orderNumber,
        customerId: userId!,
        priority: (priority as any) || 'STANDARD',
        serviceType: (serviceType as any) || 'DOOR_TO_DOOR',
        status: 'PENDING' as any,
        scheduledPickupTime: scheduledPickupTime ? new Date(scheduledPickupTime) : null,
        scheduledDeliveryTime: scheduledDeliveryTime ? new Date(scheduledDeliveryTime) : null,
        notes,
        addresses: {
          create: addresses.map((addr: any) => ({
            addressType: addr.addressType as any,
            contactName: addr.contactName,
            contactPhone: addr.contactPhone,
            contactEmail: addr.contactEmail,
            streetAddress: addr.streetAddress,
            subcity: addr.subcity,
            kebele: addr.kebele,
            woreda: addr.woreda,
            houseNumber: addr.houseNumber,
            landmark: addr.landmark,
            instructions: addr.instructions
          }))
        },
        parcels: {
          create: parcels.map((parcel: any) => ({
            parcelNumber: generateParcelNumber(),
            description: parcel.description,
            weightKg: parcel.weightKg,
            lengthCm: parcel.lengthCm,
            widthCm: parcel.widthCm,
            heightCm: parcel.heightCm,
            declaredValue: parcel.declaredValue,
            category: parcel.category,
            isFragile: parcel.isFragile || false,
            isPerishable: parcel.isPerishable || false,
            requiresSignature: parcel.requiresSignature || false,
            insuranceAmount: parcel.insuranceAmount,
            items: parcel.items ? {
              create: parcel.items.map((item: any) => ({
                sku: item.sku,
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unitValue: item.unitValue
              }))
            } : undefined
          }))
        },
        price: calculatedPrice,
        trackingEvents: {
          create: {
            eventType: 'ORDER_CREATED' as any,
            eventTimestamp: new Date(),
            notes: 'Order created by customer'
          }
        }
      },
      include: {
        addresses: true,
        parcels: {
          include: {
            items: true
          }
        },
        trackingEvents: true
      }
    });


    // Publish order.created event (include price so Payment Service can create payment)
    await orderProducer.publishOrderCreated({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      status: order.status,
      priority: order.priority,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      createdAt: order.createdAt,
      price: order.price
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

/**
 * Get all orders (admin view with filtering)
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, customerId, courierId, limit = '50', offset = '0' } = req.query;

    const userRole = (req as AuthRequest).user?.role;
    const authUserId = (req as AuthRequest).user?.userId;

    const where: any = {};
    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;
    if (customerId) where.customerId = customerId as string;
    if (courierId) where.courierId = courierId as string;

    // For couriers requesting the general orders list (no explicit filters),
    // show only CONFIRMED (paid) and unassigned orders OR orders assigned to the requesting courier.
    // IMPORTANT: Couriers should NOT see PENDING orders - only orders that have been paid.
    if (userRole === 'COURIER' && !status && !courierId && !customerId) {
      where.OR = [
        { status: 'CONFIRMED', courierId: null }, // Available orders (paid but unassigned)
        { courierId: authUserId } // Orders already assigned to this courier
      ];
    }

    // If a courier explicitly filters by status, still exclude unpaid orders
    if (userRole === 'COURIER' && status === 'PENDING') {
      // Couriers cannot see pending orders
      res.json({ orders: [], pagination: { total: 0, limit: parseInt(limit as string), offset: parseInt(offset as string) } });
      return;
    }

    const orders = await (prisma as any).order.findMany({
      where,
      include: {
        addresses: true,
        parcels: {
          include: {
            items: true
          }
        },
        trackingEvents: {
          orderBy: { eventTimestamp: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await (prisma as any).order.count({ where });

    res.json({
      orders,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get customer's own orders
 */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    const orders = await (prisma as any).order.findMany({
      where: { customerId: userId },
      include: {
        addresses: true,
        parcels: {
          include: {
            items: true
          }
        },
        trackingEvents: {
          orderBy: { eventTimestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get orders assigned to the authenticated courier
 */
export const getCourierOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const courierId = (req as AuthRequest).user?.userId;

    const orders = await (prisma as any).order.findMany({
      where: {
        courierId,
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'RETURNED'] as any
        }
      },
      include: {
        addresses: true,
        parcels: {
          include: {
            items: true
          }
        },
        trackingEvents: {
          orderBy: { eventTimestamp: 'desc' },
          take: 10
        },
        courierAssignments: {
          where: { status: 'ACTIVE' as any },
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { scheduledPickupTime: 'asc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get courier orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;
    const userRole = (req as AuthRequest).user?.role;

    const order = await (prisma as any).order.findUnique({
      where: { orderId: id },
      include: {
        addresses: true,
        parcels: {
          include: {
            items: true
          }
        },
        trackingEvents: {
          orderBy: { eventTimestamp: 'desc' }
        },
        courierAssignments: {
          orderBy: { assignedAt: 'desc' }
        },
        deliveryProofs: true,
        locationUpdates: {
          orderBy: { recordedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check authorization - customers can only see their own orders
    if (userRole === 'CUSTOMER' && order.customerId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Couriers can only see orders assigned to them
    if (userRole === 'COURIER' && order.courierId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Cancel an order (customer only when not paid or assigned)
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;
    const userRole = (req as AuthRequest).user?.role;

    const order = await (prisma as any).order.findUnique({ where: { orderId: id } });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Only the customer who created the order can cancel (or allow admins later)
    if (userRole === 'CUSTOMER' && order.customerId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Only allow cancellation if order is still pending and not assigned
    if (order.status !== 'PENDING' || order.courierId) {
      res.status(400).json({ message: 'Order cannot be cancelled: already paid, assigned, or not pending' });
      return;
    }

    const oldStatus = order.status;

    const updatedOrder = await (prisma as any).order.update({
      where: { orderId: id },
      data: {
        status: 'CANCELLED' as any,
        updatedAt: new Date()
      }
    });

    // Create tracking event
    await (prisma as any).trackingEvent.create({
      data: {
        orderId: id,
        eventType: 'CANCELLED' as any,
        eventTimestamp: new Date(),
        notes: 'Order cancelled by customer'
      }
    });

    // Publish status changed event
    await orderProducer.publishOrderStatusChanged({
      orderId: updatedOrder.orderId,
      orderNumber: updatedOrder.orderNumber,
      customerId: updatedOrder.customerId,
      oldStatus,
      newStatus: updatedOrder.status,
      courierId: updatedOrder.courierId
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update order status (courier only)
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const courierId = (req as AuthRequest).user?.userId;
    const { status, notes, latitude, longitude } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED_TO_COURIER', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    // Find the order
    const order = await (prisma as any).order.findUnique({
      where: { orderId: id }
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Verify courier is assigned to this order
    if (order.courierId !== courierId) {
      res.status(403).json({ message: 'You are not assigned to this order' });
      return;
    }

    const oldStatus = order.status;

    // Update order status
    const updatedOrder = await (prisma as any).order.update({
      where: { orderId: id },
      data: {
        status: status as any,
        actualDeliveryTime: status === 'DELIVERED' ? new Date() : order.actualDeliveryTime,
        updatedAt: new Date()
      },
      include: {
        addresses: true,
        parcels: true
      }
    });

    // Map status to tracking event type
    const eventTypeMap: Record<string, any> = {
      'PICKED_UP': 'PARCEL_PICKED_UP',
      'IN_TRANSIT': 'IN_TRANSIT',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'FAILED': 'FAILED',
      'RETURNED': 'RETURNED',
      'ASSIGNED_TO_COURIER': 'COURIER_ASSIGNED',
      'PENDING': 'ORDER_CREATED',
      'CONFIRMED': 'ORDER_CONFIRMED',
      'CANCELLED': 'CANCELLED'
    };

    const eventType = eventTypeMap[status as string];

    if (eventType) {
      // Create tracking event
      await (prisma as any).trackingEvent.create({
        data: {
          orderId: id,
          eventType,
          eventTimestamp: new Date(),
          locationText: notes,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          courierId,
          notes
        }
      });
    }

    // Publish status changed event
    await orderProducer.publishOrderStatusChanged({
      orderId: updatedOrder.orderId,
      orderNumber: updatedOrder.orderNumber,
      customerId: updatedOrder.customerId,
      oldStatus,
      newStatus: updatedOrder.status,
      courierId
    });

    // If delivered, publish order completed event
    if (status === 'DELIVERED') {
      await orderProducer.publishOrderCompleted({
        orderId: updatedOrder.orderId,
        orderNumber: updatedOrder.orderNumber,
        customerId: updatedOrder.customerId,
        courierId,
        actualDeliveryTime: updatedOrder.actualDeliveryTime
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Assign courier to an order
 */
export const assignCourier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { courierId, vehicleId } = req.body;

    if (!courierId) {
      res.status(400).json({ message: 'Courier ID is required' });
      return;
    }

    // Atomic update: only update if order exists AND is currently unassigned AND is confirmed
    // updateMany returns a count of modified rows.
    const result = await (prisma as any).order.updateMany({
      where: {
        orderId: id,
        courierId: null,      // critical race condition check
        status: 'CONFIRMED'   // ensures we don't assign unpaid orders
      },
      data: {
        courierId,
        vehicleId,
        status: 'ASSIGNED_TO_COURIER' as any,
        updatedAt: new Date()
      }
    });

    if (result.count === 0) {
      // The update failed. Determine why (for better error message)
      const existingOrder = await (prisma as any).order.findUnique({ where: { orderId: id } });
      
      if (!existingOrder) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }
      
      if (existingOrder.courierId) {
        res.status(409).json({ message: 'Order is already assigned to another courier' });
        return;
      }

      if (existingOrder.status !== 'CONFIRMED') {
         res.status(400).json({ message: 'Order is not in a confirmed state (must be paid)' });
         return;
      }

      res.status(400).json({ message: 'Unable to assign order due to state mismatch' });
      return;
    }

    // Create courier assignment record
    await (prisma as any).courierAssignment.create({
      data: {
        orderId: id,
        courierId,
        vehicleId,
        status: 'ACTIVE' as any
      }
    });

    // Create tracking event
    await (prisma as any).trackingEvent.create({
      data: {
        orderId: id,
        eventType: 'COURIER_ASSIGNED' as any,
        eventTimestamp: new Date(),
        courierId,
        notes: `Courier assigned to order`
      }
    });

    // Fetch the updated order to return it (updateMany doesn't return data)
    const updatedOrder = await (prisma as any).order.findUnique({
      where: { orderId: id },
      include: { addresses: true, parcels: true }
    });

    // Publish order assigned event
    await orderProducer.publishOrderAssigned({
      orderId: updatedOrder.orderId,
      orderNumber: updatedOrder.orderNumber,
      customerId: updatedOrder.customerId,
      courierId,
      vehicleId
    });

    // Publish status changed event
    await orderProducer.publishOrderStatusChanged({
      orderId: updatedOrder.orderId,
      orderNumber: updatedOrder.orderNumber,
      customerId: updatedOrder.customerId,
      oldStatus: 'CONFIRMED',
      newStatus: updatedOrder.status,
      courierId
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Assign courier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
