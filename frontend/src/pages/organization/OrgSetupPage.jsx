import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { serviceApi } from '../../api/serviceApi';
import { Button } from '../../components/common/Button';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'HOSPITAL_CLINIC', label: 'Hospital & Clinic' },
  { id: 'SALON_BARBER', label: 'Salon & Barber' },
  { id: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' },
  { id: 'REPAIR_SERVICE_CENTER', label: 'Repair & Service Center' },
  { id: 'CONSULTATION_CENTER', label: 'Consultation Center' },
  { id: 'OTHER', label: 'Other Service' },
];

export const OrgSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [orgData, setOrgData] = useState({
    name: '',
    category: 'HOSPITAL_CLINIC',
    city: '',
    address: '',
    phone: '',
    description: '',
  });

  const [serviceData, setServiceData] = useState({
    name: '',
    ticketPrefix: 'A',
    averageServiceTime: 10,
    description: '',
  });

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!orgData.name.trim()) {
      setError('Organization name is required.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinishSetup = async (e) => {
    e.preventDefault();
    setError('');

    if (!serviceData.name.trim()) {
      setError('First service name is required.');
      return;
    }

    if (!serviceData.ticketPrefix.trim()) {
      setError('Ticket prefix is required (e.g. A, GC, D).');
      return;
    }

    try {
      setLoading(true);

      const orgRes = await orgApi.create({
        name: orgData.name.trim(),
        category: orgData.category,
        city: orgData.city.trim(),
        address: orgData.address.trim(),
        phone: orgData.phone.trim(),
        description: orgData.description.trim(),
      });

      const newOrg = orgRes?.data?.organization;

      if (newOrg?._id) {
        await serviceApi.create(newOrg._id, {
          name: serviceData.name.trim(),
          ticketPrefix: serviceData.ticketPrefix.toUpperCase().trim(),
          averageServiceTime: Number(serviceData.averageServiceTime) || 10,
          description: serviceData.description.trim(),
        });
      }

      navigate('/organization/dashboard');
    } catch (err) {
      setError(err.message || 'Setup failed. Please review your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F2EB] dark:bg-[#131B17] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1
                  ? 'bg-[#184E38] text-white shadow-2xs'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
              }`}
            >
              1
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= 1 ? 'text-[#184E38] dark:text-[#A7D7BC]' : 'text-stone-400'
              }`}
            >
              Organization Details
            </span>
          </div>
          <div className="w-12 h-0.5 bg-stone-200 dark:bg-stone-800" />
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 2
                  ? 'bg-[#184E38] text-white shadow-2xs'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= 2 ? 'text-[#184E38] dark:text-[#A7D7BC]' : 'text-stone-400'
              }`}
            >
              First Service Queue
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-[32px] p-8 sm:p-10 border border-stone-200/80 dark:border-stone-800 shadow-soft-float transition-colors duration-200">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 mb-6 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: ORGANIZATION INFO */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="border-b border-stone-200/60 dark:border-stone-800 pb-4 mb-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
                  <span>ONBOARDING STEP 1 OF 2</span>
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A231E] dark:text-white mt-1">
                  Set up your Organization
                </h2>
                <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1">
                  Enter your business details so customers can discover and identify your queues.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                  Business / Organization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orgData.name}
                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                  placeholder="e.g. CityCare Health Clinic"
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-300 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                  Business Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={orgData.category}
                  onChange={(e) => setOrgData({ ...orgData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">City</label>
                  <input
                    type="text"
                    value={orgData.city}
                    onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    value={orgData.phone}
                    onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">Address / Landmark</label>
                <input
                  type="text"
                  value={orgData.address}
                  onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                  placeholder="e.g. 42 Park Avenue, Suite 101"
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">About / Description</label>
                <textarea
                  rows={2}
                  value={orgData.description}
                  onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                  placeholder="Brief summary of services and operating details..."
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" size="lg">
                  <span>Continue to Service Setup</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: FIRST SERVICE INFO */}
          {step === 2 && (
            <form onSubmit={handleFinishSetup} className="space-y-4">
              <div className="border-b border-stone-200/60 dark:border-stone-800 pb-4 mb-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
                  <span>ONBOARDING STEP 2 OF 2</span>
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A231E] dark:text-white mt-1">
                  Add your First Service Queue
                </h2>
                <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1">
                  Each service gets its own real-time queue. You can configure more counters later.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceData.name}
                  onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                  placeholder="e.g. General Consultation / Haircut"
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 placeholder:text-stone-300 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                    Ticket Prefix <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={serviceData.ticketPrefix}
                    onChange={(e) => setServiceData({ ...serviceData, ticketPrefix: e.target.value.toUpperCase() })}
                    placeholder="e.g. GC, A, DOC"
                    className="w-full px-4 py-2.5 font-mono uppercase bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                  />
                  <p className="text-[10px] text-[#59665F] dark:text-stone-400 mt-1">
                    Tickets will appear as {serviceData.ticketPrefix || 'A'}-001, {serviceData.ticketPrefix || 'A'}-002.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                    Avg. Service Time (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    required
                    value={serviceData.averageServiceTime}
                    onChange={(e) => setServiceData({ ...serviceData, averageServiceTime: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">Service Description</label>
                <textarea
                  rows={2}
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                  placeholder="Optional description of this service..."
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep(1)} disabled={loading}>
                  Back to Org Details
                </Button>
                <Button type="submit" variant="primary" size="lg" loading={loading}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Complete Setup & Open Dashboard</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
