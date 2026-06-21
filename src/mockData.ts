import { Student } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-1",
    name: "Nguyễn Minh Anh",
    gender: "Nữ",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    parentContact: "Chị Hạnh - 0987.654.321",
    targetGrade: 9.0,
    academic: {
      math: [
        { name: "KT 15 phút", score: 9.0 },
        { name: "KT 1 tiết", score: 9.5 },
        { name: "Học kỳ 1", score: 9.2 }
      ],
      literature: [
        { name: "KT 15 phút", score: 8.5 },
        { name: "KT 1 tiết", score: 8.8 },
        { name: "Học kỳ 1", score: 8.5 }
      ],
      english: [
        { name: "KT 15 phút", score: 9.5 },
        { name: "KT 1 tiết", score: 9.8 },
        { name: "Học kỳ 1", score: 9.6 }
      ]
    },
    attitudeScore: 125,
    attitudeLogs: [
      { id: "log-1-1", date: "2026-06-05", points: 5, reason: "Hăng hái phát biểu xây dựng bài mới mẫu mực", tag: "Phát biểu" },
      { id: "log-1-2", date: "2026-06-08", points: 5, reason: "Phát biểu chính xác câu hỏi khó trong giờ Toán", tag: "Phát biểu" },
      { id: "log-1-3", date: "2026-06-12", points: 10, reason: "Đạt điểm 10 kiểm tra nói Tiếng Anh xuất sắc", tag: "Thành tích" },
      { id: "log-1-4", date: "2026-06-15", points: 5, reason: "Hỗ trợ giảng bài cho bạn học yếu cùng bàn", tag: "Giúp đỡ bạn" }
    ],
    peerEvaluations: [
      { evaluator: "Phạm Thùy Chi", strengths: "Rất thân thiện, học giỏi đều các môn và hay chỉ bài cho các bạn.", weaknesses: "Đôi khi hơi cầu toàn quá nên làm việc nhóm mất nhiều thời gian.", rating: 5, date: "2026-06-10" }
    ],
    selfEvaluations: [
      { reflection: "Em tự thấy mình đã có cố gắng rất nhiều học kỳ này, đặc biệt ở môn Tiếng Anh và Toán. Em mong muốn đạt học lực xuất sắc.", goalRating: 95, strengths: "Tự tin, chủ động tự học ở nhà.", date: "2026-06-12" }
    ],
    teacherNotes: [
      { id: "note-1-1", date: "2026-06-12", content: "Học sinh gương mẫu, năng nổ đi đầu trong mọi hoạt động học tập của lớp.", category: "academic" }
    ]
  },
  {
    id: "std-2",
    name: "Trần Hoàng Nam",
    gender: "Nam",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    parentContact: "Anh Tuấn - 0912.345.678",
    targetGrade: 7.5,
    academic: {
      math: [
        { name: "KT 15 phút", score: 7.0 },
        { name: "KT 1 tiết", score: 6.0 },
        { name: "Học kỳ 1", score: 5.5 }
      ],
      literature: [
        { name: "KT 15 phút", score: 6.5 },
        { name: "KT 1 tiết", score: 5.5 },
        { name: "Học kỳ 1", score: 5.0 }
      ],
      english: [
        { name: "KT 15 phút", score: 6.0 },
        { name: "KT 1 tiết", score: 5.0 },
        { name: "Học kỳ 1", score: 4.5 }
      ]
    },
    attitudeScore: 85,
    attitudeLogs: [
      { id: "log-2-1", date: "2026-06-02", points: -2, reason: "Quên làm bài tập về nhà môn Toán", tag: "Thiên vị/Không làm BT" },
      { id: "log-2-2", date: "2026-06-05", points: -3, reason: "Làm việc riêng, dùng điện thoại trong giờ Văn", tag: "Làm việc riêng" },
      { id: "log-2-3", date: "2026-06-10", points: -5, reason: "Quên sách vở và không làm bài tập ở nhà môn Anh", tag: "Thiên vị/Không làm BT" },
      { id: "log-2-4", date: "2026-06-14", points: 5, reason: "Có cố gắng lau bảng sạch sẽ và trực nhật đúng giờ", tag: "Trực nhật" }
    ],
    peerEvaluations: [
      { evaluator: "Lê Quốc Khánh", strengths: "Bạn Nam đá bóng hay, nhiệt tình khi tham gia trò chơi thể thao.", weaknesses: "Trong lớp hay ngủ gật và không tập trung khi làm nhóm cùng.", rating: 3, date: "2026-06-11" }
    ],
    selfEvaluations: [
      { reflection: "Học kỳ này em thấy mình học hơi đuối và mất gốc môn Tiếng Anh. Em cũng lười làm bài tập ở nhà.", goalRating: 50, strengths: "Thích thể thao, văn nghệ.", date: "2026-06-13" }
    ],
    teacherNotes: [
      { id: "note-2-1", date: "2026-06-06", content: "Cần gặp riêng trao đổi với phụ huynh về tình trạng lực học giảm sút và thiếu tập trung.", category: "behavior" }
    ]
  },
  {
    id: "std-3",
    name: "Phạm Thùy Chi",
    gender: "Nữ",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    parentContact: "Cô Hoa - 0904.567.890",
    targetGrade: 8.5,
    academic: {
      math: [
        { name: "KT 15 phút", score: 8.0 },
        { name: "KT 1 tiết", score: 8.5 },
        { name: "Học kỳ 1", score: 8.0 }
      ],
      literature: [
        { name: "KT 15 phút", score: 8.5 },
        { name: "KT 1 tiết", score: 8.0 },
        { name: "Học kỳ 1", score: 8.5 }
      ],
      english: [
        { name: "KT 15 phút", score: 9.0 },
        { name: "KT 1 tiết", score: 9.0 },
        { name: "Học kỳ 1", score: 9.5 }
      ]
    },
    attitudeScore: 110,
    attitudeLogs: [
      { id: "log-3-1", date: "2026-06-04", points: 5, reason: "Phát biểu ý kiến hay trong giờ rèn luyện Văn học", tag: "Phát biểu" },
      { id: "log-3-2", date: "2026-06-09", points: 5, reason: "Hỗ trợ văn nghệ chuẩn bị cho sự kiện của trường", tag: "Phong trào" },
      { id: "log-3-3", date: "2026-06-16", points: -2, reason: "Đi học muộn 10 phút do tắc đường", tag: "Đi muộn" }
    ],
    peerEvaluations: [
      { evaluator: "Nguyễn Minh Anh", strengths: "Viết chữ rất đẹp, cẩn thận, làm bài tập đầy đủ.", weaknesses: "Hơi nhút nhát trước đám đông khi thuyết trình.", rating: 4, date: "2026-06-12" }
    ],
    selfEvaluations: [
      { reflection: "Em hài lòng với kết quả môn Văn và Anh, nhưng muốn cải thiện thêm tốc độ làm bài môn Toán của mình.", goalRating: 85, strengths: "Tỉ mỉ, làm bài tập đầy đủ.", date: "2026-06-14" }
    ],
    teacherNotes: [
      { id: "note-3-1", date: "2026-06-10", content: "Học sinh chăm ngoan, giữ vở sạch chữ đẹp, có ý thức tự giác cao.", category: "academic" }
    ]
  },
  {
    id: "std-4",
    name: "Lê Quốc Khánh",
    gender: "Nam",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    parentContact: "Chú Hùng - 0936.888.999",
    targetGrade: 8.0,
    academic: {
      math: [
        { name: "KT 15 phút", score: 8.5 },
        { name: "KT 1 tiết", score: 8.0 },
        { name: "Học kỳ 1", score: 8.5 }
      ],
      literature: [
        { name: "KT 15 phút", score: 6.5 },
        { name: "KT 1 tiết", score: 7.0 },
        { name: "Học kỳ 1", score: 6.8 }
      ],
      english: [
        { name: "KT 15 phút", score: 8.0 },
        { name: "KT 1 tiết", score: 7.5 },
        { name: "Học kỳ 1", score: 7.0 }
      ]
    },
    attitudeScore: 98,
    attitudeLogs: [
      { id: "log-4-1", date: "2026-06-03", points: 5, reason: "Phát biểu xuất sắc thuật toán đố vui giờ Toán", tag: "Phát biểu" },
      { id: "log-4-2", date: "2026-06-07", points: -3, reason: "Nói chuyện riêng gây mất trật tự trong giờ Văn", tag: "Làm việc riêng" },
      { id: "log-4-3", date: "2026-06-11", points: -2, reason: "Đùa giỡn trong giờ ra chơi làm ngã xô nước lau lớp", tag: "Kỷ luật" },
      { id: "log-4-4", date: "2026-06-15", points: 5, reason: "Nhiệt tình dọn dẹp vệ sinh phòng LAB sau giờ thực hành", tag: "Trực nhật" }
    ],
    peerEvaluations: [
      { evaluator: "Trần Hoàng Nam", strengths: "Khoẻ mạnh, hài hước, rất giỏi kỹ thuật và công nghệ thông tin.", weaknesses: "Hay nghịch ngợm chọc ghẹo bạn bè xung quanh.", rating: 4, date: "2026-06-12" }
    ],
    selfEvaluations: [
      { reflection: "Em thấy mình có tư duy tốt ở các môn tự nhiên nhưng lười học thuộc ở môn Văn cổ điển.", goalRating: 75, strengths: "Sáng tạo, tiếp thu bài nhanh.", date: "2026-06-15" }
    ],
    teacherNotes: [
      { id: "note-4-1", date: "2026-06-07", content: "Cần nhắc nhở em Khánh về vấn đề giữ gìn kỷ luật chung để tránh ảnh hưởng đến các em khác.", category: "behavior" }
    ]
  },
  {
    id: "std-5",
    name: "Đỗ Minh Thư",
    gender: "Nữ",
    avatar: "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?w=150",
    parentContact: "Cô Lan - 0914.999.000",
    targetGrade: 8.5,
    academic: {
      math: [
        { name: "KT 15 phút", score: 9.0 },
        { name: "KT 1 tiết", score: 7.5 },
        { name: "Học kỳ 1", score: 7.0 }
      ],
      literature: [
        { name: "KT 15 phút", score: 8.0 },
        { name: "KT 1 tiết", score: 8.2 },
        { name: "Học kỳ 1", score: 8.5 }
      ],
      english: [
        { name: "KT 15 phút", score: 8.5 },
        { name: "KT 1 tiết", score: 8.0 },
        { name: "Học kỳ 1", score: 8.2 }
      ]
    },
    attitudeScore: 105,
    attitudeLogs: [
      { id: "log-5-1", date: "2026-06-01", points: 5, reason: "Tích cực tổ chức hoạt động học nhóm ôn bài thi", tag: "Giúp đỡ bạn" },
      { id: "log-5-2", date: "2026-06-08", points: 5, reason: "Phát biểu hay phản biện luận điểm Văn học lớp", tag: "Phát biểu" },
      { id: "log-5-3", date: "2026-06-13", points: -3, reason: "Không thuộc bài cũ phần đại số lớp 9", tag: "Thiên vị/Không làm BT" }
    ],
    peerEvaluations: [
      { evaluator: "Nguyễn Minh Anh", strengths: "Ưu thế ngôn ngữ, thuyết trình trôi chảy cuốn hút.", weaknesses: "Tính khí hơi nóng nảy khi có các bất đồng ý kiến nội bộ.", rating: 4, date: "2026-06-14" }
    ],
    selfEvaluations: [
      { reflection: "Em đã có tiến bộ về sự tự tin, tuy nhiên điểm số môn Toán gần đây bị tụt đi trông thấy. Em cảm thấy áp lực lớn.", goalRating: 80, strengths: "Khả năng thuyết trình, quản lý nhóm tốt.", date: "2026-06-16" }
    ],
    teacherNotes: [
      { id: "note-5-1", date: "2026-06-14", content: "Biểu hiện mệt mỏi stress, điểm toán sa sút. GV nên định hướng chia sẻ giải tỏa áp lực học kỳ.", category: "health" }
    ]
  },
  {
    id: "std-6",
    name: "Nguyễn Đức Huy",
    gender: "Nam",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
    parentContact: "Chú Chiến - 0988.112.233",
    targetGrade: 8.0,
    academic: {
      math: [
        { name: "KT 15 phút", score: 9.5 },
        { name: "KT 1 tiết", score: 9.0 },
        { name: "Học kỳ 1", score: 9.5 }
      ],
      literature: [
        { name: "KT 15 phút", score: 5.5 },
        { name: "KT 1 tiết", score: 6.0 },
        { name: "Học kỳ 1", score: 5.5 }
      ],
      english: [
        { name: "KT 15 phút", score: 7.0 },
        { name: "KT 1 tiết", score: 6.5 },
        { name: "Học kỳ 1", score: 6.8 }
      ]
    },
    attitudeScore: 102,
    attitudeLogs: [
      { id: "log-6-1", date: "2026-06-03", points: 5, reason: "Phát hiện lỗi sai trong đề Toán của thầy cô giáo", tag: "Thành tích" },
      { id: "log-6-2", date: "2026-06-06", points: -3, reason: "Quên mang sách Văn hai hôm liên tiếp", tag: "Kỷ luật" },
      { id: "log-6-3", date: "2026-06-10", points: 5, reason: "Đại diện lớp đi thi Olimpic Toán thành phố vòng loại", tag: "Phong trào" }
    ],
    peerEvaluations: [
      { evaluator: "Lê Quốc Khánh", strengths: "Học rất giỏi Toán đại số, ít nói nhưng tư duy siêu đẳng.", weaknesses: "Khô khan, ít tham gia hoạt động hội thoại trò chuyện chung của tổ.", rating: 4, date: "2026-06-11" }
    ],
    selfEvaluations: [
      { reflection: "Em tự thấy học Toán thoải mái nhất. Đối với Văn và Anh em gặp khó khăn lớn khi ghi nhớ từ vựng cũng như cảm xúc tác phẩm.", goalRating: 80, strengths: "Tư duy logic cao, tập trung sâu tốt.", date: "2026-06-15" }
    ],
    teacherNotes: [
      { id: "note-6-1", date: "2026-06-10", content: "Cần kèm cặp thêm lực học môn Ngữ Văn để em phát triển cân đối, đạt danh hiệu học sinh Giỏi.", category: "academic" }
    ]
  }
];

export const ATTITUDE_TAGS = [
  { label: "Phát biểu", points: 5, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Trực nhật", points: 5, color: "bg-teal-50 text-teal-700 border-teal-200" },
  { label: "Giúp đỡ bạn", points: 5, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Thành tích", points: 10, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Phong trào", points: 5, color: "bg-purple-50 text-purple-700 border-purple-200" },
  { label: "Làm việc riêng", points: -3, color: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "Thiên vị/Không làm BT", points: -5, color: "bg-red-50 text-red-700 border-red-200" },
  { label: "Đi muộn", points: -2, color: "bg-orange-50 text-orange-700 border-orange-200" },
  { label: "Kỷ luật", points: -3, color: "bg-yellow-50 text-yellow-700 border-yellow-200" }
];
