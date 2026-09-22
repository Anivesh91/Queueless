import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { ticketApi } from '../../api/ticketApi';
import { useSocket } from '../../context/SocketContext';
import {
  BellRing,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Volume2,
  Calendar,
  Share2,
  ArrowLeft,
  Sparkles,
  Users,
  Check,
  Building2,
  X,
} from 'lucide-react';

export const TicketTrackerPage = () => {
  const { publicToken } = useParams();
  const { socket, isConnected, joinTicketRoom, leaveTicketRoom } = useSocket();

  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [hasTriggeredChime, setHasTriggeredChime] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [audioFeedbackPlaying, setAudioFeedbackPlaying] = useState(false);

  // Synthesize pleasant doorbell/airport chime using Web Audio API (0 KB file)
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
      setAudioFeedbackPlaying(true);
      setTimeout(() => setAudioFeedbackPlaying(false), 1200);
    } catch (e) {
      console.warn('Audio chime failed to play:', e);
    }
  };

  const fetchTicket = async () => {
    try {
      setError('');
      const res = await ticketApi.track(publicToken);
      const data = res?.data;
      setTicketData(data);

      if (data?.ticket?.status === 'CALLED' && !hasTriggeredChime) {
        playChime();
        setHasTriggeredChime(true);
      }

      if (data?.ticket?.status === 'COMPLETED') {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      }

      return data;
    } catch (err) {
      setError(err.message || 'Failed to load ticket information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [publicToken]);

  useEffect(() => {
    if (!ticketData?.ticket?.id) return;
    const ticketId = ticketData.ticket.id;

    joinTicketRoom(publicToken, ticketId);

    if (!socket) return;

    const handlePositionUpdated = (data) => {
      setTicketData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          peopleAhead: data.peopleAhead,
          estimatedWaitMinutes: data.estimatedWaitMinutes,
        };
      });
    };

    const handleCalled = () => {
      playChime();
      fetchTicket();
    };

    const handleServing = () => {
      fetchTicket();
    };

    const handleCompleted = () => {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      fetchTicket();
    };

    const handleCancelled = () => {
      fetchTicket();
    };

    const handleNoShow = () => {
      fetchTicket();
    };

    const handleReconnect = () => {
      fetchTicket();
    };

    socket.on('ticket:positionUpdated', handlePositionUpdated);
    socket.on('ticket:called', handleCalled);
    socket.on('ticket:serving', handleServing);
    socket.on('ticket:completed', handleCompleted);
    socket.on('ticket:cancelled', handleCancelled);
    socket.on('ticket:noShow', handleNoShow);
    socket.on('connect', handleReconnect);

    return () => {
      leaveTicketRoom(ticketId);
      socket.off('ticket:positionUpdated', handlePositionUpdated);
      socket.off('ticket:called', handleCalled);
      socket.off('ticket:serving', handleServing);
      socket.off('ticket:completed', handleCompleted);
      socket.off('ticket:cancelled', handleCancelled);
      socket.off('ticket:noShow', handleNoShow);
      socket.off('connect', handleReconnect);
    };
  }, [socket, ticketData?.ticket?.id, publicToken]);

  const confirmCancelTicket = async () => {
    try {
      setCancelLoading(true);
      await ticketApi.cancel(publicToken);
      setShowCancelModal(false);
      await fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to cancel ticket.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F5F2EB] flex flex-col items-center justify-center p-6 text-[#1C2520]">
        <div className="w-10 h-10 rounded-full bg-[#184E38] flex items-center justify-center gap-[2.5px] px-1.5 shadow-sm mb-4 animate-pulse">
          <span className="w-[2px] h-2 bg-emerald-200 rounded-full" />
          <span className="w-[2px] h-4 bg-white rounded-full" />
          <span className="w-[2px] h-2 bg-emerald-200 rounded-full" />
        </div>
        <p className="font-serif text-xl font-normal text-[#1A231F]">Loading your live ticket...</p>
        <p className="text-xs text-[#59665F] mt-1">Connecting to real-time queue dispatcher</p>
      </div>
    );
  }

  // Error State
  if (error || !ticketData) {
    return (
      <div className="min-h-screen w-full bg-[#F5F2EB] flex flex-col items-center justify-center p-6 text-[#1C2520]">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(25,35,30,0.07)] text-center border border-stone-100">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl font-normal text-[#1A231E]">Ticket Not Found</h2>
          <p className="text-xs text-[#65736B] mt-2 leading-relaxed">
            {error || 'This ticket token is invalid, expired, or has concluded.'}
          </p>
          <Link
            to="/customer"
            className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-[#184E38] hover:bg-[#123E2C] text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            Find an Organization Queue
          </Link>
        </div>
      </div>
    );
  }

  const { ticket, service, organization, peopleAhead, estimatedWaitMinutes } = ticketData;
  const status = ticket.status;
  const orgBackUrl = organization?.slug ? `/customer/organizations/${organization.slug}` : '/customer';

  // Compute live wave step state (0 = Joined, 1 = In Queue, 2 = Called, 3 = Serving/Done)
  let activeStepIndex = 1;
  if (status === 'CALLED') activeStepIndex = 2;
  else if (status === 'SERVING' || status === 'COMPLETED') activeStepIndex = 3;

  return (
    <div className="relative min-h-screen w-full bg-[#F5F2EB] flex flex-col justify-between p-4 sm:p-8 lg:p-10 text-[#1C2520] selection:bg-[#184E38] selection:text-white overflow-x-hidden">
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

      {/* Top Navigation & Brand Header */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between py-2 relative z-10">
        <Link
          to={orgBackUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A6760] hover:text-[#184E38] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to {organization?.name || 'Services'}</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* Brand Logo & Socket Indicator */}
        <div className="flex items-center gap-3">
          {/* Live Real-time Status Badge */}
          <div
            title={isConnected ? 'Live WebSocket Connected' : 'Syncing state...'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/90 border border-stone-200/80 shadow-2xs text-[#405047]"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden xs:inline">{isConnected ? 'Real-Time' : 'Syncing'}</span>
          </div>

          {/* Sound Preview Button */}
          <button
            type="button"
            onClick={playChime}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${
              audioFeedbackPlaying
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white/90 text-[#184E38] border-stone-200/80 hover:bg-stone-50'
            }`}
            title="Test audio chime alert"
          >
            <Volume2 className={`w-3.5 h-3.5 ${audioFeedbackPlaying ? 'animate-bounce text-emerald-600' : ''}`} />
            <span className="hidden xs:inline">Chime</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-lg mx-auto my-auto py-6 sm:py-8 relative z-10">
        {/* Dynamic Alert Banner when CALLED */}
        <AnimatePresence>
          {status === 'CALLED' && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-6 p-5 sm:p-6 bg-gradient-to-r from-[#184E38] via-[#205D44] to-[#184E38] rounded-[28px] text-white shadow-xl shadow-[#184E38]/25 flex items-center justify-between gap-4 border border-emerald-600/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                  <BellRing className="w-6 h-6 text-emerald-300 animate-bounce" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">
                    It's your turn!
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-serif leading-tight mt-0.5">
                    Please proceed to the counter.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={playChime}
                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all cursor-pointer shrink-0"
                title="Re-play chime"
              >
                <Volume2 className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Alert Banner when COMPLETED */}
        <AnimatePresence>
          {status === 'COMPLETED' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-5 bg-white rounded-[28px] text-center shadow-lg border border-emerald-100 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" />
              <span className="text-sm font-semibold text-[#184E38]">
                Service Completed — Thank you for using QueueLess!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Living Queue Curve Progress Track (The Organic SVG Stepper) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-[28px] border border-stone-200/60 shadow-xs"
        >
          <div className="relative w-full">
            <svg
              viewBox="0 0 380 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto overflow-visible"
            >
              {/* Baseline Wave Curve */}
              <path
                d="M 28 38 C 75 52, 120 28, 155 38 C 195 48, 240 28, 275 36 C 305 32, 325 38, 345 40"
                stroke="#2D5A43"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.25"
              />

              {/* Dynamic Active Progress Wave */}
              <motion.path
                d="M 28 38 C 75 52, 120 28, 155 38 C 195 48, 240 28, 275 36 C 305 32, 325 38, 345 40"
                stroke="#184E38"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength:
                    status === 'WAITING'
                      ? 0.42
                      : status === 'CALLED'
                      ? 0.78
                      : status === 'SERVING' || status === 'COMPLETED'
                      ? 1
                      : 0.15,
                }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Waypoint 1: Joined */}
              <circle
                cx="28"
                cy="38"
                r="7"
                fill="#184E38"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {/* Waypoint 2: In Queue */}
              <circle
                cx="155"
                cy="38"
                r="7.5"
                fill={status === 'WAITING' ? '#F8A084' : '#E2EDE7'}
                stroke={status === 'WAITING' ? '#D95D39' : '#2D5A43'}
                strokeWidth="2"
              />

              {/* Waypoint 3: Called (Pulsing radar ring when active) */}
              <g>
                {status === 'CALLED' && (
                  <motion.circle
                    cx="275"
                    cy="36"
                    r="8"
                    stroke="#184E38"
                    strokeWidth="1.5"
                    fill="none"
                    animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <circle
                  cx="275"
                  cy="36"
                  r="7.5"
                  fill={status === 'CALLED' ? '#184E38' : '#E2EDE7'}
                  stroke="#2D5A43"
                  strokeWidth="2"
                />
              </g>

              {/* Waypoint 4: Serving / Done */}
              <circle
                cx="345"
                cy="40"
                r="7"
                fill={status === 'SERVING' || status === 'COMPLETED' ? '#184E38' : '#E2EDE7'}
                stroke="#2D5A43"
                strokeWidth="2"
              />
            </svg>

            {/* Stepper Node Labels */}
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-medium text-[#4D5D55] pt-1 px-1">
              <span className="text-[#184E38] font-bold">1. Joined</span>
              <span className={status === 'WAITING' ? 'text-[#D95D39] font-bold' : ''}>
                2. In Queue ({peopleAhead} ahead)
              </span>
              <span className={status === 'CALLED' ? 'text-[#184E38] font-bold' : ''}>
                3. Called
              </span>
              <span className={status === 'SERVING' || status === 'COMPLETED' ? 'text-[#184E38] font-bold' : ''}>
                4. Done
              </span>
            </div>
          </div>
        </motion.div>

        {/* The Digital Boarding Pass Ticket Card with Ambient Radiant Halo */}
        <div className="relative group">
          {/* 1. Multi-layered Ambient Breathing Aura / Halo */}
          <motion.div
            className={`absolute -inset-1.5 sm:-inset-2 rounded-[38px] blur-2xl pointer-events-none transition-all duration-700 ${
              status === 'CALLED'
                ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500'
                : status === 'COMPLETED'
                ? 'bg-gradient-to-r from-emerald-300/40 via-teal-200/40 to-emerald-400/40'
                : 'bg-gradient-to-tr from-[#184E38]/20 via-[#D95D39]/15 to-[#2D5A43]/25'
            }`}
            animate={
              status === 'CALLED'
                ? { scale: [1, 1.04, 1], opacity: [0.75, 1, 0.75] }
                : { scale: [1, 1.02, 1], opacity: [0.3, 0.55, 0.3] }
            }
            transition={{
              duration: status === 'CALLED' ? 1.8 : 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* 2. Floating Micro-Badge around Ticket Card */}
          <motion.div
            className="hidden sm:flex absolute -top-3 -right-2 z-20 items-center gap-1.5 px-3 py-1 bg-white/95 rounded-full border border-stone-200/80 shadow-md text-[10px] font-bold text-[#184E38] backdrop-blur-md"
            animate={{ y: [0, -3.5, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Live Pass Verified</span>
          </motion.div>

          {/* 3. The Digital Boarding Pass Ticket Card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full bg-white rounded-[32px] shadow-[0_25px_60px_-15px_rgba(25,35,30,0.08)] overflow-hidden relative transition-all duration-300 ${
              status === 'CALLED'
                ? 'border-2 border-emerald-500/80 shadow-[0_30px_70px_-10px_rgba(24,78,56,0.25)]'
                : 'border border-stone-100/90 hover:shadow-[0_30px_70px_-12px_rgba(25,35,30,0.12)]'
            }`}
          >
            {/* Laminated Glass Shimmer Streak */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none z-10"
              animate={{ x: ['-150%', '250%'] }}
              transition={{ repeat: Infinity, repeatDelay: 6, duration: 2, ease: 'easeInOut' }}
            />

            {/* Top Organization & Service Header */}
            <div className="px-6 sm:px-8 pt-7 pb-5 bg-gradient-to-b from-[#FAF8F3]/80 to-white flex items-center justify-between border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#184E38] text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#1A231E] leading-tight">
                  {organization?.name}
                </h3>
                <p className="text-xs text-[#65736B] font-medium mt-0.5">{service?.name}</p>
              </div>
            </div>

            {/* Status Pill Badge */}
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                status === 'WAITING'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : status === 'CALLED'
                  ? 'bg-emerald-50 text-[#184E38] border-emerald-300 animate-pulse'
                  : status === 'SERVING'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {status === 'WAITING'
                ? 'Waiting in Line'
                : status === 'CALLED'
                ? 'Your Turn!'
                : status === 'SERVING'
                ? 'Serving'
                : status === 'COMPLETED'
                ? 'Completed'
                : status}
            </span>
          </div>

          {/* Big Monospace Ticket Number Section */}
          <div className="px-6 sm:px-8 py-8 text-center bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3F6451]">
              YOUR VIRTUAL TICKET
            </p>

            <h1 className="font-mono text-5xl sm:text-6xl font-black text-[#184E38] tracking-tight my-2">
              {ticket.ticketNumber}
            </h1>

            {/* Customer Details Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F5F2EB] rounded-full text-xs font-medium text-[#405047] border border-stone-200/60">
              <span className="font-semibold">{ticket.customerName}</span>
              <span>•</span>
              <span className="font-mono text-[#59665F]">{ticket.customerPhone}</span>
            </div>
          </div>

          {/* Perforated Ticket Notches & Dashed Tear Line */}
          <div className="relative flex items-center justify-between px-1">
            <div className="w-5 h-5 rounded-full bg-[#F5F2EB] -ml-2.5 border-r border-stone-200/80 shadow-inner" />
            <div className="flex-1 border-t-2 border-dashed border-stone-200 mx-2" />
            <div className="w-5 h-5 rounded-full bg-[#F5F2EB] -mr-2.5 border-l border-stone-200/80 shadow-inner" />
          </div>

          {/* Live Metrics / Status Specific Stage */}
          <div className="p-6 sm:p-8 space-y-6 bg-white">
            {status === 'WAITING' && (
              <>
                {/* 2-Column Gauge Box */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Position in Line */}
                  <motion.div
                    key={`people-${peopleAhead}`}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      peopleAhead === 0
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-2xs'
                        : 'bg-[#FAF8F3] border-stone-200/80 text-[#1A231E]'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6760]">
                      People Ahead
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-serif my-1 text-[#184E38]">
                      {peopleAhead}
                    </div>
                    <div className="text-[11px] font-medium text-[#59665F]">
                      {peopleAhead === 0 ? 'You are next in line! 🎉' : 'ahead of you in queue'}
                    </div>
                  </motion.div>

                  {/* Estimated Wait */}
                  <div className="p-4 bg-[#FAF8F3] rounded-2xl border border-stone-200/80 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6760]">
                      Estimated Wait
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-serif my-1 text-[#1A231E]">
                      {peopleAhead > 0 ? `~${estimatedWaitMinutes}m` : '0m'}
                    </div>
                    <div className="text-[11px] font-medium text-[#59665F]">
                      approximate time
                    </div>
                  </div>
                </div>

                {/* Real-Time Live Pulse Tag */}
                <div className="flex items-center justify-center gap-2 text-xs text-[#59665F] font-medium py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Position updates automatically — no need to refresh</span>
                </div>

                {/* Leave Queue Button (Replaces window.confirm with Modal) */}
                <div className="pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/70 rounded-xl transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                  >
                    Leave Queue / Cancel Ticket
                  </button>
                </div>
              </>
            )}

            {status === 'CALLED' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#184E38] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#184E38]/25">
                  <BellRing className="w-8 h-8 text-emerald-200 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#1A231E]">
                    Your Ticket is Called!
                  </h3>
                  <p className="text-xs text-[#59665F] mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Please step forward to the counter at <strong>{organization?.name}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={playChime}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-[#184E38] border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Play Chime Alert</span>
                </button>
              </div>
            )}

            {status === 'SERVING' && (
              <div className="text-center py-4 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-[#184E38] text-white flex items-center justify-center mx-auto shadow-md">
                  <Clock className="w-8 h-8 text-emerald-200 animate-spin" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#1A231E]">
                  Service in Progress
                </h3>
                <p className="text-xs text-[#59665F] max-w-xs mx-auto leading-relaxed">
                  You are currently being served at the counter.
                </p>
              </div>
            )}

            {status === 'COMPLETED' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#1A231E]">
                    Service Completed
                  </h3>
                  <p className="text-xs text-[#59665F] mt-1 max-w-xs mx-auto">
                    Your turn has concluded. Thank you for skipping the line!
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link
                    to={orgBackUrl}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#184E38] hover:bg-[#123E2C] rounded-xl transition-all shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to {organization?.name}</span>
                  </Link>
                  <Link
                    to="/customer"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-[#405047] bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    <span>Browse Directory</span>
                  </Link>
                </div>
              </div>
            )}

            {status === 'CANCELLED' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#1A231E]">
                    Ticket Cancelled
                  </h3>
                  <p className="text-xs text-[#59665F] mt-1 max-w-xs mx-auto">
                    You have left this queue. You can return to join again anytime.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link
                    to={orgBackUrl}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#184E38] hover:bg-[#123E2C] rounded-xl transition-all shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Organization</span>
                  </Link>
                </div>
              </div>
            )}

            {status === 'NO_SHOW' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-normal text-[#1A231E]">
                    Marked as No-Show
                  </h3>
                  <p className="text-xs text-[#59665F] mt-1 max-w-xs mx-auto">
                    The counter operator called your number, but you were marked absent.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link
                    to={orgBackUrl}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#184E38] hover:bg-[#123E2C] rounded-xl transition-all shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Get a New Ticket</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Card Footer: Timestamp & Share Button */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-[#6B7971]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#184E38]" />
                <span>
                  Joined at{' '}
                  {new Date(ticket.joinedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>

              {/* Share Ticket Button with Copy Feedback */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 text-[#184E38] hover:text-[#123E2C] font-semibold transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Pass</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </main>

      {/* Clean Bottom Footer */}
      <footer className="w-full max-w-lg mx-auto py-2 text-center text-[11px] text-[#788880] relative z-10">
        <span>Powered by </span>
        <strong className="text-[#184E38]">QueueLess Virtual Queues</strong>
        <span> • Live real-time pass</span>
      </footer>

      {/* Leave Queue Confirmation Modal (No more window.confirm!) */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-[28px] p-6 shadow-2xl border border-stone-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h4 className="font-serif text-xl font-normal text-[#1A231E]">
                  Leave virtual queue?
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#59665F] my-4 leading-relaxed">
                If you leave now, you will lose your current spot in line ({ticket.ticketNumber}).
                This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#37433C] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Keep My Spot
                </button>
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={confirmCancelTicket}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {cancelLoading ? 'Leaving...' : 'Yes, Leave Queue'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
