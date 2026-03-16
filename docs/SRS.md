# Software Requirements Specification (SRS)
# TaskFlow — Task Management System

**Version:** 1.0  
**Author:** [Tên của bạn]  
**Date:** 2026-03-16  
**Status:** Draft  
**Standard:** Dựa theo IEEE 830-1998 (Recommended Practice for SRS)

---

## Mục lục (Table of Contents)

1. [Giới thiệu (Introduction)](#1-giới-thiệu-introduction)
2. [Mô tả tổng quan hệ thống (Overall Description)](#2-mô-tả-tổng-quan-hệ-thống-system-overview)
3. [Yêu cầu chức năng (Functional Requirements)](#3-yêu-cầu-chức-năng-functional-requirements)
4. [Yêu cầu phi chức năng (Non-Functional Requirements)](#4-yêu-cầu-phi-chức-năng-non-functional-requirements)
5. [Ràng buộc (Constraints)](#5-ràng-buộc-constraints)
6. [Giả định (Assumptions)](#6-giả-định-assumptions)
7. [Phụ lục (Appendix)](#7-phụ-lục-appendix)

---

## 1. Giới thiệu (Introduction)

### 1.1 Mục đích (Purpose)
Tài liệu này mô tả chi tiết yêu cầu phần mềm cho hệ thống **TaskFlow** — một ứng dụng quản lý công việc (Task Management) cho cá nhân và nhóm nhỏ. Hệ thống cho phép người dùng tạo project, quản lý task, theo dõi tiến độ và phối hợp làm việc nhóm.

Tài liệu hướng tới các đối tượng đọc:
- **Developer** — hiểu yêu cầu để triển khai
- **Tester** — viết test cases dựa trên requirements
- **Reviewer/Interviewer** — đánh giá năng lực thiết kế hệ thống

### 1.2 Phạm vi (Scope)
TaskFlow là ứng dụng web gồm:
- **Backend**: ASP.NET Core 8 Web API
- **Frontend**: React 18 SPA (Single Page Application)
- **Database**: SQL Server

Hệ thống hỗ trợ:
- Quản lý nhiều project đồng thời
- Quản lý task với workflow trạng thái (Kanban)
- Phân quyền theo vai trò (Role-based Access Control)
- Dashboard thống kê tiến độ

**Ngoài phạm vi (Out of Scope):**
- Mobile app (iOS/Android) — xem Future_Roadmap.md
- Chat/messaging giữa users
- Integration với third-party tools (Jira, Trello, Slack)

### 1.3 Thuật ngữ & Viết tắt (Definitions, Acronyms, Abbreviations)
| Thuật ngữ | Mô tả |
|---|---|
| **SRS** | Software Requirements Specification |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token — chuẩn xác thực stateless |
| **CRUD** | Create, Read, Update, Delete |
| **SPA** | Single Page Application |
| **ORM** | Object-Relational Mapping |
| **Project** | Một dự án chứa nhiều Tasks |
| **Task** | Một công việc cần thực hiện trong Project |
| **Assignee** | Người được giao Task |
| **Label** | Nhãn phân loại Task (Bug, Feature, Improvement...) |
| **Status** | Trạng thái hiện tại của Task |
| **Kanban Board** | Giao diện hiển thị Task theo cột trạng thái |

### 1.4 Tài liệu tham chiếu (References)
| # | Tài liệu | Mô tả |
|---|---|---|
| 1 | `docs/API_Design.md` | Chi tiết 23 API endpoints |
| 2 | `docs/Database_Design.md` | Database schema, business rules |
| 3 | `docs/Architecture_Diagrams_Guide.md` | Hướng dẫn vẽ 7 diagrams |
| 4 | `docs/Future_Roadmap.md` | Kế hoạch mở rộng hệ thống |
| 5 | IEEE 830-1998 | IEEE Recommended Practice for SRS |

### 1.5 Tổng quan tài liệu (Document Overview)
- **Section 1** — Giới thiệu mục đích, phạm vi, thuật ngữ
- **Section 2** — Mô tả tổng quan: kiến trúc, actors, product perspective
- **Section 3** — Yêu cầu chức năng chi tiết (7 modules) với user stories
- **Section 4** — Yêu cầu phi chức năng: performance, security, maintainability
- **Section 5-7** — Ràng buộc, giả định, phụ lục

---

## 2. Mô tả tổng quan hệ thống (Overall Description)

### 2.1 Product Perspective (Vị trí sản phẩm)
TaskFlow là hệ thống **standalone** (độc lập), không phải module con của hệ thống lớn hơn. Ứng dụng hoạt động theo mô hình **client-server**:
- **Client**: React SPA chạy trên trình duyệt
- **Server**: ASP.NET Core Web API xử lý business logic
- **Database**: SQL Server lưu trữ dữ liệu

Tương tác giữa client và server qua giao thức **HTTP/HTTPS** với dữ liệu **JSON**.

### 2.2 Product Functions (Tổng quan chức năng)
| # | Module | Mô tả ngắn |
|---|---|---|
| 1 | Authentication | Đăng ký, đăng nhập, JWT token |
| 2 | User Management | Quản lý profile, phân quyền |
| 3 | Project Management | CRUD projects |
| 4 | Task Management | CRUD tasks, status flow, assign, filter, sort, paginate |
| 5 | Comments | Bình luận trên task |
| 6 | Labels | Nhãn phân loại task |
| 7 | Dashboard | Thống kê tiến độ |

### 2.3 User Characteristics (Đặc điểm người dùng)
| Đối tượng | Mô tả | Trình độ kỹ thuật |
|---|---|---|
| Sinh viên | Quản lý đồ án nhóm | Cơ bản — cần UI trực quan |
| Freelancer | Quản lý công việc cá nhân | Trung bình |
| Team nhỏ (2-10 người) | Phối hợp dự án | Trung bình — quen dùng web app |

### 2.4 Kiến trúc hệ thống (System Architecture)

Hệ thống áp dụng **Clean Architecture** gồm 4 layers:

```
┌──────────────────────────────────────────────────┐
│                   React Frontend                  │
│          (SPA - Single Page Application)          │
└───────────────────────┬──────────────────────────┘
                        │ HTTP/REST (JSON)
┌───────────────────────▼──────────────────────────┐
│              TaskFlow.API                         │
│         (ASP.NET Core Web API)                    │
│    Controllers, Middlewares, Filters              │
├──────────────────────────────────────────────────┤
│              TaskFlow.Application                 │
│         (Business Logic Layer)                    │
│    Services, DTOs, Validators, Mappings           │
├──────────────────────────────────────────────────┤
│              TaskFlow.Domain                      │
│         (Domain Layer)                            │
│    Entities, Enums, Domain Interfaces             │
├──────────────────────────────────────────────────┤
│              TaskFlow.Infrastructure              │
│         (Data Access Layer)                       │
│    EF Core, Repositories, Migrations              │
└───────────────────────┬──────────────────────────┘
                        │
                ┌───────▼───────┐
                │  SQL Server   │
                └───────────────┘
```

> **Lưu ý:** Vẽ lại sơ đồ này trên draw.io, export thành `docs/diagrams/architecture.png`.

### 2.5 External Interface Requirements (Giao diện bên ngoài)

**User Interface:**
- Giao diện web responsive, hoạt động trên Chrome/Firefox/Edge
- Layout chính: Sidebar (navigation) + Main content area
- Kanban board dạng drag-and-drop cho task management

**Software Interface:**
- Frontend giao tiếp với Backend qua REST API (JSON over HTTPS)
- Backend giao tiếp với Database qua Entity Framework Core (ORM)
- Authentication qua JWT Bearer Token trong HTTP Header

**Hardware Interface:**
- Không yêu cầu phần cứng đặc biệt — chạy trên bất kỳ thiết bị có trình duyệt

**Communication Interface:**
- Protocol: HTTPS (port 443 production, port 5001 development)
- Data format: JSON (`Content-Type: application/json`)

### 2.6 Actors (Đối tượng sử dụng)

| Actor | Mô tả | Quyền hạn |
|---|---|---|
| **Guest** | Người chưa đăng nhập | Chỉ xem trang Login/Register |
| **Member** | Người dùng đã đăng ký | Tạo/quản lý project và task của mình, bình luận |
| **Admin** | Quản trị viên | Toàn quyền: quản lý user, xóa bất kỳ project/task nào |

---

## 3. Yêu cầu chức năng (Specific/Functional Requirements)

> Mỗi requirement được đánh ID theo format `FR-[Module].[Số thứ tự]` và phân loại theo MoSCoW:
> - **Must** — bắt buộc phải có
> - **Should** — nên có, nhưng hệ thống vẫn chạy được nếu thiếu
> - **Could** — có thì tốt, không có cũng được

### FR-01: Authentication (Xác thực)

| ID | Mô tả | Priority |
|---|---|---|
| FR-01.1 | Người dùng có thể **đăng ký** tài khoản bằng email + password | Must |
| FR-01.2 | Người dùng có thể **đăng nhập** và nhận JWT token | Must |
| FR-01.3 | Hệ thống từ chối truy cập API khi không có token hợp lệ | Must |
| FR-01.4 | Token có thời hạn (expiry), hết hạn phải đăng nhập lại | Must |
| FR-01.5 | Người dùng có thể **đăng xuất** (xóa token phía client) | Must |

**User Stories:**
- *As a Guest, I want to register an account, so that I can use the system.*
- *As a Guest, I want to login with my credentials, so that I can access my projects and tasks.*

**Acceptance Criteria (Tiêu chí chấp nhận):**
- AC-01.1: Register thành công → trả về 201 + token. Email đã tồn tại → 409 Conflict.
- AC-01.2: Login đúng email/password → 200 + JWT token. Sai → 401 Unauthorized.
- AC-01.3: Gọi API không có token → 401. Token hết hạn → 401.
- AC-01.4: Token expire sau 24 giờ kể từ lúc đăng nhập.

---

### FR-02: User Management (Quản lý người dùng)

| ID | Mô tả | Priority |
|---|---|---|
| FR-02.1 | Người dùng có thể xem và cập nhật **profile** (tên, email) | Must |
| FR-02.2 | Admin có thể xem **danh sách** tất cả users | Should |
| FR-02.3 | Admin có thể **thay đổi role** của user (Member ↔ Admin) | Should |

**User Stories:**
- *As a Member, I want to update my profile information, so that my details are current.*
- *As an Admin, I want to view all users, so that I can manage the system.*

---

### FR-03: Project Management (Quản lý dự án)

| ID | Mô tả | Priority |
|---|---|---|
| FR-03.1 | Member có thể **tạo** project mới (name, description) | Must |
| FR-03.2 | Owner có thể **sửa** thông tin project | Must |
| FR-03.3 | Owner có thể **xóa** project (soft delete) | Must |
| FR-03.4 | Member có thể xem **danh sách** projects của mình | Must |
| FR-03.5 | Member có thể xem **chi tiết** 1 project và danh sách tasks | Must |
| FR-03.6 | Owner có thể **mời member** vào project | Should |

**User Stories:**
- *As a Member, I want to create a project, so that I can organize my tasks.*
- *As a Project Owner, I want to edit project details, so that I can keep information updated.*
- *As a Member, I want to see all my projects, so that I can choose which one to work on.*

---

### FR-04: Task Management (Quản lý công việc)

| ID | Mô tả | Priority |
|---|---|---|
| FR-04.1 | Member có thể **tạo** task trong project (title, description, priority, due date) | Must |
| FR-04.2 | Member có thể **sửa** thông tin task | Must |
| FR-04.3 | Member có thể **xóa** task (soft delete) | Must |
| FR-04.4 | Member có thể **chuyển trạng thái** task theo flow: Todo → InProgress → Review → Done | Must |
| FR-04.5 | Member có thể **gán task** cho một user khác trong project | Must |
| FR-04.6 | Member có thể **filter** tasks theo: status, priority, assignee | Must |
| FR-04.7 | Member có thể **sort** tasks theo: created date, due date, priority | Must |
| FR-04.8 | Danh sách tasks có **phân trang** (pagination) | Must |
| FR-04.9 | Member có thể **search** task theo title hoặc description | Should |

**User Stories:**
- *As a Member, I want to create a task with details, so that I can track what needs to be done.*
- *As a Member, I want to drag a task to change its status, so that I can update progress quickly on the Kanban board.*
- *As a Member, I want to assign a task to a teammate, so that responsibilities are clear.*
- *As a Member, I want to filter tasks by status, so that I can focus on what's in progress.*

**Task Status Flow (State Diagram):**
```
┌──────┐    Start     ┌────────────┐    Submit    ┌────────┐    Approve   ┌──────┐
│ Todo │ ──────────►  │ InProgress │ ──────────►  │ Review │ ──────────► │ Done │
└──────┘              └────────────┘              └────────┘             └──────┘
                           ▲                          │
                           │        Reject            │
                           └──────────────────────────┘
```

**Task Priority Enum:**
| Value | Label | Mô tả |
|---|---|---|
| 0 | Low | Ưu tiên thấp |
| 1 | Medium | Ưu tiên trung bình |
| 2 | High | Ưu tiên cao |
| 3 | Critical | Cần xử lý gấp |

---

### FR-05: Comments (Bình luận)

| ID | Mô tả | Priority |
|---|---|---|
| FR-05.1 | Member có thể **thêm comment** vào task | Should |
| FR-05.2 | Member có thể **xóa** comment của chính mình | Should |
| FR-05.3 | Hiển thị danh sách comments theo **thời gian** (mới nhất trước) | Should |

**User Stories:**
- *As a Member, I want to comment on a task, so that I can discuss details with my team.*

---

### FR-06: Labels (Nhãn)

| ID | Mô tả | Priority |
|---|---|---|
| FR-06.1 | Admin/Owner có thể **tạo** labels (name, color) | Should |
| FR-06.2 | Member có thể **gắn/bỏ** label cho task | Should |
| FR-06.3 | Member có thể **filter** tasks theo label | Should |

**User Stories:**
- *As a Member, I want to add labels to tasks, so that I can categorize them (Bug, Feature, etc.).*

---

### FR-07: Dashboard (Bảng thống kê)

| ID | Mô tả | Priority |
|---|---|---|
| FR-07.1 | Hiển thị **tổng số tasks** theo từng status (pie chart) | Should |
| FR-07.2 | Hiển thị **số tasks** theo priority (bar chart) | Should |
| FR-07.3 | Hiển thị **tasks gần deadline** (due trong 3 ngày) | Should |
| FR-07.4 | Hiển thị **tasks được giao** cho user hiện tại | Should |

**User Stories:**
- *As a Member, I want to see a dashboard, so that I can quickly understand project progress.*

---

## 4. Yêu cầu phi chức năng (Non-Functional Requirements)

### NFR-01: Performance
| ID | Mô tả |
|---|---|
| NFR-01.1 | API response time < **500ms** cho các request thông thường |
| NFR-01.2 | Hỗ trợ **pagination** với page size mặc định 10, tối đa 50 |
| NFR-01.3 | Database query phải có **index** trên các cột thường filter |

### NFR-02: Security
| ID | Mô tả |
|---|---|
| NFR-02.1 | Password phải được **hash** (bcrypt/PBKDF2), không lưu plain text |
| NFR-02.2 | Sử dụng **JWT** cho authentication, token expire sau 24h |
| NFR-02.3 | API endpoints phải có **authorization** check (role-based) |
| NFR-02.4 | Chống **SQL Injection** — dùng parameterized queries (EF Core) |
| NFR-02.5 | **CORS** chỉ cho phép origin của frontend |

### NFR-03: Maintainability
| ID | Mô tả |
|---|---|
| NFR-03.1 | Áp dụng **Clean Architecture** — tách biệt layers |
| NFR-03.2 | Áp dụng **SOLID principles** |
| NFR-03.3 | Sử dụng **Dependency Injection** |
| NFR-03.4 | Code coverage tối thiểu **60%** cho Service layer |

### NFR-04: Deployment
| ID | Mô tả |
|---|---|
| NFR-04.1 | Hệ thống phải **containerize** được bằng Docker |
| NFR-04.2 | Có **CI/CD pipeline** tự động build và test |
| NFR-04.3 | Có thể deploy lên cloud (Azure/Railway) |

---

## 5. Ràng buộc (Constraints)

- Dự án do **1 người** phát triển (personal project)
- Thời gian phát triển: **4 tuần**
- Ngân sách: **$0** (sử dụng free tier cho tất cả services)
- Database: SQL Server LocalDB (development) / PostgreSQL (production)

---

## 6. Giả định (Assumptions)

- Người dùng có kết nối internet ổn định
- Trình duyệt hỗ trợ: Chrome, Firefox, Edge (phiên bản mới nhất)
- Số lượng người dùng đồng thời: < 100 (personal/small team use)

---

## 7. Phụ lục (Appendix)

### 7.1 Tài liệu tham khảo
- [IEEE 830-1998 — Recommended Practice for SRS](https://standards.ieee.org/standard/830-1998.html)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
- [React Documentation](https://react.dev/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [OpenAPI Specification](https://swagger.io/specification/)

### 7.2 Lịch sử thay đổi (Revision History)
| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-03-16 | [Tên bạn] | Initial draft |
| 1.1 | 2026-03-16 | [Tên bạn] | Bổ sung IEEE 830 sections: TOC, Product Perspective, External Interfaces, Acceptance Criteria |
