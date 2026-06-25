import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function SubmitBook() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/book-list');
      setData(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await api.post(`/projects/${selected.id_project}/confirm-book`);
      setSelected(null);
      load();
    } finally { setConfirming(false); }
  };

  const pdfUrl = (torgor) => {
    if (!torgor) return null;
    if (torgor.startsWith('/uploads/')) return `http://localhost:5000${torgor}`;
    return `http://localhost:5000/${torgor}`;
  };

  return (
    <div>
      <h2 className="font-semibold text-xl mb-4 tracking-tight">จัดการการส่งปริญญานิพนธ์ฉบับสมบูรณ์และ CD</h2>

      {loading ? (
        <p className="text-muted-foreground text-sm">กำลังโหลด...</p>
      ) : data.length === 0 ? (
        <div className="border rounded-lg p-6 text-center text-muted-foreground text-sm">
          ไม่มีโครงการที่รอการยืนยันการส่งปริญญานิพนธ์
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">รหัสโครงการ</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">ชื่อโครงการ</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">สถานะ</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(p => (
                <tr key={p.id_project} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-mono text-xs">{p.id_project}</td>
                  <td className="px-4 py-2.5">{p.name_project}</td>
                  <td className="px-4 py-2.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-0.5 w-fit">{p.name_statusproject}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setSelected(p)}
                      className="text-xs text-primary hover:underline"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-card border rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-base">ส่งปริญญานิพนธ์ฉบับสมบูรณ์และ CD โครงงานพิเศษ รหัส {selected.id_project}</h3>
            </div>

            <div className="p-5">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <Row label="สถานะโครงงาน" value={selected.name_statusproject} />
                  <Row label="ชื่อโครงงาน" value={selected.name_project} />
                  <Row label="กรณีศึกษา" value={selected.casestudy_project || 'ไม่มีกรณีศึกษา'} />
                  <Row label="ชื่อโครงงาน (ภาษาอังกฤษ)" value={selected.engname_project} />
                  <Row label="กรณีศึกษา (ภาษาอังกฤษ)" value={selected.engcasestudy_project || 'ไม่มีกรณีศึกษา'} />
                  <tr>
                    <th className="text-right align-top pr-4 py-1.5 font-medium text-muted-foreground whitespace-nowrap w-40">ผู้จัดทำ</th>
                    <td className="py-1.5">
                      {selected.members?.map((m, i) => (
                        <div key={i}>{m.name}{m.tel ? <span className="text-muted-foreground ml-2">โทร: {m.tel}</span> : ''}</div>
                      ))}
                    </td>
                  </tr>
                  <Row label="อาจารย์ที่ปรึกษาร่วม" value={selected.coadvisor || 'ไม่มีอาจารย์ที่ปรึกษาร่วม'} />
                  <Row label="อาจารย์ที่ปรึกษา" value={selected.advisors} />
                  {selected.chairman && <Row label="ประธาน" value={selected.chairman} />}
                  {selected.committees && <Row label="กรรมการ" value={selected.committees} />}
                  <Row label="อีเมลผู้จัดทำ" value={selected.email_project} />
                  <Row label="ที่อยู่ผู้จัดทำ" value={selected.address_project} />
                  <tr>
                    <th className="text-right align-top pr-4 py-1.5 font-medium text-muted-foreground whitespace-nowrap w-40">ทก.01 (.pdf)</th>
                    <td className="py-1.5">
                      {pdfUrl(selected.torgor_project) ? (
                        <a
                          href={pdfUrl(selected.torgor_project)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          ดู ทก.
                        </a>
                      ) : (
                        <span className="text-muted-foreground">ยังไม่มีไฟล์</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-5 border-t flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {confirming ? 'กำลังบันทึก...' : 'ยืนยันการส่ง'}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="border border-input bg-background px-4 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <tr>
      <th className="text-right align-top pr-4 py-1.5 font-medium text-muted-foreground whitespace-nowrap w-40">{label}</th>
      <td className="py-1.5">{value || '-'}</td>
    </tr>
  );
}
