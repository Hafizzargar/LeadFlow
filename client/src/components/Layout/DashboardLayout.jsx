import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiUsers, FiTarget, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <FiGrid className="w-5 h-5" />, label: 'Dashboard', end: true },
    { to: '/dashboard/leads', icon: <FiTarget className="w-5 h-5" />, label: 'Leads Pipeline' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/dashboard/users', icon: <FiUsers className="w-5 h-5" />, label: 'Team Members' });
  }

  return (
    <div className="min-h-screen bg-[#070714] text-slate-100 flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c0c20] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-heading font-extrabold text-lg text-white shadow-md shadow-indigo-500/20">
              L
            </div>
            <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              LeadFlow
            </span>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-white/[0.01]">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                user?.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs bg-white/5 text-slate-300 border border-white/10 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20 transition-all"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Mobile Top Navbar */}
        <header className="lg:hidden h-16 bg-[#0c0c20] border-b border-white/10 px-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:bg-white/5"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
              L
            </div>
            <span className="font-heading font-bold text-base text-white">LeadFlow</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer Credit Line */}
        <footer className="border-t border-white/10 py-6 px-6 text-center bg-[#070714]">
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
    </div>
  );
};

export default DashboardLayout;
