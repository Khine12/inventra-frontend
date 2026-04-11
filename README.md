# Inventra Frontend

React + TypeScript dashboard for Inventra — a full-stack inventory and sales management platform for small businesses.

🚀 **Live Demo:** https://inventra-frontend-alpha.vercel.app  
🔗 **Backend API:** https://github.com/Khine12/inventra  
📖 **API Docs:** https://inventra-api-ernr.onrender.com/docs

---

## Features

- Login and register with JWT authentication
- Dashboard with stock level bar chart and recent transactions
- Products page — add, view, delete products with low-stock highlighting
- Transactions page — record sales and restocks, view revenue per transaction
- Automatic revenue calculation from transaction history
- Responsive sidebar navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Charts | Recharts |
| Deployment | Vercel |

---

## Local Development

```bash
git clone https://github.com/Khine12/inventra-frontend.git
cd inventra-frontend
npm install
npm run dev
```

Make sure the backend is running at `http://127.0.0.1:8000` or update `src/api.ts` with your backend URL.

---

## Backend

The backend is a separate FastAPI service. See → https://github.com/Khine12/inventra
