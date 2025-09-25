// Pull colors from CSS variables
const css = getComputedStyle(document.documentElement);
const colors = {
  dodger: (css.getPropertyValue('--dodger') || '#3996FA').trim(),
  cerise: (css.getPropertyValue('--cerise') || '#D93D8D').trim(),
  berry: (css.getPropertyValue('--berry') || '#875484').trim(),
  razz: (css.getPropertyValue('--razzmatazz') || '#EB1C6B').trim(),
  text: (css.getPropertyValue('--color-text') || '#e7ecf5').trim(),
  muted: (css.getPropertyValue('--color-muted') || '#a9b3c9').trim()
};

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
    // Helper to parse label to Date (YYYY-MM or YYYY-MM-DD)
    const toDate = (lbl) => {
      if (/^\d{4}-\d{2}$/.test(lbl)) {
        const [yy, mm] = lbl.split('-').map(Number);
        return new Date(yy, mm - 1, 1);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(lbl)) {
        const [yy, mm, dd] = lbl.split('-').map(Number);
        return new Date(yy, mm - 1, dd);
      }
      return null;
    };
    const findNearestIndexTo = (target) => {
      let best = { idx: -1, diff: Infinity };
      chart.data.labels.forEach((lbl, i) => {
        const d = toDate(lbl);
        if (!d) return;
        const diff = Math.abs(d - target);
        if (diff < best.diff) best = { idx: i, diff };
      });
      return best.idx;
    };
    const releases = [
      { label: 'S1 release', date: new Date(2021, 10, 1), color: colors.berry },
      { label: 'S2 release', date: new Date(2024, 10, 1), color: colors.razz }
    ];
    ctx.save();
    releases.forEach(r => {
      let xPos;
      // Try exact label match first (for YYYY-MM labels)
      const monthKey = `${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2, '0')}`;
      const exactIdx = chart.data.labels.indexOf(monthKey);
      if (exactIdx >= 0) {
        xPos = x.getPixelForValue(exactIdx);
      } else {
        const nearIdx = findNearestIndexTo(r.date);
        if (nearIdx < 0) return;
        xPos = x.getPixelForValue(nearIdx);
      }
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
        borderColor: colors.dodger,
        backgroundColor: 'rgba(57,150,250,0.15)',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Social mentions',
        data: socialMentions,
        borderColor: colors.cerise,
        backgroundColor: 'rgba(217,61,141,0.12)',
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
        ticks: { color: colors.muted },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: colors.muted }
      }
    },
    plugins: {
      legend: { position: 'top', labels: { color: colors.text } },
      title: { display: true, text: 'Arcane popularity over time', color: colors.text },
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

// Google Trends CSV import
function parseTrendsCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  const headerIdx = lines.findIndex(l => /^(Week|Month|Day)\s*,/i.test(l));
  if (headerIdx === -1) throw new Error('Could not find data header in CSV.');
  const header = lines[headerIdx].split(',')[0].replace(/"/g, '');
  const rows = lines.slice(headerIdx + 1);
  const dates = [];
  const values = [];
  for (const raw of rows) {
    const parts = raw.split(',');
    if (parts.length < 2) continue;
    const ds = parts[0].replace(/"/g, '').trim();
    const vs = parts[1].replace(/"/g, '').trim();
    const v = Number(vs);
    if (!ds || !Number.isFinite(v)) continue;
    dates.push(ds);
    values.push(v);
  }
  // Aggregate to monthly YYYY-MM
  const bucket = new Map();
  for (let i = 0; i < dates.length; i++) {
    const ds = dates[i];
    // Normalize date to YYYY-MM
    let ym;
    if (/^\d{4}-\d{2}$/.test(ds)) {
      ym = ds;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
      ym = ds.slice(0, 7);
    } else {
      // Try Date parse fallback
      const d = new Date(ds);
      if (isNaN(d)) continue;
      ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (!bucket.has(ym)) bucket.set(ym, []);
    bucket.get(ym).push(values[i]);
  }
  const labels = Array.from(bucket.keys()).sort();
  const monthly = labels.map(k => {
    const arr = bucket.get(k);
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  });
  return { labels, values: monthly };
}

function importTrendsCSV(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { labels, values } = parseTrendsCSV(String(reader.result));
      // Replace labels and search dataset, hide social dataset
      popularityChart.data.labels = labels;
      popularityChart.data.datasets[0].label = 'Google Trends (Arcane)';
      popularityChart.data.datasets[0].data = values;
      popularityChart.setDatasetVisibility(1, false);
      popularityChart.options.plugins.title.text = 'Arcane popularity — Google Trends (monthly)';
      popularityChart.update();
    } catch (e) {
      console.error(e);
      alert('Failed to import CSV. Ensure it is a Google Trends export.');
    }
  };
  reader.readAsText(file);
}

document.getElementById('csv-input')?.addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  if (f) importTrendsCSV(f);
});
