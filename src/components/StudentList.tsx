import React, { useState } from 'react';
import { Student } from '../types';
import { Search, UserPlus, Trophy, AlertTriangle, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onAddStudent: () => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddStudent,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name'); // name, academic, attitude

  // Calculate student analytical properties inside the selector
  const updatedStudents = students.map(s => {
    const mathAvg = s.academic.math.length ? s.academic.math.reduce((a, b) => a + b.score, 0) / s.academic.math.length : 0;
    const litAvg = s.academic.literature.length ? s.academic.literature.reduce((a, b) => a + b.score, 0) / s.academic.literature.length : 0;
    const engAvg = s.academic.english.length ? s.academic.english.reduce((a, b) => a + b.score, 0) / s.academic.english.length : 0;
    
    const count = [s.academic.math.length, s.academic.literature.length, s.academic.english.length].filter(x => x > 0).length;
    const average = count > 0 ? (mathAvg + litAvg + engAvg) / 3 : 0;

    return {
      ...s,
      average,
      mathAvg,
      litAvg,
      engAvg
    };
  });

  // Filter and Sort
  const filteredStudents = updatedStudents
    .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGender = filterGender === 'all' || s.gender === filterGender;
      return matchSearch && matchGender;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'vi');
      } else if (sortBy === 'academic') {
        return b.average - a.average;
      } else if (sortBy === 'attitude') {
        return b.attitudeScore - a.attitudeScore;
      }
      return 0;
    });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col" id="student-list-container">
      {/* Header section */}
      <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="font-sans font-semibold text-lg text-gray-900 tracking-tight flex items-center gap-2">
            Danh sách Lớp
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-mono font-medium">
              {students.length} HS
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Quản lý điểm số & thái độ thi đua</p>
        </div>
        
        <button
          onClick={onAddStudent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl text-xs font-medium shadow-sm cursor-pointer"
          id="btn-add-student"
        >
          <UserPlus size={14} />
          <span>Thêm Học Sinh</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="p-4 bg-white border-b border-gray-100 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm tên học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder-gray-400 text-gray-800"
            id="students-filter-search"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex gap-1">
            <button
              onClick={() => setFilterGender('all')}
              className={`px-2.5 py-1 text-[10px] rounded-lg font-medium border transition-all cursor-pointer ${
                filterGender === 'all'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-750'
                  : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterGender('Nam')}
              className={`px-2.5 py-1 text-[10px] rounded-lg font-medium border transition-all cursor-pointer ${
                filterGender === 'Nam'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-750'
                  : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Nam
            </button>
            <button
              onClick={() => setFilterGender('Nữ')}
              className={`px-2.5 py-1 text-[10px] rounded-lg font-medium border transition-all cursor-pointer ${
                filterGender === 'Nữ'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-750'
                  : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Nữ
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Filter size={11} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 font-medium text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="name">Tên A-Z</option>
              <option value="academic">Điểm TB</option>
              <option value="attitude">Thực lực thi đua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 max-h-[500px]">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            Không tìm thấy học sinh nào phù hợp.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isSelected = student.id === selectedStudentId;
            const diffWithGoal = student.average - student.targetGrade;
            const isFallingBehind = diffWithGoal < -0.5 || student.attitudeScore < 100;

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-50/40 border-l-4 border-emerald-600'
                    : 'hover:bg-gray-50/50 border-l-4 border-transparent'
                }`}
                id={`student-item-${student.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={student.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    {isFallingBehind && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border border-white">
                        <AlertTriangle size={10} />
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-medium text-xs text-gray-900 truncate">
                        {student.name}
                      </h3>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                        student.gender === 'Nam' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                      }`}>
                        {student.gender}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1.5">
                      {/* Academic badge */}
                      <span className="text-[11px] text-gray-500 font-mono flex items-center gap-0.5">
                        Điểm TB: <strong className="text-gray-800">{student.average.toFixed(1)}</strong>
                      </span>
                      
                      {/* Divider */}
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>

                      {/* Attitude points badge */}
                      <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                        <Trophy size={11} className="text-amber-500" />
                        <strong className="text-gray-800 font-mono">{student.attitudeScore}đ</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-mono font-semibold text-gray-400">
                      Mục tiêu: {student.targetGrade.toFixed(1)}
                    </div>
                    <div className={`text-[9px] font-mono font-medium ${
                      diffWithGoal >= 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {diffWithGoal >= 0 ? `+${diffWithGoal.toFixed(1)}` : diffWithGoal.toFixed(1)}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
