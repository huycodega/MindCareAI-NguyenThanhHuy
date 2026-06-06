# Weekly Journal

## Week 1 - Gate G1

### Features shipped
- Chốt ý tưởng sản phẩm: Student Wellbeing CBT AI Assistant.
- Xác định bài toán: sinh viên cần kênh hỗ trợ ban đầu khi gặp stress, lo âu, áp lực học tập hoặc cảm xúc tiêu cực.
- Hoàn thiện các tài liệu Gate G1:
  - Brief
  - PRD
  - Wireframe/UI Flow
  - GitHub repo setup
- Xác định luồng chính của sản phẩm:
  - Landing page
  - Login/Register
  - Intake Form
  - Student Chat
  - Safety Gate
  - Crisis View
  - Counselor/Admin Dashboard
- Xác định hướng AI pipeline:
  - Safety Gate
  - CBT Analysis
  - RAG/Resources
  - Prompt Builder
  - LLM Response Generation
  - Post-processing + JSON validation

### AI tools used and how they helped
- ChatGPT: hỗ trợ viết Brief, PRD, UI Flow, README và chuẩn hóa nội dung nộp Gate G1.
- AI coding tools trong starter template: dùng để hỗ trợ ghi log quá trình làm việc sau khi setup repo.

### Hardest problem of the week
- Khó nhất là xác định phạm vi an toàn cho sản phẩm sức khỏe tinh thần.
- Sản phẩm cần hỗ trợ sinh viên nhưng không được chẩn đoán, không tư vấn thuốc và không thay thế chuyên gia.

### How we solved it
- Thêm Safety Gate để phân loại `normal`, `moderate`, `crisis`, `out_of_scope` trước khi AI phản hồi.
- Với trường hợp `crisis`, hệ thống chuyển sang Crisis View và hướng người dùng tới nguồn hỗ trợ thật.
- Với trường hợp `out_of_scope`, hệ thống redirect an toàn, không đưa lời khuyên y tế hoặc chẩn đoán.
- Thêm dashboard cho Counselor/Admin để theo dõi alert và risk distribution.

### What we would do differently
- Chuẩn hóa tài liệu ngay từ đầu theo cấu trúc repo để tránh phải tách lại nhiều file.
- Viết sớm data schema giữa frontend, backend và AI pipeline.
- Tách rõ phần sản phẩm, phần AI/data pipeline và phần safety requirement ngay trong PRD.

### Plan for next week
- Setup skeleton frontend bằng React/Next.js.
- Setup skeleton backend bằng FastAPI.
- Tạo endpoint health check và chat API mẫu.
- Tạo sample JSON output cho AI response gồm `risk_level`, `technique`, `rationale`, `plan`, `response`, `safety_action`.
- Chuẩn bị tài nguyên CBT mẫu và crisis resources để dùng cho RAG.
- Tạo GitHub issues cho frontend, backend, AI training, data/RAG và documentation.
