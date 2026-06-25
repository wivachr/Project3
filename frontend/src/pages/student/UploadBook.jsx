import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function UploadBook() {
  const [project, setProject] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/projects/my').then(r => setProject(r.data)).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!file || !project) return;
    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/projects/${project.id_project}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('อัปโหลดสำเร็จ');
      setFile(null);
    } catch (e) {
      setMsg(e.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setUploading(false); }
  };

  if (loading) return <p className="text-muted-foreground text-sm">กำลังโหลด...</p>;

  return (
    <div className="max-w-md">
      <h2 className="font-semibold text-xl mb-4 tracking-tight">อัปโหลดเล่มรายงาน</h2>

      {!project ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-700">
          ยังไม่มีข้อมูลโครงการ
        </div>
      ) : (
        <>
          <div className="bg-card border rounded-lg p-4 mb-4 text-sm">
            <p><span className="font-medium">โครงการ:</span> {project.name_project}</p>
            {project.torgor_project && (
              <p className="mt-1"><span className="font-medium">ไฟล์ปัจจุบัน:</span>{' '}
                <a href={`http://localhost:5000${project.torgor_project}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  ดาวน์โหลด
                </a>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">เลือกไฟล์ (PDF)</label>
              <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="w-full border rounded px-3 py-1.5 text-sm mt-1 file:mr-3 file:border-0 file:bg-primary/10 file:text-primary file:rounded file:px-3 file:py-1 file:text-sm" />
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
            </button>
            {msg && <p className={`text-sm ${msg.includes('สำเร็จ') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
          </div>
        </>
      )}
    </div>
  );
}
