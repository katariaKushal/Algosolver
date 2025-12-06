# AlgoSolver – Shortest Path Visualizer

A static, client-side web application for visualizing shortest path algorithms.

**Developed by Kataria Kushal K. & Patel Kashyap M.**

## Features

- 🎯 **3 Algorithms**: Dijkstra, Bellman-Ford, Floyd-Warshall
- 🎨 **Interactive Visualization**: D3.js powered graph rendering
- 📝 **Multiple Input Modes**: Text input or visual graph builder
- 🌓 **Dark/Light Mode**: Toggle for comfortable viewing
- 💾 **LocalStorage**: Saves your last graph
- 📤 **Export Results**: Download results as text file
- 📱 **Responsive**: Works on mobile and desktop

## Quick Start

1. Open `index.html` in your browser
2. Navigate to "Algorithms" section
3. Enter graph data or build visually
4. Select algorithm and source node
5. Click "Run Algorithm"

## Input Format

Text input format (one edge per line):
```
A B 4
A C 2
B C 1
B D 5
C D 8
```

Format: `FROM TO WEIGHT`

## Deployment

This is a static website. Deploy to:
- **GitHub Pages**: Push to repo, enable Pages
- **Netlify**: Drag and drop folder
- **Vercel**: Import project

No build process or backend required!

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and themes
- `algorithms.js` - Algorithm implementations
- `visualizer.js` - D3.js visualization
- `app.js` - Application logic

## Algorithms

### Dijkstra's Algorithm
- Single-source shortest path
- Non-negative weights only
- Time: O((V + E) log V)

### Bellman-Ford Algorithm
- Single-source shortest path
- Handles negative weights
- Detects negative cycles
- Time: O(VE)

### Floyd-Warshall Algorithm
- All-pairs shortest path
- Returns distance matrix
- Time: O(V³)

## Browser Support

Works in all modern browsers with JavaScript enabled.

---

© 2024 AlgoSolver. Developed by Kataria Kushal K. & Patel Kashyap M.
