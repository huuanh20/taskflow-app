# API Design Document
# TaskFlow — Task Management System

**Version:** 1.0  
**Date:** 2026-03-16  
**Base URL:** `https://localhost:5001/api`  
**Authentication:** JWT Bearer Token (trừ Auth endpoints)

---

## Quy ước chung

- **Format:** JSON
- **Naming:** camelCase cho JSON fields
- **Pagination:** `?pageNumber=1&pageSize=10`
- **Auth Header:** `Authorization: Bearer <jwt_token>`
- **Error Response:**
```json
{
  "statusCode": 400,
  "message": "Validation error",
  "errors": ["Title is required", "Priority must be between 0 and 3"]
}
```
- **Paginated Response:**
```json
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 45,
  "totalPages": 5,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

---

## 1. Auth Endpoints 🔓

### `POST /api/auth/register`
Đăng ký tài khoản mới.

| | Chi tiết |
|---|---|
| **Auth** | ❌ Không cần |
| **Request Body** | `{ "fullName": "Nguyen Van A", "email": "a@example.com", "password": "Password@123" }` |
| **Validation** | fullName: 2-100 chars, email: valid format + unique, password: min 8 chars + uppercase + number + special |
| **Success** | `201 Created` → `{ "id": 1, "fullName": "...", "email": "...", "token": "jwt..." }` |
| **Error** | `400 Bad Request` (validation), `409 Conflict` (email existed) |

---

### `POST /api/auth/login`
Đăng nhập, trả về JWT token.

| | Chi tiết |
|---|---|
| **Auth** | ❌ Không cần |
| **Request Body** | `{ "email": "a@example.com", "password": "Password@123" }` |
| **Success** | `200 OK` → `{ "id": 1, "fullName": "...", "email": "...", "role": "Member", "token": "jwt..." }` |
| **Error** | `401 Unauthorized` (wrong email/password) |

---

### `GET /api/auth/me`
Lấy thông tin user hiện tại từ token.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Success** | `200 OK` → `{ "id": 1, "fullName": "...", "email": "...", "role": "Member" }` |
| **Error** | `401 Unauthorized` |

---

## 2. User Endpoints 👤

### `GET /api/users`
Lấy danh sách tất cả users (Admin only).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Admin only |
| **Query Params** | `?pageNumber=1&pageSize=10&search=nguyen` |
| **Success** | `200 OK` → Paginated list of users |
| **Error** | `403 Forbidden` (not Admin) |

---

### `PUT /api/users/{id}`
Cập nhật profile user.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Owner hoặc Admin |
| **Request Body** | `{ "fullName": "Nguyen Van B" }` |
| **Success** | `200 OK` → Updated user |
| **Error** | `403 Forbidden`, `404 Not Found` |

---

## 3. Project Endpoints 📁

### `GET /api/projects`
Lấy danh sách projects của user hiện tại.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Query Params** | `?pageNumber=1&pageSize=10&search=demo` |
| **Success** | `200 OK` → Paginated list of projects |

---

### `GET /api/projects/{id}`
Lấy chi tiết 1 project.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Owner hoặc Member of project |
| **Success** | `200 OK` → `{ "id": 1, "name": "...", "description": "...", "owner": {...}, "taskCount": 12, "createdAt": "..." }` |
| **Error** | `404 Not Found`, `403 Forbidden` |

---

### `POST /api/projects`
Tạo project mới.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Request Body** | `{ "name": "My Project", "description": "Optional description" }` |
| **Validation** | name: required, 1-200 chars |
| **Success** | `201 Created` → Created project with Location header |
| **Error** | `400 Bad Request` |

---

### `PUT /api/projects/{id}`
Cập nhật project.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Owner only |
| **Request Body** | `{ "name": "Updated Name", "description": "Updated desc" }` |
| **Success** | `200 OK` → Updated project |
| **Error** | `403 Forbidden`, `404 Not Found` |

---

### `DELETE /api/projects/{id}`
Xóa project (soft delete).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Owner hoặc Admin |
| **Success** | `204 No Content` |
| **Error** | `403 Forbidden`, `404 Not Found` |

---

## 4. Task Endpoints ✅

### `GET /api/projects/{projectId}/tasks`
Lấy danh sách tasks trong project.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Member of project |
| **Query Params** | `?pageNumber=1&pageSize=10&status=1&priority=2&assigneeId=5&search=login&sortBy=dueDate&sortOrder=asc` |
| **Success** | `200 OK` → Paginated list of tasks with labels |

---

### `GET /api/tasks/{id}`
Lấy chi tiết 1 task (bao gồm comments và labels).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Success** | `200 OK` → `{ "id": 1, "title": "...", "status": 1, "priority": 2, "assignee": {...}, "labels": [...], "comments": [...], ... }` |
| **Error** | `404 Not Found` |

---

### `POST /api/projects/{projectId}/tasks`
Tạo task mới trong project.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Member of project |
| **Request Body** | `{ "title": "Implement login", "description": "...", "priority": 2, "assigneeId": 3, "dueDate": "2026-04-01", "labelIds": [1, 3] }` |
| **Validation** | title: required 1-200 chars, priority: 0-3, assigneeId: valid user, dueDate: future date |
| **Success** | `201 Created` → Created task |
| **Error** | `400 Bad Request`, `404 Not Found` (project/assignee) |

---

### `PUT /api/tasks/{id}`
Cập nhật thông tin task.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Assignee hoặc Project Owner |
| **Request Body** | `{ "title": "Updated title", "description": "...", "priority": 1, "assigneeId": 2, "dueDate": "2026-04-05", "labelIds": [1, 2] }` |
| **Success** | `200 OK` → Updated task |
| **Error** | `403 Forbidden`, `404 Not Found` |

---

### `PATCH /api/tasks/{id}/status`
Chuyển trạng thái task (theo flow).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Assignee hoặc Project Owner |
| **Request Body** | `{ "status": 2 }` |
| **Validation** | Phải tuân theo flow: Todo→InProgress→Review→Done, Review→InProgress (reject) |
| **Success** | `200 OK` → `{ "id": 1, "status": 2, "statusName": "Review" }` |
| **Error** | `400 Bad Request` (invalid transition), `403 Forbidden` |

**Valid Transitions:**
```
0 (Todo)       → 1 (InProgress)
1 (InProgress) → 2 (Review)
2 (Review)     → 3 (Done)
2 (Review)     → 1 (InProgress)  ← reject
```

---

### `DELETE /api/tasks/{id}`
Xóa task (soft delete).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Assignee hoặc Project Owner hoặc Admin |
| **Success** | `204 No Content` |
| **Error** | `403 Forbidden`, `404 Not Found` |

---

## 5. Comment Endpoints 💬

### `GET /api/tasks/{taskId}/comments`
Lấy comments của task (sắp xếp mới nhất trước).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Query Params** | `?pageNumber=1&pageSize=20` |
| **Success** | `200 OK` → Paginated list of comments with user info |

---

### `POST /api/tasks/{taskId}/comments`
Thêm comment vào task.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Request Body** | `{ "content": "Looking good, please fix the edge case." }` |
| **Validation** | content: required, 1-1000 chars |
| **Success** | `201 Created` → Created comment |
| **Error** | `400 Bad Request`, `404 Not Found` (task) |

---

### `DELETE /api/comments/{id}`
Xóa comment (chỉ owner của comment hoặc Admin).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Comment Owner hoặc Admin |
| **Success** | `204 No Content` |
| **Error** | `403 Forbidden`, `404 Not Found` |

---

## 6. Label Endpoints 🏷️

### `GET /api/labels`
Lấy tất cả labels.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Success** | `200 OK` → `[{ "id": 1, "name": "Bug", "color": "#ef4444" }, ...]` |

---

### `POST /api/labels`
Tạo label mới (Admin only).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Admin only |
| **Request Body** | `{ "name": "Bug", "color": "#ef4444" }` |
| **Validation** | name: required, unique, 1-50 chars. color: valid hex |
| **Success** | `201 Created` → Created label |
| **Error** | `400 Bad Request`, `409 Conflict` (name exists) |

---

### `DELETE /api/labels/{id}`
Xóa label (Admin only).

| | Chi tiết |
|---|---|
| **Auth** | ✅ Admin only |
| **Success** | `204 No Content` |
| **Error** | `403 Forbidden`, `404 Not Found` |

---

## 7. Dashboard Endpoints 📊

### `GET /api/dashboard/stats`
Lấy thống kê tổng quan cho user hiện tại.

| | Chi tiết |
|---|---|
| **Auth** | ✅ Bearer Token |
| **Success** | `200 OK` |

```json
{
  "totalProjects": 3,
  "totalTasks": 24,
  "tasksByStatus": {
    "todo": 8,
    "inProgress": 6,
    "review": 4,
    "done": 6
  },
  "tasksByPriority": {
    "low": 5,
    "medium": 10,
    "high": 7,
    "critical": 2
  },
  "upcomingDeadlines": [
    { "id": 5, "title": "Fix bug login", "dueDate": "2026-03-18", "projectName": "TaskFlow" }
  ],
  "myAssignedTasks": 12
}
```

---

## 8. Tổng hợp Endpoints

| # | Method | Endpoint | Auth | Mô tả |
|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | ❌ | Đăng ký |
| 2 | POST | `/api/auth/login` | ❌ | Đăng nhập |
| 3 | GET | `/api/auth/me` | ✅ | Thông tin user hiện tại |
| 4 | GET | `/api/users` | Admin | Danh sách users |
| 5 | PUT | `/api/users/{id}` | Owner | Cập nhật profile |
| 6 | GET | `/api/projects` | ✅ | Danh sách projects |
| 7 | GET | `/api/projects/{id}` | ✅ | Chi tiết project |
| 8 | POST | `/api/projects` | ✅ | Tạo project |
| 9 | PUT | `/api/projects/{id}` | Owner | Sửa project |
| 10 | DELETE | `/api/projects/{id}` | Owner/Admin | Xóa project |
| 11 | GET | `/api/projects/{projectId}/tasks` | ✅ | Danh sách tasks |
| 12 | GET | `/api/tasks/{id}` | ✅ | Chi tiết task |
| 13 | POST | `/api/projects/{projectId}/tasks` | ✅ | Tạo task |
| 14 | PUT | `/api/tasks/{id}` | Owner/Assignee | Sửa task |
| 15 | PATCH | `/api/tasks/{id}/status` | Owner/Assignee | Chuyển status |
| 16 | DELETE | `/api/tasks/{id}` | Owner/Admin | Xóa task |
| 17 | GET | `/api/tasks/{taskId}/comments` | ✅ | Danh sách comments |
| 18 | POST | `/api/tasks/{taskId}/comments` | ✅ | Thêm comment |
| 19 | DELETE | `/api/comments/{id}` | Owner/Admin | Xóa comment |
| 20 | GET | `/api/labels` | ✅ | Danh sách labels |
| 21 | POST | `/api/labels` | Admin | Tạo label |
| 22 | DELETE | `/api/labels/{id}` | Admin | Xóa label |
| 23 | GET | `/api/dashboard/stats` | ✅ | Dashboard thống kê |

**Tổng: 23 API endpoints**
