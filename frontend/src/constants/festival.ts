/**
 * The festival the dashboard counts down to. The previous portal hard-coded
 * this date in the Blade view; keeping it here means one edit per year.
 */
export const FESTIVAL_COUNTDOWN = {
  name: 'Mahalaya',
  /** ISO date, interpreted as UTC midnight. */
  date: '2026-10-16',
} as const;

/** Whole days from `from` until `isoDate`, never negative. */
export function daysUntil(isoDate: string, from: Date = new Date()): number {
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(target)) return 0;

  const days = Math.round((target - from.getTime()) / 86_400_000);

  return Math.max(days, 0);
}
