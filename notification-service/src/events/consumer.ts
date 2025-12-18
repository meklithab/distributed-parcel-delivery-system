
import { rabbitMQ } from '../config/rabbitmq';
import { sendEmail, sendSMS } from '../services/email.service';

export const startNotificationConsumer = async () => {
    
    // 1. Listen for Package Created (Order Service)
    await rabbitMQ.subscribe('package.created', 'notification_service_package_created', async (data: any) => {
        console.log(`\n🔔 Received Event: package.created`);
        // Mock sending confirmation email
        sendEmail(
            `user_${data.userId}@test.com`,
            'Order Confirmation',
            `Your order ${data.orderId} has been created successfully! Price: ${data.price} ETB`
        );
    });

    // 2. Listen for Payment Completed (Payment Service)
    await rabbitMQ.subscribe('payment.completed', 'notification_service_payment_completed', async (data: any) => {
        console.log(`\n🔔 Received Event: payment.completed`);
        sendEmail(
            `user_order_${data.orderId}@test.com`,
            'Payment Receipt',
            `Payment of ${data.amount} ETB received! Transaction ID: ${data.transactionId}`
        );
        sendSMS(
            '+251911...',
            `Payment received for Order ${data.orderId}. Driver is on the way!`
        );
    });

    console.log('👂 Notification Service listening for events...');
};
