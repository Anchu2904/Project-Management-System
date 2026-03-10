'use client';

import type { Screen } from '@/app/page';
import { useStore } from '@/store/useStore';

const navItems: { key: Screen; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: '📋' },
  { key: 'inbox', label: 'Inbox', icon: '📥' },
  { key: 'tasks', label: 'Tasks', icon: '📌' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
];

export default function Sidebar({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
}) {
  const currentUser = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const inboxCount = useStore((s) => s.inboxItems.filter((i) => i.status === 'new').length);

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="font-semibold text-lg text-slate-800">River Ops</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isManager = currentUser?.role === 'manager';
          if (item.key === 'dashboard' && !isManager) return null;
          const active = screen === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setScreen(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.key === 'inbox' && inboxCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {inboxCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User switcher (dev helper) */}
      <div className="border-t border-slate-100 p-4">
        <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Switch User</p>
        <UserSwitcher />
      </div>
    </aside>
  );
}

function UserSwitcher() {
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  const setCurrentUser = useStore((s) => s.setCurrentUser);

  return (
    <select
      value={currentUserId}
      onChange={(e) => setCurrentUser(e.target.value)}
      className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name} ({u.role})
        </option>
      ))}
    </select>
  );
}
