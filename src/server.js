import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { initSchedulers } from './services/scheduler.service.js';

const PORT = process.env.PORT || 5000;

connectDB();

// Initialize cron schedulers
initSchedulers();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
