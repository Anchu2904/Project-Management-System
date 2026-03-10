'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Sidebar from '@/components/Sidebar';
import TodayScreen from '@/components/TodayScreen';
import InboxScreen from '@/components/InboxScreen';
import TasksScreen from '@/components/TasksScreen';
import DashboardScreen from '@/components/DashboardScreen';
import TopBar from '@/components/TopBar';

export type Screen = 'today' | 'inbox' | 'tasks' | 'dashboard';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('today');
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const currentUser = users.find((u) => u.id === currentUserId);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar screen={screen} setScreen={setScreen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar currentUser={currentUser!} />
        <main className="flex-1 overflow-y-auto p-6">
          {screen === 'today' && <TodayScreen />}
          {screen === 'inbox' && <InboxScreen />}
          {screen === 'tasks' && <TasksScreen />}
          {screen === 'dashboard' && <DashboardScreen />}
        </main>
      </div>
    </div>
  );
}
