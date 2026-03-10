import type {
  User, Team, Task, DailyPlanItem, UnplannedLog,
  InboxItem, DayWrap, ActivityEvent,
} from '@/types';

// ─── Seed Users & Team ───
export const TEAM: Team = {
  id: 'team-1',
  name: 'River IT Ops',
  standupTime: '10:30',
};

export const USERS: User[] = [
  { id: 'u1', name: 'Priya Sharma', email: 'priya@river.com', role: 'manager', teamId: 'team-1' },
  { id: 'u2', name: 'Arjun Mehta', email: 'arjun@river.com', role: 'employee', teamId: 'team-1' },
  { id: 'u3', name: 'Neha Gupta', email: 'neha@river.com', role: 'employee', teamId: 'team-1' },
  { id: 'u4', name: 'Rahul Singh', email: 'rahul@river.com', role: 'employee', teamId: 'team-1' },
  { id: 'u5', name: 'Meera Patel', email: 'meera@river.com', role: 'employee', teamId: 'team-1' },
  { id: 'u6', name: 'Kunal Das', email: 'kunal@river.com', role: 'employee', teamId: 'team-1' },
  { id: 'u7', name: 'Sneha Joshi', email: 'sneha@river.com', role: 'employee', teamId: 'team-1' },
];

const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

export const SEED_TASKS: Task[] = [
  {
    id: 't1', title: 'Fix PO sync failure with SAP', description: 'PO items not syncing since Monday', ownerId: 'u2', teamId: 'team-1',
    priority: 'high', sourceTeam: 'Factory Ops', channel: 'Gmail', stakeholderState: 'active',
    blockedFlag: false, gmailThreadUrl: 'https://mail.google.com/thread/abc123',
    createdAt: '2026-02-14T09:00:00Z', updatedAt: now,
  },
  {
    id: 't2', title: 'Provision new user access – Finance', description: 'New joiner needs ERP access', ownerId: 'u3', teamId: 'team-1',
    priority: 'med', sourceTeam: 'Finance', channel: 'Gmail', stakeholderState: 'waiting',
    waitingOnTeam: 'Finance', waitingRequestType: 'Approve', expectedBy: '24h',
    handoffAt: '2026-02-15T14:00:00Z', blockedFlag: false,
    createdAt: '2026-02-13T10:00:00Z', updatedAt: now,
  },
  {
    id: 't3', title: 'Month-end inventory report automation', ownerId: 'u4', teamId: 'team-1',
    priority: 'med', sourceTeam: 'Stores', channel: 'Meeting', stakeholderState: 'active',
    blockedFlag: false, createdAt: '2026-02-10T08:00:00Z', updatedAt: now,
  },
  {
    id: 't4', title: 'Resolve intermittent VPN drops', ownerId: 'u5', teamId: 'team-1',
    priority: 'high', sourceTeam: 'Leadership', channel: 'Call', stakeholderState: 'active',
    blockedFlag: true, blockedReason: 'Waiting for ISP ticket response',
    createdAt: '2026-02-12T11:00:00Z', updatedAt: now,
  },
  {
    id: 't5', title: 'Update HRMS leave module config', ownerId: 'u6', teamId: 'team-1',
    priority: 'low', sourceTeam: 'Finance', channel: 'Gmail', stakeholderState: 'done',
    closedAt: '2026-02-16T17:00:00Z', blockedFlag: false,
    createdAt: '2026-02-08T09:00:00Z', updatedAt: now,
  },
  {
    id: 't6', title: 'Deploy label printer firmware update', ownerId: 'u7', teamId: 'team-1',
    priority: 'med', sourceTeam: 'Factory Ops', channel: 'Walk-up', stakeholderState: 'waiting',
    waitingOnTeam: 'Factory Ops', waitingRequestType: 'Test', expectedBy: '3 days',
    handoffAt: '2026-02-16T10:00:00Z', blockedFlag: false,
    createdAt: '2026-02-15T08:00:00Z', updatedAt: now,
  },
  {
    id: 't7', title: 'Setup staging environment for SCM module', ownerId: 'u2', teamId: 'team-1',
    priority: 'med', sourceTeam: 'Supply Chain', channel: 'Gmail', stakeholderState: 'active',
    blockedFlag: false, createdAt: '2026-02-16T09:00:00Z', updatedAt: now,
  },
];

export const SEED_PLAN_ITEMS: DailyPlanItem[] = [
  { id: 'dp1', userId: 'u2', date: today, taskId: 't1', state: 'active', targetPct: 75, actualPct: null },
  { id: 'dp2', userId: 'u2', date: today, taskId: 't7', state: 'active', targetPct: 50, actualPct: null },
  { id: 'dp3', userId: 'u3', date: today, taskId: 't2', state: 'waiting', targetPct: 100, actualPct: null },
  { id: 'dp4', userId: 'u4', date: today, taskId: 't3', state: 'active', targetPct: 50, actualPct: null },
  { id: 'dp5', userId: 'u5', date: today, taskId: 't4', state: 'blocked', targetPct: 50, actualPct: null },
  { id: 'dp6', userId: 'u7', date: today, taskId: 't6', state: 'waiting', targetPct: 100, actualPct: null },
];

export const SEED_UNPLANNED: UnplannedLog[] = [
  {
    id: 'up1', userId: 'u2', dateTime: `${today}T10:15:00Z`, title: 'Urgent password reset for factory manager',
    channel: 'Call', sourceTeam: 'Factory Ops', reasonCode: 'Access', impact: 'med',
    complianceFlag: false, status: 'handled', addedToToday: false,
  },
  {
    id: 'up2', userId: 'u4', dateTime: `${today}T11:30:00Z`, title: 'Data correction request from Stores',
    channel: 'Gmail', sourceTeam: 'Stores', reasonCode: 'Data fix', impact: 'high',
    complianceFlag: true, status: 'spilled', addedToToday: true,
  },
];

export const SEED_INBOX: InboxItem[] = [
  {
    id: 'in1', teamId: 'team-1', createdByUserId: 'u2', title: 'New barcode scanner integration request',
    channel: 'Gmail', sourceTeam: 'Factory Ops', type: 'request',
    gmailThreadUrl: 'https://mail.google.com/thread/xyz789', externalLinks: [],
    status: 'new', createdAt: `${today}T08:00:00Z`, updatedAt: `${today}T08:00:00Z`,
  },
  {
    id: 'in2', teamId: 'team-1', createdByUserId: 'u3', title: 'Validate payroll export file format',
    channel: 'Gmail', sourceTeam: 'Finance', type: 'validation',
    externalLinks: ['https://drive.google.com/file/123'], status: 'new',
    createdAt: `${today}T09:30:00Z`, updatedAt: `${today}T09:30:00Z`,
  },
  {
    id: 'in3', teamId: 'team-1', createdByUserId: 'u5', title: 'FYI: Updated network topology doc',
    channel: 'Gmail', sourceTeam: 'Leadership', type: 'file',
    externalLinks: ['https://drive.google.com/file/456'], status: 'new',
    createdAt: '2026-02-16T14:00:00Z', updatedAt: '2026-02-16T14:00:00Z',
  },
];

export const SEED_DAY_WRAPS: DayWrap[] = [];

export const SEED_EVENTS: ActivityEvent[] = [
  { id: 'ev1', taskId: 't1', actorId: 'u2', type: 'created', createdAt: '2026-02-14T09:00:00Z' },
  { id: 'ev2', taskId: 't1', actorId: 'u2', type: 'plan_added', createdAt: '2026-02-14T09:05:00Z' },
  { id: 'ev3', taskId: 't2', actorId: 'u3', type: 'handoff', metadata: { waitingOn: 'Finance' }, createdAt: '2026-02-15T14:00:00Z' },
  { id: 'ev4', taskId: 't5', actorId: 'u6', type: 'closed', createdAt: '2026-02-16T17:00:00Z' },
];
