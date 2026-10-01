# Gift Detective

Gift Detective is a React and Express app that recommends gifts from a recipient profile, occasion, interests, personality, and budget. Recommendations are generated from a seeded PostgreSQL gift catalog and include matching clues.

## Requirements

- Node.js 20.19+ or 22.12+
- PostgreSQL

## First-time setup

1. Install dependencies from the project root and both packages:

   ```powershell
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

2. Copy `server/.env.example` to `server/.env`. Set `DATABASE_URL` to your PostgreSQL database, choose a private `JWT_SECRET`, and keep `PORT=5000` unless you need a different port. Do not commit `.env` files.

3. Create the database named `gift_detective` (or use the database name in `DATABASE_URL`), then create its tables and seed the catalog:

   ```powershell
   npm run prisma:push --prefix server
   npm run prisma:seed --prefix server
   ```

4. Start the client and API together:

   ```powershell
   npm run dev
   ```

   The client runs at `http://localhost:5173` and the API at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm the API is responding.

## Production build

```powershell
npm run build
npm test
```

The API includes authentication, recipient and occasion management, gift catalog and quiz recommendations, and saved gifts. Guest gift investigations and the casebook also have client-side fallback storage.

## Production deployment

### Required Environment Variables

Set these in your hosting platform dashboard (do not commit secrets to Git):

| Variable | Description | Example / Note |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT signing | Minimum 32 random characters (server enforces length in production) |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Web port | `5000` (auto-assigned by Render/Railway) |
| `CORS_ORIGINS` | Allowed frontend domains | `https://gift-detective.vercel.app` or `*` |
| `VITE_API_BASE_URL` | Frontend API URL | Required only if frontend and backend are hosted on separate domains |

---

### Deployment Options

#### Option 1: Unified All-in-One Deployment (Recommended: Render / Railway)
Both the Vite frontend and Express API run as a single web service:
1. **Database**: Create a free PostgreSQL instance on [Neon](https://neon.tech), [Supabase](https://supabase.com), or Render PostgreSQL.
2. **Web Service**: Create a new Web Service pointing to this repository.
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `DATABASE_URL`, `JWT_SECRET` (>= 32 chars), `NODE_ENV=production`.
3. **Database Migration & Seeding**:
   Run in the service console / shell:
   ```bash
   npm run prisma:push --prefix server
   npm run prisma:seed --prefix server
   ```
4. Express automatically serves the built frontend from `client/dist` and the API from `/api`.

#### Option 2: Split Deployment (Vercel Frontend + Render API)
1. **Database**: Host PostgreSQL on Neon or Supabase.
2. **Backend (Render / Railway)**:
   - Root Directory: `server`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Set `CORS_ORIGINS` to your Vercel frontend URL (or `*`).
3. **Frontend (Vercel)**:
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_BASE_URL=https://<your-backend-url>/api`

#### Option 3: Vercel Multi-Service Deployment (Single Vercel Project)
Deploy both the React/Vite frontend and Express backend together under a single Vercel project with shared routing:
1. Root `vercel.json` configures both services:
   - `client`: Vite frontend serving `/(.*)`
   - `server`: Express backend routing `/api/(.*)`
2. Set Environment Variables in Vercel Project Settings:
   - `DATABASE_URL`: Hosted PostgreSQL connection string (Neon, Supabase, etc.)
   - `JWT_SECRET`: Minimum 32 random characters
3. Test locally using the Vercel CLI:
   ```bash
   vercel dev
   ```