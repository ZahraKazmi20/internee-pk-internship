# Intern Progress Tracking System (MERN)

A full-stack system to manage and track intern progress, built for the internee.pk MERN Stack Development internship project.

## Features
- **Admin Dashboard**: onboard interns, assign tasks with deadlines/priority, review submissions, approve/reject with feedback, remove interns, full CRUD on tasks and intern profiles.
- **Intern Dashboard**: view assigned tasks, update progress in real time, submit completed work (notes + link), view feedback from admin.
- **Auth**: JWT-based login, role-based access (admin vs intern), passwords hashed with bcrypt.
- **Database**: MongoDB via Mongoose — `User` (admin/intern profiles) and `Task` (assignment, progress, submission, feedback) collections.

## Tech Stack
- Frontend: React 18 + Vite + React Router + Axios
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JSON Web Tokens (JWT) + bcrypt

## Project Structure
```
intern-tracker/
  backend/      Express API, MongoDB models, JWT auth
  frontend/     React app (Vite)
```

## Setup & Run Locally

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (or a free MongoDB Atlas cluster) — get a connection string.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend
Open a second terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 4. First-time use
1. Go to `http://localhost:5173/setup-admin` and create the first admin account (works only once).
2. Log in as admin → onboard intern accounts (sets their email + temporary password).
3. Admin assigns tasks to interns with deadlines.
4. Interns log in at `/login` with the email/password the admin gave them, update progress, and submit work.
5. Admin reviews submissions and approves/rejects with feedback.

## Pushing to GitHub
```bash
cd intern-tracker
git init
git add .
git commit -m "Intern Progress Tracking System - MERN stack"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

## Deploying (optional, for a live demo link)
- **Backend**: Render, Railway, or Cyclic (free tiers) — set the same env vars as `.env`.
- **Frontend**: Vercel or Netlify — set `VITE_API_URL` to your deployed backend URL.
- **Database**: MongoDB Atlas free cluster — use its connection string as `MONGO_URI`.

## Notes for submission
- This satisfies the deliverables: React frontend (admin + intern dashboards), Node/Express backend with CRUD for profiles/tasks/progress, MongoDB storage for intern data, feedback, and deadlines, admin login + onboarding, and real-time progress tracking via the progress slider and submission workflow.
