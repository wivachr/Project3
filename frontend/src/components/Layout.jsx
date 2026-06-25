import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '../services/api';

export default function Layout({ title, menuItems, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ay, setAy] = useState(null);

  useEffect(() => {
    api.get('/lookups/academic-year').then(r => setAy(r.data)).catch(() => {});
  }, []);

  const handleLogout = () => {
    if (window.confirm('ต้องการออกจากระบบ?')) {
      logout();
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-sidebar border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-8 w-8 object-contain opacity-90" />
            <span className="text-sidebar-foreground font-semibold text-sm tracking-wide">
              ระบบสารสนเทศโครงการพิเศษ
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-sidebar-foreground/70">
            {ay && (
              <span className="hidden sm:inline border border-sidebar-border rounded-full px-2.5 py-0.5 text-sidebar-foreground/60">
                ภาคเรียนที่ {ay.semester} ปีการศึกษา {ay.year}
              </span>
            )}
            <span>
              ยินดีต้อนรับ{' '}
              <span className="text-sidebar-foreground font-medium">{user?.fullname}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 bg-sidebar flex flex-col shrink-0 border-r border-sidebar-border">
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-sidebar-foreground/50 text-xs uppercase tracking-widest font-medium">{title}</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) =>
              item.path ? (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full text-left flex items-center gap-2 px-4 py-2 text-xs transition-colors',
                    isActive(item.path)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <ChevronRight className={cn('h-3 w-3 shrink-0 transition-opacity', isActive(item.path) ? 'opacity-100' : 'opacity-0')} />
                  {item.label}
                </button>
              ) : (
                <div key={item.label}>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                    {item.label}
                  </p>
                  {item.children?.map((child) => (
                    <button
                      key={child.label}
                      onClick={() => navigate(child.path)}
                      className={cn(
                        'w-full text-left flex items-center gap-2 px-6 py-1.5 text-xs transition-colors',
                        isActive(child.path)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <ChevronRight className={cn('h-3 w-3 shrink-0 transition-opacity', isActive(child.path) ? 'opacity-100' : 'opacity-0')} />
                      {child.label}
                    </button>
                  ))}
                </div>
              )
            )}
          </nav>

          <div className="border-t border-sidebar-border p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              ออกจากระบบ
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
