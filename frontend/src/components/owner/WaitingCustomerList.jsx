import React from 'react';
import { Users } from 'lucide-react';
import { Badge } from '../common/Badge';

export const WaitingCustomerList = ({ waitingTickets, avgServiceTime = 10 }) => {
  if (!waitingTickets || waitingTickets.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-[28px] p-8 border border-stone-200/80 dark:border-stone-800 shadow-soft-float text-center transition-colors duration-200">
        <Users className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
        <h4 className="font-serif text-lg font-normal text-[#1A231E] dark:text-white">No Customers Waiting</h4>
        <p className="text-xs text-[#59665F] dark:text-stone-400 mt-1 max-w-sm mx-auto">
          When customers join this service queue remotely, their live virtual tickets will appear here in exact FIFO order.
        </p>
      </div>
    );
  }

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-[28px] border border-stone-200/80 dark:border-stone-800 shadow-soft-float overflow-hidden transition-colors duration-200">
      <div className="px-6 py-4 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between bg-[#FAF8F3]/60 dark:bg-stone-800/40">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#184E38] dark:text-[#A7D7BC]" />
          <h3 className="font-serif text-base font-normal text-[#1A231E] dark:text-white">
            Waiting Queue ({waitingTickets.length})
          </h3>
        </div>
        <span className="text-[11px] uppercase font-bold tracking-wider text-[#3F6451] dark:text-[#A7D7BC]">
          FIFO Order
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#37433C] dark:text-stone-300">
          <thead className="bg-[#FAF8F3] dark:bg-stone-800/60 text-[10px] uppercase font-bold tracking-wider text-[#59665F] dark:text-stone-400 border-b border-stone-200/60 dark:border-stone-800">
            <tr>
              <th className="px-6 py-3.5">Rank</th>
              <th className="px-6 py-3.5">Ticket</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Phone</th>
              <th className="px-6 py-3.5">Joined Time</th>
              <th className="px-6 py-3.5">Est. Wait</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {waitingTickets.map((t, index) => {
              const estWait = index * avgServiceTime;
              return (
                <tr
                  key={t._id}
                  className={`hover:bg-[#FAF8F3]/80 dark:hover:bg-stone-800/50 transition-colors ${
                    index === 0 ? 'bg-[#E2EDE7]/40 dark:bg-[#184E38]/10 font-medium' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-[#184E38] text-white shadow-2xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-sm text-[#184E38] dark:text-[#A7D7BC] bg-[#FAF8F3] dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                      {t.ticketNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#1A231E] dark:text-white">
                    {t.customerName}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#59665F] dark:text-stone-400">
                    {t.customerPhone}
                  </td>
                  <td className="px-6 py-4 text-[#59665F] dark:text-stone-400">
                    {formatTime(t.joinedAt)}
                  </td>
                  <td className="px-6 py-4 text-[#59665F] dark:text-stone-400">
                    {index === 0 ? (
                      <span className="text-[#184E38] dark:text-[#A7D7BC] font-bold">Next in line</span>
                    ) : (
                      `~${estWait} min`
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={t.status} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
