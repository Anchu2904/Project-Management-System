'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { StateChip, PriorityChip, SourceChip, PercentSelect, Button } from '@/components/ui';
import UnplannedModal from '@/components/UnplannedModal';
import HandoffModal from '@/components/HandoffModal';
import WrapPanel from '@/components/WrapPanel';
import AddPlanModal from '@/components/AddPlanModal';
import type { DailyPlanState } from '@/types';

export default function TodayScreen() {
  const [showUnplanned, setShowUnplanned] = useState(false);
  const [showWrap, setShowWrap] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [handoffTaskId, setHandoffTaskId] = useState<string | null>(null);

  const currentUserId = useStore((s) => s.currentUserId);
  const planItems = useStore((s) => s.getTodayPlanItems());
  const unplanned = useStore((s) => s.getTodayUnplanned());
  const getTaskById = useStore((s) => s.getTaskById);
  const dayWrap = useStore((s) => s.getDayWrap(new Date().toISOString().slice(0, 10)));

  const updateState = useStore((s) => s.updatePlanItemState);
  const updateTarget = useStore((s) => s.updatePlanItemTargetPct);
  const updateActual = useStore((s) => s.updatePlanItemActualPct);

  const isWrapped = dayWrap?.status === 'wrapped';
  const blockedItems = planItems.filter((p) => p.state === 'blocked');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Day</h1>
          <p className="text-sm text-slate-500 mt-1">
            {planItems.length} planned · {unplanned.length} unplanned today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowAddPlan(true)}>+ Add planned</Button>
          <Button variant="secondary" onClick={() => setShowUnplanned(true)}>⚡ Log unplanned</Button>
          <Button
            variant={isWrapped ? 'ghost' : 'primary'}
            onClick={() => setShowWrap(true)}
            disabled={isWrapped}
          >
            {isWrapped ? '✅ Day wrapped' : '🏁 Wrap day'}
          </Button>
        </div>
      </div>

      {/* Section A: Plan */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Plan (Top 3–7)</h2>
        </div>
        {planItems.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            No tasks planned for today. Click &quot;Add planned&quot; to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {planItems.map((item) => {
              const task = getTaskById(item.taskId);
              if (!task) return null;
              return (
                <div key={item.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-800 truncate">{task.title}</span>
                      <PriorityChip priority={task.priority} />
                      <SourceChip source={task.sourceTeam} />
                    </div>
                    {item.note && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
                    )}
                  </div>

                  {/* State */}
                  <select
                    value={item.state}
                    onChange={(e) => {
                      const newState = e.target.value as DailyPlanState;
                      updateState(item.id, newState);
                      if (newState === 'waiting') setHandoffTaskId(task.id);
                    }}
                    className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">active</option>
                    <option value="waiting">waiting</option>
                    <option value="blocked">blocked</option>
                    <option value="done">done</option>
                  </select>

                  {/* Target % */}
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 mb-0.5">Target</p>
                    <PercentSelect
                      value={item.targetPct}
                      onChange={(v) => updateTarget(item.id, v)}
                    />
                  </div>

                  {/* Actual % */}
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 mb-0.5">Actual</p>
                    <PercentSelect
                      value={item.actualPct}
                      onChange={(v) => updateActual(item.id, v)}
                      placeholder="—"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section B: Unplanned today */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-orange-50/50">
          <h2 className="text-sm font-semibold text-orange-700 uppercase tracking-wider">
            ⚡ Unplanned today ({unplanned.length})
          </h2>
        </div>
        {unplanned.length === 0 ? (
          <div className="px-5 py-6 text-center text-slate-400 text-sm">
            No unplanned interruptions logged today.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {unplanned.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{log.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{log.channel}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <SourceChip source={log.sourceTeam} />
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{log.reasonCode}</span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  log.status === 'handled'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-orange-50 text-orange-700'
                }`}>
                  {log.status}
                </span>
                {log.effortBucket && (
                  <span className="text-xs text-slate-500">{log.effortBucket}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section C: Blockers */}
      {blockedItems.length > 0 && (
        <section className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-red-100 bg-red-50/50">
            <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wider">
              🚫 Blockers ({blockedItems.length})
            </h2>
          </div>
          <div className="divide-y divide-red-50">
            {blockedItems.map((item) => {
              const task = getTaskById(item.taskId);
              if (!task) return null;
              const blockedDays = task.blockedReason
                ? Math.max(1, Math.floor((Date.now() - new Date(task.updatedAt).getTime()) / 86400000))
                : 0;
              return (
                <div key={item.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{task.title}</p>
                    {task.blockedReason && (
                      <p className="text-xs text-red-600 mt-0.5">{task.blockedReason}</p>
                    )}
                  </div>
                  {blockedDays > 0 && (
                    <span className="text-xs text-red-600 font-medium">{blockedDays}d</span>
                  )}
                  <Button variant="ghost" size="sm">Ping</Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modals */}
      <UnplannedModal open={showUnplanned} onClose={() => setShowUnplanned(false)} />
      <AddPlanModal open={showAddPlan} onClose={() => setShowAddPlan(false)} />
      <WrapPanel open={showWrap} onClose={() => setShowWrap(false)} />
      {handoffTaskId && (
        <HandoffModal taskId={handoffTaskId} onClose={() => setHandoffTaskId(null)} />
      )}
    </div>
  );
}
