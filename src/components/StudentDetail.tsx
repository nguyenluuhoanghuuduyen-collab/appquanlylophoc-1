import React, { useState } from 'react';
import { Student, AttitudeLog, PeerEvaluation, SelfEvaluation, TeacherNote } from '../types';
import { ATTITUDE_TAGS } from '../mockData';
import { Plus, Trash2, Trophy, Star, BookOpen, Clock, Heart, Award, Key, Save, AlertCircle, Sparkles, Smile, MessageSquare, PlusCircle, FileText } from 'lucide-react';
import * as docx from "docx";

interface StudentDetailProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentDetail({
  student,
  onUpdateStudent,
  onDeleteStudent,
}: StudentDetailProps) {
  // Tabs within Student details: 'overview' | 'academic' | 'gamification' | 'interpersonal'
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'gamification' | 'interpersonal'>('overview');

  // Input states for Add Grade
  const [newGradeSubject, setNewGradeSubject] = useState<'math' | 'literature' | 'english'>('math');
  const [newGradeName, setNewGradeName] = useState('KT Thường xuyên');
  const [newGradeValue, setNewGradeValue] = useState('');

  // Input states for Peer Evaluation
  const [peerEvaluator, setPeerEvaluator] = useState('');
  const [peerStrengths, setPeerStrengths] = useState('');
  const [peerWeaknesses, setPeerWeaknesses] = useState('');
  const [peerRating, setPeerRating] = useState(4);

  // Input states for Teacher Note
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'academic' | 'behavior' | 'social' | 'health'>('academic');

  // Custom Attitude transaction state
  const [customAttitudePoint, setCustomAttitudePoint] = useState('5');
  const [customAttitudeTag, setCustomAttitudeTag] = useState('Phát biểu');
  const [customAttitudeReason, setCustomAttitudeReason] = useState('Phát biểu xuất sắc');

  // Helper calculation for average
  const getSubjectAverage = (grades: { score: number }[]) => {
    if (grades.length === 0) return 0;
    return grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length;
  };

  const mathAvg = getSubjectAverage(student.academic.math);
  const litAvg = getSubjectAverage(student.academic.literature);
  const engAvg = getSubjectAverage(student.academic.english);
  const overallAvg = (mathAvg + litAvg + engAvg) / 3;

  const exportToDocx = () => {
    try {
      const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, Packer } = docx;
      
      const mathAvgStr = mathAvg > 0 ? mathAvg.toFixed(1) : "N/A";
      const litAvgStr = litAvg > 0 ? litAvg.toFixed(1) : "N/A";
      const engAvgStr = engAvg > 0 ? engAvg.toFixed(1) : "N/A";
      const overallAvgStr = overallAvg > 0 ? overallAvg.toFixed(1) : "N/A";
      
      // Build docx sections
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Republic title
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: 22, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "---------------***---------------", size: 18, font: "Times New Roman" }),
                ],
              }),
              new Paragraph({ text: "", spacing: { after: 200 } }),
              
              // Document Title
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                children: [
                  new TextRun({ text: "PHIẾU ĐÁNH GIÁ HỌC LỰC & RÈN LUYỆN HỌC SINH", bold: true, size: 28, color: "064e3b", font: "Times New Roman" }),
                ],
              }),
              
              // Student Information Section
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 150 },
                children: [
                  new TextRun({ text: "I. THÔNG TIN CHUNG HỌC SINH", bold: true, size: 24, color: "0f766e", font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Họ và tên: ", bold: true, font: "Times New Roman" }),
                  new TextRun({ text: student.name + "      ", font: "Times New Roman" }),
                  new TextRun({ text: "Giới tính: ", bold: true, font: "Times New Roman" }),
                  new TextRun({ text: student.gender + "\n", font: "Times New Roman" }),
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Liên hệ phụ huynh: ", bold: true, font: "Times New Roman" }),
                  new TextRun({ text: student.parentContact + "\n", font: "Times New Roman" }),
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Điểm mục tiêu: ", bold: true, font: "Times New Roman" }),
                  new TextRun({ text: student.targetGrade.toFixed(1) + " / 10      ", font: "Times New Roman" }),
                  new TextRun({ text: "Điểm thi đua hiện tại: ", bold: true, font: "Times New Roman" }),
                  new TextRun({ text: student.attitudeScore + " điểm\n", font: "Times New Roman" }),
                ]
              }),
              
              // Academic results Section
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
                children: [
                  new TextRun({ text: "II. KẾT QUẢ HỌC TẬP (MÔN HỌC CHỦ CHỐT)", bold: true, size: 24, color: "0f766e", font: "Times New Roman" }),
                ],
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "Môn học", bold: true, font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: "Các cột điểm kiểm tra", bold: true, font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: "Điểm trung bình môn", bold: true, font: "Times New Roman" })] }),
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "Toán học", font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: student.academic.math.map(g => `${g.name}: ${g.score}`).join(', ') || 'Chưa có điểm', font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: mathAvgStr, font: "Times New Roman" })] }),
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "Ngữ văn", font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: student.academic.literature.map(g => `${g.name}: ${g.score}`).join(', ') || 'Chưa có điểm', font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: litAvgStr, font: "Times New Roman" })] }),
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "Tiếng Anh", font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: student.academic.english.map(g => `${g.name}: ${g.score}`).join(', ') || 'Chưa có điểm', font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: engAvgStr, font: "Times New Roman" })] }),
                    ]
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "Tổng thể (Cả 3 môn)", bold: true, font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: "", font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: overallAvgStr, bold: true, font: "Times New Roman" })] }),
                    ]
                  })
                ]
              }),
              
              // Attitude Logs Section
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
                children: [
                  new TextRun({ text: "III. QUÁ TRÌNH THI ĐUA RÈN LUYỆN (THÁI ĐỘ)", bold: true, size: 24, color: "0f766e", font: "Times New Roman" }),
                ],
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: "Ngày", bold: true, font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: "Phân loại", bold: true, font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: "Điểm thi đua", bold: true, font: "Times New Roman" })] }),
                      new TableCell({ children: [new Paragraph({ text: "Lý do rèn luyện", bold: true, font: "Times New Roman" })] }),
                    ]
                  }),
                  ...(student.attitudeLogs.length > 0 
                    ? student.attitudeLogs.map(log => new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ text: log.date, font: "Times New Roman" })] }),
                          new TableCell({ children: [new Paragraph({ text: log.tag, font: "Times New Roman" })] }),
                          new TableCell({ children: [new Paragraph({ text: (log.points > 0 ? `+${log.points}` : log.points.toString()) + "đ", font: "Times New Roman" })] }),
                          new TableCell({ children: [new Paragraph({ text: log.reason, font: "Times New Roman" })] }),
                        ]
                      }))
                    : [new TableRow({
                        children: [
                          new TableCell({ columnSpan: 4, children: [new Paragraph({ text: "Chưa ghi nhận sự kiện rèn luyện thi đua nào.", font: "Times New Roman" })] })
                        ]
                      })])
                ]
              }),
              
              // Teacher notes and evaluations
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
                children: [
                  new TextRun({ text: "IV. NHẬN XÉT CỦA GIÁO VIÊN & HỆ THỐNG", bold: true, size: 24, color: "0f766e", font: "Times New Roman" }),
                ],
              }),
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({ text: "Ghi chú của giáo viên chủ nhiệm:\n", bold: true, font: "Times New Roman" }),
                  new TextRun({ 
                    text: student.teacherNotes.map(n => `- [${n.date} - ${n.category === 'academic' ? 'Học thuật' : 'Hành vi'}]: ${n.content}`).join('\n') || "Chưa ghi nhận ghi chú sư phạm riêng.", 
                    italic: true,
                    font: "Times New Roman" 
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({ text: "Tự nhận xét của học sinh:\n", bold: true, font: "Times New Roman" }),
                  new TextRun({ 
                    text: student.selfEvaluations.map(e => `- [${e.date}]: ${e.reflection} (Độ tự tin rèn luyện: ${e.goalRating}/100)`).join('\n') || "Chưa hoàn thành tự đánh giá bản thân.", 
                    italic: true,
                    font: "Times New Roman" 
                  })
                ]
              }),
              
              // Signature space
              new Paragraph({ text: "", spacing: { after: 400 } }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE }
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Học sinh ký tên\n(Ký và ghi rõ họ tên)", italic: true, font: "Times New Roman" })] })
                        ]
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Giáo viên chủ nhiệm\n(Ký và đóng dấu nhận xét)", bold: true, font: "Times New Roman" })] })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }
        ]
      });

      // Save using Packer
      Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Phieu_Hoc_Ba_${student.name.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
    } catch (e: any) {
      console.error(e);
      alert("Đã xảy ra lỗi khi tạo file Word: " + e.message);
    }
  };

  // Handles updating parent state
  const handleUpdate = (field: Partial<Student>) => {
    onUpdateStudent({ ...student, ...field });
  };

  // Gamification: Trigger presets easily
  const triggerAttitudeLog = (points: number, tag: string, reason: string) => {
    const newLog: AttitudeLog = {
      id: "log-" + Date.now(),
      date: new Date().toISOString().split('T')[0],
      points,
      reason,
      tag
    };
    
    const updatedLogs = [...student.attitudeLogs, newLog];
    const updatedScore = student.attitudeScore + points;

    handleUpdate({
      attitudeLogs: updatedLogs,
      attitudeScore: updatedScore
    });
  };

  // Add academic score
  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newGradeValue);
    if (isNaN(val) || val < 0 || val > 10) {
      alert("Điểm số phải từ 0 đến 10.");
      return;
    }

    const updatedAcademic = { ...student.academic };
    updatedAcademic[newGradeSubject].push({
      name: newGradeName,
      score: val
    });

    handleUpdate({ academic: updatedAcademic });
    setNewGradeValue('');
    setNewGradeName('KT Thường xuyên');
  };

  // Delete academic score
  const handleDeleteGrade = (subject: 'math' | 'literature' | 'english', index: number) => {
    const updatedAcademic = { ...student.academic };
    updatedAcademic[subject].splice(index, 1);
    handleUpdate({ academic: updatedAcademic });
  };

  // Delete attitude log
  const handleDeleteAttitudeLog = (logId: string) => {
    const targetLog = student.attitudeLogs.find(l => l.id === logId);
    if (!targetLog) return;
    
    const updatedLogs = student.attitudeLogs.filter(l => l.id !== logId);
    const updatedScore = student.attitudeScore - targetLog.points;

    handleUpdate({
      attitudeLogs: updatedLogs,
      attitudeScore: updatedScore
    });
  };

  // Add peer review
  const handleAddPeerRev = (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerEvaluator.trim() || !peerStrengths.trim()) {
      alert("Vui lòng điền đủ thông tin tên bạn đánh giá và điểm mạnh.");
      return;
    }

    const newPeer: PeerEvaluation = {
      evaluator: peerEvaluator,
      strengths: peerStrengths,
      weaknesses: peerWeaknesses,
      rating: peerRating,
      date: new Date().toISOString().split('T')[0]
    };

    handleUpdate({
      peerEvaluations: [...student.peerEvaluations, newPeer]
    });

    setPeerEvaluator('');
    setPeerStrengths('');
    setPeerWeaknesses('');
    setPeerRating(4);
  };

  // Delete peer review
  const handleDeletePeer = (index: number) => {
    const updated = [...student.peerEvaluations];
    updated.splice(index, 1);
    handleUpdate({ peerEvaluations: updated });
  };

  // Add teacher note
  const handleAddTeacherNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const newNote: TeacherNote = {
      id: "note-" + Date.now(),
      date: new Date().toISOString().split('T')[0],
      content: noteContent,
      category: noteCategory
    };

    handleUpdate({
      teacherNotes: [...student.teacherNotes, newNote]
    });

    setNoteContent('');
  };

  // Delete teacher note
  const handleDeleteNote = (noteId: string) => {
    const updated = student.teacherNotes.filter(n => n.id !== noteId);
    handleUpdate({ teacherNotes: updated });
  };

  // Update self assessment
  const handleUpdateSelfEvaluation = (reflection: string, goalRating: number, strengths: string) => {
    const newSelf: SelfEvaluation = {
      reflection,
      goalRating,
      strengths,
      date: new Date().toISOString().split('T')[0]
    };
    handleUpdate({ selfEvaluations: [newSelf] });
  };

  // Categories helper colors
  const getNoteCategoryColor = (cat: string) => {
    switch (cat) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'behavior': return 'bg-amber-100 text-amber-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'health': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoteCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'academic': return 'Học thuật';
      case 'behavior': return 'Thi đua/Kỷ luật';
      case 'social': return 'Kỹ năng xã hội';
      case 'health': return 'Tâm lý & Sức khỏe';
      default: return 'Khác';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col" id="student-detail-workspace">
      {/* Student Banner Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{student.name}</h1>
                <span className="text-xs bg-white/20 text-emerald-100 px-2 py-0.5 rounded-full font-mono font-medium">
                  ID: {student.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-emerald-100">
                <span>Giới tính: <strong>{student.gender}</strong></span>
                <span className="opacity-40">•</span>
                <span>Liên hệ: <strong>{student.parentContact || 'Chưa thiết lập'}</strong></span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={exportToDocx}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-50 border border-emerald-500/35 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <FileText size={13} />
              <span>Xuất Học Bạ (.docx)</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Bạn chắc chắn muốn xóa hồ sơ học sinh ${student.name} khỏi lớp học?`)) {
                  onDeleteStudent(student.id);
                }
              }}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-500/25 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Xóa học sinh</span>
            </button>
          </div>
        </div>

        {/* Floating summary statistics card inside banner */}
        <div className="grid grid-cols-3 gap-2 mt-6 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
          <div className="text-center border-r border-white/10">
            <div className="text-[10px] text-emerald-200 uppercase tracking-wider">Điểm TB Hiện Tại</div>
            <div className="text-lg font-bold font-mono text-emerald-50 mt-1">{overallAvg.toFixed(2)}</div>
          </div>
          <div className="text-center border-r border-white/10">
            <div className="text-[10px] text-emerald-200 uppercase tracking-wider">Mục Tiêu Đặt Ra</div>
            <div className="text-lg font-bold font-mono text-emerald-50 mt-1">{student.targetGrade.toFixed(1)}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-emerald-200 uppercase tracking-wider">Thi Đua (Thái độ)</div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-1 flex items-center justify-center gap-1">
              <Trophy size={14} className="text-amber-300" />
              {student.attitudeScore}đ
            </div>
          </div>
        </div>
      </div>

      {/* Roster Navigation Tabs */}
      <div className="flex px-4 bg-gray-50 border-b border-gray-100 max-w-full overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 font-medium text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-emerald-700 text-emerald-800 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Thông tin chung
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`py-3 px-4 font-medium text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'academic'
              ? 'border-emerald-700 text-emerald-800 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Học lực & Điểm số
        </button>
        <button
          onClick={() => setActiveTab('gamification')}
          className={`py-3 px-4 font-medium text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'gamification'
              ? 'border-emerald-700 text-emerald-800 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Nhật ký Thi đua {student.attitudeLogs.length > 0 && `(${student.attitudeLogs.length})`}
        </button>
        <button
          onClick={() => setActiveTab('interpersonal')}
          className={`py-3 px-4 font-medium text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'interpersonal'
              ? 'border-emerald-700 text-emerald-800 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Đánh giá đa chiều
        </button>
      </div>

      {/* Main Tab content box */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[550px]">
        
        {/* TAB 1: OVERVIEW & PROFILE DIRECTORY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile setup card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-sans font-semibold text-sm text-gray-900 tracking-tight flex items-center gap-1.5 border-b border-gray-50 pb-3">
                  <Smile size={16} className="text-emerald-700" />
                  <span>Chỉnh sửa thông tin học sinh</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase">Họ và tên</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 focus:ring-1 focus:ring-emerald-500 text-gray-800"
                      value={student.name}
                      onChange={(e) => handleUpdate({ name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase">Giới tính</label>
                      <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 focus:ring-1 focus:ring-emerald-500 text-gray-850"
                        value={student.gender}
                        onChange={(e) => handleUpdate({ gender: e.target.value as 'Nam' | 'Nữ' })}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase">Mục tiêu điểm số</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 focus:ring-1 focus:ring-emerald-500 font-mono text-gray-850"
                        value={student.targetGrade}
                        onChange={(e) => handleUpdate({ targetGrade: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase">Liên hệ phụ huynh</label>
                    <input
                      type="text"
                      placeholder="Tên phụ huynh - SĐT"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 focus:ring-1 focus:ring-emerald-500 text-gray-800"
                      value={student.parentContact}
                      onChange={(e) => handleUpdate({ parentContact: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase">Ảnh học sinh (Avatar URL)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 focus:ring-1 focus:ring-emerald-500 text-gray-800"
                      value={student.avatar}
                      onChange={(e) => handleUpdate({ avatar: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Status checklist Card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-sans font-semibold text-sm text-gray-900 tracking-tight flex items-center gap-1.5 border-b border-gray-50 pb-3">
                    <Award size={16} className="text-amber-500" />
                    <span>Hồ sơ năng lực học sinh</span>
                  </h3>
                  
                  <div className="py-2 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Xếp hạng môn Toán:</span>
                      <strong className="text-gray-800 font-mono">{mathAvg >= 8.5 ? 'Xuất sắc (A)' : mathAvg >= 7.0 ? 'Khá (B)' : 'Cần cố gắng (C)'} ({mathAvg.toFixed(1)})</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Xếp hạng môn Ngữ Văn:</span>
                      <strong className="text-gray-800 font-mono">{litAvg >= 8.5 ? 'Xuất sắc (A)' : litAvg >= 7.0 ? 'Khá (B)' : 'Cần cố gắng (C)'} ({litAvg.toFixed(1)})</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Xếp hạng môn Tiếng Anh:</span>
                      <strong className="text-gray-800 font-mono">{engAvg >= 8.5 ? 'Xuất sắc (A)' : engAvg >= 7.0 ? 'Khá (B)' : 'Cần cố gắng (C)'} ({engAvg.toFixed(1)})</strong>
                    </div>
                    
                    <div className="border-t border-gray-50 pt-3">
                      <div className="text-[11px] text-gray-400 uppercase font-semibold">Tóm tắt tình trạng hiện tại</div>
                      {overallAvg >= student.targetGrade ? (
                        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-semibold mt-2 border border-emerald-150 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-emerald-600" />
                          <span>Học sinh đã vượt/đạt mục tiêu điểm số đặt ra!</span>
                        </div>
                      ) : (
                        <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs font-semibold mt-2 border border-rose-150 flex items-center gap-1.5">
                          <AlertCircle size={14} className="text-rose-600" />
                          <span>Học sinh còn chậm {(student.targetGrade - overallAvg).toFixed(1)} điểm so với mục tiêu.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-mono italic">
                  * Dữ liệu thi đua được tự động đồng bộ hóa trên máy chủ Edtech an toàn.
                </div>
              </div>
            </div>

            {/* Smart notes Ledger history integration */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-sans font-semibold text-sm text-gray-900 tracking-tight flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <BookOpen size={16} className="text-indigo-600" />
                <span>Nhật ký Sư phạm liên kết (Hồ sơ năng lực liên tục)</span>
              </h3>
              
              <div className="space-y-3">
                {student.teacherNotes.length === 0 && student.attitudeLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Chưa có hoạt động sư phạm nào được lưu trữ.</p>
                ) : (
                  <div className="space-y-2.5">
                    {/* Combine attitude logs and teacher notes sorted by date */}
                    {[
                      ...student.attitudeLogs.map(l => ({ date: l.date, text: `Phát sinh điểm thi đua:  [${l.tag}] ${l.points > 0 ? '+' : ''}${l.points}đ - "${l.reason}"`, icon: "🏆", color: l.points > 0 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100" })),
                      ...student.teacherNotes.map(n => ({ date: n.date, text: `Sổ ghi chú sư phạm (mục ${getNoteCategoryLabel(n.category)}): "${n.content}"`, icon: "📝", color: "text-indigo-600 bg-indigo-50 border-indigo-100" }))
                    ]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((item, id) => (
                        <div key={id} className={`p-3 rounded-xl border flex gap-2.5 items-start text-xs leading-relaxed ${item.color}`}>
                          <span className="text-sm">{item.icon}</span>
                          <div className="flex-1">
                            <div className="font-mono text-[10px] text-gray-400 font-semibold mb-0.5">{item.date}</div>
                            <div>{item.text}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC SCOREBOARD MANAGER */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            {/* Quick addition of scores */}
            <form onSubmit={handleAddGrade} className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-3">
              <div className="font-medium text-xs text-emerald-950 flex items-center gap-1.5">
                <PlusCircle size={14} className="text-emerald-700" />
                <span>Cập nhật thêm cột điểm nhập học thuật</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-gray-500">Môn học</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-800"
                    value={newGradeSubject}
                    onChange={(e) => setNewGradeSubject(e.target.value as any)}
                  >
                    <option value="math">Toán đại số</option>
                    <option value="literature">Ngữ văn</option>
                    <option value="english">Tiếng Anh</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-gray-500">Kỳ thi / Đầu điểm</label>
                  <input
                    type="text"
                    required
                    placeholder="KT 15 phút, KT 1 tiết..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-800"
                    value={newGradeName}
                    onChange={(e) => setNewGradeName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-gray-500">Điểm số (0 - 10)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="8.5"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-800"
                    value={newGradeValue}
                    onChange={(e) => setNewGradeValue(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2 px-3 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Lưu điểm</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Maths Column */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <h4 className="font-semibold text-xs text-gray-900 uppercase">Môn Toán</h4>
                  <span className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-mono font-bold">
                    TB: {mathAvg.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  {student.academic.math.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-2">Chưa nhập điểm Toán.</div>
                  ) : (
                    student.academic.math.map((g, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl text-xs hover:bg-gray-100 transition-all">
                        <span className="text-gray-600 font-medium">{g.name}</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-800 font-mono">{g.score.toFixed(1)}</strong>
                          <button
                            onClick={() => handleDeleteGrade('math', idx)}
                            className="text-gray-400 hover:text-rose-650 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Literature Column */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <h4 className="font-semibold text-xs text-gray-900 uppercase">Ngữ Văn</h4>
                  <span className="text-xs bg-pink-50 text-pink-800 px-2 py-0.5 rounded-full font-mono font-bold">
                    TB: {litAvg.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  {student.academic.literature.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-2">Chưa nhập điểm Văn.</div>
                  ) : (
                    student.academic.literature.map((g, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl text-xs hover:bg-gray-100 transition-all">
                        <span className="text-gray-600 font-medium">{g.name}</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-800 font-mono">{g.score.toFixed(1)}</strong>
                          <button
                            onClick={() => handleDeleteGrade('literature', idx)}
                            className="text-gray-400 hover:text-rose-650 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* English Column */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <h4 className="font-semibold text-xs text-gray-900 uppercase">Tiếng Anh</h4>
                  <span className="text-xs bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                    TB: {engAvg.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  {student.academic.english.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-2">Chưa nhập điểm Anh.</div>
                  ) : (
                    student.academic.english.map((g, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl text-xs hover:bg-gray-100 transition-all">
                        <span className="text-gray-600 font-medium">{g.name}</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-800 font-mono">{g.score.toFixed(1)}</strong>
                          <button
                            onClick={() => handleDeleteGrade('english', idx)}
                            className="text-gray-400 hover:text-rose-650 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GAMIFICATION & ATHLETE ACTIVITY LOG */}
        {activeTab === 'gamification' && (
          <div className="space-y-6">
            {/* Attitude score presets */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h4 className="font-sans font-semibold text-xs text-gray-900 uppercase tracking-tight">Ký hoặc khen thưởng thi đua (Gamification Trực tiếp)</h4>
                <p className="text-[11px] text-gray-500 mt-1">Chọn nhanh hoạt động bên dưới để cộng hoặc trừ điểm thái độ của {student.name}.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {ATTITUDE_TAGS.map((tag, id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => triggerAttitudeLog(tag.points, tag.label, `Điểm cộng/trừ rèn luyện: ${tag.label}`)}
                    className={`flex items-center gap-1 px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95 ${tag.points > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100' : 'bg-red-50 border-red-150 text-red-800 hover:bg-red-100'}`}
                  >
                    <span>{tag.points > 0 ? `+${tag.points}` : tag.points}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>

              <hr className="border-gray-50" />

              {/* Custom manual point transaction */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-700">Ghi nhận sự kiện đặc thù khác mẫu:</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800"
                      placeholder="Tag (ví dụ: Chuyên cần, Đạt giải)"
                      value={customAttitudeTag}
                      onChange={(e) => setCustomAttitudeTag(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-800"
                      placeholder="Mô tả cụ thể hành vi tại đây..."
                      value={customAttitudeReason}
                      onChange={(e) => setCustomAttitudeReason(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <select
                        className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-gray-800"
                        value={customAttitudePoint}
                        onChange={(e) => setCustomAttitudePoint(e.target.value)}
                      >
                        <option value="10">+10</option>
                        <option value="5">+5</option>
                        <option value="2">+2</option>
                        <option value="-2">-2</option>
                        <option value="-3">-3</option>
                        <option value="-5">-5</option>
                        <option value="-10">-10</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!customAttitudeTag || !customAttitudeReason) {
                            alert("Nhập đủ tag và lý do cụ thể.");
                            return;
                          }
                          triggerAttitudeLog(parseInt(customAttitudePoint), customAttitudeTag, customAttitudeReason);
                        }}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold py-1.5 px-3 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Ghi</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attitude Logs database list */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="font-sans font-semibold text-xs text-gray-900 uppercase">Thống kê điểm chuyên cần & thi đua</h4>
              
              <div className="space-y-2">
                {student.attitudeLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Chưa phát sinh điểm rèn luyện thái độ nào.</p>
                ) : (
                  [...student.attitudeLogs].reverse().map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs border border-gray-100 hover:bg-gray-100/50 transition-all">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold shrink-0 ${log.points > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {log.points > 0 ? `+${log.points}` : log.points}đ
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 break-words">{log.reason}</div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                            <span className="font-semibold bg-white px-1.5 py-0.2 rounded-md shadow-xs border border-gray-200">{log.tag}</span>
                            <span>•</span>
                            <span>{log.date}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAttitudeLog(log.id)}
                        className="text-gray-400 hover:text-rose-650 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                        title="Xóa dòng thi đua"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MULTI-DIMENSIONAL ASSESSMENT & REVIEWS */}
        {activeTab === 'interpersonal' && (
          <div className="space-y-6">
            
            {/* ONE: SELF ASSESSMENT reflection */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <h3 className="font-sans font-semibold text-xs text-gray-950 uppercase border-b border-gray-50 pb-2 flex items-center gap-1 text-slate-900">
                <Smile size={15} className="text-amber-500" />
                <span>1. Học sinh tự nhận xét & phản ánh (Self Evaluation)</span>
              </h3>

              {student.selfEvaluations.map((se, id) => (
                <div key={id} className="bg-amber-50/40 p-4 border border-amber-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Cập nhật ngày: {se.date}</span>
                    <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">Mức độ tự tin đạt mục tiêu: {se.goalRating}%</span>
                  </div>
                  <div className="text-xs leading-relaxed text-gray-800">
                    <p className="font-bold text-slate-800">Ý kiến phản ánh thực trạng:</p>
                    <p className="italic bg-white/70 p-2 rounded-lg mt-1 border border-amber-50/50">{se.reflection || 'Chưa thiết lập nhận định.'}</p>
                  </div>
                  <div className="text-xs text-gray-800">
                    <span className="font-bold text-slate-800">Tự nhận điểm mạnh thế mạnh: </span>
                    <span className="bg-white px-2 py-0.5 border border-amber-100 rounded-md font-medium text-slate-800">{se.strengths || 'Chưa thiết lập thế mạnh.'}</span>
                  </div>
                </div>
              ))}

              {/* Edit self reflection inline form */}
              <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl">
                <div className="text-xs font-semibold text-gray-700">Khảo sát / Cập nhật tự đánh giá nhanh của HS:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Đánh giá chung (phản ánh)</label>
                    <textarea
                      id="self-reflection-input"
                      rows={2}
                      placeholder="Em cảm thấy học kỳ này thế nào..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs mt-1 text-gray-800"
                      defaultValue={student.selfEvaluations[0]?.reflection || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Khả năng rèn tự học (30 - 100%)</label>
                      <input
                        id="self-goal-rating"
                        type="range"
                        min="30"
                        max="100"
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                        defaultValue={student.selfEvaluations[0]?.goalRating || 80}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Điểm mạnh tự tin nhất</label>
                      <input
                        id="self-strengths"
                        type="text"
                        placeholder="Năng khiếu cụ thể..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-800"
                        defaultValue={student.selfEvaluations[0]?.strengths || ''}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const refEl = document.getElementById('self-reflection-input') as HTMLTextAreaElement;
                      const goalEl = document.getElementById('self-goal-rating') as HTMLInputElement;
                      const strengthEl = document.getElementById('self-strengths') as HTMLInputElement;
                      
                      if (refEl && goalEl && strengthEl) {
                        handleUpdateSelfEvaluation(refEl.value, parseInt(goalEl.value), strengthEl.value);
                      }
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 transition-colors text-white text-xs font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Save size={12} />
                    <span>Lưu Cập Nhật</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TWO: PEER EVALUATION list & input */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <h3 className="font-sans font-semibold text-xs text-gray-950 uppercase border-b border-gray-50 pb-2 flex items-center gap-1 text-slate-900">
                <Star size={15} className="text-emerald-700" />
                <span>2. Đánh giá từ bạn học cùng tổ (Peer Evaluation)</span>
              </h3>

              <div className="space-y-3">
                {student.peerEvaluations.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">Chưa nhận được phản hồi ngang hàng từ các học sinh xung quanh.</p>
                ) : (
                  student.peerEvaluations.map((peer, idx) => (
                    <div key={idx} className="bg-gray-50 p-3.5 border border-gray-100 rounded-xl relative space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-gray-800">Bạn học: {peer.evaluator} (Đồng học)</strong>
                        <div className="flex gap-0.5 block text-amber-500">
                          {Array.from({ length: peer.rating }).map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <div className="text-gray-600 mt-1">
                        <strong className="text-slate-850">Ưu điểm nổi bật:</strong> {peer.strengths}
                      </div>
                      <div className="text-gray-600">
                        <strong className="text-slate-850">Cần cải thiện:</strong> {peer.weaknesses || 'N/A'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono text-right mt-1">{peer.date}</div>
                      
                      <button
                        onClick={() => handleDeletePeer(idx)}
                        className="absolute right-3 bottom-2 text-gray-400 hover:text-rose-650 cursor-pointer"
                        title="Xóa bạn học đánh giá"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Form to append classmate evaluation */}
              <form onSubmit={handleAddPeerRev} className="bg-gray-50/50 p-4 rounded-xl space-y-3 text-xs border border-gray-200">
                <div className="font-semibold text-gray-750">Thêm Đánh giá Đồng đẳng:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Tên người nhận xét</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Nam, Chi, Minh"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-850"
                      value={peerEvaluator}
                      onChange={(e) => setPeerEvaluator(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Đánh giá chung (Số Sao 1 - 5)</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-850"
                      value={peerRating}
                      onChange={(e) => setPeerRating(parseInt(e.target.value))}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                      <option value="4">⭐⭐⭐⭐ 4/5</option>
                      <option value="3">⭐⭐⭐ 3/5</option>
                      <option value="2">⭐⭐ 2/5</option>
                      <option value="1">⭐ 1/5</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Điểm mạnh</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rất thân thiện, nhiệt tình..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-850"
                      value={peerStrengths}
                      onChange={(e) => setPeerStrengths(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Điểm yếu cần khắc phục</label>
                    <input
                      type="text"
                      placeholder="e.g., Đôi khi còn ham chơi, chưa tốn thời gian..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-850"
                      value={peerWeaknesses}
                      onChange={(e) => setPeerWeaknesses(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Lưu Đánh giá bạn</span>
                  </button>
                </div>
              </form>
            </div>

            {/* THREE: TEACHER NOTES logging */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <h3 className="font-sans font-semibold text-xs text-gray-950 uppercase border-b border-gray-50 pb-2 flex items-center gap-1 text-slate-900">
                <MessageSquare size={15} className="text-indigo-600" />
                <span>3. Ghi chú sư phạm định tính (Teacher Notes)</span>
              </h3>

              <div className="space-y-3">
                {student.teacherNotes.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">Chưa ghi nhận nhận xét định tính cá nhân nào của GV.</p>
                ) : (
                  student.teacherNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3.5 border border-indigo-100 rounded-xl flex items-start gap-3 relative text-xs">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getNoteCategoryColor(note.category)}`}>
                        {getNoteCategoryLabel(note.category)}
                      </span>
                      <div className="flex-1">
                        <div className="text-gray-800">{note.content}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-1">{note.date}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-rose-650 cursor-pointer absolute right-3 top-3.5"
                        title="Xóa nhận xét"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Form to submit note */}
              <form onSubmit={handleAddTeacherNote} className="bg-gray-50/50 p-4 rounded-xl space-y-3 text-xs border border-gray-200">
                <div className="font-semibold text-gray-750">Thêm Ghi chú sư phạm mới:</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Nội dung ghi nhận định tính</label>
                    <input
                      type="text"
                      required
                      placeholder="Phân tích chi tiết hành vi, gia cảnh, hoặc khó khăn trong tuần..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs mt-1 text-gray-850"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Phân hệ</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-xl px-2 py-1.5 text-xs mt-1 text-gray-850"
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as any)}
                    >
                      <option value="academic">Học tập / Điểm số</option>
                      <option value="behavior">Rèn luyện kỷ luật</option>
                      <option value="social">Xã hội / Kỹ năng</option>
                      <option value="health">Tâm lý / Sức khỏe</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Lưu nhận nhận xét</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
