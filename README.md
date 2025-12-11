# North Road AI 🚀

**North Road AI** is a next-generation "Founder Copilot" platform, built with **Next.js 16**, **Firebase**, and **Google Gemini**. It empowers startup founders with a multi-agent AI team (Navigator, Builder, Ledger, Counsel, Rainmaker) to accelerate their journey from idea to exit.

---

## ✨ Key Features

### 🤖 Multi-Agent AI System
- **5 Specialized Agents**:
  - **Navigator**: Strategy & Operations.
  - **Builder**: Product & Engineering.
  - **Ledger**: Finance & Accounting.
  - **Counsel**: Legal & Compliance.
  - **Rainmaker**: Sales & Marketing.
- **RAG (Retrieval Augmented Generation)**: Intelligent context-aware responses using uploaded documents, web scraping, and Hugging Face datasets.
- **Chat Persistence**: Save and resume chat sessions with full history.

### 🧠 Knowledge Base & Admin Control
- **Global Knowledge**: Admin can upload PDFs, text files, or scrape websites to feed the AI's brain.
- **Agent-Specific Access**: Assign documents to specific agents (e.g., Financial reports only visible to *Ledger*).
- **Hugging Face Integration**: Ingest datasets directly from Hugging Face for specialized training context.
- **Web Scraper**: Built-in tool to scrape and index external websites.

### 🛠️ Founder Tools
- **Startup DNA**: Profile system to track burn rate, runway, stage, and key metrics.
- **Mentorship Portal**: Dedicated dashboard for mentors to oversee and guide founder progress.
- **Gamification**: "Founder Score" and leaderboards to incentivize progress.

### ⚡ Technical Highlights
- **Real-time**: Firebase Firestore for instant data sync.
- **Server Actions**: Leveraging Next.js 16 server capabilities.
- **Stripe Integration**: Ready for subscription and credit-based monetization.
- **Responsive Design**: Beautiful UI built with Tailwind CSS and Framer Motion.

---

## 🏗️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Firebase (Firestore, Auth)](https://firebase.google.com/)
- **AI Model**: [Google Gemini Pro / Flash](https://ai.google.dev/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Components**: Lucide React, Framer Motion.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed.
- A Firebase project created.
- A Google AI Studio API Key (for Gemini).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/north-road-ai.git
   cd north-road-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your keys:

   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Firebase Admin (Service Account for Server-Side)
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

   # AI & Payments
   GEMINI_API_KEY=your_gemini_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── admin/          # Admin dashboard (Knowledge, Users, Logs)
│   ├── api/            # Next.js API Routes
│   ├── dashboard/      # Main User/Founder Dashboard
│   ├── mentor/         # Mentor Portal
│   ├── login/          # Authentication Pages
│   └── page.tsx        # Landing Page
├── components/         # Reusable UI Components
├── lib/
│   ├── agents.ts       # AI Agent Definitions & Prompts
│   ├── api/            # API Service wrappers (Knowledge, Chat, etc.)
│   └── firebase.ts     # Firebase Client Initialization
└── context/            # React Context (Auth, Unstated)
```

---

## 🛡️ Access Control & Roles

- **User**: Standard role for founders. access to Dashboard and Chat.
- **Admin**: Full access to `/admin` routes. Can manage users, ingest knowledge, and view system logs.
  - *To promote a user to Admin*: Manually edit the user document in Firestore (`users/{uid}`) and set `role: "admin"`.
- **Mentor**: Access to `/mentor` routes to view assigned founders.

---

## 📦 Deployment

This project is optimized for deployment on **Vercel** or **Google Cloud Run**.

### Build
```bash
npm run build
```

### Docker (Cloud Run)
The project includes a production-ready `Dockerfile` (Node.js 18 Alpine, multi-stage).
```bash
# Build
docker build -t north-road-ai .

# Run locally
docker run -p 3000:3000 north-road-ai
```

---

## 🤝 Contributing

We welcome contributions! Please read our [Developer Onboarding Guide (CONTRIBUTING.md)](./CONTRIBUTING.md) for detailed setup instructions, code standards, and workflows.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

**Built with ❤️ for Builders.**
