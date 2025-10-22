const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Sample API proxy endpoint (example: Wikipedia pageviews)
app.get('/api/wikipedia-pageviews', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const url = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/user/Arcane_(TV_series)/daily/20210101/20251231';
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Wikipedia data' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Open the dashboard in your browser`);
});
