'use client';

import type { User } from '@/types';

export default function TopBar({ currentUser }: { currentUser: User }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hour = today.getHours();
  const min = today.getMinutes();
  const beforeStandup = hour < 10 || (hour === 10 && min < 30);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-slate-500">{dateStr}</h2>
        {beforeStandup && (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200">
            ⏰ Before standup
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{currentUser.name}</p>
          <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
          {currentUser.name.split(' ').map((n) => n[0]).join('')}
        </div>
      </div>
    </header>
  );
}
