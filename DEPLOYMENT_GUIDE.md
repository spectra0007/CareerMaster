# CareerMaster — Deployment Guide

Deploy the frontend to **Vercel** (free) and the backend to **Render** (free tier).

---

## Step 1: Deploy the Backend on Render

1. Go to [render.com](https://render.com) and sign up / log in.
2. Click **"New" → "Web Service"**.
3. Connect your GitHub account and select the `spectra0007/CareerMaster` repository.
4. Configure the service:
   - **Name:** `careermaster-api`
   - **Region:** Oregon (or closest)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Instance Type:** `Free`
5. Add **Environment Variables** (click "Add Environment Variable" for each):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Your Supabase connection string |
   | `CLERK_SECRET_KEY` | Your Clerk secret key |
   | `CLERK_WEBHOOK_SECRET` | Your Clerk webhook secret |
   | `CLOUDINARY_CLOUD_NAME` | `dw1zcf1eq` |
   | `CLOUDINARY_API_KEY` | Your Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
   | `RESEND_API_KEY` | Your Resend API key |
   | `CLIENT_URL` | `https://your-vercel-app.vercel.app` *(update after deploying frontend)* |

6. Click **"Create Web Service"**. Render will build and deploy automatically.
7. Once deployed, copy the service URL (e.g., `https://careermaster-api-xxxx.onrender.com`).

---

## Step 2: Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in with GitHub.
2. Click **"Add New" → "Project"**.
3. Import the `spectra0007/CareerMaster` repository.
4. Configure the project:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click "Edit" and set to `client`
5. Add **Environment Variables**:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
   | `CLERK_SECRET_KEY` | Your Clerk secret key |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay test key (add later) |
   | `NEXT_PUBLIC_API_URL` | `https://careermaster-api-xxxx.onrender.com/api` *(use the Render URL from Step 1)* |

6. Click **"Deploy"**. Vercel will build and give you a live URL.

---

## Step 3: Update Cross-References

After both are deployed, you need to update two things:

1. **On Render** — Update the `CLIENT_URL` environment variable to your Vercel frontend URL (e.g., `https://careermaster.vercel.app`). This fixes CORS.
2. **On Clerk** — Go to your Clerk dashboard → Webhooks → Update the webhook endpoint URL to:  
   `https://careermaster-api-xxxx.onrender.com/api/auth/webhook`

---

## Step 4: GitHub Actions CI/CD

The CI pipeline (`.github/workflows/ci.yml`) runs automatically on every push and PR to `main`:
- **Backend job** — Installs dependencies and checks syntax
- **Frontend job** — Installs dependencies and runs `npm run build`

### Adding GitHub Secrets (for CI builds)
Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_API_URL`

---

## Auto-Deploy Pipeline

Both Vercel and Render support **automatic deployments on git push**:
- Push to `main` → Both frontend and backend redeploy automatically
- Open a PR → GitHub Actions CI runs lint/build checks
- Merge PR → Production deploy triggers

No extra setup needed — just push code and it deploys! 🚀
