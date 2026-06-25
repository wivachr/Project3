import { fmtDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function SubmitExam({ typeexam, label, statusProject }) {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, eRes] = await Promise.all([
        api.get('/projects/my'),
        api.get('/exams/my'),
      ]);
      setProject(pRes.data);
      setExams(eRes.data.filter(e => e.id_typeexam === typeexam));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [typeexam]);

  const handleSubmit = async () => {
    if (!project) return;
    if (!window.confirm(`ยืนยันการ${label}?`)) return;
    setSubmitting(true);
    setMsg('');
    try {
      await api.post(`/projects/${project.id_project}/submit-exam`, { id_typeexam: typeexam });
      setMsg('ยื่นคำร้องสำเร็จ');
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setSubmitting(false); }
  };

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">{label}</h2>

      {!project ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-700">
          ยังไม่มีข้อมูลโครงการ กรุณาสร้างโครงการก่อน
        </div>
      ) : (
        <>
          <div className="bg-card border rounded-lg p-4 mb-4 text-sm space-y-1">
            <p><span className="font-medium">รหัสโครงการ:</span> {project.id_project}</p>
            <p><span className="font-medium">ชื่อโครงการ:</span> {project.name_project}</p>
            <p><span className="font-medium">สถานะ:</span> <span className="text-blue-700">{project.name_statusproject}</span></p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 mb-4"
          >
            {submitting ? 'กำลังส่ง...' : `ยื่น${label}`}
          </button>

          {msg && <p className={`text-sm mb-4 ${msg.includes('สำเร็จ') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}

          {exams.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-2">ประวัติการยื่น</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-800 text-white">
                      <th className="px-3 py-2 text-left">วันที่ยื่น</th>
                      <th className="px-3 py-2 text-left">วันที่สอบ</th>
                      <th className="px-3 py-2 text-left">เวลา</th>
                      <th className="px-3 py-2 text-left">ห้อง</th>
                      <th className="px-3 py-2 text-left">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((e, i) => (
                      <tr key={e.id_exam} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="px-3 py-2 border-b border-gray-100">{e.date_submitexam ? fmtDate(e.date_submitexam) : '-'}</td>
                        <td className="px-3 py-2 border-b border-gray-100">{e.date_assignexam ? fmtDate(e.date_assignexam) : '-'}</td>
                        <td className="px-3 py-2 border-b border-gray-100">{e.time_assignexam || '-'}</td>
                        <td className="px-3 py-2 border-b border-gray-100">{e.name_room || '-'}</td>
                        <td className="px-3 py-2 border-b border-gray-100">{e.name_statusproject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
