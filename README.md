# 🚀 TaskFlow — Task Management System

<p align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <b>A full-stack task management system built with ASP.NET Core 8 + React 18</b><br/>
  <i>Clean Architecture • JWT Auth • RESTful API • Kanban Board • Docker Ready</i>
</p>

---

## 📋 Overview

**TaskFlow** is a web-based task management application for individuals and small teams. Users can create projects, manage tasks with Kanban-style status workflow, assign tasks, track progress, and collaborate through comments.

### ✨ Key Features
- 🔐 **Authentication** — Register/Login with JWT token
- 📁 **Project Management** — Create and manage multiple projects
- ✅ **Task Management** — CRUD with status flow (Todo → In Progress → Review → Done)
- 📊 **Kanban Board** — Visual board with 4 columns and status transitions
- 👥 **Task Assignment** — Assign tasks to team members
- 🏷️ **Labels** — Categorize tasks (Bug, Feature, Improvement...)
- 💬 **Comments** — Discuss task details with real-time updates
- 📈 **Dashboard** — Visual statistics with status & priority charts
- 🔍 **Search & Filter** — Find tasks by status, priority, keyword
- 📄 **Pagination & Sorting** — Efficient data loading

---

## 🏗️ Architecture

This project follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────────┐
│           TaskFlow.API                       │  ← Presentation Layer
│     Controllers, Middlewares, Filters        │
├─────────────────────────────────────────────┤
│         TaskFlow.Application                 │  ← Business Logic
│     Services, DTOs, Validators, Mappings     │
├─────────────────────────────────────────────┤
│           TaskFlow.Domain                    │  ← Domain Layer
│     Entities, Enums, Interfaces              │
├─────────────────────────────────────────────┤
│       TaskFlow.Infrastructure                │  ← Data Access
│     EF Core, Repositories, Migrations        │
└─────────────────────────────────────────────┘
```

### Design Patterns Used
- **Repository Pattern** — Data access abstraction
- **Unit of Work** — Transaction management
- **Dependency Injection** — Built-in ASP.NET Core DI
- **DTO Pattern** — Separate domain from API contracts
- **Strategy Pattern** — Extensible business logic

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | ASP.NET Core 8 Web API |
| **ORM** | Entity Framework Core 8 |
| **Database** | SQL Server |
| **Auth** | JWT Bearer Token |
| **Validation** | FluentValidation |
| **Mapping** | AutoMapper |
| **Testing** | xUnit + Moq + FluentAssertions |
| **API Docs** | Swagger / Swashbuckle |
| **Frontend** | React 18 + Vite |
| **UI Library** | Ant Design |
| **HTTP Client** | Axios |
| **Container** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
taskflow-app/
├── .github/workflows/         # CI/CD pipeline
├── docs/                      # Project documentation
│   ├── SRS.md                 # Software Requirements Specification
│   ├── API_Design.md          # API endpoints design
│   ├── Database_Design.md     # Database schema
│   └── diagrams/              # Architecture & UML diagrams
├── src/
│   ├── TaskFlow.API/          # Web API project
│   ├── TaskFlow.Application/  # Business logic
│   ├── TaskFlow.Domain/       # Domain entities
│   ├── TaskFlow.Infrastructure/ # Data access
│   └── TaskFlow.Tests/        # Unit tests (21 test cases)
├── client/                    # React frontend (Vite + Ant Design)
│   └── src/
│       ├── api/               # Axios API modules
│       ├── components/        # Reusable components
│       ├── contexts/          # React Context (Auth)
│       └── pages/             # Page components
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or LocalDB)
- [Docker](https://www.docker.com/) (optional)

### Run Backend
```bash
# Clone the repository
git clone https://github.com/huuanh20/taskflow-app.git
cd taskflow-app

# Restore packages & run migrations
dotnet restore src/TaskFlow.API/TaskFlow.API.csproj
dotnet ef database update --project src/TaskFlow.Infrastructure --startup-project src/TaskFlow.API

# Run the API
dotnet run --project src/TaskFlow.API
# API available at: https://localhost:5001
# Swagger UI: https://localhost:5001/swagger
```

### Run Frontend
```bash
cd client
npm install
npm run dev
# App available at: http://localhost:5173
```

### Run with Docker
```bash
docker-compose up --build
```

---

## 📊 API Documentation

Full API documentation is available at `/swagger` when running the backend.

See [docs/API_Design.md](docs/API_Design.md) for detailed endpoint specifications.

**Summary:** 23 RESTful API endpoints covering Auth, Users, Projects, Tasks, Comments, Labels, and Dashboard.

---

## 🧪 Running Tests
```bash
dotnet test src/TaskFlow.Tests --verbosity normal
# 21 test cases: ProjectService (4), TaskService (8), StatusTransition (9)
```

---

## 📝 Documentation

| Document | Description |
|---|---|
| [SRS](docs/SRS.md) | Software Requirements Specification (IEEE 830) |
| [API Design](docs/API_Design.md) | 23 API endpoints with request/response specs |
| [Database Design](docs/Database_Design.md) | Schema, business rules, seed data |
| [Diagrams Guide](docs/Architecture_Diagrams_Guide.md) | Architecture, ERD, Use Case, Sequence diagrams |
| [Future Roadmap](docs/Future_Roadmap.md) | Planned features: AI, SignalR, Docker, WPF |

---

## 🗺️ Roadmap

- [x] Documentation (SRS, API Design, Database Design)
- [x] Backend — Authentication (JWT)
- [x] Backend — Project & Task CRUD
- [x] Frontend — React SPA with Kanban Board
- [x] Unit Testing (21 test cases)
- [x] CI/CD with GitHub Actions
- [ ] Docker containerization (Dockerfile ready)
- [ ] Cloud deployment
- [ ] 🤖 AI Integration (OpenAI/Gemini)
- [ ] Real-time updates (SignalR)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**James Nguyen**
- GitHub: https://github.com/huuanh20
- Email: Anhnhx4@gmail.com

---

<p align="center">
  Made with ❤️ for learning and portfolio purposes
</p>
