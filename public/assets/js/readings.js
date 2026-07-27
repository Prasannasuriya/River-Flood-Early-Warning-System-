// Reading List Page Logic (Search, Filter, Sort, Count, Change 1 Delta & Change 2 Faults)
let currentReadings = [];
let editModal = null;
let currentEditId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadReadings();

    // Event listeners
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (searchInput) searchInput.addEventListener('input', debounce(loadReadings, 300));
    if (statusFilter) statusFilter.addEventListener('change', loadReadings);
    if (sortFilter) sortFilter.addEventListener('change', loadReadings);
});

async function loadReadings() {
    const searchVal = document.getElementById('search-input')?.value || '';
    const statusVal = document.getElementById('status-filter')?.value || 'All';
    const sortVal = document.getElementById('sort-filter')?.value || 'latest';

    const tbody = document.getElementById('readings-table-body');
    const counterBadge = document.getElementById('record-count');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="state-container">
                    <div class="spinner"></div>
                    <div>Loading water level records...</div>
                </td>
            </tr>
        `;
    }

    try {
        const res = await API.getReadings(searchVal, statusVal, sortVal);
        if (!res.success) throw new Error(res.message);

        currentReadings = res.data;

        if (counterBadge) counterBadge.textContent = `${res.count} Records`;

        renderTable(currentReadings);
    } catch (err) {
        console.error('Failed to load readings:', err);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="state-container">
                        <i class="fas fa-exclamation-triangle state-icon" style="color: var(--status-danger);"></i>
                        <div class="state-title">Failed to load readings</div>
                        <p>${err.message}</p>
                        <button class="btn btn-primary btn-sm" onclick="loadReadings()" style="margin-top: 1rem;">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

function renderTable(readings) {
    const tbody = document.getElementById('readings-table-body');
    if (!tbody) return;

    if (!readings || readings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="state-container">
                    <i class="fas fa-database state-icon"></i>
                    <div class="state-title">No Water Level Records Found</div>
                    <p>Try adjusting your search query or filters.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = readings.map(r => {
        let badgeClass = 'badge-safe';
        if (r.status === 'Warning') badgeClass = 'badge-warning';
        if (r.status === 'Danger') badgeClass = 'badge-danger';
        if (r.status === 'SENSOR FAULT') badgeClass = 'badge-fault';

        // Change 1: Internal calculated baseline delta
        const diff = (parseFloat(r.water_level) - 2.50);
        const formattedDelta = diff >= 0 ? `+${diff.toFixed(2)}m` : `${diff.toFixed(2)}m`;

        return `
            <tr>
                <td><strong>${escapeHTML(r.reading_id)}</strong></td>
                <td><code style="color: var(--accent-blue);">${escapeHTML(r.device_id)}</code></td>
                <td><i class="fas fa-map-marker-alt" style="color: var(--accent-blue); margin-right: 6px;"></i> ${escapeHTML(r.location)}</td>
                <td>
                    <strong style="font-size: 1.05rem;">${r.water_level} m</strong>
                    <span class="delta-tag" title="Change 1: Internal calculated difference from 2.5m safe baseline">Δ ${formattedDelta}</span>
                </td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td>${formatDateTime(r.recorded_time)}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${r.id})" title="Edit Reading">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="confirmDelete(${r.id}, '${escapeHTML(r.reading_id)}')" title="Delete Reading">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openEditModal(id) {
    const item = currentReadings.find(r => r.id === id);
    if (!item) return;

    currentEditId = id;
    document.getElementById('edit-reading-id').value = item.reading_id;
    document.getElementById('edit-device-id').value = item.device_id;
    document.getElementById('edit-location').value = item.location;
    document.getElementById('edit-water-level').value = item.water_level;
    document.getElementById('edit-recorded-time').value = item.recorded_time.replace(' ', 'T').substring(0, 16);
    document.getElementById('edit-notes').value = item.notes || '';

    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'flex';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
    currentEditId = null;
}

async function handleUpdateFormSubmit(e) {
    e.preventDefault();
    if (!currentEditId) return;

    const device_id = document.getElementById('edit-device-id').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const water_level = parseFloat(document.getElementById('edit-water-level').value);
    const recorded_time = document.getElementById('edit-recorded-time').value.replace('T', ' ');
    const notes = document.getElementById('edit-notes').value.trim();

    try {
        const res = await API.updateReading(currentEditId, {
            device_id, location, water_level, recorded_time, notes
        });

        if (!res.success) throw new Error(res.message);

        Toast.success('Reading record updated successfully');
        closeEditModal();
        loadReadings();
    } catch (err) {
        Toast.error(err.message || 'Failed to update reading');
    }
}

async function confirmDelete(id, readingId) {
    if (confirm(`Are you sure you want to delete water level record "${readingId}"?`)) {
        try {
            const res = await API.deleteReading(id);
            if (!res.success) throw new Error(res.message);
            Toast.success(`Record "${readingId}" deleted`);
            loadReadings();
        } catch (err) {
            Toast.error(err.message || 'Failed to delete record');
        }
    }
}

function formatDateTime(str) {
    if (!str) return 'N/A';
    const d = new Date(str);
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
