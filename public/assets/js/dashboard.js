// Dashboard View Logic with SIH 2026 Level 2 (Change 1 Computed Delta & Change 2 Fault Handling)
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

let trendChart = null;
let statusPieChart = null;

async function loadDashboard() {
    try {
        const data = await API.getDashboard();
        if (!data.success) throw new Error(data.message);

        const summary = data.summary;
        const dist = data.statusDistribution;

        // Render Summary Cards
        document.getElementById('stat-stations').textContent = summary.totalStations;
        document.getElementById('stat-safe').textContent = summary.safeLocations;
        document.getElementById('stat-warning').textContent = summary.warningLocations;
        document.getElementById('stat-danger').textContent = summary.dangerLocations;
        
        const faultEl = document.getElementById('stat-fault');
        if (faultEl) faultEl.textContent = summary.faultLocations || 0;

        document.getElementById('stat-latest-level').textContent = `${summary.latestWaterLevel} m`;
        document.getElementById('stat-latest-location').textContent = `Station: ${summary.latestLocation}`;
        document.getElementById('stat-updated').textContent = formatTime(summary.lastUpdatedTime);

        // Render Recent Activity Table
        renderRecentTable(data.trendData.slice().reverse().slice(0, 5));

        // Render Charts
        initTrendChart(data.trendData);
        initStatusPieChart(dist);

    } catch (err) {
        console.error('Failed loading dashboard data:', err);
        Toast.error('Failed to load live flood monitoring data');
    }
}

function renderRecentTable(readings) {
    const tbody = document.getElementById('recent-readings-body');
    if (!tbody) return;

    if (!readings || readings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No recent records available</td></tr>`;
        return;
    }

    tbody.innerHTML = readings.map(r => {
        let badgeClass = 'badge-safe';
        if (r.status === 'Warning') badgeClass = 'badge-warning';
        if (r.status === 'Danger') badgeClass = 'badge-danger';
        if (r.status === 'SENSOR FAULT') badgeClass = 'badge-fault';

        // Change 1: Display computed baseline delta (e.g. Δ +1.30m)
        const diff = (parseFloat(r.water_level) - 2.50);
        const formattedDelta = diff >= 0 ? `+${diff.toFixed(2)}m` : `${diff.toFixed(2)}m`;

        return `
            <tr>
                <td><strong>${escapeHTML(r.reading_id)}</strong></td>
                <td>${escapeHTML(r.location)}</td>
                <td>
                    <strong>${r.water_level} m</strong> 
                    <span class="delta-tag" title="Change 1: Internal computed difference from 2.5m safe baseline">Δ ${formattedDelta}</span>
                </td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td>${formatTime(r.recorded_time)}</td>
            </tr>
        `;
    }).join('');
}

function initTrendChart(trendData) {
    const ctx = document.getElementById('trendLineChart');
    if (!ctx) return;

    // Filter out impossible sensor faults from trend line graph
    const validData = trendData.filter(d => d.status !== 'SENSOR FAULT');

    const labels = validData.map(d => formatShortTime(d.recorded_time));
    const levels = validData.map(d => d.water_level);

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Water Level (meters)',
                data: levels,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                fill: true,
                tension: 0.35,
                borderWidth: 3,
                pointBackgroundColor: validData.map(d => {
                    if (d.status === 'Danger') return '#ef4444';
                    if (d.status === 'Warning') return '#f59e0b';
                    return '#10b981';
                }),
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { family: 'Inter' } }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(items) {
                            const idx = items[0].dataIndex;
                            const item = validData[idx];
                            const diff = (item.water_level - 2.50).toFixed(2);
                            return `Location: ${item.location}\nStatus: ${item.status}\nBaseline Delta (Change 1): ${diff >= 0 ? '+' : ''}${diff}m`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'Meters (m)', color: '#94a3b8' }
                }
            }
        }
    });
}

function initStatusPieChart(dist) {
    const ctx = document.getElementById('statusPieChart');
    if (!ctx) return;

    if (statusPieChart) statusPieChart.destroy();

    statusPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Safe (0-2.5m)', 'Warning (2.5-4.5m)', 'Danger (>4.5m)', 'Sensor Faults (Out of bounds)'],
            datasets: [{
                data: [dist.safe, dist.warning, dist.danger, dist.fault || 0],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#c084fc'],
                borderColor: '#111827',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 12, font: { family: 'Inter', size: 12 } }
                }
            },
            cutout: '65%'
        }
    });
}

function formatTime(timeStr) {
    if (!timeStr) return 'N/A';
    const d = new Date(timeStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatShortTime(timeStr) {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
