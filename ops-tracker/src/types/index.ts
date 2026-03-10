// ─── Core Data Types ─── (aligned with SRS Section 8)

export type Role = 'employee' | 'manager' | 'admin';
export type Priority = 'low' | 'med' | 'high';
export type StakeholderState = 'active' | 'waiting' | 'done';
export type DailyPlanState = 'active' | 'waiting' | 'blocked' | 'done';
export type PercentBucket = 0 | 25 | 50 | 75 | 100;
export type EffortBucket = '< 15 min' | '15–30 min' | '30–60 min' | '1–2 hrs' | '2–4 hrs' | '4+ hrs';
export type UnplannedStatus = 'handled' | 'spilled';
export type DayStatus = 'open' | 'wrapped';
export type Impact = 'low' | 'med' | 'high';

export type Channel = 'Gmail' | 'Call' | 'Walk-up' | 'Meeting';
export type SourceTeam = 'Factory Ops' | 'Stores' | 'Finance' | 'Supply Chain' | 'Leadership' | 'Other';
export type ReasonCode = 'Incident' | 'Access' | 'Data fix' | 'Escalation' | 'Month-end' | 'Other';
export type WaitingRequestType = 'Approve' | 'Confirm' | 'Test' | 'Provide info' | 'Schedule' | 'Other';
export type ExpectedBy = 'Today' | '24h' | '3 days' | 'custom';
export type InboxItemType = 'request' | 'validation' | 'file' | 'email_thread' | 'other';
export type InboxStatus = 'new' | 'triaged' | 'converted' | 'linked' | 'archived';

export type ActivityEventType =
  | 'created'
  | 'plan_added'
  | 'percent_updated'
  | 'handoff'
  | 'response_received'
  | 'blocked'
  | 'unblocked'
  | 'closed';

// ─── Entities ───

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: string;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  standupTime: string; // "10:30"
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  ownerId: string | null;
  teamId: string;
  priority: Priority;
  sourceTeam: SourceTeam;
  channel: Channel;
  stakeholderState: StakeholderState;
  waitingOnTeam?: string | null;
  waitingRequestType?: WaitingRequestType | null;
  expectedBy?: string | null;
  handoffAt?: string | null;
  responseReceivedAt?: string | null;
  blockedFlag: boolean;
  blockedReason?: string | null;
  gmailThreadUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
}

export interface DailyPlanItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  taskId: string;
  state: DailyPlanState;
  targetPct: PercentBucket;
  actualPct: PercentBucket | null;
  effortBucket?: EffortBucket | null;
  note?: string | null;
}

export interface UnplannedLog {
  id: string;
  userId: string;
  dateTime: string;
  title: string;
  channel: Channel;
  sourceTeam: SourceTeam;
  reasonCode: ReasonCode;
  impact?: Impact | null;
  complianceFlag: boolean;
  effortBucket?: EffortBucket | null;
  status: UnplannedStatus;
  taskId?: string | null;
  gmailThreadUrl?: string | null;
  addedToToday: boolean;
}

export interface InboxItem {
  id: string;
  teamId: string;
  createdByUserId: string;
  title: string;
  channel: Channel;
  sourceTeam: SourceTeam;
  type: InboxItemType;
  gmailThreadUrl?: string | null;
  externalLinks: string[];
  notes?: string | null;
  status: InboxStatus;
  linkedTaskId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayWrap {
  userId: string;
  date: string; // YYYY-MM-DD
  status: DayStatus;
  wrappedAt?: string | null;
}

export interface ActivityEvent {
  id: string;
  taskId: string;
  actorId: string;
  type: ActivityEventType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
