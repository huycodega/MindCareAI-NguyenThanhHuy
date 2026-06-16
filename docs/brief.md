# Project Brief — Student Wellbeing CBT AI Assistant

## Tổng quan

| Mục | Nội dung |
|---|---|
| **Tên sản phẩm** | Student Wellbeing CBT AI Assistant |
| **Bài toán** | Sinh viên cần một kênh hỗ trợ ban đầu khi gặp stress, lo âu, áp lực học tập hoặc cảm xúc tiêu cực, nhưng sản phẩm không được chẩn đoán hay thay thế chuyên gia. |
| **Giải pháp** | Web app cho phép sinh viên nhập intake form và trò chuyện với AI. Hệ thống chạy Safety Gate, phân tích cảm xúc/risk, truy xuất tài nguyên CBT và sinh phản hồi hỗ trợ an toàn. |
| **Người dùng chính** | **Student**: chat và nhận tài nguyên. **Counselor/Admin**: xem dashboard/alert. **AI/Data team**: quản lý dữ liệu huấn luyện, đánh giá safety và kỹ thuật CBT. |
| **Công nghệ** | FastAPI, React/Next.js, PostgreSQL, Qdrant, Qwen2.5-7B + LoRA (cbt-qwen-7b), Llama-3.1-8B + LoRA (cbt-llama-3.1-8b), Hugging Face. |
| **Không làm** | Không chẩn đoán bệnh · Không tư vấn thuốc/liều dùng · Không đưa hướng dẫn tự hại · Không xử lý khủng hoảng thay cho người thật. |

---

## Mục tiêu Gate G1

- Chốt phạm vi sản phẩm và kiến trúc AI/data dựa trên pipeline hiện tại.
- Có PRD rõ chức năng web/app, AI pipeline và tiêu chí nghiệm thu.
- Có Wireframe/UI Flow đủ để người làm frontend/backend triển khai.
- Có GitHub repo setup chuẩn để đưa tài liệu triển khai thành project có cấu trúc.

---

## Thông tin pipeline dữ liệu

| Mục | Giá trị / Ghi chú |
|---|---|
| **Nguồn dữ liệu chính** | Cactus local CSV, Amod/mental_health_counseling_conversations, CounselChat, MHDialog; EmpatheticDialogues tắt mặc định. |
| **Kích thước sau clean** | 34,675 rows |
| **Kích thước final master** | 32,933 rows |
| **Phân phối final master** | normal: 16,003 · moderate: 10,634 · crisis: 4,294 · out_of_scope: 2,002 |
| **Split xuất ra** | train: 26,000 · val: 3,466 · test: 3,467 |
| **Leakage check** | train-val, train-test, val-test overlap đều bằng 0 |
| **JSONL validation** | Tất cả file JSONL có 0 bad lines |
| **Bảo mật** | Token Hugging Face phải dùng biến môi trường/Secret, không ghi trực tiếp trong repo. |
