# Belmobile.be - Premium Buyback & Repair Platform

Belmobile is a high-performance Next.js platform designed for local device repair and buyback services in Brussels.

## 🚀 Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org) (Turbopack Enabled)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (Modern utility-first architecture)
- **Database**: [Firebase](https://firebase.google.com) (Firestore & Storage)
- **AI Concierge**: [Gemini 2.0 Flash](https://ai.google.dev) (Conversational search & pricing lookup)
- **PDF Generation**: [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html)

## ✨ Core Features
- **Buyback/Repair Wizard**: A multi-step interactive flow with real-time price estimation.
- **AI Assistant**: A context-aware chatbot that understands device specifics and store locations.
- **Admin Power Tools**:
    - **Batch Actions**: Bulk update prices and stock levels across multiple shops.
    - **Audit Logs**: Full history of inventory movements and price changes.
    - **Lead Notifications**: Real-time badges for new quotes and reservations.
- **Automated Emails**: Integrated with Firebase "Trigger Email" to send PDF summaries to users.

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your Firebase and Gemini API keys.

### 3. Development
```bash
npm run dev
```

## 📂 Project Structure
- `/src/app`: Next.js 13+ App Router pages.
- `/src/components`: UI components (Admin tools, Wizard, AI Chat).
- `/src/context`: Global state (Data & Localization).
- `/src/hooks`: Custom hooks for Firestore real-time data.
- `/public`: Static assets (Logo, PWA manifest).

## 📊 Administrative Dashboard
Access the admin panel at `/login` using your authorized credentials. The dashboard provides real-time KPIs, franchise management, and inventory power tools.

---
© 2024 Belmobile.be - All rights reserved.
