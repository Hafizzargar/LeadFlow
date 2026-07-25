import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiEdit, FiUserPlus, FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import Badge from '../components/Common/Badge';

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchLead();
    if (isAdmin) fetchUsers();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await api.get(`/leads/${id}`);
      setLead(res.data.data);
    } catch (error) {
      console.error('Failed to fetch lead:', error);
      toast.error('Unable to view lead details');
      if (error.response?.status === 403 || error.response?.status === 404) {
        navigate('/dashboard/leads');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchLead();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmittingNote(true);
    try {
      await api.post(`/leads/${id}/notes`, { content: noteText });
      toast.success('Note added successfully');
      setNoteText('');
      fetchLead();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAssign = async (userId) => {
    try {
      await api.patch(`/leads/${id}/assign`, { userId: userId || null });
      toast.success(userId ? 'Lead assigned successfully' : 'Lead unassigned');
      setShowAssignModal(false);
      fetchLead();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign lead');
    }
  };

  const handleEdit = async (formData) => {
    try {
      await api.put(`/leads/${id}`, formData);
      toast.success('Lead updated successfully');
      setShowEditModal(false);
      fetchLead();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update lead');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen min-h-[400px]">
        <div className="spinner" />
        <p>Loading lead profile...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-12 text-center space-y-4">
        <h3 className="text-xl font-heading font-bold text-white">Lead record not found</h3>
        <Link to="/dashboard/leads" className="btn btn-primary">Back to Pipeline</Link>
      </div>
    );
  }

  const currentStatusIndex = STATUSES.indexOf(lead.status);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Link */}
      <Link
        to="/dashboard/leads"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Prospects List</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">{lead.name}</h1>
            <Badge value={lead.status} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span>📧 {lead.email}</span>
            {lead.phone && <span>📞 {lead.phone}</span>}
            {lead.company && <span>🏢 {lead.company}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={FiEdit} onClick={() => setShowEditModal(true)}>
            Edit Profile
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" icon={FiUserPlus} onClick={() => setShowAssignModal(true)}>
              Assign Member
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Pipeline Stepper */}
      <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2">
          Pipeline Status Progression
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STATUSES.map((status, index) => {
            const isActive = status === lead.status;
            const isCompleted = index < currentStatusIndex;
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                    : isCompleted
                    ? 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    : 'bg-white/[0.02] text-slate-500 border border-white/5 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                {isCompleted && <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{status}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-heading font-bold text-white border-b border-white/10 pb-3">
              Lead Metadata Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Full Name</span>
                <span className="text-slate-200 font-medium">{lead.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Email</span>
                <span className="text-slate-200 font-medium">{lead.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Company</span>
                <span className="text-slate-200 font-medium">{lead.company || 'Unspecified'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Source</span>
                <span className="text-slate-200 font-medium capitalize">{lead.source?.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Assigned Specialist</span>
                <span className="text-slate-200 font-medium">{lead.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Date Captured</span>
                <span className="text-slate-200 font-medium">{new Date(lead.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Notes & Internal Comments ({lead.notes?.length || 0})</span>
              </h3>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                id="note-input"
                rows={3}
                placeholder="Write a status update, call outcome, or key detail..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submittingNote}
                  disabled={!noteText.trim()}
                >
                  Add Note
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {(!lead.notes || lead.notes.length === 0) ? (
                <p className="text-center py-6 text-slate-500 text-sm">No notes added yet. Write the first note above.</p>
              ) : (
                [...lead.notes].reverse().map((note, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-indigo-400">{note.addedBy?.name || 'Team Member'}</span>
                      <span className="text-slate-500">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-4 bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-heading font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <FiClock className="w-4 h-4 text-purple-400" />
            <span>Activity Trail</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {(!lead.activityTrail || lead.activityTrail.length === 0) ? (
              <p className="text-slate-500 text-xs">No activity logged.</p>
            ) : (
              [...lead.activityTrail].reverse().map((act, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[#12122b]" />
                  <p className="text-xs font-medium text-slate-200 leading-snug">{act.description}</p>
                  <p className="text-[10px] text-slate-500">{new Date(act.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Lead to Team Member"
        maxWidth="max-w-md"
      >
        <div className="space-y-2">
          <button
            onClick={() => handleAssign(null)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-left text-xs font-semibold text-slate-300 transition-all flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✕</div>
            <span>Unassigned</span>
          </button>

          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => handleAssign(u._id)}
              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-3 ${
                lead.assignedTo?._id === u._id
                  ? 'bg-indigo-500/20 border-indigo-500 text-white font-semibold'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                {u.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{u.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
              </div>
              <Badge value={u.role} />
            </button>
          ))}
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Lead Profile"
      >
        <EditLeadForm lead={lead} onClose={() => setShowEditModal(false)} onSubmit={handleEdit} />
      </Modal>
    </div>
  );
};

const EditLeadForm = ({ lead, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: lead.name,
    email: lead.email,
    phone: lead.phone || '',
    company: lead.company || '',
    source: lead.source,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social', label: 'Social Media' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="Company" name="company" value={form.company} onChange={handleChange} />
      </div>
      <Select label="Lead Source" name="source" value={form.source} onChange={handleChange} options={sourceOptions} />

      <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Save Changes</Button>
      </div>
    </form>
  );
};

export default LeadDetail;
