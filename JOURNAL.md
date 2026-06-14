# Weekly Journal

## Timeline

- **Tuần 1** – Xác định ý tưởng, thiết kế sản phẩm, hoàn thiện Gate G1 → _Output: Brief, PRD, Wireframe, repo setup_
- **Tuần 2** – Train và đánh giá model (base, finetune, finetune+RAG, finetune+Agent) → _Output: bảng so sánh eval metrics, chọn model tốt nhất_
- **Tuần 3** – Xây dựng hệ thống, tích hợp AI pipeline vào backend → _Output: backend API + AI pipeline hoạt động end-to-end_
- **Tuần 4** – Hoàn thiện frontend, kết nối full stack (frontend ↔ backend ↔ AI) → _Output: app chạy được toàn bộ luồng chính_
- **Tuần 5** – Testing, CI/CD, deploy lên cloud → _Output: live URL, test coverage report_
- **Tuần 6** – Chuẩn bị Demo Day, hoàn thiện 10 deliverables → _Output: video demo, pitch deck, evaluation evidence_

---

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

---

## Week 2 - Model Training & Evaluation

### Features shipped

- Fine-tune **cbt-llama-3.1-8b** (`Huysun29/cbt-llama-3.1-8b`): Llama-3.1-8B-Instruct + LoRA adapter cho CBT response generation, deploy trên Modal (H100).
- Fine-tune **cbt-qwen-7b** (`Huysun29/cbt-qwen-7b`): QWen2.5-7B-Instruct + LoRA adapter cho safety/crisis gate, deploy trên Modal (H100).
- Đánh giá 4 phương án: base model, finetune, finetune+RAG, finetune+Agent → chọn finetune+RAG làm kiến trúc production.
- Xây dựng hybrid RAG pipeline:
  - Dense retrieval: `BAAI/bge-m3` (1024-dim, multilingual, max 8192 tokens).
  - Sparse retrieval: BM25 (`rank-bm25==0.2.2`).
  - Fusion: RRF (Reciprocal Rank Fusion, k=60).
  - Reranker: `BAAI/bge-reranker-v2-m3` cross-encoder, top-5 sau rerank.
- Xây dựng Qdrant vector store với 3 collections:
  - `cbt_knowledge`: 2,824 điểm (CBT knowledge base).
  - `cbt_examples`: 19,537 điểm (CBT dialogue examples).
  - `session_memory`: lưu context hội thoại theo session.
- Notebook `rag-data-fixed.ipynb` chạy trên Kaggle → xuất `cbt_rag_final.zip` (Qdrant storage + BM25 pickles).

### AI tools used and how they helped

- Claude Code: hỗ trợ review kiến trúc hybrid RAG, debug RRF fusion logic, và viết retrieval pipeline.
- HuggingFace Hub: lưu trữ và version hai model fine-tuned.
- Modal: chạy training inference trên GPU cloud (H100), không cần local GPU.

### Hardest problem of the week

- Model QWen-7B sau fine-tune không output JSON đúng format yêu cầu (`{"level":"L0-3",...}`), mà trả về dạng `{"assessment":"...","next_steps":"..."}` khác hoàn toàn.

### How we solved it

- Thêm 3-tier parsing trong `safety_service.py`: (1) parse JSON format gốc, (2) parse format thực tế của model rồi infer level từ text, (3) keyword scan fallback — đảm bảo luôn có output dù model trả về bất kỳ format nào.

### What we would do differently

- Chuẩn hóa output format trong prompt training ngay từ đầu thay vì xử lý post-hoc.
- Chạy eval trên validation set trước khi push model lên HuggingFace Hub.

### Plan for next week

- Xây dựng FastAPI backend hoàn chỉnh với auth, chat API, admin API.
- Tích hợp safety gate và LLM client vào pipeline.
- Setup PostgreSQL, Redis, MinIO, Qdrant trong Docker Compose.
- Viết HITL (Human-in-the-Loop) flow cho clinician review.

---

---

## Week 3 - Backend & AI Pipeline Integration

### Features shipped

- Gmail self-registration + OTP verification (SHA-256 hash, Redis TTL, 5-attempt limit).
- Multi-turn conversation threads (tasktab) with sidebar UI.
- Per-user durable memory (recurring themes, techniques used).
- Risk-aware 3-store RAG retrieval (bge-m3 1024-dim, sigmoid reranker, gate threshold 0.65).
- ReAct agent orchestrator (6 tools: retrieve, recall, analyze, generate, clarify, escalate).
- Modal A100-80GB deployment for 3 services (cbt-llm, cbt-safety, cbt-agent).
- All 3 services use `Huysun29/cbt-qwen2.5-7b-v2` (best model from M4 eval).
- Realtime AI log push to Phoenix dashboard.

### AI tools used and how they helped

- Claude Code: full system architecture, backend services, agent loop, Modal services, end-to-end testing.
- Hooks auto-log every interaction to `phoenix.note.transformerlabs.ai` in real-time.

### Hardest problem of the week

- Risk-aware RAG router: matching eval pipeline exactly (AST diff confirmed 100% match).
- Qdrant version mismatch between data build env (1.12+) and backend (1.12.0).

### How we solved it

- Upgraded `qdrant-client` from 1.12.0 to 1.18.0 to handle `strict_mode_config`/`metadata` null fields.
- Fixed `QDRANT_LOCAL_PATH` env var to point to correct local path instead of Docker container path.

### What we would do differently

- Set `MOCK_LLM=false` earlier to catch Modal cold start issues sooner.
- Copy `.env` to `backend/.env` from the start (pydantic-settings reads from CWD).

### Plan for next week

- Clinician copilot (SOAP auto-generation).
- Fine-tune evaluation on real user sessions.
- Add Vietnamese language support.