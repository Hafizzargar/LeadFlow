const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns consistent JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.badRequest(res, messages.join(', '));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.badRequest(res, `A record with this ${field} already exists.`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.badRequest(res, `Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token.');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token has expired.');
  }

  // Default server error
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  );
};

module.exports = errorHandler;
