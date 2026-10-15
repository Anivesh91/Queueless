import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { queueApi } from '../../api/queueApi';
import { User, Phone, AlertCircle, Ticket, Clock, ShieldCheck } from 'lucide-react';

export const JoinQueueModal = ({ isOpen, onClose, service }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!service) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please enter a valid phone number (minimum 7 digits).');
      return;
    }

    try {
      setLoading(true);
      const res = await queueApi.join(service._id, {
        name: name.trim(),
        phone: phone.trim(),
      });

      const data = res?.data;
      const publicToken = data?.publicToken || data?.ticket?.publicToken;

      if (publicToken) {
        try {
          const saved = JSON.parse(localStorage.getItem('queueless_active_tickets') || '[]');
          const filtered = saved.filter((t) => t.publicToken !== publicToken);
          filtered.unshift({
            publicToken,
            ticketNumber: data.ticket?.ticketNumber,
            serviceName: service.name,
            organizationName: data.ticket?.organizationName || service.organizationId?.name,
            status: data.ticket?.status || 'WAITING',
            joinedAt: data.ticket?.joinedAt || new Date().toISOString(),
          });
          localStorage.setItem('queueless_active_tickets', JSON.stringify(filtered.slice(0, 5)));
        } catch (storageErr) {
          console.warn('Storage error:', storageErr);
        }

        onClose();
        navigate(`/customer/tickets/${publicToken}`);
      } else {
        throw new Error('Could not retrieve ticket token. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to join queue. Please check service status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Virtual Queue">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Highlight */}
        <div className="p-4 bg-[#FAF8F3] dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/80 rounded-2xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#3F6451] dark:text-[#A7D7BC]">
            Selected Service
          </div>
          <div className="font-serif text-lg font-normal text-[#1A231E] dark:text-white mt-0.5">
            {service.name}
          </div>
          <div className="flex items-center gap-4 text-xs text-[#59665F] dark:text-stone-300 mt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
              Prefix: <strong className="font-mono text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7] dark:bg-[#184E38]/40 px-1.5 py-0.5 rounded">{service.ticketPrefix}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D95D39] dark:text-[#F8A084]" />
              Avg wait: ~{service.averageServiceTime || 10}m
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
            Your Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aman Sharma"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Customer Phone */}
        <div>
          <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
            Mobile Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-[#59665F] dark:text-stone-400 mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC] shrink-0" />
            <span>Used only for your live turn chime. Zero spam.</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200/60 dark:border-stone-800">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Get Virtual Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
