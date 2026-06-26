import { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtDate } from '@/lib/utils';

export default function PrintExamForm() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeexam, setTypeexam] = useState('1');

  useEffect(() => { loadExams(typeexam); }, [typeexam]);

  const loadExams = async (t) => {
    setLoading(true);
    try {
      // Get all exams with assignexam data for the selected type
      const res = await api.get('/exams', { params: { limit: 200, typeexam: t } });
      // Filter to those that have an assigned date
      const withDate = (res.data.data || []).filter(e => e.date_assignexam);
      setExams(withDate);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 print:hidden">
        <h2 className="font-semibold text-xl tracking-tight">พิมพ์ใบยื่นสอบ</h2>
        <select
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={typeexam}
          onChange={e => setTypeexam(e.target.value)}
        >
          <option value="1">สอบหัวข้อ</option>
          <option value="2">สอบ 60%</option>
          <option value="3">สอบ 100%</option>
        </select>
        <button onClick={() => window.print()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors">
          พิมพ์
        </button>
      </div>

      {loading ? <p className="text-muted-foreground text-sm">กำลังโหลด...</p> : exams.length === 0 ? (
        <p className="text-muted-foreground text-sm">ไม่มีข้อมูลการสอบที่กำหนดวันแล้ว</p>
      ) : (
        <div className="space-y-8">
          {exams.map(e => (
            <div key={e.id_exam} className="border rounded p-6 print:border-none print:p-4 print:break-after-page text-sm">
              <div className="text-center mb-4">
                <h3 className="font-bold text-base">ใบยื่นสอบ{e.name_typeexam}</h3>
                <p className="text-muted-foreground text-xs">ภาควิชาเทคโนโลยีสารสนเทศ คณะเทคโนโลยีและการจัดการอุตสาหกรรม</p>
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="py-1 w-40 font-medium">รหัสโครงการ</td>
                    <td className="py-1">{e.id_project}</td>
                    <td className="py-1 w-32 font-medium">วันที่สอบ</td>
                    <td className="py-1">{e.date_assignexam ? fmtDate(e.date_assignexam) : '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">ชื่อโครงการ (ไทย)</td>
                    <td className="py-1" colSpan={3}>{e.name_project}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">ชื่อโครงการ (Eng)</td>
                    <td className="py-1" colSpan={3}>{e.engname_project || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">เวลา</td>
                    <td className="py-1">{e.time_assignexam ? `${e.time_assignexam}${e.endtime_assignexam ? '-'+e.endtime_assignexam : ''}` : '-'}</td>
                    <td className="py-1 font-medium">ห้อง</td>
                    <td className="py-1">{e.name_room || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">ที่ปรึกษา</td>
                    <td className="py-1" colSpan={3}>{e.advisors || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-medium">สมาชิก</td>
                    <td className="py-1" colSpan={3}>{e.members || '-'}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-6 flex justify-between text-sm">
                <div>
                  <p>ลงชื่อ .............................................</p>
                  <p className="text-xs text-muted-foreground mt-1">(ผู้ยื่นคำร้อง)</p>
                </div>
                <div>
                  <p>ลงชื่อ .............................................</p>
                  <p className="text-xs text-muted-foreground mt-1">(อาจารย์ที่ปรึกษา)</p>
                </div>
                <div>
                  <p>ลงชื่อ .............................................</p>
                  <p className="text-xs text-muted-foreground mt-1">(หัวหน้าภาควิชา)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
