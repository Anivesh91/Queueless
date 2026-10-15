import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceApi } from '../../api/serviceApi';
import { queueApi } from '../../api/queueApi';
import { JoinQueueModal } from '../../components/customer/JoinQueueModal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Clock,
  Users,
} from 'lucide-react';

export const ServiceQueuePage = () => {
  const { serviceId } = useParams();
  const { socket, joinServiceRoom, leaveServiceRoom } = useSocket();

  const [service, setService] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [serviceRes, queueRes] = await Promise.all([
        serviceApi.getById(serviceId),
        queueApi.getPublic(serviceId),
      ]);
      setService(serviceRes?.data?.service || null);
      setQueueData(queueRes?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load service queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    joinServiceRoom(serviceId);

    return () => {
      leaveServiceRoom(serviceId);
    };
  }, [serviceId]);

  // Live Socket.IO Updates
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = () => {
      fetchData();
    };

    const handleStatusChanged = () => {
      fetchData();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('queue:statusChanged', handleStatusChanged);

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('queue:statusChanged', handleStatusChanged);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <LoadingSkeleton lines={5} />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-normal text-[#1A231E] dark:text-white">Service Not Found</h2>
        <p className="text-xs text-[#59665F] dark:text-stone-400 mt-2">{error || 'This service is inactive or not found.'}</p>
        <Link
          to="/customer"
          className="inline-block mt-6 px-5 py-2.5 bg-[#184E38] hover:bg-[#123E2C] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
        >
          Browse All Queues
        </Link>
      </div>
    );
  }

  const isOpen = queueData?.status === 'OPEN';
  const waitingCount = queueData?.waitingCount || 0;
  const avgTime = service.averageServiceTime || 10;
  const estWait = waitingCount * avgTime;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      {service.organizationId?.slug ? (
        <Link
          to={`/customer/organizations/${service.organizationId.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59665F] dark:text-stone-400 hover:text-[#184E38] dark:hover:text-[#A7D7BC] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {service.organizationId.name || 'Organization'}</span>
        </Link>
      ) : (
        <Link
          to="/customer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59665F] dark:text-stone-400 hover:text-[#184E38] dark:hover:text-[#A7D7BC] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      )}

      {/* Main Service Card */}
      <div className="bg-white dark:bg-stone-900 rounded-[32px] p-8 sm:p-10 border border-stone-200/80 dark:border-stone-800 shadow-soft-float transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/60 dark:border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#FAF8F3] dark:bg-stone-800 text-[#184E38] dark:text-[#A7D7BC] rounded-lg border border-stone-200 dark:border-stone-700">
                Prefix: {service.ticketPrefix}
              </span>
              <Badge status={isOpen ? 'OPEN' : 'CLOSED'} size="md" />
            </div>
            <h1 className="font-serif text-3xl font-normal text-[#1A231E] dark:text-white">
              {service.name}
            </h1>
            {service.organizationId?.name && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#59665F] dark:text-stone-400 mt-1">
                <Building2 className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
                <span>{service.organizationId.name}</span>
              </div>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-sm text-[#59665F] dark:text-stone-300 my-6 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Live Metrics Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8 p-5 bg-[#FAF8F3] dark:bg-stone-800/60 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-center">
          <div>
            <div className="text-[10px] font-bold text-[#59665F] dark:text-stone-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
              <span>Waiting</span>
            </div>
            <div className="font-serif text-3xl font-normal text-[#1A231E] dark:text-white mt-1">{waitingCount}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#59665F] dark:text-stone-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D95D39] dark:text-[#F8A084]" />
              <span>Est. Wait</span>
            </div>
            <div className="font-serif text-3xl font-normal text-[#184E38] dark:text-[#A7D7BC] mt-1">
              {waitingCount > 0 ? `~${estWait}m` : '0m'}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-[#59665F] dark:text-stone-400 uppercase tracking-wider">Turn Avg</div>
            <div className="font-serif text-3xl font-normal text-[#1A231E] dark:text-white mt-1">{avgTime}m</div>
          </div>
        </div>

        {/* Join CTA */}
        <div className="pt-2">
          {isOpen ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 text-base"
              onClick={() => setIsJoinModalOpen(true)}
            >
              <span>Join Virtual Queue Now</span>
              <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
          ) : (
            <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-2xl text-center text-xs text-stone-500 font-medium">
              This service queue is currently CLOSED. Please check back when the operator opens it.
            </div>
          )}
        </div>
      </div>

      <JoinQueueModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        service={service}
      />
    </div>
  );
};
