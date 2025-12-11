# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.3] - 2025-12-11 12:45:00

### 🛡️ Security
- **Critical Patch**: Upgraded Next.js to **v16.0.7** to resolve CVE-2025-55182 (Deployment Blocker).
- **Deployment Fix**: Updated `src/lib/firebase.ts` to support build environments where environment variables are missing (Cloud Run), preventing `auth/invalid-api-key` failure.

### 🚀 Performance
- **Caching**: Implemented in-memory LRU Cache (`src/lib/cache.ts`) for embeddings, reducing repeated API calls to Google Gemini AI.
- **Parallel Scraper**: Updated `/api/admin/scrape` to process chunks in parallel (5x concurrency), speeding up knowledge base ingestion.
- **Vector Search**: Optimized `/api/chat` to fetch fewer documents (Limit: 5) and utilize cached embeddings, improving response latency.

### 📚 Documentation
- **API Spec**: Added `public/openapi.yaml` (OpenAPI 3.0).
- **Onboarding**: Added `CONTRIBUTING.md` and `Dockerfile` for easier developer setup and deployment.
- **JSDoc**: Added comprehensive documentation to `src/lib/cache.ts` and `src/lib/api-error.ts`.

## [v0.1.2] - 2025-12-11 12:30:00

### 💎 Quality & Reliability
- **Strict Mode**: Enabled strict TypeScript build checks. Fixed critical type errors in Chat API (`usageCheck`), Onboarding (`framer-motion`), and System Health (`lucide-react`).
- **Safety**: Added `src/lib/env.ts` with Zod validation. The app now fails fast if required environment variables are missing (e.g., Firebase Config, Gemini Key).
- **Testing**: Added Jest and React Testing Library infrastructure. Added unit tests for Environment validation. Run `npm run test` to verify.
- **Error Handling**: Introduced `AppError` class and `handleApiError` utility in `src/lib/api-error.ts` for standardized JSON error responses across APIs.

## [v0.1.1] - 2025-12-11 11:00:00

### 🛡️ Security
- **Critical**: Removed hardcoded Firebase API keys and configuration from `src/lib/firebase.ts`. Now strictly uses `process.env`.
- **Critical**: Removed hardcoded `GEMINI_API_KEY` fallback in `src/app/api/upload/route.ts`. 
- **Auth**: Secured `/api/upload` endpoint. Now requires a valid Firebase ID Token in the `Authorization` header. Verified via `firebase-admin`.
- **Auth**: Secured `/api/admin/settings/chat` endpoint. Removed weak `x-admin-secret` check and replaced with standard Firebase ID Token verification.
- **Validation**: Added Zod schema validation for file uploads (size, mime-type) and chat settings inputs.
- **Audit**: Implemented audit logging in Firestore (`audit_logs` collection) for all file uploads and admin setting changes.

### 🐛 Fixes
- Fixed potential "auth/invalid-api-key" errors by switching to environment-based configuration.
- Fixed vulnerability where unauthenticated users could potential upload files or change chat settings.

### ⚡ Improvements
- Added `src/lib/schemas/admin-validation.ts` for centralized request validation.
- Updated Admin Chat Settings page to authenticate requests automatically.
- Updated Admin Knowledge Base page to authenticate file uploads automatically.
