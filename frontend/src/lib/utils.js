import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Dates in this DB are stored as Buddhist Era years (e.g. 2568-06-10).
// Using toLocaleDateString('th-TH') would add 543 again → wrong.
// This function just reformats yyyy-mm-dd → d/m/yyyy as-is.
export function fmtDate(dateStr) {
  if (!dateStr) return '-';
  const s = String(dateStr).substring(0, 10);
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return '-';
  return `${parseInt(d)}/${parseInt(m)}/${y}`;
}
