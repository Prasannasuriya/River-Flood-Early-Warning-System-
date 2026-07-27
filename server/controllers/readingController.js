const { getDb } = require('../../database/db');

// Valid Sensor Range for Telemetry: 0.0m to 15.0m
const MIN_VALID_LEVEL = 0.0;
const MAX_VALID_LEVEL = 15.0;
const SAFE_BASELINE = 2.50; // Reference baseline for Change 1 computed delta

// Change 2: Handle broken sensor reading (impossible value out of bounds)
const calculateStatus = (waterLevel) => {
    const level = parseFloat(waterLevel);
    if (isNaN(level)) return 'SENSOR FAULT';

    // Sensor Fault check: values outside real physical gauge range [0.0m - 15.0m]
    if (level < MIN_VALID_LEVEL || level > MAX_VALID_LEVEL) {
        return 'SENSOR FAULT';
    }

    if (level <= 2.5) return 'Safe';
    if (level <= 4.5) return 'Warning';
    return 'Danger';
};

// Change 1: Compute internal baseline delta (difference from 2.50m safe threshold)
const computeInternalDelta = (waterLevel) => {
    const level = parseFloat(waterLevel);
    if (isNaN(level)) return 0;
    const diff = level - SAFE_BASELINE;
    return Math.round(diff * 100) / 100;
};

// Helper to format reading record with computed Change 1 values
const formatReadingRecord = (r) => {
    if (!r) return null;
    const delta = computeInternalDelta(r.water_level);
    const formattedDelta = delta >= 0 ? `+${delta.toFixed(2)}m` : `${delta.toFixed(2)}m`;
    return {
        ...r,
        computed_delta: delta,
        formatted_delta: formattedDelta
    };
};

// GET /api/readings
const getReadings = async (req, res) => {
    try {
        const db = await getDb();
        const { search, status, sort } = req.query;

        let query = "SELECT * FROM readings WHERE 1=1";
        const params = [];

        if (search && search.trim() !== '') {
            query += " AND (location LIKE ? OR device_id LIKE ? OR reading_id LIKE ?)";
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (status && status.trim() !== '' && status !== 'All') {
            query += " AND status = ?";
            params.push(status.trim());
        }

        // Sorting
        if (sort === 'oldest') {
            query += " ORDER BY recorded_time ASC";
        } else if (sort === 'level_high') {
            query += " ORDER BY water_level DESC";
        } else if (sort === 'level_low') {
            query += " ORDER BY water_level ASC";
        } else {
            // Default latest
            query += " ORDER BY recorded_time DESC, id DESC";
        }

        const rawReadings = db.all(query, params);
        const readings = rawReadings.map(formatReadingRecord);

        return res.json({
            success: true,
            count: readings.length,
            data: readings
        });
    } catch (err) {
        console.error('Error fetching readings:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve water level readings' });
    }
};

// GET /api/readings/:id
const getReadingById = async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const reading = db.get("SELECT * FROM readings WHERE id = ?", [id]);

        if (!reading) {
            return res.status(404).json({ success: false, message: 'Reading record not found' });
        }

        return res.json({ success: true, data: formatReadingRecord(reading) });
    } catch (err) {
        console.error('Error fetching reading by id:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving reading' });
    }
};

// POST /api/readings
const createReading = async (req, res) => {
    try {
        const db = await getDb();
        const { reading_id, device_id, location, water_level, recorded_time, notes } = req.body;

        // Validation
        const errors = [];
        if (!reading_id || String(reading_id).trim() === '') errors.push('Reading ID is required');
        if (!device_id || String(device_id).trim() === '') errors.push('Device ID is required');
        if (!location || String(location).trim() === '') errors.push('Location is required');
        if (water_level === undefined || water_level === null || isNaN(parseFloat(water_level))) {
            errors.push('Water Level must be a valid numeric value');
        }
        if (!recorded_time || String(recorded_time).trim() === '') errors.push('Recorded Time is required');

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors, message: errors.join(', ') });
        }

        // Check uniqueness of reading_id
        const existing = db.get("SELECT id FROM readings WHERE reading_id = ?", [reading_id.trim()]);
        if (existing) {
            return res.status(400).json({ success: false, message: `Reading ID "${reading_id}" already exists.` });
        }

        const numLevel = parseFloat(water_level);
        const status = calculateStatus(numLevel);
        
        let cleanNotes = notes && String(notes).trim() !== '' ? String(notes).trim() : null;
        
        // Change 2: Append fault warning to notes if sensor is broken/impossible reading
        if (status === 'SENSOR FAULT') {
            const faultMsg = `[FAULT: Impossible sensor reading (${numLevel}m outside valid range 0-15m) - Ignored for flood alarm]`;
            cleanNotes = cleanNotes ? `${cleanNotes} ${faultMsg}` : faultMsg;
            console.warn(`[SENSOR FAULT DETECTED] Device ${device_id} reported impossible reading: ${numLevel}m. Treated as hardware fault.`);
        }

        db.run(
            `INSERT INTO readings (reading_id, device_id, location, water_level, status, recorded_time, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [reading_id.trim(), device_id.trim(), location.trim(), numLevel, status, recorded_time.trim(), cleanNotes]
        );

        const newReading = db.get("SELECT * FROM readings WHERE reading_id = ?", [reading_id.trim()]);

        return res.status(201).json({
            success: true,
            message: status === 'SENSOR FAULT' 
                ? 'Impossible sensor reading recorded as SENSOR FAULT (False alarm prevented)'
                : 'Water level reading recorded successfully',
            data: formatReadingRecord(newReading)
        });
    } catch (err) {
        console.error('Error creating reading:', err);
        return res.status(500).json({ success: false, message: 'Server error saving reading record' });
    }
};

// PUT /api/readings/:id
const updateReading = async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const { device_id, location, water_level, recorded_time, notes } = req.body;

        const existing = db.get("SELECT * FROM readings WHERE id = ?", [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Reading record not found' });
        }

        const errors = [];
        if (!device_id || String(device_id).trim() === '') errors.push('Device ID is required');
        if (!location || String(location).trim() === '') errors.push('Location is required');
        if (water_level === undefined || water_level === null || isNaN(parseFloat(water_level))) {
            errors.push('Water Level must be a valid numeric value');
        }
        if (!recorded_time || String(recorded_time).trim() === '') errors.push('Recorded Time is required');

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors, message: errors.join(', ') });
        }

        const numLevel = parseFloat(water_level);
        const status = calculateStatus(numLevel);
        let cleanNotes = notes && String(notes).trim() !== '' ? String(notes).trim() : null;

        if (status === 'SENSOR FAULT') {
            const faultMsg = `[FAULT: Impossible reading (${numLevel}m)]`;
            cleanNotes = cleanNotes ? `${cleanNotes} ${faultMsg}` : faultMsg;
        }

        db.run(
            `UPDATE readings 
             SET device_id = ?, location = ?, water_level = ?, status = ?, recorded_time = ?, notes = ?
             WHERE id = ?`,
            [device_id.trim(), location.trim(), numLevel, status, recorded_time.trim(), cleanNotes, id]
        );

        const updated = db.get("SELECT * FROM readings WHERE id = ?", [id]);

        return res.json({
            success: true,
            message: 'Reading record updated successfully',
            data: formatReadingRecord(updated)
        });
    } catch (err) {
        console.error('Error updating reading:', err);
        return res.status(500).json({ success: false, message: 'Server error updating reading' });
    }
};

// DELETE /api/readings/:id
const deleteReading = async (req, res) => {
    try {
        const db = await getDb();
        const { id } = req.params;

        const existing = db.get("SELECT * FROM readings WHERE id = ?", [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Reading record not found' });
        }

        db.run("DELETE FROM readings WHERE id = ?", [id]);

        return res.json({
            success: true,
            message: `Reading "${existing.reading_id}" deleted successfully`
        });
    } catch (err) {
        console.error('Error deleting reading:', err);
        return res.status(500).json({ success: false, message: 'Server error deleting reading' });
    }
};

module.exports = {
    getReadings,
    getReadingById,
    createReading,
    updateReading,
    deleteReading,
    calculateStatus,
    computeInternalDelta
};
