import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Building2, ExternalLink, Radio } from 'lucide-react';

export const Sidebar = ({ organization }) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/organization/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Services & Queues',
      path: '/organization/services',
      icon: Layers,
    },
    {
      label: 'Organization Profile',
      path: '/organization/profile',
      icon: Building2,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 min-h-[calc(100vh-4rem)] p-4 sm:p-5 flex flex-col justify-between shrink-0 transition-colors duration-200">
      <div className="space-y-6">
        {/* Org Banner Card */}
        {organization && (
          <div className="p-4 bg-[#FAF8F3] dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/80 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3F6451] dark:text-[#A7D7BC]">
              Active Business
            </div>
            <div className="font-serif text-base font-normal text-[#1A231E] dark:text-white truncate mt-0.5">
              {organization.name}
            </div>
            {organization.slug && (
              <a
                href={`/customer/organizations/${organization.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#184E38] dark:text-[#A7D7BC] hover:underline font-semibold mt-2.5"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E2EDE7] dark:bg-[#184E38]/40 text-[#184E38] dark:text-[#E2EDE7] shadow-2xs border border-[#C5DCCF]/70 dark:border-[#2D5A43]'
                      : 'text-[#59665F] dark:text-stone-300 hover:bg-[#FAF8F3] dark:hover:bg-stone-800 hover:text-[#184E38] dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Live System Indicator */}
      <div className="p-3.5 bg-[#E2EDE7]/60 dark:bg-[#184E38]/20 border border-[#C5DCCF]/60 dark:border-[#2D5A43] rounded-2xl text-xs text-[#184E38] dark:text-[#A7D7BC] flex items-center gap-2.5">
        <Radio className="w-4 h-4 text-[#184E38] dark:text-[#A7D7BC] animate-pulse shrink-0" />
        <div>
          <div className="font-bold text-[11px] tracking-wide">Real-Time Sync Active</div>
          <div className="text-[10px] text-[#3F6451] dark:text-[#8BC5A7]">Connected to Socket.IO</div>
        </div>
      </div>
    </aside>
  );
};
