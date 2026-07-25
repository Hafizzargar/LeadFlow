const ApiResponse = require('../utils/apiResponse');

/**
 * Role-based access control middleware.
 * Usage: roleGuard('admin') or roleGuard('admin', 'member')
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`
      );
    }

    next();
  };
};

module.exports = roleGuard;
