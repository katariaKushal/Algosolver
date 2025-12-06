// Graph algorithms implementation

function parseGraph(text, directed = false) {
    const lines = text.trim().split('\n');
    const edges = [];
    const nodes = new Set();
    
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            const from = parts[0];
            const to = parts[1];
            const weight = parts.length >= 3 ? parseFloat(parts[2]) : 1;
            edges.push({ from, to, weight });
            nodes.add(from);
            nodes.add(to);
        }
    });
    
    return { edges, nodes: Array.from(nodes), directed };
}

function buildAdjacencyList(edges, nodes, directed) {
    const graph = {};
    nodes.forEach(node => graph[node] = []);
    
    edges.forEach(({ from, to, weight }) => {
        graph[from].push({ node: to, weight });
        if (!directed) {
            graph[to].push({ node: from, weight });
        }
    });
    
    return graph;
}

function dijkstra(graph, source) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const steps = [];
    
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[source] = 0;
    
    const pq = [{ node: source, dist: 0 }];
    
    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const { node: current } = pq.shift();
        
        if (visited.has(current)) continue;
        visited.add(current);
        
        steps.push(`Visiting ${current} (distance: ${distances[current]})`);
        
        graph[current].forEach(({ node: neighbor, weight }) => {
            const newDist = distances[current] + weight;
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = current;
                pq.push({ node: neighbor, dist: newDist });
                steps.push(`Updated ${neighbor}: ${newDist}`);
            }
        });
    }
    
    return { distances, previous, steps };
}

function bellmanFord(edges, nodes, source, directed) {
    const distances = {};
    const previous = {};
    const steps = [];
    
    nodes.forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[source] = 0;
    
    const edgeList = [...edges];
    if (!directed) {
        edges.forEach(({ from, to, weight }) => {
            edgeList.push({ from: to, to: from, weight });
        });
    }
    
    for (let i = 0; i < nodes.length - 1; i++) {
        let updated = false;
        edgeList.forEach(({ from, to, weight }) => {
            if (distances[from] !== Infinity && distances[from] + weight < distances[to]) {
                distances[to] = distances[from] + weight;
                previous[to] = from;
                updated = true;
                steps.push(`Iteration ${i + 1}: ${from}→${to} = ${distances[to]}`);
            }
        });
        if (!updated) break;
    }
    
    // Check for negative cycles
    for (const { from, to, weight } of edgeList) {
        if (distances[from] !== Infinity && distances[from] + weight < distances[to]) {
            return { error: 'Negative cycle detected', steps };
        }
    }
    
    return { distances, previous, steps };
}

function floydWarshall(edges, nodes, directed) {
    const n = nodes.length;
    const dist = {};
    const next = {};
    const steps = [];
    
    nodes.forEach(i => {
        dist[i] = {};
        next[i] = {};
        nodes.forEach(j => {
            dist[i][j] = i === j ? 0 : Infinity;
            next[i][j] = null;
        });
    });
    
    edges.forEach(({ from, to, weight }) => {
        dist[from][to] = weight;
        next[from][to] = to;
        if (!directed) {
            dist[to][from] = weight;
            next[to][from] = from;
        }
    });
    
    nodes.forEach(k => {
        nodes.forEach(i => {
            nodes.forEach(j => {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                    steps.push(`Via ${k}: ${i}→${j} = ${dist[i][j]}`);
                }
            });
        });
    });
    
    return { distances: dist, next, steps: steps.slice(0, 50) };
}

function reconstructPath(previous, source, target) {
    const path = [];
    let current = target;
    
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    return path[0] === source ? path : [];
}

function prim(edges, nodes) {
    const mstEdges = [];
    const visited = new Set();
    const steps = [];
    let totalWeight = 0;
    
    const start = nodes[0];
    visited.add(start);
    steps.push(`Starting from ${start}`);
    
    const edgeList = [];
    edges.forEach(({ from, to, weight }) => {
        edgeList.push({ from, to, weight });
        edgeList.push({ from: to, to: from, weight });
    });
    
    while (visited.size < nodes.length) {
        let minEdge = null;
        let minWeight = Infinity;
        
        edgeList.forEach(({ from, to, weight }) => {
            if (visited.has(from) && !visited.has(to) && weight < minWeight) {
                minWeight = weight;
                minEdge = { from, to, weight };
            }
        });
        
        if (!minEdge) break;
        
        mstEdges.push(minEdge);
        visited.add(minEdge.to);
        totalWeight += minEdge.weight;
        steps.push(`Added edge ${minEdge.from}→${minEdge.to} (weight: ${minEdge.weight})`);
    }
    
    return { mstEdges, totalWeight, steps };
}

function kruskal(edges, nodes) {
    const mstEdges = [];
    const steps = [];
    let totalWeight = 0;
    
    const parent = {};
    const rank = {};
    
    nodes.forEach(node => {
        parent[node] = node;
        rank[node] = 0;
    });
    
    function find(node) {
        if (parent[node] !== node) {
            parent[node] = find(parent[node]);
        }
        return parent[node];
    }
    
    function union(node1, node2) {
        const root1 = find(node1);
        const root2 = find(node2);
        
        if (root1 !== root2) {
            if (rank[root1] > rank[root2]) {
                parent[root2] = root1;
            } else if (rank[root1] < rank[root2]) {
                parent[root1] = root2;
            } else {
                parent[root2] = root1;
                rank[root1]++;
            }
            return true;
        }
        return false;
    }
    
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    
    sortedEdges.forEach(({ from, to, weight }) => {
        if (union(from, to)) {
            mstEdges.push({ from, to, weight });
            totalWeight += weight;
            steps.push(`Added edge ${from}→${to} (weight: ${weight})`);
        } else {
            steps.push(`Skipped ${from}→${to} (would create cycle)`);
        }
    });
    
    return { mstEdges, totalWeight, steps };
}

function aStar(graph, source, target) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const steps = [];
    
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[source] = 0;
    
    const heuristic = (node) => Math.abs(node.charCodeAt(0) - target.charCodeAt(0));
    const pq = [{ node: source, f: heuristic(source) }];
    
    while (pq.length > 0) {
        pq.sort((a, b) => a.f - b.f);
        const { node: current } = pq.shift();
        
        if (current === target) {
            steps.push(`Reached target ${target}`);
            break;
        }
        
        if (visited.has(current)) continue;
        visited.add(current);
        steps.push(`Visiting ${current}`);
        
        graph[current].forEach(({ node: neighbor, weight }) => {
            const newDist = distances[current] + weight;
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = current;
                pq.push({ node: neighbor, f: newDist + heuristic(neighbor) });
                steps.push(`Updated ${neighbor}: ${newDist}`);
            }
        });
    }
    
    return { distances, previous, steps, path: [target] };
}

function bfs(graph, source) {
    const distances = {};
    const previous = {};
    const steps = [];
    
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[source] = 0;
    
    const queue = [source];
    
    while (queue.length > 0) {
        const current = queue.shift();
        steps.push(`Visiting ${current} (distance: ${distances[current]})`);
        
        graph[current].forEach(({ node: neighbor }) => {
            if (distances[neighbor] === Infinity) {
                distances[neighbor] = distances[current] + 1;
                previous[neighbor] = current;
                queue.push(neighbor);
                steps.push(`Updated ${neighbor}: ${distances[neighbor]}`);
            }
        });
    }
    
    return { distances, previous, steps };
}

function bidirectionalDijkstra(graph, source, target) {
    const distF = {}, distB = {};
    const prevF = {}, prevB = {};
    const visitedF = new Set(), visitedB = new Set();
    const steps = [];
    
    Object.keys(graph).forEach(node => {
        distF[node] = Infinity;
        distB[node] = Infinity;
        prevF[node] = null;
        prevB[node] = null;
    });
    distF[source] = 0;
    distB[target] = 0;
    
    const pqF = [{ node: source, dist: 0 }];
    const pqB = [{ node: target, dist: 0 }];
    let bestDist = Infinity;
    let meetNode = null;
    
    while (pqF.length > 0 || pqB.length > 0) {
        if (pqF.length > 0) {
            pqF.sort((a, b) => a.dist - b.dist);
            const { node: current } = pqF.shift();
            
            if (!visitedF.has(current)) {
                visitedF.add(current);
                steps.push(`Forward: ${current}`);
                
                if (visitedB.has(current)) {
                    const totalDist = distF[current] + distB[current];
                    if (totalDist < bestDist) {
                        bestDist = totalDist;
                        meetNode = current;
                    }
                }
                
                graph[current].forEach(({ node: neighbor, weight }) => {
                    const newDist = distF[current] + weight;
                    if (newDist < distF[neighbor]) {
                        distF[neighbor] = newDist;
                        prevF[neighbor] = current;
                        pqF.push({ node: neighbor, dist: newDist });
                    }
                });
            }
        }
        
        if (pqB.length > 0) {
            pqB.sort((a, b) => a.dist - b.dist);
            const { node: current } = pqB.shift();
            
            if (!visitedB.has(current)) {
                visitedB.add(current);
                steps.push(`Backward: ${current}`);
                
                if (visitedF.has(current)) {
                    const totalDist = distF[current] + distB[current];
                    if (totalDist < bestDist) {
                        bestDist = totalDist;
                        meetNode = current;
                    }
                }
                
                graph[current].forEach(({ node: neighbor, weight }) => {
                    const newDist = distB[current] + weight;
                    if (newDist < distB[neighbor]) {
                        distB[neighbor] = newDist;
                        prevB[neighbor] = current;
                        pqB.push({ node: neighbor, dist: newDist });
                    }
                });
            }
        }
        
        if (meetNode && (pqF.length === 0 || pqB.length === 0)) break;
    }
    
    const distances = { [target]: bestDist };
    return { distances, previous: prevF, steps, path: [target] };
}

function thorup(graph, source) {
    const distances = {};
    const previous = {};
    const steps = [];
    
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[source] = 0;
    
    const buckets = {};
    buckets[0] = [source];
    let minBucket = 0;
    
    while (Object.keys(buckets).length > 0) {
        while (!buckets[minBucket] || buckets[minBucket].length === 0) {
            delete buckets[minBucket];
            minBucket++;
            if (minBucket > 1000) break;
        }
        
        if (!buckets[minBucket]) break;
        
        const current = buckets[minBucket].shift();
        steps.push(`Visiting ${current} (distance: ${distances[current]})`);
        
        graph[current].forEach(({ node: neighbor, weight }) => {
            const newDist = distances[current] + weight;
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = current;
                const bucket = Math.floor(newDist);
                if (!buckets[bucket]) buckets[bucket] = [];
                buckets[bucket].push(neighbor);
                steps.push(`Updated ${neighbor}: ${newDist}`);
            }
        });
    }
    
    return { distances, previous, steps };
}

function johnson(edges, nodes, directed) {
    const steps = [];
    
    const newNodes = [...nodes, '__s__'];
    const newEdges = [...edges];
    nodes.forEach(node => {
        newEdges.push({ from: '__s__', to: node, weight: 0 });
    });
    
    const bellman = bellmanFord(newEdges, newNodes, '__s__', true);
    if (bellman.error) {
        return { error: 'Negative cycle detected', steps };
    }
    
    const h = bellman.distances;
    steps.push('Computed potential function h');
    
    const reweightedEdges = edges.map(({ from, to, weight }) => ({
        from,
        to,
        weight: weight + h[from] - h[to]
    }));
    
    const dist = {};
    nodes.forEach(u => {
        const graph = buildAdjacencyList(reweightedEdges, nodes, directed);
        const result = dijkstra(graph, u);
        dist[u] = {};
        nodes.forEach(v => {
            dist[u][v] = result.distances[v] - h[u] + h[v];
        });
        steps.push(`Computed distances from ${u}`);
    });
    
    return { distances: dist, steps: steps.slice(0, 100) };
}
