# BE-04: Containerize Your Stack

This repository contains the completed **BE-04 Containerize Your Stack** assignment for the Backend AI Engineering track at FlyRank.

The goal of this assignment is to transition our previous A2 CRUD service from an in-memory storage module to a persistent PostgreSQL database running in Docker, started together with one command via Docker Compose.

---

## 🏗️ Architecture & Storage Swap

One of the main requirements of this assignment was proving that our layered architecture works as intended: swapping out the storage repository should **only affect one file** without modifying the service layer or route handlers.

- **Service Layer (`src/services/itemService.js`)**: Unchanged. It consumes any repository object that implements the standard CRUD interface (`findAll`, `findById`, `create`, `update`, `delete`).
- **Routes (`src/routes/itemRoutes.js`)**: Unchanged. Handles HTTP request parsing and response formatting.
- **Repository Layer**:
  - `src/repositories/memoryRepository.js`: The original in-memory array store from A2.
  - `src/repositories/postgresRepository.js`: The new repository executing parameterized queries against PostgreSQL via `pg.Pool`.
- **Dependency Injection (`src/app.js`)**: Selects the repository based on the `STORAGE_TYPE` environment variable (defaults to `postgres`).

---

## 📁 Repository Structure

```text
.
├── .env.example              # Sample environment variables (committed)
├── .env                      # Local secrets & DB connection string (gitignored)
├── .gitignore                # Excludes node_modules, .env, and build artifacts
├── Dockerfile                # Multi-stage container definition for Node.js app
├── docker-compose.yml        # Orchestrates Node app + PostgreSQL database
├── init.sql                  # Database schema & initial seeding SQL script
├── package.json              # App dependencies (express, pg, dotenv)
├── README.md                 # Assignment documentation & verification steps
└── src/
    ├── app.js                # App setup & dependency injection
    ├── db.js                 # PostgreSQL client pool configuration
    ├── index.js              # Server entry point
    ├── repositories/
    │   ├── memoryRepository.js   # In-memory data store
    │   └── postgresRepository.js # PostgreSQL data store
    ├── routes/
    │   └── itemRoutes.js     # REST API endpoints
    └── services/
        └── itemService.js    # Business logic layer
```

---

## 🚀 Environment & Setup

### 1. Environment Configuration
Copy the `.env.example` template to `.env`:

```bash
cp .env.example .env
```

The `.env` file contains:
- Database credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
- Connection strings (`DATABASE_URL`)
- Application configuration (`PORT`, `STORAGE_TYPE`)

*Note: `.env` is listed in `.gitignore` to prevent committing secrets to version control.*

### 2. Starting the Stack
Run the entire stack (Node.js API + PostgreSQL database with mounted volume) using Docker Compose:

```bash
docker compose up --build
```

To run in detached mode:
```bash
docker compose up -d --build
```

---

## 🧪 How Persistence Was Tested & Proven

Data persistence was verified across container and application restarts using the steps below.

### Step 1: Verify Initial Seeding
When the database container starts for the first time, `init.sql` automatically populates default records.

```bash
curl http://localhost:3000/api/items
```
**Output:** Contains the initial seeded rows.

### Step 2: Create a New Item
Insert a new item into PostgreSQL:

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title": "Persistence Test Item", "description": "Testing Docker volume persistence", "status": "completed"}'
```
**Output:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Persistence Test Item",
    "description": "Testing Docker volume persistence",
    "status": "completed",
    "created_at": "2026-08-01T09:15:00.000Z",
    "updated_at": "2026-08-01T09:15:00.000Z"
  }
}
```

### Step 3: Stop and Destroy the Containers
Stop and remove all running containers:

```bash
docker compose down
```

### Step 4: Restart the Stack
Bring the stack back up:

```bash
docker compose up -d
```

### Step 5: Confirm Data Persistence
Fetch all items again to verify that item ID `3` survived container destruction:

```bash
curl http://localhost:3000/api/items
```

**Result:** Item `3` ("Persistence Test Item") is still present in the response. Because PostgreSQL data is stored in the Docker volume `postgres_data`, data persists even when containers are stopped, removed, or rebuilt.
