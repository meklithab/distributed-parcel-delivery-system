import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

// Service URLs from environment variables
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-app:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-app:3002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-app:3003';

// Proxy configuration
const proxyOptions = {
    changeOrigin: true,
    logLevel: 'debug' as const,
    onError: (err: any, req: any, res: any) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    }
};

// Route Definitions
// User Service Routes
app.use('/api/auth', createProxyMiddleware({ ...proxyOptions, target: USER_SERVICE_URL }));
app.use('/api/users', createProxyMiddleware({ ...proxyOptions, target: USER_SERVICE_URL }));
app.use('/api/customers', createProxyMiddleware({ ...proxyOptions, target: USER_SERVICE_URL }));
app.use('/api/couriers', createProxyMiddleware({ ...proxyOptions, target: USER_SERVICE_URL }));

// Order Service Routes
app.use('/api/orders', createProxyMiddleware({ ...proxyOptions, target: ORDER_SERVICE_URL }));

// Payment Service Routes
app.use('/api/payments', createProxyMiddleware({ ...proxyOptions, target: PAYMENT_SERVICE_URL }));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log(`🔗 User Service: ${USER_SERVICE_URL}`);
    console.log(`🔗 Order Service: ${ORDER_SERVICE_URL}`);
    console.log(`🔗 Payment Service: ${PAYMENT_SERVICE_URL}`);
});
