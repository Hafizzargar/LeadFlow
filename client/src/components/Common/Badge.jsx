import React from 'react';

const Badge = ({ type = 'status', value, className = '' }) => {
  const statusStyles = {
    new: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    contacted: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    qualified: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    proposal: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    won: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    lost: 'bg-red-500/15 text-red-400 border-red-500/20',
    admin: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    member: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };

  const style = statusStyles[value?.toLowerCase()] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${style} ${className}`}>
      {value}
    </span>
  );
};

export default Badge;
