const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getDb } = require('../database/db');
const authRoutes = require('./routes/authRoutes');
const readingRoutes = require('./routes/readingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from /public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        system: 'River Flood Early Warning System',
        developer: 'Prasannasuriya',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use('/api/*', notFoundHandler);
app.use(globalErrorHandler);

// Start server after verifying DB initialization
getDb().then(() => {
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(` River Flood Early Warning System`);
        console.log(` Developed by Prasannasuriya`);
        console.log(` Server running on: http://localhost:${PORT}`);
        console.log(` Database: SQLite (flood_system.db)`);
        console.log(`=======================================================`);
    });
}).catch(err => {
    console.error('Failed to initialize database and launch server:', err);
    process.exit(1);
});

module.exports = app;
