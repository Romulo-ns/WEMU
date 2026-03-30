# WEMU

> 🌐 **Live Site:** [https://wemu-production.up.railway.app/](https://wemu-production.up.railway.app/)

WEMU is a full-stack web application built with **Next.js**, **React**, **TypeScript**, and **MongoDB**. It includes authentication via **NextAuth.js** and is deployed on **Railway**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js |
| Deployment | Railway |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string
- A `.env.local` file with the required environment variables

### Installation

```bash
# Clone the repository
git clone https://github.com/Romulo-ns/WEMU.git
cd WEMU

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and add the required variables (see `.env.local.example` if available).

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database

```bash
npm run db
```

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db` | Start local database |

---

## 🌍 Deployment

This project is deployed on **Railway**.

👉 [https://wemu-production.up.railway.app/](https://wemu-production.up.railway.app/)

---

## 📄 License

This project is private and not open for redistribution.
