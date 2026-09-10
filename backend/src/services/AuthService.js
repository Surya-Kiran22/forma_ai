import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/UserRepository.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';

export class AuthService {
  async register({ email, password, name, role = 'user' }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('User with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      email,
      passwordHash,
      name,
      role,
    });

    const tokens = this.generateTokens(user);
    await userRepository.addRefreshToken(user._id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const tokens = this.generateTokens(user);
    await userRepository.addRefreshToken(user._id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const user = await userRepository.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedError('User no longer exists');
      }

      const hasToken = await userRepository.hasRefreshToken(user._id, refreshToken);
      if (!hasToken) {
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      // Rotate refresh token
      await userRepository.removeRefreshToken(user._id, refreshToken);
      const newTokens = this.generateTokens(user);
      await userRepository.addRefreshToken(user._id, newTokens.refreshToken);

      return {
        tokens: newTokens,
      };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId, refreshToken) {
    if (refreshToken) {
      await userRepository.removeRefreshToken(userId, refreshToken);
    }
    return { success: true };
  }

  generateTokens(user) {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRATION,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRATION,
    });

    return { accessToken, refreshToken };
  }

  sanitizeUser(user) {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.passwordHash;
    delete obj.refreshTokens;
    delete obj.__v;
    return obj;
  }
}

export const authService = new AuthService();
