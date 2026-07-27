# River Flood Early Warning System with Control Room Dashboard

[![Developer](https://img.shields.io/badge/Developer-Prasannasuriya_A_D-38bdf8?style=for-the-badge)](https://github.com/Prasannasuriya)
[![SIH 2026](https://img.shields.io/badge/SIH_2026-Level_2_On--Spot_Changes-purple?style=for-the-badge)](https://github.com/Prasannasuriya)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-blue?style=for-the-badge&logo=express)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite3-Database-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org)

**Student Name**: PRASANNASURIYA A D  
**Register No**: 411723104032  
**Department**: CSE PSVPEC · Year IV (Prince Shri Venkateshwara Padmavathy Engineering College)  
**Project**: River Flood Early-Warning System with Control Room Dashboard  

---

## 📹 SIH 2026 Working Video Demonstration

Watch the official working video demonstration of the project recorded for SIH 2026 Level 2 evaluation:

> 🎥 **[Watch Official Video Demo (411723104032_PRASANNASURIYA_A_D.mp4.mp4)](411723104032_PRASANNASURIYA_A_D.mp4.mp4)**  
> *(Demonstrates real-time control room telemetry dashboard, live water level input submission, Change 1 computed baseline delta `Δ Baseline` dynamic updating, Change 2 impossible sensor fault safeguard handling, and active flood alert cards)*

---

## 🏆 SIH 2026 Level 2 — On-Spot Changes Implementation

### 🔹 Change 1 — (8 Marks) Internal Computed Value Display
- **Requirement**: Compute an internal value worked out by code (e.g. difference / deviation from baseline) that was not previously shown on screen, and display it dynamically changing as simulated inputs change.
- **Implementation**:
  - Added **Computed Baseline Delta (`Δ Baseline`)** which evaluates `water_level - 2.50m (Safe Operational Limit)`.
  - Displayed on **Dashboard**, **Readings Table**, **Alert Cards**, and **Add Reading Form**.
  - **Live Dynamic Updates**: As you type water levels in the form or submit new inputs, the computed delta (`Δ +1.30m` or `Δ -0.70m`) updates live on screen and prints to browser console logs!

---

### 🔹 Change 2 — (12 Marks) Broken Sensor Fault Safeguard (Prevent False Alarms)
- **Requirement**: Handle a broken sensor reporting impossible values (outside physical gauge range) so the system does not treat it as real or trigger a false emergency flood alarm.
- **Implementation**:
  - Enforced valid physical sensor gauge range: `0.0m` to `15.0m`.
  - Any impossible reading (e.g. `999.0m` or `-10.0m`) is automatically assigned **`SENSOR FAULT`** status.
  - **False Alarm Prevention**: Impossible readings are excluded from flood warning alerts and real hydrological statistics (highest, lowest, average levels).
  - Categorized under a dedicated **Sensor Hardware Faults** badge & alert section.

---

## 🌟 Core System Features

- 📊 **Executive Dashboard**: Metric cards for Total Stations, Safe, Warning, Danger, and Sensor Fault counts, Chart.js trend line graph, doughnut chart, and live telemetry stream.
- 🌊 **Tamil Nadu River Basins**: Pre-seeded with 41 telemetry records across river stations including *Cauvery*, *Vaigai*, *Thamirabarani*, *Bhavani*, *Palar*, *Thenpennai*, *Kollidam*, *Amaravathi*, *Noyyal*, *Siruvani*, and *Gundar*.
- ⚡ **Automated Status Evaluation**:
  - 🟢 **Safe**: `0.0m - 2.5m`
  - 🟠 **Warning**: `2.5m - 4.5m`
  - 🔴 **Danger**: Exceeds `4.5m` (up to `15.0m`)
  - 🟣 **SENSOR FAULT**: Outside `0.0m - 15.0m` (Impossible Reading)
- ➕ **Add Reading Form**: Interactive form with live threshold preview meter and computed delta preview (`Δ Baseline`).
- 📋 **Telemetry Database Table**: Live location search, status dropdown filters, sorting, record counter, and CRUD modal operations.
- 📈 **Water Trend Analytics**: Interactive hydrological line chart with computed highest, lowest, and average water levels.
- 🚨 **Active Alert Center**: Displays dynamic Yellow Warning Cards, Red Emergency Flash Cards, and Sensor Hardware Fault Cards.

---

## 🛠️ Installation & Running Instructions

```bash
# 1. Clone the Repository
git clone https://github.com/Prasannasuriya/River-Flood-Early-Warning-System-.git
cd River-Flood-Early-Warning-System-

# 2. Install Node.js Dependencies
npm install

# 3. Start Server
npm start
```

Open your web browser at **`http://localhost:5000`**.

---

## 🔑 Admin Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 📁 Project Architecture

```text
River-Flood-Early-Warning-System/
├── 411723104032_PRASANNASURIYA_A_D.mp4.mp4  # Official working video demonstration
├── database/
│   ├── schema.sql           # Database schema & index definitions
│   ├── seed.sql             # 40 realistic seed records + 1 sensor fault record
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

## 👤 Author & Credits

**PRASANNASURIYA A D** (Reg No: 411723104032)  
Department of Computer Science & Engineering  
Prince Shri Venkateshwara Padmavathy Engineering College (PSVPEC)  
GitHub: [@Prasannasuriya](https://github.com/Prasannasuriya)
