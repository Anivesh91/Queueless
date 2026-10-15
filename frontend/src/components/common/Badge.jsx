import React from 'react';

export const Badge = ({ status, text, size = 'md', className = '' }) => {
  const normalized = (status || text || '').toUpperCase();

  const styles = {
    // Queue statuses
    OPEN: 'bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] border-[#C5DCCF] dark:border-[#2D5A43]',
    CLOSED: 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700',

    // Ticket statuses
    WAITING: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
    CALLED: 'bg-[#E2EDE7] dark:bg-[#184E38]/50 text-[#184E38] dark:text-[#C5DCCF] border-[#184E38]/40 dark:border-[#5E987B] font-bold shadow-xs',
    SERVING: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/80 font-semibold',
    COMPLETED: 'bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] border-[#C5DCCF] dark:border-[#2D5A43]',
    CANCELLED: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
    NO_SHOW: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700',

    // Category / generic
    ACTIVE: 'bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] border-[#C5DCCF] dark:border-[#2D5A43]',
    INACTIVE: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700',
    DEFAULT: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3.5 py-1 text-sm font-semibold',
  };

  const style = styles[normalized] || styles.DEFAULT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide ${style} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normalized === 'OPEN' || normalized === 'COMPLETED' || normalized === 'ACTIVE'
            ? 'bg-[#184E38]'
            : normalized === 'CALLED'
            ? 'bg-[#184E38] animate-ping'
            : normalized === 'SERVING'
            ? 'bg-blue-600'
            : normalized === 'WAITING'
            ? 'bg-amber-500'
            : normalized === 'CANCELLED'
            ? 'bg-rose-500'
            : 'bg-stone-400'
        }`}
      />
      {text || normalized}
    </span>
  );
};
