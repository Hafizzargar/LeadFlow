import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSend, FiCheck, FiTarget, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';
import api from '../services/api';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Button from '../components/Common/Button';

const PublicCapture = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/public/leads', form);
      setSubmitted(true);
      toast.success('Lead submitted successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = [
    { value: 'website', label: 'Website Direct' },
    { value: 'referral', label: 'Client Referral' },
    { value: 'social', label: 'Social Media' },
    { value: 'cold_call', label: 'Cold Outreach' },
    { value: 'email', label: 'Email Campaign' },
    { value: 'other', label: 'Other Channel' },
  ];

  return (
    <div className="min-h-screen bg-[#070714] text-slate-100 relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/10 bg-[#0a0a1e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-heading font-extrabold text-xl text-white shadow-lg shadow-indigo-500/20">
              L
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              LeadFlow
            </span>
          </div>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <span>🚀 Modern Sales Infrastructure</span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
            Capture, Track &<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Convert Every Lead
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
            Streamline your sales pipeline with automated lead capture, granular activity trails, assignees, and real-time status management. Built for performance sales teams.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-lg pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300 text-sm font-medium">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400"><FiTarget className="w-4 h-4" /></div>
              <span>Visual Pipeline</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300 text-sm font-medium">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><FiUsers className="w-4 h-4" /></div>
              <span>Team Assignment</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300 text-sm font-medium">
              <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400"><FiTrendingUp className="w-4 h-4" /></div>
              <span>Activity Audit Trail</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300 text-sm font-medium">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><FiShield className="w-4 h-4" /></div>
              <span>Role-Based Auth</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5">
          <div className="bg-[#12122b]/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6">
            {submitted ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl shadow-lg shadow-emerald-500/30">
                  <FiCheck />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-heading font-bold text-white">Lead Submitted!</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Thank you for reaching out. A sales specialist will connect with you shortly.
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', email: '', phone: '', company: '', source: 'website' });
                  }}
                >
                  Submit Another Lead
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className="text-2xl font-heading font-bold text-white">Get in Touch</h2>
                  <p className="text-slate-400 text-sm">Fill in your information to start a conversation.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" id="lead-capture-form">
                  <Input
                    label="Full Name"
                    name="name"
                    placeholder="e.g. Alex Morgan"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Work Email"
                    type="email"
                    name="email"
                    placeholder="alex@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      placeholder="+1 234 567 890"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    <Input
                      label="Company Name"
                      name="company"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>

                  <Select
                    label="How did you hear about us?"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    options={sourceOptions}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    icon={FiSend}
                    className="w-full mt-2"
                  >
                    Submit Lead
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 py-6 bg-[#070714] text-center">
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>
    </div>
  );
};

export default PublicCapture;
