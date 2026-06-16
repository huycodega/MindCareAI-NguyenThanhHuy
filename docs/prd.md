# PRD — Product Requirements Document

## 1. Mục tiêu sản phẩm

- Tạo web/app hỗ trợ sinh viên chia sẻ cảm xúc và nhận phản hồi CBT-informed ở mức hỗ trợ ban đầu.
- Tích hợp AI pipeline có safety gate trước khi sinh phản hồi: phân loại crisis · out-of-scope · moderate · normal.
- Sử dụng dữ liệu huấn luyện được chuẩn hóa từ pipeline hiện tại để fine-tune và đánh giá LLM.
- Đảm bảo toàn bộ phản hồi không chẩn đoán, không tư vấn thuốc và luôn hướng đến nguồn hỗ trợ thật khi cần.

---

## 2. User Stories

| Role | User story | Kết quả mong muốn |
|---|---|---|
| Student | Tôi muốn nhập tình trạng hiện tại và chat với AI để được hỗ trợ ban đầu. | Nhận phản hồi đồng cảm, kỹ thuật CBT phù hợp và tài nguyên liên quan. |
| Student (crisis) | Tôi đang có dấu hiệu khủng hoảng và cần được hướng tới nguồn trợ giúp thật. | Hệ thống kích hoạt crisis flow, hiển thị hotline/cố vấn, không trả lời lan man. |
| Counselor / Admin | Tôi muốn xem alert và thống kê risk để theo dõi các trường hợp cần quan tâm. | Dashboard hiển thị risk level, alert, xu hướng cảm xúc; dữ liệu nhạy cảm được giới hạn theo quyền. |
| AI / Data member | Tôi muốn kiểm soát dataset, split và test set để đánh giá model công bằng. | Có master dataset, train/val/test JSONL, special test sets và báo cáo phân phối. |

---

## 3. Functional Requirements

| ID | Chức năng | Mô tả | Acceptance criteria |
|---|---|---|---|
| F1 | Auth + phân quyền | Đăng ký/đăng nhập JWT, role student/counselor/admin. | Đăng nhập thành công, route/API chặn đúng quyền. |
| F2 | Intake form | Thu thông tin ban đầu: cảm xúc, stress, giấc ngủ, vấn đề chính, hỗ trợ xã hội. | Backend lưu được structured intake; UI dễ nhập. |
| F3 | Chat AI | Sinh viên gửi tin nhắn, backend lưu session/message và gọi AI pipeline. | Chat trả response ổn định, lưu lịch sử. |
| F4 | Safety Gate | Phân loại normal/moderate/crisis/out_of_scope trước khi phản hồi. | Crisis/out_of_scope không đi vào flow tư vấn thông thường. |
| F5 | CBT Analysis | Phân tích emotion, risk_level, technique, rationale, plan. | Output JSON có đủ key: `risk_level`, `technique`, `rationale`, `plan`, `response`, `safety_action`. |
| F6 | RAG / Resources | Truy xuất CBT knowledge base và case tương tự bằng vector search. | Response có tài nguyên liên quan, không bịa nguồn. |
| F7 | Crisis resources | Hiển thị nguồn hỗ trợ thật khi risk là crisis. | UI có hướng dẫn ngắn gọn, nút liên hệ/nguồn hỗ trợ. |
| F8 | Dashboard | Counselor/Admin xem alert, số lượt chat, risk distribution và tình trạng xử lý. | Dashboard không lộ nội dung chat nhạy cảm nếu không cần. |
| F9 | Data/training pipeline | Chạy tài liệu triển khai để tạo CSV/JSONL phục vụ fine-tune và evaluation. | Tạo đủ cbt_train/val/test.jsonl và special test sets; validation 0 bad lines. |

---

## 4. AI/Data Requirements

| Nhóm yêu cầu | Chi tiết |
|---|---|
| **Schema chuẩn** | `id`, `source`, `language`, `task_type`, `case_context`, `user_message`, `automatic_thought`, `cognitive_patterns`, `emotion`, `risk_level`, `technique`, `rationale`, `plan`, `response`, `safety_action`, quality labels, `content_hash`, `token_count`, `split`. |
| **Risk taxonomy** | `normal` · `moderate` · `crisis` · `out_of_scope` |
| **Safety actions** | `none` · `encourage_support` · `crisis_referral` · `medical_redirect` |
| **CBT techniques** | alternative perspective · reality testing · behavior experiment · decatastrophizing · efficiency evaluation · changing rules to wishes · problem-solving skills training · evidence-based questioning · pros and cons analysis · activity scheduling · self-assertiveness training · thought experiment · crisis_referral · scope_redirect |
| **Safety patterns** | Regex phát hiện crisis: `suicide`, `kill myself`, `want to die`, `self-harm`, `overdose`. OOS: `diagnose me`, `medication`, `dosage`. |
| **Preprocessing** | Clean text · English filter · PII redaction (email/URL/phone/name) · normalize technique/emotion/risk · filter token length ≤ 4096. |
| **Training split** | Split trước oversampling để tránh leakage; train được balance theo risk; val/test giữ phân phối tự nhiên. |
| **Special evaluation** | `cbt_crisis_test.jsonl` (crisis safety) · `cbt_oos_test.jsonl` (OOS redirect) · `cbt_technique_gold_test.jsonl` (CBT technique accuracy). |

---

## 5. Non-Functional Requirements

- **Safety-first**: crisis và out-of-scope luôn được xử lý trước response generation.
- **Privacy-first**: PII phải được scrub/redact trước khi đưa vào pipeline AI hoặc dataset training.
- **Reliability**: nếu AI service/Qdrant lỗi, UI phải có fallback response an toàn.
- **Observability**: log lỗi API, thời gian phản hồi, tỷ lệ crisis/OOS và lỗi JSON output.
- **Deploy online**: frontend có URL public, backend có API URL, database/vector DB dùng môi trường cloud hoặc server deploy.

---

## 6. Definition of Done — Gate G1

1. Brief đã chốt đúng bài toán và phạm vi không chẩn đoán.
2. PRD có chức năng, AI/data requirements và acceptance criteria.
3. Wireframe/UI Flow mô tả đủ student flow, crisis flow, dashboard flow.
4. GitHub repo có cấu trúc rõ ràng cho frontend, backend, ai_training, data, docs.
5. Tài liệu và dữ liệu huấn luyện đặt đúng thư mục, không chứa token hoặc secrets ghi trực tiếp khi commit.
