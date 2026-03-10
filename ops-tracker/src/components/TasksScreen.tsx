'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { StateChip, PriorityChip, SourceChip, Button, Modal, PercentSelect, EffortSelect } from '@/components/ui';
import HandoffModal from '@/components/HandoffModal';
import { format, differenceInDays } from 'date-fns';
import {
  Search, Plus, ChevronRight, ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle2, XCircle, Filter, ExternalLink, MessageSquare
} from 'lucide-react';
import type {
  Task, DailyPlanState, StakeholderState, Priority, SourceTeam, PercentBucket
} from '@/types';

const STAKEHOLDER_STATES: StakeholderState[] = ['active', 'waiting', 'blocked', 'done'];
const PRIORITIES: Priority[] = ['low', 'med', 'high'];
const SOURCE_TEAMS: SourceTeam[] = ['Factory Ops', 'Stores', 'Finance', 'Supply Chain', 'Leadership', 'Other'];

export default function TasksScreen() {
  const tasks = useStore((s) => s.tasks);
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchQ, setSearchQ] = useState('');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterState, setFilterState] = useState<StakeholderState | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterSource, setFilterSource] = useState<SourceTeam | 'all'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQ && !t.title.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (filterOwner !== 'all' && t.ownerId !== filterOwner) return false;
      if (filterState !== 'all' && t.stakeholderState !== filterState) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterSource !== 'all' && t.sourceTeam !== filterSource) return false;
      return true;
    });
  }, [tasks, searchQ, filterOwner, filterState, filterPriority, filterSource]);

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;

  if (selectedTask) {
    return (
      <TaskDetailView
        task={selectedTask}
        onBack={() => setSelectedTaskId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">All Tasks</h2>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-1" /> New task</Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg border p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}
            className="text-xs border rounded-md px-2 py-1.5">
            <option value="all">All owners</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={filterState} onChange={(e) => setFilterState(e.target.value as any)}
            className="text-xs border rounded-md px-2 py-1.5">
            <option value="all">All states</option>
            {STAKEHOLDER_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)}
            className="text-xs border rounded-md px-2 py-1.5">
            <option value="all">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value as any)}
            className="text-xs border rounded-md px-2 py-1.5">
            <option value="all">All sources</option>
            {SOURCE_TEAMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(searchQ || filterOwner !== 'all' || filterState !== 'all' || filterPriority !== 'all' || filterSource !== 'all') && (
            <button
              onClick={() => { setSearchQ(''); setFilterOwner('all'); setFilterState('all'); setFilterPriority('all'); setFilterSource('all'); }}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-1">
        {filteredTasks.length === 0 ? (
          <p className="text-center py-12 text-slate-400 text-sm">No tasks match your filters</p>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow key={task.id} task={task} onClick={() => setSelectedTaskId(task.id)} />
          ))
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}

/* ---- Task Row ---- */
function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const getUserById = useStore((s) => s.getUserById);
  const owner = getUserById(task.ownerId);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border p-3 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <PriorityChip priority={task.priority} />
          <span className="font-medium text-sm text-slate-900 truncate">{task.title}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{owner?.name || 'Unknown'}</span>
          <SourceChip source={task.sourceTeam} />
          <span>{task.cumulativePct}% done</span>
          {task.stakeholderState === 'waiting' && task.waitingOnTeam && (
            <span className="text-amber-600">⏳ waiting on {task.waitingOnTeam}</span>
          )}
        </div>
      </div>
      <StateChip state={task.stakeholderState} />
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </button>
  );
}

/* ---- Task Detail View (FR-6) ---- */
function TaskDetailView({ task, onBack }: { task: Task; onBack: () => void }) {
  const updateTask = useStore((s) => s.updateTask);
  const handoff = useStore((s) => s.handoff);
  const responseReceived = useStore((s) => s.responseReceived);
  const closeTask = useStore((s) => s.closeTask);
  const events = useStore((s) => s.getEventsForTask(task.id));
  const getUserById = useStore((s) => s.getUserById);
  const currentUserId = useStore((s) => s.currentUserId);
  const owner = getUserById(task.ownerId);

  const [showHandoff, setShowHandoff] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const isOwner = task.ownerId === currentUserId;
  const waitingDays = task.handoffAt
    ? differenceInDays(new Date(), new Date(task.handoffAt))
    : 0;

  // Get today's plan item for this task (for the two progress truths)
  const todayPlanItems = useStore((s) => s.getTodayPlanItems());
  const planItem = todayPlanItems.find((p) => p.taskId === task.id);

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Back to tasks
      </button>

      {/* Header card */}
      <div className="bg-white rounded-lg border p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PriorityChip priority={task.priority} />
              <StateChip state={task.stakeholderState} />
              <SourceChip source={task.sourceTeam} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
            {task.description && <p className="text-sm text-slate-600 mt-1">{task.description}</p>}
          </div>
          {task.gmailThreadUrl && (
            <a href={task.gmailThreadUrl} target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Open in Gmail">
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-slate-400 text-xs block">Owner</span>
            <span className="font-medium">{owner?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Channel</span>
            <span className="font-medium capitalize">{task.channel}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Created</span>
            <span className="font-medium">{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Daily Plan</span>
            <span className="font-medium capitalize">{task.dailyPlanState}</span>
          </div>
        </div>

        {/* Two progress truths */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-blue-50 rounded-lg px-4 py-3">
            <span className="text-xs text-blue-600 font-medium block mb-1">Cumulative %</span>
            <span className="text-2xl font-bold text-blue-700">{planItem?.actualPct ?? 0}%</span>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-3">
            <span className="text-xs text-green-600 font-medium block mb-1">Today's Target</span>
            <span className="text-2xl font-bold text-green-700">{planItem?.targetPct ?? 0}%</span>
          </div>
        </div>

        {/* Waiting details */}
        {task.stakeholderState === 'waiting' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800 text-sm font-medium mb-1">
              <Clock className="w-4 h-4" />
              Waiting on {task.waitingOnTeam}
            </div>
            <div className="text-xs text-amber-700 space-y-0.5">
              {task.waitingRequestType && <p>Type: {task.waitingRequestType}</p>}
              {task.expectedBy && <p>Expected by: {task.expectedBy}</p>}
              <p className="font-medium">Aging: {waitingDays} day{waitingDays !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {task.stakeholderState === 'blocked' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <strong>Blocked</strong> — This task is currently blocked.
          </div>
        )}
      </div>

      {/* Actions */}
      {isOwner && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {task.stakeholderState === 'active' && (
              <>
                <Button onClick={() => setShowHandoff(true)}>
                  <ArrowUpRight className="w-4 h-4 mr-1" /> Handoff (→ Waiting)
                </Button>
                <Button variant="danger" onClick={() => updateTask(task.id, { stakeholderState: 'blocked' })}>
                  Block
                </Button>
                <Button variant="secondary" onClick={() => closeTask(task.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Close
                </Button>
              </>
            )}
            {task.stakeholderState === 'waiting' && (
              <>
                <Button onClick={() => responseReceived(task.id)}>
                  <ArrowDownLeft className="w-4 h-4 mr-1" /> Response received
                </Button>
                <Button variant="danger" onClick={() => updateTask(task.id, { stakeholderState: 'blocked' })}>
                  Block
                </Button>
              </>
            )}
            {task.stakeholderState === 'blocked' && (
              <>
                <Button onClick={() => updateTask(task.id, { stakeholderState: 'active' })}>
                  Unblock → Active
                </Button>
                <Button variant="secondary" onClick={() => closeTask(task.id)}>
                  Close
                </Button>
              </>
            )}
            {task.stakeholderState === 'done' && (
              <Button variant="ghost" onClick={() => updateTask(task.id, { stakeholderState: 'active' })}>
                Re-open
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Timeline / Activity */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Activity Timeline</h3>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No activity recorded yet</p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const actor = getUserById(ev.actorId);
              return (
                <div key={ev.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-700">
                      <span className="font-medium">{actor?.name || 'System'}</span>{' '}
                      <span className="text-slate-500">{ev.type.replace(/_/g, ' ')}</span>
                    </p>
                    {ev.metadata && <p className="text-xs text-slate-500">{JSON.stringify(ev.metadata)}</p>}
                    <p className="text-xs text-slate-400">{format(new Date(ev.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Handoff Modal */}
      <HandoffModal
        open={showHandoff}
        onClose={() => setShowHandoff(false)}
        taskId={task.id}
      />
    </div>
  );
}

/* ---- Create Task Modal ---- */
function CreateTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createTask = useStore((s) => s.createTask);
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('med');
  const [sourceTeam, setSourceTeam] = useState<SourceTeam>('Other');
  const [gmailThreadUrl, setGmailThreadUrl] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      sourceTeam,
      channel: 'Gmail',
      gmailThreadUrl: gmailThreadUrl.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setPriority('med');
    setSourceTeam('Other');
    setGmailThreadUrl('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Task">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Task title..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Optional description..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source team</label>
            <select value={sourceTeam} onChange={(e) => setSourceTeam(e.target.value as SourceTeam)}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              {SOURCE_TEAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gmail link</label>
          <input value={gmailThreadUrl} onChange={(e) => setGmailThreadUrl(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="https://mail.google.com/..."
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>Create task</Button>
        </div>
      </div>
    </Modal>
  );
}
