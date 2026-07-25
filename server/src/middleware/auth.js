const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const auth = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return ApiResponse.unauthorized(res, 'Token is valid but user no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token has expired.');
    }
    return ApiResponse.error(res, 'Authentication error.');
  }
};

module.exports = auth;
