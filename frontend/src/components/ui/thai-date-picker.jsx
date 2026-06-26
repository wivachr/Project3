import { cn } from '@/lib/utils';

// DB stores Buddhist Era dates (e.g. "2569-06-08").
// Native <input type="date"> with lang="th" shows BE year when given CE value.
// So we subtract 543 going in, add 543 coming out.

function beToce(beStr) {
  if (!beStr) return '';
  const [y, m, d] = beStr.split('-');
  const ceYear = parseInt(y) - 543;
  if (isNaN(ceYear) || ceYear < 1) return '';
  return `${ceYear}-${m}-${d}`;
}

function cetobe(ceStr) {
  if (!ceStr) return '';
  const [y, m, d] = ceStr.split('-');
  return `${parseInt(y) + 543}-${m}-${d}`;
}

export function ThaiDatePicker({ value, onChange, className, ...props }) {
  return (
    <input
      type="date"
      value={beToce(value)}
      onChange={e => onChange(cetobe(e.target.value))}
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
