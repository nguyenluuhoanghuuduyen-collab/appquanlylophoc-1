import React, { useState, useEffect } from 'react';
import { Student } from './types';
import { INITIAL_STUDENTS } from './mockData';
import StudentList from './components/StudentList';
import StudentDetail from './components/StudentDetail';
import AIAdvisorHub from './components/AIAdvisorHub';
import LuckyWheelModal from './components/LuckyWheelModal';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Sparkles, 
  Layers, 
  Trophy, 
  GraduationCap, 
  HeartHandshake, 
  RotateCcw, 
  FileCheck, 
  HelpCircle, 
  UserPlus,
  Database,
  RefreshCw,
  Check,
  X,
  Link,
  AlertCircle,
  Settings,
  Key
} from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std-1');
  const [showIntroduction, setShowIntroduction] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  // Multi-class management states
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [activeClassId, setActiveClassId] = useState<string>('class-default');
  const [showClassManager, setShowClassManager] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  
  // Gamification state
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);

  // API Key & Model states
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  const [tempModel, setTempModel] = useState<string>(localStorage.getItem('gemini_model') || 'gemini-3-flash-preview');

  // Auto open settings modal if API Key is missing
  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (!key) {
      setIsSettingsOpen(true);
    }
  }, []);

  // Google Sheets sync modal states
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncPreview, setSyncPreview] = useState<Student[] | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState<'merge' | 'overwrite'>('merge');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Load class list on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes');
        if (res.ok) {
          const data = await res.json();
          setClasses(data.classes);
          setActiveClassId(data.activeClassId);
        }
      } catch (e) {
        console.error("Lỗi khi tải danh sách lớp học:", e);
      }
    }
    fetchClasses();
  }, []);

  // Load students of active class whenever activeClassId changes
  useEffect(() => {
    async function fetchStudents() {
      try {
        setDbConnected(null);
        const res = await fetch('/api/students');
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0) {
            setSelectedStudentId(data[0].id);
          } else {
            setSelectedStudentId('');
          }
          setDbConnected(true);
          return;
        }
      } catch (e) {
        console.error("Lỗi kết nối database trực tuyến, chuyển sang bộ nhớ đệm:", e);
        setDbConnected(false);
      }
      
      // LocalStorage backup fallback (keyed by activeClassId)
      const saved = localStorage.getItem(`smart_classroom_students_${activeClassId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStudents(parsed);
            setSelectedStudentId(parsed[0].id);
            return;
          }
        } catch (e) {
          console.error("Lỗi khi tải dữ liệu học sinh từ bộ nhớ đệm:", e);
        }
      }
      
      if (activeClassId === 'class-default') {
        setStudents(INITIAL_STUDENTS);
        setSelectedStudentId(INITIAL_STUDENTS[0].id);
      } else {
        setStudents([]);
        setSelectedStudentId('');
      }
    }
    fetchStudents();
  }, [activeClassId]);

  // Save changes to online database with local storage backup
  const saveStudents = async (updatedList: Student[]) => {
    setStudents(updatedList);
    localStorage.setItem(`smart_classroom_students_${activeClassId}`, JSON.stringify(updatedList));
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedList })
      });
      if (res.ok) {
        setDbConnected(true);
      } else {
        setDbConnected(false);
      }
    } catch (e) {
      console.error("Không thể kết nối đến cơ sở dữ liệu trực tuyến để lưu:", e);
      setDbConnected(false);
    }
  };

  // Helper actions for class management
  const handleSelectClass = async (classId: string) => {
    try {
      const res = await fetch('/api/classes/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      });
      if (res.ok) {
        setActiveClassId(classId);
      }
    } catch (e) {
      console.error("Lỗi khi chuyển lớp học:", e);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName })
      });
      if (res.ok) {
        const data = await res.json();
        const listRes = await fetch('/api/classes');
        if (listRes.ok) {
          const listData = await listRes.json();
          setClasses(listData.classes);
          setActiveClassId(data.classId);
        }
        setNewClassName('');
        setShowClassManager(false);
      }
    } catch (e) {
      console.error("Lỗi khi thêm lớp học mới:", e);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (classes.length <= 1) {
      alert("Không thể xóa lớp học duy nhất còn lại.");
      return;
    }
    const targetClass = classes.find(c => c.id === classId);
    if (!confirm(`Bạn có chắc chắn muốn xóa lớp ${targetClass?.name}? Mọi dữ liệu học sinh thuộc lớp này sẽ bị xóa vĩnh viễn!`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        const listRes = await fetch('/api/classes');
        if (listRes.ok) {
          const listData = await listRes.json();
          setClasses(listData.classes);
          setActiveClassId(data.activeClassId);
        }
      }
    } catch (e) {
      console.error("Lỗi khi xóa lớp học:", e);
    }
  };

  // Lucky wheel spin award points callback
  const handleAwardPoints = (studentId: string, points: number, tag: string, reason: string) => {
    const updatedList = students.map(s => {
      if (s.id === studentId) {
        const newLog = {
          id: "log-wheel-" + Date.now(),
          date: new Date().toISOString().split('T')[0],
          points,
          reason,
          tag
        };
        return {
          ...s,
          attitudeScore: s.attitudeScore + points,
          attitudeLogs: [...s.attitudeLogs, newLog]
        };
      }
      return s;
    });
    saveStudents(updatedList);
  };

  // Add new student
  const handleAddStudent = () => {
    const newId = "std-" + Date.now();
    const studentNames = [
      "Vũ Minh Đức", "Nguyễn Thanh Hải", "Phan Thảo Vy", 
      "Trần Khánh Linh", "Bùi Quốc Anh", "Lê Thu Trang"
    ];
    // Select a random name or input manual name
    const randomName = studentNames[Math.floor(Math.random() * studentNames.length)] + " (Mới)";
    
    const newStudent: Student = {
      id: newId,
      name: randomName,
      gender: Math.random() > 0.5 ? 'Nam' : 'Nữ',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=150`,
      parentContact: "Phụ huynh em - 0988.xxx.xxx",
      targetGrade: 8.0,
      academic: {
        math: [
          { name: "KT 15 phút", score: 7.5 },
          { name: "KT 1 tiết", score: 8.0 }
        ],
        literature: [
          { name: "KT 15 phút", score: 7.0 },
          { name: "KT 1 tiết", score: 7.5 }
        ],
        english: [
          { name: "KT 15 phút", score: 8.0 },
          { name: "KT 1 tiết", score: 7.0 }
        ]
      },
      attitudeScore: 100,
      attitudeLogs: [
        { id: "log-init-" + Date.now(), date: new Date().toISOString().split('T')[0], points: 5, reason: "Khởi tạo tài khoản rèn luyện ban đầu tích cực", tag: "Phát biểu" }
      ],
      peerEvaluations: [],
      selfEvaluations: [
        { reflection: "Em đặt mục tiêu hòa nhập tốt với các bạn học sinh mới trong tuần này.", goalRating: 80, strengths: "Nhiệt tình", date: new Date().toISOString().split('T')[0] }
      ],
      teacherNotes: []
    };

    const updated = [...students, newStudent];
    saveStudents(updated);
    setSelectedStudentId(newId);
  };

  // Update specific student's attributes
  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    saveStudents(updatedList);
  };

  // Delete student
  const handleDeleteStudent = (studentId: string) => {
    const updatedList = students.filter(s => s.id !== studentId);
    saveStudents(updatedList);
    if (updatedList.length > 0) {
      setSelectedStudentId(updatedList[0].id);
    }
  };

  // Reset to original mock data
  const handleResetData = () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục toàn bộ lớp học về dữ liệu demo ban đầu? Mọi chỉnh sửa của bạn sẽ bị xóa.")) {
      saveStudents(INITIAL_STUDENTS);
      setSelectedStudentId(INITIAL_STUDENTS[0].id);
    }
  };

  // Fetch Google Sheets and parse
  const handleLoadSheetData = async () => {
    if (!sheetUrl.trim()) return;
    setSyncLoading(true);
    setSyncError(null);
    setSyncPreview(null);
    try {
      const res = await fetch('/api/sync/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sheetUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tải dữ liệu Google Sheets.");
      }
      if (data.studentsCount === 0) {
        throw new Error("Không tìm thấy học sinh hợp lệ nào từ bảng tính. Vui lòng kiểm tra lại cấu trúc cột.");
      }
      setSyncPreview(data.students);
    } catch (e: any) {
      console.error(e);
      setSyncError(e.message || "Đã xảy ra lỗi khi kết nối hoặc xử lý Google Sheets. Vui lòng kiểm tra lại link.");
    } finally {
      setSyncLoading(false);
    }
  };

  // Sync loaded preview data to frontend & backend DB
  const handleConfirmSync = () => {
    if (!syncPreview || syncPreview.length === 0) return;
    
    let updatedList: Student[] = [];
    let addedCount = 0;
    let updatedCount = 0;
    
    if (syncMode === 'overwrite') {
      updatedList = [...syncPreview];
      addedCount = syncPreview.length;
    } else {
      // Merge mode
      updatedList = [...students];
      syncPreview.forEach(newStudent => {
        const existingIndex = updatedList.findIndex(
          s => s.name.trim().toLowerCase() === newStudent.name.trim().toLowerCase() || s.id === newStudent.id
        );
        
        if (existingIndex > -1) {
          const existing = updatedList[existingIndex];
          updatedList[existingIndex] = {
            ...existing,
            gender: newStudent.gender,
            parentContact: newStudent.parentContact !== "Chưa cấu hình" ? newStudent.parentContact : existing.parentContact,
            targetGrade: newStudent.targetGrade || existing.targetGrade,
            academic: newStudent.academic, // update academic scores
            attitudeScore: newStudent.attitudeScore !== undefined ? newStudent.attitudeScore : existing.attitudeScore,
            teacherNotes: newStudent.teacherNotes.length > 0 ? [...existing.teacherNotes, ...newStudent.teacherNotes] : existing.teacherNotes
          };
          updatedCount++;
        } else {
          updatedList.push(newStudent);
          addedCount++;
        }
      });
    }
    
    saveStudents(updatedList);
    if (updatedList.length > 0) {
      setSelectedStudentId(updatedList[0].id);
    }
    setSyncStatusMsg(`Đồng bộ thành công! Đã thêm mới ${addedCount} học sinh và cập nhật ${updatedCount} học sinh.`);
    setSyncPreview(null);
    setSheetUrl('');
    
    setTimeout(() => {
      setSyncStatusMsg(null);
      setIsSyncModalOpen(false);
    }, 3000);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Compute overall statistics for widgets
  const totalClassStudents = students.length;
  
  const classGradeAverages = students.map(s => {
    const math = s.academic.math.length ? s.academic.math.reduce((acc, curr) => acc + curr.score, 0) / s.academic.math.length : 0;
    const lit = s.academic.literature.length ? s.academic.literature.reduce((acc, curr) => acc + curr.score, 0) / s.academic.literature.length : 0;
    const eng = s.academic.english.length ? s.academic.english.reduce((acc, curr) => acc + curr.score, 0) / s.academic.english.length : 0;
    
    // overall averages of single student
    const count = [s.academic.math.length, s.academic.literature.length, s.academic.english.length].filter(x => x > 0).length;
    return count > 0 ? (math + lit + eng) / 3 : 0;
  }).filter(v => v > 0);

  const averageClassGrade = classGradeAverages.length > 0 ? classGradeAverages.reduce((acc, curr) => acc + curr, 0) / classGradeAverages.length : 0;
  
  const averageClassAttitude = totalClassStudents > 0 ? students.reduce((acc, curr) => acc + curr.attitudeScore, 0) / totalClassStudents : 0;

  // Prepare chart data mapped correctly for Recharts
  const chartData = students.map(s => {
    const mAvg = s.academic.math.length ? s.academic.math.reduce((a, b) => a + b.score, 0) / s.academic.math.length : 0;
    const lAvg = s.academic.literature.length ? s.academic.literature.reduce((a, b) => a + b.score, 0) / s.academic.literature.length : 0;
    const eAvg = s.academic.english.length ? s.academic.english.reduce((a, b) => a + b.score, 0) / s.academic.english.length : 0;
    const overall = (mAvg + lAvg + eAvg) / 3;

    return {
      name: s.name,
      'Điểm học tập': parseFloat(overall.toFixed(2)),
      'Điểm thái độ': s.attitudeScore,
    };
  });

  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-800 flex flex-col font-sans" id="applet-viewport">
      
      {/* Dynamic Navigation Bar Layout */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-800 text-white p-2.5 rounded-2xl shadow-sm flex items-center justify-center">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-extrabold text-lg text-slate-900 tracking-tight">QUẢN LÝ LỚP HỌC</h1>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Partner AI v1.0
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Hệ thống quản lý điểm số, rèn luyện trực tuyến tích hợp AI cố vấn sư phạm</p>
            
            {/* Multi-class switcher dropdown */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-650">
              <span className="font-semibold text-slate-500">Đang chọn:</span>
              <select
                value={activeClassId}
                onChange={(e) => handleSelectClass(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-xl font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-xs"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowClassManager(true)}
                className="text-[10px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 font-bold px-2 py-0.8 rounded-lg transition-colors cursor-pointer"
              >
                Quản lý lớp
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Settings button with red warning indicator */}
          <button
            onClick={() => {
              setTempApiKey(localStorage.getItem('gemini_api_key') || '');
              setTempModel(localStorage.getItem('gemini_model') || 'gemini-3-flash-preview');
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 transition-all rounded-xl text-xs font-semibold cursor-pointer shadow-xs border border-rose-200"
          >
            <Settings size={13} className="text-rose-600" />
            <span>Cài đặt AI</span>
            <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wide animate-pulse shrink-0">
              Lấy API key để sử dụng app
            </span>
          </button>

          {/* Lucky Wheel Gamification Button */}
          <button
            onClick={() => setIsLuckyWheelOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white transition-all rounded-xl text-xs font-semibold cursor-pointer shadow-xs border border-amber-600 hover:shadow-md"
          >
            <Trophy size={13} />
            <span>Vòng Quay May Mắn</span>
          </button>

          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all rounded-xl text-xs font-semibold cursor-pointer shadow-xs border border-emerald-700 hover:shadow-md"
          >
            <Database size={13} />
            <span>Đồng bộ Google Sheets</span>
          </button>

          <button
            onClick={handleResetData}
            title="Nhập lại sỹ số mặc định ban đầu"
            className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-gray-100 text-gray-600 transition-colors rounded-xl text-xs font-semibold cursor-pointer border border-gray-200"
          >
            <RotateCcw size={13} />
            <span>Reset Lớp Học</span>
          </button>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Explainer / Onboarding banner card */}
        {showIntroduction && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-150 p-5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl pr-6">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
                <Sparkles size={11} />
                Hướng dẫn vận hành
              </span>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-normal font-sans">
                Chào mừng Thầy Cô đến với Hệ Thống Quản Lý & Phân Tích Sư Phạm Toàn Diện!
              </h2>
              <p className="text-xs text-slate-650 leading-relaxed text-slate-900 pt-0.5">
                Ứng dụng này giúp thầy cô phân tách rệt giữa <strong>Điểm Học thuật</strong> (Toán - Văn - Anh) và <strong>Điểm Thái độ rèn luyện</strong> (thi đua theo cơ chế thi đua điểm thưởng). Trợ lý AI đóng vai trò là một chuyên gia phân tích dữ liệu, tự động biên dịch báo cáo xu hướng, cảnh báo học lực sa sút, và đề xuất biện pháp can thiệp thích hợp.
              </p>
            </div>
            <button
              onClick={() => setShowIntroduction(false)}
              className="absolute top-4 right-4 text-emerald-800/60 hover:text-emerald-800 text-xs font-bold cursor-pointer bg-emerald-100/50 hover:bg-emerald-100 w-6 h-6 rounded-full flex items-center justify-center transition-all"
            >
              ×
            </button>
          </div>
        )}

        {/* Top-level Analytics Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tổng Sỹ Số Lớp</p>
              <h3 className="text-lg font-black text-gray-950 font-mono mt-0.5">{totalClassStudents} Học Sinh</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Kèm cặp mục tiêu dài hạn</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Điểm Học Tập Trung Bình</p>
              <h3 className="text-lg font-black text-emerald-800 font-mono mt-0.5">
                {averageClassGrade.toFixed(2)} / 10
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Tích hợp Toán - Văn - Anh</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Điểm Thi đua Trung Bình</p>
              <h3 className="text-lg font-black text-amber-600 font-mono mt-0.5">
                {averageClassAttitude.toFixed(1)} Điểm
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Tự động cộng dồn rèn luyện</p>
            </div>
          </div>

        </div>

        {/* Master details: Student list (Left) vs Student workspace (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]" id="classroom-orchestrator">
          
          {/* Left panel Roster selector (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <StudentList
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              onAddStudent={handleAddStudent}
            />
          </div>

          {/* Right workspace detail card (8 cols) */}
          <div className="lg:col-span-8 h-full">
            {selectedStudent ? (
              <StudentDetail
                student={selectedStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
              />
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 flex flex-col justify-center items-center h-full min-h-[400px]">
                <HelpCircle size={40} className="text-gray-300 mb-2" />
                <p className="text-sm font-semibold">Vui lòng chọn hoặc tạo học sinh mới để xem chi tiết.</p>
              </div>
            )}
          </div>

        </div>

        {/* Interactive Classroom Correlation Recharts visual Desk */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-4">
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
                <FileCheck size={16} className="text-emerald-700" />
                <span>Bản đồ trực quan: Tương quan Điểm thi đua vs Học thuật</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Nhận diện trực giác mối tương liên giữa việc kỷ luật hành vi rèn luyện và học lực.</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-emerald-600 rounded-md"></span>Điểm học tập (Cột)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500"></span>Thái độ thi đua (Đường)</span>
            </div>
          </div>

          {/* Recharts container wrappers */}
          {chartData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Chưa có đủ chỉ số học sinh để lập sơ đồ tương quan.</p>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 500 }} 
                    stroke="#eaeaea"
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ value: 'Học tập (0-10)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#1b4332', fontWeight: 600 } }} 
                    domain={[0, 10]}
                    tick={{ fill: '#1b4332', fontSize: 10 }}
                    stroke="#e5f5e0"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ value: 'Thái độ (Đ)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 10, fill: '#b56d0d', fontWeight: 600 } }} 
                    domain={[0, 'auto']}
                    tick={{ fill: '#b56d0d', fontSize: 10 }}
                    stroke="#fdf0d5"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar yAxisId="left" dataKey="Điểm học tập" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Line yAxisId="right" type="monotone" dataKey="Điểm thái độ" stroke="#d97706" strokeWidth={2.5} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* AI Solutions Advisor desk */}
        <AIAdvisorHub students={students} />

        {/* Footer */}
        <footer className="text-center text-gray-400 text-[11px] font-mono py-6 border-t border-gray-100">
          Hệ thống Quản lý Giáo dục Độc lập - Bản Thử nghiệm Toàn diện. Bảo mật thông tin học sinh chuẩn quốc gia.
        </footer>
      </main>

      {/* Google Sheets Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-slate-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white relative">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Database size={18} />
                <span>Kết Nối & Đồng Bộ Google Sheets</span>
              </h3>
              <p className="text-emerald-100 text-xs mt-1">Đồng bộ cơ sở dữ liệu trực tuyến học sinh từ xa qua bảng tính đám mây</p>
              <button 
                onClick={() => {
                  setIsSyncModalOpen(false);
                  setSyncPreview(null);
                  setSheetUrl('');
                  setSyncError(null);
                }} 
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              {/* Online database connection status */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Database size={14} className="text-emerald-600 animate-pulse" />
                  Trạng thái Cơ sở dữ liệu trực tuyến:
                </span>
                {dbConnected === null && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">Đang kết nối...</span>
                )}
                {dbConnected === true && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Đã kết nối trực tuyến
                  </span>
                )}
                {dbConnected === false && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">Ngoại tuyến (Backup local)</span>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-emerald-50/40 border border-emerald-150 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Sparkles size={13} className="text-emerald-700" />
                  Hướng dẫn kết nối Google Sheets:
                </p>
                <ul className="list-decimal pl-4 space-y-1 text-slate-855 leading-relaxed">
                  <li>Tạo hoặc sao chép bảng điểm của bạn theo định dạng cột chuẩn.</li>
                  <li>Bấm sao chép bảng tính mẫu tại đây: <a href="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUq1II2y/copy" target="_blank" rel="noreferrer" className="text-emerald-800 font-bold hover:underline">Sao chép Bảng tính Mẫu 📋</a></li>
                  <li>Trong Google Sheets, chọn <strong>Chia sẻ (Share)</strong> &rarr; Đặt quyền truy cập chung thành <strong>"Bất kỳ ai có liên kết đều có thể xem" (Anyone with the link can view)</strong>.</li>
                  <li>Sao chép toàn bộ đường dẫn trên thanh địa chỉ trình duyệt và dán vào ô bên dưới.</li>
                </ul>
              </div>

              {/* URL Input and Action Button */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Nhập đường link Google Sheets:</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all text-slate-800"
                    />
                  </div>
                  <button
                    onClick={handleLoadSheetData}
                    disabled={syncLoading || !sheetUrl.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {syncLoading ? (
                      <RefreshCw className="animate-spin" size={13} />
                    ) : (
                      <span>Tải Dữ Liệu</span>
                    )}
                  </button>
                </div>
                {syncError && (
                  <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 flex items-start gap-1.5 mt-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{syncError}</span>
                  </div>
                )}
              </div>

              {/* Preview and Confirm Actions */}
              {syncPreview && syncPreview.length > 0 && (
                <div className="space-y-4 border-t border-slate-100 pt-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1">
                      <Check size={14} className="text-emerald-600" />
                      Xem trước dữ liệu ({syncPreview.length} học sinh)
                    </h4>
                    
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="font-bold text-slate-700">Chế độ đồng bộ:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="syncMode"
                          value="merge"
                          checked={syncMode === 'merge'}
                          onChange={() => setSyncMode('merge')}
                          className="accent-emerald-700"
                        />
                        <span>Cập nhật & Thêm mới</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="syncMode"
                          value="overwrite"
                          checked={syncMode === 'overwrite'}
                          onChange={() => setSyncMode('overwrite')}
                          className="accent-emerald-700"
                        />
                        <span className="text-rose-600 font-medium">Ghi đè hoàn toàn</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-650 font-bold">
                          <th className="p-2.5 pl-3">Học sinh</th>
                          <th className="p-2.5">Giới tính</th>
                          <th className="p-2.5">Toán (TB)</th>
                          <th className="p-2.5">Văn (TB)</th>
                          <th className="p-2.5">Anh (TB)</th>
                          <th className="p-2.5 pr-3">Điểm thái độ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {syncPreview.map((s, idx) => {
                          const mathAvg = s.academic.math.length ? (s.academic.math.reduce((a,b)=>a+b.score, 0)/s.academic.math.length).toFixed(1) : '-';
                          const litAvg = s.academic.literature.length ? (s.academic.literature.reduce((a,b)=>a+b.score, 0)/s.academic.literature.length).toFixed(1) : '-';
                          const engAvg = s.academic.english.length ? (s.academic.english.reduce((a,b)=>a+b.score, 0)/s.academic.english.length).toFixed(1) : '-';
                          return (
                            <tr key={s.id || idx} className="hover:bg-slate-50/50">
                              <td className="p-2 pl-3 font-medium text-slate-900">{s.name}</td>
                              <td className="p-2">{s.gender}</td>
                              <td className="p-2">{mathAvg}</td>
                              <td className="p-2">{litAvg}</td>
                              <td className="p-2">{engAvg}</td>
                              <td className="p-2 pr-3 font-mono">{s.attitudeScore}đ</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSyncPreview(null);
                        setSheetUrl('');
                        setSyncError(null);
                      }}
                      className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition-colors rounded-xl font-bold border border-slate-200 cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleConfirmSync}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-bold rounded-xl shadow-sm cursor-pointer"
                    >
                      Đồng bộ vào Hệ Thống
                    </button>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {syncStatusMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl flex items-center gap-2 animate-bounce">
                  <Check size={18} className="text-emerald-600 animate-pulse" />
                  <span className="font-semibold">{syncStatusMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lucky Wheel Modal */}
      <LuckyWheelModal
        isOpen={isLuckyWheelOpen}
        onClose={() => setIsLuckyWheelOpen(false)}
        students={students}
        onAwardPoints={handleAwardPoints}
      />

      {/* Class Manager Modal */}
      {showClassManager && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-5 text-white flex justify-between items-center relative">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Database size={16} />
                <span>Quản Lý Danh Sách Lớp Học</span>
              </h3>
              <button 
                onClick={() => {
                  setShowClassManager(false);
                  setNewClassName('');
                }} 
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Create new class */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800">Tạo Lớp Học Mới:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tên lớp (VD: Lớp 9A, Lớp 10B)..."
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  />
                  <button
                    onClick={handleCreateClass}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Tạo Lớp
                  </button>
                </div>
              </div>

              {/* Existing classes list */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="font-bold text-slate-800">Lớp học hiện có ({classes.length}):</label>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-150 rounded-2xl">
                  {classes.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 hover:bg-slate-50/50">
                      <span className="font-medium text-slate-800">{c.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleSelectClass(c.id);
                            setShowClassManager(false);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-150 transition-colors cursor-pointer"
                        >
                          Chọn xem
                        </button>
                        <button
                          onClick={() => handleDeleteClass(c.id)}
                          disabled={classes.length <= 1}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-150 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          Xóa lớp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Key & Model Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-5 text-white flex justify-between items-center relative">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Settings size={16} />
                <span>Cấu hình Trợ lý AI (Gemini)</span>
              </h3>
              {localStorage.getItem('gemini_api_key') && (
                <button 
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setTempApiKey(localStorage.getItem('gemini_api_key') || '');
                    setTempModel(localStorage.getItem('gemini_model') || 'gemini-3-flash-preview');
                  }} 
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Alert if key is missing */}
              {!localStorage.getItem('gemini_api_key') && (
                <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-2xl text-rose-800 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Yêu cầu cấu hình API Key!</p>
                    <p className="leading-relaxed">Bạn cần nhập API key để kích hoạt các tính năng phân tích và tư vấn sư phạm của Trợ lý AI.</p>
                  </div>
                </div>
              )}

              {/* Instructions on how to get API Key */}
              <div className="bg-emerald-50/40 border border-emerald-150 p-4 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  <Sparkles size={13} className="text-emerald-700" />
                  <span>Cách lấy API Key miễn phí:</span>
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-800 leading-relaxed">
                  <li>Truy cập <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer" className="text-emerald-800 font-bold hover:underline">Google AI Studio API Keys 🔑</a>.</li>
                  <li>Đăng nhập bằng tài khoản Google của bạn.</li>
                  <li>Click vào nút <strong>"Create API key"</strong>, chọn một project và copy mã API key được tạo.</li>
                </ol>
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Nhập API Key:</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="password"
                    placeholder="Dán mã API Key của bạn tại đây (AIzaSy...)"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* AI Model Selection Cards */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Chọn Model AI:</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Card 1: gemini-3-flash-preview */}
                  <button
                    type="button"
                    onClick={() => setTempModel('gemini-3-flash-preview')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      tempModel === 'gemini-3-flash-preview'
                        ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block text-[10px] truncate">Gemini 3 Flash</span>
                      <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">Tốc độ cực nhanh, tiết kiệm</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded-md self-start">
                      Mặc định
                    </span>
                  </button>

                  {/* Card 2: gemini-3-pro-preview */}
                  <button
                    type="button"
                    onClick={() => setTempModel('gemini-3-pro-preview')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      tempModel === 'gemini-3-pro-preview'
                        ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block text-[10px] truncate">Gemini 3 Pro</span>
                      <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">Lý luận sâu sắc, chuẩn xác</span>
                    </div>
                    {tempModel === 'gemini-3-pro-preview' && (
                      <span className="text-[9px] font-bold text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded-md self-start">
                        Đang chọn
                      </span>
                    )}
                  </button>

                  {/* Card 3: gemini-2.5-flash */}
                  <button
                    type="button"
                    onClick={() => setTempModel('gemini-2.5-flash')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      tempModel === 'gemini-2.5-flash'
                        ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block text-[10px] truncate">Gemini 2.5 Flash</span>
                      <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">Hiệu năng cao, phản hồi nhanh</span>
                    </div>
                    {tempModel === 'gemini-2.5-flash' && (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded-md self-start">
                        Đang chọn
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                {localStorage.getItem('gemini_api_key') && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setTempApiKey(localStorage.getItem('gemini_api_key') || '');
                      setTempModel(localStorage.getItem('gemini_model') || 'gemini-3-flash-preview');
                    }}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition-colors rounded-xl font-bold border border-slate-200 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!tempApiKey.trim()) {
                      alert("Vui lòng nhập API Key hợp lệ!");
                      return;
                    }
                    localStorage.setItem('gemini_api_key', tempApiKey.trim());
                    localStorage.setItem('gemini_model', tempModel);
                    setIsSettingsOpen(false);
                    // Emit a storage event to alert sibling listeners (such as AIAdvisorHub) if needed, though they read directly from localStorage on request.
                    window.dispatchEvent(new Event('storage'));
                    alert("Đã lưu cấu hình API Key và Model thành công!");
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
