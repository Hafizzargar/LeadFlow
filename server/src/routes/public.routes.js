const express = require('express');
const router = express.Router();
const { submitLead } = require('../controllers/public.controller');
const { validateLead } = require('../middleware/validate');

// POST /api/public/leads - Submit lead via public form (no auth required)
router.post('/leads', validateLead, submitLead);

module.exports = router;
