import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function ProjectForm({ project, subjects, academicYear, onSave, onCancel }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    id_subject: project?.id_subject || '',
    name_project: project?.name_project || '',
    engname_project: project?.engname_project || '',
    casestudy_project: project?.casestudy_project || '',
    engcasestudy_project: project?.engcasestudy_project || '',
    address_project: project?.address_project || '',
    email_project: project?.email_project || '',
    year_project: project?.year_project || academicYear?.year || '',
    semester_project: project?.semester_project || academicYear?.semester || '',
    section_project: project?.section_project || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name_project || !form.id_subject) { setMsg('กรุณากรอกชื่อโครงการและวิชา'); return; }
    setSaving(true); setMsg('');
    try {
      if (project) {
        await api.put(`/projects/${project.id_project}`, form);
      } else {
        await api.post('/projects', form);
      }
      onSave();
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  const F = ({ label, children, required }) => (
    <div className="grid grid-cols-3 gap-2 items-start py-2 border-b last:border-0">
      <label className="text-sm text-gray-600 pt-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="col-span-2">{children}</div>
    </div>
  );
  const input = (k, placeholder = '') => (
    <input className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:outline-none focus:border-blue-500"
      value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} />
  );
  const textarea = (k) => (
    <textarea className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:outline-none focus:border-blue-500 h-16 resize-none"
      value={form[k]} onChange={e => set(k, e.target.value)} />
  );

  return (
    <div className="bg-card border rounded-lg p-4 max-w-2xl">
      <h3 className="font-bold text-blue-800 mb-3">{project ? 'แก้ไขข้อมูลโครงการ' : 'สร้างโครงการใหม่'}</h3>
      <F label="วิชา" required>
        <select className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.id_subject} onChange={e => set('id_subject', e.target.value)}>
          <option value="">-- เลือกวิชา --</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </F>
      <F label="ชื่อโครงการ (ไทย)" required>{input('name_project', 'ชื่อโครงการภาษาไทย')}</F>
      <F label="ชื่อโครงการ (อังกฤษ)">{input('engname_project', 'Project name in English')}</F>
      <F label="กรณีศึกษา">{textarea('casestudy_project')}</F>
      <F label="กรณีศึกษา (อังกฤษ)">{textarea('engcasestudy_project')}</F>
      <F label="ที่อยู่กรณีศึกษา">{textarea('address_project')}</F>
      <F label="อีเมลกรณีศึกษา">{input('email_project', 'email@example.com')}</F>
      <F label="ปีการศึกษา">{input('year_project', 'เช่น 2567')}</F>
      <F label="ภาคเรียน">
        <select className="w-full flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.semester_project} onChange={e => set('semester_project', e.target.value)}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </F>
      <F label="กลุ่มเรียน">{input('section_project', 'เช่น 1')}</F>

      {msg && <p className="text-red-500 text-sm mt-2">{msg}</p>}
      <div className="flex gap-2 mt-4">
        <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-5 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button onClick={onCancel} className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors">ยกเลิก</button>
      </div>
    </div>
  );
}

function MemberSection({ project, onUpdated }) {
  const [members, setMembers] = useState(project.members || []);
  const [form, setForm] = useState({ id_student: '', tel_manipulator: '' });
  const [msg, setMsg] = useState('');
  const [adding, setAdding] = useState(false);

  const refresh = async () => {
    const r = await api.get(`/projects/${project.id_project}/members`);
    setMembers(r.data);
  };

  const handleAdd = async () => {
    if (!form.id_student) { setMsg('กรุณากรอกรหัสนักศึกษา'); return; }
    setMsg('');
    try {
      await api.post(`/projects/${project.id_project}/members`, form);
      setForm({ id_student: '', tel_manipulator: '' });
      setAdding(false);
      refresh();
      onUpdated?.();
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleRemove = async (mid) => {
    if (!window.confirm('ลบสมาชิกนี้?')) return;
    await api.delete(`/projects/${project.id_project}/members/${mid}`);
    refresh();
    onUpdated?.();
  };

  return (
    <div className="mt-4 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">ผู้จัดทำโครงการ</h3>
        <button onClick={() => setAdding(a => !a)} className="text-xs text-primary hover:underline">
          {adding ? 'ยกเลิก' : '+ เพิ่มผู้จัดทำ'}
        </button>
      </div>

      {adding && (
        <div className="bg-blue-50 rounded p-3 mb-3 space-y-2">
          <div className="flex gap-2">
            <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-1"
              placeholder="รหัสนักศึกษา (13 หลัก)" value={form.id_student}
              onChange={e => setForm(f => ({ ...f, id_student: e.target.value }))} />
            <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-36"
              placeholder="เบอร์โทร" value={form.tel_manipulator}
              onChange={e => setForm(f => ({ ...f, tel_manipulator: e.target.value }))} />
            <button onClick={handleAdd} className="bg-blue-700 text-white px-3 py-1.5 rounded text-sm">เพิ่ม</button>
          </div>
          {msg && <p className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600">{msg}</p>}
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">ยังไม่มีผู้จัดทำ</p>
      ) : (
        <div className="bg-white border rounded divide-y">
          {members.map(m => (
            <div key={m.id_manipulator} className="flex items-center justify-between px-4 py-2 text-sm">
              <div>
                <span className="font-medium">{m.name_title}{m.name_student} {m.sname_student}</span>
                <span className="text-gray-400 ml-2 text-xs">{m.id_student}</span>
                {m.tel_manipulator && <span className="text-gray-500 ml-2 text-xs">📞 {m.tel_manipulator}</span>}
              </div>
              <button onClick={() => handleRemove(m.id_manipulator)} className="text-xs text-red-500 hover:underline">ลบ</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoadvisorSection({ project }) {
  const [coadvisors, setCoadvisors] = useState(project.coadvisors || []);
  const [titles, setTitles] = useState([]);
  const [form, setForm] = useState({ id_title: '', name_coadvisor: '', sname_coadvisor: '' });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/lookups/titles').then(r => setTitles(r.data));
  }, []);

  const refresh = async () => {
    const r = await api.get(`/projects/${project.id_project}/coadvisors`);
    setCoadvisors(r.data);
  };

  const handleAdd = async () => {
    if (!form.name_coadvisor || !form.sname_coadvisor) { setMsg('กรุณากรอกชื่อและนามสกุล'); return; }
    setMsg('');
    try {
      await api.post(`/projects/${project.id_project}/coadvisors`, form);
      setForm({ id_title: '', name_coadvisor: '', sname_coadvisor: '' });
      setAdding(false);
      refresh();
    } catch (e) { setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleRemove = async (cid) => {
    if (!window.confirm('ลบอาจารย์ที่ปรึกษาร่วมนี้?')) return;
    await api.delete(`/projects/${project.id_project}/coadvisors/${cid}`);
    refresh();
  };

  return (
    <div className="mt-4 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">อาจารย์ที่ปรึกษาร่วม</h3>
        <button onClick={() => setAdding(a => !a)} className="text-xs text-primary hover:underline">
          {adding ? 'ยกเลิก' : '+ เพิ่มที่ปรึกษาร่วม'}
        </button>
      </div>

      {adding && (
        <div className="bg-blue-50 rounded p-3 mb-3 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-28"
              value={form.id_title} onChange={e => setForm(f => ({ ...f, id_title: e.target.value }))}>
              <option value="">-- คำนำหน้า --</option>
              {titles.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-1" placeholder="ชื่อ"
              value={form.name_coadvisor} onChange={e => setForm(f => ({ ...f, name_coadvisor: e.target.value }))} />
            <input className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-1" placeholder="นามสกุล"
              value={form.sname_coadvisor} onChange={e => setForm(f => ({ ...f, sname_coadvisor: e.target.value }))} />
            <button onClick={handleAdd} className="bg-blue-700 text-white px-3 py-1.5 rounded text-sm">เพิ่ม</button>
          </div>
          {msg && <p className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600">{msg}</p>}
        </div>
      )}

      {coadvisors.length === 0 ? (
        <p className="text-muted-foreground text-sm">ยังไม่มีอาจารย์ที่ปรึกษาร่วม</p>
      ) : (
        <div className="bg-white border rounded divide-y">
          {coadvisors.map(c => (
            <div key={c.id_coadvisor} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>{c.name_title}{c.name_coadvisor} {c.sname_coadvisor}</span>
              <button onClick={() => handleRemove(c.id_coadvisor)} className="text-xs text-red-500 hover:underline">ลบ</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentProjectView() {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [academicYear, setAcademicYear] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/projects/my').then(r => setProject(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/lookups/subjects').then(r => setSubjects(r.data));
    api.get('/lookups/academic-year').then(r => setAcademicYear(r.data));
  }, []);

  if (loading) return <div className="text-muted-foreground text-sm">กำลังโหลด...</div>;

  if (!project && !editing) return (
    <div className="max-w-2xl">
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ข้อมูลโครงการ</h2>
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded text-sm mb-4">
        ยังไม่มีข้อมูลโครงการ
      </div>
      <button onClick={() => setEditing(true)} className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors">
        + สร้างโครงการใหม่
      </button>
    </div>
  );

  if (editing || (project && editing)) return (
    <div className="max-w-2xl">
      <h2 className="font-semibold text-xl mb-4 tracking-tight">ข้อมูลโครงการ</h2>
      <ProjectForm
        project={project}
        subjects={subjects}
        academicYear={academicYear}
        onSave={() => { setEditing(false); load(); }}
        onCancel={() => setEditing(false)}
      />
    </div>
  );

  const rows = [
    ['รหัสโครงการ', project.id_project],
    ['ชื่อโครงการ (ไทย)', project.name_project],
    ['ชื่อโครงการ (อังกฤษ)', project.engname_project],
    ['กรณีศึกษา', project.casestudy_project],
    ['กรณีศึกษา (อังกฤษ)', project.engcasestudy_project],
    ['ที่อยู่กรณีศึกษา', project.address_project],
    ['อีเมลกรณีศึกษา', project.email_project],
    ['ปีการศึกษา', project.year_project ? `${project.year_project} ภาค ${project.semester_project} กลุ่ม ${project.section_project}` : '-'],
    ['วิชา', project.name_subject],
    ['สถานะ', project.name_statusproject],
    ['ไฟล์รายงาน', project.torgor_project ? <a href={`http://localhost:5000${project.torgor_project}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">ดาวน์โหลด</a> : '-'],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-xl tracking-tight">ข้อมูลโครงการ</h2>
        <button onClick={() => setEditing(true)} className="text-sm text-primary hover:underline border border-blue-300 px-3 py-1 rounded">แก้ไข</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b last:border-0">
                <td className="bg-blue-50 px-4 py-2 font-medium w-44 text-gray-600">{label}</td>
                <td className="px-4 py-2">{value || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {project.committee?.length > 0 && (
        <div className="mt-4 max-w-2xl">
          <h3 className="font-bold text-sm mb-2">คณะกรรมการ</h3>
          <div className="bg-white rounded shadow divide-y">
            {project.committee.map((c, i) => (
              <div key={i} className="px-4 py-2 text-sm">
                <span className="text-gray-500 w-24 inline-block">{c.position}:</span>
                {c.name_academictitle}{c.name_title}{c.name_teacher} {c.sname_teacher}
              </div>
            ))}
          </div>
        </div>
      )}

      <CoadvisorSection project={project} />
      <MemberSection project={project} onUpdated={load} />
    </div>
  );
}
