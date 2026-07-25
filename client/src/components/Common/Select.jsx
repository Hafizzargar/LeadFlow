import React from 'react';

const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id || name} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label} {required && <span className="text-pink-500">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-xl bg-[#1a1a36] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
          error ? 'border-red-500/50' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#111128] text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs font-medium mt-1">{error}</p>}
    </div>
  );
};

export default Select;
