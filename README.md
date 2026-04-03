# 📊 Finance Dashboard API

A robust, logically structured, and type-safe backend API designed to power a role-based Finance Dashboard. This system handles secure user management, financial record processing, and complex database-level data aggregation.

---

## 🎯 Architecture & Design Philosophy

This project strictly adheres to the **Controller-Service-Route** architectural pattern to ensure separation of concerns, high maintainability, and clean code organization.

* **Routes (`/routes`):** Act as the entry point, defining HTTP methods and applying middleware (Authentication, RBAC, Validation).
* **Controllers (`/controllers`):** Keep logic lean. They extract request data, call the appropriate service or Prisma query, and format the HTTP response.
* **Services (`/services`):** Encapsulate complex business logic and data aggregation (e.g., the `DashboardService`), keeping controllers completely decoupled from heavy data transformations.
* **Schemas (`/schemas`):** Centralized Zod schemas provide a single source of truth for incoming data structures, ensuring absolute type safety at the boundary layer.

## 🔐 Business Logic & Access Control

The API enforces strict Role-Based Access Control (RBAC) using JSON Web Tokens (JWT) and custom middleware.

**Roles & Permissions:**
* **`VIEWER`:** Read-only access to their dashboard summary.
* **`ANALYST`:** Can view dashboard summaries and query all historical financial records.
* **`ADMIN`:** Full lifecycle management. Can create, update, and delete records. Can view system users and toggle user account statuses.

**User Lifecycle Management:**
Accounts feature an `isActive` boolean flag. Admins can deactivate users, which immediately intercepts and rejects any future authentication attempts by that user, ensuring secure off-boarding without destroying historical relational data.

## 🗄️ Database & Data Modeling

* **Database:** SQLite (Chosen for frictionless local setup, testing, and reviewer portability).
* **ORM:** Prisma v6
* **Data Model Highlights:** * `User` (1) to `Record` (N) relational modeling.
  * Extensible Enums for `Role` (VIEWER, ANALYST, ADMIN) and `RecordType` (INCOME, EXPENSE).
  * Explicit Timestamping (`createdAt`, `updatedAt`, and transaction `date`) for accurate time-series querying.

## 🛡️ Security & Error Handling

* **Input Validation:** **Zod** acts as an impassable shield. Invalid request bodies (e.g., negative amounts, missing categories, invalid types) are intercepted at the middleware level, returning structured `400 Bad Request` errors before ever touching the controllers.
* **Secure Passwords:** Handled via `bcryptjs` hashing.
* **Graceful Failures:** Generic `500 Internal Server Error` wrappers prevent stack traces or sensitive database information from leaking to the client in production.

## 🚀 Setup & Installation

### Prerequisites
* Node.js (v18+)
* npm

### Installation Steps

1. **Install Dependencies:**
   ```bash
   npm install
   
2. **Environment Variables:**
    ```bash
    Create a .env file in the project root:

3. **Code snippet**
    ```bash
    PORT=3000
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="your_secure_jwt_secret_here"

4. **Initialize Database:**
    Sync the Prisma schema and generate the client:
     ```bash
    npx prisma db push
    npx prisma generate

5. **Start the Server:**
   ```bash
    npm run dev
    The server will start on http://localhost:3000

## 📡 API Endpoints
**👤 Authentication & Users**

    * POST /api/users - Register a new user (Body: email, password, role).
    * POST /api/auth/login - Login to receive a JWT. Rejects if isActive is false.   
    * GET /api/users - [ADMIN] Fetch all users (passwords explicitly omitted).   
    * PUT /api/users/:id/status - [ADMIN] Toggle a user's isActive status (Body: isActive: boolean).

## 💰 Financial Records
(Requires Authorization: Bearer <token>)
    
    * POST /api/records - [ADMIN] Create a new financial record.   
    * GET /api/records - [ANALYST, ADMIN] Fetch user records.
    * Supported Query Filters: ?type=INCOME, ?category=Salary, ?startDate=YYYY-MM-DD, ?endDate=YYYY-MM-DD.
    * PUT /api/records/:id - [ADMIN] Update a specific record.
    * DELETE /api/records/:id - [ADMIN] Delete a specific record.

## 📈 Dashboard Analytics
(Requires Authorization: Bearer <token>)
  GET /api/records/summary - [VIEWER, ANALYST, ADMIN] Returns a comprehensive, aggregated dataset including:
  
    * Total Income & Total Expenses  
    * Net Balance
    * Category-wise expense breakdown
    * Monthly Trends (Last 6 months chronological aggregation)
    * Recent activity feed (Last 5 transactions)

---

## 💡 Assumptions & Tradeoffs
    Registration Flow: The POST /api/users endpoint is currently public to facilitate easy testing and environment setup for this assignment. 
    In a production scenario, user creation would either default to VIEWER or be restricted entirely to an Admin-invite system.
    
    Dashboard Aggregation Strategy: Aggregation for totals and categories is pushed down to the database layer using Prisma's groupBy and _sum for maximum efficiency.
    However, the 6-month chronological trend calculation is handled in the Service layer to avoid writing raw, dialect-specific SQL (since SQLite date functions differ heavily from Postgres/MySQL). 
    This thoughtfully balances execution performance with cross-database portability.
