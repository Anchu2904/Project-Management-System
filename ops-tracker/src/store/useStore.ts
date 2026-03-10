import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  User, Team, Task, DailyPlanItem, UnplannedLog,
  InboxItem, DayWrap, ActivityEvent, PercentBucket,
  DailyPlanState, StakeholderState, UnplannedStatus,
  Channel, SourceTeam, ReasonCode, Impact, EffortBucket,
  WaitingRequestType, InboxItemType, InboxStatus, ActivityEventType,
} from '@/types';
import {
  USERS, TEAM, SEED_TASKS, SEED_PLAN_ITEMS, SEED_UNPLANNED,
  SEED_INBOX, SEED_DAY_WRAPS, SEED_EVENTS,
} from '@/data/seed';

// ─── Store Shape ───
interface AppState {
  // auth
  currentUserId: string;
  users: User[];
  team: Team;

  // data
  tasks: Task[];
  planItems: DailyPlanItem[];
  unplannedLogs: UnplannedLog[];
  inboxItems: InboxItem[];
  dayWraps: DayWrap[];
  events: ActivityEvent[];

  // auth
  setCurrentUser: (id: string) => void;

  // ─── Today / Plan ───
  addPlanItem: (taskId: string, targetPct: PercentBucket) => void;
  updatePlanItemState: (id: string, state: DailyPlanState) => void;
  updatePlanItemTargetPct: (id: string, pct: PercentBucket) => void;
  updatePlanItemActualPct: (id: string, pct: PercentBucket) => void;
  updatePlanItemNote: (id: string, note: string) => void;
  updatePlanItemEffort: (id: string, effort: EffortBucket) => void;

  // ─── Unplanned ───
  logUnplanned: (data: {
    title: string; channel: Channel; sourceTeam: SourceTeam;
    reasonCode: ReasonCode; impact?: Impact | null;
    complianceFlag: boolean; effortBucket?: EffortBucket | null;
    gmailThreadUrl?: string; addedToToday: boolean;
  }) => void;
  updateUnplannedStatus: (id: string, status: UnplannedStatus) => void;
  updateUnplannedEffort: (id: string, effort: EffortBucket) => void;

  // ─── Tasks ───
  createTask: (data: {
    title: string; description?: string; priority: 'low' | 'med' | 'high';
    sourceTeam: SourceTeam; channel: Channel; gmailThreadUrl?: string;
  }) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;

  // ─── Handoff / Response ───
  handoff: (taskId: string, data: {
    waitingOnTeam: string; requestType: WaitingRequestType;
    expectedBy?: string; note?: string;
  }) => void;
  responseReceived: (taskId: string) => void;
  closeTask: (taskId: string) => void;

  // ─── Inbox ───
  addInboxItem: (data: {
    title: string; channel: Channel; sourceTeam: SourceTeam;
    type: InboxItemType; gmailThreadUrl?: string; externalLinks?: string[]; notes?: string;
  }) => void;
  convertInboxToTask: (inboxId: string, ownerId: string) => void;
  linkInboxToTask: (inboxId: string, taskId: string) => void;
  archiveInboxItem: (inboxId: string) => void;

  // ─── Wrap ───
  wrapDay: () => boolean; // returns false if validation fails
  getDayWrap: (date: string) => DayWrap | undefined;

  // ─── Helpers ───
  getTaskById: (id: string) => Task | undefined;
  getUserById: (id: string) => User | undefined;
  getEventsForTask: (taskId: string) => ActivityEvent[];
  getTodayPlanItems: (userId?: string) => DailyPlanItem[];
  getTodayUnplanned: (userId?: string) => UnplannedLog[];
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export const useStore = create<AppState>((set, get) => ({
  currentUserId: 'u2', // default: Arjun (employee)
  users: USERS,
  team: TEAM,
  tasks: SEED_TASKS,
  planItems: SEED_PLAN_ITEMS,
  unplannedLogs: SEED_UNPLANNED,
  inboxItems: SEED_INBOX,
  dayWraps: SEED_DAY_WRAPS,
  events: SEED_EVENTS,

  setCurrentUser: (id) => set({ currentUserId: id }),

  // ─── Plan Items ───
  addPlanItem: (taskId, targetPct) => {
    const { currentUserId } = get();
    const item: DailyPlanItem = {
      id: uuid(), userId: currentUserId, date: todayStr(),
      taskId, state: 'active', targetPct, actualPct: null,
    };
    set((s) => ({
      planItems: [...s.planItems, item],
      events: [...s.events, {
        id: uuid(), taskId, actorId: currentUserId,
        type: 'plan_added' as ActivityEventType, createdAt: new Date().toISOString(),
      }],
    }));
  },

  updatePlanItemState: (id, state) =>
    set((s) => ({
      planItems: s.planItems.map((p) => p.id === id ? { ...p, state } : p),
    })),

  updatePlanItemTargetPct: (id, pct) =>
    set((s) => ({
      planItems: s.planItems.map((p) => p.id === id ? { ...p, targetPct: pct } : p),
    })),

  updatePlanItemActualPct: (id, pct) =>
    set((s) => ({
      planItems: s.planItems.map((p) => p.id === id ? { ...p, actualPct: pct } : p),
    })),

  updatePlanItemNote: (id, note) =>
    set((s) => ({
      planItems: s.planItems.map((p) => p.id === id ? { ...p, note } : p),
    })),

  updatePlanItemEffort: (id, effort) =>
    set((s) => ({
      planItems: s.planItems.map((p) => p.id === id ? { ...p, effortBucket: effort } : p),
    })),

  // ─── Unplanned ───
  logUnplanned: (data) => {
    const { currentUserId, tasks } = get();
    const logId = uuid();
    let taskId: string | null = null;

    if (data.addedToToday) {
      taskId = uuid();
      const task: Task = {
        id: taskId, title: data.title, ownerId: currentUserId, teamId: get().team.id,
        priority: 'med', sourceTeam: data.sourceTeam, channel: data.channel,
        stakeholderState: 'active', blockedFlag: false,
        gmailThreadUrl: data.gmailThreadUrl || null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const planItem: DailyPlanItem = {
        id: uuid(), userId: currentUserId, date: todayStr(),
        taskId, state: 'active', targetPct: 25, actualPct: null,
      };
      set((s) => ({
        tasks: [...s.tasks, task],
        planItems: [...s.planItems, planItem],
      }));
    }

    const log: UnplannedLog = {
      id: logId, userId: currentUserId, dateTime: new Date().toISOString(),
      title: data.title, channel: data.channel, sourceTeam: data.sourceTeam,
      reasonCode: data.reasonCode, impact: data.impact ?? null,
      complianceFlag: data.complianceFlag,
      effortBucket: data.effortBucket ?? null,
      status: 'handled', taskId, gmailThreadUrl: data.gmailThreadUrl ?? null,
      addedToToday: data.addedToToday,
    };
    set((s) => ({ unplannedLogs: [...s.unplannedLogs, log] }));
  },

  updateUnplannedStatus: (id, status) =>
    set((s) => ({
      unplannedLogs: s.unplannedLogs.map((u) => u.id === id ? { ...u, status } : u),
    })),

  updateUnplannedEffort: (id, effort) =>
    set((s) => ({
      unplannedLogs: s.unplannedLogs.map((u) => u.id === id ? { ...u, effortBucket: effort } : u),
    })),

  // ─── Tasks ───
  createTask: (data) => {
    const id = uuid();
    const { currentUserId, team } = get();
    const task: Task = {
      id, title: data.title, description: data.description, ownerId: currentUserId,
      teamId: team.id, priority: data.priority, sourceTeam: data.sourceTeam,
      channel: data.channel, stakeholderState: 'active', blockedFlag: false,
      gmailThreadUrl: data.gmailThreadUrl || null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    set((s) => ({
      tasks: [...s.tasks, task],
      events: [...s.events, {
        id: uuid(), taskId: id, actorId: currentUserId,
        type: 'created' as ActivityEventType, createdAt: new Date().toISOString(),
      }],
    }));
    return id;
  },

  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id && t.ownerId === s.currentUserId
          ? { ...t, ...patch, updatedAt: new Date().toISOString() }
          : t
      ),
    })),

  // ─── Handoff ───
  handoff: (taskId, data) => {
    const { currentUserId } = get();
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? {
          ...t, stakeholderState: 'waiting' as StakeholderState,
          waitingOnTeam: data.waitingOnTeam, waitingRequestType: data.requestType,
          expectedBy: data.expectedBy || null, handoffAt: new Date().toISOString(),
          responseReceivedAt: null, updatedAt: new Date().toISOString(),
        } : t
      ),
      planItems: s.planItems.map((p) =>
        p.taskId === taskId && p.date === todayStr() ? { ...p, state: 'waiting' as DailyPlanState } : p
      ),
      events: [...s.events, {
        id: uuid(), taskId, actorId: currentUserId,
        type: 'handoff' as ActivityEventType,
        metadata: { waitingOn: data.waitingOnTeam, requestType: data.requestType, note: data.note },
        createdAt: new Date().toISOString(),
      }],
    }));
  },

  responseReceived: (taskId) => {
    const { currentUserId } = get();
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? {
          ...t, stakeholderState: 'active' as StakeholderState,
          responseReceivedAt: new Date().toISOString(),
          waitingOnTeam: null, waitingRequestType: null,
          updatedAt: new Date().toISOString(),
        } : t
      ),
      planItems: s.planItems.map((p) =>
        p.taskId === taskId && p.date === todayStr() ? { ...p, state: 'active' as DailyPlanState } : p
      ),
      events: [...s.events, {
        id: uuid(), taskId, actorId: currentUserId,
        type: 'response_received' as ActivityEventType,
        createdAt: new Date().toISOString(),
      }],
    }));
  },

  closeTask: (taskId) => {
    const { currentUserId } = get();
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? {
          ...t, stakeholderState: 'done' as StakeholderState, closedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : t
      ),
      planItems: s.planItems.map((p) =>
        p.taskId === taskId && p.date === todayStr() ? { ...p, state: 'done' as DailyPlanState } : p
      ),
      events: [...s.events, {
        id: uuid(), taskId, actorId: currentUserId,
        type: 'closed' as ActivityEventType, createdAt: new Date().toISOString(),
      }],
    }));
  },

  // ─── Inbox ───
  addInboxItem: (data) => {
    const { currentUserId, team } = get();
    const item: InboxItem = {
      id: uuid(), teamId: team.id, createdByUserId: currentUserId,
      title: data.title, channel: data.channel, sourceTeam: data.sourceTeam,
      type: data.type, gmailThreadUrl: data.gmailThreadUrl || null,
      externalLinks: data.externalLinks || [], notes: data.notes || null,
      status: 'new', linkedTaskId: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    set((s) => ({ inboxItems: [...s.inboxItems, item] }));
  },

  convertInboxToTask: (inboxId, ownerId) => {
    const { team } = get();
    const inbox = get().inboxItems.find((i) => i.id === inboxId);
    if (!inbox) return;
    const taskId = uuid();
    const task: Task = {
      id: taskId, title: inbox.title, ownerId, teamId: team.id,
      priority: 'med', sourceTeam: inbox.sourceTeam, channel: inbox.channel,
      stakeholderState: 'active', blockedFlag: false,
      gmailThreadUrl: inbox.gmailThreadUrl || null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    set((s) => ({
      tasks: [...s.tasks, task],
      inboxItems: s.inboxItems.map((i) =>
        i.id === inboxId ? { ...i, status: 'converted' as InboxStatus, linkedTaskId: taskId, updatedAt: new Date().toISOString() } : i
      ),
    }));
  },

  linkInboxToTask: (inboxId, taskId) =>
    set((s) => ({
      inboxItems: s.inboxItems.map((i) =>
        i.id === inboxId ? { ...i, status: 'linked' as InboxStatus, linkedTaskId: taskId, updatedAt: new Date().toISOString() } : i
      ),
    })),

  archiveInboxItem: (inboxId) =>
    set((s) => ({
      inboxItems: s.inboxItems.map((i) =>
        i.id === inboxId ? { ...i, status: 'archived' as InboxStatus, updatedAt: new Date().toISOString() } : i
      ),
    })),

  // ─── Wrap ───
  wrapDay: () => {
    const { currentUserId, planItems, unplannedLogs, dayWraps } = get();
    const date = todayStr();
    const todayPlans = planItems.filter((p) => p.userId === currentUserId && p.date === date);
    const todayUnplanned = unplannedLogs.filter((u) =>
      u.userId === currentUserId && u.dateTime.startsWith(date)
    );

    // Validation: planned items must have actualPct
    const missingActual = todayPlans.filter((p) => p.actualPct === null);
    if (missingActual.length > 0) return false;

    // Validation: unplanned must have status
    const missingStatus = todayUnplanned.filter((u) => !u.status);
    if (missingStatus.length > 0) return false;

    const wrap: DayWrap = { userId: currentUserId, date, status: 'wrapped', wrappedAt: new Date().toISOString() };
    set((s) => ({ dayWraps: [...s.dayWraps, wrap] }));
    return true;
  },

  getDayWrap: (date) => get().dayWraps.find((w) => w.userId === get().currentUserId && w.date === date),

  // ─── Helpers ───
  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getUserById: (id) => get().users.find((u) => u.id === id),
  getEventsForTask: (taskId) => get().events.filter((e) => e.taskId === taskId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),

  getTodayPlanItems: (userId) => {
    const uid = userId || get().currentUserId;
    return get().planItems.filter((p) => p.userId === uid && p.date === todayStr());
  },

  getTodayUnplanned: (userId) => {
    const uid = userId || get().currentUserId;
    const date = todayStr();
    return get().unplannedLogs.filter((u) => u.userId === uid && u.dateTime.startsWith(date));
  },
}));
