import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';

export const protect = async (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const token = tokenFromCookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Authentication lookup error:', error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return res.status(503).json({
        message: 'Database unavailable. Check the backend DATABASE_URL and PostgreSQL connectivity.',
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return res.status(503).json({
        message: 'Database schema is not initialized. Run the Prisma migration before authenticating.',
      });
    }

    return res.status(500).json({ message: 'Unable to verify the authenticated user.' });
  }
};
