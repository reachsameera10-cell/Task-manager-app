import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { loginSchema, registerSchema } from '../utils/validation.js';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateToken = (userId) =>
  jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

const setAuthCookie = (res, userId) => {
  const token = generateToken(userId);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return token;
};

const sendDatabaseError = (error, res) => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      message: 'Database unavailable. Start PostgreSQL and check DATABASE_URL in backend/.env.',
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
    return res.status(503).json({
      message: 'Database schema is not initialized. Run the Prisma migration command from the setup guide.',
    });
  }

  return null;
};

export const registerUser = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? 'Validation failed.',
      });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    setAuthCookie(res, user.id);

    return res.status(201).json({
      message: 'Account created successfully.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    const databaseResponse = sendDatabaseError(error, res);
    if (databaseResponse) return databaseResponse;
    return res.status(500).json({ message: 'Failed to register account.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? 'Validation failed.',
      });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    setAuthCookie(res, user.id);

    return res.status(200).json({
      message: 'Login successful.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    const databaseResponse = sendDatabaseError(error, res);
    if (databaseResponse) return databaseResponse;
    return res.status(500).json({ message: 'Login failed.' });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });

  return res.status(200).json({ message: 'Logged out successfully.' });
};

export const getCurrentUser = (req, res) => {
  return res.status(200).json({ user: req.user });
};
