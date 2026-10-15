import React, { useState, useEffect, useCallback } from 'react';
import { orgApi } from '../../api/orgApi';
import { OrgCard } from '../../components/customer/OrgCard';
import { FindTicketModal } from '../../components/customer/FindTicketModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import { Search, MapPin, AlertCircle, Building2, Radio, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'HOSPITAL_CLINIC', label: 'Hospital & Clinic' },
  { id: 'SALON_BARBER', label: 'Salon & Barber' },
  { id: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' },
  { id: 'REPAIR_SERVICE_CENTER', label: 'Repair & Service' },
  { id: 'CONSULTATION_CENTER', label: 'Consultation' },
  { id: 'OTHER', label: 'Other Services' },
];

export const CustomerHomePage = () => {
  const { socket, isConnected } = useSocket();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [city, setCity] = useState('');
  const [isFindTicketOpen, setIsFindTicketOpen] = useState(false);

  const fetchOrganizations = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError('');
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (city.trim()) params.city = city.trim();

      const res = await orgApi.search(params);
      setOrganizations(res?.data?.organizations || []);
    } catch (err) {
      setError(err.message || 'Failed to load directory. Please try again.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [searchTerm, selectedCategory, city]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (!socket) return;

    const handleQueueStatusChanged = (payload) => {
      setOrganizations((prevOrgs) =>
        prevOrgs.map((org) => {
          if (org._id === payload.organizationId) {
            let currentOpen = org.openQueuesCount || 0;
            if (payload.status === 'OPEN') {
              currentOpen = Math.min(currentOpen + 1, org.servicesCount || 99);
            } else if (payload.status === 'CLOSED') {
              currentOpen = Math.max(0, currentOpen - 1);
            }
            return { ...org, openQueuesCount: currentOpen };
          }
          return org;
        })
      );
      fetchOrganizations(true);
    };

    const handleQueueUpdated = () => {
      fetchOrganizations(true);
    };

    socket.on('queue:statusChanged', handleQueueStatusChanged);
    socket.on('queue:updated', handleQueueUpdated);
    socket.on('connect', () => fetchOrganizations(true));

    return () => {
      socket.off('queue:statusChanged', handleQueueStatusChanged);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [socket, fetchOrganizations]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrganizations(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
            LIVE DIRECTORY
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-1 tracking-tight">
            Find a Virtual Queue
          </h1>
          <p className="text-[#59665F] dark:text-stone-400 text-xs sm:text-sm mt-1">
            Browse verified clinics, salons, and counters. Check live waiting times and join remotely.
          </p>
        </div>

        {/* Action pills */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsFindTicketOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-[#184E38] dark:text-[#A7D7BC] text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
            <span>Find My Ticket</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E2EDE7]/70 dark:bg-[#184E38]/30 border border-[#C5DCCF]/70 dark:border-[#2D5A43] text-[#184E38] dark:text-[#A7D7BC] text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC] animate-pulse" />
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float mb-8 space-y-4 transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#184E38] dark:text-[#A7D7BC] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by business name or service..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all"
            />
          </div>

          {/* City filter input */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city (e.g. Mumbai, Delhi)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white font-medium rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-98"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#184E38] text-white shadow-2xs'
                  : 'bg-[#FAF8F3] dark:bg-stone-800 text-[#59665F] dark:text-stone-300 hover:bg-[#EBE4D5]/60 dark:hover:bg-stone-700 hover:text-[#184E38] dark:hover:text-white border border-stone-200/60 dark:border-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 mb-6 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200/80 dark:border-stone-800 shadow-soft-float max-w-lg mx-auto my-8">
          <Building2 className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white">No Businesses Found</h3>
          <p className="text-xs text-[#59665F] dark:text-stone-400 mt-2">
            No active businesses matched your search filters. Try clearing your search query or city.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCity('');
              setSelectedCategory('ALL');
            }}
            className="mt-6 px-5 py-2.5 text-xs font-semibold text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7] dark:bg-[#184E38]/30 hover:bg-[#C5DCCF] rounded-xl transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Organizations Grid */
        <div>
          <div className="text-[11px] font-bold text-[#59665F] dark:text-stone-400 uppercase tracking-[0.15em] mb-4">
            Showing {organizations.length} {organizations.length === 1 ? 'place' : 'places'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrgCard key={org._id} organization={org} />
            ))}
          </div>
        </div>
      )}

      {/* Find My Ticket Modal */}
      <FindTicketModal isOpen={isFindTicketOpen} onClose={() => setIsFindTicketOpen(false)} />
    </div>
  );
};
