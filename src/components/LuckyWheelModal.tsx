import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import { X, Play, Trophy, Award, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onAwardPoints: (studentId: string, points: number, tag: string, reason: string) => void;
}

export default function LuckyWheelModal({
  isOpen,
  onClose,
  students,
  onAwardPoints
}: LuckyWheelModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const [awardPoints, setAwardPoints] = useState<number>(5);
  const [awardReason, setAwardReason] = useState<string>('Hăng hái phát biểu xây dựng bài');
  const [awardTag, setAwardTag] = useState<string>('Phát biểu');
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const startAngle = useRef(0);
  const spinTimeout = useRef<any>(null);
  const spinArcStart = useRef(10);
  const spinTime = useRef(0);
  const spinTimeTotal = useRef(0);

  // Predefined beautiful palette for slices
  const colors = [
    '#0f766e', '#115e59', '#1e3a8a', '#1e40af', '#3730a3',
    '#581c87', '#6b21a8', '#86198f', '#9d174d', '#9f1239',
    '#065f46', '#047857', '#0369a1', '#075985', '#155e75'
  ];

  const drawRouletteWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const len = students.length;
    if (len === 0) return;

    const arc = Math.PI / (len / 2);
    const outsideRadius = 140;
    const textRadius = 100;
    const insideRadius = 25;

    ctx.clearRect(0, 0, 320, 320);

    ctx.strokeStyle = '#eaeaea';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < len; i++) {
      const angle = startAngle.current + i * arc;
      ctx.fillStyle = colors[i % colors.length];

      ctx.beginPath();
      ctx.arc(160, 160, outsideRadius, angle, angle + arc, false);
      ctx.arc(160, 160, insideRadius, angle + arc, angle, true);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.translate(
        160 + Math.cos(angle + arc / 2) * textRadius,
        160 + Math.sin(angle + arc / 2) * textRadius
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);

      const name = students[i].name;
      const displayName = name.split(' ').slice(-2).join(' '); // Show last 2 words of name
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(displayName, -ctx.measureText(displayName).width / 2, 0);
      ctx.restore();
    }

    // Draw Arrow Pointer
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(160 - 5, 160 - outsideRadius - 10);
    ctx.lineTo(160 + 5, 160 - outsideRadius - 10);
    ctx.lineTo(160 + 5, 160 - outsideRadius + 4);
    ctx.lineTo(160 + 10, 160 - outsideRadius + 4);
    ctx.lineTo(160, 160 - outsideRadius + 15);
    ctx.lineTo(160 - 10, 160 - outsideRadius + 4);
    ctx.lineTo(160 - 5, 160 - outsideRadius + 4);
    ctx.closePath();
    ctx.fill();

    // Center circle decoration
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(160, 160, insideRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('PICK', 160 - ctx.measureText('PICK').width / 2, 163);
  };

  useEffect(() => {
    if (isOpen && students.length > 0) {
      setWinner(null);
      setShowAwardForm(false);
      setSuccessMsg(null);
      setTimeout(() => {
        drawRouletteWheel();
      }, 100);
    }
  }, [isOpen, students]);

  const spin = () => {
    if (isSpinning || students.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    setShowAwardForm(false);
    setSuccessMsg(null);
    spinTime.current = 0;
    spinTimeTotal.current = Math.random() * 3000 + 4000; // 4 to 7 seconds
    spinArcStart.current = Math.random() * 10 + 10;
    rotateWheel();
  };

  const rotateWheel = () => {
    spinTime.current += 30;
    if (spinTime.current >= spinTimeTotal.current) {
      stopRotateWheel();
      return;
    }
    const spinAngle =
      spinArcStart.current -
      easeOut(spinTime.current, 0, spinArcStart.current, spinTimeTotal.current);
    startAngle.current += (spinAngle * Math.PI) / 180;
    drawRouletteWheel();
    spinTimeout.current = setTimeout(rotateWheel, 30);
  };

  const stopRotateWheel = () => {
    clearTimeout(spinTimeout.current);
    setIsSpinning(false);

    const len = students.length;
    const arc = Math.PI / (len / 2);
    const degrees = (startAngle.current * 180) / Math.PI + 90;
    const arDegrees = (arc * 180) / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arDegrees) % len;
    
    const pickedWinner = students[index];
    setWinner(pickedWinner);
    setShowAwardForm(true);
  };

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const handleSubmitAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winner) return;

    onAwardPoints(winner.id, awardPoints, awardTag, awardReason);
    setSuccessMsg(`Đã ghi nhận điểm rèn luyện cho ${winner.name}!`);
    setTimeout(() => {
      setSuccessMsg(null);
      setShowAwardForm(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-5 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-300" />
            <h3 className="font-bold text-sm">Vòng Quay Tương Tác Lớp Học</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSpinning}
            className="text-white/80 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center space-y-5">
          {students.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Chưa có học sinh nào trong lớp để quay.
            </div>
          ) : (
            <>
              {/* Wheel canvas container */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={320}
                  className="rounded-full shadow-inner border-2 border-slate-100 bg-slate-50/50"
                />
                
                {/* Spin absolute button */}
                <button
                  onClick={spin}
                  disabled={isSpinning}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-black rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer border-4 border-white disabled:cursor-not-allowed text-xs uppercase"
                >
                  {isSpinning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} className="fill-white translate-x-0.5" />}
                </button>
              </div>

              {/* State 1: Spin Result / Winner Announcement */}
              {winner && !isSpinning && (
                <div className="w-full bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-center space-y-1.5 animate-bounce">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center justify-center gap-1">
                    <Award size={12} />
                    Học sinh được chọn
                  </span>
                  <h4 className="text-base font-black text-slate-900">{winner.name}</h4>
                  <p className="text-[10px] text-emerald-700">Hãy ghi điểm thi đua xây dựng bài rèn luyện cho em</p>
                </div>
              )}

              {/* State 2: Award Points Form */}
              {showAwardForm && winner && !isSpinning && (
                <form onSubmit={handleSubmitAward} className="w-full space-y-3.5 border-t border-slate-100 pt-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Điểm thi đua:</label>
                      <select
                        value={awardPoints}
                        onChange={(e) => setAwardPoints(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      >
                        <option value="10">+10 Điểm xuất sắc</option>
                        <option value="5">+5 Phát biểu / Khen thưởng</option>
                        <option value="2">+2 Có cố gắng</option>
                        <option value="-2">-2 Làm việc riêng</option>
                        <option value="-5">-5 Thiếu bài tập / Vi phạm</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Nhãn thi đua:</label>
                      <select
                        value={awardTag}
                        onChange={(e) => setAwardTag(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      >
                        <option value="Phát biểu">Phát biểu</option>
                        <option value="Trực nhật">Trực nhật</option>
                        <option value="Thành tích">Thành tích</option>
                        <option value="Giúp đỡ bạn">Giúp đỡ bạn</option>
                        <option value="Làm việc riêng">Làm việc riêng</option>
                        <option value="Không làm BT">Không làm bài tập</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Lý do cụ thể:</label>
                    <input
                      type="text"
                      value={awardReason}
                      onChange={(e) => setAwardReason(e.target.value)}
                      placeholder="Nhập lý do cộng/trừ điểm..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAwardForm(false)}
                      className="flex-1 py-2 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
                    >
                      Bỏ qua
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Xác Nhận Cộng Điểm
                    </button>
                  </div>
                </form>
              )}

              {successMsg && (
                <div className="w-full p-3 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 flex items-center justify-center gap-1 text-xs">
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
