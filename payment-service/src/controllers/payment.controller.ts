
import { Request, Response } from 'express';
import prisma from '../config/database';
import { rabbitMQ } from '../config/rabbitmq';

export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount } = req.body;
    // In a real app, we would verify the user from the token matches the payment logic

    const payment = await prisma.payment.findUnique({ where: { order_id: orderId } });

    if (!payment) {
        res.status(404).json({ message: 'Payment record not found' });
        return;
    }

    if (payment.status === 'COMPLETED') {
        res.status(400).json({ message: 'Payment already completed' });
        return;
    }

    if (amount !== payment.amount) {
         res.status(400).json({ message: 'Incorrect amount' });
         return;
    }

    // Mock successful transaction
    const transactionId = `TXN-${Date.now()}`;

    const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: 'COMPLETED',
            transaction_id: transactionId
        }
    });

    // Publish Payment Completed Event
    await rabbitMQ.publish('payment.completed', {
        paymentId: updatedPayment.id,
        orderId: payment.order_id,
        transactionId
    });

    res.json(updatedPayment);

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const payment = await prisma.payment.findUnique({ where: { order_id: orderId } });
        
        if (!payment) {
             res.status(404).json({ message: 'Payment not found' });
             return;
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
