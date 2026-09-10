import { User } from '../models/User.js';

export class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findById(id) {
    return User.findById(id);
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async addRefreshToken(userId, token) {
    return User.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: token } },
      { new: true }
    );
  }

  async removeRefreshToken(userId, token) {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: token } },
      { new: true }
    );
  }

  async hasRefreshToken(userId, token) {
    const user = await User.findOne({ _id: userId, refreshTokens: token });
    return Boolean(user);
  }
}

export const userRepository = new UserRepository();
