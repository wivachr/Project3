import { useState } from 'react';
import api from '../../services/api';

// id_typeexam ground truth (verified against the live `typeexam` table): 1=หัวข้อ, 2=สอบร้อยเปอร์เซนต์(100%), 3=สอบหกสิบเปอร์เซนต์(60%)
const TYPE_LABELS = { 1: 'สอบหัวข้อ', 2: 'สอบ 100%', 3: 'สอบ 60%' };

const CRITERIA_TITLE = [
  { label: 'ความเหมาะสมของหัวข้อโครงการ', score: 20 },
  { label: 'ความเหมาะสมของกรอบแนวคิด/ทฤษฎี', score: 20 },
  { label: 'ความเป็นไปได้ของโครงการ', score: 20 },
  { label: 'ความสมบูรณ์ของเอกสาร', score: 20 },
  { label: 'การนำเสนอ', score: 20 },
];
const CRITERIA_60 = [
  { label: 'ความก้าวหน้าของโครงการ', score: 30 },
  { label: 'ความสมบูรณ์ของการดำเนินงาน', score: 30 },
  { label: 'ความถูกต้องของระเบียบวิธีวิจัย', score: 20 },
  { label: 'การนำเสนอ', score: 20 },
];
const CRITERIA_100 = [
  { label: 'ความสมบูรณ์ของโครงการ', score: 30 },
  { label: 'คุณภาพของผลงาน', score: 30 },
  { label: 'ความถูกต้องของระเบียบวิธีวิจัย', score: 20 },
  { label: 'การนำเสนอและการตอบคำถาม', score: 20 },
];

// External co-advisor's 10-item satisfaction survey (report/evaluationform4.php in Project2) --
// only used for the 100%-exam type, and only when the project has a co-advisor.
const COADVISOR_ITEMS = [
  'โครงงานพิเศษที่จัดทำขึ้น ได้ตรงตามความต้องการของหน่วยงาน',
  'วิธีการออกแบบ หรือรูปแบบโครงงานพิเศษที่จัดทำขึ้นมีความเหมาะสมกับการนำไปใช้ในงาน',
  'ความสม่ำเสมอในการติดต่อประสานงานของนักศึกษาผู้จัดทำโครงงานพิเศษกับหน่วยงาน',
  'กิริยามารยาทของนักศึกษาในการติดต่อประสานงานกับหน่วยงาน',
  'นักศึกษาสามารถจัดทำโครงงานให้แล้วเสร็จตามระยะเวลาที่กำหนด',
  'มีการทดสอบ การติดตั้งระบบโครงงานพิเศษให้แก่หน่วยงานซึ่งได้นำไปใช้งานจริง',
  'มีการจัดทำคู่มือประกอบการใช้งานหรือจัดฝึกอบรมการใช้งานให้กับหน่วยงาน',
  'ความง่ายในการใช้งานของโครงงานพิเศษที่จัดทำให้แก่หน่วยงาน',
  'การนำเสนอและการตอบข้อซักถามในการสอบโครงงานพิเศษปริญญานิพนธ์',
  'ความพึงพอใจในภาพรวมของโครงงานพิเศษที่จัดทำให้แก่หน่วยงาน',
];
const COADVISOR_SCALES = ['ดีมาก', 'ดี', 'ปานกลาง', 'พอใช้', 'ต้องปรับปรุง'];

function getCriteria(type) {
  if (type === 1) return CRITERIA_TITLE;
  if (type === 3) return CRITERIA_60;
  return CRITERIA_100;
}

function ProjectHeader({ project }) {
  return (
    <table className="w-full mb-3 text-sm">
      <tbody>
        <tr>
          <td className="w-32 text-gray-600">รหัสโครงการ</td>
          <td className="font-medium">{project.id_project}</td>
          <td className="w-20 text-gray-600">ปีการศึกษา</td>
          <td>{project.year_project}/{project.semester_project}</td>
        </tr>
        <tr>
          <td className="text-gray-600 align-top">ชื่อโครงการ</td>
          <td colSpan={3} className="font-medium">{project.name_project}</td>
        </tr>
        {project.engname_project && (
          <tr>
            <td className="text-gray-600"></td>
            <td colSpan={3} className="italic text-gray-700">{project.engname_project}</td>
          </tr>
        )}
        <tr>
          <td className="text-gray-600 align-top">นักศึกษา</td>
          <td colSpan={3}>
            {project.members?.map((m, i) => (
              <span key={i}>{m.name_title}{m.name_student} {m.sname_student}{i < project.members.length - 1 ? ', ' : ''}</span>
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// One printable page per reviewer -- only that reviewer's name appears in the signature line,
// matching Project2's report/big*.php iframe fan-out (one form copy per grader).
function ReviewerPage({ project, type, reviewer }) {
  const criteria = getCriteria(type);
  return (
    <div className="print:p-4 p-8 max-w-3xl mx-auto text-sm font-['Sarabun',sans-serif] break-after-page">
      <div className="text-center mb-4">
        <p className="font-bold text-base">แบบประเมินการสอบ{TYPE_LABELS[type]}</p>
        <p className="text-xs text-gray-500">ภาควิชาวิทยาการคอมพิวเตอร์</p>
      </div>

      <ProjectHeader project={project} />

      <table className="w-full border-collapse border text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">เกณฑ์การประเมิน</th>
            <th className="border px-2 py-1 text-center w-20">คะแนนเต็ม</th>
            <th className="border px-2 py-1 text-center w-24">คะแนนที่ได้</th>
          </tr>
        </thead>
        <tbody>
          {criteria.map((c, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{c.label}</td>
              <td className="border px-2 py-1 text-center">{c.score}</td>
              <td className="border px-2 py-1"></td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-medium">
            <td className="border px-2 py-1 text-right">รวม</td>
            <td className="border px-2 py-1 text-center">100</td>
            <td className="border px-2 py-1"></td>
          </tr>
        </tbody>
      </table>

      <div className="mb-3">
        <p className="text-gray-600 mb-1">ความคิดเห็นเพิ่มเติม:</p>
        <div className="border-b border-gray-300 mb-2 h-6"></div>
        <div className="border-b border-gray-300 mb-2 h-6"></div>
      </div>

      <div className="mb-2">
        <p className="font-medium mb-1">ผลการพิจารณา:</p>
        <div className="flex gap-8">
          <label className="flex items-center gap-2"><input type="checkbox" /> ผ่าน</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> ไม่ผ่าน</label>
          <label className="flex items-center gap-2"><input type="checkbox" /> แก้ไข</label>
        </div>
      </div>

      <div className="text-center mt-8 max-w-xs mx-auto">
        <div className="border-b border-gray-400 mb-1 mt-8"></div>
        <p>{reviewer.name_academictitle || reviewer.name_title || ''}{reviewer.name_teacher || reviewer.name_coadvisor} {reviewer.sname_teacher || reviewer.sname_coadvisor}</p>
        <p className="text-xs text-gray-500">{reviewer.position}</p>
      </div>
    </div>
  );
}

// External co-advisor's dedicated satisfaction survey -- only shown for 100%-exam projects that
// have a co-advisor (report/evaluationform4.php in Project2).
function CoadvisorPage({ project, coadvisor }) {
  return (
    <div className="print:p-4 p-8 max-w-3xl mx-auto text-sm font-['Sarabun',sans-serif] break-after-page">
      <div className="text-center mb-4">
        <p className="font-bold text-base">แบบสอบถามสำหรับวิชาโครงงานพิเศษ</p>
        <p className="text-xs text-gray-500">ภาควิชาวิทยาการคอมพิวเตอร์</p>
      </div>

      <ProjectHeader project={project} />

      <p className="mb-2"><strong>คำชี้แจง</strong> โปรดทำเครื่องหมาย ✓ ลงในช่องที่เห็นว่าเหมาะสม</p>
      <table className="w-full border-collapse border text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left w-2/5">รายการ</th>
            {COADVISOR_SCALES.map(s => <th key={s} className="border px-1 py-1 text-center text-xs">{s}</th>)}
            <th className="border px-2 py-1 text-center">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {COADVISOR_ITEMS.map((item, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{i + 1}. {item}</td>
              {COADVISOR_SCALES.map(s => <td key={s} className="border px-1 py-1 text-center">&nbsp;</td>)}
              <td className="border px-2 py-1">&nbsp;</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-medium">
            <td className="border px-2 py-1 text-center">รวม</td>
            {COADVISOR_SCALES.map(s => <td key={s} className="border px-1 py-1">&nbsp;</td>)}
            <td className="border px-2 py-1">&nbsp;</td>
          </tr>
        </tbody>
      </table>

      <table className="w-full text-sm mt-8">
        <tbody>
          <tr>
            <td className="w-1/2 align-top">วันที่ …………/…………/…………</td>
            <td className="w-1/2 text-center align-top">
              ลงชื่อ …………………………………………………………………………<br />
              ( {coadvisor.name_title || ''}{coadvisor.name_coadvisor} {coadvisor.sname_coadvisor} )<br />
              ที่ปรึกษาร่วม
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function EvaluationForm() {
  const [type, setType] = useState(1);
  const [key, setKey] = useState('');
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!key.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { key, limit: 20 } });
      setProjects(res.data.data || []);
      setSelected(null);
    } finally { setLoading(false); }
  };

  const handleSelect = async (p) => {
    const res = await api.get(`/projects/${p.id_project}`);
    setSelected(res.data);
  };

  const chairman = selected?.committee?.find(c => c.position === 'ประธาน');
  const members = selected?.committee?.filter(c => c.position === 'กรรมการ') || [];
  const advisor = selected?.committee?.find(c => c.position === 'ที่ปรึกษา');
  const reviewers = selected
    ? [
        ...(chairman ? [{ ...chairman, position: 'ประธานกรรมการ' }] : []),
        ...members.map(m => ({ ...m, position: 'กรรมการ' })),
        ...(advisor ? [{ ...advisor, position: 'ที่ปรึกษา' }] : []),
      ]
    : [];
  const coadvisor = selected?.coadvisors?.[0];
  const showCoadvisorSurvey = type === 2 && !!coadvisor; // 100%-exam only, matching evaluationform4.php gating

  return (
    <div>
      <div className="print:hidden mb-6 space-y-3">
        <h2 className="font-semibold text-xl tracking-tight">พิมพ์ใบประเมินการสอบ</h2>

        <div className="flex items-center gap-3">
          <label className="text-sm">ประเภทการสอบ:</label>
          {[1, 3, 2].map(t => (
            <label key={t} className="flex items-center gap-1 text-sm cursor-pointer">
              <input type="radio" name="type" checked={type === t} onChange={() => { setType(t); setSelected(null); }} />
              {TYPE_LABELS[t]}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-1.5 text-sm w-64"
            placeholder="ค้นหารหัส/ชื่อโครงการ..."
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm hover:bg-primary/90">ค้นหา</button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">กำลังโหลด...</p>}

        {projects.length > 0 && !selected && (
          <div className="border rounded divide-y max-h-60 overflow-y-auto">
            {projects.map(p => (
              <button key={p.id_project} onClick={() => handleSelect(p)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-muted/30 flex gap-4">
                <span className="w-28 shrink-0 text-muted-foreground">{p.id_project}</span>
                <span>{p.name_project}</span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-600">เลือก: {selected.id_project} — {selected.name_project}</span>
            <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:underline">เปลี่ยน</button>
            <button onClick={() => window.print()}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm hover:bg-primary/90 ml-4">
              พิมพ์ ({reviewers.length + (showCoadvisorSurvey ? 1 : 0)} ใบ)
            </button>
          </div>
        )}
      </div>

      {selected && reviewers.map((r, i) => (
        <ReviewerPage key={i} project={selected} type={type} reviewer={r} />
      ))}
      {selected && showCoadvisorSurvey && <CoadvisorPage project={selected} coadvisor={coadvisor} />}
      {!selected && <p className="text-muted-foreground text-sm print:hidden">ค้นหาและเลือกโครงการเพื่อแสดงใบประเมิน</p>}
    </div>
  );
}
