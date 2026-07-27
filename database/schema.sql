-- SQL Schema for River Flood Early Warning System (SIH 2026 Level 2)
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reading_id TEXT NOT NULL UNIQUE,
    device_id TEXT NOT NULL,
    location TEXT NOT NULL,
    water_level REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Safe', 'Warning', 'Danger', 'SENSOR FAULT')),
    recorded_time DATETIME NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for optimized queries on location, status, and timestamp
CREATE INDEX IF NOT EXISTS idx_readings_location ON readings(location);
CREATE INDEX IF NOT EXISTS idx_readings_status ON readings(status);
CREATE INDEX IF NOT EXISTS idx_readings_recorded_time ON readings(recorded_time);
