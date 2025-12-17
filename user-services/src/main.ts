import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import AuthRoutes from './interfaces/routes/AuthRoutes';
import UserRoutes from './interfaces/routes/UserRoutes';
import CourierRoutes from './interfaces/routes/CourierRoutes';
import { config } from './config/env';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = config.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        message: 'User Management Service is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/auth', AuthRoutes);
app.use('/users', UserRoutes);
app.use('/couriers', CourierRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: config.nodeEnv === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`User Management Service listening on port ${PORT}`);
});
