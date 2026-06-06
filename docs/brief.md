Mục	Nội dung
Tên sản phẩm	Student Wellbeing CBT AI Assistant
Bài toán	Sinh viên cần một kênh hỗ trợ ban đầu khi gặp stress, lo âu, áp lực học tập hoặc cảm xúc tiêu cực, nhưng sản phẩm không được chẩn đoán hay thay thế chuyên gia.
Giải pháp	Web app cho phép sinh viên nhập intake form và trò chuyện với AI. Hệ thống chạy Safety Gate, phân tích cảm xúc/risk, truy xuất tài nguyên CBT và sinh phản hồi hỗ trợ an toàn.
Điểm cập nhật từ pipeline	pipeline dữ liệu hiện tại tập trung vào data/training pipeline cho CBT assistant: tạo master dataset, chuẩn hóa risk/technique, redaction PII, chia train/val/test, xuất JSONL và special test sets.
Người dùng chính	Student: chat và nhận tài nguyên. Counselor/Admin: xem dashboard/alert. AI/Data team: quản lý dữ liệu huấn luyện, đánh giá safety và kỹ thuật CBT.
Công nghệ	FastAPI, React/Next.js, PostgreSQL, Qdrant/vector DB, OpenAI/Claude hoặc Qwen2.5-7B + LoRA, Hugging Face datasets/tokenizers.
Không làm	Không chẩn đoán bệnh; không tư vấn thuốc/liều dùng; không đưa hướng dẫn tự hại; không xử lý khủng hoảng thay cho người thật.

Mục tiêu Gate G1
• Chốt phạm vi sản phẩm và kiến trúc AI/data dựa trên pipeline hiện tại.
• Có PRD rõ chức năng web/app, AI pipeline và tiêu chí nghiệm thu.
• Có Wireframe/UI Flow đủ để người làm frontend/backend triển khai.
• Có GitHub repo setup chuẩn để đưa tài liệu triển khai thành project có cấu trúc.

Thông tin từ pipeline dữ liệu hiện tại	Giá trị / Ghi chú
Nguồn dữ liệu chính	Cactus local CSV, Amod/mental_health_counseling_conversations, CounselChat, MHDialog; EmpatheticDialogues tắt mặc định.
Kích thước sau clean unbalanced	34,675 rows.
Kích thước final master	32,933 rows.
Phân phối final master	normal: 16,003; moderate: 10,634; crisis: 4,294; out_of_scope: 2,002.
Split xuất ra	train: 26,000; val: 3,466; test: 3,467.
Leakage check	train-val, train-test, val-test overlap đều bằng 0.
JSONL validation	Tất cả file JSONL có 0 bad lines.
Lưu ý bảo mật	Token Hugging Face phải đưa vào biến môi trường/Kaggle Secret, không ghi trực tiếp trong repo.
