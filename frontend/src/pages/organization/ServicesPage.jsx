import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { serviceApi } from '../../api/serviceApi';
import { Sidebar } from '../../components/owner/Sidebar';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

export const ServicesPage = () => {
  const [organization, setOrganization] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    ticketPrefix: '',
    averageServiceTime: 10,
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orgApi.getMe();
      const org = res?.data?.organization;
      if (org) {
        setOrganization(org);
        const srvRes = await serviceApi.getByOrg(org._id);
        setServices(srvRes?.data?.services || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: '',
      ticketPrefix: '',
      averageServiceTime: 10,
      description: '',
    });
    setModalError('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      ticketPrefix: service.ticketPrefix || '',
      averageServiceTime: service.averageServiceTime || 10,
      description: service.description || '',
    });
    setModalError('');
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim()) {
      setModalError('Service name is required.');
      return;
    }
    if (!formData.ticketPrefix.trim()) {
      setModalError('Ticket prefix is required (e.g. A, B, GC).');
      return;
    }

    try {
      setModalLoading(true);
      await serviceApi.create({
        name: formData.name.trim(),
        ticketPrefix: formData.ticketPrefix.trim().toUpperCase(),
        averageServiceTime: Number(formData.averageServiceTime) || 10,
        description: formData.description.trim(),
      });
      setIsCreateModalOpen(false);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Failed to create service.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim()) {
      setModalError('Service name is required.');
      return;
    }
    if (!formData.ticketPrefix.trim()) {
      setModalError('Ticket prefix is required.');
      return;
    }

    try {
      setModalLoading(true);
      await serviceApi.update(editingService._id, {
        name: formData.name.trim(),
        ticketPrefix: formData.ticketPrefix.trim().toUpperCase(),
        averageServiceTime: Number(formData.averageServiceTime) || 10,
        description: formData.description.trim(),
      });
      setEditingService(null);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Failed to update service.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeactivate = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to deactivate service "${serviceName}"? New customers won't be able to join.`)) {
      return;
    }

    try {
      await serviceApi.deactivate(serviceId);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to deactivate service.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#F5F2EB] dark:bg-[#131B17]">
        <div className="w-64 hidden md:block bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-4">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="flex-1 p-8">
          <LoadingSkeleton lines={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#F5F2EB] text-[#1C2520] dark:bg-[#131B17] dark:text-[#E8EFEA] transition-colors duration-200">
      <Sidebar organization={organization} />

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
              SERVICE DIRECTORY
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-1 tracking-tight">
              Service Management
            </h1>
            <p className="text-xs sm:text-sm text-[#59665F] dark:text-stone-400 mt-1">
              Configure services, ticket prefixes, and wait estimates for <strong>{organization?.name}</strong>.
            </p>
          </div>

          <Button variant="primary" onClick={openCreateModal}>
            <PlusCircle className="w-4 h-4" />
            <span>Add New Service</span>
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 mb-6 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Services List Table */}
        {services.length > 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-[28px] border border-stone-200/80 dark:border-stone-800 shadow-soft-float overflow-hidden transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#37433C] dark:text-stone-300">
                <thead className="bg-[#FAF8F3] dark:bg-stone-800/60 text-[10px] uppercase font-bold tracking-wider text-[#59665F] dark:text-stone-400 border-b border-stone-200/60 dark:border-stone-800">
                  <tr>
                    <th className="px-6 py-4">Prefix</th>
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Avg Duration</th>
                    <th className="px-6 py-4">Queue Status</th>
                    <th className="px-6 py-4">State</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {services.map((service) => {
                    const queue = service.queue || { status: 'CLOSED' };
                    return (
                      <tr key={service._id} className="hover:bg-[#FAF8F3]/80 dark:hover:bg-stone-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-[#1A231E] dark:text-white">
                          <span className="px-2.5 py-1 bg-[#E2EDE7] dark:bg-[#184E38]/30 text-[#184E38] dark:text-[#A7D7BC] rounded-lg border border-[#C5DCCF]/60 dark:border-[#2D5A43]">
                            {service.ticketPrefix}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-serif text-base font-normal text-[#1A231E] dark:text-white">{service.name}</div>
                          {service.description && (
                            <div className="text-[11px] text-[#59665F] dark:text-stone-400 mt-0.5 line-clamp-1">
                              {service.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#59665F] dark:text-stone-400">
                          ~{service.averageServiceTime || 10} min
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={queue.status || 'CLOSED'} size="sm" />
                        </td>
                        <td className="px-6 py-4">
                          {service.isActive ? (
                            <span className="text-[11px] font-semibold text-[#184E38] dark:text-[#A7D7BC]">Active</span>
                          ) : (
                            <span className="text-[11px] font-semibold text-stone-400">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/organization/queues/${service._id}`}
                              className="p-2 text-[#184E38] dark:text-[#A7D7BC] hover:bg-[#E2EDE7] dark:hover:bg-[#184E38]/40 rounded-xl transition-colors"
                              title="Open Operator Console"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openEditModal(service)}
                              className="p-2 text-[#59665F] dark:text-stone-400 hover:bg-[#FAF8F3] dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {service.isActive && (
                              <button
                                onClick={() => handleDeactivate(service._id, service.name)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Deactivate Service"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 rounded-[28px] p-12 text-center border border-stone-200/80 dark:border-stone-800 shadow-soft-float max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white">No Services Added</h3>
            <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1 mb-5">
              Add your first service to start accepting customer queue joins.
            </p>
            <Button variant="primary" onClick={openCreateModal}>
              Create Service
            </Button>
          </div>
        )}

        {/* CREATE SERVICE MODAL */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Service Queue"
        >
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs mb-4 shadow-2xs">
              {modalError}
            </div>
          )}
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                Service Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Consultation / Haircut / Checkup"
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                  Prefix (e.g. D, GC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={formData.ticketPrefix}
                  onChange={(e) => setFormData({ ...formData, ticketPrefix: e.target.value.toUpperCase() })}
                  placeholder="D"
                  className="w-full px-4 py-2.5 font-mono uppercase bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                  Avg Time (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  required
                  value={formData.averageServiceTime}
                  onChange={(e) => setFormData({ ...formData, averageServiceTime: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional service notes for customers..."
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-300 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-stone-200/60 dark:border-stone-800">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={modalLoading}>
                Create Service
              </Button>
            </div>
          </form>
        </Modal>

        {/* EDIT SERVICE MODAL */}
        <Modal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          title="Edit Service"
        >
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs mb-4 shadow-2xs">
              {modalError}
            </div>
          )}
          <form onSubmit={handleUpdateService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                Service Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                  Prefix (Unique) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={formData.ticketPrefix}
                  onChange={(e) => setFormData({ ...formData, ticketPrefix: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 font-mono uppercase bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                  Avg Time (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  required
                  value={formData.averageServiceTime}
                  onChange={(e) => setFormData({ ...formData, averageServiceTime: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-stone-200/60 dark:border-stone-800">
              <Button variant="secondary" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={modalLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
