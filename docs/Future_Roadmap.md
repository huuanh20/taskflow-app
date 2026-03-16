# Future Roadmap & Expansion Plan
# TaskFlow — Task Management System

**Version:** 1.0  
**Date:** 2026-03-16

---

## 🗺️ Tổng quan

Tài liệu này mô tả các hướng mở rộng và cải tiến dự án TaskFlow trong tương lai. Mục đích là thể hiện **tầm nhìn dài hạn** — cho nhà tuyển dụng thấy bạn không chỉ code được mà còn biết **tư duy sản phẩm** và **kiến trúc mở rộng**.

---

## Phase 4 — Real-time & Notifications (Tháng 2)

### 4.1 SignalR — Real-time Updates
- Khi ai đó thay đổi status task → **tất cả members trong project thấy ngay** trên Kanban board mà không cần refresh
- Khi có comment mới → hiện **notification badge** real-time
- **Tech:** ASP.NET Core SignalR + React useEffect listener

### 4.2 Email Notifications
- Gửi email khi: được giao task mới, task sắp đến deadline (1 ngày trước), comment mới trên task của mình
- **Tech:** SMTP (SendGrid free tier) + Background Service (Hangfire hoặc `IHostedService`)

### 4.3 In-app Notification Center
- Bell icon 🔔 trên header → dropdown danh sách notifications
- Đánh dấu đã đọc/chưa đọc
- Bảng mới: `Notifications` (userId, message, isRead, createdAt)

---

## Phase 5 — AI Integration 🤖 (Tháng 3)

> **Đây là điểm cộng LỚN** khi phỏng vấn tại TGL Solutions — công ty đang đẩy mạnh AI.

### 5.1 AI Task Summarizer
- Tích hợp **OpenAI API** (hoặc Google Gemini API)
- Nút "✨ AI Summarize" trên mỗi project → AI tự tổng hợp tiến độ dự án từ tất cả tasks
- Prompt: *"Summarize the progress of this project based on the following tasks: [list tasks with status]"*
- **Tech:** HttpClient gọi OpenAI API, cache kết quả 1 giờ

### 5.2 Smart Task Suggestion
- AI gợi ý **tách task lớn thành subtasks**
- User nhập title task → click "✨ Break down" → AI suggest 3-5 subtasks
- **Tech:** OpenAI API + custom prompt engineering

### 5.3 AI Priority Prediction
- Dựa trên title + description, AI tự gợi ý **priority level** cho task
- *"Based on the description 'Fix critical login bug causing 500 error', suggest priority: Critical"*

### 5.4 Natural Language Search
- Thay vì filter thủ công, user gõ: *"Show me all high priority bugs assigned to me that are overdue"*
- AI parse câu hỏi → convert thành query parameters → gọi API
- **Tech:** OpenAI Function Calling hoặc Semantic Kernel (.NET)

---

## Phase 6 — DevOps & Monitoring (Tháng 4)

### 6.1 Logging & Monitoring
- Tích hợp **Serilog** cho structured logging
- Log vào file + console + Seq (free for single user)
- Dashboard monitor: request count, error rate, response time

### 6.2 Health Checks
- Endpoint `/health` kiểm tra: database connection, external services
- **Tech:** ASP.NET Core Health Checks + UI dashboard

### 6.3 Rate Limiting
- Giới hạn request/phút cho mỗi user (chống abuse)
- **Tech:** ASP.NET Core Rate Limiting middleware (built-in .NET 8)

### 6.4 Caching Layer
- Cache danh sách tasks, labels bằng **Redis**
- Cache invalidation khi có write operation
- **Tech:** Redis + `IDistributedCache`

---

## Phase 7 — Advanced Features (Tháng 5)

### 7.1 File Attachments
- Upload file đính kèm vào task (images, documents)
- **Tech:** Azure Blob Storage hoặc MinIO (self-hosted, free)
- Bảng mới: `Attachments` (taskItemId, fileName, fileUrl, fileSize)

### 7.2 Activity Log / Audit Trail
- Ghi lại lịch sử thay đổi: *"Nguyen Van A changed status from 'Todo' to 'In Progress' at 2026-03-16 10:00"*
- Hiển thị timeline trên task detail
- Bảng mới: `ActivityLogs` (entityType, entityId, action, oldValue, newValue, userId, timestamp)

### 7.3 Time Tracking
- Member có thể log thời gian làm task (start/stop timer hoặc nhập manual)
- Report: tổng giờ làm theo project, theo user, theo tuần
- Bảng mới: `TimeLogs` (taskItemId, userId, startTime, endTime, duration)

### 7.4 Recurring Tasks
- Tạo task tự động lặp lại: hàng ngày, hàng tuần, hàng tháng
- **Tech:** Hangfire scheduled jobs

### 7.5 Project Templates
- Tạo template project (preset tasks) → clone nhanh cho project mới
- Ví dụ: template "Sprint Planning" có sẵn các task: Backlog Grooming, Sprint Review, Retrospective

---

## Phase 8 — Mobile & Multi-platform (Tháng 6+)

### 8.1 Progressive Web App (PWA)
- Biến React app thành PWA → cài đặt được trên điện thoại
- Offline mode: xem tasks đã cache, sync khi có mạng
- Push notifications

### 8.2 React Native Mobile App
- App native cho iOS + Android
- Reuse API backend hiện tại
- **Tech:** React Native hoặc .NET MAUI

### 8.3 Desktop App (WPF)
- Ứng dụng Windows desktop bằng WPF + MVVM pattern
- Gọi cùng REST API backend
- **Tech:** WPF + CommunityToolkit.Mvvm
- ⭐ **Bonus phỏng vấn TGL**: JD yêu cầu WPF — có thêm WPF client = điểm cộng rất lớn

---

## Phase 9 — Enterprise Features (Dài hạn)

### 9.1 Multi-tenant / Organization
- Hỗ trợ nhiều tổ chức (organizations) trên cùng hệ thống
- Mỗi org có admin riêng, projects riêng

### 9.2 OAuth & SSO
- Đăng nhập bằng Google, GitHub, Microsoft
- **Tech:** ASP.NET Core Identity + OAuth providers

### 9.3 Webhook Integration
- Khi task thay đổi status → gửi webhook tới Slack, Discord, Teams
- Bảng mới: `Webhooks` (url, events, projectId)

### 9.4 API Versioning
- Hỗ trợ multiple API versions (`/api/v1/`, `/api/v2/`)
- **Tech:** `Asp.Versioning.Http`

### 9.5 GraphQL API
- Thêm GraphQL endpoint song song với REST
- **Tech:** HotChocolate (.NET GraphQL server)

---

## 🎯 Technology Roadmap Summary

```
Phase 4 (Tháng 2):  SignalR, Email, Notifications
Phase 5 (Tháng 3):  🤖 AI Integration (OpenAI/Gemini)
Phase 6 (Tháng 4):  Serilog, Redis, Health Checks
Phase 7 (Tháng 5):  Attachments, Audit Log, Time Tracking
Phase 8 (Tháng 6):  PWA, Mobile, WPF Desktop
Phase 9 (Dài hạn):  Multi-tenant, OAuth, Webhooks, GraphQL
```

---

## 💡 Tips khi phỏng vấn

Khi nhà tuyển dụng hỏi *"Em có kế hoạch gì để mở rộng dự án này không?"*, bạn có thể trả lời:

> *"Em đã lên kế hoạch mở rộng theo nhiều phase. Trước mắt em muốn tích hợp **SignalR** cho real-time updates, sau đó sẽ thêm **AI features** như task summarization sử dụng OpenAI API. Về mặt DevOps, em dự định thêm **Redis caching** và **structured logging với Serilog**. Dài hạn hơn, em muốn xây thêm **WPF desktop client** gọi cùng REST API backend — vì em biết TGL Solutions có nhiều dự án WPF."*

Câu trả lời này cho thấy:
- ✅ Bạn có **tầm nhìn sản phẩm** — không chỉ code xong rồi thôi
- ✅ Bạn biết **công nghệ trending** (AI, real-time)
- ✅ Bạn **hiểu công ty** (đề cập WPF vì JD yêu cầu)
- ✅ Bạn có **kiến thức rộng** về hệ sinh thái .NET
