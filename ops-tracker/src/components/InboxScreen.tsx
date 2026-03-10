'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button, SourceChip, Modal } from '@/components/ui';
import { format } from 'date-fns';
import { Inbox, ArrowRightCircle, Link2, Archive, Eye, Plus, Filter } from 'lucide-react';
import type { InboxItem, InboxStatus, InboxItemType, Channel, SourceTeam } from '@/types';

const CHANNELS: Channel[] = ['Gmail', 'Call', 'Walk-up', 'Meeting'];
const SOURCE_TEAMS: SourceTeam[] = ['Factory Ops', 'Stores', 'Finance', 'Supply Chain', 'Leadership', 'Other'];

const TYPE_LABELS: Record<InboxItemType, string> = {
  request: 'Request',
  validation: 'Validation',
  file: 'File',
  email_thread: 'Email Thread',
  other: 'Other',
};

const STATUS_COLORS: Record<InboxStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  triaged: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-green-100 text-green-800',
  linked: 'bg-purple-100 text-purple-800',
  archived: 'bg-slate-100 text-slate-500',
};

export default function InboxScreen() {
  const inboxItems = useStore((s) => s.inboxItems);
  const convertInboxToTask = useStore((s) => s.convertInboxToTask);
  const linkInboxToTask = useStore((s) => s.linkInboxToTask);
  const archiveInboxItem = useStore((s) => s.archiveInboxItem);
  const addInboxItem = useStore((s) => s.addInboxItem);
  const tasks = useStore((s) => s.tasks);
  const currentUserId = useStore((s) => s.currentUserId);

  const [showArchived, setShowArchived] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [linkModal, setLinkModal] = useState<{ open: boolean; itemId: string }>({ open: false, itemId: '' });
  const [linkTaskId, setLinkTaskId] = useState('');
  const [filterType, setFilterType] = useState<InboxItemType | 'all'>('all');

  // Add inbox item form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<InboxItemType>('request');
  const [newChannel, setNewChannel] = useState<Channel>('Gmail');
  const [newSourceTeam, setNewSourceTeam] = useState<SourceTeam>('Other');
  const [newNotes, setNewNotes] = useState('');
  const [newGmail, setNewGmail] = useState('');

  const filtered = inboxItems.filter((item) => {
    if (!showArchived && item.status === 'archived') return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  const newCount = inboxItems.filter((i) => i.status === 'new').length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addInboxItem({
      title: newTitle.trim(),
      type: newType,
      channel: newChannel,
      sourceTeam: newSourceTeam,
      notes: newNotes.trim() || undefined,
      gmailThreadUrl: newGmail.trim() || undefined,
    });
    setNewTitle('');
    setNewType('request');
    setNewChannel('Gmail');
    setNewSourceTeam('Other');
    setNewNotes('');
    setNewGmail('');
    setShowAddModal(false);
  };

  const handleLink = () => {
    if (linkModal.itemId && linkTaskId) {
      linkInboxToTask(linkModal.itemId, linkTaskId);
      setLinkModal({ open: false, itemId: '' });
      setLinkTaskId('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Inbox</h2>
          {newCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{newCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-sm border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All types</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <Button variant="ghost" onClick={() => setShowArchived(!showArchived)}>
            <Eye className="w-4 h-4 mr-1" />
            {showArchived ? 'Hide' : 'Show'} archived
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Capture
          </Button>
        </div>
      </div>

      {/* Inbox items */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Inbox is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <InboxCard
              key={item.id}
              item={item}
              onConvert={() => convertInboxToTask(item.id, currentUserId)}
              onLink={() => { setLinkModal({ open: true, itemId: item.id }); setLinkTaskId(''); }}
              onArchive={() => archiveInboxItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add Inbox Item Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Capture Inbox Item">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description..."
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as InboxItemType)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Channel</label>
              <select
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value as Channel)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source team</label>
            <select
              value={newSourceTeam}
              onChange={(e) => setNewSourceTeam(e.target.value as SourceTeam)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              {SOURCE_TEAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Optional note..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gmail link</label>
            <input
              value={newGmail}
              onChange={(e) => setNewGmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="https://mail.google.com/..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newTitle.trim()}>Add to inbox</Button>
          </div>
        </div>
      </Modal>

      {/* Link to Task Modal */}
      <Modal open={linkModal.open} onClose={() => setLinkModal({ open: false, itemId: '' })} title="Link to Existing Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select task</label>
            <select
              value={linkTaskId}
              onChange={(e) => setLinkTaskId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Choose a task...</option>
              {tasks.filter((t) => t.stakeholderState !== 'done').map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setLinkModal({ open: false, itemId: '' })}>Cancel</Button>
            <Button onClick={handleLink} disabled={!linkTaskId}>Link</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InboxCard({
  item,
  onConvert,
  onLink,
  onArchive,
}: {
  item: InboxItem;
  onConvert: () => void;
  onLink: () => void;
  onArchive: () => void;
}) {
  const isActionable = item.status === 'new' || item.status === 'triaged';

  return (
    <div className={`bg-white rounded-lg border p-4 ${item.status === 'archived' ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
              {item.status}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {TYPE_LABELS[item.type]}
            </span>
            <span className="text-xs text-slate-500">via {item.channel}</span>
          </div>
          <h4 className="font-medium text-slate-900 text-sm">{item.title}</h4>
          {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span>{format(new Date(item.createdAt), 'MMM d, h:mm a')}</span>
            {item.gmailThreadUrl && (
              <a
                href={item.gmailThreadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open in Gmail
              </a>
            )}
            {item.linkedTaskId && (
              <span className="text-purple-600">Linked to task</span>
            )}
          </div>
        </div>
        {isActionable && (
          <div className="flex items-center gap-1 ml-3 shrink-0">
            <button
              onClick={onConvert}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Convert to task"
            >
              <ArrowRightCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onLink}
              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              title="Link to task"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={onArchive}
              className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
