const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Login user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid email or password.');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.unauthorized(res, 'Invalid email or password.');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Return user data (password excluded via toJSON)
    ApiResponse.success(res, {
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
