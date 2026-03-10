'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Modal, Button, PercentSelect } from '@/components/ui';
import type { PercentBucket } from '@/types';

export default function AddPlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tasks = useStore((s) => s.tasks);
  const currentUserId = useStore((s) => s.currentUserId);
  const planItems = useStore((s) => s.getTodayPlanItems());
  const addPlanItem = useStore((s) => s.addPlanItem);

  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [targetPct, setTargetPct] = useState<PercentBucket>(50);

  // Only show tasks owned by current user that aren't already in today's plan
  const plannedTaskIds = new Set(planItems.map((p) => p.taskId));
  const availableTasks = tasks.filter(
    (t) => t.ownerId === currentUserId && !plannedTaskIds.has(t.id) && t.stakeholderState !== 'done'
  );

  const handleAdd = () => {
    if (!selectedTaskId) return;
    addPlanItem(selectedTaskId, targetPct);
    setSelectedTaskId('');
    setTargetPct(50);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="+ Add Task to Today's Plan">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select task</label>
          {availableTasks.length === 0 ? (
            <p className="text-sm text-slate-400">No available tasks. Create a new task first.</p>
          ) : (
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a task...</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target % today</label>
          <PercentSelect value={targetPct} onChange={setTargetPct} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selectedTaskId}>Add to plan</Button>
        </div>
      </div>
    </Modal>
  );
}
