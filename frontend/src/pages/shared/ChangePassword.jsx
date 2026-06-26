import { useState } from 'react';
import api from '../../services/api';

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword !== form.confirm) { setMsg({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' }); return; }
    try {
      await api.post('/auth/change-password', { oldPassword: form.oldPassword, newPassword: form.newPassword });
      setMsg({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ' });
      setForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
    }
  };

  return (
    <div className="max-w-sm">
      <h2 className="font-semibold text-xl tracking-tight mb-4">เปลี่ยนรหัสผ่าน</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 space-y-3">
        {['oldPassword', 'newPassword', 'confirm'].map((f, i) => (
          <div key={f}>
            <label className="text-sm block mb-1">{['รหัสผ่านเดิม', 'รหัสผ่านใหม่', 'ยืนยันรหัสผ่านใหม่'][i]}</label>
            <input type="password" className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))} required />
          </div>
        ))}
        {msg && <p className={`text-sm ${msg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{msg.text}</p>}
        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors">บันทึก</button>
      </form>
    </div>
  );
}
