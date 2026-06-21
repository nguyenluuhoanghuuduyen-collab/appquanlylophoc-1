import express from "express";
import path from "path";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_STUDENTS } from "./src/mockData";

dotenv.config();

const DB_PATH = path.join(process.cwd(), "students_db.json");

interface ClassData {
  id: string;
  name: string;
  students: any[];
}

interface DBStructure {
  classes: { [id: string]: ClassData };
  activeClassId: string;
}

// Helper to load full database
async function loadFullDB(): Promise<DBStructure> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    
    // Backward compatibility migration check
    if (Array.isArray(parsed)) {
      const migrated: DBStructure = {
        classes: {
          "class-default": {
            id: "class-default",
            name: "Lớp Chủ Nhiệm",
            students: parsed
          }
        },
        activeClassId: "class-default"
      };
      await fs.writeFile(DB_PATH, JSON.stringify(migrated, null, 2), "utf-8");
      return migrated;
    }
    
    if (!parsed.classes || !parsed.activeClassId) {
      throw new Error("Database format invalid");
    }
    return parsed;
  } catch (error: any) {
    const defaultDB: DBStructure = {
      classes: {
        "class-default": {
          id: "class-default",
          name: "Lớp Chủ Nhiệm",
          students: INITIAL_STUDENTS
        }
      },
      activeClassId: "class-default"
    };
    
    if (error.code === "ENOENT" || error.message === "Database format invalid") {
      await fs.writeFile(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
      return defaultDB;
    }
    console.error("Lỗi khi đọc file database:", error);
    return defaultDB;
  }
}

// Helper to save full database
async function saveFullDB(db: DBStructure): Promise<boolean> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Lỗi khi ghi file database:", error);
    return false;
  }
}

// Helper to load students of active class
async function loadStudentsFromDB() {
  const db = await loadFullDB();
  const activeClass = db.classes[db.activeClassId] || Object.values(db.classes)[0];
  return activeClass ? activeClass.students : [];
}

// Helper to save students of active class
async function saveStudentsToDB(students: any) {
  const db = await loadFullDB();
  if (db.classes[db.activeClassId]) {
    db.classes[db.activeClassId].students = students;
  } else {
    db.classes[db.activeClassId] = {
      id: db.activeClassId,
      name: "Lớp Mới",
      students: students
    };
  }
  return await saveFullDB(db);
}

// Simple but robust CSV line parser to handle quotes & commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse CSV text from Google Sheets into structured Student objects
function parseCSV(csvText: string) {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = parseCSVLine(lines[0]);
  const studentsData: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = parseCSVLine(line);
    const studentObj: any = {
      academic: { math: [], literature: [], english: [] },
      attitudeLogs: [],
      peerEvaluations: [],
      selfEvaluations: [],
      teacherNotes: []
    };
    
    headers.forEach((header, colIndex) => {
      const val = row[colIndex] || "";
      const lowerHeader = header.toLowerCase().trim();
      
      if (lowerHeader === "id") {
        studentObj.id = val;
      } else if (lowerHeader === "họ và tên" || lowerHeader === "tên" || lowerHeader === "name" || lowerHeader === "ho va ten") {
        studentObj.name = val;
      } else if (lowerHeader === "giới tính" || lowerHeader === "gioi tinh" || lowerHeader === "gender") {
        studentObj.gender = val === "Nữ" || val === "Nu" || val === "female" || val === "nữ" ? "Nữ" : "Nam";
      } else if (lowerHeader === "ảnh đại diện" || lowerHeader === "ảnh" || lowerHeader === "avatar") {
        studentObj.avatar = val;
      } else if (lowerHeader === "liên hệ phụ huynh" || lowerHeader === "liên hệ" || lowerHeader === "parent contact" || lowerHeader === "lien he") {
        studentObj.parentContact = val;
      } else if (lowerHeader === "điểm mục tiêu" || lowerHeader === "mục tiêu" || lowerHeader === "target grade" || lowerHeader === "target") {
        studentObj.targetGrade = parseFloat(val) || 8.0;
      } else if (lowerHeader === "điểm thái độ" || lowerHeader === "thái độ" || lowerHeader === "attitude score" || lowerHeader === "attitude") {
        studentObj.attitudeScore = parseInt(val) || 100;
      } else if (lowerHeader === "nhận xét" || lowerHeader === "nhận xét giáo viên" || lowerHeader === "teacher note" || lowerHeader === "ghi chú") {
        if (val) {
          studentObj.teacherNotes.push({
            id: "note-sync-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
            date: new Date().toISOString().split('T')[0],
            content: val,
            category: "academic"
          });
        }
      } else {
        // Check academic grades (Toán, Văn, Anh)
        const score = parseFloat(val);
        if (!isNaN(score)) {
          if (lowerHeader.startsWith("toán") || lowerHeader.startsWith("toan") || lowerHeader.startsWith("math")) {
            const examName = header.includes("-") ? header.split("-")[1].trim() : header;
            studentObj.academic.math.push({ name: examName, score });
          } else if (lowerHeader.startsWith("văn") || lowerHeader.startsWith("van") || lowerHeader.startsWith("lit")) {
            const examName = header.includes("-") ? header.split("-")[1].trim() : header;
            studentObj.academic.literature.push({ name: examName, score });
          } else if (lowerHeader.startsWith("anh") || lowerHeader.startsWith("eng")) {
            const examName = header.includes("-") ? header.split("-")[1].trim() : header;
            studentObj.academic.english.push({ name: examName, score });
          }
        }
      }
    });
    
    if (studentObj.name) {
      if (!studentObj.id) {
        studentObj.id = "std-sync-" + Math.random().toString(36).substring(2, 11);
      }
      if (!studentObj.avatar) {
        studentObj.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
      }
      if (!studentObj.parentContact) {
        studentObj.parentContact = "Chưa cấu hình";
      }
      if (!studentObj.attitudeScore) {
        studentObj.attitudeScore = 100;
      }
      studentObj.attitudeLogs.push({
        id: "log-sync-" + Date.now(),
        date: new Date().toISOString().split('T')[0],
        points: studentObj.attitudeScore,
        reason: "Đồng bộ điểm rèn luyện ban đầu từ Google Sheets",
        tag: "Phát biểu"
      });
      
      studentsData.push(studentObj);
    }
  }
  
  return studentsData;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API endpoints for multi-class management
  app.get("/api/classes", async (req, res) => {
    try {
      const db = await loadFullDB();
      const classList = Object.values(db.classes).map(c => ({ id: c.id, name: c.name }));
      res.json({
        classes: classList,
        activeClassId: db.activeClassId
      });
    } catch (error: any) {
      res.status(500).json({ error: "Không thể lấy danh sách lớp học.", message: error.message });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const { id, name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Tên lớp không được để trống." });
      }
      
      const db = await loadFullDB();
      const classId = id || "class-" + Date.now();
      
      const existingClass = db.classes[classId];
      db.classes[classId] = {
        id: classId,
        name: name,
        students: existingClass ? existingClass.students : []
      };
      
      if (!db.activeClassId || !db.classes[db.activeClassId]) {
        db.activeClassId = classId;
      }
      
      await saveFullDB(db);
      res.json({ success: true, classId, name });
    } catch (error: any) {
      res.status(500).json({ error: "Có lỗi khi lưu thông tin lớp.", message: error.message });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const classId = req.params.id;
      const db = await loadFullDB();
      
      if (!db.classes[classId]) {
        return res.status(404).json({ error: "Lớp học không tồn tại." });
      }
      
      if (Object.keys(db.classes).length <= 1) {
        return res.status(400).json({ error: "Không thể xóa lớp học duy nhất còn lại." });
      }
      
      delete db.classes[classId];
      
      if (db.activeClassId === classId) {
        db.activeClassId = Object.keys(db.classes)[0];
      }
      
      await saveFullDB(db);
      res.json({ success: true, activeClassId: db.activeClassId });
    } catch (error: any) {
      res.status(500).json({ error: "Có lỗi khi xóa lớp học.", message: error.message });
    }
  });

  app.post("/api/classes/select", async (req, res) => {
    try {
      const { classId } = req.body;
      const db = await loadFullDB();
      if (!db.classes[classId]) {
        return res.status(404).json({ error: "Lớp học không tồn tại." });
      }
      db.activeClassId = classId;
      await saveFullDB(db);
      res.json({ success: true, activeClassId: classId });
    } catch (error: any) {
      res.status(500).json({ error: "Có lỗi khi chọn lớp học.", message: error.message });
    }
  });

  // API endpoints for online database and Google Sheets sync
  app.get("/api/students", async (req, res) => {
    try {
      const students = await loadStudentsFromDB();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: "Không thể lấy danh sách học sinh.", message: error.message });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const { students } = req.body;
      if (!students || !Array.isArray(students)) {
        return res.status(400).json({ error: "Dữ liệu học sinh không hợp lệ." });
      }
      const success = await saveStudentsToDB(students);
      if (success) {
        res.json({ success: true, message: "Lưu dữ liệu lên online database thành công." });
      } else {
        res.status(500).json({ error: "Không thể ghi dữ liệu lên server." });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Có lỗi khi lưu học sinh.", message: error.message });
    }
  });

  app.post("/api/sync/sheets", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Vui lòng cung cấp link Google Sheets." });
      }
      
      // Extract spreadsheet ID
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const spreadsheetId = match ? match[1] : null;
      if (!spreadsheetId) {
        return res.status(400).json({ error: "Link Google Sheets không hợp lệ. Hãy kiểm tra lại định dạng link." });
      }
      
      // Extract gid
      const gidMatch = url.match(/[#&]gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : null;
      
      let exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      if (gid) {
        exportUrl += `&gid=${gid}`;
      }
      
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(`Google Sheets trả về lỗi: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const students = parseCSV(csvText);
      
      res.json({
        success: true,
        studentsCount: students.length,
        students
      });
    } catch (error: any) {
      console.error("Sheets sync error:", error);
      res.status(500).json({
        error: "Không thể kết nối hoặc đọc dữ liệu từ Google Sheets. Hãy chắc chắn rằng bạn đã chia sẻ link ở chế độ công khai (Bất kỳ ai có liên kết đều có thể xem).",
        message: error.message
      });
    }
  });

  // Shared Gemini client initializer
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("⚠️ Cảnh báo: GEMINI_API_KEY chưa cấu hình trong biến môi trường. Vui lòng thiết lập khóa của bạn thông qua Menu Secrets.");
  }

  // System Instruction string exactly as specified by the user
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

  // API endpoint for analysis
  // API endpoint for analysis with model selection and fallback
  app.post("/api/advisor/analyze", async (req, res) => {
    try {
      const { students, apiKey, model, step } = req.body;
      
      const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;
      if (!effectiveApiKey) {
        return res.status(401).json({
          error: "API_KEY_MISSING",
          message: "GEMINI_API_KEY chưa được cấu hình. Giáo viên vui lòng thiết lập khóa API Gemini trong mục Settings (nút đỏ trên Header)."
        });
      }

      if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ error: "Yêu cầu cung cấp thông tin danh sách học sinh hợp lệ." });
      }

      // Initialize Gemini client dynamically
      const requestAi = new GoogleGenAI({
        apiKey: effectiveApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Convert students list into readable text data to send to Gemini
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
          attitudeLogs: s.attitudeLogs.slice(-6), // Send last 6 logs for brevity
          selfEvaluations: s.selfEvaluations,
          peerEvaluations: s.peerEvaluations,
          teacherNotes: s.teacherNotes
        };
      });

      let prompt = "";
      let responseSchema: any = null;

      if (step === 1) {
        prompt = `
Dưới đây là dữ liệu thô của lớp học thông minh hiện tại:
${JSON.stringify(serializedStudents, null, 2)}

Hãy đóng vai trò là một Chuyên gia EdTech & Trợ lý Sư phạm, nghiên cứu kỹ để lập báo cáo Bước 1:
- Tính toán dashboardSummary (Điểm trung bình học tập cả lớp, sỹ số, trung bình thái độ rèn luyện, tỷ lệ học sinh mũi nhọn, tỷ lệ học sinh cần hỗ trợ).
- Xác định deepInsights bao gồm danh sách học sinh mũi nhọn (shiningStars) và danh sách học sinh cần hỗ trợ (riskGroup) kèm theo lý do cụ thể và phân loại (academic, behavior, hoặc both).

Nội dung phản hồi cần nghiêm ngặt tuân thủ cấu trúc JSON quy định trong schema. Thể hiện sự sâu sắc của một nhà tư vấn sư phạm.
        `;
        responseSchema = {
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
      } else if (step === 2) {
        prompt = `
Dưới đây là dữ liệu thô của lớp học thông minh hiện tại:
${JSON.stringify(serializedStudents, null, 2)}

Hãy đóng vai trò là một Chuyên gia EdTech & Trợ lý Sư phạm, nghiên cứu kỹ để lập báo cáo Bước 2:
- Phân tích biến động, xu hướng và bầu không khí chung của lớp bằng lời văn sư phạm sâu rộng (trendAnalytics).
- Đưa ra các khuyến nghị giải pháp sư phạm (aiRecommendations) bao gồm ngắn hạn (shortTerm) và dài hạn (longTerm).

Nội dung phản hồi cần nghiêm ngặt tuân thủ cấu trúc JSON quy định trong schema.
        `;
        responseSchema = {
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
      } else if (step === 3) {
        prompt = `
Dưới đây là dữ liệu thô của lớp học thông minh hiện tại:
${JSON.stringify(serializedStudents, null, 2)}

Hãy đóng vai trò là một Chuyên gia EdTech & Trợ lý Sư phạm, nghiên cứu kỹ để lập báo cáo Bước 3:
- Tạo danh sách các smartNotesSnippet: Lời nhận xét mẫu súc tích nhưng đầy thấu cảm cho từng học sinh để dán vào sổ liên lạc điện tử gửi phụ huynh.

Nội dung phản hồi cần nghiêm ngặt tuân thủ cấu trúc JSON quy định trong schema.
        `;
        responseSchema = {
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
      } else {
        // Fallback for full analysis (no step parameter)
        prompt = `
Dưới đây là dữ liệu thô của lớp học thông minh hiện tại:
${JSON.stringify(serializedStudents, null, 2)}

Hãy đóng vai trò là một Chuyên gia EdTech & Trợ lý Sư phạm, nghiên cứu kỹ để lập báo cáo tư vấn chất lượng cao bằng tiếng Việt.
Học sinh có điểm trung bình toàn diện là trung bình cộng các môn (Toán, Văn, Anh).
- "Học sinh mũi nhọn": những em có điểm số rất tốt, vượt qua mục tiêu (targetGrade), hoặc có thi đua rất cao, thái độ cực kỳ tích cực.
- "Học sinh cần hỗ trợ" (rủi ro): những em có điểm số thấp hơn mong đợi rõ rệt, hoặc tụt điểm nhanh, hoặc có điểm hành vi/thái độ thi đua thấp (attitudeScore dưới 100), hay nhận xét tiêu cực từ bạn học, hoặc có các tag thi đua cảnh báo (như làm việc riêng, quên bài tập).

Nội dung phản hồi cần nghiêm ngặt tuân thủ cấu trúc JSON quy định trong schema để trực quan hóa ra giao diện. Thể hiện sự sâu sắc của một nhà tư vấn sư phạm trong từng dòng nhận xét và lời khuyên.
        `;
        responseSchema = {
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
            },
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
            },
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
          required: ["dashboardSummary", "deepInsights", "trendAnalytics", "aiRecommendations", "smartNotesSnippet"]
        };
      }

      // Fallback model list
      const fallbackList = ["gemini-3-pro-preview", "gemini-3-flash-preview", "gemini-2.5-flash"];
      const userSelectedModel = model || "gemini-3-pro-preview"; // Default model: gemini-3-pro-preview
      
      const modelsToTry = [userSelectedModel, ...fallbackList.filter(m => m !== userSelectedModel)];
      
      let lastError: any = null;
      let resultText = "";
      let successModelUsed = "";

      for (const currentModel of modelsToTry) {
        try {
          console.log(`[AI Advisor] Attempting generation for step ${step || 'full'} using model: ${currentModel}`);
          const response = await requestAi.models.generateContent({
            model: currentModel,
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema: responseSchema,
              temperature: 0.7
            }
          });

          if (response.text) {
            resultText = response.text;
            successModelUsed = currentModel;
            break;
          }
        } catch (e: any) {
          console.warn(`[AI Advisor] Model ${currentModel} failed for step ${step || 'full'}:`, e.message || e);
          lastError = e;
        }
      }

      if (!resultText) {
        // Return raw literal API error code (e.g. RESOURCE_EXHAUSTED)
        const rawErrorCode = lastError?.status || lastError?.statusText || "RESOURCE_EXHAUSTED";
        return res.status(500).json({
          error: rawErrorCode,
          message: lastError?.message || "Tất cả các model AI đều thất bại."
        });
      }

      const parsedJSON = JSON.parse(resultText.trim());
      parsedJSON.successModelUsed = successModelUsed;
      res.json(parsedJSON);

    } catch (e: any) {
      console.error("Gemini API Error in /api/advisor/analyze:", e);
      res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: e.message || "Đã xảy ra sự cố khi gọi API phân tích." });
    }
  });

  // Setup Vite Dev server or Serve production assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP Server] EdTech Advisor server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
