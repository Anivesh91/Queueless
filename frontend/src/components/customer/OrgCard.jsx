import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Layers, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const OrgCard = ({ organization }) => {
  const categoryLabels = {
    HOSPITAL_CLINIC: 'Hospital & Clinic',
    SALON_BARBER: 'Salon & Barber',
    DIAGNOSTIC_CENTER: 'Diagnostic Center',
    REPAIR_SERVICE_CENTER: 'Repair Center',
    CONSULTATION_CENTER: 'Consultation',
    OTHER: 'General Service',
  };

  const openQueues = organization.openQueuesCount || 0;
  const totalServices = organization.servicesCount || (organization.services ? organization.services.length : 0);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-[24px] p-6 border border-stone-200/80 dark:border-stone-800 shadow-soft-float hover:shadow-soft-lift transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header with Category Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-[10px] font-bold tracking-wider text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7] dark:bg-[#184E38]/30 px-2.5 py-1 rounded-full border border-[#C5DCCF]/60 dark:border-[#2D5A43] uppercase">
            {categoryLabels[organization.category] || organization.category}
          </span>
          {openQueues > 0 ? (
            <Badge status="OPEN" text={`${openQueues} Live`} size="sm" />
          ) : (
            <Badge status="CLOSED" text="Paused" size="sm" />
          )}
        </div>

        {/* Name in Newsreader Editorial Serif */}
        <h3 className="font-serif text-xl font-normal text-[#1A231E] dark:text-white group-hover:text-[#184E38] dark:group-hover:text-[#A7D7BC] transition-colors mb-2">
          {organization.name}
        </h3>

        {/* Description */}
        {organization.description && (
          <p className="text-xs text-[#59665F] dark:text-stone-400 line-clamp-2 mb-4 leading-relaxed">
            {organization.description}
          </p>
        )}

        {/* City & Address */}
        <div className="space-y-1.5 text-xs text-[#59665F] dark:text-stone-400 mb-6">
          {organization.city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#184E38] dark:text-[#A7D7BC] shrink-0" />
              <span>{organization.city}</span>
              {organization.address && <span>• {organization.address}</span>}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
            <span>{totalServices} {totalServices === 1 ? 'queue available' : 'queues available'}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA Button */}
      <Link
        to={`/customer/organizations/${organization.slug}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#184E38] dark:text-[#A7D7BC] bg-[#E2EDE7]/70 dark:bg-[#184E38]/30 hover:bg-[#184E38] hover:text-white dark:hover:bg-[#184E38] dark:hover:text-white rounded-xl transition-all duration-200 border border-[#C5DCCF]/60 dark:border-[#2D5A43] group-hover:shadow-2xs active:scale-98"
      >
        <span>View Queues & Wait Time</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
