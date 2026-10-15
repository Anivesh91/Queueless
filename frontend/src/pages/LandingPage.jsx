import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Building2,
  Clock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Volume2,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chimePlayed, setChimePlayed] = useState(false);
  const navigate = useNavigate();

  const playPreviewChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
      setChimePlayed(true);
      setTimeout(() => setChimePlayed(false), 2000);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/customer/organizations?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/customer');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F2EB] text-[#1C2520] dark:bg-[#131B17] dark:text-[#E8EFEA] selection:bg-[#184E38] selection:text-white overflow-hidden transition-colors duration-200">
      {/* Ambient Floating Glow Blobs (Signature LoginPage aesthetic) */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#EBE4D5]/70 dark:bg-[#184E38]/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, 40, -10, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-36 w-[450px] h-[450px] bg-[#E8E0CE]/60 dark:bg-[#184E38]/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -30, 15, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F3]/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-[#3F6451] dark:text-[#A7D7BC] text-[11px] font-bold tracking-[0.2em] uppercase mb-8 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
            <span>MORE TIME FOR WHAT MATTERS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#184E38] dark:bg-[#A7D7BC] animate-ping" />
          </motion.div>

          {/* Editorial Serif Heading */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-[76px] font-normal text-[#1A231E] dark:text-white leading-[1.06] tracking-tight">
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Your day shouldn’t
            </motion.span>{' '}
            <br className="hidden sm:inline" />
            <motion.span
              className="inline-block text-[#184E38] dark:text-[#A7D7BC] italic font-serif"
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              have to stand still.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 text-base sm:text-xl text-[#59665F] dark:text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Join queues remotely with zero app downloads or accounts. We keep your spot safe and chime when it’s your turn.
          </motion.p>

          {/* Search Bar for Customer Queues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <form
              onSubmit={handleSearch}
              className="p-2 bg-white dark:bg-stone-900 rounded-2xl shadow-soft-float border border-stone-200/80 dark:border-stone-800 flex items-center gap-2 transition-all hover:shadow-soft-lift"
            >
              <div className="pl-3 text-[#184E38] dark:text-[#A7D7BC]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clinics, salons, diagnostic centers..."
                className="flex-1 px-2 py-2 text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-400 bg-transparent focus:outline-none"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden px-5 py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Find Queue
              </motion.button>
            </form>
          </motion.div>

          {/* Action Links */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium"
          >
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[#37433C] dark:text-stone-200 hover:text-[#184E38] dark:hover:text-white bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 rounded-xl shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <Users className="w-4 h-4 text-[#184E38] dark:text-[#A7D7BC]" />
              <span>Browse All Queues</span>
            </Link>
            <Link
              to="/organization/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[#184E38] dark:text-[#E2EDE7] bg-[#E2EDE7]/70 dark:bg-[#184E38]/30 hover:bg-[#E2EDE7] dark:hover:bg-[#184E38]/50 border border-[#C5DCCF]/80 dark:border-[#2D5A43] rounded-xl transition-all active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Business Owner Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Interactive Live Queue Timeline Doodle (Signature LoginPage Component) */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.65 }}
          className="mt-16 sm:mt-20 max-w-xl mx-auto"
        >
          <div className="bg-[#FAF8F3]/90 dark:bg-stone-900/90 backdrop-blur-md p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800 mb-3 text-xs text-[#59665F] dark:text-stone-400">
              <span className="font-serif font-bold text-[#184E38] dark:text-[#A7D7BC] text-sm">
                Live Queue Journey Simulator
              </span>
              <span className="text-[11px] font-mono uppercase bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] px-2 py-0.5 rounded-full font-bold">
                Interactive
              </span>
            </div>

            <svg
              viewBox="0 0 380 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto overflow-visible"
            >
              {/* Baseline Axis Line */}
              <motion.path
                d="M 18 36 L 18 68 Q 18 78 32 78 L 360 78"
                stroke="#2D5A43"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
              />

              {/* Self-Drawing Wave Curve */}
              <motion.path
                d="M 28 42 C 75 56, 120 32, 160 42 C 200 52, 245 32, 285 38 C 310 34, 325 42, 340 45"
                stroke="#2D5A43"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Traveling Pulse Along Curve */}
              <motion.circle
                r="4.5"
                fill="#184E38"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                animate={{
                  cx: [28, 90, 160, 220, 285, 340],
                  cy: [42, 40, 42, 45, 38, 45],
                  scale: [1, 1.25, 1, 1.2, 1, 1.5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 1.2,
                }}
              />

              {/* Node 1: Joined remotely */}
              <circle cx="28" cy="42" r="8" fill="#E2EDE7" stroke="#2D5A43" strokeWidth="2.5" />
              <circle cx="28" cy="42" r="3" fill="#2D5A43" />

              {/* Node 2: 12 min saved (Gentle Levitating Float) */}
              <motion.g
                animate={{ y: [0, -3.5, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <circle cx="190" cy="45" r="8" fill="#F8A084" stroke="#D95D39" strokeWidth="2.5" />
              </motion.g>

              {/* Node 3: Your turn (Interactive Airport Chime Preview) */}
              <motion.g onClick={playPreviewChime} className="cursor-pointer group">
                <motion.circle
                  cx="340"
                  cy="45"
                  r="8"
                  stroke="#2D5A43"
                  strokeWidth="1.5"
                  fill="none"
                  animate={{
                    scale: [1, 2.2],
                    opacity: [0.75, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <circle
                  cx="340"
                  cy="45"
                  r="8"
                  fill="#E2EDE7"
                  stroke="#2D5A43"
                  strokeWidth="2.5"
                  className="group-hover:fill-emerald-200 transition-colors"
                />
                <circle cx="340" cy="45" r="3" fill="#2D5A43" />
              </motion.g>
            </svg>

            {/* Waypoint Labels */}
            <div className="flex justify-between items-center text-[11px] font-medium text-[#4D5D55] dark:text-stone-300 pt-2 px-1">
              <span className="-ml-1">Joined Remotely</span>
              <span className="text-[#3D4C44] dark:text-stone-200 font-semibold">12 min saved</span>
              <button
                type="button"
                onClick={playPreviewChime}
                className="inline-flex items-center gap-1 text-[#184E38] dark:text-[#A7D7BC] font-bold hover:underline cursor-pointer focus:outline-none"
                title="Click to test chime"
              >
                <span>Your turn</span>
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    chimePlayed ? 'text-emerald-600 animate-bounce' : 'text-[#184E38] dark:text-[#A7D7BC]'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white/70 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
              SEAMLESS 3-STEP EXPERIENCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-2 tracking-tight">
              How Queueless works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#59665F] dark:text-stone-400">
              Designed for physical businesses and modern customers who value their time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#FAF8F3]/90 dark:bg-stone-900/90 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:shadow-soft-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center mb-6 font-mono font-bold text-lg border border-[#C5DCCF]/70 dark:border-[#2D5A43]">
                01
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white mb-2">
                Scan or Find Online
              </h3>
              <p className="text-sm text-[#59665F] dark:text-stone-400 leading-relaxed">
                Scan the counter QR standee or search your favorite clinic, salon, or service center online. No app download needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF8F3]/90 dark:bg-stone-900/90 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:shadow-soft-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center mb-6 font-mono font-bold text-lg border border-[#C5DCCF]/70 dark:border-[#2D5A43]">
                02
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white mb-2">
                Live Turn Tracker
              </h3>
              <p className="text-sm text-[#59665F] dark:text-stone-400 leading-relaxed">
                Get a digital boarding pass on your mobile. Your live queue position and estimated wait time update smoothly in real time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF8F3]/90 dark:bg-stone-900/90 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:shadow-soft-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center mb-6 font-mono font-bold text-lg border border-[#C5DCCF]/70 dark:border-[#2D5A43]">
                03
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white mb-2">
                Audible Chime Alert
              </h3>
              <p className="text-sm text-[#59665F] dark:text-stone-400 leading-relaxed">
                When your ticket is called by the counter staff, a gentle chime plays and your screen notifies you to step right in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
            ENGINEERED FOR SPEED
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-2 tracking-tight">
            Built for peace of mind
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <Smartphone className="w-6 h-6 text-[#184E38] dark:text-[#A7D7BC] mb-4" />
            <h3 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white mb-2">
              Zero Friction Guest Entry
            </h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 leading-relaxed">
              Customers just enter their name and phone number. No passwords, no accounts, no app downloads.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <Zap className="w-6 h-6 text-[#184E38] dark:text-[#A7D7BC] mb-4" />
            <h3 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white mb-2">
              Live WebSocket Sync
            </h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 leading-relaxed">
              Instant position sync across counter staff consoles, customer mobile screens, and lounge TVs.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <Clock className="w-6 h-6 text-[#184E38] dark:text-[#A7D7BC] mb-4" />
            <h3 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white mb-2">
              High-Velocity Operator Desk
            </h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 leading-relaxed">
              Counter staff can call next, serve, and complete tickets with keyboard shortcuts in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-[#184E38] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-soft-lift">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
              Ready to eliminate waiting lines forever?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#C5DCCF]">
              Set up your business queues in 3 minutes. Zero setup fees, instant virtual lines.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/organization/register"
                className="px-6 py-3 bg-[#FAF8F3] hover:bg-white text-[#184E38] text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95"
              >
                Register Your Business
              </Link>
              <Link
                to="/customer"
                className="px-6 py-3 bg-[#2D5A43] hover:bg-[#3F6451] text-white text-sm font-semibold rounded-xl transition-all border border-[#5E987B]/40 active:scale-95"
              >
                Explore Live Queues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
