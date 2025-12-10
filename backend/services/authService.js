import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication service
 */
class AuthService {
    /**
     * Hash password
     * @param {string} password - Plain password
     * @returns {Promise<string>} Hashed password
     */
    static async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compare password with hash
     * @param {string} password - Plain password
     * @param {string} hashedPassword - Hashed password
     * @returns {Promise<boolean>} Password match
     */
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * Generate JWT token
     * @param {object} payload - Token payload
     * @returns {string} JWT token
     */
    static generateToken(payload) {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        
        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {object} Decoded payload
     */
    static verifyToken(token) {
        const secret = process.env.JWT_SECRET;
        return jwt.verify(token, secret);
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<object|null>} User document
     */
    static async findUserByEmail(email) {
        return await User.findOne({ email }).populate('socialLinks');
    }

    /**
     * Find user by ID
     * @param {string} userId - User ID
     * @returns {Promise<object|null>} User document
     */
    static async findUserById(userId) {
        return await User.findById(userId).populate('socialLinks templateSelected');
    }

    /**
     * Create new user
     * @param {object} userData - User data
     * @returns {Promise<object>} Created user
     */
    static async createUser(userData) {
        const hashedPassword = await this.hashPassword(userData.password);
        
        const user = new User({
            ...userData,
            password: hashedPassword
        });
        
        return await user.save();
    }
}

export default AuthService;
