import React from 'react';

export const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      <div className="h-6 bg-[#EBE4D5]/80 dark:bg-stone-800 rounded-xl w-1/3"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[#EBE4D5]/60 dark:bg-stone-800/70 rounded-lg"
          style={{ width: `${85 - i * 15}%` }}
        ></div>
      ))}
    </div>
  );
};
