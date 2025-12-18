
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rabbitMQ } from './config/rabbitmq';
import orderRoutes from './routes/order.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    service: 'order-service',
    uptime: process.uptime()
  });
});

app.listen(PORT, async () => {
  console.log(`\n🚀 Order Service running on http://localhost:${PORT}`);
  await rabbitMQ.connect();
});
