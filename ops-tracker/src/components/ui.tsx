'use client';

import type { PercentBucket, DailyPlanState, EffortBucket } from '@/types';

// ─── Chips ───
const stateColors: Record<DailyPlanState, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  done: 'bg-slate-100 text-slate-500 border-slate-200',
};

export function StateChip({ state }: { state: DailyPlanState }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${stateColors[state]}`}>
      {state}
    </span>
  );
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  med: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function PriorityChip({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${priorityColors[priority] || priorityColors.low}`}>
      {priority}
    </span>
  );
}

export function SourceChip({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
      {source}
    </span>
  );
}

// ─── Percent Dropdown ───
const PCT_OPTIONS: PercentBucket[] = [0, 25, 50, 75, 100];

export function PercentSelect({
  value,
  onChange,
  placeholder = '—',
}: {
  value: PercentBucket | null;
  onChange: (v: PercentBucket) => void;
  placeholder?: string;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value) as PercentBucket)}
      className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="" disabled>{placeholder}</option>
      {PCT_OPTIONS.map((p) => (
        <option key={p} value={p}>{p}%</option>
      ))}
    </select>
  );
}

// ─── Effort Bucket Dropdown ───
const EFFORT_OPTIONS: EffortBucket[] = ['< 15 min', '15–30 min', '30–60 min', '1–2 hrs', '2–4 hrs', '4+ hrs'];

export function EffortSelect({
  value,
  onChange,
}: {
  value: EffortBucket | null | undefined;
  onChange: (v: EffortBucket) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value as EffortBucket)}
      className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="" disabled>Effort</option>
      {EFFORT_OPTIONS.map((e) => (
        <option key={e} value={e}>{e}</option>
      ))}
    </select>
  );
}

// ─── Modal Shell ───
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl ${wide ? 'w-[640px]' : 'w-[480px]'} max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Button variants ───
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
