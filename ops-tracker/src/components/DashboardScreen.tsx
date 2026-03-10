'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { StateChip, PriorityChip, SourceChip } from '@/components/ui';
import { format, differenceInDays, startOfWeek, addDays, isAfter, isBefore } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, Clock, Users, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import type { Task, UnplannedLog, SourceTeam } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export default function DashboardScreen() {
  const tasks = useStore((s) => s.tasks);
  const users = useStore((s) => s.users);
  const unplannedLogs = useStore((s) => s.unplannedLogs);
  const planItems = useStore((s) => s.planItems);
  const dayWraps = useStore((s) => s.dayWraps);
  const currentUserId = useStore((s) => s.currentUserId);
  const currentUser = useStore((s) => s.getUserById(currentUserId));

  const isManager = currentUser?.role === 'manager';

  if (!isManager) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">Dashboard is available for managers only</p>
        <p className="text-xs mt-1">Switch to the manager user (Priya) via the sidebar to view</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Manager Dashboard</h2>

      {/* Summary cards */}
      <SummaryCards tasks={tasks} unplannedLogs={unplannedLogs} />

      {/* Standup view */}
      <StandupView />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InterruptionChart unplannedLogs={unplannedLogs} />
        <WaitingAgingList tasks={tasks} />
      </div>

      {/* Trend */}
      <WeeklyTrend />
    </div>
  );
}

/* ---- Summary Cards ---- */
function SummaryCards({ tasks, unplannedLogs }: { tasks: Task[]; unplannedLogs: UnplannedLog[] }) {
  const activeTasks = tasks.filter((t) => t.stakeholderState === 'active').length;
  const waitingTasks = tasks.filter((t) => t.stakeholderState === 'waiting').length;
  const blockedTasks = tasks.filter((t) => t.stakeholderState === 'blocked').length;
  const todayUnplanned = unplannedLogs.filter(
    (u) => format(new Date(u.dateTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const cards = [
    { label: 'Active tasks', value: activeTasks, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
    { label: 'Waiting', value: waitingTasks, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Blocked', value: blockedTasks, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: 'Unplanned today', value: todayUnplanned, icon: AlertTriangle, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-md ${c.color}`}>
              <c.icon className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-500">{c.label}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ---- Standup View (FR-9 grouped by person) ---- */
function StandupView() {
  const users = useStore((s) => s.users);
  const planItems = useStore((s) => s.planItems);
  const unplannedLogs = useStore((s) => s.unplannedLogs);
  const tasks = useStore((s) => s.tasks);
  const today = format(new Date(), 'yyyy-MM-dd');

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const employeeUsers = users.filter((u) => u.role === 'employee');

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4" /> Standup View
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Today's plan items grouped by person</p>
      </div>
      <div className="divide-y">
        {employeeUsers.map((user) => {
          const userPlanItems = planItems.filter((p) => {
            const task = tasks.find((t) => t.id === p.taskId);
            return task?.ownerId === user.id && p.date === today;
          });
          const userUnplanned = unplannedLogs.filter(
            (u) => u.userId === user.id && format(new Date(u.dateTime), 'yyyy-MM-dd') === today
          );
          const isOpen = expanded[user.id] ?? true;
          const hasBlocker = userPlanItems.some((p) => {
            const task = tasks.find((t) => t.id === p.taskId);
            return task?.stakeholderState === 'blocked';
          });

          return (
            <div key={user.id} className="p-3">
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [user.id]: !isOpen }))}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-sm text-slate-900">{user.name}</span>
                  <span className="text-xs text-slate-400">{userPlanItems.length} planned</span>
                  {userUnplanned.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                      {userUnplanned.length} unplanned
                    </span>
                  )}
                  {hasBlocker && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">blocked</span>
                  )}
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              {isOpen && (
                <div className="mt-2 ml-9 space-y-1">
                  {userPlanItems.length === 0 && userUnplanned.length === 0 && (
                    <p className="text-xs text-slate-400">No items for today</p>
                  )}
                  {userPlanItems.map((item) => {
                    const task = tasks.find((t) => t.id === item.taskId);
                    if (!task) return null;
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-xs">
                        <StateChip state={task.stakeholderState} />
                        <span className="text-slate-700 truncate">{task.title}</span>
                        <span className="text-slate-400 shrink-0">target {item.targetPct}%</span>
                        {item.actualPct !== null && (
                          <span className="text-green-600 shrink-0">actual {item.actualPct}%</span>
                        )}
                      </div>
                    );
                  })}
                  {userUnplanned.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px]">unplanned</span>
                      <span className="text-slate-700 truncate">{u.title}</span>
                      <SourceChip source={u.sourceTeam} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Interruption Chart ---- */
function InterruptionChart({ unplannedLogs }: { unplannedLogs: UnplannedLog[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    unplannedLogs.forEach((u) => {
      counts[u.sourceTeam] = (counts[u.sourceTeam] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [unplannedLogs]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-sm text-slate-700 mb-3">Interruptions by Source</h3>
        <p className="text-sm text-slate-400 text-center py-8">No unplanned items recorded</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-sm text-slate-700 mb-3">Interruptions by Source</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---- Waiting / Validation Aging ---- */
function WaitingAgingList({ tasks }: { tasks: Task[] }) {
  const getUserById = useStore((s) => s.getUserById);
  const waitingTasks = tasks
    .filter((t) => t.stakeholderState === 'waiting' && t.waitingSince)
    .sort((a, b) => new Date(a.waitingSince!).getTime() - new Date(b.waitingSince!).getTime());

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-sm text-slate-700 mb-3">Waiting & Aging</h3>
      {waitingTasks.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No waiting tasks</p>
      ) : (
        <div className="space-y-2">
          {waitingTasks.map((t) => {
            const days = differenceInDays(new Date(), new Date(t.waitingSince!));
            const owner = getUserById(t.ownerId);
            return (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <PriorityChip priority={t.priority} />
                  <span className="truncate text-slate-700">{t.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="text-slate-500">{owner?.name}</span>
                  <span className="text-amber-600">→ {t.waitingOnTeam}</span>
                  <span className={`font-bold ${days >= 3 ? 'text-red-600' : days >= 1 ? 'text-amber-600' : 'text-slate-600'}`}>
                    {days}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- Weekly Trend (placeholder with mock data) ---- */
function WeeklyTrend() {
  const data = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => ({
      day: format(addDays(weekStart, i), 'EEE'),
      planned: Math.floor(Math.random() * 6) + 2,
      unplanned: Math.floor(Math.random() * 3),
      completed: Math.floor(Math.random() * 5) + 1,
    }));
  }, []);

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-sm text-slate-700 mb-3">Weekly Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="planned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="unplanned" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
