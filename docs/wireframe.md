Wireframe / UI Flow
3.1. Screen list
Màn hình	Người dùng	Mục đích
Landing page	Guest	Giới thiệu sản phẩm, giới hạn an toàn, nút đăng nhập/đăng ký.
Login/Register	Student/Counselor/Admin	Xác thực và phân quyền.
Intake Form	Student	Thu thông tin đầu vào trước buổi chat đầu tiên.
Student Chat	Student	Chat với AI, hiển thị phản hồi, emotion, risk, technique và resources.
Crisis View	Student	Hiển thị hướng dẫn an toàn và nguồn trợ giúp thật khi route = crisis.
Resources	Student	Xem tài nguyên CBT/tự chăm sóc theo chủ đề.
Dashboard	Counselor/Admin	Xem thống kê, alert, trạng thái xử lý.
Data/AI Console	AI/Data member hoặc Admin	Theo dõi dataset files, phân phối risk, trạng thái training/evaluation.

3.2. UI wireframe dạng text
[Student Chat Page]
--------------------------------------------------------------------------------
Sidebar Main Chat Area Right Panel
- New chat - AI safety notice - Emotion
- Chat history - User message bubbles - Risk level
- Resources shortcut - Assistant response - CBT technique
- Profile - Input box + Send - Related resources
- Crisis banner if needed - Ask for help button
--------------------------------------------------------------------------------
[Admin/Counselor Dashboard]
--------------------------------------------------------------------------------
Top cards: Total users | Chat sessions | Moderate risk | Crisis alerts
Charts: Risk distribution | Emotion trend | Technique usage
Tables: Alert queue | Recent sessions | Resources status
Actions: Review alert | Mark resolved | Update resource | Export report
--------------------------------------------------------------------------------
3.3. Product UI Flow
Guest
-> Landing page
-> Login/Register
-> Student Home
-> Intake Form
-> Chat UI
-> Backend receives message
-> Safety Gate
-> CRISIS: Crisis Resources + Alert + Stop normal CBT response
-> OUT_OF_SCOPE: Safe redirect, no diagnosis/medication advice
-> PROCEED: Psychological Analysis
-> Qdrant Retrieval / CBT Resources
-> Prompt Builder
-> LLM Response Generation
-> Post-processing + JSON validation
-> Display UI: response + emotion + risk + technique + resources
3.4. Mapping UI với output JSON từ AI
AI output field	Hiển thị trên UI	Ghi chú
risk_level	Badge risk: normal/moderate/crisis/out_of_scope	Crisis đổi sang Crisis View.
technique	Thẻ kỹ thuật CBT gợi ý	Ví dụ: reality testing, decatastrophizing.
rationale	Ẩn mặc định hoặc hiển thị cho counselor	Không nên hiển thị quá kỹ với student.
plan	Danh sách bước hành động ngắn	Tối đa 3-5 bước, dễ làm.
response	Tin nhắn chính của AI	Ngôn ngữ đồng cảm, không chẩn đoán.
safety_action	Action banner hoặc routing	crisis_referral/medical_redirect cần UI riêng.
