import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ROLE_PATH = { 1: '/admin', 2: '/officer', 3: '/teacher', 4: '/student' };

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [ay, setAy] = useState(null);

  useEffect(() => {
    if (user) navigate(ROLE_PATH[user.right] || '/');
    api.get('/news').then(r => setNews(r.data)).catch(() => {});
    api.get('/lookups/academic-year').then(r => setAy(r.data)).catch(() => {});
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form.username, form.password);
      navigate(ROLE_PATH[u.right] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header banner */}
      <div className="w-full shrink-0 overflow-hidden relative">
        <img src="/head.jpg" alt="ระบบสารสนเทศโครงการพิเศษ" className="w-full object-cover object-center max-h-28" />
        {ay && (
          <div className="absolute bottom-2 left-4 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            ภาคเรียนที่ {ay.semester} ปีการศึกษา {ay.year}
          </div>
        )}
      </div>

      <div className="flex flex-1 gap-6 p-6 max-w-5xl mx-auto w-full">
        {/* News panel */}
        <Card className="flex-1 min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-primary">ข่าวประชาสัมพันธ์</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {news.length === 0 && (
              <p className="text-muted-foreground text-sm">ไม่มีข่าวในขณะนี้</p>
            )}
            {news.map(n => (
              <div key={n.id_news} className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                {n.topic_news && <p className="font-semibold text-sm mb-0.5">{n.topic_news}</p>}
                <p className="text-xs text-muted-foreground mb-1">
                  {fmtDate(n.date_news)}
                </p>
                <div className="text-sm break-words" dangerouslySetInnerHTML={{ __html: n.detail_news }} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Login form */}
        <div className="w-80 shrink-0">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <img src="/logo.png" alt="logo" className="h-20 w-20 object-contain" />
              </div>
              <CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle>
              <CardDescription>ระบบสารสนเทศโครงการพิเศษ</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <p className="text-destructive text-sm rounded-md bg-destructive/10 px-3 py-2">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </form>
              <div className="mt-3 text-center">
                <button
                  onClick={() => navigate('/register-project')}
                  className="text-xs text-primary hover:underline"
                >
                  ลงทะเบียนโครงงานใหม่
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
