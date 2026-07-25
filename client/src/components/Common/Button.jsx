import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | danger | outline | ghost
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed outline-none select-none active:scale-[0.99]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110',
    secondary: 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:brightness-110 hover:shadow-red-500/25',
    outline: 'border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10',
    ghost: 'text-slate-400 hover:bg-white/5 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};

export default Button;
