# CPDALS

A rebuilt full-stack learning platform using React, Express, JWT authentication, and MongoDB.

## Tech stack

- Frontend: React + Vite
- Backend: Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs

## Project structure

- `src/` - React frontend
- `server/` - Express API and MongoDB models
- `entities/` - original exported reference files

## Environment setup

The app reads values from `.env`.

Minimum required values:

```env
VITE_API_BASE_URL=http://localhost:4000
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/cpdals
JWT_SECRET=change-me-before-production
```

You can also copy from `.env.example`.

## How to run from scratch

1. Open a terminal in:

```powershell
cd "C:\Users\hemanth\OneDrive\Documents\New project\CPDALS"
```

2. Install packages:

```powershell
npm install
```

3. Make sure MongoDB is running.

If you use a local MongoDB server, keep it running on `mongodb://127.0.0.1:27017`.

If you use MongoDB Atlas, replace `MONGODB_URI` in `.env` with your Atlas connection string.

4. Start the app:

```powershell
npm run dev
```

5. Open:

```text
http://localhost:5173
```

## Separate frontend/backend run

If you want them in separate terminals:

Terminal 1:

```powershell
npm run server
```

Terminal 2:

```powershell
npm run client
```

## Production build check

```powershell
npm run build
```

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `PUT /api/profile`
- `POST /api/progress`
- `POST /api/sessions`
- `GET /api/health`

## Notes

- The app seeds sample learning content automatically on first run.
- Login is required before accessing the dashboard.
- The backend is your own REST API now, not Base44.
