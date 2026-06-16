# Worklog

## Gate G1 - Initial Team Worklog

### Product direction
- Chọn đề tài: Student Wellbeing CBT AI Assistant.
- Mục tiêu: xây dựng web/app hỗ trợ sinh viên chia sẻ cảm xúc và nhận phản hồi CBT-informed ở mức hỗ trợ ban đầu.
- Sản phẩm không chẩn đoán bệnh, không tư vấn thuốc/liều dùng và không thay thế chuyên gia.
- Khi phát hiện nguy cơ cao, hệ thống phải chuyển sang crisis flow và hướng người dùng tới nguồn hỗ trợ thật.

### Initial technical decisions

#### 1. Frontend
- Sử dụng React/Next.js cho giao diện web.
- Các màn hình chính gồm:
  - Landing page
  - Login/Register
  - Intake Form
  - Student Chat
  - Crisis View
  - Resources
  - Counselor/Admin Dashboard
- UI cần hiển thị được risk badge, CBT technique, plan ngắn và related resources.

#### 2. Backend
- Sử dụng FastAPI cho API backend.
- Backend phụ trách:
  - Auth và phân quyền student/counselor/admin
  - Lưu intake form
  - Lưu session/message
  - Gọi AI pipeline
  - Trả kết quả về frontend theo JSON schema thống nhất
- Cần có endpoint health check để kiểm tra server chạy ổn định.

#### 3. Database
- Sử dụng PostgreSQL để lưu user, role, intake form, chat session, message và alert.
- Dữ liệu nhạy cảm cần được hạn chế truy cập theo role.
- Không commit database password hoặc file `.env` thật lên GitHub.

#### 4. AI pipeline
- Thiết kế AI pipeline theo hướng safety-first.
- Luồng xử lý chính:
  - User message / intake
  - Safety Gate
  - CBT Analysis
  - Qdrant Retrieval
  - Prompt Builder
  - LLM Response Generation
  - Post-processing + JSON validation
- Output AI cần có các field:
  - `risk_level`
  - `technique`
  - `rationale`
  - `plan`
  - `response`
  - `safety_action`

#### 5. Safety Gate
- Risk taxonomy ban đầu:
  - `normal`
  - `moderate`
  - `crisis`
  - `out_of_scope`
- Crisis hoặc out_of_scope không đi vào flow tư vấn thông thường.
- Crisis cần hiển thị crisis resources và tạo alert cho counselor/admin.
- Out of scope cần redirect an toàn, đặc biệt với yêu cầu chẩn đoán, thuốc hoặc nội dung không phù hợp.

#### 6. RAG / Vector Database
- Sử dụng Qdrant/vector DB để truy xuất CBT resources và case tương tự.
- Dữ liệu RAG dự kiến gồm:
  - CBT knowledge base
  - Crisis resources
  - Sample counseling cases
  - Technique cards
- Response không được bịa nguồn, cần ưu tiên tài nguyên đã được chuẩn hóa.

#### 7. Data / Training
- Dữ liệu huấn luyện dự kiến đặt trong `ai_training/training_data`.
- Pipeline dữ liệu cần hỗ trợ:
  - Clean text
  - PII redaction
  - Normalize risk/technique/emotion
  - Train/val/test split
  - JSONL validation
- Token Hugging Face, OpenAI key và các secret phải dùng biến môi trường, không ghi trực tiếp trong repo.

### Task assignments

#### Frontend member
- Tạo skeleton React/Next.js.
- Xây landing page, intake form, chat UI, crisis view và dashboard UI.
- Kết nối thử với API backend mẫu.

#### Backend member
- Tạo skeleton FastAPI.
- Tạo endpoint health check.
- Thiết kế API cho auth, intake, chat, dashboard.
- Thiết kế database schema ban đầu.

#### AI/Data member
- Thiết kế Safety Gate.
- Chuẩn hóa output JSON của AI.
- Chuẩn bị sample CBT resources và crisis resources.
- Thiết kế pipeline dữ liệu cho JSONL training/evaluation.

#### Documentation
- Cập nhật README.md.
- Cập nhật docs/brief.md.
- Cập nhật docs/prd.md.
- Cập nhật docs/wireframe-ui-flow.md.
- Cập nhật JOURNAL.md và WORKLOG.md trước khi commit.

### Open questions
- Có cần đăng nhập đầy đủ ở prototype đầu tiên không, hay chỉ cần mock role?
- Crisis resources sẽ dùng nguồn nào theo khu vực?
- RAG sẽ dùng dữ liệu CBT tự tạo hay tài liệu public được kiểm duyệt?
- AI model giai đoạn đầu dùng API provider hay chạy Qwen2.5-7B + LoRA?
- Dashboard của counselor/admin có xem nội dung chat đầy đủ hay chỉ xem summary và alert?

### Next actions
- Commit tài liệu Gate G1 vào repo `C2-App-109`.
- Tạo issues cho frontend, backend, AI/data và documentation.
- Tạo branch hoặc giữ main tùy yêu cầu của team.
- Sau khi đủ file, nộp link GitHub repo cho Gate G1.
