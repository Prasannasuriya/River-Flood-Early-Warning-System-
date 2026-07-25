// Alerts Page Logic - Dynamic Warning (Yellow) and Danger (Red) Alert Cards
document.addEventListener('DOMContentLoaded', () => {
    loadAlerts();
});

async function loadAlerts() {
    const container = document.getElementById('alerts-container');
    const warningCountEl = document.getElementById('alert-count-warning');
    const dangerCountEl = document.getElementById('alert-count-danger');

    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <div class="spinner"></div>
            <div>Scanning monitoring stations for active flood warnings...</div>
        </div>
    `;

    try {
        const data = await API.getDashboard();
        if (!data.success) throw new Error(data.message);

        const alerts = data.alerts;

        const warnings = alerts.filter(a => a.status === 'Warning');
        const dangers = alerts.filter(a => a.status === 'Danger');

        if (warningCountEl) warningCountEl.textContent = `${warnings.length} Active Warnings`;
        if (dangerCountEl) dangerCountEl.textContent = `${dangers.length} Emergency Dangers`;

        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1;" class="glass-card state-container">
                    <i class="fas fa-shield-alt state-icon" style="color: var(--status-safe);"></i>
                    <div class="state-title">ALL MONITORING STATIONS NORMAL</div>
                    <p>No active flood warning or emergency danger alerts recorded.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(a => {
            const isDanger = a.status === 'Danger';
            const cardClass = isDanger ? 'danger-card' : 'warning-card';
            const icon = isDanger ? 'fa-biohazard' : 'fa-exclamation-triangle';
            const titleText = isDanger ? 'RED EMERGENCY FLOOD ALERT' : 'YELLOW WATER WARNING';
            const thresholdText = isDanger ? 'Exceeds 4.5m Danger Limit' : 'Exceeds 2.5m Warning Threshold';

            return `
                <div class="alert-card ${cardClass}">
                    <div class="alert-header">
                        <div class="alert-title">
                            <i class="fas ${icon}"></i>
                            <span>${titleText}</span>
                        </div>
                        <span class="badge ${isDanger ? 'badge-danger' : 'badge-warning'}">${a.status}</span>
                    </div>

                    <div class="alert-level-display">
                        ${a.water_level} meters
                    </div>

                    <div class="alert-body">
                        <div>Station Location: <strong>${escapeHTML(a.location)}</strong></div>
                        <div>Reading ID: <strong>${escapeHTML(a.reading_id)}</strong></div>
                        <div>Telemetry Device: <code>${escapeHTML(a.device_id)}</code></div>
                        <div>Threshold Status: <strong>${thresholdText}</strong></div>
                        <div>Timestamp: <strong>${formatDateTime(a.recorded_time)}</strong></div>
                        ${a.notes ? `<div style="margin-top: 0.4rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 6px;">Note: ${escapeHTML(a.notes)}</div>` : ''}
                    </div>

                    <div style="margin-top: 1.2rem; display: flex; justify-content: flex-end;">
                        <a href="readings.html?search=${encodeURIComponent(a.location)}" class="btn btn-secondary btn-sm">
                            <i class="fas fa-eye"></i> View Station Readings
                        </a>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Error loading alerts:', err);
        container.innerHTML = `
            <div style="grid-column: 1 / -1;" class="glass-card state-container">
                <i class="fas fa-exclamation-circle state-icon" style="color: var(--status-danger);"></i>
                <div class="state-title">Failed to load active alerts</div>
                <p>${err.message}</p>
            </div>
        `;
    }
}

function formatDateTime(str) {
    if (!str) return 'N/A';
    const d = new Date(str);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
