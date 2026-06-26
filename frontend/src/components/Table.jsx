import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export function Table({ columns, data, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        กำลังโหลด...
      </div>
    </div>
  );
  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map(col => (
              <th key={col.key} className={cn('h-10 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                ไม่พบข้อมูล
              </td>
            </tr>
          )}
          {data.map((row, i) => (
            <tr key={i} className="border-b transition-colors hover:bg-muted/30 last:border-0">
              {columns.map(col => (
                <td key={col.key} className={cn('px-4 py-3 align-middle', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function pageWindow(page, totalPages) {
  const delta = 2;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);
  const middle = [];
  for (let i = left; i <= right; i++) middle.push(i);
  const result = [1];
  if (left > 2) result.push('…');
  result.push(...middle);
  if (right < totalPages - 1) result.push('…');
  if (totalPages > 1) result.push(totalPages);
  return result;
}

export function Pagination({ page, total, limit, onPage }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  const items = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : pageWindow(page, totalPages);
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >‹</button>
      {items.map((p, i) =>
        p === '…'
          ? <span key={`dots-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
          : <button
              key={p}
              onClick={() => onPage(p)}
              className={cn(
                'inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm transition-colors',
                p === page
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-accent'
              )}
            >{p}</button>
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >›</button>
    </div>
  );
}

export function SearchBar({ value, onChange, onSearch, placeholder = 'ค้นหา...' }) {
  return (
    <div className="flex gap-2 mb-4">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          placeholder={placeholder}
        />
      </div>
      <button
        onClick={onSearch}
        className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        ค้นหา
      </button>
    </div>
  );
}
