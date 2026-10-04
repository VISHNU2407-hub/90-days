import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ----------------------------- numbers ----------------------------- */

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export const pct = (done: number, total: number) =>
  total <= 0 ? 0 : clamp(Math.round((done / total) * 100));

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return '0m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/* ------------------------------ dates ------------------------------ */

export const MS_DAY = 86_400_000;

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function daysBetween(a: Date, b: Date): number {
  const ax = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bx = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bx - ax) / MS_DAY);
}

export function relativeDay(dateKey: string, from = new Date()): string {
  const diff = daysBetween(parseDateKey(dateKey), from);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';
  if (diff > 0) return `${diff} days ago`;
  return `In ${-diff} days`;
}

export function formatShortDate(dateKey?: string | null): string {
  if (!dateKey) return '—';
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatLongDate(dateKey?: string | null): string {
  if (!dateKey) return '—';
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ------------------------------ misc ------------------------------ */

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function initials(name?: string | null): string {
  if (!name) return 'CO';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
