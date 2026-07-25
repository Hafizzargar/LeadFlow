import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowLeft, FiLogIn } from 'react-icons/fi';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070714] text-slate-100 relative overflow-hidden flex flex-col items-center justify-between p-6">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px] pointer-events-none" />

      {/* Header Back Link */}
      <div className="w-full max-w-md pt-4 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto py-8 z-10">
        <div className="bg-[#12122b]/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-heading font-extrabold text-2xl text-white shadow-lg shadow-indigo-500/25">
              L
            </div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-400">Sign in to manage your sales dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@leadflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={FiMail}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={FiLock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={FiLogIn}
              className="w-full"
              id="login-submit"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
              Quick Demo Fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left space-y-1 group"
                onClick={() => { setEmail('admin@leadflow.com'); setPassword('Admin@123'); toast.success('Admin credentials loaded!'); }}
              >
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  ADMIN
                </span>
                <p className="text-xs font-medium text-slate-300 truncate group-hover:text-white">admin@leadflow.com</p>
              </button>

              <button
                type="button"
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left space-y-1 group"
                onClick={() => { setEmail('member@leadflow.com'); setPassword('Member@123'); toast.success('Member credentials loaded!'); }}
              >
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  MEMBER
                </span>
                <p className="text-xs font-medium text-slate-300 truncate group-hover:text-white">member@leadflow.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full pb-4 text-center z-10">
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

export default Login;
