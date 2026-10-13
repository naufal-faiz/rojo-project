/** Inclusive calendar range; UTC arithmetic keeps each date independent of DST. */
export function sessionDates(start: string, end: string, skipWeekends: boolean): string[] {
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  if (!Number.isFinite(cursor.getTime()) || !Number.isFinite(last.getTime()) || cursor > last) return [];
  const dates: string[] = [];
  while (cursor <= last) {
    if (!skipWeekends || (cursor.getUTCDay() !== 0 && cursor.getUTCDay() !== 6)) dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}
