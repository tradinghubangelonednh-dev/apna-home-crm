# Apna Home CRM

Apna Home CRM is a full-stack shared household expense manager for one five-member home. It includes JWT auth, equal/exact/percentage splits, real-time dashboard updates, debt simplification, settlements, recurring expenses, notifications, analytics, audit logs, and PDF/CSV export.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Charts: Recharts
- Realtime: Socket.IO

## Project Structure

```text
.
├── client
│   └── src
├── server
│   └── src
└── package.json
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally.

4. Optional: seed demo data for a ready-made five-member home:

```bash
npm run seed --workspace server
```

Demo admin:

- `aarav@example.com`
- `welcome123`

5. Run backend and frontend in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

Backend API: `http://localhost:5000/api`

Frontend app: `http://localhost:5173`

## Core Features

- JWT login/signup with bcrypt password hashing
- Single household with a five-member limit
- Equal, exact, and percentage split support
- Live balance sheet and debt simplification
- Monthly dashboard totals, contributions, and analytics
- Expense history with filters
- Settlement requests with reminders and completion tracking
- Recurring monthly expenses
- Notification center
- CSV and PDF exports
- Admin/member role separation
- Audit logs for edits, deletes, logins, and role updates

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:expenseId`
- `DELETE /api/expenses/:expenseId`
- `GET /api/settlements`
- `POST /api/settlements`
- `PATCH /api/settlements/:settlementId/complete`
- `POST /api/settlements/:settlementId/remind`
- `GET /api/recurring`
- `POST /api/recurring`
- `PUT /api/recurring/:recurringId`
- `PATCH /api/recurring/:recurringId/toggle`
- `POST /api/recurring/run`
- `GET /api/notifications`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:notificationId/read`
- `GET /api/household`
- `POST /api/household/members`
- `PATCH /api/household/members/:memberId/role`
- `GET /api/audit-logs`
- `GET /api/export/expenses.csv`
- `GET /api/export/dashboard.pdf`

## Notes

- The first signup creates the household and becomes admin.
- Later signups can join until the five-member limit is reached.
- Real-time refresh uses Socket.IO events to update clients after expense, settlement, recurring, and notification changes.
- The server is structured for HTTPS-ready deployment behind a reverse proxy.
