import prisma from '../../config/database';
import { rabbitMQ } from '../../config/rabbitmq';

const MAX_RETRIES = 10;
const RETRY_DELAY = 3000;

export const startOrderConsumer = async (retryCount = 0): Promise<void> => {
  console.log(`🔥 Payment order consumer starting... (attempt ${retryCount + 1}/${MAX_RETRIES})`);

  try {
    // Ensure RabbitMQ connection is established
    await rabbitMQ.connect();

    // Wait a bit for the channel to be fully ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    const queueName = 'payment_service_order_created';
    const routingKey = 'order.created';

    const subscribed = await rabbitMQ.subscribe(routingKey, queueName, async (data: any) => {
      console.log(`📦 Received order.created event:`, JSON.stringify(data, null, 2));

      if (!data.orderId || !data.customerId) {
        console.error('❌ Invalid event data: missing orderId or customerId', data);
        return;
      }

      try {
        // Check if payment already exists
        const existing = await prisma.payment.findFirst({
          where: { order_id: data.orderId }
        });

        if (existing) {
          console.log(`⚠️ Payment already exists for order ${data.orderId}: ${existing.payment_id}`);
          return;
        }

        // Create new payment record using price from order.created event when available
        const payment = await prisma.payment.create({
          data: {
            order_id: data.orderId,
            customer_id: data.customerId,
            amount: data.price ?? 0,
            payment_method: 'MOBILE_MONEY',
            status: 'PENDING',
            currency_code: data.currency || 'ETB'
          }
        });

        console.log(`💳 Created payment record ${payment.payment_id} for order ${data.orderId}`);
      } catch (dbError) {
        console.error(`❌ Database error creating payment for order ${data.orderId}:`, dbError);
        throw dbError; // Re-throw to potentially trigger retry/nack
      }
    });

    if (subscribed) {
      console.log(`✅ Consumer successfully subscribed to '${routingKey}' on queue '${queueName}'`);
    } else {
      throw new Error('Subscribe returned false - channel may not be ready');
    }
  } catch (error) {
    console.error(`❌ Failed to start order consumer (attempt ${retryCount + 1}):`, error);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return startOrderConsumer(retryCount + 1);
    } else {
      console.error('❌ Max retries reached for order consumer. Payment events may not be processed!');
    }
  }
};
