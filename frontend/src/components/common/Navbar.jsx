import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, LogOut, ArrowRight, Sun, Moon } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isAuthOrTicketPage =
    location.pathname === '/organization/login' ||
    location.pathname === '/organization/register' ||
    location.pathname.startsWith('/customer/tickets/');

  if (isAuthOrTicketPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800/80 bg-[#F5F2EB]/90 dark:bg-[#131B17]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Signature Waveform Equalizer */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#184E38] flex items-center justify-center gap-[2.5px] px-1.5 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
            {[
              { height: '6px', duration: 1.1, delay: 0 },
              { height: '13px', duration: 0.9, delay: 0.15 },
              { height: '17px', duration: 1.3, delay: 0.3 },
              { height: '11px', duration: 0.85, delay: 0.45 },
              { height: '6px', duration: 1.2, delay: 0.6 },
            ].map((bar, idx) => (
              <motion.span
                key={idx}
                className="w-[2px] bg-white rounded-full origin-center"
                animate={{
                  scaleY: [1, 1.6, 0.7, 1.3, 1],
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
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-lg tracking-tight text-[#184E38] dark:text-[#E2EDE7] group-hover:text-[#123E2C] dark:group-hover:text-white transition-colors">
              Queueless
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7] dark:bg-[#184E38]/40 rounded-full border border-[#C5DCCF] dark:border-[#2D5A43]">
              Live
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#59665F] dark:text-stone-300">
          <Link
            to="/customer"
            className={`px-3.5 py-2 rounded-xl transition-all ${
              location.pathname === '/customer'
                ? 'text-[#184E38] dark:text-[#E2EDE7] bg-[#EBE4D5]/70 dark:bg-stone-800 font-bold'
                : 'hover:text-[#184E38] dark:hover:text-white hover:bg-[#EBE4D5]/40 dark:hover:bg-stone-800/50'
            }`}
          >
            Find a Queue
          </Link>
          <Link
            to="/customer/organizations"
            className={`px-3.5 py-2 rounded-xl transition-all ${
              location.pathname.startsWith('/customer/organizations')
                ? 'text-[#184E38] dark:text-[#E2EDE7] bg-[#EBE4D5]/70 dark:bg-stone-800 font-bold'
                : 'hover:text-[#184E38] dark:hover:text-white hover:bg-[#EBE4D5]/40 dark:hover:bg-stone-800/50'
            }`}
          >
            Directory
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-[#59665F] dark:text-stone-400 hover:text-[#184E38] dark:hover:text-white hover:bg-[#EBE4D5]/50 dark:hover:bg-stone-800 rounded-xl transition-all cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#2D5A43]" />
            )}
          </button>

          {/* Socket Connection Status */}
          <div
            title={isConnected ? 'Live Socket Connected' : 'Connecting to real-time server...'}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 text-[#37433C] dark:text-stone-300 shadow-2xs"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline text-[11px] font-semibold tracking-tight">
              {isConnected ? 'Real-time' : 'Syncing'}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/organization/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-[#184E38] dark:text-[#E2EDE7] bg-[#E2EDE7]/70 dark:bg-[#184E38]/30 hover:bg-[#E2EDE7] dark:hover:bg-[#184E38]/50 border border-[#C5DCCF]/80 dark:border-[#2D5A43] transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
                <span className="hidden sm:inline">{user?.name || 'Dashboard'}</span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/organization/login"
              className="relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#184E38] hover:bg-[#123E2C] rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>Owner Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
