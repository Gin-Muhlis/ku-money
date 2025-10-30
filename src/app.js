import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import packageRoutes from './routes/package.routes.js';

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);

export default app;
