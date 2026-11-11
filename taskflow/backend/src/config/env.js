import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  JWT_SECRET: process.env.JWT_SECRET ?? 'taskflow-dev-secret-change-me',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/taskflow?schema=public',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};
