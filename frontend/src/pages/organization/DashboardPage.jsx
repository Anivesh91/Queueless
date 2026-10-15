import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ownerApi } from '../../api/ownerApi';
import { queueApi } from '../../api/queueApi';
import { Sidebar } from '../../components/owner/Sidebar';
import { ServiceQueueCard } from '../../components/owner/ServiceQueueCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Radio,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Layers,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinOwnerRoom } = useSocket();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingToggle, setLoadingToggle] = useState(null);

  const fetchDashboard = async () => {
    try {
      setError('');
      const res = await ownerApi.getDashboard();
      const data = res?.data;

      if (data && !data.hasOrganization) {
        navigate('/organization/setup');
        return;
      }

      setDashboardData(data);
      if (user?.id) {
        joinOwnerRoom(user.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleSync = () => {
      fetchDashboard();
    };

    socket.on('queue:updated', handleSync);
    socket.on('queue:statusChanged', handleSync);
    socket.on('ticket:called', handleSync);
    socket.on('ticket:serving', handleSync);
    socket.on('ticket:completed', handleSync);
    socket.on('ticket:cancelled', handleSync);
    socket.on('ticket:noShow', handleSync);

    return () => {
      socket.off('queue:updated', handleSync);
      socket.off('queue:statusChanged', handleSync);
      socket.off('ticket:called', handleSync);
      socket.off('ticket:serving', handleSync);
      socket.off('ticket:completed', handleSync);
      socket.off('ticket:cancelled', handleSync);
      socket.off('ticket:noShow', handleSync);
    };
  }, [socket]);

  const handleToggleQueue = async (serviceId, currentIsOpen) => {
    try {
      setLoadingToggle(serviceId);
      if (currentIsOpen) {
        await queueApi.close(serviceId);
      } else {
        await queueApi.open(serviceId);
      }
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to toggle queue status.');
    } finally {
      setLoadingToggle(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="w-64 hidden md:block bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-4">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="flex-1 p-8">
          <LoadingSkeleton lines={6} />
        </div>
      </div>
    );
  }

  const { organization, stats, serviceQueues } = dashboardData || {};

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#F5F2EB] text-[#1C2520] dark:bg-[#131B17] dark:text-[#E8EFEA] transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar organization={organization} />

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl">
        {/* Top greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
              OPERATIONAL COMMAND
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-1 tracking-tight">
              Queue Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#59665F] dark:text-stone-400 mt-1">
              Live queue metrics and dispatching for <strong>{organization?.name}</strong>.
            </p>
          </div>

          <Link
            to="/organization/services"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Services</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 mb-6 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Stats Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Waiting Now */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 border border-stone-200/80 dark:border-stone-800 shadow-soft-float flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#59665F] dark:text-stone-400">
                Waiting Now
              </div>
              <div className="font-serif text-3xl font-normal text-[#1A231E] dark:text-white mt-1">
                {stats?.waitingNow ?? 0}
              </div>
              <div className="text-[11px] text-[#184E38] dark:text-[#A7D7BC] font-semibold mt-0.5">
                Across all active queues
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/30 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center border border-[#C5DCCF]/60 dark:border-[#2D5A43]">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Currently Serving */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 border border-stone-200/80 dark:border-stone-800 shadow-soft-float flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#59665F] dark:text-stone-400">
                Currently Serving
              </div>
              <div className="font-serif text-3xl font-normal text-[#184E38] dark:text-[#A7D7BC] mt-1">
                {stats?.currentlyServing ?? 0}
              </div>
              <div className="text-[11px] text-[#59665F] dark:text-stone-400 font-medium mt-0.5">
                At active counters
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] dark:bg-stone-800 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center border border-stone-200 dark:border-stone-700">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Open Queues */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 border border-stone-200/80 dark:border-stone-800 shadow-soft-float flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#59665F] dark:text-stone-400">
                Live Queues
              </div>
              <div className="font-serif text-3xl font-normal text-[#1A231E] dark:text-white mt-1">
                {stats?.openQueues ?? 0}
              </div>
              <div className="text-[11px] text-[#59665F] dark:text-stone-400 font-medium mt-0.5">
                Out of {stats?.totalServices ?? 0} services
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] dark:bg-stone-800 text-[#184E38] dark:text-[#A7D7BC] flex items-center justify-center border border-stone-200 dark:border-stone-700">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white dark:bg-stone-900 rounded-[24px] p-5 border border-stone-200/80 dark:border-stone-800 shadow-soft-float flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#59665F] dark:text-stone-400">
                Served Today
              </div>
              <div className="font-serif text-3xl font-normal text-emerald-700 dark:text-emerald-400 mt-1">
                {stats?.completedToday ?? 0}
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                Successfully completed
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E2EDE7] dark:bg-[#184E38]/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-[#C5DCCF]/60 dark:border-[#2D5A43]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Queues Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-normal text-[#1A231E] dark:text-white">Active Service Queues</h2>
              <p className="text-xs text-[#59665F] dark:text-stone-400 mt-0.5">
                Toggle availability or jump straight into the counter operator desk.
              </p>
            </div>
          </div>

          {serviceQueues && serviceQueues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceQueues.map((item) => (
                <ServiceQueueCard
                  key={item.service._id}
                  item={item}
                  onToggleQueue={handleToggleQueue}
                  loadingToggle={loadingToggle}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-[28px] p-12 text-center border border-stone-200/80 dark:border-stone-800 shadow-soft-float max-w-lg mx-auto">
              <Layers className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white">No Services Found</h3>
              <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1">
                You haven't configured any services yet. Create your first service to start accepting virtual queue entries.
              </p>
              <Link
                to="/organization/services"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Service</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
