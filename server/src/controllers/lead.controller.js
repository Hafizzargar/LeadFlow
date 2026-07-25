const Lead = require('../models/Lead');
const ApiResponse = require('../utils/apiResponse');
const { ACTIVITY_TYPES } = require('../utils/constants');

/**
 * @desc    Get all leads (paginated, filterable)
 * @route   GET /api/leads
 * @access  Private (admin sees all, member sees only assigned)
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      assignedTo,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    // Build filter
    const filter = {};

    // Members can only see leads assigned to them
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email role')
        .populate('notes.addedBy', 'name email')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    ApiResponse.success(res, leads, 200, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single lead
 * @route   GET /api/leads/:id
 * @access  Private
 */
const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('notes.addedBy', 'name email')
      .populate('activityTrail.performedBy', 'name email');

    if (!lead) {
      return ApiResponse.notFound(res, 'Lead not found.');
    }

    // Members can only view leads assigned to them
    if (
      req.user.role === 'member' &&
      (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return ApiResponse.forbidden(res, 'You can only view leads assigned to you.');
    }

    ApiResponse.success(res, lead);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new lead (admin only, from dashboard)
 * @route   POST /api/leads
 * @access  Private (Admin)
 */
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source, status, assignedTo } = req.body;

    // Check for duplicate email
    const existingLead = await Lead.findOne({ email: email.toLowerCase() });
    if (existingLead) {
      return ApiResponse.badRequest(res, 'A lead with this email address already exists.');
    }

    const lead = await Lead.create({
      name,
      email: email.toLowerCase(),
      phone,
      company,
      source,
      status: status || 'new',
      assignedTo: assignedTo || null,
      activityTrail: [
        {
          action: ACTIVITY_TYPES.LEAD_CREATED,
          description: `Lead created by ${req.user.name}`,
          performedBy: req.user._id,
          metadata: { source: source || 'website' },
        },
      ],
    });

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email role')
      .populate('activityTrail.performedBy', 'name email');

    ApiResponse.created(res, populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lead
 * @route   PUT /api/leads/:id
 * @access  Private (Admin: any lead, Member: only assigned leads)
 */
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return ApiResponse.notFound(res, 'Lead not found.');
    }

    // Members can only update leads assigned to them
    if (
      req.user.role === 'member' &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return ApiResponse.forbidden(res, 'You can only update leads assigned to you.');
    }

    const { name, email, phone, company, source, status } = req.body;

    // Track status change in activity trail
    if (status && status !== lead.status) {
      lead.activityTrail.push({
        action: ACTIVITY_TYPES.STATUS_CHANGED,
        description: `Status changed from "${lead.status}" to "${status}" by ${req.user.name}`,
        performedBy: req.user._id,
        metadata: { from: lead.status, to: status },
      });
    }

    // Track other updates
    const updates = {};
    if (name && name !== lead.name) updates.name = name;
    if (email && email !== lead.email) updates.email = email;
    if (phone !== undefined && phone !== lead.phone) updates.phone = phone;
    if (company !== undefined && company !== lead.company) updates.company = company;
    if (source && source !== lead.source) updates.source = source;

    if (Object.keys(updates).length > 0) {
      lead.activityTrail.push({
        action: ACTIVITY_TYPES.LEAD_UPDATED,
        description: `Lead details updated by ${req.user.name}`,
        performedBy: req.user._id,
        metadata: { fields: Object.keys(updates) },
      });
    }

    // Apply updates
    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (source) lead.source = source;
    if (status) lead.status = status;

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email role')
      .populate('notes.addedBy', 'name email')
      .populate('activityTrail.performedBy', 'name email');

    ApiResponse.success(res, populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a lead to a user
 * @route   PATCH /api/leads/:id/assign
 * @access  Private (Admin only)
 */
const assignLead = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return ApiResponse.notFound(res, 'Lead not found.');
    }

    const User = require('../models/User');
    let assignedUser = null;

    if (userId) {
      assignedUser = await User.findById(userId);
      if (!assignedUser) {
        return ApiResponse.notFound(res, 'User not found.');
      }
    }

    // Track activity
    if (userId) {
      lead.activityTrail.push({
        action: ACTIVITY_TYPES.ASSIGNED,
        description: `Lead assigned to ${assignedUser.name} by ${req.user.name}`,
        performedBy: req.user._id,
        metadata: { assignedTo: userId, assignedToName: assignedUser.name },
      });
    } else {
      lead.activityTrail.push({
        action: ACTIVITY_TYPES.UNASSIGNED,
        description: `Lead unassigned by ${req.user.name}`,
        performedBy: req.user._id,
      });
    }

    lead.assignedTo = userId || null;
    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email role')
      .populate('notes.addedBy', 'name email')
      .populate('activityTrail.performedBy', 'name email');

    ApiResponse.success(res, populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a note to a lead
 * @route   POST /api/leads/:id/notes
 * @access  Private (Admin: any lead, Member: only assigned leads)
 */
const addNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return ApiResponse.notFound(res, 'Lead not found.');
    }

    // Members can only add notes to leads assigned to them
    if (
      req.user.role === 'member' &&
      (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())
    ) {
      return ApiResponse.forbidden(res, 'You can only add notes to leads assigned to you.');
    }

    const { content } = req.body;

    lead.notes.push({
      content,
      addedBy: req.user._id,
    });

    lead.activityTrail.push({
      action: ACTIVITY_TYPES.NOTE_ADDED,
      description: `Note added by ${req.user.name}`,
      performedBy: req.user._id,
    });

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email role')
      .populate('notes.addedBy', 'name email')
      .populate('activityTrail.performedBy', 'name email');

    ApiResponse.success(res, populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lead
 * @route   DELETE /api/leads/:id
 * @access  Private (Admin only)
 */
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return ApiResponse.notFound(res, 'Lead not found.');
    }

    await Lead.findByIdAndDelete(req.params.id);

    ApiResponse.success(res, { message: 'Lead deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  assignLead,
  addNote,
  deleteLead,
};
