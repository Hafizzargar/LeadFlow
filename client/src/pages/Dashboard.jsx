import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiUsers, FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_COLORS = {
  new: 'bg-blue-500',
  contacted: 'bg-purple-500',
  qualified: 'bg-amber-500',
  proposal: 'bg-orange-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-500',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, byStatus: {}, recent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/leads?limit=50');
      const leads = res.data.data;
      const total = res.data.pagination.total;

      const byStatus = {};
      leads.forEach((lead) => {
        byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
      });

      const recent = leads.slice(0, 5);
      setStats({ total, byStatus, recent });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen min-h-[400px]">
        <div className="spinner" />
        <p>Loading sales dashboard...</p>
      </div>
    );
  }

  const wonCount = stats.byStatus.won || 0;
  const conversionRate = stats.total > 0 ? ((wonCount / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here is a real-time overview of your sales pipeline.</p>
        </div>
        <Link
          to="/dashboard/leads"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <FiTarget className="w-4 h-4" />
          <span>Manage Leads</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <FiTarget />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white tracking-tight">{stats.total}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Total Pipeline Leads</p>
        </div>

        <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <FiClock />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white tracking-tight">{stats.byStatus.new || 0}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">New Uncontacted Leads</p>
        </div>

        <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <FiTrendingUp />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white tracking-tight">{conversionRate}%</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Deal Win Conversion</p>
        </div>

        <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <FiUsers />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white tracking-tight">{stats.byStatus.qualified || 0}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Qualified Opportunities</p>
        </div>
      </div>

      {/* Pipeline Status Bar Overview */}
      <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <h2 className="text-lg font-heading font-bold text-white">Pipeline Stage Breakdown</h2>
        <div className="space-y-4">
          {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((status) => {
            const count = stats.byStatus[status] || 0;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={status} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="capitalize text-slate-300">{status}</span>
                  <span className="text-slate-400">{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[status]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#12122b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-white">Recent Pipeline Additions</h2>
          <Link
            to="/dashboard/leads"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No leads in pipeline yet. Submissions from the public form will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Lead Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Company</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recent.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      <Link to={`/dashboard/leads/${lead._id}`} className="hover:text-indigo-400 transition-colors">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{lead.company || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
