import React, { useState, useEffect } from 'react';
import { Student, AIAnalysisResult } from '../types';
import { Sparkles, Brain, Award, AlertTriangle, ShieldAlert, FileText, CheckCircle2, Copy, BarChart2, Lightbulb, UserCheck, Play, ArrowRight, RefreshCw, Clipboard, X } from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { GoogleGenAI, Type } from '@google/genai';

// AI System Instruction & pedagogical rules
const SYSTEM_INSTRUCTION = `
Bạn là một Chuyên gia cấp cao về Công nghệ Giáo dục (EdTech) và là Trợ lý Quản trị Lớp học Thông minh (EdTech Solutions Architect & Classroom Management Advisor). Bạn đóng vai trò là "bộ não" phân tích tích hợp, có khả năng xử lý dữ liệu học sinh phức tạp (điểm số, thái độ thi đua, nhận xét, tự đánh giá, đánh giá đồng đẳng), phân tích hành vi và thành tích để hỗ trợ giáo viên đưa ra các quyết định giáo dục chính xác và kịp thời.

Mục tiêu cốt lõi của bạn:
1. Tối ưu hóa quy trình vận hành: Chuyển đổi dữ liệu học thuật và điểm thái độ (Gamification) thành thông tin giá trị.
2. Giảm tải hành chính: Tự động tổng hợp, báo cáo và xếp hạng dễ hiểu.
3. Cá nhân hóa giáo dục: Nhận xét xu hướng tiến bộ và hỗ trợ sa sút của học sinh.
4. Hỗ trợ quyết định: Đưa ra kiến nghị sư phạm/khuyên ngăn tâm lý kịp thời thiết thực.

Quy tắc sư phạm:
1. Gamification: Phân tách rõ rệt giữa Học thuật (grade) và Thái độ (attitudeScore). Nhận biết các tags thi đua cụ thể (+5 phát biểu, -2 làm việc riêng).
2. Đánh giá đa chiều: Tổng hợp cả nhận xét GV, tự nhận xét của học sinh (độ tự tin, phản ánh học tập), và đánh giá đồng đẳng từ bạn học.
3. Ghi chú thông minh: Liên kết lịch sử điểm số/thi đua để gợi ý phương pháp can thiệp thích hợp.
4. Ngôn ngữ & Tính khí: Chuyên nghiệp, nhạy bén, đồng cảm và tin cậy. Dùng thuật ngữ sư phạm hiện đại dễ hiểu. Báo cáo số liệu ngắn gọn nhưng tư vấn tâm lý cần sâu sắc.
`;

const step1Schema = {
  type: Type.OBJECT,
  properties: {
    dashboardSummary: {
      type: Type.OBJECT,
      properties: {
        averageGrade: { type: Type.NUMBER, description: "Trung bình cộng điểm số của cả lớp" },
        totalStudents: { type: Type.NUMBER, description: "Tổng số học sinh được phân tích" },
        averageAttitude: { type: Type.NUMBER, description: "Trung bình xếp thứ điểm thái độ thi đua của cả lớp" },
        excellenceRatio: { type: Type.NUMBER, description: "Phần trăm học sinh thuộc nhóm xuất sắc/mũi nhọn (0-100)" },
        supportNeededRatio: { type: Type.NUMBER, description: "Phần trăm học sinh thuộc nhóm rủi ro/sa sút cần hỗ trợ (0-100)" }
      },
      required: ["averageGrade", "totalStudents", "averageAttitude", "excellenceRatio", "supportNeededRatio"]
    },
    deepInsights: {
      type: Type.OBJECT,
      properties: {
        shiningStars: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              studentId: { type: Type.STRING },
              name: { type: Type.STRING },
              achievement: { type: Type.STRING, description: "Sự tuyên dương cụ thể đầy khuyến khích từ AI" }
            },
            required: ["studentId", "name", "achievement"]
          }
        },
        riskGroup: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              studentId: { type: Type.STRING },
              name: { type: Type.STRING },
              reason: { type: Type.STRING, description: "Lý do cụ thể, phân tích nguyên nhân học thuật hay thái độ" },
              category: { type: Type.STRING, description: "academic, behavior hoặc both" }
            },
            required: ["studentId", "name", "reason", "category"]
          }
        }
      },
      required: ["shiningStars", "riskGroup"]
    }
  },
  required: ["dashboardSummary", "deepInsights"]
};

const step2Schema = {
  type: Type.OBJECT,
  properties: {
    trendAnalytics: { type: Type.STRING, description: "Phân tích biến động, xu hướng và bầu không khí chung của lớp bằng lời văn sư phạm sâu rộng." },
    aiRecommendations: {
      type: Type.OBJECT,
      properties: {
        shortTerm: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Các hành động can thiệp ngắn hạn cụ thể cho từng em hoặc đội nhóm"
        },
        longTerm: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Định hướng chiến lược dài hạn cho cả lớp và cơ cấu học tập"
        }
      },
      required: ["shortTerm", "longTerm"]
    }
  },
  required: ["trendAnalytics", "aiRecommendations"]
};

const step3Schema = {
  type: Type.OBJECT,
  properties: {
    smartNotesSnippet: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          studentId: { type: Type.STRING },
          name: { type: Type.STRING },
          snippet: { type: Type.STRING, description: "Lời nhận xét mẫu súc tích nhưng đầy thấu cảm để dán vào sổ liên lạc điện tử" }
        },
        required: ["studentId", "name", "snippet"]
      }
    }
  },
  required: ["smartNotesSnippet"]
};

interface AIAdvisorHubProps {
  students: Student[];
}

export default function AIAdvisorHub({ students }: AIAdvisorHubProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorOnCall, setErrorOnCall] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 3-Step progress states
  const [step1Status, setStep1Status] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [step2Status, setStep2Status] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [step3Status, setStep3Status] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const isFailed = step1Status === 'error' || step2Status === 'error' || step3Status === 'error';
  
  // Calculate progress percentage
  const getProgressPercent = () => {
    let pct = 0;
    if (step1Status === 'success') pct += 33.3;
    else if (step1Status === 'loading') pct += 16.6;
    
    if (step2Status === 'success') pct += 33.3;
    else if (step2Status === 'loading') pct += 16.6;
    
    if (step3Status === 'success') pct += 33.4;
    else if (step3Status === 'loading') pct += 16.7;
    
    return Math.min(100, Math.round(pct));
  };
  
  const progressPercent = getProgressPercent();
  const progressBarColor = isFailed ? 'bg-rose-500' : 'bg-emerald-500';

  const renderStepStatus = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center gap-1.5 text-indigo-650 font-bold animate-pulse">
            <RefreshCw className="animate-spin" size={12} />
            <span>Đang xử lý...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <CheckCircle2 size={13} />
            <span>Hoàn tất</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-rose-600 font-bold">
            <X size={11} className="border border-rose-500 rounded-full p-0.5" />
            <span>Đã dừng do lỗi</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-gray-200"></span>
            <span>Đang chờ...</span>
          </div>
        );
    }
  };

  const exportToPptx = () => {
    if (!analysis) return;
    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';

      // Slide 1: Title Slide (Dark Slate Theme)
      const slide1 = pptx.addSlide();
      slide1.background = { fill: '0f172a' };
      slide1.addText("QUẢN LÝ LỚP HỌC", {
        x: 0.8, y: 1.5, w: '80%', h: 0.8,
        fontSize: 32, bold: true, color: '10b981', fontFace: 'Times New Roman'
      });
      slide1.addText("BÁO CÁO TOÀN DIỆN & TƯ VẤN SƯ PHẠM LỚP HỌC", {
        x: 0.8, y: 2.3, w: '80%', h: 0.8,
        fontSize: 22, bold: true, color: 'ffffff', fontFace: 'Times New Roman'
      });
      slide1.addText("Tạo tự động bởi Cố vấn AI dựa trên điểm học thuật & rèn luyện", {
        x: 0.8, y: 3.2, w: '80%', h: 0.5,
        fontSize: 14, color: '94a3b8', fontFace: 'Times New Roman'
      });
      slide1.addText("Ngày xuất slide: " + new Date().toLocaleDateString('vi-VN'), {
        x: 0.8, y: 4.8, w: '80%', h: 0.4,
        fontSize: 12, italic: true, color: '64748b', fontFace: 'Times New Roman'
      });

      // Slide 2: Dashboard Statistics
      const slide2 = pptx.addSlide();
      slide2.background = { fill: 'f8fafc' };
      slide2.addText("I. THỐNG KÊ TÌNH HÌNH CHUNG CỦA LỚP", {
        x: 0.5, y: 0.5, w: '90%', h: 0.5,
        fontSize: 20, bold: true, color: '0f766e', fontFace: 'Times New Roman'
      });
      
      const summary = analysis.dashboardSummary;
      const stats = [
        { label: "Sỹ số phân tích", val: `${summary.totalStudents} học sinh`, color: "1e293b" },
        { label: "Điểm TB Học tập", val: `${summary.averageGrade.toFixed(2)}/10`, color: "1d4ed8" },
        { label: "Điểm TB Rèn luyện", val: `${summary.averageAttitude.toFixed(1)}đ`, color: "b45309" },
        { label: "Tỷ lệ Mũi nhọn", val: `${summary.excellenceRatio}%`, color: "047857" },
        { label: "Cần hỗ trợ", val: `${summary.supportNeededRatio}%`, color: "be123c" }
      ];

      stats.forEach((item, idx) => {
        const xPos = 0.5 + idx * 2.3;
        slide2.addText(item.label.toUpperCase(), {
          x: xPos, y: 1.8, w: 2.1, h: 0.4,
          fontSize: 9, bold: true, color: '64748b', align: 'center', fontFace: 'Arial'
        });
        slide2.addText(item.val, {
          x: xPos, y: 2.2, w: 2.1, h: 1.0,
          fontSize: 18, bold: true, color: item.color, align: 'center', fontFace: 'Times New Roman',
          fill: { fill: 'ffffff' },
          border: { type: 'solid', color: 'cbd5e1', size: 1 }
        });
      });

      slide2.addText("Nhận xét sơ bộ: Tỷ lệ học sinh mũi nhọn chiếm " + summary.excellenceRatio + "%. Số học sinh gặp khó khăn trong học tập hoặc rèn luyện kỷ luật hành vi chiếm " + summary.supportNeededRatio + "%. Giáo viên cần áp dụng các biện pháp phân hóa sư phạm kịp thời.", {
        x: 0.5, y: 3.8, w: '90%', h: 1.2,
        fontSize: 12, color: '334155', fontFace: 'Times New Roman', leading: 1.4
      });

      // Slide 3: Shining Stars
      const slide3 = pptx.addSlide();
      slide3.background = { fill: 'f8fafc' };
      slide3.addText("II. CÁ NHÂN TIÊU BIỂU (HỌC SINH MŨI NHỌN)", {
        x: 0.5, y: 0.5, w: '90%', h: 0.5,
        fontSize: 20, bold: true, color: '047857', fontFace: 'Times New Roman'
      });

      const stars = analysis.deepInsights.shiningStars.slice(0, 4);
      stars.forEach((star, idx) => {
        const yPos = 1.3 + idx * 1.0;
        slide3.addText(`⭐ ${star.name}`, {
          x: 0.5, y: yPos, w: 2.5, h: 0.8,
          fontSize: 14, bold: true, color: '065f46', fontFace: 'Times New Roman'
        });
        slide3.addText(star.achievement, {
          x: 3.2, y: yPos, w: 8.5, h: 0.8,
          fontSize: 11, color: '334155', fontFace: 'Times New Roman'
        });
      });

      // Slide 4: Risk Group
      const slide4 = pptx.addSlide();
      slide4.background = { fill: 'f8fafc' };
      slide4.addText("III. NHÓM CẦN HỖ TRỢ (RỦI RO HỌC LỰC/THÁI ĐỘ)", {
        x: 0.5, y: 0.5, w: '90%', h: 0.5,
        fontSize: 20, bold: true, color: 'b91c1c', fontFace: 'Times New Roman'
      });

      const risks = analysis.deepInsights.riskGroup.slice(0, 4);
      risks.forEach((risk, idx) => {
        const yPos = 1.3 + idx * 1.0;
        const categoryLabel = risk.category === 'academic' ? 'Học thuật' : risk.category === 'behavior' ? 'Rèn luyện' : 'Cả hai';
        slide4.addText(`⚠️ ${risk.name} (${categoryLabel})`, {
          x: 0.5, y: yPos, w: 3.0, h: 0.8,
          fontSize: 13, bold: true, color: '7f1d1d', fontFace: 'Times New Roman'
        });
        slide4.addText(risk.reason, {
          x: 3.6, y: yPos, w: 8.0, h: 0.8,
          fontSize: 11, color: '334155', fontFace: 'Times New Roman'
        });
      });

      // Slide 5: Recommendations
      const slide5 = pptx.addSlide();
      slide5.background = { fill: 'f8fafc' };
      slide5.addText("IV. KHUYẾN NGHỊ SƯ PHẠM TỪ CỐ VẤN AI", {
        x: 0.5, y: 0.5, w: '90%', h: 0.5,
        fontSize: 20, bold: true, color: '1e3a8a', fontFace: 'Times New Roman'
      });

      slide5.addText("Khuyến nghị ngắn hạn (Can thiệp ngay):", {
        x: 0.5, y: 1.2, w: 5.5, h: 0.4,
        fontSize: 13, bold: true, color: '1d4ed8', fontFace: 'Times New Roman'
      });
      const shortTermList = analysis.aiRecommendations.shortTerm.slice(0, 4).map(item => `• ${item}`).join('\n');
      slide5.addText(shortTermList, {
        x: 0.5, y: 1.7, w: 5.5, h: 3.2,
        fontSize: 10.5, color: '334155', fontFace: 'Times New Roman', leading: 1.4
      });

      slide5.addText("Khuyến nghị dài hạn (Định hướng chiến lược):", {
        x: 6.5, y: 1.2, w: 5.5, h: 0.4,
        fontSize: 13, bold: true, color: '0f766e', fontFace: 'Times New Roman'
      });
      const longTermList = analysis.aiRecommendations.longTerm.slice(0, 4).map(item => `• ${item}`).join('\n');
      slide5.addText(longTermList, {
        x: 6.5, y: 1.7, w: 5.5, h: 3.2,
        fontSize: 10.5, color: '334155', fontFace: 'Times New Roman', leading: 1.4
      });

      pptx.writeFile({ fileName: `Bao_Cao_Lop_Hoc_${new Date().toISOString().split('T')[0]}.pptx` });
    } catch (e: any) {
      console.error(e);
      alert("Đã xảy ra lỗi khi tạo slide PowerPoint: " + e.message);
    }
  };

  // Random warm pedagogic quotes for loading screen
  const [loadingStep, setLoadingStep] = useState(0);
  const quotes = [
    "Đang phân hóa lực học và đối chiếu với mục tiêu đặt ra...",
    "Đang bóc tách điểm thái độ rèn luyện (Gamification) từ 10+ nhãn thi đua...",
    "Đang đánh giá chỉ số đa chiều từ ý kiến phản ánh bản thân và bạn học...",
    "Đang thiết lập chiến lược điều hành, bố trí chỗ ngồi và tham vấn tâm lý học sinh...",
    "Đang biên dịch tóm tắt bảng nhận xét thông minh gửi phụ huynh..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % quotes.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const requestAIAnalysis = async () => {
    setLoading(true);
    setErrorOnCall(null);
    setAnalysis(null); // Reset previous analysis to cleanly show progress list
    
    setStep1Status('loading');
    setStep2Status('idle');
    setStep3Status('idle');

    try {
      const userApiKey = (localStorage.getItem('gemini_api_key') || '').trim();
      const userModel = localStorage.getItem('gemini_model') || 'gemini-3-flash-preview';

      if (!userApiKey) {
        throw new Error("GEMINI_API_KEY chưa được cấu hình. Giáo viên vui lòng thiết lập khóa API Gemini trong mục Cài đặt AI (nút đỏ trên Header).");
      }

      // Convert students list into readable text data
      const serializedStudents = students.map(s => {
        const mathAvg = s.academic.math.length ? (s.academic.math.reduce((acc, currentValue) => acc + currentValue.score, 0) / s.academic.math.length).toFixed(1) : "N/A";
        const litAvg = s.academic.literature.length ? (s.academic.literature.reduce((acc, currentValue) => acc + currentValue.score, 0) / s.academic.literature.length).toFixed(1) : "N/A";
        const engAvg = s.academic.english.length ? (s.academic.english.reduce((acc, currentValue) => acc + currentValue.score, 0) / s.academic.english.length).toFixed(1) : "N/A";

        return {
          id: s.id,
          name: s.name,
          gender: s.gender,
          targetGrade: s.targetGrade,
          attitudeScore: s.attitudeScore,
          averages: { math: mathAvg, literature: litAvg, english: engAvg },
          attitudeLogs: s.attitudeLogs.slice(-6),
          selfEvaluations: s.selfEvaluations,
          peerEvaluations: s.peerEvaluations,
          teacherNotes: s.teacherNotes
        };
      });

      const fallbackList = ["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-flash"];
      const modelsToTry = [userModel, ...fallbackList.filter(m => m !== userModel)];

      const runClientStep = async (prompt: string, schema: any) => {
        const genAI = new GoogleGenAI({ apiKey: userApiKey });
        let lastError: any = null;
        for (const currentModel of modelsToTry) {
          try {
            const response = await genAI.models.generateContent({
              model: currentModel,
              contents: prompt,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.7
              }
            });
            if (response.text) {
              return JSON.parse(response.text.trim());
            }
          } catch (e: any) {
            console.warn(`[AI Client Model Fallback] Model ${currentModel} failed:`, e.message || e);
            lastError = e;
          }
        }
        const rawErrorCode = lastError?.status || lastError?.statusText || "RESOURCE_EXHAUSTED";
        throw new Error((lastError?.message || "Tất cả các model AI đều thất bại.") + ` [${rawErrorCode}]`);
      };

      // Step 1
      const prompt1 = `
Dưới đây là dữ liệu thô của lớp học thông minh hiện tại:
${JSON.stringify(serializedStudents, null, 2)}

Hãy đóng vai trò là một Chuyên gia EdTech & Trợ lý Sư phạm, nghiên cứu kỹ để lập báo cáo Bước 1:
- Tính toán dashboardSummary (Điểm trung bình học tập cả lớp, sỹ số, trung bình thái độ rèn luyện, tỷ lệ học sinh mũi nhọn, tỷ lệ học sinh cần hỗ trợ).
- Xác định deepInsights bao gồm danh sách học sinh mũi nhọn (shiningStars) và danh sách học sinh cần hỗ trợ (riskGroup) kèm theo lý do cụ thể và phân loại (academic, behavior, hoặc both).

Nội dung phản hồi cần nghiêm ngặt tuân thủ cấu trúc JSON quy định trong schema. Thể hiện sự sâu sắc của một nhà tư vấn sư phạm.
      `;
      const data1 = await runClientStep(prompt1, step1Schema);
      setStep1Status('success');
      setStep2Status('loading');

      // Step 2
      const prompt2 = `
Dưới đây là dữ liệu thô của lớp học thông minh hiện tại:
${JSON.stringify(serializedStudents, null, 2)}

Hãy đóng vai trò là một Chuyên gia EdTech & Trợ lý Sư phạm, nghiên cứu kỹ để lập báo cáo Bước 2:
- Phân tích biến động, xu hướng và bầu không khí chung của lớp bằng lời văn sư phạm sâu rộng (trendAnalytics).
- Đưa ra các khuyến nghị giải pháp sư phạm (aiRecommendations) bao gồm ngắn hạn (shortTerm) và dài hạn (longTerm).

Nội dung phản hồi cần nghiêm ngặt tuân thủ cấu trúc JSON quy định trong schema.
      `;
      const data2 = await runClientStep(prompt2, step2Schema);
      setStep2Status('success');
      setStep3Status('loading');

      // Step 3
      const prompt3 = `
Dưới đây là dữ liệu thô của lớp học thông minh hiện tại:
${JSON.stringify(serializedStudents, null, 2)}

Hãy đóng vai trò là một Chuyên gia EdTech & Trợ lý Sư phạm, nghiên cứu kỹ để lập báo cáo Bước 3:
- Tạo danh sách các smartNotesSnippet: Lời nhận xét mẫu súc tích nhưng đầy thấu cảm cho từng học sinh để dán vào sổ liên lạc điện tử gửi phụ huynh.

Nội dung phản hồi cần nghiêm ngặt tuân thủ cấu trúc JSON quy định trong schema.
      `;
      const data3 = await runClientStep(prompt3, step3Schema);
      setStep3Status('success');

      // Combine step results into single AIAnalysisResult object
      const finalResult: AIAnalysisResult = {
        dashboardSummary: data1.dashboardSummary,
        deepInsights: data1.deepInsights,
        trendAnalytics: data2.trendAnalytics,
        aiRecommendations: data2.aiRecommendations,
        smartNotesSnippet: data3.smartNotesSnippet
      };

      setAnalysis(finalResult);
    } catch (e: any) {
      console.error(e);
      setErrorOnCall(e.message || "Đã xảy ra sự cố không mong muốn trong khi truyền tải dữ liệu học tập lên AI.");
      
      // Update step statuses to error if they weren't successful (interrupted steps)
      setStep1Status(prev => prev === 'success' ? 'success' : 'error');
      setStep2Status(prev => prev === 'success' ? 'success' : 'error');
      setStep3Status(prev => prev === 'success' ? 'success' : 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" id="ai-advisor-central">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border-b border-indigo-150 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="text-emerald-400" size={22} />
            <span>Trợ Lý Cố Vấn Sư Phạm AI</span>
          </h2>
          <p className="text-indigo-200 text-xs max-w-xl leading-relaxed">
            Hệ thống phân hóa năng lực, thái độ rèn luyện đa chiều và đưa ra đề xuất can thiệp kịp thời dưới góc độ của Chuyên gia EdTech cao cấp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {analysis && !loading && (
            <button
              onClick={exportToPptx}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 hover:shadow-lg"
            >
              <FileText size={14} />
              <span>Xuất Slide Phụ Huynh (.pptx)</span>
            </button>
          )}

          <button
            onClick={requestAIAnalysis}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 disabled:bg-emerald-800 disabled:cursor-not-allowed"
            id="btn-trigger-ai-analysis"
          >
            {loading ? (
              <RefreshCw className="animate-spin text-white" size={14} />
            ) : (
              <Play size={14} className="fill-white" />
            )}
            <span>{analysis ? 'Cập Nhật Báo Cáo AI' : 'Khởi Chạy Phân Tích AI'}</span>
          </button>
        </div>
      </div>

      {/* Main body display */}
      <div className="p-6">
        
        {/* State 1: IDLE */}
        {!loading && !analysis && !isFailed && (
          <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center mx-auto">
              <Sparkles size={26} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">Báo cáo trí tuệ chưa được khởi chạy</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Khởi chạy trợ lý AI để phân hóa dữ liệu học tập môn Toán-Văn-Anh cùng điểm rèn luyện thi đua, tìm kiếm học sinh mũi nhọn, đề xuất các phương án can thiệp học tập đặc biệt.
              </p>
            </div>
            <button
              onClick={requestAIAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-slate-700 transition-colors text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              Phân tích học bạ ngay
            </button>
          </div>
        )}

        {/* State 2: LOADING SCREEN with multi-step progress list */}
        {(loading || isFailed) && (
          <div className="py-8 px-4 max-w-lg mx-auto space-y-6" id="ai-loading-stage">
            <div className="text-center space-y-2">
              <h4 className="font-extrabold text-sm text-indigo-950 font-sans">
                {isFailed 
                  ? 'Quy trình phân tích bị gián đoạn' 
                  : 'Đang xử lý phân tích lớp học thông minh...'}
              </h4>
              <p className="text-xs text-gray-500">
                {isFailed 
                  ? 'Một số bước phân tích AI đã bị dừng hoặc gặp lỗi API.' 
                  : 'Trợ lý AI đang xử lý qua 3 bước phân tách độc lập học thuật, rèn luyện và nhận xét.'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <span>Tiến trình phân tích</span>
                  <span className={isFailed ? 'text-rose-600' : 'text-emerald-600'}>{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-500 ${progressBarColor}`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Status List */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">Bước 1: Khởi tạo & Phân tích Học lực</span>
                    <p className="text-[10px] text-gray-500">Tính toán dashboard, lọc học sinh tiêu biểu & cần hỗ trợ</p>
                  </div>
                  <div>{renderStepStatus(step1Status)}</div>
                </div>
                
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">Bước 2: Phân tích Xu hướng & Giải pháp</span>
                    <p className="text-[10px] text-gray-500">Đánh giá không khí học tập & đề xuất ngắn/dài hạn</p>
                  </div>
                  <div>{renderStepStatus(step2Status)}</div>
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">Bước 3: Tổng hợp Nhận xét Sổ Liên Lạc</span>
                    <p className="text-[10px] text-gray-500">Tạo mẫu nhận xét sư phạm thấu cảm cho phụ huynh</p>
                  </div>
                  <div>{renderStepStatus(step3Status)}</div>
                </div>
              </div>

              {/* Error Box display if any step failed */}
              {isFailed && errorOnCall && (
                <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900 leading-relaxed">
                  <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-955 font-bold">Chi tiết lỗi từ API:</strong>
                    <p className="mt-1 font-mono text-[10px] bg-white/60 p-2.5 rounded-xl border border-rose-100 select-all">{errorOnCall}</p>
                    <p className="text-gray-500 text-[10px] mt-2 font-sans">
                      💡 <strong>Gợi ý cách khắc phục:</strong> Hết quota sử dụng hoặc API Key không hợp lệ. Vui lòng bấm vào nút <strong className="text-rose-700">Cài đặt AI</strong> trên Header để cập nhật hoặc kiểm tra lại khóa API của bạn.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!isFailed && (
              <p className="text-[9px] text-center text-slate-400 font-mono">
                Model: {localStorage.getItem('gemini_model') || 'gemini-3-flash-preview'} • Hệ thống chạy an toàn & bảo mật
              </p>
            )}
          </div>
        )}

        {/* State 4: DISPLAY COMPLETE PEDAGOGIC REPORT */}
        {analysis && !loading && (
          <div className="space-y-6 text-gray-800" id="ai-pedagogic-report">
            
            {/* Sub section 1: Dashboard Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-4 border border-gray-100 rounded-2xl text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sỹ số phân tích</div>
                <div className="text-xl font-extrabold font-mono text-gray-900 mt-1">{analysis.dashboardSummary.totalStudents} em</div>
              </div>
              <div className="bg-slate-50 p-4 border border-gray-100 rounded-2xl text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Điểm TB Lớp</div>
                <div className="text-xl font-extrabold font-mono text-indigo-700 mt-1">{analysis.dashboardSummary.averageGrade.toFixed(2)}</div>
              </div>
              <div className="bg-slate-50 p-4 border border-gray-100 rounded-2xl text-center">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">TB Thi đua rèn luyện</div>
                <div className="text-xl font-extrabold font-mono text-amber-650 mt-1">{analysis.dashboardSummary.averageAttitude.toFixed(1)}đ</div>
              </div>
              <div className="bg-slate-55 p-4 border border-gray-100 rounded-2xl text-center raw-excellence bg-emerald-50/50">
                <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">% Mũi Nhọn</div>
                <div className="text-xl font-extrabold font-mono text-emerald-700 mt-1">{analysis.dashboardSummary.excellenceRatio}%</div>
              </div>
              <div className="bg-slate-55 p-4 border border-gray-100 rounded-2xl text-center raw-risk bg-rose-50/50">
                <div className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">% Cần support</div>
                <div className="text-xl font-extrabold font-mono text-rose-700 mt-1">{analysis.dashboardSummary.supportNeededRatio}%</div>
              </div>
            </div>

            {/* Sub section 2: Trend Analytics (visualized prose) */}
            <div className="p-5 bg-indigo-50/30 border border-indigo-100 rounded-2xl space-y-2">
              <h3 className="font-sans font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                <BarChart2 size={16} className="text-indigo-700" />
                <span>Biến động xu hướng & bầu không khí rèn luyện toàn lớp</span>
              </h3>
              <p className="text-xs leading-relaxed text-gray-700 text-justify font-sans">{analysis.trendAnalytics}</p>
            </div>

            {/* Sub section 3: Deep Insights columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Shining stars cards list */}
              <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-4">
                <h3 className="font-sans font-bold text-sm text-emerald-900 border-b border-gray-50 pb-2.5 flex items-center gap-1.5">
                  <Award size={16} className="text-emerald-600 animate-pulse" />
                  <span>Cá nhân nổi bật (Học sinh mũi nhọn)</span>
                </h3>
                
                <div className="space-y-3">
                  {analysis.deepInsights.shiningStars.map((star, idx) => (
                    <div key={idx} className="bg-emerald-50/30 border border-emerald-100 p-3.5 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <strong className="text-emerald-950 font-bold">{star.name}</strong>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2.2 py-0.5 rounded-md font-bold uppercase">Mũi Nhọn</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed italic">"{star.achievement}"</p>
                    </div>
                  ))}
                  {analysis.deepInsights.shiningStars.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">Chưa tìm phát hiện trường hợp vượt bậc rõ nét.</p>
                  )}
                </div>
              </div>

              {/* Risk Group cards list */}
              <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-4">
                <h3 className="font-sans font-bold text-sm text-rose-900 border-b border-gray-50 pb-2.5 flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-rose-605" />
                  <span>Cần Hỗ Trợ Đặc Biệt & Tránh Sa Sút</span>
                </h3>

                <div className="space-y-3">
                  {analysis.deepInsights.riskGroup.map((risk, idx) => (
                    <div key={idx} className="bg-rose-50/20 border border-rose-100 p-3.5 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <strong className="text-rose-955 font-bold">{risk.name}</strong>
                        <span className={`text-[9px] px-2.2 py-0.5 rounded-md font-bold uppercase ${
                          risk.category === 'academic' ? 'bg-blue-100 text-blue-800' : risk.category === 'behavior' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {risk.category === 'academic' ? 'Học thuật' : risk.category === 'behavior' ? 'Hành vi' : 'Cần lưu tâm'}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{risk.reason}</p>
                    </div>
                  ))}
                  {analysis.deepInsights.riskGroup.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">Toàn bộ lớp học duy trì chỉ số phát triển rất ổn định.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Sub section 4: Recommendations */}
            <div className="bg-slate-50 border border-gray-100 p-5 rounded-2xl space-y-4">
              <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-1.5 border-b border-gray-200 pb-2.5">
                <Lightbulb size={18} className="text-indigo-650" />
                <span>Tham vấn kiến nghị giải pháp sư phạm của cố vấn AI</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700 leading-relaxed">
                {/* Short term */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                  <h4 className="font-semibold text-slate-900 text-xs uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    <span>Hành động can thiệp ngắn hạn (Ngay lập tức)</span>
                  </h4>
                  <ul className="space-y-2 list-disc pl-4">
                    {analysis.aiRecommendations.shortTerm.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>

                {/* Long term */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                  <h4 className="font-semibold text-slate-900 text-xs uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>Định hướng chiến lược dài hạn</span>
                  </h4>
                  <ul className="space-y-2 list-disc pl-4">
                    {analysis.aiRecommendations.longTerm.map((lt, i) => (
                      <li key={i}>{lt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sub section 5: Smart Notes Snippet */}
            <div className="bg-white border border-gray-150 p-5 rounded-2xl space-y-4">
              <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
                <FileText size={16} className="text-slate-600" />
                <span>Gợi ý nhận xét nhanh gửi Sổ Liên Lạc Điện Tử</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.smartNotesSnippet.map((note, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3 relative text-xs hover:border-gray-300 transition-all">
                    <div>
                      <strong className="text-gray-900 font-bold block">{note.name}</strong>
                      <p className="text-slate-650 italic leading-relaxed mt-1 bg-white p-2.5 rounded-lg border border-gray-100">
                        "{note.snippet}"
                      </p>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => copyToClipboard(note.snippet, note.studentId)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          copiedId === note.studentId
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {copiedId === note.studentId ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-700" />
                            <span>Đã sao chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Sao chép bản nhận xét</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
