# HKL Website (Minimal Starter)

Simple full‑stack app with three roles (super_admin, admin, user), MongoDB, and a tiny UI.

## Tech
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, CSV export
- Frontend: React (Vite, JavaScript), fetch API, react-router-dom
- Monorepo: npm workspaces

## Quick Start
1) Install dependencies:
```bash
cd hkl-website
npm run install-all
```
2) Configure env:
- Copy `server/.env.example` to `server/.env` and set values.
- Optionally set `client/.env` (defaults should work).

3) Run dev (server + client concurrently):
```bash
npm run dev
```
Server runs on http://localhost:5000, Client on http://5173

### Environment
**server/.env**
```
MONGO_URI=mongodb://localhost:27017/hkl
JWT_SECRET=supersecret_change_me
PORT=5000
```
**client/.env** (optional)
```
VITE_API_URL=http://localhost:5000
```

## Roles
- **super_admin**: manage all events; export all signups.
- **admin**: assigned to one city; can manage events only for that city; export signups for that city.
- **user**: view events; create personal or event-based signups.

## Pages
- Main (Login/Register + simple nav)
- Events (view; admin/super_admin can CRUD limited by city)
- Signups (submit personal or event signup; export CSV if admin/super_admin)

## Notes
- This is an intentionally simple starter (no styling beyond basic layout).
- Timestamps for signups are recorded automatically.
