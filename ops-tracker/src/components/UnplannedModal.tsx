'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Modal, Button, EffortSelect } from '@/components/ui';
import type { Channel, SourceTeam, ReasonCode, Impact, EffortBucket } from '@/types';

const CHANNELS: Channel[] = ['Gmail', 'Call', 'Walk-up', 'Meeting'];
const SOURCE_TEAMS: SourceTeam[] = ['Factory Ops', 'Stores', 'Finance', 'Supply Chain', 'Leadership', 'Other'];
const REASON_CODES: ReasonCode[] = ['Incident', 'Access', 'Data fix', 'Escalation', 'Month-end', 'Other'];
const IMPACTS: Impact[] = ['low', 'med', 'high'];

export default function UnplannedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const logUnplanned = useStore((s) => s.logUnplanned);

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<Channel>('Gmail');
  const [sourceTeam, setSourceTeam] = useState<SourceTeam>('Factory Ops');
  const [reasonCode, setReasonCode] = useState<ReasonCode>('Incident');
  const [impact, setImpact] = useState<Impact | ''>('');
  const [complianceFlag, setComplianceFlag] = useState(false);
  const [effort, setEffort] = useState<EffortBucket | ''>('');
  const [gmailUrl, setGmailUrl] = useState('');
  const [addToToday, setAddToToday] = useState(true);

  const handleSubmit = () => {
    if (!title.trim()) return;
    logUnplanned({
      title: title.trim(),
      channel,
      sourceTeam,
      reasonCode,
      impact: impact || null,
      complianceFlag,
      effortBucket: effort || null,
      gmailThreadUrl: gmailUrl || undefined,
      addedToToday: addToToday,
    });
    // Reset
    setTitle('');
    setChannel('Gmail');
    setSourceTeam('Factory Ops');
    setReasonCode('Incident');
    setImpact('');
    setComplianceFlag(false);
    setEffort('');
    setGmailUrl('');
    setAddToToday(true);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="⚡ Log Unplanned Interruption">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the interruption"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>

        {/* Channel + Source Team */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Channel *</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source team *</label>
            <select
              value={sourceTeam}
              onChange={(e) => setSourceTeam(e.target.value as SourceTeam)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SOURCE_TEAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Reason + Impact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason code *</label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value as ReasonCode)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REASON_CODES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Impact</label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as Impact)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Optional</option>
              {IMPACTS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* Effort (optional per R1) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Effort bucket (optional)</label>
          <EffortSelect value={effort || null} onChange={(v) => setEffort(v)} />
        </div>

        {/* Gmail Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gmail thread link</label>
          <input
            type="url"
            value={gmailUrl}
            onChange={(e) => setGmailUrl(e.target.value)}
            placeholder="https://mail.google.com/..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={addToToday}
              onChange={(e) => setAddToToday(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Add to today&apos;s plan
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={complianceFlag}
              onChange={(e) => setComplianceFlag(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Compliance related
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Log interruption</Button>
        </div>
      </div>
    </Modal>
  );
}
