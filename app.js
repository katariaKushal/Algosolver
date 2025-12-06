// Main application logic

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href').substring(1);
        showSection(target);
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
}

// Input mode toggle
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.mode;
        document.getElementById('textInputMode').style.display = mode === 'text' ? 'block' : 'none';
        document.getElementById('visualInputMode').style.display = mode === 'visual' ? 'block' : 'none';
    });
});

// Visual graph builder
let visualNodes = [];
let visualEdges = [];
let edgeMode = false;
let selectedNode = null;

document.getElementById('addNodeBtn').addEventListener('click', () => {
    const nodeName = prompt('Enter node name:');
    if (nodeName && !visualNodes.includes(nodeName)) {
        visualNodes.push(nodeName);
        updateVisualCanvas();
    }
});

document.getElementById('addEdgeBtn').addEventListener('click', () => {
    if (visualNodes.length < 2) {
        alert('Add at least 2 nodes first');
        return;
    }
    const from = prompt('From node:');
    const to = prompt('To node:');
    const weight = prompt('Weight:', '1');
    
    if (from && to && visualNodes.includes(from) && visualNodes.includes(to)) {
        visualEdges.push({ from, to, weight: parseFloat(weight) });
        updateVisualCanvas();
    }
});

document.getElementById('removeNodeBtn').addEventListener('click', () => {
    if (visualNodes.length === 0) {
        alert('No nodes to remove');
        return;
    }
    const nodeName = prompt('Enter node name to remove:');
    if (nodeName && visualNodes.includes(nodeName)) {
        visualNodes = visualNodes.filter(n => n !== nodeName);
        visualEdges = visualEdges.filter(e => e.from !== nodeName && e.to !== nodeName);
        updateVisualCanvas();
    }
});

document.getElementById('removeEdgeBtn').addEventListener('click', () => {
    if (visualEdges.length === 0) {
        alert('No edges to remove');
        return;
    }
    const from = prompt('From node:');
    const to = prompt('To node:');
    if (from && to) {
        const index = visualEdges.findIndex(e => e.from === from && e.to === to);
        if (index !== -1) {
            visualEdges.splice(index, 1);
            updateVisualCanvas();
        } else {
            alert('Edge not found');
        }
    }
});

document.getElementById('clearGraphBtn').addEventListener('click', () => {
    visualNodes = [];
    visualEdges = [];
    updateVisualCanvas();
});

function updateVisualCanvas() {
    const canvas = document.getElementById('graphCanvas');
    if (visualNodes.length === 0) {
        canvas.innerHTML = '<p style="text-align:center;padding:2rem;color:#999;">Click "Add Node" to start building your graph</p>';
        return;
    }
    
    const directed = document.getElementById('directed').checked;
    const data = {
        nodes: visualNodes,
        edges: visualEdges,
        directed: directed
    };
    
    visualizeGraph(canvas, data);
}

// Run algorithm
document.getElementById('runBtn').addEventListener('click', () => {
    const algorithm = document.getElementById('algorithmSelect').value;
    const mode = document.querySelector('.mode-btn.active').dataset.mode;
    
    let data;
    if (mode === 'text') {
        const text = document.getElementById('graphInput').value.trim();
        if (!text) {
            alert('Please enter graph data');
            return;
        }
        const directed = document.getElementById('directed').checked;
        data = parseGraph(text, directed);
    } else {
        if (visualNodes.length === 0) {
            alert('Please build a graph first');
            return;
        }
        const directed = document.getElementById('directed').checked;
        data = {
            nodes: visualNodes,
            edges: visualEdges,
            directed: directed
        };
    }
    
    const source = document.getElementById('sourceNode').value.trim() || data.nodes[0];
    
    if (!data.nodes.includes(source) && algorithm !== 'floyd-warshall') {
        alert('Source node not found in graph');
        return;
    }
    
    let results;
    const graph = buildAdjacencyList(data.edges, data.nodes, data.directed);
    
    if (algorithm === 'dijkstra') {
        results = dijkstra(graph, source);
        results.path = Object.keys(results.distances);
    } else if (algorithm === 'bellman-ford') {
        results = bellmanFord(data.edges, data.nodes, source, data.directed);
        results.path = Object.keys(results.distances);
    } else if (algorithm === 'floyd-warshall') {
        results = floydWarshall(data.edges, data.nodes, data.directed);
    } else if (algorithm === 'astar') {
        const target = prompt('Enter target node:');
        if (!target || !data.nodes.includes(target)) {
            alert('Invalid target node');
            return;
        }
        results = aStar(graph, source, target);
    } else if (algorithm === 'bfs') {
        results = bfs(graph, source);
        results.path = Object.keys(results.distances);
    } else if (algorithm === 'bidirectional') {
        const target = prompt('Enter target node:');
        if (!target || !data.nodes.includes(target)) {
            alert('Invalid target node');
            return;
        }
        results = bidirectionalDijkstra(graph, source, target);
    } else if (algorithm === 'thorup') {
        results = thorup(graph, source);
        results.path = Object.keys(results.distances);
    } else if (algorithm === 'johnson') {
        results = johnson(data.edges, data.nodes, data.directed);
    } else if (algorithm === 'prim') {
        results = prim(data.edges, data.nodes);
    } else if (algorithm === 'kruskal') {
        results = kruskal(data.edges, data.nodes);
    }
    
    const vizContainer = document.getElementById('visualization');
    visualizeGraph(vizContainer, data, results);
    
    const resultsContainer = document.getElementById('results');
    displayResults(resultsContainer, algorithm, results);
    
    // Save to localStorage
    localStorage.setItem('lastGraph', JSON.stringify(data));
});

// Reset
document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('graphInput').value = '';
    document.getElementById('sourceNode').value = '';
    document.getElementById('visualization').innerHTML = '';
    document.getElementById('results').innerHTML = '';
    visualNodes = [];
    visualEdges = [];
    updateVisualCanvas();
});

// Export results
document.getElementById('exportBtn').addEventListener('click', () => {
    const results = document.getElementById('results').innerText;
    if (!results) {
        alert('No results to export');
        return;
    }
    
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algosolver-results.txt';
    a.click();
});

// Load last graph
window.addEventListener('load', () => {
    const lastGraph = localStorage.getItem('lastGraph');
    if (lastGraph) {
        try {
            const data = JSON.parse(lastGraph);
            const text = data.edges.map(e => `${e.from} ${e.to} ${e.weight}`).join('\n');
            document.getElementById('graphInput').value = text;
        } catch (e) {}
    }
});
