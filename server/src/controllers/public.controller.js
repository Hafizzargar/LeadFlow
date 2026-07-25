const Lead = require('../models/Lead');
const ApiResponse = require('../utils/apiResponse');
const { ACTIVITY_TYPES } = require('../utils/constants');

/**
 * @desc    Submit a lead via public capture form
 * @route   POST /api/public/leads
 * @access  Public
 */
const submitLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source } = req.body;

    // Prevent duplicate lead submission with same email
    const existingLead = await Lead.findOne({ email: email.toLowerCase() });
    if (existingLead) {
      return ApiResponse.badRequest(res, 'A lead with this email address has already been submitted.');
    }

    const lead = await Lead.create({
      name,
      email: email.toLowerCase(),
      phone,
      company,
      source: source || 'website',
      status: 'new',
      activityTrail: [
        {
          action: ACTIVITY_TYPES.LEAD_CREATED,
          description: 'Lead submitted via public capture form',
          metadata: { source: source || 'website', submittedAt: new Date() },
        },
      ],
    });

    ApiResponse.created(res, {
      message: 'Thank you! Your information has been submitted successfully.',
      leadId: lead._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitLead };
