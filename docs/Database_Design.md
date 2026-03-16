# Database Design Document
# TaskFlow — Task Management System

**Version:** 1.0  
**Date:** 2026-03-16

---

## 1. Tổng quan (Overview)

Database sử dụng **SQL Server** (development) và **PostgreSQL** (production).  
ORM: **Entity Framework Core 8** với Code-First approach.

---

## 2. Entity Relationship Diagram (ERD)

> Vẽ lại trên draw.io → export `docs/diagrams/erd.png`

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    Users     │       │    Projects      │       │   TaskItems  │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ Id       (PK)│──┐    │ Id           (PK)│──┐    │ Id       (PK)│
│ FullName     │  │    │ Name             │  │    │ Title        │
│ Email (UQ)   │  ├───►│ Description      │  ├───►│ Description  │
│ PasswordHash │  │    │ OwnerId     (FK) │  │    │ Status       │
│ Role         │  │    │ CreatedAt        │  │    │ Priority     │
│ CreatedAt    │  │    │ UpdatedAt        │  │    │ ProjectId(FK)│
│ IsActive     │  │    │ IsDeleted        │  │    │ AssigneeId(FK│
└──────────────┘  │    └──────────────────┘  │    │ DueDate      │
                  │                          │    │ CreatedAt    │
                  │    ┌──────────────────┐  │    │ UpdatedAt    │
                  │    │    Comments      │  │    │ IsDeleted    │
                  │    ├──────────────────┤  │    └──────────────┘
                  ├───►│ Id           (PK)│  │           │
                  │    │ Content          │  │           │
                  │    │ TaskItemId  (FK) │◄─┘    ┌──────▼───────┐
                  │    │ UserId      (FK) │       │  TaskLabels  │
                  │    │ CreatedAt        │       ├──────────────┤
                  │    └──────────────────┘       │TaskItemId(FK)│
                  │                               │ LabelId (FK) │
                  │    ┌──────────────────┐       └──────┬───────┘
                  │    │     Labels       │              │
                  │    ├──────────────────┤              │
                  │    │ Id           (PK)│◄─────────────┘
                  │    │ Name             │
                  │    │ Color            │
                  │    └──────────────────┘
```

---

## 3. Chi tiết bảng (Table Specifications)

### 3.1 Users

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `Id` | `int` | PK, Identity | Khóa chính, tự tăng |
| `FullName` | `nvarchar(100)` | NOT NULL | Họ tên đầy đủ |
| `Email` | `nvarchar(255)` | NOT NULL, UNIQUE | Email đăng nhập (không trùng) |
| `PasswordHash` | `nvarchar(500)` | NOT NULL | Mật khẩu đã hash (bcrypt) |
| `Role` | `nvarchar(20)` | NOT NULL, DEFAULT 'Member' | Vai trò: 'Admin' hoặc 'Member' |
| `CreatedAt` | `datetime2` | NOT NULL, DEFAULT GETUTCDATE() | Ngày tạo tài khoản |
| `IsActive` | `bit` | NOT NULL, DEFAULT 1 | Trạng thái hoạt động |

**Indexes:**
- `IX_Users_Email` — UNIQUE index trên `Email` (tìm kiếm khi login)

---

### 3.2 Projects

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `Id` | `int` | PK, Identity | Khóa chính |
| `Name` | `nvarchar(200)` | NOT NULL | Tên project |
| `Description` | `nvarchar(1000)` | NULL | Mô tả project |
| `OwnerId` | `int` | FK → Users.Id, NOT NULL | Người tạo project |
| `CreatedAt` | `datetime2` | NOT NULL, DEFAULT GETUTCDATE() | Ngày tạo |
| `UpdatedAt` | `datetime2` | NULL | Ngày cập nhật gần nhất |
| `IsDeleted` | `bit` | NOT NULL, DEFAULT 0 | Soft delete flag |

**Indexes:**
- `IX_Projects_OwnerId` — Index trên `OwnerId` (lấy projects theo user)

**Relationships:**
- `Projects.OwnerId` → `Users.Id` (Many-to-One: Nhiều projects thuộc 1 user)

---

### 3.3 TaskItems

> ⚠️ Đặt tên bảng là `TaskItems` thay vì `Tasks` vì `Task` là reserved keyword trong C#.

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `Id` | `int` | PK, Identity | Khóa chính |
| `Title` | `nvarchar(200)` | NOT NULL | Tiêu đề task |
| `Description` | `nvarchar(2000)` | NULL | Mô tả chi tiết |
| `Status` | `int` | NOT NULL, DEFAULT 0 | Trạng thái (enum TaskStatus) |
| `Priority` | `int` | NOT NULL, DEFAULT 1 | Độ ưu tiên (enum Priority) |
| `ProjectId` | `int` | FK → Projects.Id, NOT NULL | Project chứa task |
| `AssigneeId` | `int` | FK → Users.Id, NULL | Người được giao (có thể chưa giao) |
| `DueDate` | `datetime2` | NULL | Hạn hoàn thành |
| `CreatedAt` | `datetime2` | NOT NULL, DEFAULT GETUTCDATE() | Ngày tạo |
| `UpdatedAt` | `datetime2` | NULL | Ngày cập nhật |
| `IsDeleted` | `bit` | NOT NULL, DEFAULT 0 | Soft delete flag |

**Indexes:**
- `IX_TaskItems_ProjectId` — Index trên `ProjectId` (lấy tasks theo project)
- `IX_TaskItems_AssigneeId` — Index trên `AssigneeId` (lấy tasks theo user)
- `IX_TaskItems_Status` — Index trên `Status` (filter theo trạng thái)
- `IX_TaskItems_DueDate` — Index trên `DueDate` (sort theo deadline)

**Relationships:**
- `TaskItems.ProjectId` → `Projects.Id` (Many-to-One: Nhiều tasks thuộc 1 project)
- `TaskItems.AssigneeId` → `Users.Id` (Many-to-One: Nhiều tasks giao cho 1 user)

**Enums:**
```csharp
public enum TaskItemStatus
{
    Todo = 0,
    InProgress = 1,
    Review = 2,
    Done = 3
}

public enum TaskItemPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}
```

---

### 3.4 Comments

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `Id` | `int` | PK, Identity | Khóa chính |
| `Content` | `nvarchar(1000)` | NOT NULL | Nội dung comment |
| `TaskItemId` | `int` | FK → TaskItems.Id, NOT NULL | Task được comment |
| `UserId` | `int` | FK → Users.Id, NOT NULL | Người comment |
| `CreatedAt` | `datetime2` | NOT NULL, DEFAULT GETUTCDATE() | Ngày tạo |

**Indexes:**
- `IX_Comments_TaskItemId` — Index trên `TaskItemId` (lấy comments theo task)

**Relationships:**
- `Comments.TaskItemId` → `TaskItems.Id` (Many-to-One)
- `Comments.UserId` → `Users.Id` (Many-to-One)

---

### 3.5 Labels

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `Id` | `int` | PK, Identity | Khóa chính |
| `Name` | `nvarchar(50)` | NOT NULL, UNIQUE | Tên nhãn (Bug, Feature, Improvement...) |
| `Color` | `nvarchar(7)` | NOT NULL, DEFAULT '#6366f1' | Mã màu HEX |

---

### 3.6 TaskLabels (Junction Table — Many-to-Many)

| Column | Type | Constraint | Mô tả |
|---|---|---|---|
| `TaskItemId` | `int` | PK, FK → TaskItems.Id | Composite PK phần 1 |
| `LabelId` | `int` | PK, FK → Labels.Id | Composite PK phần 2 |

**Relationships:**
- Many-to-Many giữa `TaskItems` và `Labels` thông qua bảng trung gian `TaskLabels`

---

## 4. Business Rules

1. **Soft Delete**: Projects và TaskItems không bị xóa vĩnh viễn, chỉ đánh dấu `IsDeleted = true`. Khi query, luôn filter `WHERE IsDeleted = false`.

2. **Task Status Flow**: Task chỉ có thể chuyển trạng thái theo flow:
   - `Todo` → `InProgress` (bắt đầu làm)
   - `InProgress` → `Review` (submit review)
   - `Review` → `Done` (approve)
   - `Review` → `InProgress` (reject, làm lại)
   - Không được nhảy trạng thái (ví dụ: Todo → Done)

3. **Cascade Delete**: Khi xóa Project (soft delete), tất cả TaskItems trong project cũng bị soft delete.

4. **Assignee nullable**: Task có thể chưa được giao cho ai (`AssigneeId = NULL`).

5. **Email unique**: Không cho phép 2 users cùng email.

---

## 5. Seed Data (Dữ liệu mẫu)

```sql
-- Admin user (password: Admin@123)
INSERT INTO Users (FullName, Email, PasswordHash, Role)
VALUES ('Admin User', 'admin@taskflow.com', '<hashed>', 'Admin');

-- Member user (password: Member@123)
INSERT INTO Users (FullName, Email, PasswordHash, Role)
VALUES ('Nguyen Van A', 'member@taskflow.com', '<hashed>', 'Member');

-- Sample Labels
INSERT INTO Labels (Name, Color) VALUES 
('Bug', '#ef4444'),
('Feature', '#22c55e'),
('Improvement', '#3b82f6'),
('Documentation', '#a855f7'),
('Urgent', '#f97316');

-- Sample Project
INSERT INTO Projects (Name, Description, OwnerId)
VALUES ('TaskFlow Demo', 'Demo project for testing', 1);

-- Sample Tasks
INSERT INTO TaskItems (Title, Description, Status, Priority, ProjectId, AssigneeId, DueDate) VALUES
('Setup database', 'Create initial database schema', 3, 1, 1, 1, '2026-03-20'),
('Implement login API', 'JWT authentication endpoint', 2, 2, 1, 2, '2026-03-22'),
('Design dashboard UI', 'Create mockup for dashboard', 1, 1, 1, 2, '2026-03-25'),
('Write unit tests', 'Test service layer', 0, 0, 1, NULL, '2026-03-28');
```
