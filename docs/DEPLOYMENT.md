# MAILORA.AI — DEPLOYMENT & SETUP GUIDE

## 1. Local Development Setup

### Prerequisites
- Node.js >= 18 (Tested on v22.11.0)
- npm >= 9

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials if running in **Cloud Mode**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```
*(If left empty or default, Mailora automatically runs in **Local Demo Mode** with full local inference and storage).*

### Step 3: Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to launch the application.

---

## 2. Supabase Cloud Configuration

### Step 1: Run PostgreSQL Migrations
Execute SQL migrations in your Supabase Dashboard SQL Editor (in order from `001` to `007`):
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_profiles_and_auth.sql`
- `supabase/migrations/003_campaigns.sql`
- `supabase/migrations/004_brand_kits.sql`
- `supabase/migrations/005_media_library.sql`
- `supabase/migrations/006_credit_system.sql`
- `supabase/migrations/007_rls_policies.sql`

### Step 2: Configure Supabase Secrets (Gemini API Key)
```bash
supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
```

### Step 3: Deploy Edge Functions
```bash
supabase functions deploy generate-campaign
supabase functions deploy generate-hero
supabase functions deploy rewrite-content
supabase functions deploy validate-email
supabase functions deploy api-status
```

---

## 3. Production Build & Deployment

### Build Command
```bash
npm run build
```
The optimized multi-page distribution files will be generated in `dist/`.

### Hosting Options
- **Vercel / Netlify / Cloudflare Pages**: Deploy the root folder with build command `npm run build` and output directory `dist`.
- Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in your hosting dashboard.
