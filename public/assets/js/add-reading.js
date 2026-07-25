// Add Water Level Page Logic & Live Dynamic Status Meter
document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('add-reading-form');
    const waterLevelInput = document.getElementById('water_level');
    const recordedTimeInput = document.getElementById('recorded_time');

    // Default current datetime
    if (recordedTimeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        recordedTimeInput.value = now.toISOString().slice(0, 16);
    }

    // Live threshold status meter
    if (waterLevelInput) {
        waterLevelInput.addEventListener('input', updateStatusPreview);
    }

    if (form) {
        form.addEventListener('submit', handleAddFormSubmit);
    }
});

function updateStatusPreview() {
    const levelVal = parseFloat(document.getElementById('water_level').value);
    const badge = document.getElementById('status-preview-badge');
    const desc = document.getElementById('status-preview-desc');

    if (isNaN(levelVal) || levelVal < 0) {
        badge.className = 'badge badge-safe';
        badge.textContent = 'Enter Level';
        desc.textContent = 'Enter a valid water level in meters to preview threshold status.';
        return;
    }

    if (levelVal <= 2.5) {
        badge.className = 'badge badge-safe';
        badge.innerHTML = '<i class="fas fa-check-circle"></i> SAFE';
        desc.textContent = `Water level ${levelVal}m is within safe operational limits (0 - 2.5m).`;
    } else if (levelVal <= 4.5) {
        badge.className = 'badge badge-warning';
        badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> WARNING';
        desc.textContent = `Water level ${levelVal}m triggers Warning Alert status (2.5 - 4.5m).`;
    } else {
        badge.className = 'badge badge-danger';
        badge.innerHTML = '<i class="fas fa-biohazard"></i> DANGER';
        desc.textContent = `CRITICAL: Water level ${levelVal}m exceeds 4.5m emergency flood threshold!`;
    }
}

async function handleAddFormSubmit(e) {
    e.preventDefault();

    const reading_id = document.getElementById('reading_id').value.trim();
    const device_id = document.getElementById('device_id').value.trim();
    const location = document.getElementById('location').value.trim();
    const water_level = parseFloat(document.getElementById('water_level').value);
    const recorded_time_val = document.getElementById('recorded_time').value;
    const notes = document.getElementById('notes').value.trim();

    // Client-side validation
    const errors = [];
    if (!reading_id) errors.push('Reading ID is required');
    if (!device_id) errors.push('Device ID is required');
    if (!location) errors.push('Location name is required');
    if (isNaN(water_level) || water_level < 0) errors.push('Please enter a valid non-negative water level in meters');
    if (!recorded_time_val) errors.push('Recorded Time is required');

    if (errors.length > 0) {
        Toast.error(errors[0]);
        return;
    }

    const recorded_time = recorded_time_val.replace('T', ' ');

    try {
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;

        const res = await API.createReading({
            reading_id, device_id, location, water_level, recorded_time, notes
        });

        if (!res.success) throw new Error(res.message);

        Toast.success(`Reading "${reading_id}" saved successfully! Status: ${res.data.status}`);

        setTimeout(() => {
            window.location.href = 'readings.html';
        }, 800);

    } catch (err) {
        console.error('Save error:', err);
        Toast.error(err.message || 'Failed to save water level reading');
        const btn = document.getElementById('submit-btn');
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-save"></i> Save Reading Record`;
    }
}
