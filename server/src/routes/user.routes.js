const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser } = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validateUser } = require('../middleware/validate');

// All user routes require admin authentication
router.use(auth, roleGuard('admin'));

// GET /api/users - List all users
router.get('/', getUsers);

// POST /api/users - Create user
router.post('/', validateUser, createUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;
