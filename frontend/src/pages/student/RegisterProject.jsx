import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const emptyForm = {
  id_student: '', name_project: '', engname_project: '',
  casestudy_project: '', engcasestudy_project: '',
  id_subject: '', address_project: '', email_project: '',
  tel: '', id_teacher: '', password: '', repassword: '',
};

export default function RegisterProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [checkMsg, setCheckMsg] = useState('');
  const [msg, setMsg] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/lookups/teachers-public'),
      api.get('/lookups/subjects-public'),
    ]).then(([t, s]) => {
      setTeachers(t.data || []);
      setSubjects(s.data || []);
    }).catch(() => {});
  }, []);

  const checkStudent = async () => {
    if (!form.id_student) return;
    setCheckMsg('');
    setStudentInfo(null);
    try {
      const res = await api.get(`/students/check/${form.id_student}`);
      const data = res.data;
      setStudentInfo(data);

      if (!data.is_registered) {
        setCheckMsg('ไม่พบรหัสนักศึกษาในระบบลงทะเบียนภาคการศึกษาปัจจุบัน');
        return;
      }
      if (data.has_active_project) {
        setCheckMsg('นักศึกษานี้มีโครงการในปีการศึกษาปัจจุบันแล้ว ไม่สามารถลงทะเบียนซ้ำได้');
        return;
      }
      if (data.old_project) {
        const op = data.old_project;
        setForm(f => ({
          ...f,
          name_project: op.name_project || '',
          engname_project: op.engname_project || '',
          casestudy_project: op.casestudy_project || '',
          engcasestudy_project: op.engcasestudy_project || '',
          id_subject: op.id_subject ? String(op.id_subject) : f.id_subject,
        }));
        setCheckMsg('__old__');
      }
    } catch {
      setCheckMsg('ไม่พบรหัสนักศึกษาในระบบ');
    }
  };

  const handleSubmit = async () => {
    if (!form.id_student || !form.name_project || !form.password) {
      setMsg('กรุณากรอกข้อมูลให้ครบ (รหัสนักศึกษา, ชื่อโครงการ, รหัสผ่าน)');
      return;
    }
    if (!studentInfo || !studentInfo.is_registered) {
      setMsg('กรุณาตรวจสอบรหัสนักศึกษาก่อนลงทะเบียน');
      return;
    }
    if (studentInfo.has_active_project) {
      setMsg('นักศึกษานี้มีโครงการในปีการศึกษาปัจจุบันแล้ว');
      return;
    }
    if (form.password !== form.repassword) { setMsg('รหัสผ่านไม่ตรงกัน'); return; }
    setMsg('');
    try {
      const res = await api.post('/projects/register', form);
      setResult(res.data);
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const f = (k, lbl, opts = {}) => (
    <div key={k} className="flex items-start gap-2">
      <label className="text-sm w-52 shrink-0 pt-2">{lbl}{opts.req && <span className="text-red-500">*</span>}</label>
      <input
        type={opts.type || 'text'}
        className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={form[k]}
        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
        onBlur={k === 'id_student' ? checkStudent : undefined}
      />
    </div>
  );

  if (result) return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-lg border bg-card shadow-sm">
      <h2 className="font-bold text-lg text-emerald-600 mb-3">ลงทะเบียนโครงงานสำเร็จ!</h2>
      <p className="text-sm mb-1"><span className="font-medium">รหัสโครงการ / ชื่อผู้ใช้:</span> {result.username}</p>
      <p className="text-sm text-muted-foreground mb-4">กรุณาจดบันทึก username นี้ไว้ เพื่อใช้เข้าสู่ระบบ</p>
      <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">
        เข้าสู่ระบบ
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 rounded-lg border bg-card shadow-sm">
      <h2 className="font-bold text-xl mb-1">ลงทะเบียนโครงงานพิเศษ</h2>
      <p className="text-xs text-muted-foreground mb-5">กรอกข้อมูลให้ครบถ้วน หลังจากลงทะเบียนระบบจะแสดง username สำหรับเข้าสู่ระบบ</p>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <label className="text-sm w-52 shrink-0 pt-2">รหัสนักศึกษา<span className="text-red-500">*</span></label>
          <div className="flex-1 flex gap-2">
            <input
              className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.id_student}
              onChange={e => { setForm(f => ({ ...f, id_student: e.target.value })); setStudentInfo(null); setCheckMsg(''); }}
            />
            <button onClick={checkStudent} className="border border-input bg-background px-3 py-1 rounded-md text-sm hover:bg-accent transition-colors whitespace-nowrap">ตรวจสอบ</button>
          </div>
        </div>
        {checkMsg && checkMsg !== '__old__' && (
          <p className={`text-xs ml-52 ${checkMsg.startsWith('ไม่') || checkMsg.includes('มีโครงการ') ? 'text-red-500' : 'text-amber-600'}`}>
            {checkMsg}
          </p>
        )}
        {studentInfo && studentInfo.is_registered && !studentInfo.has_active_project && (
          <div className="ml-52 space-y-1">
            <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
              พบ: {studentInfo.name_title}{studentInfo.name_student} {studentInfo.sname_student} — {studentInfo.name_department || studentInfo.name_faculty}
            </div>
            {checkMsg === '__old__' && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                พบโครงการเดิมที่สำเร็จแล้ว — กรอกข้อมูลชื่อโครงการจากโครงการเก่าให้อัตโนมัติแล้ว สามารถแก้ไขได้
              </div>
            )}
          </div>
        )}

        {f('name_project', 'ชื่อโครงงาน (ภาษาไทย)', { req: true })}
        {f('engname_project', 'ชื่อโครงงาน (ภาษาอังกฤษ)')}
        {f('casestudy_project', 'กรณีศึกษา (ภาษาไทย)')}
        {f('engcasestudy_project', 'กรณีศึกษา (ภาษาอังกฤษ)')}

        <div className="flex items-start gap-2">
          <label className="text-sm w-52 shrink-0 pt-2">อาจารย์ที่ปรึกษา</label>
          <select
            className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.id_teacher}
            onChange={e => setForm(f => ({ ...f, id_teacher: e.target.value }))}
          >
            <option value="">--- เลือกอาจารย์ ---</option>
            {teachers.map(t => (
              <option key={t.id_teacher} value={t.id_teacher}>
                {t.name_academictitle}{t.name_teacher} {t.sname_teacher}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-start gap-2">
          <label className="text-sm w-52 shrink-0 pt-2">วิชา</label>
          <select
            className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.id_subject}
            onChange={e => setForm(f => ({ ...f, id_subject: e.target.value }))}
          >
            <option value="">--- เลือกวิชา ---</option>
            {subjects.map(s => (
              <option key={s.id_subject} value={s.id_subject}>{s.id_subject} {s.name_subject}</option>
            ))}
          </select>
        </div>

        {f('tel', 'โทรศัพท์')}
        {f('email_project', 'อีเมล')}
        {f('address_project', 'ที่อยู่')}
        {f('password', 'รหัสผ่าน', { req: true, type: 'password' })}
        {f('repassword', 'ยืนยันรหัสผ่าน', { req: true, type: 'password' })}
      </div>

      {msg && <p className="text-red-500 text-sm mt-3">{msg}</p>}
      <div className="flex gap-2 mt-5">
        <button onClick={handleSubmit} className="bg-primary text-primary-foreground px-6 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">
          ลงทะเบียน
        </button>
        <button onClick={() => navigate('/')} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
