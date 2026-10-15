import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import { useSocket } from '../../context/SocketContext';
import { Ticket, ArrowRight, X } from 'lucide-react';

export const ActiveTicketBanner = () => {
  const location = useLocation();
  const { socket } = useSocket();
  const [activeTicket, setActiveTicket] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const purgeTicketFromStorage = (publicToken) => {
    try {
      const saved = JSON.parse(localStorage.getItem('queueless_active_tickets') || '[]');
      const updated = saved.filter((t) => t.publicToken !== publicToken);
      localStorage.setItem('queueless_active_tickets', JSON.stringify(updated));
    } catch (e) {}
    setActiveTicket(null);
  };

  const verifyAndLoadActiveTicket = async () => {
    try {
      const saved = JSON.parse(localStorage.getItem('queueless_active_tickets') || '[]');
      if (!Array.isArray(saved) || saved.length === 0) {
        setActiveTicket(null);
        return;
      }

      const candidate = saved.find(
        (t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED' && t.status !== 'NO_SHOW'
      );

      if (!candidate || !candidate.publicToken) {
        setActiveTicket(null);
        return;
      }

      try {
        const res = await ticketApi.track(candidate.publicToken);
        const data = res?.data;
        const liveTicket = data?.ticket;

        if (liveTicket && ['WAITING', 'CALLED', 'SERVING'].includes(liveTicket.status)) {
          setActiveTicket({
            publicToken: liveTicket.publicToken,
            ticketNumber: liveTicket.ticketNumber,
            serviceName: data.service?.name || candidate.serviceName,
            organizationName: data.organization?.name || candidate.organizationName,
            status: liveTicket.status,
          });
        } else {
          purgeTicketFromStorage(candidate.publicToken);
        }
      } catch (err) {
        purgeTicketFromStorage(candidate.publicToken);
      }
    } catch (e) {
      console.warn('ActiveTicketBanner verification error:', e);
    }
  };

  useEffect(() => {
    verifyAndLoadActiveTicket();
  }, []);

  useEffect(() => {
    if (!socket || !activeTicket) return;

    const handleTicketEnd = (payload) => {
      if (payload?.ticketNumber === activeTicket.ticketNumber) {
        purgeTicketFromStorage(activeTicket.publicToken);
      }
    };

    socket.on('ticket:completed', handleTicketEnd);
    socket.on('ticket:cancelled', handleTicketEnd);
    socket.on('ticket:noShow', handleTicketEnd);

    return () => {
      socket.off('ticket:completed', handleTicketEnd);
      socket.off('ticket:cancelled', handleTicketEnd);
      socket.off('ticket:noShow', handleTicketEnd);
    };
  }, [socket, activeTicket]);

  if (
    !activeTicket ||
    dismissed ||
    location.pathname === '/organization/login' ||
    location.pathname === '/organization/register' ||
    location.pathname.startsWith('/customer/tickets/')
  )
    return null;

  return (
    <div className="bg-[#184E38] text-[#F5F2EB] px-4 py-2.5 shadow-sm border-b border-[#2D5A43] relative z-40 animate-in slide-in-from-top duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300" />
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-[#C5DCCF] uppercase tracking-wider text-[10px]">
              Active Ticket:
            </span>
            <span className="font-mono font-bold bg-white/15 px-2 py-0.5 rounded-md text-white border border-white/20">
              {activeTicket.ticketNumber}
            </span>
            {activeTicket.organizationName && (
              <span className="text-[#E2EDE7]">
                at <strong>{activeTicket.organizationName}</strong>
              </span>
            )}
            {activeTicket.serviceName && (
              <span className="text-[#C5DCCF] hidden md:inline">
                ({activeTicket.serviceName})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/customer/tickets/${activeTicket.publicToken}`}
            className="inline-flex items-center gap-1 bg-[#FAF8F3] text-[#184E38] font-semibold px-3 py-1 rounded-lg hover:bg-white transition-all shadow-2xs hover:scale-[1.02] active:scale-95"
          >
            <span>Live Ticket Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              setDismissed(true);
            }}
            className="text-[#C5DCCF] hover:text-white p-0.5 rounded-md focus:outline-none cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
