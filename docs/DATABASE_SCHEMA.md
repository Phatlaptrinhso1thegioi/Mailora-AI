# MAILORA.AI — DATABASE & STORAGE SCHEMA

Database: Supabase PostgreSQL with Row Level Security (RLS).

---

## 1. Tables

### `public.profiles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID |
| `email` | TEXT | NOT NULL, UNIQUE | User Email |
| `full_name` | TEXT | | Display Name |
| `avatar_url` | TEXT | | Avatar URL |
| `plan` | TEXT | NOT NULL, DEFAULT 'FREE' | Plan tier |
| `credits` | INTEGER | NOT NULL, DEFAULT 50, CHECK (credits >= 0) | Real Credit Balance |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |

### `public.campaigns`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Campaign ID |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) | Owner ID |
| `brand_name` | TEXT | NOT NULL | Brand Name |
| `campaign_name`| TEXT | NOT NULL | Campaign Name |
| `prompt` | TEXT | | Original Prompt |
| `art_direction`| TEXT | | Art Direction |
| `subject` | TEXT | | Email Subject |
| `preheader` | TEXT | | Preheader Text |
| `image_url` | TEXT | | Hero Image URL |
| `user_cta_url` | TEXT | DEFAULT '#' | CTA URL |
| `selected_index`| INTEGER | NOT NULL, DEFAULT 0 | Active Variant Index |
| `structured_data`| JSONB | DEFAULT '{}'::jsonb | Full AI Output JSON |
| `variants` | JSONB | DEFAULT '[]'::jsonb | 4 Design Variants JSON |
| `generated_html`| TEXT | | Production Table HTML |
| `status` | TEXT | NOT NULL, DEFAULT 'saved' | Status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |

### `public.brand_kits`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Brand Kit ID |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) | Owner ID |
| `brand_name` | TEXT | NOT NULL | Brand Name |
| `primary_color`| TEXT | NOT NULL, DEFAULT '#6655E8' | Primary Hex |
| `secondary_color`| TEXT | NOT NULL, DEFAULT '#F7F6FC' | Secondary Hex |
| `card_color` | TEXT | NOT NULL, DEFAULT '#FFFFFF' | Card Background |
| `heading_font` | TEXT | NOT NULL, DEFAULT 'Plus Jakarta Sans'| Heading Typography |
| `body_font` | TEXT | NOT NULL, DEFAULT 'Plus Jakarta Sans'| Body Typography |
| `cta_radius` | TEXT | NOT NULL, DEFAULT '12px' | Button Corner Radius |
| `cta_url` | TEXT | DEFAULT '#' | Default CTA URL |
| `brand_data` | JSONB | DEFAULT '{}'::jsonb | Additional Brand Data |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |

### `public.media_library`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Media Item ID |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) | Owner ID |
| `name` | TEXT | NOT NULL | Media File Name |
| `storage_path` | TEXT | NOT NULL | Path in Storage Bucket |
| `type` | TEXT | NOT NULL, DEFAULT 'upload' | 'upload' \| 'ai' \| 'brand' |
| `mime_type` | TEXT | | MIME type |
| `file_size` | BIGINT | | Size in Bytes |
| `metadata` | JSONB | DEFAULT '{}'::jsonb | Metadata |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |

### `public.credit_transactions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Transaction ID |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) | User ID |
| `amount` | INTEGER | NOT NULL | Positive (grant) or Negative (deduct)|
| `transaction_type`| TEXT | NOT NULL | 'INITIAL_GRANT' \| 'AI_GENERATION' \| 'HERO_GENERATION' \| 'REFUND' |
| `reference_id` | TEXT | | Request or Campaign ID |
| `idempotency_key`| TEXT | UNIQUE | Deduplication Key |
| `description` | TEXT | | Description |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |

---

## 2. PostgreSQL Functions

### `deduct_user_credits(p_amount, p_transaction_type, p_reference_id, p_idempotency_key)`
- Declared with `SECURITY DEFINER`.
- Executes `SELECT ... FOR UPDATE` on `profiles`.
- Ensures caller is `auth.uid()`.
- Rejects requests if balance is insufficient.
- Inserts audit record into `credit_transactions`.
- Returns new credit balance.

---

## 3. Storage Bucket: `campaign-media`
- Paths:
  - `{user_id}/uploads/`: User uploaded brand images.
  - `{user_id}/generated/`: AI generated hero imagery.
  - `{user_id}/brand/`: Logos and icon marks.
- Access: RLS enforced. Users can only write/delete files under their own `{user_id}/*` prefix.
