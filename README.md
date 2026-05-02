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

## Deploy Publicly

This project is prepared for a split deployment:

- Frontend on GitHub Pages
- Backend on Render
- Database on MongoDB Atlas

### 1. Push the repo to GitHub

Create a new GitHub repository and push this project to the `main` branch.

### 2. Create MongoDB Atlas

1. Create a free Atlas cluster.
2. Create a database user.
3. Add an IP access rule for the service that will connect to Atlas.
4. Copy your application connection string.

Put that connection string aside for Render as `MONGODB_URI`.

### 3. Deploy the backend to Render

This repo includes a [render.yaml](/Users/amamdanish/Documents/Codex/2026-05-01/build-a-full-stack-web-application/render.yaml) Blueprint for the backend service.

1. In Render, create a new Blueprint or Web Service from your GitHub repo.
2. If you use the Blueprint, Render will read `render.yaml`.
3. Set the required environment variables:
   - `MONGODB_URI`
   - `CLIENT_URLS`
4. Render will generate `JWT_SECRET` automatically from the Blueprint.
5. After deploy, copy the backend URL, for example:
   - `https://apna-home-crm-api.onrender.com`

### 4. Configure GitHub repository variables

In GitHub, open:

`Settings -> Secrets and variables -> Actions -> Variables`

Create these repository variables:

- `VITE_API_URL`
  - Example: `https://apna-home-crm-api.onrender.com/api`
- `VITE_SOCKET_URL`
  - Example: `https://apna-home-crm-api.onrender.com`
- `VITE_BASE_PATH`
  - Use `/<repo-name>/` for normal GitHub Pages project sites
  - Use `/` if you later connect a custom domain

### 5. Enable GitHub Pages

1. In GitHub, open `Settings -> Pages`.
2. Under Build and deployment, choose `GitHub Actions`.
3. The included workflow at [.github/workflows/deploy-pages.yml](/Users/amamdanish/Documents/Codex/2026-05-01/build-a-full-stack-web-application/.github/workflows/deploy-pages.yml) will build and publish the frontend on pushes to `main`.

### 6. Update Render CORS after Pages URL exists

After GitHub Pages publishes, your frontend URL will usually be:

- `https://<github-username>.github.io/<repo-name>/`

Set Render `CLIENT_URLS` to the frontend origin without the trailing slash path duplication pattern:

- `https://<github-username>.github.io`

If you want to allow only this project site and keep things simple, use:

- `https://<github-username>.github.io`

If you later add a custom domain, include both origins separated by commas:

- `https://<github-username>.github.io,https://yourdomain.com`

### 7. Redeploy backend, then test signup/login

1. Redeploy the Render backend after setting `CLIENT_URLS`.
2. Open the GitHub Pages URL.
3. Create the first account. That user becomes the household admin.
4. Add the remaining members from the Members tab or let them sign up until the five-member limit is reached.

### Optional custom domain

If you connect a custom domain to GitHub Pages:

1. Set `VITE_BASE_PATH=/`
2. Add your custom domain origin to `CLIENT_URLS`
3. Re-run the GitHub Pages workflow
4. Redeploy the Render backend

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
