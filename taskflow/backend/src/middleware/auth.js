import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';

export const protect = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const token = tokenFromCookie || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

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
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
