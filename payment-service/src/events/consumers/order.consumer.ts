
import prisma from '../../config/database';
import { rabbitMQ } from '../../config/rabbitmq';

export const startOrderConsumer = async () => {
    // Listen for 'package.created' events
    await rabbitMQ.subscribe('package.created', 'payment_service_package_created', async (data: any) => {
        console.log('📦 Received package.created event:', data.orderId);

        try {
            // Check if payment already exists
            const existing = await prisma.payment.findUnique({
                where: { order_id: data.orderId }
            });

            if (existing) {
                console.log('Payment record already exists for order:', data.orderId);
                return;
            }

            // Create Pending Payment
            const payment = await prisma.payment.create({
                data: {
                    order_id: data.orderId,
                    user_id: data.userId,
                    amount: data.price,
                    status: 'PENDING'
                }
            });

            console.log('💳 Created Pending Payment:', payment.id);

        } catch (error) {
            console.error('Error processing package.created:', error);
        }
    });
};
