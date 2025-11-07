# Vibe Commerce — Full Stack Shopping Cart

A complete **mock e-commerce cart application** built using **React (frontend)**, **Node.js + Express (backend)**, and **SQLite (database)**.  
Developed as part of the **Vibe Commerce Internship Full Stack Assignment** (48-hour task).

---

## 🧩 Overview

This project demonstrates a basic e-commerce flow with:
- Product listing
- Add/remove/update cart items
- Live total calculation
- Mock checkout and receipt generation  
All data persists in a lightweight SQLite database.

---

## 📁 Project Structure

```
vibe-commerce/
│
├── backend/
│   ├── server.js          # Express + SQLite backend
│   ├── ecommerce.db       # Auto-created SQLite database
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 🖥️ Backend Setup

1. Open terminal and go to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install express cors sqlite3
   ```
3. Start the backend:
   ```bash
   node server.js
   ```
4. Runs on: **http://localhost:5000**

---

### 💻 Frontend Setup

1. Open a new terminal and go to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```
4. Open browser → **http://localhost:5173**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **GET** | `/api/products` | Fetch all mock products |
| **POST** | `/api/cart` | Add product to cart |
| **GET** | `/api/cart` | Get current cart + total |
| **PUT** | `/api/cart/:id` | Update cart quantity |
| **DELETE** | `/api/cart/:id` | Remove item |
| **POST** | `/api/checkout` | Checkout → returns mock receipt |
| **GET** | `/api/health` | Health check route |

---

## ✨ Features

✅ Display mock products  
✅ Add to cart / remove / update quantities  
✅ Auto-calculated totals  
✅ Checkout form (name + email)  
✅ Mock order receipt with timestamp  
✅ Persistent SQLite storage  
✅ Responsive Tailwind CSS UI  

---

##  How It Works

1. The backend auto-creates an SQLite database (`ecommerce.db`)  
2. On first run, it inserts mock products  
3. Frontend (React) fetches data via REST APIs  
4. Cart and totals are synced dynamically  
5. Checkout triggers a mock receipt and clears the cart  

---

## 🧱 Tech Stack

**Frontend:** React (Vite), Tailwind CSS, Lucide Icons  
**Backend:** Node.js, Express.js, SQLite  
**Database:** SQLite (Local lightweight DB)  
**Tools:** npm, VS Code, Git  

---

## 📸 Screenshots

### 🏠 Product Page
![Products](./screenshots/Screenshot2025-11-08001241.png)

### 🛒 Cart Page
![Cart](./screenshots/Screenshot2025-11-08001257.png)

### 🧾 Receipt
![Receipt](./screenshots/Screenshot2025-11-08001322.png)

---

## 🧰 Commands Summary

```bash
# Run backend
cd backend
node server.js

# Run frontend
cd frontend
npm run dev
```

---



## 📝 Notes

- No external controllers/models used — all logic handled directly in `server.js`  
- SQLite database auto-generates and persists mock data  
- `App.jsx` handles API integration, cart logic, and checkout  
- Fully responsive UI using Tailwind  

---


> Built using React, Node.js, Express, and SQLite  
> Submission for **Vibe Commerce Internship Screening**
