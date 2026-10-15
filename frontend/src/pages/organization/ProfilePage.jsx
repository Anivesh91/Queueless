import React, { useState, useEffect } from 'react';
import { orgApi } from '../../api/orgApi';
import { Sidebar } from '../../components/owner/Sidebar';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'HOSPITAL_CLINIC', label: 'Hospital & Clinic' },
  { id: 'SALON_BARBER', label: 'Salon & Barber' },
  { id: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' },
  { id: 'REPAIR_SERVICE_CENTER', label: 'Repair & Service Center' },
  { id: 'CONSULTATION_CENTER', label: 'Consultation Center' },
  { id: 'OTHER', label: 'Other Service' },
];

export const ProfilePage = () => {
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'OTHER',
    city: '',
    address: '',
    phone: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await orgApi.getMe();
      const org = res?.data?.organization;
      if (org) {
        setOrganization(org);
        setFormData({
          name: org.name || '',
          category: org.category || 'OTHER',
          city: org.city || '',
          address: org.address || '',
          phone: org.phone || '',
          description: org.description || '',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load organization profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSaving(true);
      await orgApi.update(organization._id, formData);
      setSuccessMsg('Organization profile updated successfully.');
      await fetchProfile();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = organization?.slug
    ? `${window.location.origin}/customer/organizations/${organization.slug}`
    : '';

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#F5F2EB] dark:bg-[#131B17]">
        <div className="w-64 hidden md:block bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-4">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="flex-1 p-8">
          <LoadingSkeleton lines={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#F5F2EB] text-[#1C2520] dark:bg-[#131B17] dark:text-[#E8EFEA] transition-colors duration-200">
      <Sidebar organization={organization} />

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-4xl">
        <div className="mb-8">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#3F6451] dark:text-[#A7D7BC] uppercase">
            BRAND & PROFILE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A231E] dark:text-white mt-1 tracking-tight">
            Organization Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#59665F] dark:text-stone-400 mt-1">
            Update your business identity, location, and shareable customer queue link.
          </p>
        </div>

        {/* Public Link Card */}
        {organization?.slug && (
          <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-[24px] shadow-soft-float mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#3F6451] dark:text-[#A7D7BC] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC]" />
                <span>Your Customer Storefront Link</span>
              </div>
              <div className="text-xs text-[#184E38] dark:text-[#A7D7BC] font-mono mt-1 break-all select-all font-semibold">
                {publicUrl}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 text-xs font-semibold text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7] dark:bg-[#184E38]/30 border border-[#C5DCCF]/70 dark:border-[#2D5A43] rounded-xl hover:bg-[#C5DCCF] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#184E38] hover:bg-[#123E2C] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <span>Visit Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-stone-900 rounded-[28px] p-8 border border-stone-200/80 dark:border-stone-800 shadow-soft-float transition-colors duration-200">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 mb-6 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 mb-6 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Shop 4, Galleria Mall"
                className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#37433C] dark:text-stone-300 mb-1.5">About / Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief introduction for your customer queue page..."
                className="w-full px-4 py-2.5 bg-[#FAF8F3] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-[#1A231E] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-[#184E38] focus:ring-2 focus:ring-[#184E38]/20 transition-all shadow-2xs"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" loading={saving}>
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Profile Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
