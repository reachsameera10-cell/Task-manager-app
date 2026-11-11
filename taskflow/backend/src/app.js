import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { prisma } from './db/prisma.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      message: 'TaskFlow backend and database are ready.',
    });
  } catch (error) {
    console.error('Health check database error:', error);
    return res.status(503).json({
      status: 'error',
      database: 'unavailable',
      message: 'PostgreSQL is unavailable. Check backend/.env and ensure the database is running.',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

export default app;
