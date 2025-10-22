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

const STORAGE_KEY = 'arcane_trends_monthly';

function saveImportedData(labels, values) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ labels, values, ts: Date.now() }));
  } catch (e) { console.warn('Could not save to localStorage', e); }
}

function loadCachedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj && obj.labels && obj.values ? obj : null;
  } catch (e) { return null; }
}

function resetToSimulated() {
  // Call this to restore the original simulated dataset and label set.
  popularityChart.data.labels = labels; // original simulated labels variable
  popularityChart.data.datasets[0].data = searchInterest; // original simulated dataset
  popularityChart.setDatasetVisibility(1, true);
  popularityChart.options.plugins.title.text = 'Arcane popularity over time';
  popularityChart.update();
  localStorage.removeItem(STORAGE_KEY);
}

function importTrendsCSV(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { labels: newLabels, values: monthly } = parseTrendsCSV(String(reader.result));
      popularityChart.data.labels = newLabels;
      popularityChart.data.datasets[0].label = 'Google Trends (Arcane)';
      popularityChart.data.datasets[0].data = monthly;
      popularityChart.setDatasetVisibility(1, false);
      popularityChart.options.plugins.title.text = 'Arcane popularity — Google Trends (monthly)';
      popularityChart.update();
      saveImportedData(newLabels, monthly); // <- save
    } catch (e) {
      console.error(e);
      alert('Failed to import CSV. Ensure it is a Google Trends export.');
    }
  };
  reader.readAsText(file);
}

// ---- helper: safe base64 encode/decode for unicode ----
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode('0x' + p1)));
}
function b64DecodeUnicode(b64) {
  return decodeURIComponent(Array.prototype.map.call(atob(b64), c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

// ---- export current chart data as CSV ----
function downloadChartCSV() {
  const labels = popularityChart.data.labels || [];
  const ds0 = popularityChart.data.datasets[0] || { data: [] };
  const ds1 = popularityChart.data.datasets[1] || { data: [] };
  const header = ['date', ds0.label || 'series1', ds1.label || 'series2'].join(',') + '\n';
  const rows = labels.map((lab, i) => {
    const a = ds0.data?.[i] ?? '';
    const b = ds1.data?.[i] ?? '';
    return `${lab},${a},${b}`;
  }).join('\n');
  const csv = header + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'arcane_popularity.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- create a shareable link containing current chart data (URL hash) ----
function makeShareLink() {
  const payload = {
    labels: popularityChart.data.labels,
    datasets: popularityChart.data.datasets.map(d => ({ label: d.label, data: d.data }))
  };
  try {
    const encoded = b64EncodeUnicode(JSON.stringify(payload));
    const link = `${location.origin}${location.pathname}#${encoded}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => alert('Share link copied to clipboard!'));
    } else {
      prompt('Copy this link to share', link);
    }
  } catch (e) {
    console.error('Could not create share link', e);
    alert('Failed to create share link.');
  }
}

// ---- load chart data from URL hash if present ----
function loadFromHash() {
  const hash = location.hash && location.hash.slice(1);
  if (!hash) return false;
  try {
    const json = b64DecodeUnicode(hash);
    const obj = JSON.parse(json);
    if (obj && obj.labels && obj.datasets) {
      popularityChart.data.labels = obj.labels;
      // try to map datasets back (keep existing colors/options)
      obj.datasets.forEach((d, i) => {
        if (!popularityChart.data.datasets[i]) return;
        popularityChart.data.datasets[i].label = d.label;
        popularityChart.data.datasets[i].data = d.data;
      });
      popularityChart.setDatasetVisibility(1, true);
      popularityChart.options.plugins.title.text = 'Arcane popularity — shared view';
      popularityChart.update();
      return true;
    }
  } catch (e) {
    console.warn('Failed to load shared data from URL hash', e);
  }
  return false;
}

// Ensure handlers run after DOM content loads
document.addEventListener('DOMContentLoaded', () => {
  const cached = loadCachedData();
  if (cached) {
    popularityChart.data.labels = cached.labels;
    popularityChart.data.datasets[0].data = cached.values;
    popularityChart.setDatasetVisibility(1, false);
    popularityChart.options.plugins.title.text = 'Arcane popularity — Google Trends (cached)';
    popularityChart.update();
  }
  
  document.getElementById('reset-data')?.addEventListener('click', resetToSimulated);

  // View toggle handlers
  document.getElementById('show-chart')?.addEventListener('click', () => {
    document.getElementById('chart-container').style.display = 'block';
    document.getElementById('trends-container').style.display = 'none';
    document.getElementById('show-chart').classList.add('btn-active');
    document.getElementById('show-trends').classList.remove('btn-active');
  });

  document.getElementById('show-trends')?.addEventListener('click', () => {
    document.getElementById('chart-container').style.display = 'none';
    document.getElementById('trends-container').style.display = 'block';
    document.getElementById('show-chart').classList.remove('btn-active');
    document.getElementById('show-trends').classList.add('btn-active');
  });

  // Bind new buttons
  document.getElementById('btn-download')?.addEventListener('click', downloadChartCSV);
  document.getElementById('btn-share')?.addEventListener('click', makeShareLink);

  // If there's a hash payload, load it (overrides cache/simulated)
  const used = loadFromHash();
  if (!used) {
    // existing cached-data restore code already runs elsewhere; nothing more to do
  }
});
