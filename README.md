# Arcane Popularity Dashboard ✨📈

Visualize how Arcane's hype rises and falls over time — sleek dark theme, smooth lines, and data you control. 🔮

## Features
- 🗺️ Chart.js line chart with release markers (S1 + S2)
- 🎨 Arcane-inspired color palette (edit in `styles.css`)
- 📥 Import Google Trends CSV directly in the UI
- 🔀 Toggle datasets on/off
- 📊 Embedded Google Trends widget
- 💾 Download chart data as CSV
- 🔗 Share links with encoded chart data
- 📦 Load sample data with one click
- 🖥️ Optional Express server with API proxy

## Quick start

### Static (no server)
- Open `index.html` in your browser and enjoy. 🚀

### With server (recommended)
```bash
npm install
npm start
# Open http://localhost:3000 in your browser
```

From the dev container you can also:
```bash
"$BROWSER" http://localhost:3000
```

## Getting real data
- 🔎 **Google Trends**: Click "Open Google Trends," export CSV, then "Import Google Trends CSV"  
- 📦 **Quick test**: Click "Load sample data" to see a demo CSV
- 📚 **Wikipedia Pageviews**: Use the `/api/wikipedia-pageviews` endpoint (when server is running)
- 🎬 **TMDB/IMDb**: Add your own API key and proxy endpoint in `server.js`

## Data ideas
- 🔎 Google Trends (Interest over time)
- 📚 Wikipedia Pageviews (Arcane TV series)
- 🎬 TMDB/IMDb ratings and popularity
- 🐦 Twitter/Reddit mentions (via API)

## Contributing
- Found a bug or have an idea? Open an issue or PR. Keep changes small and documented. 🛠️
- Add tests/data fixtures when adding new data sources.

## Roadmap (short)
- ✅ Add Express server with API proxy
- ✅ Add sample CSV data
- 🔲 Add automated updates and scheduled data fetching
- 🔲 Improve accessibility and mobile layout
- 🔲 Add automated tests and CI (GitHub Actions)

Have fun exploring Piltover vs. Zaun vibes! 🧪⚙️