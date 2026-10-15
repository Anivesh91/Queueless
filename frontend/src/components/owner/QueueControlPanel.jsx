import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  PhoneCall,
  Play,
  CheckCircle2,
  UserX,
  ToggleLeft,
  ToggleRight,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const QueueControlPanel = ({
  service,
  queue,
  currentTicket,
  waitingCount,
  onToggleQueue,
  onCallNext,
  onStartServing,
  onComplete,
  onNoShow,
  actionLoading,
}) => {
  const isOpen = queue?.status === 'OPEN';
  const hasActiveCurrent = currentTicket && ['CALLED', 'SERVING'].includes(currentTicket.status);
  const isCalled = currentTicket && currentTicket.status === 'CALLED';
  const isServing = currentTicket && currentTicket.status === 'SERVING';

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Toggle */}
      <div className="bg-white dark:bg-stone-900 rounded-[28px] p-6 border border-stone-200/80 dark:border-stone-800 shadow-soft-float flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono px-3 py-1 bg-[#FAF8F3] dark:bg-stone-800 text-[#184E38] dark:text-[#A7D7BC] text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700">
              {service.ticketPrefix}
            </span>
            <h2 className="font-serif text-2xl font-normal text-[#1A231E] dark:text-white">{service.name}</h2>
            <Badge status={isOpen ? 'OPEN' : 'CLOSED'} size="md" />
          </div>
          <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1.5">
            {isOpen
              ? 'Queue is OPEN and actively accepting new guest entries.'
              : 'Queue is CLOSED. Existing waiting customers can still be processed.'}
          </p>
        </div>

        <Button
          variant={isOpen ? 'danger' : 'primary'}
          size="md"
          loading={actionLoading === 'toggleQueue'}
          onClick={onToggleQueue}
          className="shrink-0"
        >
          {isOpen ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Close Queue</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Open Queue</span>
            </>
          )}
        </Button>
      </div>

      {/* Active Operational Station Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Active Customer */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-[28px] p-6 sm:p-7 border border-stone-200/80 dark:border-stone-800 shadow-soft-float flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#59665F] dark:text-stone-400">
                Current Operational Station
              </span>
              {currentTicket ? (
                <Badge status={currentTicket.status} size="md" />
              ) : (
                <span className="text-xs text-stone-400 font-medium">Counter Idle</span>
              )}
            </div>

            {currentTicket && ['CALLED', 'SERVING'].includes(currentTicket.status) ? (
              <div className="space-y-4">
                {/* Big Ticket Display */}
                <div className="flex items-center justify-between p-5 bg-[#FAF8F3] dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/80 rounded-2xl">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#3F6451] dark:text-[#A7D7BC]">
                      Ticket Number
                    </div>
                    <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#184E38] dark:text-[#A7D7BC] mt-1">
                      {currentTicket.ticketNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#59665F] dark:text-stone-400">Customer</div>
                    <div className="text-base font-bold text-[#1A231E] dark:text-white mt-0.5">
                      {currentTicket.customerName}
                    </div>
                    <div className="text-xs text-[#59665F] dark:text-stone-400 font-mono">
                      {currentTicket.customerPhone}
                    </div>
                  </div>
                </div>

                {/* Status Specific Information */}
                {isCalled && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Customer has been <strong>CALLED</strong>. Audio chime sent to their phone.
                    </span>
                  </div>
                )}

                {isServing && (
                  <div className="p-3.5 bg-[#E2EDE7] border border-[#C5DCCF] rounded-xl text-[#184E38] text-xs flex items-center gap-2.5">
                    <Clock className="w-4 h-4 shrink-0 text-[#184E38]" />
                    <span>
                      Currently <strong>SERVING</strong>. Click complete when service finishes.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-14 text-center text-stone-400">
                <User className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
                <div className="font-serif text-lg font-normal text-[#1A231E] dark:text-white">Counter is currently free</div>
                <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1">
                  Click "Call Next Customer" to notify the next person in line.
                </p>
              </div>
            )}
          </div>

          {/* Action buttons for current ticket */}
          <div className="pt-6 border-t border-stone-200/60 dark:border-stone-800 mt-6 flex flex-wrap items-center gap-3">
            {isCalled && (
              <>
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={actionLoading === 'startServing'}
                  onClick={() => onStartServing(currentTicket._id)}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Serving</span>
                </Button>
                <Button
                  variant="danger"
                  className="px-4"
                  loading={actionLoading === 'markNoShow'}
                  onClick={() => onNoShow(currentTicket._id)}
                >
                  <UserX className="w-4 h-4" />
                  <span>No Show</span>
                </Button>
              </>
            )}

            {isServing && (
              <Button
                variant="success"
                className="w-full py-3 text-base"
                loading={actionLoading === 'complete'}
                onClick={() => onComplete(currentTicket._id)}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark Completed & Next</span>
              </Button>
            )}

            {!hasActiveCurrent && (
              <div className="w-full text-center text-xs text-[#59665F] dark:text-stone-400">
                Ready to dispatch next ticket in line
              </div>
            )}
          </div>
        </div>

        {/* Next in Line / Dispatch Console Card */}
        <div className="lg:col-span-5 bg-[#184E38] text-white rounded-[28px] p-6 sm:p-7 shadow-soft-lift flex flex-col justify-between border border-[#2D5A43]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5DCCF]">
                Queue Dispatcher
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
                {waitingCount} Waiting
              </span>
            </div>

            <div className="space-y-4 my-6">
              <div className="text-center py-4">
                <div className="text-[#C5DCCF] text-xs font-semibold uppercase tracking-wider">
                  Customers in Queue
                </div>
                <div className="font-serif text-6xl font-normal text-white mt-1">
                  {waitingCount}
                </div>
                <div className="text-xs text-[#E2EDE7] mt-2">
                  Est. remaining time: ~{waitingCount * (service.averageServiceTime || 10)} mins
                </div>
              </div>

              {hasActiveCurrent && (
                <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-white text-xs text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F8A084]" />
                  <span>Finish or clear current ticket before calling next.</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={hasActiveCurrent || waitingCount === 0 || actionLoading === 'callNext'}
              onClick={onCallNext}
              className="w-full py-4 px-6 bg-[#FAF8F3] hover:bg-white text-[#184E38] text-base font-bold rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-98"
            >
              <PhoneCall className="w-5 h-5 text-[#184E38]" />
              <span>Call Next Customer (FIFO)</span>
            </button>
            {waitingCount === 0 && (
              <p className="text-[11px] text-[#C5DCCF] text-center mt-2">
                Waiting queue is currently empty.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
