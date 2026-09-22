import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Volume2 } from 'lucide-react';

export const LoginPage = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, googleLogin } = useAuth();

  // Mode: 'login' or 'register' (dynamically initialized by route or prop)
  const [mode, setMode] = useState(
    initialMode || (location.pathname === '/organization/register' ? 'register' : 'login')
  );

  // Sync mode if route changes
  useEffect(() => {
    if (location.pathname === '/organization/register') {
      setMode('register');
    } else if (location.pathname === '/organization/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chimePlayed, setChimePlayed] = useState(false);

  // Synthesized Web Audio chime on clicking "Your turn" preview
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
      console.warn('Audio chime preview failed:', e);
    }
  };

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        setLoading(true);
        await register(name.trim(), email.trim(), password);
        navigate('/organization/setup');
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        await login(email.trim(), password);
        navigate('/organization/dashboard');
      } catch (err) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        const res = await googleLogin({ accessToken: tokenResponse.access_token });
        if (res?.isNewUser) {
          navigate('/organization/setup');
        } else {
          navigate('/organization/dashboard');
        }
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-In was cancelled or encountered an issue.');
    },
  });

  return (
    <div className="relative min-h-screen w-full bg-[#F5F2EB] flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-[#1C2520] selection:bg-[#184E38] selection:text-white overflow-hidden">
      {/* Ambient Floating Glow Blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 bg-[#EBE4D5]/60 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, 40, -10, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-36 -right-36 w-[450px] h-[450px] bg-[#E8E0CE]/50 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -30, 15, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top Header / Logo with Interactive Audio-Wave Equalizer */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          {/* Animated Waveform Pill Icon */}
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
          <span className="font-semibold text-lg tracking-tight text-[#184E38] group-hover:text-[#123E2C] transition-colors">
            Queueless
          </span>
        </Link>
      </motion.header>

      {/* Main 2-Column Content */}
      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto py-8 lg:py-12 relative z-10">
        {/* Left Column: Brand Hero & Live Animated Timeline */}
        <section className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Eyebrow with Blur-to-Sharp Fade */}
            <motion.p
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] uppercase mb-5 inline-flex items-center gap-2"
            >
              <span>MORE TIME FOR WHAT MATTERS</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#184E38]/60 animate-ping" />
            </motion.p>

            {/* Editorial Serif Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[62px] font-normal text-[#1A231F] leading-[1.08] tracking-tight">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Your day shouldn’t
              </motion.span>{' '}
              <br />
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                have to stand still.
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
              className="mt-6 text-base sm:text-lg text-[#59665F] font-normal leading-relaxed max-w-md"
            >
              Join the queue from wherever you are. We’ll keep your place and let you know when it’s time to go.
            </motion.p>
          </div>

          {/* Interactive Live Queue Timeline Doodle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-14 sm:mt-20 max-w-md"
          >
            <div className="relative w-full bg-[#FAF8F3]/60 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/50 shadow-2xs">
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
                  transition={{ duration: 0.8, delay: 0.6, ease: 'easeInOut' }}
                />

                {/* Self-Drawing Wave Curve */}
                <motion.path
                  id="queue-wave-path"
                  d="M 28 42 C 75 56, 120 32, 160 42 C 200 52, 245 32, 285 38 C 310 34, 325 42, 340 45"
                  stroke="#2D5A43"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Animated Traveling Customer Pulse Along the Wave Curve */}
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
                  className="shadow-sm"
                />

                {/* Node 1: Joined remotely */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.9 }}
                >
                  <circle cx="28" cy="42" r="8" fill="#E2EDE7" stroke="#2D5A43" strokeWidth="2.5" />
                  <circle cx="28" cy="42" r="3" fill="#2D5A43" />
                </motion.g>

                {/* Node 2: 12 min saved (Gentle Levitating Float) */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: [0, -3.5, 0],
                  }}
                  transition={{
                    scale: { type: 'spring', stiffness: 350, damping: 20, delay: 1.2 },
                    opacity: { duration: 0.3, delay: 1.2 },
                    y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 },
                  }}
                >
                  <circle cx="190" cy="45" r="8" fill="#F8A084" stroke="#D95D39" strokeWidth="2.5" />
                </motion.g>

                {/* Node 3: Your turn (Interactive with Pulsing Radar Ring & Sound Preview!) */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 1.5 }}
                  onClick={playPreviewChime}
                  className="cursor-pointer group"
                >
                  {/* Outer Pulsing Green Radar Wave */}
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
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="flex justify-between items-center text-[11px] font-medium text-[#4D5D55] pt-1.5 px-1"
              >
                <span className="-ml-1">Joined remotely</span>
                <span className="text-[#3D4C44] font-semibold">12 min saved</span>
                <button
                  type="button"
                  onClick={playPreviewChime}
                  className="inline-flex items-center gap-1 text-[#184E38] font-bold hover:underline cursor-pointer focus:outline-none"
                  title="Click to test chime sound"
                >
                  <span>Your turn</span>
                  <Volume2 className={`w-3.5 h-3.5 ${chimePlayed ? 'text-emerald-600 animate-bounce' : 'text-[#184E38]'}`} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Right Column: Unified Morphing Auth Card */}
        <section className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px] bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(25,35,30,0.08)] border border-stone-100/90 transition-all hover:shadow-[0_30px_70px_-10px_rgba(25,35,30,0.12)]"
          >
            {/* Sliding Pill Tab Switcher */}
            <div className="flex p-1 bg-stone-100/80 rounded-2xl mb-6 border border-stone-200/50">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`relative flex-1 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  mode === 'login' ? 'text-[#184E38]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {mode === 'login' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Sign in</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('register')}
                className={`relative flex-1 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  mode === 'register' ? 'text-[#184E38]' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {mode === 'register' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Create account</span>
              </button>
            </div>

            {/* Header with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-[#1A231E] tracking-tight">
                  {mode === 'login' ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="text-[13px] text-[#65736B] mt-1.5 font-normal leading-relaxed">
                  {mode === 'login'
                    ? 'Sign in to check your place and keep your day moving.'
                    : 'Start managing your business queues in minutes.'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error Message with Smooth Expand */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 overflow-hidden shadow-2xs"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unified Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full Name Field (Register Mode Only) */}
              <AnimatePresence initial={false}>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <label className="block text-[12px] font-medium text-[#37433C] mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      required={mode === 'register'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Sarah Connor"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-[#1A231E] placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all duration-200 shadow-2xs"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div>
                <label className="block text-[12px] font-medium text-[#37433C] mb-1.5">
                  Email address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-[#1A231E] placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all duration-200 shadow-2xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[12px] font-medium text-[#37433C] mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-[#1A231E] placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all duration-200 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Register Mode Only) */}
              <AnimatePresence initial={false}>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <label className="block text-[12px] font-medium text-[#37433C] mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required={mode === 'register'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-[#1A231E] placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all duration-200 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none p-1"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options Row (Login Mode Only) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#5C6861] select-none group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-stone-300 text-[#184E38] focus:ring-[#184E38] accent-[#184E38] transition-transform active:scale-95"
                    />
                    <span className="group-hover:text-stone-700 transition-colors">Remember me</span>
                  </label>
                  <Link
                    to="/organization/login"
                    className="text-[#184E38] hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Primary Action Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.012, y: -1 }}
                whileTap={{ scale: 0.985 }}
                className="relative overflow-hidden w-full mt-4 py-3 px-4 bg-[#184E38] hover:bg-[#123E2C] text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                {/* Light Shimmer Sweep Animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
                  animate={{
                    x: ['-120%', '200%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 3.5,
                    duration: 1.4,
                    ease: 'easeInOut',
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading
                    ? mode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
                </span>
              </motion.button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-stone-200/90 w-full" />
                <span className="bg-white px-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400 absolute">
                  OR
                </span>
              </div>

              {/* Google Button */}
              <motion.button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={loading}
                whileHover={{ scale: 1.012, y: -0.5 }}
                whileTap={{ scale: 0.985 }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-stone-50/90 text-stone-700 border border-stone-200 hover:border-stone-300 rounded-xl font-medium text-xs transition-all duration-200 shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </motion.button>

              {/* Mode Switch Prompt */}
              <div className="pt-2 text-center text-xs text-stone-600">
                {mode === 'login' ? (
                  <>
                    New to Queueless?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('register')}
                      className="font-semibold text-[#184E38] hover:text-[#123E2C] hover:underline transition-colors cursor-pointer"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('login')}
                      className="font-semibold text-[#184E38] hover:text-[#123E2C] hover:underline transition-colors cursor-pointer"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              {/* Trust Badge / Security Microcopy */}
              <p className="text-[11px] text-stone-400 text-center pt-2 leading-relaxed max-w-[280px] mx-auto">
                Your place is private. We use secure encryption and never sell your data.
              </p>
            </form>
          </motion.div>
        </section>
      </main>

      {/* Subtle bottom spacing */}
      <footer className="w-full max-w-7xl mx-auto py-2" />
    </div>
  );
};
