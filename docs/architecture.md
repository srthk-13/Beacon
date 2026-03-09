# Beacon – System Architecture

## 1. Overview

Beacon is an AI-driven Agile Optimization Engine built using the MERN stack:

- MongoDB (Database)
- Express.js (Backend API)
- React.js (Frontend)
- Node.js (Runtime)

The system enhances Agile sprint planning using analytics and heuristic-based optimization.

---

## 2. High-Level Architecture

Frontend (React)
        ↓
REST API (Express)
        ↓
Service Layer
        ↓
MongoDB (Mongoose Models)
        ↓
Analytics + Optimization Engines

---

## 3. Backend Structure

server/src/

- config/        → DB connection & environment setup
- middleware/    → Auth & error handling
- modules/       → Feature-based modular structure
- sockets/       → Real-time updates (future use)
- utils/         → Shared utilities

Each module follows:

module/
  model.js
  routes.js
  controller.js
  service.js

---

## 4. Module Responsibilities

Auth/User:
- Authentication
- JWT handling
- Role-based access control

Project:
- Project CRUD
- Team member management

Sprint:
- Sprint lifecycle management
- Status transitions

Task:
- Task CRUD
- Kanban status updates

Analytics:
- Velocity calculation
- Sprint health scoring
- Risk estimation

Optimization:
- Priority scoring
- Capacity modeling
- Sprint composition suggestions

---

## 5. Data Flow

1. User action in frontend
2. API request to backend
3. Controller → Service
4. Database query
5. Analytics/Optimization logic (if needed)
6. Structured JSON response

---

## 6. Design Principles

- Modular architecture
- Service-controller separation
- RESTful API design
- Pure logic in analytics & optimization layers
- Consistent response format