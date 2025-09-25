// Generate monthly labels from 2021-01 to 2025-09
const labels = [];
{
  const start = new Date(2021, 0, 1); // Jan 2021
  const end = new Date(2025, 8, 1);   // Sep 2025 (month is 0-based)
  const d = new Date(start);
  while (d <= end) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    labels.push(`${y}-${m}`);
    d.setMonth(d.getMonth() + 1);
  }
}

// Helpers to simulate data
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const gauss = (i, mu, sigma) => Math.exp(-0.5 * Math.pow((i - mu) / sigma, 2));

// Indices for season releases
const s1Label = '2021-11';
const s2Label = '2024-11';
const s1Idx = labels.indexOf(s1Label);
const s2Idx = labels.indexOf(s2Label);

// Simulated datasets
const searchInterest = labels.map((_, i) => {
  const base = 15;
  const spike1 = 85 * gauss(i, s1Idx, 1.5);
  const spike2 = 70 * gauss(i, s2Idx, 1.8);
  const noise = 8 * (Math.random() - 0.5);
  return clamp(Math.round(base + spike1 + spike2 + noise), 0, 100);
});

const socialMentions = labels.map((_, i) => {
  const base = 10 + 5 * Math.sin(i / 6);
  const spike1 = 70 * gauss(i, s1Idx, 2.5);
  const spike2 = 55 * gauss(i, s2Idx, 2.8);
  const noise = 6 * (Math.random() - 0.5);
  return clamp(Math.round(base + spike1 + spike2 + noise), 0, 100);
});

// Plugin to draw vertical lines for release months
const releaseLines = {
  id: 'releaseLines',
  afterDatasetsDraw(chart) {
    const { ctx, scales: { x, y } } = chart;
    const releases = [
      { label: 'S1 release', tick: s1Label, color: '#f59e0b' },
      { label: 'S2 release', tick: s2Label, color: '#10b981' }
    ];
    ctx.save();
    releases.forEach(r => {
      if (!labels.includes(r.tick)) return;
      const xPos = x.getPixelForValue(r.tick);
      ctx.strokeStyle = r.color;
      ctx.fillStyle = r.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xPos, y.top);
      ctx.lineTo(xPos, y.bottom);
      ctx.stroke();
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(r.label, xPos + 4, y.top + 12);
    });
    ctx.restore();
  }
};

// Create chart
const ctx = document.getElementById('popularityChart');
const popularityChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: 'Search interest',
        data: searchInterest,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Social mentions',
        data: socialMentions,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.12)',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: { display: true, text: 'Normalized popularity (0–100)' },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Arcane popularity over time' },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}` } }
    }
  },
  plugins: [releaseLines]
});

// Controls
document.getElementById('chk-search').addEventListener('change', (e) => {
  popularityChart.setDatasetVisibility(0, e.target.checked);
  popularityChart.update();
});
document.getElementById('chk-social').addEventListener('change', (e) => {
  popularityChart.setDatasetVisibility(1, e.target.checked);
  popularityChart.update();
});
