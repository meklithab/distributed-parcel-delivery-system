
import bcrypt from 'bcrypt';
import { rabbitMQ } from './config/rabbitmq';

async function test() {
    console.log('Testing bcrypt...');
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);
        console.log('bcrypt hash successful:', hash);
        const match = await bcrypt.compare('password123', hash);
        console.log('bcrypt compare successful:', match);
    } catch (err) {
        console.error('bcrypt test failed:', err);
    }

    console.log('Testing RabbitMQ...');
    try {
        await rabbitMQ.connect();
        console.log('RabbitMQ connection test successful');
    } catch (err) {
        console.error('RabbitMQ connection test failed:', err);
    }

    process.exit(0);
}

test();
