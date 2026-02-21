# CareerMaster — Engineer Career Prep Platform

A production-ready SaaS MVP for engineering career preparation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (React), Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| Payments | Stripe |
| Video | Cloudinary |
| Email | Resend |
| Monitoring | Sentry |

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- npm
- A Supabase project (free tier)
- API keys for: Clerk, Stripe, Cloudinary, Resend, Sentry

### 1. Clone & Install

```bash
# Backend
cd server
cp .env.example .env    # Fill in your API keys
npm install

# Frontend
cd ../client
cp .env.example .env.local    # Fill in your API keys
npm install
```

### 2. Set Up Database

Run `schema.sql` in your Supabase SQL Editor to create all tables.

### 3. Run Locally

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Stripe subscription price ID |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RESEND_API_KEY` | Resend API key |
| `SENTRY_DSN` | Sentry DSN |
| `CLIENT_URL` | Frontend URL for CORS |

### Client (`client/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page path |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | — |
| POST | `/api/auth/webhook` | Clerk webhook (user sync) | Clerk |
| GET | `/api/users/me` | Get current user | ✅ |
| GET | `/api/videos` | List videos | ✅ |
| GET | `/api/videos/:id` | Get video details | ✅ + Paid |
| GET | `/api/leetcode` | List LeetCode plans | ✅ |
| PUT | `/api/leetcode/:id/progress` | Update progress | ✅ |
| POST | `/api/subscriptions/checkout` | Create Stripe checkout | ✅ |
| POST | `/api/subscriptions/webhook` | Stripe webhook | Stripe |
| POST | `/api/admin/videos` | Upload video | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| POST | `/api/admin/plans` | Create LeetCode plan | Admin |

---

## Project Structure

```
Carrermaster/
├── client/                     # Next.js frontend
│   └── src/
│       ├── app/                # App Router pages
│       ├── components/         # UI components
│       └── lib/                # Utilities & API client
├── server/                     # Express backend
│   └── src/
│       ├── config/             # Service configurations
│       ├── controllers/        # Route handlers
│       ├── middleware/         # Auth, rate limit, errors
│       ├── routes/             # Express routers
│       ├── services/           # Business logic
│       └── index.js            # Entry point
├── schema.sql                  # Database schema
└── README.md
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase |

### Vercel (Frontend)
1. Connect your GitHub repo
2. Set root directory to `client`
3. Add environment variables from `client/.env.example`

### Render (Backend)
1. Create a new Web Service
2. Set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `server/.env.example`
