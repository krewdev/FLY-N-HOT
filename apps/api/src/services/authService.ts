import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import { env } from '../config/env.js';

interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export class AuthService {
  private static readonly TOKEN_EXPIRY = '24h';
  private static readonly SALT_ROUNDS = 10;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: this.TOKEN_EXPIRY
    });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}