# SyncSpace - Meeting Scheduler SaaS

SyncSpace is a modern, production-ready SaaS application designed for managing meeting room reservations efficiently. It features a robust role-based access control (RBAC) system, an interactive scheduling dashboard, and a seamless administrative interface.

## 🏗️ Architecture & Tech Stack

This application is divided into a decoupled client-server architecture:

### Frontend
- **Framework:** React with Vite
- **Styling:** Tailwind CSS (with Shadcn/UI for accessible, reusable components)
- **State Management:** 
  - **Zustand** (for global UI states like theme, active tabs, and global business hours)
  - **TanStack Query (React Query)** (for server state, caching, and background synchronization)
- **Architecture Pattern:** Feature-Sliced Design (FSD). Code is grouped by domain (`features`, `entities`, `widgets`, `shared`) to ensure maintainability and separation of concerns as the app scales.

### Backend
- **Framework:** Node.js with Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT-based stateless authentication
- **Validation:** Zod schemas for strict request validation
- **Architecture Pattern:** Standard MVC (Model-View-Controller) separating routes, controllers, and database services.

## 🔐 Role-Based Access Control (RBAC)

The application features a strict permission model to ensure secure operations:
- **SuperAdmin:** Has total control. Can manage the system settings, create new users, modify roles, and delete accounts.
- **Admin:** Can manage infrastructure (creating/editing/deleting Meeting Rooms) and can view/cancel any meeting across the entire system.
- **Manager & Employee:** Standard users who can view the dashboard and book their own meetings. They can only edit or cancel the meetings they personally created.

## ✨ Key Features & Workflow

### 1. Interactive Dashboard (Scheduler Grid)
A visual timeline displaying all meetings for a specific date across all rooms.
- **Smart Timeline:** The timeline displays your configurable business hours (e.g., 8 AM - 9 PM), but will automatically expand if a meeting exists outside that range.
- **Real-time Drag & Drop:** Easily visualize meeting durations and overlaps.

### 2. Meeting Management
- Filter meetings by room, search by title, and sort chronologically.
- Separate tabs for **Upcoming** (active) and **Cancelled** meetings.
- Overlap detection on the backend prevents double-booking a room at the exact same time.

### 3. Settings & Administration
- **Global Settings:** Modify application-wide business hours (dynamically updating the dashboard views).
- **User Management:** Create new users and adjust their roles securely.
- **Room Management:** Add, edit, or remove physical meeting rooms.

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Database Configuration
1. Navigate to the `backend` directory.
2. Create a `.env` file (if it doesn't exist) based on the default configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://haryniel_db_user:yjUHuUyqvrCmRypY@cluster0.zjnmjzg.mongodb.net/meetingscheduler?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   ```

### 2. Running the Backend
```bash
cd backend
npm install
# Seed the initial database (creates the SuperAdmin account and 5 default rooms)
npx ts-node src/config/seed.ts 
# Start the backend development server
npm run dev
```

### 3. Running the Frontend
```bash
cd frontend
npm install
# Start the Vite development server
npm run dev
```

### 4. Logging In
Once both servers are running, access the frontend at `http://localhost:5173`.
- **Default SuperAdmin Credentials:**
  - Email: `superadmin@syncspace.com`
  - Password: `superadmin123`

You can log in with this account to begin creating your own Admin, Manager, and Employee accounts!
