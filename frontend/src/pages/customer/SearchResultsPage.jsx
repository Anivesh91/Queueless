import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { OrgCard } from '../../components/customer/OrgCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import { Search, ArrowLeft, Building2, Radio } from 'lucide-react';

export const SearchResultsPage = () => {
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState(search);

  const fetchResults = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await orgApi.search({ search, category, city });
      setOrganizations(res?.data?.organizations || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [search, category, city]);

  useEffect(() => {
    fetchResults(false);
  }, [search, category, city, fetchResults]);

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
      fetchResults(true);
    };

    const handleQueueUpdated = () => {
      fetchResults(true);
    };

    socket.on('queue:statusChanged', handleQueueStatusChanged);
    socket.on('queue:updated', handleQueueUpdated);
    socket.on('connect', () => fetchResults(true));

    return () => {
      socket.off('queue:statusChanged', handleQueueStatusChanged);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [socket, fetchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: queryInput.trim() });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/customer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59665F] dark:text-stone-400 hover:text-[#184E38] dark:hover:text-[#A7D7BC] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery</span>
          </Link>
          <span className="block text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
            DIRECTORY & RESULTS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-1 tracking-tight">
            {search ? `Results for “${search}”` : 'All Organizations'}
          </h1>
          <p className="text-xs sm:text-sm text-[#59665F] dark:text-stone-400 mt-1">
            Browse active virtual queues and check live wait estimates.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2EDE7]/70 dark:bg-[#184E38]/30 border border-[#C5DCCF]/70 dark:border-[#2D5A43] text-[#184E38] dark:text-[#A7D7BC] text-xs font-semibold self-start sm:self-auto">
          <Radio className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC] animate-pulse" />
          <span>Real-Time Sync</span>
        </div>
      </div>

      {/* Refine Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#184E38] dark:text-[#A7D7BC] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Refine search by name or service..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-400 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer active:scale-98"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200/80 dark:border-stone-800 shadow-soft-float max-w-lg mx-auto my-8">
          <Building2 className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white">No Matching Businesses Found</h3>
          <p className="text-xs text-[#59665F] dark:text-stone-400 mt-2">
            Try checking spelling or search with a broader term.
          </p>
          <Link
            to="/customer"
            className="inline-block mt-6 px-5 py-2.5 text-xs font-semibold text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7] dark:bg-[#184E38]/30 hover:bg-[#C5DCCF] rounded-xl transition-all"
          >
            View All Queues
          </Link>
        </div>
      ) : (
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
    </div>
  );
};
