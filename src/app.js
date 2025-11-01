import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import packageRoutes from './routes/package.routes.js';
import orderRoutes from './routes/order.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import categoryRoutes from './routes/category.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import { generalRateLimiter } from './middlewares/rateLimit.middleware.js';
import dotenv from "dotenv";
dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Apply general rate limiting to all API routes
app.use('/api', generalRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

export default app;
