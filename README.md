# StaffSync — Modern HR Management Solution (MERN)

A web-based HR platform built with **MongoDB, Express.js, React.js and Node.js**, with JWT authentication and three roles: **HR**, **Manager**, **Employee**.

## Features

| Module | HR | Manager | Employee |
|---|---|---|---|
| Employee management (add/edit/deactivate/delete) | ✅ | view team | — |
| Leave | review all | review team | apply, track, cancel |
| Attendance | view all | view team | check-in / check-out |
| Announcements & news | post / delete | read | read |
| Training programs | create / delete any | create for own team | view assigned, mark progress |
| Profile | ✅ | ✅ | ✅ |

## Prerequisites
Node.js v16+, npm v8+, MongoDB (local or Atlas), Postman (optional), VS Code.

## Setup

```bash
# 1. API
cd server
npm install
cp .env.example .env        # edit MONGO_URI / JWT_SECRET if needed
npm run seed                # creates demo users + a welcome announcement
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

## Demo Logins

> All accounts use password: **`password123`**

| Role | Email | Name | Department |
|---|---|---|---|
| **HR** | `hr@staffsync.com` | Hannah Rodriguez | Human Resources |
| **HR** | `priya.hr@staffsync.com` | Priya Nair | Human Resources |
| **Manager** | `manager@staffsync.com` | Mike Chen | Engineering |
| **Manager** | `rachel.mgr@staffsync.com` | Rachel Kim | Design |
| **Manager** | `david.mgr@staffsync.com` | David Okafor | Marketing |
| **Employee** | `employee@staffsync.com` | Eva Thompson | Engineering |
| **Employee** | `sam@staffsync.com` | Sam Sharma | Engineering |
| **Employee** | `lisa@staffsync.com` | Lisa Nguyen | Design |
| **Employee** | `james@staffsync.com` | James Okonkwo | Marketing |
| **Employee** | `anika@staffsync.com` | Anika Patel | Engineering |

## Project structure
```
server/
  server.js, seed.js
  middleware/auth.js        # JWT protect + role authorize
  models/                   # User, Leave, Attendance, Announcement, Training
  routes/                   # auth, users, leaves, attendance, announcements, training
client/src/
  api.js                    # axios instance with JWT interceptor
  context/AuthContext.jsx
  components/               # Navbar, Layout, ProtectedRoute
  pages/                    # Login, Dashboard, Employees, Leaves, Attendance, Announcements, Training, Profile
```

## API overview (all under `/api`, JWT `Bearer` token required except login/register)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET/POST /users`, `PUT/DELETE /users/:id` (HR), `PUT /users/me/profile`
- `POST /leaves`, `GET /leaves/mine`, `GET /leaves` (HR/manager), `PUT /leaves/:id/status`, `DELETE /leaves/:id`
- `POST /attendance/checkin`, `POST /attendance/checkout`, `GET /attendance/mine`, `GET /attendance?date=`
- `GET/POST/PUT/DELETE /announcements` (write: HR)
- `GET/POST /training`, `PUT /training/:id/progress`, `DELETE /training/:id`

## Business rules
- Self-registration only creates **employee** accounts; HR creates managers/HR users and assigns managers.
- Managers review only their direct reports' leave; manager leave goes to HR. Nobody reviews their own leave.
- Approving a paid leave deducts from the employee's leave balance (default 20 days).
- Check-in after 10:00 is marked `late`; under 4 hours worked is `half-day`.
