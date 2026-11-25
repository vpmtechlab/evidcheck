<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# Architecture & Page Componentization Rule
Every page route (e.g. `app/dashboard/help/documentation/page.tsx`, `app/dashboard/verification/page.tsx`) MUST be fully componentized:
- Sub-components specific to a page must be placed in a local `components/` directory adjacent to the `page.tsx` file (e.g. `app/dashboard/help/documentation/components/`).
- The main `page.tsx` file should be kept lean, acting primarily as an orchestrator that imports and renders these modular components.
- Shared/global components remain in `/components/ui` or `/components/layout` or `/components/shared`.

