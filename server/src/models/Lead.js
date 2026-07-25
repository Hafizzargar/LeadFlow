const mongoose = require('mongoose');
const { LEAD_STATUSES, LEAD_SOURCES, ACTIVITY_TYPES } = require('../utils/constants');

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [2000, 'Note cannot exceed 2000 characters'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_TYPES),
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      default: 'website',
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'new',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [noteSchema],
    activityTrail: [activitySchema],
  },
  {
    timestamps: true,
  }
);

// Index for common queries
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
