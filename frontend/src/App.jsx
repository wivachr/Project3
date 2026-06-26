import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import OfficerDashboard from './pages/officer/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

import StudentList from './pages/admin/StudentList';
import TeacherList from './pages/admin/TeacherList';
import UserList from './pages/admin/UserList';
import BasicData from './pages/admin/BasicData';

import ProjectList from './pages/officer/ProjectList';
import ExamList from './pages/officer/ExamList';
import NewsList from './pages/officer/NewsList';
import RegisterList from './pages/officer/RegisterList';
import PendingExam from './pages/officer/PendingExam';
import AssignCommittee from './pages/officer/AssignCommittee';
import SaveResult from './pages/officer/SaveResult';
import SubmitBook from './pages/officer/SubmitBook';
import ExamTableReport from './pages/officer/ExamTableReport';
import ResultReport from './pages/officer/ResultReport';
import StatusReport from './pages/officer/StatusReport';
import NoProjectReport from './pages/officer/NoProjectReport';
import NoExamReport from './pages/officer/NoExamReport';
import FallProjectReport from './pages/officer/FallProjectReport';
import AcademicYear from './pages/officer/AcademicYear';

import StudentProjectView from './pages/student/ProjectView';
import SubmitExam from './pages/student/SubmitExam';
import ExamHistory from './pages/student/ExamHistory';
import EditHistory from './pages/student/EditHistory';
import UploadBook from './pages/student/UploadBook';
import StudentProfile from './pages/student/StudentProfile';

import MyProjects from './pages/teacher/MyProjects';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherStatusReport from './pages/teacher/TeacherStatusReport';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherProjectList from './pages/teacher/TeacherProjectList';
import TeacherFreeTime from './pages/teacher/TeacherFreeTime';

import HeadOfDepartment from './pages/admin/HeadOfDepartment';
import RaceList from './pages/officer/RaceList';
import PrintExamForm from './pages/officer/PrintExamForm';
import TeacherFreeTimeList from './pages/officer/TeacherFreeTimeList';
import EvaluationForm from './pages/officer/EvaluationForm';
import TorgorList from './pages/officer/TorgorList';
import CaseStudyReport from './pages/officer/CaseStudyReport';
import ExpiredProjectReport from './pages/officer/ExpiredProjectReport';
import RegisterProject from './pages/student/RegisterProject';

import ChangePassword from './pages/shared/ChangePassword';

const Home = () => <div className="text-gray-400 p-4">เลือกเมนูด้านซ้าย</div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register-project" element={<RegisterProject />} />
          <Route path="/" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRights={[1]}><AdminDashboard /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="students" element={<StudentList />} />
            <Route path="teachers" element={<TeacherList />} />
            <Route path="users" element={<UserList />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="academic-year" element={<AcademicYear />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="titles" element={<BasicData title="คำนำหน้าชื่อ" endpoint="title" idKey="id_title" fields={[{ key:'name_title', label:'คำนำหน้า', required:true }]} />} />
            <Route path="academic-titles" element={<BasicData title="ตำแหน่งวิชาการ" endpoint="academictitle" idKey="id_academictitle" fields={[{ key:'name_academictitle', label:'ตำแหน่ง', required:true },{ key:'initials_academictitle', label:'อักษรย่อ' }]} />} />
            <Route path="faculties" element={<BasicData title="คณะ" endpoint="faculty" idKey="id_faculty" fields={[{ key:'name_faculty', label:'ชื่อคณะ', required:true },{ key:'initials_faculty', label:'อักษรย่อ' }]} />} />
            <Route path="departments" element={<BasicData title="ภาควิชา" endpoint="department" idKey="id_department" fields={[{ key:'name_department', label:'ชื่อภาควิชา', required:true },{ key:'initials_department', label:'อักษรย่อ' },{ key:'id_faculty', label:'รหัสคณะ', type:'number' }]} />} />
            <Route path="divisions" element={<BasicData title="สาขาวิชา" endpoint="division" idKey="id_division" fields={[{ key:'name_division', label:'ชื่อสาขา', required:true },{ key:'initials_division', label:'อักษรย่อ' },{ key:'id_faculty', label:'รหัสคณะ', type:'number' },{ key:'id_department', label:'รหัสภาควิชา', type:'number' }]} />} />
            <Route path="curriculums" element={<BasicData title="หลักสูตร" endpoint="curriculum" idKey="id_curr" fields={[{ key:'name_curr', label:'ชื่อหลักสูตร', required:true }]} />} />
            <Route path="subjects" element={<BasicData title="วิชา" endpoint="subject" idKey="id_subject" fields={[{ key:'name_subject', label:'ชื่อวิชา', required:true },{ key:'credits', label:'หน่วยกิต', type:'number' }]} />} />
            <Route path="rooms" element={<BasicData title="ห้องสอบ" endpoint="room" idKey="id_room" fields={[{ key:'name_room', label:'ชื่อห้อง', required:true }]} />} />
            <Route path="type-exams" element={<BasicData title="ประเภทการสอบ" endpoint="typeexam" idKey="id_typeexam" fields={[{ key:'name_typeexam', label:'ประเภทการสอบ', required:true }]} />} />
            <Route path="status-projects" element={<BasicData title="สถานะโครงการ" endpoint="statusproject" idKey="id_statusproject" fields={[{ key:'name_statusproject', label:'ชื่อสถานะ', required:true }]} />} />
            <Route path="rights" element={<BasicData title="สิทธิ์ผู้ใช้" endpoint="right" idKey="id_right" fields={[{ key:'name_right', label:'ชื่อสิทธิ์', required:true }]} />} />
            <Route path="head-of-department" element={<HeadOfDepartment />} />
          </Route>

          {/* Officer */}
          <Route path="/officer" element={<ProtectedRoute allowedRights={[2]}><OfficerDashboard /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="students" element={<StudentList />} />
            <Route path="teachers" element={<TeacherList />} />
            <Route path="registers" element={<RegisterList />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/pending-title" element={<PendingExam typeexam={1} />} />
            <Route path="projects/pending-60" element={<PendingExam typeexam={2} />} />
            <Route path="projects/pending-100" element={<PendingExam typeexam={3} />} />
            <Route path="projects/assign-committee" element={<AssignCommittee />} />
            <Route path="projects/assign-exam" element={<ExamList />} />
            <Route path="projects/save-result" element={<SaveResult />} />
            <Route path="projects/submit-book" element={<SubmitBook />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="news" element={<NewsList />} />
            <Route path="reports/exam-table" element={<ExamTableReport />} />
            <Route path="reports/results" element={<ResultReport />} />
            <Route path="reports/status" element={<StatusReport />} />
            <Route path="reports/no-project" element={<NoProjectReport />} />
            <Route path="reports/no-exam" element={<NoExamReport />} />
            <Route path="reports/fall-project" element={<FallProjectReport />} />
            <Route path="academic-year" element={<AcademicYear />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="races" element={<RaceList />} />
            <Route path="reports/print-exam" element={<PrintExamForm />} />
            <Route path="reports/evaluation" element={<EvaluationForm />} />
            <Route path="reports/case-study" element={<CaseStudyReport />} />
            <Route path="reports/expired" element={<ExpiredProjectReport />} />
            <Route path="teacher-freetime" element={<TeacherFreeTimeList />} />
            <Route path="projects/torgor" element={<TorgorList />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute allowedRights={[3]}><TeacherDashboard /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="my-projects" element={<MyProjects />} />
            <Route path="projects" element={<TeacherProjectList />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="reports/status" element={<TeacherStatusReport />} />
            <Route path="free-time" element={<TeacherFreeTime />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute allowedRights={[4]}><StudentDashboard /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="project" element={<StudentProjectView />} />
            <Route path="submit-title" element={<SubmitExam typeexam={1} label="ส่งสอบหัวข้อ" statusProject={2} />} />
            <Route path="submit-60" element={<SubmitExam typeexam={2} label="ส่งสอบ 60%" statusProject={11} />} />
            <Route path="submit-100" element={<SubmitExam typeexam={3} label="ส่งสอบ 100%" statusProject={14} />} />
            <Route path="exam-history" element={<ExamHistory />} />
            <Route path="edit-history" element={<EditHistory />} />
            <Route path="upload" element={<UploadBook />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
