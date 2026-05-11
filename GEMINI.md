# Developer & AI Agent Guidelines (GEMINI.md)

Welcome to the **Cafe Services** codebase. This document outlines the absolute development standards, architectural rules, and design philosophies that both human engineers and agentic AI systems (like Gemini, Claude, etc.) **must strictly follow** to maintain project stability, prevent performance leaks, and preserve visual excellence.

---

## 🐋 1. Docker & Containerization Rules

*   **Dev Command:** Local development must be run using:
    ```bash
    docker compose -f docker-compose.dev.yml up --build
    ```
*   **Prod Command:** Production testing/deployment must be run using:
    ```bash
    docker compose up --build
    ```
*   **Host-Container Isolation:**
    *   Do not mix host package installations with Docker container cache. If you install dependencies locally on the host, always restart docker containers with `--build` to regenerate dependencies inside the Linux Alpine environment.
    *   Never hardcode local host IP addresses. Use the service names (e.g., `postgres`) as the hostnames inside the Docker virtual network.
*   **Port Conflicts:** Always verify that port `3000` (development) or `3001` (production) are not being allocated by standard host processes before launching containers.

---

## 🗄️ 2. Database & Prisma ORM Standards

*   **Prisma Client Singleton:**
    *   **CRITICAL RULE:** Never instantiate `PrismaClient` directly in route handlers or server actions (e.g., `const prisma = new PrismaClient()`). Doing so under Next.js hot-reloads causes database connection pool exhaustion and crashes the DB.
    *   **Always import the singleton client** from `@/lib/prisma` (located at [`src/lib/prisma.ts`](file:///d:/Projects/current/cafe-services/src/lib/prisma.ts)).
*   **Schema Modifications:**
    *   When editing [`prisma/schema.prisma`](file:///d:/Projects/current/cafe-services/prisma/schema.prisma), always run `npx prisma generate` to re-compile typing definitions.
    *   **Binary Targets:** Always ensure `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` is maintained in the generator block of the schema to avoid native binary loading crashes in the Alpine Linux runner.
*   **Migration Safeties:**
    *   During active prototyping/development, use `npx prisma db push` inside development containers for rapid database schema synchronization.
    *   For production environments, only apply schema changes via `npx prisma migrate deploy` (non-destructive) to ensure transactions and database integrity.

---

## 🔔 3. Real-Time Stream (SSE) Stability Rules

Our real-time notification engine operates on a native **Server-Sent Events (SSE)** architecture coupled with an in-memory NodeJS `EventEmitter`.

*   **Route Caching Prevention:**
    *   All SSE route handlers (like [`src/app/api/notifications/stream/route.ts`](file:///d:/Projects/current/cafe-services/src/app/api/notifications/stream/route.ts)) must have:
        ```typescript
        export const dynamic = "force-dynamic";
        ```
        to explicitly prevent Next.js from statically generating or caching the stream endpoint at build-time.
*   **Memory Leak Prevention (CRITICAL):**
    *   Whenever you subscribe to the global `EventEmitter` (`notificationEmitter`) inside an active stream, **you must unsubscribe** on request abortion or connection failure.
    *   Always wrap your cleanup handlers in `req.signal.addEventListener("abort", () => { ... })` and call `emitter.off("event", callback)`. Failing to do so creates catastrophic memory leaks.
*   **Network Timeouts:**
    *   Always include a background ping interval (every 20 seconds) writing `: ping\n\n` to the stream to prevent proxy servers (Nginx, Cloudflare, AWS load-balancers) from closing idle connections.
*   **Bilingual Simulators:**
    *   Always maintain a simple testing fallback GET route in `/api/notifications/create` to allow developers to trigger notifications via plain browser URLs for quick validation.

---

## 💾 4. File Upload & Media Persistence

*   **Persistent Directories:** All user uploads (like images, beverages icons, etc.) must be written to [`public/uploads/`](file:///d:/Projects/current/cafe-services/public/uploads/).
*   **Docker Volumes mapping:** Ensure `/app/public/uploads` is mapped to a dedicated persistent volume (`uploads_data_prod` / `uploads_data_dev`) inside Docker Compose.
*   **Directory Integrity:** Never delete [`public/uploads/.gitkeep`](file:///d:/Projects/current/cafe-services/public/uploads/.gitkeep). This file pre-creates the folder structure on host and prevents Docker from creating a root-owned folder inside the container.

---

## 🎨 5. Tailwind CSS & Visual Excellence Guidelines (Material You Spec)

*   **Vibrant Dark Theme:** The project is styled as a premium dark-mode application using an ultra-dark background `#07080a`. All additional panels, buttons, and text should adhere to high-contrast grey scales and neon gradients.
*   **Material You Color Harmonization:** All active states, interactive controls, notification highlights, alert containers, and primary icons must be unified and harmonized around **a single primary key color** (e.g., Coffee Amber `#fbbf24`). Avoid introducing conflicting color families (e.g., multiple different green/red/blue buttons) to maintain absolute brand cohesiveness.
*   **Material 3 Rounded Shapes:** Use heavily-rounded boundaries to comply with the official Material Design 3 spec:
    *   **Extra Large (28px):** Use `rounded-[28px]` on main hero cards, large dashboards, and interactive grid containers.
    *   **Large (20px - 24px):** Use `rounded-[20px]` to `rounded-[24px]` for menu dropdowns, modal drawers, and pop-up snackbars/toasts.
    *   **Full (Pills):** Use `rounded-full` for buttons, text tags, status indicators, and notification badges.
*   **Tonal Surface Elevation:** Replicate M3 dark surface depth using progressive elevation-tints instead of dark shadows alone. To preserve readability at low screen brightness levels (e.g., 5%), use distinct surface slate contrasts:
    *   *Baseline Surface:* Matte deep black `#07080a`.
    *   *Surface Container (Cards):* High-contrast dark-slate `#131522` (avoid dark near-black to prevent container flattening).
    *   *Elevated Overlay (Menus/Toasts):* Highly-defined charcoal `#121318` or `#131522` with explicit borders (`border-white/15` or `border-amber-500/40`).
*   **Accessibility Outlines:** Never rely solely on color shading to separate layout blocks. Always reinforce boundaries with solid high-contrast borders (e.g., `border-white/10`).
*   **Shape-Based Cueing:** Ensure critical active states or unread elements employ distinct physical anchors (such as a left-side solid amber indicator `border-l-4 border-l-amber-500`) rather than subtle background color shifts alone, keeping notifications highly distinguishable on low-brightness screens.
*   **Glassmorphism Integration:** Keep border alphas thin and use rich background blurs behind overlays to combine modern glass aesthetics with Material Design ergonomics (`backdrop-blur-xl border border-white/[0.06]`).
*   **Semantic Elements:** Use standard HTML5 layout tags (`<header>`, `<main>`, `<section>`, `<footer>`) to secure responsive, SEO-optimized structures.

---

## 📝 6. Codebase Documentation (Markdown)

*   **Project Structure Explanations:** Always maintain high-quality Markdown files (such as `README.md` or dedicated design documents) to explain the codebase layout, data pathways, service boundaries, and general architecture.
*   **Visual Architecture Diagrams:** Use Mermaid.js charts inside Markdown files to explain flows (e.g., SSE connection loops, database syncing, volume binding) to give developers visual clarity at a glance.
*   **Concise Guides:** Keep markdown documentation clear, structured, and action-oriented. Do not write bloated manuals.

---

## 🏷️ 7. Clean TSDoc & Code Inline Commenting

*   **Component & Utility Documentation (TSDoc):** All React components, custom hooks, and utility functions must be documented with clean, simple **TSDoc** comments. Avoid wordy descriptions; focus on:
    *   **Core purpose:** A single sentence explaining what it does.
    *   **Props / Parameters:** Brief documentation of each input variable.
    *   **Returns:** Description of output values.
    *   *Example:*
        ```typescript
        /**
         * Renders an interactive glassmorphic notification dropdown.
         * Establishes SSE stream connection and triggers chimes.
         */
        export default function NotificationCenter() { ... }
        ```
*   **Critical Code Line Explanations:** For complex or non-obvious statements (such as Web Audio API initialization, Docker volume permissions adjustments, or stream timeouts), include clear, short single-line comments explaining *why* the code was written this way, helping future developers understand its logic immediately.

---

## 📱 8. Progressive Web App (PWA) Standards

*   **Native Next.js PWA Configs:** Always configure PWA settings natively inside Next.js using dynamic metadata routes (such as [`src/app/manifest.ts`](file:///d:/Projects/current/cafe-services/src/app/manifest.ts)). Avoid third-party plugins that override or modify Next.js compiler architectures unnecessarily.
*   **Scalable Icons:** Always use high-quality, lightweight SVG files for icons (`/icon.svg`) inside web manifests. This guarantees perfect resolution scaling across all display PPI densities.
*   **Service Worker Cleanliness:** Service Workers (like [`public/sw.js`](file:///d:/Projects/current/cafe-services/public/sw.js)) must handle standard offline asset caching while explicitly bypassing real-time streams (like `/api/notifications/stream`) to prevent blocking the Event Source channel.

---

## 📐 9. Responsive Layouts & Viewports

*   **Fluid Layouts:** Never use fixed absolute sizing widths for layout containers. Always use percentage bounds, grid layouts, or fluid padding (e.g., `max-w-7xl w-full mx-auto px-6`).
*   **Overflow Prevention:** Dropdowns, dialog sheets, and notification list overlay panels must use dynamic, viewport-relative sizing wrappers (e.g., `w-[calc(100vw-2rem)] sm:w-96 max-w-sm`) to remain perfectly safe from offscreen clipping on compact mobile devices (such as iPhone SE).
*   **Grid Scaling:** Always design card configurations and dashboards using mobile-first grid utilities that scale dynamically across screens (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).


