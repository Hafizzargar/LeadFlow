const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    ApiResponse.success(res, users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Private (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.badRequest(res, 'A user with this email already exists.');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
    });

    ApiResponse.created(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return ApiResponse.notFound(res, 'User not found.');
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return ApiResponse.badRequest(res, 'You cannot delete your own account.');
    }

    await User.findByIdAndDelete(req.params.id);

    ApiResponse.success(res, { message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, deleteUser };
