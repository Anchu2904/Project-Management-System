'use client';

import { useStore } from '@/store/useStore';
import { Modal, Button, PercentSelect, EffortSelect } from '@/components/ui';
import type { PercentBucket, EffortBucket, UnplannedStatus } from '@/types';

export default function WrapPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const planItems = useStore((s) => s.getTodayPlanItems());
  const unplanned = useStore((s) => s.getTodayUnplanned());
  const getTaskById = useStore((s) => s.getTaskById);
  const updateActual = useStore((s) => s.updatePlanItemActualPct);
  const updateEffort = useStore((s) => s.updatePlanItemEffort);
  const updateUnplannedStatus = useStore((s) => s.updateUnplannedStatus);
  const updateUnplannedEffort = useStore((s) => s.updateUnplannedEffort);
  const wrapDay = useStore((s) => s.wrapDay);

  const missingActual = planItems.filter((p) => p.actualPct === null);
  const missingEffortUnplanned = unplanned.filter((u) => !u.effortBucket);

  const canWrap = missingActual.length === 0;

  const handleWrap = () => {
    const success = wrapDay();
    if (success) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="🏁 Wrap Day" wide>
      <div className="space-y-6">
        {/* Checklist: Planned tasks actual % */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Update actual % for planned tasks
            {missingActual.length > 0 && (
              <span className="text-red-500 ml-2 font-normal">({missingActual.length} incomplete)</span>
            )}
          </h3>
          <div className="space-y-2">
            {planItems.map((item) => {
              const task = getTaskById(item.taskId);
              return (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <span className="flex-1 text-sm text-slate-700 truncate">{task?.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Target: {item.targetPct}%</span>
                    <PercentSelect
                      value={item.actualPct}
                      onChange={(v) => updateActual(item.id, v)}
                      placeholder="Actual"
                    />
                    <EffortSelect
                      value={item.effortBucket}
                      onChange={(v) => updateEffort(item.id, v)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Checklist: Unplanned effort buckets */}
        {unplanned.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Unplanned log effort buckets
              {missingEffortUnplanned.length > 0 && (
                <span className="text-amber-600 ml-2 font-normal">({missingEffortUnplanned.length} missing effort)</span>
              )}
            </h3>
            <div className="space-y-2">
              {unplanned.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-orange-50/50 rounded-lg">
                  <span className="flex-1 text-sm text-slate-700 truncate">{log.title}</span>
                  <div className="flex items-center gap-3">
                    <select
                      value={log.status}
                      onChange={(e) => updateUnplannedStatus(log.id, e.target.value as UnplannedStatus)}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="handled">handled</option>
                      <option value="spilled">spilled</option>
                    </select>
                    <EffortSelect
                      value={log.effortBucket}
                      onChange={(v) => updateUnplannedEffort(log.id, v)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Carry to tomorrow suggestion */}
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Carry to tomorrow?</h3>
          <p className="text-xs text-slate-500">
            Items with actual &lt; target will be auto-suggested for tomorrow&apos;s plan.
          </p>
          <div className="mt-2 space-y-1">
            {planItems
              .filter((p) => p.actualPct !== null && p.actualPct < p.targetPct)
              .map((item) => {
                const task = getTaskById(item.taskId);
                return (
                  <div key={item.id} className="flex items-center gap-2 text-xs text-slate-600">
                    <span>↪</span>
                    <span>{task?.title} (actual {item.actualPct}% vs target {item.targetPct}%)</span>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {canWrap ? '✅ All checks passed' : '⚠️ Complete all actual percentages to wrap'}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleWrap} disabled={!canWrap}>
              Wrap day
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
