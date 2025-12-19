
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rabbitMQ } from './config/rabbitmq';
import { startOrderConsumer } from './events/consumers/order.consumer';
import paymentRoutes from './routes/payment.routes';
import chappaRoutes from './routes/chappa.routes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


// Routes
app.use('/api/payments', paymentRoutes);
app.use("/api/chapa", chappaRoutes);



app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    service: 'payment-service',
    uptime: process.uptime()
  });
});

app.listen(PORT, async () => {
  console.log(`\n🚀 Payment Service running on http://localhost:${PORT}`);
  
  // Connect to RabbitMQ and start consumers
  await rabbitMQ.connect();
  await startOrderConsumer();
});
