
'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Modal, Button } from '@/components/ui';
import type { WaitingRequestType } from '@/types';

const REQUEST_TYPES: WaitingRequestType[] = ['Approve', 'Confirm', 'Test', 'Provide info', 'Schedule', 'Other'];
const TEAMS = ['Factory Ops', 'Stores', 'Finance', 'Supply Chain', 'Leadership', 'Other'];
const EXPECTED_OPTIONS = ['Today', '24h', '3 days'];

export default function HandoffModal({
  taskId,
  onClose,
  open = true,
}: { taskId: string; onClose: () => void; open?: boolean }) {
  const handoff = useStore((s) => s.handoff);
  const task = useStore((s) => s.getTaskById(taskId));

  const [waitingOn, setWaitingOn] = useState(task?.waitingOnTeam || TEAMS[0]);
  const [requestType, setRequestType] = useState<WaitingRequestType>('Approve');
  const [expectedBy, setExpectedBy] = useState('24h');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    handoff(taskId, {
      waitingOnTeam: waitingOn,
      requestType,
      expectedBy,
      note: note || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="🤝 Hand Off Task">
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-700">{task?.title}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Waiting on (team/org) *</label>
          <select
            value={waitingOn}
            onChange={(e) => setWaitingOn(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">What we need from them *</label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as WaitingRequestType)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REQUEST_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expected by</label>
          <div className="flex gap-2">
            {EXPECTED_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setExpectedBy(opt)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  expectedBy === opt
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One-line context..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm handoff</Button>
        </div>
      </div>
    </Modal>
  );
}
