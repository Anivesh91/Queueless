import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative overflow-hidden inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.985]';

  const variants = {
    primary:
      'bg-[#184E38] hover:bg-[#123E2C] text-white shadow-sm hover:shadow focus:ring-[#184E38]',
    secondary:
      'bg-[#EBE4D5]/80 hover:bg-[#EBE4D5] dark:bg-stone-800 dark:hover:bg-stone-700 text-[#1C2520] dark:text-stone-100 focus:ring-stone-400 border border-stone-200/80 dark:border-stone-700',
    success:
      'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm focus:ring-emerald-600',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    outline:
      'bg-transparent hover:bg-[#EBE4D5]/50 dark:hover:bg-stone-800 text-[#1C2520] dark:text-stone-200 border border-stone-300 dark:border-stone-700 focus:ring-stone-400',
    ghost:
      'bg-transparent hover:bg-[#EBE4D5]/40 dark:hover:bg-stone-800 text-[#59665F] dark:text-stone-300 focus:ring-stone-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
    xl: 'px-8 py-3.5 text-base sm:text-lg gap-3 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
};
