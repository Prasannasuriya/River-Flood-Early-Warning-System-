const { getDb } = require('../../database/db');

// GET /api/dashboard
const getDashboardData = async (req, res) => {
    try {
        const db = await getDb();

        // 1. Total Monitoring Stations (Distinct locations)
        const stationsRes = db.get("SELECT COUNT(DISTINCT location) AS count FROM readings");
        const totalStations = stationsRes ? stationsRes.count : 0;

        // 2. Latest Status per location
        const latestPerLocation = db.all(`
            SELECT r1.*
            FROM readings r1
            INNER JOIN (
                SELECT location, MAX(recorded_time) as max_time
                FROM readings
                GROUP BY location
            ) r2 ON r1.location = r2.location AND r1.recorded_time = r2.max_time
        `);

        let safeLocations = 0;
        let warningLocations = 0;
        let dangerLocations = 0;

        latestPerLocation.forEach(loc => {
            if (loc.status === 'Safe') safeLocations++;
            else if (loc.status === 'Warning') warningLocations++;
            else if (loc.status === 'Danger') dangerLocations++;
        });

        // Overall status breakdown count
        const safeCountRes = db.get("SELECT COUNT(*) AS count FROM readings WHERE status = 'Safe'");
        const warningCountRes = db.get("SELECT COUNT(*) AS count FROM readings WHERE status = 'Warning'");
        const dangerCountRes = db.get("SELECT COUNT(*) AS count FROM readings WHERE status = 'Danger'");

        // 3. Latest Water Level Reading
        const latestReading = db.get("SELECT * FROM readings ORDER BY recorded_time DESC, id DESC LIMIT 1");

        // 4. Statistics (Highest, Lowest, Average Level)
        const statsRes = db.get(`
            SELECT 
                MAX(water_level) AS max_level,
                MIN(water_level) AS min_level,
                AVG(water_level) AS avg_level
            FROM readings
        `);

        // 5. Water Level Trend Data (Chronological 15 latest readings or all)
        const trendReadings = db.all(`
            SELECT id, reading_id, device_id, location, water_level, status, recorded_time 
            FROM readings 
            ORDER BY recorded_time ASC 
            LIMIT 30
        `);

        // 6. Active Alerts (Warning and Danger readings)
        const activeAlerts = db.all(`
            SELECT * FROM readings 
            WHERE status IN ('Warning', 'Danger') 
            ORDER BY recorded_time DESC
        `);

        return res.json({
            success: true,
            summary: {
                totalStations,
                safeLocations,
                warningLocations,
                dangerLocations,
                latestWaterLevel: latestReading ? latestReading.water_level : 0,
                latestLocation: latestReading ? latestReading.location : 'N/A',
                latestReadingId: latestReading ? latestReading.reading_id : 'N/A',
                lastUpdatedTime: latestReading ? latestReading.recorded_time : 'N/A'
            },
            statusDistribution: {
                safe: safeCountRes ? safeCountRes.count : 0,
                warning: warningCountRes ? warningCountRes.count : 0,
                danger: dangerCountRes ? dangerCountRes.count : 0
            },
            statistics: {
                highestLevel: statsRes ? (Math.round(statsRes.max_level * 100) / 100) : 0,
                lowestLevel: statsRes ? (Math.round(statsRes.min_level * 100) / 100) : 0,
                averageLevel: statsRes ? (Math.round(statsRes.avg_level * 100) / 100) : 0
            },
            trendData: trendReadings,
            alerts: activeAlerts
        });
    } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics' });
    }
};

module.exports = { getDashboardData };
