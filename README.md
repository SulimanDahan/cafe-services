# Cafe Services Dashboard

A state-of-the-art Next.js web application and dashboard fully prepared for containerized deployment. Built using modern design patterns, powered by **Prisma ORM** connected to a **PostgreSQL database**, and featuring native, high-performance **Real-Time Notifications** via Server-Sent Events (SSE).

---

## 🚀 Key Features

*   **Docker Containerization:** Seamless configurations for local development (hot-reloading, database automatic push) and optimized multi-stage production deployment (standalone builds, migration deployment).
*   **Database Integration:** PostgreSQL database managed via Prisma ORM with singleton connections to prevent connection pool exhaustion.
*   **Native Real-Time Engine:** Live notifications broadcasted from server to client using standard HTML5 **Server-Sent Events (SSE)** and an in-memory global Node.js Event Emitter.
*   **Premium Visual Experience:** Fully customized dark-mode dashboard featuring glassmorphism elements, custom micro-animations, pulsing badges, and slide-in real-time toast alerts.
*   **Web Audio Synthesizer:** Highly innovative audio notifier playing synthesised chord harmonies on incoming alerts using the browser's native **Web Audio API** (requires zero external audio file dependencies!).
*   **Persistent Storage:** Docker Named Volumes for database preservation and user-uploaded media files under `public/uploads`.

---

## 🛠️ Architecture Overview

```mermaid
flowchart TD
    Client[Web Browser Client] <-->|1. Persistent SSE Connection| Stream[SSE Route Handler: /api/notifications/stream]
    Trigger[Trigger Endpoint: /api/notifications/create] -->|2. Creates Record| DB[(PostgreSQL Database)]
    Trigger -->|3. Emits Broadcast| Emitter[Global Node.js EventEmitter]
    Emitter -->|4. Push Event| Stream
    Stream -->|5. Instant Push| Client
    Client -->|6. Synth Audio & Toast| Audio[Native Web Audio API]
```

---

## ⚙️ Environment Variables

The application reads database configuration from a standard `.env` file or from Docker compose environment environments.

| Variable Name  | Purpose                                                                                | Example Configuration (Docker Internal Context)                               |
| :------------- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `DATABASE_URL` | Prisma PostgreSQL database connection string. Handles host routing inside the network. | `postgresql://cafe_admin:cafe_secure_pass@postgres:5432/cafe_db?schema=public` |
| `NODE_ENV`     | Determines runtime build mode: `development` or `production`.                           | `development` or `production`                                                 |
| `PORT`         | Exposed container port.                                                                | `3000`                                                                        |

---

## 💻 Development Environment Setup

In the development container, code directories are live-mounted to allow instant code updates (Hot-Reloading) without restarting containers.

### Dev Features:
1.  **Direct Code Binding:** Edits to your source files reflect immediately in the container.
2.  **File Polling (`WATCHPACK_POLLING`):** Enabled to ensure instantaneous reloads on Windows hosts using WSL2/Docker Desktop.
3.  **Automatic Database Push:** Runs `npx prisma db push` on startup to keep the database schema in sync with your models without destructive migration tracking during prototyping.
4.  **DB Port Expose:** Postgres maps port `5432` to your localhost for direct database client inspection (e.g., TablePlus, DBeaver, or Prisma Studio).

### How to Start (Development):

Run the following command from the project root:

```bash
docker compose -f docker-compose.dev.yml up --build
```

*The application will boot, wait for PostgreSQL to pass its health check, automatically perform Prisma schema synchronization, and then start the Next.js development server.*

*   **App URL:** [http://localhost:3000](http://localhost:3000)
*   **Postgres Local Port:** `localhost:5432` (User: `cafe_admin`, Password: `cafe_secure_pass`, Database: `cafe_db`)

---

## 🌐 Production Environment Setup

The production stack represents a highly optimized, secured, and self-contained environment.

### Prod Features:
1.  **Next.js Standalone Build:** Leverages Next.js output file-tracing to copy only the bare-minimum bundle and pruned `node_modules` required to run `node server.js` without the full build-time overhead.
2.  **Multi-Stage Dockerfile:** Three stages (`deps`, `builder`, `runner`) keep the final container size at ~150MB instead of ~1GB.
3.  **Automated Production Migrations:** On container startup, the container automatically executes `npx prisma migrate deploy` to safely apply any pending database schema migrations before starting the Web server.
4.  **Database Security:** PostgreSQL ports are kept strictly internal to the private Docker virtual network and are never exposed to the public host port.

### How to Start (Production):

Run the following command from the project root:

```bash
docker compose up --build
```

*This compiles the React code with aggressive optimizations, generates standalone output, deploys schema migrations, and exposes the app.*

*   **App URL:** [http://localhost:3001](http://localhost:3001)

---

## 💾 Storage & Media Upload Persistence

By default, Docker containers operate on an ephemeral filesystem, meaning files created inside them are wiped when the container restarts. 

To resolve this and support continuous file uploads (such as images, logos, or receipts) and ensure the Postgres database remains persistent, we have mapped secure **Docker Volumes** in the compose configurations:

1.  **Database Storage Volume (`postgres_data_prod` / `postgres_data_dev`):**
    *   **Mapped Path:** `/var/lib/postgresql/data` inside the PostgreSQL container.
    *   **Function:** Persists all database tables, order history, and notification logs securely on the host machine.
2.  **Media Uploads Volume (`uploads_data_prod` / `uploads_data_dev`):**
    *   **Mapped Path:** `/app/public/uploads` inside the Next.js container.
    *   **Function:** This directory is designated for file uploads in Next.js. Any file saved in this folder is instantly backed up on the host, ensuring that uploaded food, beverage, or receipt images remain fully safe and accessible across container recreations and code updates.

---

## 🔔 Real-Time Notifications Mechanics

The real-time ecosystem operates entirely on native Web technologies, keeping project complexity to a minimum.

### 1. The SSE Channel
Clients connect to `/api/notifications/stream`. The browser's native `EventSource` establishes a persistent, long-lived HTTP connection. The server immediately pushes the 20 most recent notifications from PostgreSQL, then pings the socket every 20 seconds to keep the connection healthy.

### 2. Node.js Event Signaling
When a new order or notification is triggered, it writes a record to Postgres via Prisma, and immediately publishes an event using a globally scoped NodeJS `EventEmitter` (`src/lib/emitter.ts`). The active SSE handler listens to this emitter and pushes the fresh record over the open stream directly to the client.

### 3. Audio Chime (Web Audio API)
Instead of bundling heavy MP3 or WAV files, the client component uses the **Web Audio API** to synthesize a gorgeous dual-tone notification sound programmatically:
```typescript
const AudioContext = window.AudioContext;
const ctx = new AudioContext();
// Generates a beautiful harmonic interval C5 -> E5 with exponential volume decay
```

### 4. Direct Manual Testing
You can easily test the real-time notification engine by clicking the notification bell icon in the header, and using the built-in **"Simulate Event"** dashboard triggers, or by simply visiting this URL in another browser tab:
```
http://localhost:3000/api/notifications/create?title=Hot+Coffee%21&message=Espresso+order+%23101+is+ready+for+pickup.&type=success
```
*(Connected browsers will play the dual-tone chime and slide in an elegant toast instantly without a page refresh!)*
