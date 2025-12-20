
import * as amqp from 'amqplib';
import { Channel } from 'amqplib';

class RabbitMQService {
  private connection: any = null;
  private channel: Channel | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      console.log(`Connecting to RabbitMQ at ${url}...`);
      
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      this.isConnected = true;
      console.log('✅ Connected to RabbitMQ');

      // Setup exchanges
      const exchange = 'delivery_exchange';
      if (this.channel) {
          await this.channel.assertExchange(exchange, 'topic', { durable: true });
      }
      
      // Handle connection close
      this.connection?.on('close', () => {
        console.error('RabbitMQ connection closed. Reconnecting...');
        this.isConnected = false;
        setTimeout(() => this.connect(), 5000);
      });

      this.connection?.on('error', (err: any) => {
        console.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Retry in 5 seconds
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(routingKey: string, data: any): Promise<boolean> {
    if (!this.channel) {
      console.error('Cannot publish, RabbitMQ channel is null');
      return false;
    }

    const exchange = 'delivery_exchange';
    const content = Buffer.from(JSON.stringify(data));
    
    console.log(`📤 Publishing to ${routingKey}:`, data);
    return this.channel.publish(exchange, routingKey, content);
  }

  async subscribe(routingKey: string, queueName: string, callback: (data: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
       console.warn('Channel not available for subscription, retrying in 1s...');
       await new Promise(resolve => setTimeout(resolve, 1000));
       if (!this.channel) return;
    }

    const exchange = 'delivery_exchange';
    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, exchange, routingKey);

    console.log(`📥 Subscribed to ${routingKey} via queue ${queueName}`);

    this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel?.ack(msg);
        } catch (error) {
          console.error(`Error processing message from ${queueName}:`, error);
          this.channel?.ack(msg); 
        }
      }
    });
  }
}

export const rabbitMQ = new RabbitMQService();
