// D3.js visualization

let graphData = null;
let simulation = null;

function visualizeGraph(container, data, results = null) {
    const width = container.clientWidth;
    const height = 500;
    
    d3.select(container).selectAll('*').remove();
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g');
    
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => g.attr('transform', event.transform));
    
    svg.call(zoom);
    
    const nodes = data.nodes.map(id => ({ id }));
    const links = data.edges.map(e => ({ source: e.from, target: e.to, weight: e.weight }));
    
    simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Add arrow markers for directed graphs
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999');

    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 3)
        .attr('marker-end', data.directed ? 'url(#arrowhead)' : null);
    
    const linkLabelGroup = g.append('g')
        .selectAll('g')
        .data(links)
        .join('g');
    
    linkLabelGroup.append('circle')
        .attr('r', 15)
        .attr('fill', '#6366f1')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    
    const linkLabel = linkLabelGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(d => d.weight);
    
    const node = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', 20)
        .attr('fill', '#6366f1')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    const nodeLabel = g.append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .text(d => d.id);
    
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        linkLabelGroup
            .attr('transform', d => `translate(${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        nodeLabel
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    if (results && results.path) {
        const pathSet = new Set(results.path);
        node.attr('fill', d => pathSet.has(d.id) ? '#10b981' : '#6366f1');
    }
    
    if (results && results.mstEdges) {
        const mstSet = new Set(results.mstEdges.map(e => `${e.from}-${e.to}`));
        link.attr('stroke', d => {
            const key1 = `${d.source.id}-${d.target.id}`;
            const key2 = `${d.target.id}-${d.source.id}`;
            return mstSet.has(key1) || mstSet.has(key2) ? '#10b981' : '#999';
        }).attr('stroke-width', d => {
            const key1 = `${d.source.id}-${d.target.id}`;
            const key2 = `${d.target.id}-${d.source.id}`;
            return mstSet.has(key1) || mstSet.has(key2) ? 5 : 3;
        });
        
        linkLabelGroup.select('circle').attr('fill', d => {
            const key1 = `${d.source.id}-${d.target.id}`;
            const key2 = `${d.target.id}-${d.source.id}`;
            return mstSet.has(key1) || mstSet.has(key2) ? '#10b981' : '#6366f1';
        });
        
        node.attr('fill', '#10b981');
    }
    
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

function displayResults(container, algorithm, results) {
    let html = `<h3>${algorithm} Results</h3>`;
    
    if (results.error) {
        html += `<p style="color: #ef4444;">${results.error}</p>`;
    } else if (results.mstEdges) {
        html += `<h4>Minimum Spanning Tree:</h4>`;
        html += `<p style="font-size:1.2rem;color:#10b981;"><strong>Total Weight: ${results.totalWeight}</strong></p>`;
        html += '<h4>MST Tree Structure:</h4>';
        html += '<div style="background:#f0fdf4;padding:1rem;border-radius:0.5rem;border:2px solid #10b981;margin-bottom:1rem;">';
        html += '<pre style="margin:0;font-family:monospace;font-size:1rem;">';
        results.mstEdges.forEach(({ from, to, weight }, i) => {
            html += `${i + 1}. ${from} ═══[${weight}]═══ ${to}\n`;
        });
        html += '</pre></div>';
    } else if (results.distances) {
        if (typeof results.distances === 'object' && !Array.isArray(results.distances)) {
            if (Object.values(results.distances)[0] && typeof Object.values(results.distances)[0] === 'object') {
                // Floyd-Warshall matrix
                html += '<h4>Distance Matrix:</h4><pre>';
                const nodes = Object.keys(results.distances);
                html += '     ' + nodes.join('  ') + '\n';
                nodes.forEach(i => {
                    html += i + '  ';
                    nodes.forEach(j => {
                        const d = results.distances[i][j];
                        html += (d === Infinity ? '∞' : d).toString().padStart(3) + ' ';
                    });
                    html += '\n';
                });
                html += '</pre>';
            } else {
                // Single source distances
                html += '<h4>Distances from Source:</h4><ul>';
                Object.entries(results.distances).forEach(([node, dist]) => {
                    html += `<li>${node}: ${dist === Infinity ? '∞' : dist}</li>`;
                });
                html += '</ul>';
            }
        }
    }
    
    if (results.steps && results.steps.length > 0) {
        html += `<h4>Steps (showing first 100):</h4><ol>`;
        results.steps.slice(0, 100).forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += '</ol>';
    }
    
    container.innerHTML = html;
}
