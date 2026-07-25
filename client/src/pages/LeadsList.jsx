import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSearch, FiPlus, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Modal from '../components/Common/Modal';
import Badge from '../components/Common/Badge';

const STATUSES = ['all', 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const LeadsList = () => {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, statusFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/leads?${params}`);
      setLeads(res.data.data);
      setPagination((prev) => ({ ...prev, ...res.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete lead');
    }
  };

  const handleCreateLead = async (formData) => {
    try {
      await api.post('/leads', formData);
      toast.success('New prospect created successfully!');
      setShowCreateModal(false);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create lead');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Leads Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">Manage, filter, and assign sales prospects.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={FiPlus}
            variant="primary"
          >
            New Lead
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Input
            placeholder="Search by lead name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={FiSearch}
            id="leads-search"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-screen min-h-[350px]">
          <div className="spinner" />
          <p>Loading prospects...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center space-y-3">
          <div className="text-4xl opacity-40">📋</div>
          <h3 className="text-lg font-heading font-bold text-white">No leads found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== 'all'
              ? 'Try modifying your search or filter parameters.'
              : 'Submissions from the public capture form will automatically populate here.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="leads-table">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Company</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Source</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Assignee</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      <Link to={`/dashboard/leads/${lead._id}`} className="hover:text-indigo-400 transition-colors">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{lead.company || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 capitalize">{lead.source?.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <Badge value={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {lead.assignedTo?.name ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          {lead.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/leads/${lead._id}`}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-slate-400"
                          title="View Details"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/20 hover:text-red-400 transition-all text-slate-400"
                            title="Delete Lead"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} prospects
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <div className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold">
                Page {pagination.page} of {pagination.pages || 1}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Prospect"
      >
        <CreateLeadForm onClose={() => setShowCreateModal(false)} onSubmit={handleCreateLead} />
      </Modal>
    </div>
  );
};

const CreateLeadForm = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website' });
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
        <Button type="submit" variant="primary">Save Prospect</Button>
      </div>
    </form>
  );
};

export default LeadsList;
