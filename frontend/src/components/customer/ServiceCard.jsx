import React from 'react';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ServiceCard = ({ service, onJoinClick }) => {
  const queue = service.queue || { status: 'CLOSED' };
  const isOpen = queue.status === 'OPEN';
  const waitingCount = service.waitingCount || 0;
  const avgTime = service.averageServiceTime || 10;
  const estimatedWait = waitingCount * avgTime;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-[24px] p-6 border border-stone-200/80 dark:border-stone-800 shadow-soft-float hover:shadow-soft-lift transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#FAF8F3] dark:bg-stone-800 text-[#184E38] dark:text-[#A7D7BC] rounded-lg border border-stone-200 dark:border-stone-700">
              {service.ticketPrefix}
            </span>
            <h4 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white">{service.name}</h4>
          </div>
          <Badge status={isOpen ? 'OPEN' : 'CLOSED'} />
        </div>

        {service.description && (
          <p className="text-xs text-[#59665F] dark:text-stone-400 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 my-4 p-3.5 bg-[#FAF8F3] dark:bg-stone-800/60 rounded-2xl border border-stone-200/60 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2.5 text-[#37433C] dark:text-stone-300">
            <Users className="w-4 h-4 text-[#184E38] dark:text-[#A7D7BC]" />
            <div>
              <div className="text-[10px] text-[#59665F] dark:text-stone-400 font-semibold tracking-wider uppercase">WAITING</div>
              <div className="font-bold text-[#1A231E] dark:text-white">{waitingCount} people</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[#37433C] dark:text-stone-300">
            <Clock className="w-4 h-4 text-[#D95D39] dark:text-[#F8A084]" />
            <div>
              <div className="text-[10px] text-[#59665F] dark:text-stone-400 font-semibold tracking-wider uppercase">EST. WAIT</div>
              <div className="font-bold text-[#1A231E] dark:text-white">
                {waitingCount > 0 ? `~${estimatedWait} min` : 'No wait'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {isOpen ? (
          <Button
            variant="primary"
            className="w-full justify-between"
            onClick={() => onJoinClick(service)}
          >
            <span>Join This Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="secondary" disabled className="w-full opacity-60">
            Queue Currently Closed
          </Button>
        )}
      </div>
    </div>
  );
};
