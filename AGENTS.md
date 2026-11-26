<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# Infrastructure & Tech Stack (`evidcheck`)
- **Frontend / Web Portal:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui + `@base-ui/react`, `lucide-react`, `sonner`, `recharts`, `framer-motion`.
- **Typography & Palette:** **Urbanist** (`--font-sans`), brand green `#188015` (dark `#136610`), brand navy `#0E1B42` (soft `#172758`, line `#1E2D5A`).
- **Backend & Real-Time Data:** Convex (`convex/`), self-hosted staging & deployment scripts in `infra/convex/`, HTTP REST API router in `convex/http.ts`.
- **External Integrations & Compliance Engines:**
  - **Metropol CRB v3.8 (`convex/metropol.ts`, `convex/lib/metropolProfiles.ts`):** Smart Hybrid Credit Bureau integration with SHA-256 HMAC signing and AI risk brief synthesis.
  - **Gava Connect / KRA (`convex/verifications.ts`):** Tax PIN validation.
  - **Zero-Caching Policy (`convex/verifications.ts`):** Sovereign citizen demographics (IPRS/CRB) are evaluated ephemerally in memory and immediately purged (`sanitizeZeroCachePayload`); only status, match confidence, and 7-year non-PII SHA-256 audit hashes are persisted.
- **Compliance Documents:** PDF generation scripts in `scripts/` outputting signed policy & legal PDFs to root and `public/`.

# Code Structure
- `app/(auth)/`: Sign-in and token password setup (`login/page.tsx`, `setup-password/`).
- `app/dashboard/`: Tenant portal (`jobs/`, `verification/`, `team/`, `settings/`, `billing/`, `reports/`, `help/`).
- `app/admin/`: Superadmin console (`companies/` for direct organization onboarding & management, `users/`, `audit/`, `billing/`, `pricing/`, `reports/`).
- `app/terms/` & `app/privacy/`: Public legal & DPA 2019 pages.
- `app/api/v1/`: REST proxy endpoints (`lib/convex-rest-proxy.ts`).
- `components/`: Shared UI primitives (`ui/`, `layout/`, `auth/`, `dashboard/`, `admin/`, `shared/`).
- `convex/`: Schema, session auth/RBAC guards, admin onboarding, verifications engine, Metropol CRB, emails, billing, audit logs.

# Architecture & 250-Line Componentization Rule (STRICT)
Every page route MUST be fully componentized:
- Sub-components specific to a page must be placed in a local `components/` directory adjacent to the `page.tsx` file (e.g. `app/admin/companies/components/`).
- The main `page.tsx` file must be kept lean, acting primarily as an orchestrator that imports and renders these modular components.
- Shared/global components remain in `/components/ui`, `/components/layout`, or `/components/shared`.
- **250-Line Cap:** **Every React `.tsx` file MUST NOT exceed 250 lines of code.** Split large views, modals, tables, or forms into focused sub-components before crossing 250 lines.

# Onboarding & Access Control Rule
- **No Public Portal Sign-Up:** Self-serve registration is disabled in both the UI (`app/(auth)/login/page.tsx`) and backend (`convex/users.ts`).
- **Admin-Led Company Onboarding:** Organizations are onboarded directly by EvidCheck superadmins from `/admin/companies` (`api.admin.onboardCompany`), which provisions the company, initializes its balance, invites the initial corporate admin (requiring a corporate work email matching the company domain), and sends a tokenized password-setup link.
