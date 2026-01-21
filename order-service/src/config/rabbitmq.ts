
import * as amqp from 'amqplib';

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;
  private readonly exchange = 'delivery_exchange';

  async connect(): Promise<void> {
    if (this.isConnected && this.channel) return;

    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
    console.log(`🔌 Connecting to RabbitMQ at ${url}...`);

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
      console.error(`❌ Cannot publish to ${routingKey}: RabbitMQ channel not initialized!`);
      this.connect().catch(() => { });
      return false;
    }

    try {
      const content = Buffer.from(JSON.stringify(data));
      console.log(`📤 Publishing to "${routingKey}":`, JSON.stringify(data).substring(0, 100));
      return this.channel.publish(this.exchange, routingKey, content, { persistent: true });
    } catch (error) {
      console.error(`❌ Error publishing to ${routingKey}:`, error);
      return false;
    }
  }

  async subscribe(routingKey: string, queueName: string, callback: (data: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      console.error(`❌ Cannot subscribe to ${routingKey}: RabbitMQ channel not initialized!`);
      return;
    }

    try {
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.bindQueue(queueName, this.exchange, routingKey);

      console.log(`📥 Subscribed to "${routingKey}" via queue "${queueName}"`);

      this.channel.consume(queueName, async (msg: any) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📨 Received message on ${routingKey}`);
          await callback(content);
          this.channel?.ack(msg);
        } catch (err) {
          console.error(`❌ Error processing message from ${queueName}:`, err);
          this.channel?.nack(msg, false, false);
        }
      });
    } catch (error) {
      console.error(`❌ Error subscribing to ${routingKey}:`, error);
    }
  }
}

export const rabbitMQ = new RabbitMQService();
