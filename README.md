# River Flood Early Warning System (Tamil Nadu & Surrounding Regions)

A full-stack, production-quality emergency monitoring web application designed for government flood response, real-time river telemetry monitoring across **Tamil Nadu and surrounding river basins** (Cauvery, Vaigai, Thamirabarani, Bhavani, Palar, Thenpennai, Kollidam, Noyyal, Siruvani, Gundar), and threshold-based automated threat alerts.

![System Preview Placeholder](https://via.placeholder.com/1200x600/0f172a/38bdf8?text=Tamil+Nadu+River+Flood+Early+Warning+System)

---

## 🌟 Key Features

1. **Admin Authentication**:
   - Secure control panel (`Username: admin`, `Password: admin123`).
2. **Interactive Executive Dashboard**:
   - **6 Metric Summary Cards**: Total Monitoring Stations, Safe Locations, Warning Locations, Danger Locations, Latest Water Level, Last Updated Timestamp.
   - **Chart.js Visualizations**: Water Level Trend (Line Chart) and Status Distribution (Doughnut/Pie Chart).
   - **Live Telemetry Stream**.
3. **Add Water Level Telemetry**:
   - Form fields: Reading ID, Device ID, Location, Water Level (meters), Recorded Time, Telemetry Notes.
   - **Automated Threshold Calculation**:
     - 🟢 **Safe**: `0.0m - 2.5m`
     - 🟠 **Warning**: `2.5m - 4.5m`
     - 🔴 **Danger**: Above `4.5m`
   - Real-time client-side validation & live status meter preview.
4. **Reading List Database Table**:
   - Instant search by Tamil Nadu river location names (e.g. *Cauvery*, *Vaigai*, *Thamirabarani*) or telemetry device ID.
   - Dynamic status filter (`All`, `Safe`, `Warning`, `Danger`).
   - Multi-option sorting (latest, oldest, water level high-to-low, low-to-high).
   - Live record counter badge.
   - Full CRUD actions with edit modal and delete confirmation.
5. **Water Trend & Hydrological Analytics**:
   - Interactive line graph displaying chronological water level trends.
   - Summary statistics cards: **Highest Level**, **Lowest Level**, **Average Level**.
6. **Active Alerts Dashboard**:
   - Dynamically scans Tamil Nadu monitoring stations for active flood risks.
   - 🟡 **Yellow Alert Cards**: Automatically generated for `Warning` status.
   - 🔴 **Red Emergency Flash Cards**: Automatically generated for `Danger` status with pulsing glow animations.
7. **SQLite Database & 40 Tamil Nadu Seed Records**:
   - Automatically initializes `flood_system.db` and seeds 40 realistic records across Tamil Nadu river basins.
   - Includes required edge case specifications:
     - 2 similar location names (`Cauvery River - Mettur Dam North` & `Cauvery River - Mettur Dam South`)
     - 1 missing optional value (`notes` NULL for `RD-1015`)
     - 1 unrelated record (`System Test Rig 99`)

---

## 🌊 Monitored River Basins

- **Cauvery River** (Mettur Dam North & South, Delta Sector)
- **Vaigai River** (Madurai Bridge & Causeway)
- **Thamirabarani River** (Tirunelveli Check Dam & Papanasam)
- **Bhavani River** (Bhavanisagar Reservoir)
- **Palar River** (Kanchipuram Intake)
- **Thenpennai River** (Krishnagiri Dam)
- **Kollidam River** (Chidambaram Barrage)
- **Amaravathi River** (Karur Anicut)
- **Noyyal River** (Tiruppur Collectorate Bridge)
- **Siruvani River** (Coimbatore Supply Intake)
- **Gundar River** (Virudhunagar Basin)

---

## 📁 Project Folder Structure

```
D:\Project\river-flood-warning-system\
├── database/
│   ├── schema.sql           # SQLite table schema & performance indexes
│   ├── seed.sql             # SQL seed dataset with 40 Tamil Nadu river records
│   ├── db.js                # Database initialization & WASM/JS persistence engine
│   └── flood_system.db      # Generated SQLite database file
├── server/
│   ├── controllers/
│   │   ├── authController.js      # Admin login authentication logic
│   │   ├── readingController.js   # CRUD operations & threshold calculations
│   │   └── dashboardController.js # Aggregated statistics & chart datasets
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── readingRoutes.js      # /api/readings routes
│   │   └── dashboardRoutes.js    # /api/dashboard routes
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handler & 404 router
│   └── app.js                    # Express application entrypoint
├── public/                       # Served static frontend directory
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css        # Glassmorphism dark theme & design system
│   │   └── js/
│   │       ├── api.js            # Frontend REST API client
│   │       ├── auth.js           # Admin session & navbar state management
│   │       ├── toast.js          # Success/Warning/Error notifications
│   │       ├── dashboard.js      # Dashboard charts & metrics logic
│   │       ├── readings.js       # Reading list table, search, filter & modal
│   │       ├── add-reading.js    # Form validation & live threshold preview
│   │       ├── trend.js          # Hydrological line graph & statistics
│   │       └── alerts.js         # Dynamic yellow/red alert cards generator
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

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Design Tokens, Glassmorphism, Animations), Vanilla JavaScript (ES6+).
- **Icons & Charts**: Font Awesome 6.4 (CDN), Chart.js (CDN).
- **Backend API**: Node.js, Express.js, CORS, Dotenv.
- **Database**: SQLite3 engine with file persistence (`flood_system.db`).

---

## ⚡ Installation & Getting Started

```bash
# 1. Navigate to project directory
cd D:\Project\river-flood-warning-system

# 2. Install Node.js dependencies
npm install

# 3. Launch Express Server
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🔑 Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 🐙 GitHub Push Instructions

```bash
cd D:\Project\river-flood-warning-system
git init
git add .
git commit -m "feat: updated river flood warning system with Tamil Nadu rivers and documentation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/river-flood-warning-system.git
git push -u origin main
```
