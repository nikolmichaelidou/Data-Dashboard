# Arcane Popularity Dashboard ✨📈

Visualize how Arcane’s hype rises and falls over time — sleek dark theme, smooth lines, and data you control. 🔮

## Features
- 🗺️ Chart.js line chart with release markers (S1 + S2)
- 🎨 Arcane-inspired color palette (edit in `styles.css`)
- 📥 Import Google Trends CSV directly in the UI
- 🔀 Toggle datasets on/off

## Quick start
- Open `index.html` in your browser and enjoy. 🚀  
- Want real data? Click “Open Google Trends,” export CSV, then “Import Google Trends CSV.”  
- From the dev container you can open Trends in your host browser:  
  `$BROWSER https://trends.google.com/trends/explore?q=Arcane`

## New quick tricks
- 📥 "Download CSV" — export the visible chart data for analysis/export.
- 🔗 "Share link" — create a permalink that encodes the chart data in the URL hash (copy & paste to share).

## Data ideas
- 🔎 Google Trends (Interest over time)
- 📚 Wikipedia Pageviews (Arcane TV series)
- 🎬 TMDB/IMDb ratings and popularity

## Contributing
- Found a bug or have an idea? Open an issue or PR. Keep changes small and documented. 🛠️
- Add tests/data fixtures when adding new data sources.

## Roadmap (short)
- Add a tiny backend to fetch & cache Google Trends / TMDB / Wikipedia data.
- Add scheduled updates and a small API to avoid CORS and rate limits.
- Improve accessibility and mobile layout.
- Add automated tests and CI (GitHub Actions). ✅

Have fun exploring Piltover vs. Zaun vibes! 🧪⚙️