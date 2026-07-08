# Unique Merchants — Premium Kenya Real Estate Platform

Welcome to the **Unique Merchants** official development repository. This is a premium, full-stack real estate platform based in Kenol, Murang'a County, Kenya. It integrates high-fidelity simulated map views, interactive client inquiry matchmaking, a blog, custom administrative layouts, and robust local persistence.

---

## 🚀 Quick Start (Local Development)

To spin up the server and client environment locally on your machine, follow these simple steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a local `.env` file in the root directory (using `.env.example` as a template):
```env
# Google Gemini API Access (Optional for advanced AI Chat/Search)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
*   **Dev Mode**: Boots up the Express backend at `http://localhost:3000`. 
*   **Vite Integration**: The server automatically mounts Vite's development middleware to bundle, live-reload, and serve the React client inside the same process.

---

## 🛠️ Build & Production Deployment

To package the application for high-performance production hosting (e.g., Cloud Run, Docker containers):

### 1. Compile Client & Bundle Server
```bash
npm run build
```
This single command runs a dual-phase compilation:
1.  **Vite Client Compilation**: Bundles the React front-end assets into static HTML, JS, and CSS files under `/dist`.
2.  **Server Bundling**: Uses `esbuild` to compile `/server.ts` into a standalone CommonJS bundle at `/dist/server.cjs`.

### 2. Run Production Server
```bash
npm run start
```
Spins up the compiled server directly, mounting high-speed static asset handlers for the `/dist` directory.

---

## 🗄️ Database & Local Persistence

The application is equipped with a **lightweight, fully persistent local JSON database** (`db.json`) created automatically in your root directory. 

### Why this architecture?
-   **Zero Heavy Setup**: No local PostgreSQL, Docker databases, or complex configurations are required to get started.
-   **True Persistence**: Adding properties, submitting customer requests, posting blogs, adding comments, or editing company settings will immediately update `db.json`, keeping your data safe across server restarts.
-   **Ready for Cloud Migration**: APIs are completely decoupled; when you are ready to transition to cloud storage, you can easily point the backend services to Firestore or Google Cloud SQL.

---

## 📂 Key Directory & File Map

```text
├── server.ts                 # Express full-stack entry point, REST APIs & AI middleware
├── db.json                   # Local JSON database (auto-generated on first boot)
├── metadata.json             # Application metadata and iframe canvas permissions
├── package.json              # Script configs, build pipelines, and dependencies
├── vite.config.ts            # Vite client build pipeline definitions
│
├── src/
│   ├── main.tsx              # Front-end main hook & React mounting
│   ├── App.tsx               # Main SPA view router, Admin dashboard, & Tab structures
│   ├── index.css             # Tailwind CSS & global display font face imports
│   ├── types.ts              # TypeScript definitions for properties, blogs, and settings
│   ├── data.ts               # Default luxury dataset (Kenol, Thika, Murang'a, Juja, Makuyu)
│   │
│   └── components/
│       ├── InteractiveMap.tsx # Google Maps Style simulated street & traffic overlay
│       └── ...
```

---

## 🧠 AI Live Features & Offline Fallback

The backend uses the modern `@google/genai` SDK to interact with Google's Gemini models for smart conversational search and property metadata extraction.

*   **API Key Configured**: All conversational flows and property listings search query filtering are powered live by the `gemini-3.5-flash` model.
*   **Demo / Local Mode**: If no `GEMINI_API_KEY` environment variable is detected, the server **automatically engages a high-quality local rule-based simulation engine**, ensuring all chat services, natural search filtering, and admin data parsing remain fully functional for demonstration.
