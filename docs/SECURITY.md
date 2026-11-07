# MAILORA.AI — SECURITY POLICY & PRACTICES

## 1. Secrets Management
- **Zero Client Secrets**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are NEVER exposed to the frontend, browser localStorage, sessionStorage, client bundles, or network query params.
- **Supabase Secrets**: Server-side secrets must strictly be configured via:
  ```bash
  supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
  ```
- **Public Keys**: Frontend only uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (Anon Key).

---

## 2. Authorization & Row Level Security (RLS)
- Every user-owned table (`profiles`, `campaigns`, `brand_kits`, `media_library`, `credit_transactions`) has RLS enabled.
- Access policies strictly enforce `auth.uid() = user_id`.
- Column-level restrictions prevent client users from modifying their credit balance or subscription plan.

---

## 3. Financial Integrity & Credit Deduction
- Client cannot update `profiles.credits`.
- All deductions occur atomically via PostgreSQL `deduct_user_credits` RPC function with `FOR UPDATE` row lock.
- Idempotency keys (`X-Idempotency-Key`) prevent double-charging on network retries.

---

## 4. XSS & Injection Prevention
- Input prompts and user content are HTML-escaped before injection into canvas or exported markup.
- `sanitizeUrl()` blocks malicious schemes like `javascript:`, `vbscript:`, and `data:` URIs.
- Anti-fabrication validator ensures AI never outputs unverified promotional promises or discount rates.
