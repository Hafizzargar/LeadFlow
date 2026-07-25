const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  assignLead,
  addNote,
  deleteLead,
} = require('../controllers/lead.controller');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validateLead, validateNote } = require('../middleware/validate');

// All lead routes require authentication
router.use(auth);

// GET /api/leads - List leads (admin: all, member: assigned only)
router.get('/', getLeads);

// GET /api/leads/:id - Get single lead
router.get('/:id', getLead);

// POST /api/leads - Create lead (admin only)
router.post('/', roleGuard('admin'), validateLead, createLead);

// PUT /api/leads/:id - Update lead (admin: any, member: assigned only)
router.put('/:id', updateLead);

// PATCH /api/leads/:id/assign - Assign lead (admin only)
router.patch('/:id/assign', roleGuard('admin'), assignLead);

// POST /api/leads/:id/notes - Add note (admin: any, member: assigned only)
router.post('/:id/notes', validateNote, addNote);

// DELETE /api/leads/:id - Delete lead (admin only)
router.delete('/:id', roleGuard('admin'), deleteLead);

module.exports = router;
