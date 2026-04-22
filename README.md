# MCX Gold Management — Backend API

A production-grade **Node.js + TypeScript REST API** for managing gold and silver trading operations across multiple roles including **Admin, Branch Admin, and Dealer**.

This system handles complete trading workflows such as **branch distribution, dealer allocation, price locking, order management, inventory tracking, and reporting**, with real-time price updates using Socket.IO.

---

## 🚀 Features

- Multi-role system: **Admin, Branch Admin, Dealer**
- Real-time **gold/silver price streaming** using Socket.IO
- **Price lock mechanism** with live market data
- Complete **order management system** (buy/sell)
- **Branch & Dealer distribution management**
- **Inventory tracking & reporting**
- **JWT Authentication & Role-Based Access Control**
- **Redis caching** for performance optimization
- **AJV validation** for request schema validation
- **Winston logging** for centralized logging
- Scalable and modular architecture

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Runtime     | Node.js |
| Language    | TypeScript |
| Framework   | Express.js |
| Database    | MySQL |
| ORM         | Sequelize |
| Cache       | Redis |
| Real-time   | Socket.IO |
| Auth        | JWT, bcryptjs |
| Validation  | AJV |
| Logging     | Winston |

---

## 📂 Project Structure

```
src/
├── app.ts # Express app configuration (middlewares, routes, error handling)
├── server.ts # Entry point (DB init, Socket.IO, server start)
│
├── config/ # Database, Redis, Socket configuration
├── routes/ # API route definitions
├── controllers/ # Request handlers
├── services/ # Business logic layer
├── models/ # Sequelize models & associations
├── middlewares/ # Auth, role, validation, error handling
├── validations/ # AJV schema validations
├── types/ # TypeScript interfaces & enums
├── utils/ # Helper functions (logger, crypto, responses, etc.)
├── seeders/ # Initial data (optional)
└── contents/ # Email templates / static content
```

---

## ⚙️ Core Modules

- Auth
- Users
- Branches
- System Settings
- Scripts
- Branch Distributions
- Dealer Distributions
- Price Lock
- Orders
- Reports
- Inventory
- Rollover
- Live Prices (Redis + Socket.IO)
- Infrastructure Utilities

---

## 🔄 System Workflow

1. **Admin** creates daily branch distributions (gold/silver allocation)
2. **Branch Admin** allocates distribution to dealers
3. **Dealer** locks prices using live market data
4. **Dealer** places buy/sell orders
5. System updates inventory and remaining allocations in real-time

---

## ⚡ Real-Time Price System

- Prices generated using a custom price generator
- Cached in Redis (`livePrices`)
- Broadcast to clients via Socket.IO every second
- Used in price lock and order processing

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control:
  - Admin → Full access
  - Branch Admin → Branch-level operations
  - Dealer → Trading operations

---

## 🧪 Running & Setup

### 1. Clone the Repository
git clone https://github.com/siddharth756/mcx-gold-management.git  
cd mcx-gold-management  

### 2. Install Dependencies
npm install  

### 3. Configure Environment Variables

Create a `.env` file in the root directory use `.env.example` as reference

### 4. Run the Project

Development Mode:  
npm run dev  

Production Mode:  
npm run build  
npm start  

### 5. Access API

Base URL: http://localhost:5000/api    
Health Check: http://localhost:5000/health  

---

## ⚠️ Important Notes

- Ensure MySQL server is running  
- Ensure Redis server is running (required for caching & live prices)  
- Use SEED=true only for development  
- Use Gmail App Password for SMTP  

---

## 🧰 Optional Setup

Run Redis (Local):  
redis-server  

Run MySQL (Example):  
mysql.server start  