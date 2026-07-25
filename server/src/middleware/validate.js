const { LEAD_STATUSES, LEAD_SOURCES } = require('../utils/constants');
const ApiResponse = require('../utils/apiResponse');

/**
 * Validates lead input data.
 */
const validateLead = (req, res, next) => {
  const { name, email } = req.body;

  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Name is required');
  }

  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email');
  }

  if (req.body.status && !LEAD_STATUSES.includes(req.body.status)) {
    errors.push(`Status must be one of: ${LEAD_STATUSES.join(', ')}`);
  }

  if (req.body.source && !LEAD_SOURCES.includes(req.body.source)) {
    errors.push(`Source must be one of: ${LEAD_SOURCES.join(', ')}`);
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join(', '));
  }

  next();
};

/**
 * Validates note input data.
 */
const validateNote = (req, res, next) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return ApiResponse.badRequest(res, 'Note content is required');
  }

  if (content.length > 2000) {
    return ApiResponse.badRequest(res, 'Note cannot exceed 2000 characters');
  }

  next();
};

/**
 * Validates login input data.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join(', '));
  }

  next();
};

/**
 * Validates user creation input data.
 */
const validateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Name is required');
  }

  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (role && !['admin', 'member'].includes(role)) {
    errors.push('Role must be admin or member');
  }

  if (errors.length > 0) {
    return ApiResponse.badRequest(res, errors.join(', '));
  }

  next();
};

module.exports = { validateLead, validateNote, validateLogin, validateUser };
