import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Footer = () => {
  const location = useLocation();

  const isAuthOrTicketPage =
    location.pathname === '/organization/login' ||
    location.pathname === '/organization/register' ||
    location.pathname.startsWith('/customer/tickets/');

  if (isAuthOrTicketPage) {
    return null;
  }

  return (
    <footer className="w-full border-t border-stone-200/80 dark:border-stone-800/80 bg-[#F5F2EB]/95 dark:bg-[#131B17]/95 py-10 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {/* Waveform Equalizer Pill */}
            <div className="w-7 h-7 rounded-full bg-[#184E38] flex items-center justify-center gap-[2px] px-1 shadow-2xs">
              {[
                { height: '5px', duration: 1.1, delay: 0 },
                { height: '11px', duration: 0.9, delay: 0.15 },
                { height: '14px', duration: 1.3, delay: 0.3 },
                { height: '9px', duration: 0.85, delay: 0.45 },
                { height: '5px', duration: 1.2, delay: 0.6 },
              ].map((bar, idx) => (
                <motion.span
                  key={idx}
                  className="w-[1.8px] bg-white rounded-full origin-center"
                  animate={{
                    scaleY: [1, 1.5, 0.7, 1.2, 1],
                    opacity: [0.85, 1, 0.7, 0.95, 0.85],
                  }}
                  transition={{
                    duration: bar.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: bar.delay,
                  }}
                  style={{ height: bar.height }}
                />
              ))}
            </div>
            <div>
              <span className="text-sm font-serif font-bold text-[#184E38] dark:text-[#E2EDE7]">Queueless</span>
              <span className="text-xs text-[#59665F] dark:text-stone-400 ml-2">— More time for what matters</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#59665F] dark:text-stone-400 font-medium">
            <Link to="/customer" className="hover:text-[#184E38] dark:hover:text-[#A7D7BC] transition-colors">
              Find a Queue
            </Link>
            <Link to="/customer/organizations" className="hover:text-[#184E38] dark:hover:text-[#A7D7BC] transition-colors">
              Business Directory
            </Link>
            <Link to="/organization/login" className="hover:text-[#184E38] dark:hover:text-[#A7D7BC] transition-colors">
              Owner Portal
            </Link>
            <span className="text-stone-400 dark:text-stone-600">
              &copy; {new Date().getFullYear()} Queueless. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
