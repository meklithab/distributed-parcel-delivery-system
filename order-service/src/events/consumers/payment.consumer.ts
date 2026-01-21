//C:\Users\HP\Documents\5(1ST SEMESTER)\ds\u\distributed-parcel-delivery-system\distributed-parcel-delivery-system\order-service\src\events\consumers\payment.consumer.ts
import { rabbitMQ } from '../../config/rabbitmq';
import prisma from '../../config/database';
import { orderProducer } from '../producers/order.producer';

export const startPaymentConsumer = async (): Promise<void> => {
    try {
        // payment.completed
        await rabbitMQ.subscribe(
            'payment.completed',
            'order_service_payment_queue',
            async (data: any) => {
                console.log('📥 Received payment.completed event:', data);

                try {
                    const { orderId, paymentId, transactionId } = data;

                    if (!orderId) {
                        console.error('Missing orderId in payment.completed event', data);
                        return;
                    }

                    const order = await (prisma as any).order.findUnique({ where: { orderId } });
                    if (!order) {
                        console.error(`Order ${orderId} not found`, data);
                        return;
                    }

                    if (order.status === 'CONFIRMED') {
                        console.log(`ℹ️ Order ${orderId} already CONFIRMED, skipping update.`);
                        return;
                    }

                    const oldStatus = order.status;
                    const updatedOrder = await (prisma as any).order.update({
                        where: { orderId },
                        data: { status: 'CONFIRMED' as any, updatedAt: new Date() }
                    });

                    await (prisma as any).trackingEvent.create({
                        data: {
                            orderId,
                            eventType: 'ORDER_CONFIRMED' as any,
                            eventTimestamp: new Date(),
                            notes: `Payment confirmed. Transaction ID: ${transactionId}`
                        }
                    });

                    await orderProducer.publishOrderStatusChanged({
                        orderId: updatedOrder.orderId,
                        orderNumber: updatedOrder.orderNumber,
                        customerId: updatedOrder.customerId,
                        oldStatus,
                        newStatus: updatedOrder.status,
                        courierId: undefined
                    });

                    console.log(`✅ Order ${updatedOrder.orderNumber} confirmed after payment`);
                } catch (error) {
                    console.error('Error processing payment.completed event:', error, data);
                }
            }
        );

        // payment.failed
        await rabbitMQ.subscribe(
            'payment.failed',
            'order_service_payment_failed_queue',
            async (data: any) => {
                console.log('📥 Received payment.failed event:', data);

                try {
                    const { orderId, reason } = data;

                    if (!orderId) {
                        console.error('Missing orderId in payment.failed event', data);
                        return;
                    }

                    const order = await (prisma as any).order.findUnique({ where: { orderId } });
                    if (!order) {
                        console.error(`Order ${orderId} not found`, data);
                        return;
                    }

                    const oldStatus = order.status;
                    const updatedOrder = await (prisma as any).order.update({
                        where: { orderId },
                        data: { status: 'FAILED' as any, updatedAt: new Date() }
                    });

                    await (prisma as any).trackingEvent.create({
                        data: {
                            orderId,
                            eventType: 'FAILED' as any,
                            eventTimestamp: new Date(),
                            notes: `Payment failed: ${reason || 'Unknown reason'}`
                        }
                    });

                    await orderProducer.publishOrderStatusChanged({
                        orderId: updatedOrder.orderId,
                        orderNumber: updatedOrder.orderNumber,
                        customerId: updatedOrder.customerId,
                        oldStatus,
                        newStatus: updatedOrder.status,
                        courierId: undefined
                    });

                    console.log(`❌ Order ${updatedOrder.orderNumber} marked as failed due to payment failure`);
                } catch (error) {
                    console.error('Error processing payment.failed event:', error, data);
                }
            }
        );

        console.log('✅ Payment consumers initialized');
    } catch (error) {
        console.error('Failed to start payment consumer:', error);
    }
};