// Water Trend Analysis Page Logic
let trendChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadTrendData();
});

async function loadTrendData() {
    try {
        const data = await API.getDashboard();
        if (!data.success) throw new Error(data.message);

        const stats = data.statistics;
        const trendData = data.trendData;

        // Populate Summary Metrics Cards
        document.getElementById('stat-highest').textContent = `${stats.highestLevel} m`;
        document.getElementById('stat-lowest').textContent = `${stats.lowestLevel} m`;
        document.getElementById('stat-average').textContent = `${stats.averageLevel} m`;

        // Render Trend Line Graph
        renderTrendLineChart(trendData);

        // Render Latest Readings Table
        renderLatestReadingsTable(trendData.slice().reverse().slice(0, 10));

    } catch (err) {
        console.error('Error loading trend data:', err);
        Toast.error('Failed to load water trend data');
    }
}

function renderTrendLineChart(trendData) {
    const ctx = document.getElementById('waterTrendChart');
    if (!ctx) return;

    const labels = trendData.map(d => formatDateTimeShort(d.recorded_time));
    const levels = trendData.map(d => d.water_level);

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Water Level (m)',
                data: levels,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: trendData.map(d => {
                    if (d.status === 'Danger') return '#ef4444';
                    if (d.status === 'Warning') return '#f59e0b';
                    return '#22c55e';
                }),
                pointBorderColor: '#ffffff',
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 13 } } },
                tooltip: {
                    callbacks: {
                        afterBody: function(items) {
                            const idx = items[0].dataIndex;
                            const item = trendData[idx];
                            return `Location: ${item.location}\nStatus: ${item.status}\nDevice: ${item.device_id}`;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: {
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'Water Level (meters)', color: '#94a3b8' }
                }
            }
        }
    });
}

function renderLatestReadingsTable(readings) {
    const tbody = document.getElementById('trend-table-body');
    if (!tbody) return;

    if (!readings || readings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No trend records found</td></tr>`;
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
                <td>${formatDateTime(r.recorded_time)}</td>
            </tr>
        `;
    }).join('');
}

function formatDateTime(str) {
    if (!str) return 'N/A';
    const d = new Date(str);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateTimeShort(str) {
    if (!str) return '';
    const d = new Date(str);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}`;
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
