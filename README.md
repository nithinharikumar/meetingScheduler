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

## 🖥️ User Interface & Management Guide

This guide explains how to navigate SyncSpace, manage meeting rooms, schedule bookings, and administer system settings.

### 🧭 Navigation, Filters & Settings (Sidebar & Header)
- **Top Header**:
  - **Quick Book (`+ Book` button)**: Click in the top-right corner to open the global booking dialog from any page.
  - **Keyword Search**: Type in the search input to filter meetings instantly by title.
  - **Theme Switcher**: Click the lightbulb/moon/laptop icons to cycle between Light, Dark, and System theme modes.
  - **Profile Avatar**: Click to check your account details or log out.
- **Left Sidebar**:
  - **Navigation Links**: Toggle between **Dashboard** (Timeline Scheduler grid) and **Meetings List** (tabular registry).
  - **Schedule Date**: Use the previous `‹` and next `›` buttons or click the date input to jump to a specific date. Click **TODAY** to reset.
  - **Rooms Filter**: Click on a specific room button (e.g. *Conference Room A*) to filter all views to that room. Click **All Rooms** to remove filters.
  - **Settings Navigation**: Select **Room Settings** or **User Settings** (visible to Admins/SuperAdmins) to access admin dashboards.
  - **Collapse Toggle**: Click the collapse button at the bottom of the sidebar to gain workspace screen space.

---

### 📅 Dashboard View (Timeline Scheduler)
*Provides a visual, room-by-room calendar timeline for the selected date.*
- **Viewing the Scheduler Grid**: Meetings are mapped as colored blocks under their assigned room columns. The height and vertical offset of each card corresponds to its start and end times.
- **Auto-Expanding Timeline**: The grid displays hours from your configured business hours but will auto-expand if any meeting falls outside that range.
- **Viewing Meeting Details**: Click on any meeting card to open the **Meeting Details** modal (displays meeting title, room, capacity, and exact date/time range).
- **Cancelling a Meeting**:
  - Hover over a meeting block and click the **Trash** icon in the bottom-right corner of the block.
  - Alternatively, click the meeting to open its details modal, and click **Cancel Booking**.
  - Confirm the cancel prompt to free up the room instantly.
- **Quick Booking** (Right Sidebar): Input a title, select a room (or leave on *Auto-allocate* to let the system select the first available slot), set start/end date & time, and click **Book Room**.

---

### 📝 Meetings View (Registry)
*A full tabular registry of all system bookings with advanced search, pagination, and sorting.*
- **Upcoming vs. Cancelled Tabs**: Toggle between the **Upcoming** (active reservations) and **Cancelled** tabs at the top of the table.
- **Searching and Sorting**:
  - Search by meeting title or room name using the top search bar.
  - Click column headers (**Meeting Title**, **Room Assigned**, **Time Schedule**) to sort alphabetically or chronologically.
- **Row Actions**: Click the three dots (`...`) icon at the end of any table row:
  - **View Details**: Open the metadata modal.
  - **Edit Meeting**: Opens an inline form to update the title, assigned room, or time slots.
  - **Cancel Meeting** (Upcoming only): Cancels the reservation.
- **Sidebar Booking**: Quick reservation form is pinned on the right for convenience.

---

### 🚪 Room Settings View (Room Management)
*Accessible to Admins and SuperAdmins. Allows direct modification of the office floor plan.*
- **Adding a Room**:
  - Click **`+ Add New Room`** at the top right to expand the creation panel.
  - Provide a name (e.g., *Zen Room*), capacity (seating limit, max 500), and optional description.
  - Click **Create Room** to save.
- **Inline Editing**:
  - Click the **Pencil** icon on any room row to convert it into editable input fields.
  - Modify fields directly and click the green Checkmark (**Check**) icon to save, or the red **X** to cancel.
- **Deleting a Room**:
  - Click the **Trash** icon on a room's row.
  - Confirm the deletion in the dialog. *Note: The server prevents deleting rooms with active/upcoming meetings to preserve schedule integrity.*

---

### 👥 User Settings View (Users & Global Configuration)
*Accessible to Admins and SuperAdmins. Configures global policies and controls accounts.*
- **Global Settings (Business Hours)**:
  - Modify the **Business Start Hour** and **Business End Hour** dropdowns.
  - Changing these bounds dynamically scales the timeline grids of the Dashboard Scheduler for all users.
- **Creating a User** (SuperAdmin only):
  - Click **`Add User`** in the User Management header.
  - Provide Name, Email, Password, and select their permission role (SuperAdmin, Admin, Manager, Employee).
- **Managing User Roles & Access** (SuperAdmin only):
  - Click the three dots (`...`) actions button on any user row.
  - Select **Make Admin**, **Make Manager**, or **Make Employee** to promote or demote their privileges.
  - Select **Delete User** to delete the account. Self-deletion and self-role updates are disabled for security.

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
npm run seed 
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
