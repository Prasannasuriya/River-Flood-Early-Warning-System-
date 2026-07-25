# River Flood Early Warning System

[![Developer](https://img.shields.io/badge/Developer-Prasannasuriya-38bdf8?style=for-the-badge)](https://github.com/Prasannasuriya)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-blue?style=for-the-badge&logo=express)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite3-Database-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org)

A modern, responsive full-stack web application engineered for real-time river water level telemetry monitoring, hydrological analytics, and automated flood threat alerting across key river basins in **Tamil Nadu and surrounding regions**.

![System Overview](https://via.placeholder.com/1200x600/0f172a/38bdf8?text=River+Flood+Early+Warning+System+-+Built+by+Prasannasuriya)

---

## 🌟 Features Overview

- 📊 **Executive Dashboard**: Live summary metrics (Total Stations, Safe, Warning, Danger counts, Latest Level, Last Updated Time) alongside interactive **Chart.js** Line and Doughnut charts.
- 🌊 **Tamil Nadu River Telemetry**: Pre-seeded with 40 realistic telemetry records across river basins including *Cauvery*, *Vaigai*, *Thamirabarani*, *Bhavani*, *Palar*, *Thenpennai*, *Kollidam*, *Amaravathi*, *Noyyal*, *Siruvani*, and *Gundar*.
- ⚡ **Automated Status Threshold Evaluation**:
  - 🟢 **Safe**: `0.0m - 2.5m`
  - 🟠 **Warning**: `2.5m - 4.5m`
  - 🔴 **Danger**: Exceeds `4.5m`
- ➕ **Add Telemetry Reading**: Form with real-time dynamic status preview meter and input validation before persistence.
- 📋 **Interactive Database Table**: Real-time location search, status filters (`All`, `Safe`, `Warning`, `Danger`), multi-parameter sorting, and full CRUD capability (Edit modal & Delete confirmation).
- 📈 **Hydrological Trend Analytics**: High-resolution water level trend graph with automated summary metrics (**Highest Level**, **Lowest Level**, **Average Level**).
- 🚨 **Dynamic Alert Center**: Automatically generates **Yellow Warning Cards** for warning levels and **Red Emergency Flash Cards** for critical danger levels.
- 🔐 **Admin Portal**: Authentication interface for system management (`admin` / `admin123`).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism UI, CSS Tokens, Micro-animations), Vanilla JavaScript (ES6+ Modular Scripts).
- **Libraries**: Chart.js (Interactive Charts), Font Awesome 6.4 (Iconography).
- **Backend**: Node.js, Express.js, CORS, Dotenv.
- **Database**: SQLite database engine (`flood_system.db`) with schema migrations and seed scripts.

---

## 🚀 Quick Start & Installation

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed.

### 1. Clone the Repository

```bash
git clone https://github.com/Prasannasuriya/River-Flood-Early-Warning-System-.git
cd River-Flood-Early-Warning-System-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm start
```

For development mode with auto-reload:

```bash
npm run dev
```

### 4. Open Application

Open your browser and navigate to:

```text
http://localhost:5000
```

---

## 🔑 Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 📁 Project Architecture

```text
River-Flood-Early-Warning-System/
├── database/
│   ├── schema.sql           # Database schema & index definitions
│   ├── seed.sql             # 40 realistic seed records for Tamil Nadu rivers
│   ├── db.js                # SQLite connection, auto-migration & persistence
│   └── flood_system.db      # SQLite database file
├── server/
│   ├── controllers/
│   │   ├── authController.js      # Admin authentication handler
│   │   ├── readingController.js   # Telemetry CRUD & threshold calculations
│   │   └── dashboardController.js # Aggregated statistics & chart data
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── readingRoutes.js      # /api/readings routes
│   │   └── dashboardRoutes.js    # /api/dashboard routes
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handler & 404 router
│   └── app.js                    # Express application entrypoint
├── public/                       # Static frontend client assets
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css        # Glassmorphism design tokens & styles
│   │   └── js/
│   │       ├── api.js            # REST API client module
│   │       ├── auth.js           # Admin session & navigation manager
│   │       ├── toast.js          # Toast notification alerts
│   │       ├── dashboard.js      # Dashboard visual analytics controller
│   │       ├── readings.js       # Readings data table, search & filter
│   │       ├── add-reading.js    # Form validation & live preview meter
│   │       ├── trend.js          # Hydrological line graph & statistics
│   │       └── alerts.js         # Dynamic warning & emergency cards engine
│   ├── index.html                # Executive Dashboard view
│   ├── login.html                # Admin Login view
│   ├── add-reading.html          # Add Water Level view
│   ├── readings.html             # Reading List Table view
│   ├── trend.html                # Water Trend view
│   └── alerts.html               # Emergency Alerts view
├── package.json
└── README.md
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Authenticate admin user (`admin` / `admin123`) |
| **GET** | `/api/dashboard` | Retrieve summary statistics, status counts & chart datasets |
| **GET** | `/api/readings` | Fetch readings list (supports `search`, `status`, `sort` params) |
| **POST** | `/api/readings` | Create new telemetry reading & auto-evaluate threshold status |
| **PUT** | `/api/readings/:id` | Update telemetry reading & re-evaluate status |
| **DELETE** | `/api/readings/:id` | Delete telemetry record by ID |

---

## 👤 Author

Developed by **Prasannasuriya**  
- GitHub: [@Prasannasuriya](https://github.com/Prasannasuriya)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
