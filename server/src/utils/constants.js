const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const LEAD_SOURCES = ['website', 'referral', 'social', 'cold_call', 'email', 'other'];

const USER_ROLES = ['admin', 'member'];

const ACTIVITY_TYPES = {
  LEAD_CREATED: 'lead_created',
  STATUS_CHANGED: 'status_changed',
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  NOTE_ADDED: 'note_added',
  LEAD_UPDATED: 'lead_updated',
  LEAD_DELETED: 'lead_deleted',
};

module.exports = {
  LEAD_STATUSES,
  LEAD_SOURCES,
  USER_ROLES,
  ACTIVITY_TYPES,
};
