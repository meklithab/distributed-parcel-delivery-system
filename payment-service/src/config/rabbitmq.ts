
import * as amqp from 'amqplib';

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;
  private readonly exchange = 'delivery_exchange';

  async connect(): Promise<void> {
    if (this.isConnected && this.channel) return;

    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
    console.log(`🔌 Attempting to connect to RabbitMQ URL: "${url}"`);

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      this.isConnected = true;
      console.log('✅ Connected to RabbitMQ');

      this.connection.on('error', (err: any) => {
        console.error('❌ RabbitMQ connection error:', err);
        this.isConnected = false;
        this.channel = null;
      });

      this.connection.on('close', () => {
        console.warn('⚠️ RabbitMQ connection closed');
        this.isConnected = false;
        this.channel = null;
      });

    } catch (error: any) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
      this.isConnected = false;
      this.channel = null;
      throw error;
    }
  }

  async publish(routingKey: string, data: any): Promise<boolean> {
    if (!this.channel) {
      console.warn(`⚠️ Channel not initialized for ${routingKey}, attempting to connect...`);
      try {
        await this.connect();
      } catch (err) {
        console.error('Failed to reconnect for publish:', err);
      }
      
      if (!this.channel) {
        console.error(`❌ Cannot publish to ${routingKey}: RabbitMQ channel unavailable`);
        throw new Error('RabbitMQ channel unavailable');
      }
    }

    try {
      const content = Buffer.from(JSON.stringify(data));
      console.log(`📤 Publishing to "${routingKey}":`, JSON.stringify(data).substring(0, 100));
      return this.channel.publish(this.exchange, routingKey, content, { persistent: true });
    } catch (error) {
      console.error(`❌ Error publishing to ${routingKey}:`, error);
      throw error;
    }
  }

  async subscribe(routingKey: string, queueName: string, callback: (data: any) => Promise<void>): Promise<boolean> {
    if (!this.channel) {
      console.error(`❌ Cannot subscribe to ${routingKey}: RabbitMQ channel not initialized!`);
      return false;
    }

    try {
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queueName, this.exchange, routingKey);

      console.log(`📥 Subscribed to "${routingKey}" via queue "${queueName}"`);

      await this.channel.consume(queueName, async (msg: any) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`📨 Received message on ${routingKey}`);
            await callback(content);
            this.channel?.ack(msg);
          } catch (error) {
            console.error(`❌ Error processing message from ${queueName}:`, error);
            this.channel?.nack(msg, false, false);
          }
        }
      });

      return true;
    } catch (error) {
      console.error(`❌ Error subscribing to ${routingKey}:`, error);
      return false;
    }
  }
}

export const rabbitMQ = new RabbitMQService();
