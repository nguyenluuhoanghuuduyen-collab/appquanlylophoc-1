export interface AttitudeLog {
  id: string;
  date: string;
  points: number; // e.g., +5, -2
  reason: string;
  tag: string; // e.g., "Phát biểu", "Làm việc riêng", "Giúp đỡ bạn", "Không làm bài tập"
}

export interface PeerEvaluation {
  evaluator: string;
  strengths: string;
  weaknesses: string;
  rating: number; // 1-5
  date: string;
}

export interface SelfEvaluation {
  reflection: string;
  goalRating: number; // 30 - 100
  strengths: string;
  date: string;
}

export interface TeacherNote {
  id: string;
  date: string;
  content: string;
  category: 'academic' | 'behavior' | 'social' | 'health';
}

export interface Student {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  avatar: string;
  parentContact: string;
  targetGrade: number; // e.g. 8.5
  academic: {
    math: { name: string; score: number }[];
    literature: { name: string; score: number }[];
    english: { name: string; score: number }[];
  };
  attitudeScore: number;
  attitudeLogs: AttitudeLog[];
  peerEvaluations: PeerEvaluation[];
  selfEvaluations: SelfEvaluation[];
  teacherNotes: TeacherNote[];
}

export interface AIAnalysisResult {
  dashboardSummary: {
    averageGrade: number;
    totalStudents: number;
    averageAttitude: number;
    excellenceRatio: number; // percent
    supportNeededRatio: number; // percent
  };
  deepInsights: {
    shiningStars: {
      studentId: string;
      name: string;
      achievement: string;
    }[];
    riskGroup: {
      studentId: string;
      name: string;
      reason: string;
      category: 'academic' | 'behavior' | 'both';
    }[];
  };
  trendAnalytics: string;
  aiRecommendations: {
    shortTerm: string[];
    longTerm: string[];
  };
  smartNotesSnippet: {
    studentId: string;
    name: string;
    snippet: string;
  }[];
}
