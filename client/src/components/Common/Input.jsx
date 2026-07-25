import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon: Icon,
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
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        )}
        <input
          id={id || name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs font-medium mt-1">{error}</p>}
    </div>
  );
};

export default Input;
