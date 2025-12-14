# Developer Onboarding Guide 🧭

Welcome to the **North Road AI** engineering team! This guide will help you set up your environment, understand the workflow, and contribute effectively.

## 🚀 Quick Start



### 1. Prerequisites
- **Node.js**: v18.17+ (Recommended: use `nvm`)
- **Git**: Latest version.
- **Firebase CLI**: `npm install -g firebase-tools`
- **Jina AI & Gemini Keys**: You'll need API keys from Google AI Studio and Jina.



### 2. Installation
```bash
git clone https://github.com/farjadp/northroadai/
cd north-road-ai
npm install
```

### 3. Environment Config
Copy `.env.example` (or create one) to `.env.local`:
```bash
cp .env.example .env.local
```
*Ask the team lead for the development API keys.*



### 4. Running Locally
```bash
npm run dev
```
Access the dashboard at `http://localhost:3000/dashboard`.

---

## 🏗️ Project Structure

- `src/app`: Next.js App Router pages.
  - `(auth)`: Login/Signup routes.
  - `dashboard`: Main app interface.
  - `api`: Backend API endpoints.
- `src/lib`: Core logic and utilities.
  - `agents.ts`: Definitions for AI personas (Navigator, Builder, etc.).
  - `firebase.ts`: Client-side Firebase.
  - `firebase-admin.ts`: Server-side Admin SDK.
- `public`: Static assets (images, icons).


## 🧪 Testing

We use **Jest** and **React Testing Library**.

- **Run Unit Tests**: `npm run test`
- **Run Smoke Tests**: `npm run test:smoke` (if configured)



## 🐳 Deployment (Docker)

To build the production image locally:
```bash
docker build -t north-road-ai .
docker run -p 3000:3000 north-road-ai
```

## 🤝 Contribution Workflow

1. **Branching**: Use `feature/name` or `fix/issue-name`.
2. **Commits**: Use Conventional Commits (e.g., `feat: add new agent`, `fix: typing error`).
3. **PRs**: Open a Pull Request to `main`. Ensure CI (build/test) passes.

---

**Questions?** Reach out on the #engineering Slack channel.
