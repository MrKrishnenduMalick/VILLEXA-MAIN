# DIGITAL SHOWROOM — CLIENT ONBOARDING & CLONING GUIDE

This master repository provides an architecture for deploying independent, high-end digital showrooms. Each client deployment operates as a **fully isolated single-tenant application** with its own repository, database, storage buckets, authentication directory, and domain.

---

## 1. Architectural Isolation Model

To guarantee that one client's configuration, media, catalog, or traffic can never affect another client:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Client A Installation       │       │     Client B Installation       │
│  - Independent Git Repository   │       │  - Independent Git Repository   │
│  - clientConfig.ts: "AURELIA"   │       │  - clientConfig.ts: "VILLEXA"   │
│  - Dedicated .env / Domain      │       │  - Dedicated .env / Domain      │
└───────────────┬─────────────────┘       └───────────────┬─────────────────┘
                │                                         │
                ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│  Client A Supabase Project      │       │  Client B Supabase Project      │
│  - Dedicated PostgreSQL DB      │       │  - Dedicated PostgreSQL DB      │
│  - Independent auth.users       │       │  - Independent auth.users       │
│  - Isolated Storage Buckets     │       │  - Isolated Storage Buckets     │
│  - Strict RLS & Admin Allowlist │       │  - Strict RLS & Admin Allowlist │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

* **No Multi-Tenant Shared State:** No client shares database tables, API keys, storage buckets, or session tokens with another client.
* **Declarative Configuration:** All client-specific branding, colors, contact details, social links, and feature flags are managed in a single typed configuration file: [`src/config/clientConfig.ts`](file:///d:/$1b/furniture-demo/src/config/clientConfig.ts), with optional `.env` overrides.
* **Component De-hardcoding:** Core components (Header, Footer, Navigation, Catalog, Product Detail, Admin Portal) consume the reactive `useClientConfig()` hook and dynamically adjust without template code changes.

---

## 2. Step-by-Step Client Onboarding

### Step 1: Clone or Copy the Master Repository

Create a fresh Git repository for the new client:

```bash
# Clone the master template into a client-specific repository directory
git clone <MASTER_REPO_URL> client-showroom-app
cd client-showroom-app

# Re-initialize Git for the client's isolated repository
rm -rf .git
git init
git add .
git commit -m "feat: inaugural digital showroom foundation for client"

# Install project dependencies
npm install
```

---

### Step 2: Configure Client Identity & Feature Flags

Open [`src/config/clientConfig.ts`](file:///d:/$1b/furniture-demo/src/config/clientConfig.ts) or copy `.env.example` to `.env.local` to specify client details:

```bash
cp .env.example .env.local
```

#### Client Configuration Parameters:

| Setting | Description | Example |
| :--- | :--- | :--- |
| `brand.brandName` | Client trade or atelier name | `"AURELIA"` |
| `brand.tagline` | Editorial tagline / sub-brand | `"Nordic Architectural Joinery"` |
| `brand.badge` | Heritage badge displayed in footer | `"GENÈVE • EST. 1974"` |
| `brand.logoText` | Text logo displayed in header & admin | `"AURELIA"` |
| `brand.logoImageUrl` | Optional path or URL to SVG / PNG logo | `"/brand/aurelia-logo.svg"` |
| `contact.contactEmail` | Concierge & quotation recipient | `"concierge@aurelia.ch"` |
| `contact.contactPhone` | Flagship telephone | `"+41 22 819 3000"` |
| `contact.whatsappNumber` | Numerical WhatsApp phone (for `wa.me`) | `"41228193000"` |
| `contact.showroomAddress` | Physical atelier / flagship address | `"Rue du Rhône 42, 1204 Genève"` |
| `theme.accentColor` | Primary brand accent color (hex) | `"#c5a059"` |
| `theme.bgPrimary` | Showroom canvas background | `"#f9f7f4"` |
| `theme.bgDark` | Dark contrast sections background | `#121211` |

#### Feature Flag Matrix (`features`):

Toggle modules on or off depending on the client's subscription or media readiness:

```typescript
features: {
  enable3DViewer: true,           // Interactive Three.js WebGL GLB viewer
  enable360Turntable: true,       // Interactive 360-degree photographic scrub
  enableShowroomVideo: false,     // Cinematic video walkthrough section
  enableBespokeInquiry: true,     // Custom atelier commission inquiry forms
  enablePriceDisplay: true,       // Display numeric pricing (false = "Price Upon Request")
  enableCollections: true,        // Curated room/style collections
  enableInspirationRooms: true,   // High-concept living spaces showcase
  enableCraftsmanshipStory: true  // Heritage & atelier cabinetmaking story
}
```

---

### Step 3: Provision a Dedicated Supabase Project

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and create a **New Project**.
2. Select an appropriate cloud region close to the client's primary market (e.g., `eu-central-1` for Europe, `us-east-1` for North America).
3. Set a strong, secure database password and save it in your agency password manager.
4. From **Project Settings -> API**, copy:
   - **Project URL** (e.g. `https://xyzclient.supabase.co`)
   - **anon / public key** (JWT token)

Add these to the client's `.env.local`:

```env
VITE_SUPABASE_URL=https://xyzclient.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!CAUTION]
> **NEVER** expose the `service_role` key in `.env.local` or any frontend file. The client application only requires the public `anon` key. All administrative access is authenticated through RLS allowlists.

---

### Step 4: Run Database Migrations & Security Policies

1. In the client's Supabase dashboard, navigate to the **SQL Editor**.
2. Open [`supabase/migrations/001_complete_schema_and_security.sql`](file:///d:/$1b/furniture-demo/supabase/migrations/001_complete_schema_and_security.sql) from this project.
3. Paste the contents into the SQL Editor and click **Run**.

This migration script automatically provisions:
* Core database tables: `categories`, `collections`, `products`, `product_media`, `site_settings`, `enquiries`.
* Strict Row Level Security (RLS) policies ensuring public visitors can only read published content and cannot read customer enquiries.
* Helper function `is_admin()` with search path pinning.
* Five private and public storage buckets:
  - `atelier-vault` (Private, admin-only access)
  - `product-images` (Public read, admin write)
  - `product-models` (Public read, admin write)
  - `showroom-videos` (Public read, admin write)
  - `360-sequences` (Public read, admin write)

---

### Step 5: Provision Initial Client Administrator

Administrative access uses an **explicit allowlist** in the `app_admins` table. Follow these steps:

1. In the Supabase Dashboard, navigate to **Authentication -> Users**.
2. Click **Add User -> Create User**:
   - Email: `admin@clientdomain.com`
   - Password: `<TemporarySecurePassword>`
   - Confirm user email: **Check the box** (auto-confirm).
3. Copy the newly created user's **User UID** (UUID).
4. Go to the **SQL Editor** and run:

```sql
INSERT INTO app_admins (user_id, email, role)
VALUES ('<PASTE_USER_UUID_HERE>', 'admin@clientdomain.com', 'admin');
```

5. Confirm authorization:

```sql
SELECT * FROM app_admins;
```

---

### Step 6: Execute the Preflight Configuration Check

Before running the application or building for production, run the preflight verification command:

```bash
npm run validate:config
```

The script will verify:
- Required branding fields are populated.
- Contact email is syntactically valid.
- WhatsApp number contains sufficient numerical digits for direct chat links.
- Hex color codes are valid.
- Supabase credentials match required formats and do not expose service-role secrets.

---

### Step 7: Verify Locally

Run the development server and automated test suites:

```bash
# Run unit tests (client configuration, security policies, services)
npm test

# Run TypeScript typecheck
npm run typecheck

# Launch local preview
npm run dev
```

Navigate to `http://localhost:5173/admin` and log in with the administrator credentials created in Step 5.

---

### Step 8: Upload Client Catalogue & Assets via Admin Dashboard

Once logged in to `/admin`:
1. **Atelier Categories:** Create furniture categories (e.g., *Architectural Seating*, *Monolithic Tables*, *Storage & Credenzas*).
2. **Collections:** Create thematic seasonal collections (e.g., *Autumn Atelier 2026*).
3. **Products:** Add furniture pieces, specifications (materials, dimensions, seat heights), and set price visibility.
4. **Media & Models:**
   - Upload high-resolution editorial photography.
   - Upload `.glb` 3D models (the Three.js viewport will automatically frame and render them).
   - Upload 360-degree image frames for the photographic turntable.
5. **Publish:** Set product status to `published` when ready to appear on the public storefront.

---

### Step 9: Production Build & Deployment

Build the optimized static assets:

```bash
npm run build
```

The `build` script runs the preflight validator, verifies TypeScript types, and compiles the production bundle to `dist/`.

#### Deployment Targets:
- **Vercel:** Import Git repository, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Project Environment Variables, framework preset: `Vite`.
- **Netlify:** Connect repository, set build command `npm run build`, publish directory `dist/`.
- **Cloudflare Pages:** Build command `npm run build`, output directory `dist/`.
- **Docker / Nginx:** Serve `dist/` with standard SPA fallback routing (`try_files $uri $uri/ /index.html;`).

---

## 3. Maintenance & Client Updates

- **Updating Brand Details Post-Launch:** The client administrator can update the trade name, contact details, showroom address, and visiting hours directly from `/admin/settings` without code redeployments.
- **Upgrading the Core Template:** Because client configuration is centralized in `clientConfig.ts` and data is stored in Supabase, updates to core Three.js viewers or UI components can be cherry-picked from the master template cleanly.
