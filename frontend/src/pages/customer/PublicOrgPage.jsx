import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { JoinQueueModal } from '../../components/customer/JoinQueueModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import {
  MapPin,
  Phone,
  ArrowLeft,
  Layers,
  AlertCircle,
  Radio,
} from 'lucide-react';

export const PublicOrgPage = () => {
  const { slug } = useParams();
  const { socket } = useSocket();

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServiceForJoin, setSelectedServiceForJoin] = useState(null);

  const fetchOrganization = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError('');
      const res = await orgApi.getBySlug(slug);
      setOrganization(res?.data?.organization || null);
    } catch (err) {
      if (!isBackground) setError(err.message || 'Failed to load organization profile.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchOrganization(false);
  }, [slug, fetchOrganization]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = (payload) => {
      setOrganization((prev) => {
        if (!prev || !prev.services) return prev;
        const updatedServices = prev.services.map((srv) => {
          if (srv._id === payload.serviceId) {
            return {
              ...srv,
              queue: {
                ...(srv.queue || {}),
                status: payload.status,
              },
            };
          }
          return srv;
        });
        return { ...prev, services: updatedServices };
      });
      fetchOrganization(true);
    };

    const handleQueueUpdated = (payload) => {
      setOrganization((prev) => {
        if (!prev || !prev.services) return prev;
        const updatedServices = prev.services.map((srv) => {
          if (srv._id === payload.serviceId) {
            return {
              ...srv,
              waitingCount: payload.waitingCount !== undefined ? payload.waitingCount : srv.waitingCount,
              queue: {
                ...(srv.queue || {}),
                status: payload.status || srv.queue?.status,
              },
            };
          }
          return srv;
        });
        return { ...prev, services: updatedServices };
      });
      fetchOrganization(true);
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('queue:statusChanged', handleStatusChanged);
    socket.on('connect', () => fetchOrganization(true));

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('queue:statusChanged', handleStatusChanged);
    };
  }, [socket, fetchOrganization]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-normal text-[#1A231E] dark:text-white">Organization Not Found</h2>
        <p className="text-xs text-[#59665F] dark:text-stone-400 mt-2">{error || 'This organization does not exist or is inactive.'}</p>
        <Link
          to="/customer"
          className="inline-block mt-6 px-5 py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
        >
          Return to Queue Finder
        </Link>
      </div>
    );
  }

  const categoryLabels = {
    HOSPITAL_CLINIC: 'Hospital & Clinic',
    SALON_BARBER: 'Salon & Barber',
    DIAGNOSTIC_CENTER: 'Diagnostic Center',
    REPAIR_SERVICE_CENTER: 'Repair & Service Center',
    CONSULTATION_CENTER: 'Consultation Center',
    OTHER: 'General Service',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <Link
        to="/customer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59665F] dark:text-stone-400 hover:text-[#184E38] dark:hover:text-[#A7D7BC] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Queue Directory</span>
      </Link>

      {/* Organization Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/80 dark:border-stone-800 shadow-soft-float mb-10 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7] dark:bg-[#184E38]/30 px-3 py-1 rounded-full border border-[#C5DCCF]/60 dark:border-[#2D5A43] uppercase tracking-wider">
              {categoryLabels[organization.category] || organization.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-3">
              {organization.name}
            </h1>
            {organization.description && (
              <p className="text-sm text-[#59665F] dark:text-stone-300 mt-2 max-w-2xl leading-relaxed">
                {organization.description}
              </p>
            )}

            {/* Location & Phone */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#59665F] dark:text-stone-400 mt-5">
              {organization.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
                  <span>
                    {organization.city} {organization.address && `— ${organization.address}`}
                  </span>
                </div>
              )}
              {organization.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
                  <span>{organization.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services and Queues Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
              SELECT A SERVICE
            </span>
            <h2 className="font-serif text-2xl font-normal text-[#1A231E] dark:text-white mt-1">Available Service Queues</h2>
            <p className="text-xs text-[#59665F] dark:text-stone-400 mt-0.5">
              Select a queue below to join remotely with just your name and phone.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7]/70 dark:bg-[#184E38]/30 px-3.5 py-1.5 rounded-full border border-[#C5DCCF]/60 dark:border-[#2D5A43]">
            {organization.services?.length || 0} Available
          </span>
        </div>

        {organization.services && organization.services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organization.services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onJoinClick={(srv) => setSelectedServiceForJoin(srv)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 text-center border border-stone-200/80 dark:border-stone-800 shadow-soft-float">
            <Layers className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <h3 className="font-serif text-base font-normal text-[#1A231E] dark:text-white">No Services Available</h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1">
              This organization does not currently have any active queues open.
            </p>
          </div>
        )}
      </div>

      {/* Join Queue Modal */}
      <JoinQueueModal
        isOpen={!!selectedServiceForJoin}
        onClose={() => setSelectedServiceForJoin(null)}
        service={selectedServiceForJoin}
      />
    </div>
  );
};
