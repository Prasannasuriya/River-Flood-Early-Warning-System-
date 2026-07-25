// Dashboard View Logic with Chart.js Integration
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

        return `
            <tr>
                <td><strong>${escapeHTML(r.reading_id)}</strong></td>
                <td>${escapeHTML(r.location)}</td>
                <td><strong>${r.water_level} m</strong></td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td>${formatTime(r.recorded_time)}</td>
            </tr>
        `;
    }).join('');
}

function initTrendChart(trendData) {
    const ctx = document.getElementById('trendLineChart');
    if (!ctx) return;

    const labels = trendData.map(d => formatShortTime(d.recorded_time));
    const levels = trendData.map(d => d.water_level);

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
                pointBackgroundColor: trendData.map(d => {
                    if (d.status === 'Danger') return '#ef4444';
                    if (d.status === 'Warning') return '#f59e0b';
                    return '#22c55e';
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
                            const item = trendData[idx];
                            return `Location: ${item.location}\nStatus: ${item.status}`;
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
            labels: ['Safe (0-2.5m)', 'Warning (2.5-4.5m)', 'Danger (>4.5m)'],
            datasets: [{
                data: [dist.safe, dist.warning, dist.danger],
                backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
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
                    labels: { color: '#94a3b8', padding: 15, font: { family: 'Inter' } }
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
