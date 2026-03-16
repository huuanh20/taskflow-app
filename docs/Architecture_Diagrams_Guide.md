# Hướng dẫn vẽ Diagrams trên draw.io
# TaskFlow — Task Management System

Mở [app.diagrams.net](https://app.diagrams.net) → tạo file mới → vẽ theo hướng dẫn bên dưới.  
Sau khi vẽ xong mỗi diagram: **File → Export as → PNG** (tick "Include a copy of my diagram") → lưu vào `docs/diagrams/`.

---

## 1. 🏗️ Architecture Diagram (`architecture.drawio`)

Vẽ sơ đồ kiến trúc hệ thống gồm 3 khối lớn: **Client**, **Server**, **Database**.

```
Hướng dẫn bố cục (từ trái sang phải hoặc trên xuống dưới):

╔═══════════════════════════════════════════════════════════════╗
║                         CLIENT                                ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │            React 18 (Vite)                              │  ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │  ║
║  │  │  Pages   │  │Components│  │ Services │  │ Hooks  │  │  ║
║  │  │ (Router) │  │  (UI)    │  │ (Axios)  │  │        │  │  ║
║  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │  ║
║  └─────────────────────┬───────────────────────────────────┘  ║
╚════════════════════════│══════════════════════════════════════╝
                         │ HTTP/REST (JSON)
                         │ JWT Token in Header
╔════════════════════════▼══════════════════════════════════════╗
║                        SERVER                                 ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  TaskFlow.API (Presentation Layer)                      │  ║
║  │  • Controllers  • Middlewares  • Filters  • Swagger     │  ║
║  └─────────────────────┬───────────────────────────────────┘  ║
║                        │ Dependency Injection                 ║
║  ┌─────────────────────▼───────────────────────────────────┐  ║
║  │  TaskFlow.Application (Business Logic Layer)            │  ║
║  │  • Services  • DTOs  • Validators  • AutoMapper         │  ║
║  └─────────────────────┬───────────────────────────────────┘  ║
║                        │ Interfaces                           ║
║  ┌─────────────────────▼───────────────────────────────────┐  ║
║  │  TaskFlow.Domain (Domain Layer)                         │  ║
║  │  • Entities  • Enums  • Domain Interfaces               │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                        ▲ Implements Interfaces                ║
║  ┌─────────────────────┴───────────────────────────────────┐  ║
║  │  TaskFlow.Infrastructure (Data Access Layer)            │  ║
║  │  • DbContext  • Repositories  • Migrations  • UoW       │  ║
║  └─────────────────────┬───────────────────────────────────┘  ║
╚════════════════════════│══════════════════════════════════════╝
                         │ Entity Framework Core
╔════════════════════════▼══════════════════════════════════════╗
║                      DATABASE                                 ║
║              ┌─────────────────────┐                          ║
║              │   SQL Server        │                          ║
║              │   (6 tables)        │                          ║
║              └─────────────────────┘                          ║
╚═══════════════════════════════════════════════════════════════╝
```

**Tips draw.io:**
- Dùng **Rectangle** cho mỗi layer, khác màu cho mỗi layer
- Gợi ý màu: API = 🔵 blue, Application = 🟢 green, Domain = 🟡 yellow, Infrastructure = 🟠 orange
- Dùng **Arrow** nối giữa các layer
- Viết ghi chú bên cạnh arrow: "HTTP/REST", "DI", "EF Core"

---

## 2. 📊 ERD — Entity Relationship Diagram (`erd.drawio`)

Vẽ 6 bảng với các quan hệ:

```
Các bảng và quan hệ:

Users ──┬── 1:N ──► Projects     (Users.Id = Projects.OwnerId)
        ├── 1:N ──► TaskItems    (Users.Id = TaskItems.AssigneeId)
        └── 1:N ──► Comments     (Users.Id = Comments.UserId)

Projects ── 1:N ──► TaskItems    (Projects.Id = TaskItems.ProjectId)

TaskItems ──┬── 1:N ──► Comments    (TaskItems.Id = Comments.TaskItemId)
            └── M:N ──► Labels      (thông qua TaskLabels)
```

**Tips draw.io:**
- Dùng template: **File → New → UML → Entity Relationship**
- Mỗi bảng là 1 box có 2 phần: tên bảng (trên) + danh sách columns (dưới)
- Đánh dấu **PK** (Primary Key) và **FK** (Foreign Key)
- Dùng ký hiệu chuẩn: `1──*` (one-to-many), `*──*` (many-to-many)

---

## 3. 👤 Use Case Diagram (`use-case.drawio`)

Vẽ 2 actor và các use cases:

```
Actor: Guest (stick figure bên trái)
├── Register
└── Login

Actor: Member (stick figure giữa)
├── Manage Profile
├── Create/Edit/Delete Project
├── Create/Edit/Delete Task
├── Change Task Status
├── Assign Task
├── Add/Delete Comment
├── Add/Remove Label
├── View Dashboard
├── Search Tasks
└── Filter & Sort Tasks

Actor: Admin (stick figure bên phải, extends Member)
├── (tất cả quyền của Member)
├── Manage Users
├── Create/Delete Labels
└── Delete any Project/Task
```

**Tips draw.io:**
- Dùng template: **File → New → UML → Use Case**
- Stick figure = Actor
- Oval = Use Case
- Vẽ đường nối từ actor → use case
- Dùng `<<include>>` và `<<extend>>` nếu cần

---

## 4. 🔄 Sequence Diagrams

### 4.1 Login Flow (`sequence-login.drawio`)

```
Client          API Controller      AuthService       UserRepository     Database
  │                   │                  │                  │               │
  │  POST /auth/login │                  │                  │               │
  │──────────────────►│                  │                  │               │
  │                   │  Login(dto)      │                  │               │
  │                   │─────────────────►│                  │               │
  │                   │                  │  GetByEmail()    │               │
  │                   │                  │─────────────────►│               │
  │                   │                  │                  │  SELECT...    │
  │                   │                  │                  │──────────────►│
  │                   │                  │                  │◄──────────────│
  │                   │                  │◄─────────────────│  User entity  │
  │                   │                  │                  │               │
  │                   │                  │  VerifyPassword()│               │
  │                   │                  │  GenerateJWT()   │               │
  │                   │◄─────────────────│  {token, user}   │               │
  │◄──────────────────│  200 OK + JWT    │                  │               │
  │   {token, user}   │                  │                  │               │
```

### 4.2 Create Task Flow (`sequence-create-task.drawio`)

```
Client          API Controller      TaskService       TaskRepository     Database
  │                   │                  │                  │               │
  │  POST /tasks      │                  │                  │               │
  │  + JWT Header     │                  │                  │               │
  │──────────────────►│                  │                  │               │
  │                   │  [Auth Middleware]│                  │               │
  │                   │  Validate JWT    │                  │               │
  │                   │                  │                  │               │
  │                   │  CreateTask(dto) │                  │               │
  │                   │─────────────────►│                  │               │
  │                   │                  │  Validate(dto)   │               │
  │                   │                  │  Map DTO→Entity  │               │
  │                   │                  │  Add(entity)     │               │
  │                   │                  │─────────────────►│               │
  │                   │                  │                  │  INSERT...    │
  │                   │                  │                  │──────────────►│
  │                   │                  │                  │◄──────────────│
  │                   │                  │◄─────────────────│  saved entity │
  │                   │◄─────────────────│  TaskDto         │               │
  │◄──────────────────│  201 Created     │                  │               │
  │   {task}          │                  │                  │               │
```

**Tips draw.io:**
- Dùng template: **File → New → UML → Sequence**
- Mỗi participant là 1 box + lifeline (đường dọc)
- Dùng solid arrow (→) cho request, dashed arrow (-->) cho response

---

## 5. 🔄 State Diagram — Task Lifecycle (`state-task.drawio`)

```
        ┌────────────────────────────────────────────────────┐
        │                                                     │
        ▼                                                     │
   ┌─────────┐    Start Work    ┌──────────────┐             │
   │  TODO   │─────────────────►│  IN PROGRESS │             │
   │  (New)  │                  │  (Working)   │             │
   └─────────┘                  └──────┬───────┘             │
                                       │                      │
                                       │ Submit for Review    │
                                       ▼                      │
                                ┌──────────────┐              │
                                │   REVIEW     │    Reject    │
                                │  (Checking)  │─────────────┘
                                └──────┬───────┘
                                       │
                                       │ Approve
                                       ▼
                                ┌──────────────┐
                                │    DONE      │
                                │  (Completed) │
                                └──────────────┘
```

**Tips draw.io:**
- Dùng **rounded rectangle** cho mỗi state
- Màu gợi ý: Todo = ⬜ grey, InProgress = 🟦 blue, Review = 🟨 yellow, Done = 🟩 green
- Dùng **filled circle** (●) cho initial state
- Ghi label trên mỗi transition arrow (Start Work, Submit, Approve, Reject)

---

## 6. 📦 Class Diagram (`class-diagram.drawio`)

```
Vẽ các class chính và interface:

┌──────────────────────┐     ┌──────────────────────────┐
│   <<interface>>      │     │      <<interface>>        │
│   IRepository<T>     │     │   IUnitOfWork             │
├──────────────────────┤     ├──────────────────────────┤
│ + GetByIdAsync(id)   │     │ + Projects: IProjectRepo  │
│ + GetAllAsync()      │     │ + Tasks: ITaskRepo        │
│ + AddAsync(entity)   │     │ + Comments: ICommentRepo  │
│ + Update(entity)     │     │ + SaveChangesAsync()      │
│ + Delete(entity)     │     └───────────┬──────────────┘
└──────────┬───────────┘                 │ implements
           │ implements                  │
┌──────────▼───────────┐     ┌───────────▼──────────────┐
│  Repository<T>       │     │   UnitOfWork              │
├──────────────────────┤     ├──────────────────────────┤
│ - _context: DbContext│     │ - _context: DbContext     │
│ + GetByIdAsync(id)   │     │ + SaveChangesAsync()      │
│ + GetAllAsync()      │     └──────────────────────────┘
│ + AddAsync(entity)   │
└──────────────────────┘

┌──────────────────────┐     ┌──────────────────────────┐
│  TaskService         │     │  AuthService              │
├──────────────────────┤     ├──────────────────────────┤
│ - _unitOfWork        │     │ - _userRepo               │
│ - _mapper            │     │ - _tokenService           │
├──────────────────────┤     ├──────────────────────────┤
│ + CreateAsync(dto)   │     │ + RegisterAsync(dto)      │
│ + UpdateAsync(dto)   │     │ + LoginAsync(dto)         │
│ + DeleteAsync(id)    │     │ + GenerateJwt(user)       │
│ + ChangeStatus(id,s) │     └──────────────────────────┘
│ + GetByIdAsync(id)   │
└──────────────────────┘
```

**Tips draw.io:**
- Dùng template: **UML → Class Diagram**
- Mỗi class/interface = box 3 phần: name, attributes, methods
- Interface đánh dấu `<<interface>>`
- Dashed arrow (--▷) cho "implements"
- Solid arrow (──▷) cho "extends/inherits"

---

## Checklist vẽ diagram

- [ ] architecture.drawio → architecture.png
- [ ] erd.drawio → erd.png  
- [ ] use-case.drawio → use-case.png
- [ ] sequence-login.drawio → sequence-login.png
- [ ] sequence-create-task.drawio → sequence-create-task.png
- [ ] class-diagram.drawio → class-diagram.png
- [ ] state-task.drawio → state-task.png

> Lưu tất cả file `.drawio` gốc + file `.png` vào `docs/diagrams/`
