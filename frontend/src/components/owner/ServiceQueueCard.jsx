import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { PlayCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export const ServiceQueueCard = ({ item, onToggleQueue, loadingToggle }) => {
  const { service, status, waitingCount, currentTicket, completedToday } = item;
  const isOpen = status === 'OPEN';

  return (
    <div className="bg-white dark:bg-stone-900 rounded-[24px] border border-stone-200/80 dark:border-stone-800 p-6 shadow-soft-float hover:shadow-soft-lift transition-all flex flex-col justify-between">
      <div>
        {/* Service Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 font-mono text-xs font-bold bg-[#FAF8F3] dark:bg-stone-800 text-[#184E38] dark:text-[#A7D7BC] rounded-lg border border-stone-200 dark:border-stone-700">
              {service.ticketPrefix}
            </span>
            <h3 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white">{service.name}</h3>
          </div>
          <Badge status={isOpen ? 'OPEN' : 'CLOSED'} />
        </div>

        {service.description && (
          <p className="text-xs text-[#59665F] dark:text-stone-400 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3.5 bg-[#FAF8F3] dark:bg-stone-800/60 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-center mb-5">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#59665F] dark:text-stone-400">Waiting</div>
            <div className="text-base font-bold text-[#1A231E] dark:text-white mt-0.5">{waitingCount}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#59665F] dark:text-stone-400">Serving</div>
            <div className="text-sm font-bold text-[#184E38] dark:text-[#A7D7BC] mt-0.5 truncate font-mono">
              {currentTicket ? currentTicket.ticketNumber : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#59665F] dark:text-stone-400">Served Today</div>
            <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{completedToday || 0}</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 flex items-center gap-2 border-t border-stone-200/60 dark:border-stone-800">
        <button
          onClick={() => onToggleQueue(service._id, isOpen)}
          disabled={loadingToggle === service._id}
          className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 ${
            isOpen
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              : 'bg-[#E2EDE7] text-[#184E38] border-[#C5DCCF] hover:bg-[#C5DCCF]'
          }`}
        >
          {isOpen ? (
            <>
              <ToggleRight className="w-4 h-4 text-rose-600" />
              <span>Close Queue</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-[#184E38]" />
              <span>Open Queue</span>
            </>
          )}
        </button>

        <Link
          to={`/organization/queues/${service._id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#184E38] hover:bg-[#123E2C] rounded-xl shadow-2xs transition-all active:scale-98"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Operator Desk</span>
        </Link>
      </div>
    </div>
  );
};
