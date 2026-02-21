# CareerMaster — Complete Credentials Guide

To get the application fully functional, you need to sign up for 4 main free-tier services. Here is exactly what to configure.

---

## 1. Supabase (Database)
We use Supabase for PostgreSQL.
1. Sign up at [supabase.com](https://supabase.com).
2. Create a new "Project" and wait for the database to provision.
3. Go to **Project Settings → Database → Connection string (URI)**.
4. Replace `[YOUR-PASSWORD]` with the password you made during creation.
5. In `server/.env`, set:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```
6. **Important:** Go to the "SQL Editor" in Supabase, paste the contents of `schema.sql`, and click "Run" to create your tables.

---

## 2. Clerk (Authentication)
We use Clerk for handling user logins.
1. Sign up at [clerk.com](https://clerk.com).
2. Create a new "Application" (enable Email and Google login).
3. On the API Keys page, copy your keys:
   - In `client/.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...`
   - In `server/.env`: `CLERK_SECRET_KEY=sk_test_...`
4. **Setup Webhook (To sync users into your database):**
   - Go to "Webhooks" in your Clerk dashboard.
   - Click "Add Endpoint".
   - Set the URL. *(If running locally, you need a tunnel like `ngrok http 5001` → `https://<your-ngrok-url>/api/auth/webhook`)*.
   - Subscribe to the **`user.*`** events context (user.created, user.updated, user.deleted).
   - Copy the "Signing Secret" (`whsec_...`) and place it in `server/.env` as `CLERK_WEBHOOK_SECRET`.

---

## 3. Stripe (Payments & Subscriptions)
Stripe handles the premium video paywall.
1. Sign up at [stripe.com](https://stripe.com).
2. Ensure you are in "Test Mode".
3. Go to **Developers → API Keys**.
   - In `client/.env.local`: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - In `server/.env`: `STRIPE_SECRET_KEY=sk_test_...`
4. **Create a Subscription Product:**
   - Go to the "Products" tab and click "Add Product". Make it a recurring monthly subscription (e.g., $29/mo).
   - Go to the Pricing details and copy the **API ID** that starts with `price_...`.
   - In `server/.env`, set `STRIPE_PRICE_ID=price_...`
5. **Setup Webhook (To activate user's subscription in DB):**
   - If developing locally, download the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
     `stripe listen --forward-to localhost:5001/api/subscriptions/webhook`
   - It will print out a webhook signing secret (`whsec_...`).
   - In `server/.env`, set `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 4. Cloudinary (Video Hosting)
Used to host and stream the premium lecture videos securely.
1. Sign up at [cloudinary.com](https://cloudinary.com).
2. Go to your Dashboard → "Product Environment Credentials".
3. Copy your details to `server/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 5. Resend (Email) & Sentry (Monitoring) — *Optional*
Your app will still run perfectly without these (they will just gently log a warning to the console).
- **Resend:** Go to [resend.com](https://resend.com), get an API key, and put it in `server/.env` as `RESEND_API_KEY`.
- **Sentry:** Go to [sentry.io](https://sentry.io), get your DSN string, and place it in both `.env` files.
