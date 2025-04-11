import TraceSkeleton  from 'skeleton-tracing-wasm';
import simplify from 'simplify-js';

let tracer; 
document.addEventListener("DOMContentLoaded", async function() {
  tracer = await TraceSkeleton.load()
});

function bfsFarthestNode(graph, start) {
  const visited = new Set();
  const queue = [[start, null]];
  const parent = {};
  let farthest = start;

  while (queue.length) {
      const [node, from] = queue.shift();
      if (visited.has(node.id())) continue;
      visited.add(node.id());
      parent[node.id()] = from;
      farthest = node;

      let neighborEdges = node.edgesWith(graph);
      for (let i = 0; i < neighborEdges.length; i++) {
        let neighborEdge = neighborEdges[i];
        let currentNeighbor;
        if (node.id() == neighborEdge.source().id()) {
          currentNeighbor = neighborEdge.target();
        } else {
          currentNeighbor = neighborEdge.source();
        }
        if (!visited.has(currentNeighbor.id())) {
          queue.push([currentNeighbor, node.id()]);
        }
      }
  }

  return { farthest, parent };
}

// finds diameter of a graph
function findDiameter(graph, startNode) {
  const { farthest: end1 } = bfsFarthestNode(graph, startNode);
  const { farthest: end2, parent } = bfsFarthestNode(graph, end1);

  // Reconstruct path from end2 to end1 using parent map
  const path = [];
  let currentId = end2.id();
  while (currentId !== null) {
      path.push(currentId);
      currentId = parent[currentId];
  }

  return path.reverse(); // from end1 to end2
}

// splits the given array to chunks proportional to the given sizes in sizes array
function splitArrayProportionally(array, sizes) {
  if (!sizes.length) return [];
  
  const totalSize = sizes.reduce((sum, size) => sum + size, 0);
  const n = array.length + sizes.length - 1;
  
  if (sizes.length > n) {
    throw new Error("More chunks requested than elements in the array.");
  }
  
  const result = [];
  let start = 0;
  
  for (let i = 0; i < sizes.length; i++) {
    let chunkSize = Math.max(1, Math.round((sizes[i] / totalSize) * n)); // Ensure at least one element per chunk
    
    if (i === sizes.length - 1) {
      chunkSize = Math.max(1, n - start); // Ensure the last chunk gets remaining elements
    }
    
    const chunk = array.slice(start, start + chunkSize);
    result.push(chunk);
    
    // Next chunk starts from the last item of this one
    start = start + chunkSize - 1;
  }
  
  return result;
}

// calculates the lengths of the given lines
function calculateLineLengths(lines) {
  let sizes = [];
  lines.forEach(line => {
    let length = Math.sqrt(Math.pow(Math.abs(line.start[0] - line.end[0]), 2) + Math.pow(Math.abs(line.start[1] - line.end[1]), 2));
    sizes.push(length);
  });
  return sizes;
}

function findLongestPath(graph, cy, fullGraph, maxDepth) {
  let longestPathLength = 0;
  let longestPath = [];
  let visited = new Set();

  function dfs(nodeId, path, pathSet, fullGraph, depth) {
    // Limit the DFS depth
    if (depth > maxDepth) {
      return;
    }
    // If we already visited this node in the current path, we stop the DFS
    if (pathSet.has(nodeId)) {
      return;
    }
    // Add the node to the current path
    path.push(nodeId);
    pathSet.add(nodeId);

    // If the current path is longer than the longest path, update
    if (path.length > longestPathLength) {
      longestPathLength = path.length;
      longestPath = [...path]; // Store the longest path found
    }
    let neighborEdges;
    if (fullGraph) {
      neighborEdges = cy.getElementById(nodeId).connectedEdges();
    } else {
      neighborEdges = cy.getElementById(nodeId).connectedEdges().intersection(graph.edges());
    }

    for (let i = 0; i < neighborEdges.length; i++) {
      let neighborEdge = neighborEdges[i];
      let currentNeighbor;
      if (nodeId == neighborEdge.source().id()) {
        currentNeighbor = neighborEdge.target();
      } else {
        currentNeighbor = neighborEdge.source();
      }
      dfs(currentNeighbor.id(), path, pathSet, fullGraph, depth + 1);
    }

    path.pop();
    pathSet.delete(nodeId);
  }

  graph.nodes().forEach(node => {
    let path = [];
    let pathSet = new Set(); 
    visited.clear();
    dfs(node.id(), path, pathSet, fullGraph, 0);
  });

  return longestPath;
}

function findLongestCycle(graph, cy) {
  let longestCycleLength = 0;
  let longestCycle = [];
  let visited = new Set();

  function dfs(nodeId, start, path, pathSet) {
      if (pathSet.has(nodeId)) {
          let cycleStartIndex = path.indexOf(nodeId);
          let cycle = path.slice(cycleStartIndex);
          if (cycle.length > longestCycleLength) {
              longestCycleLength = cycle.length;
              longestCycle = [...cycle];
          }
          return;
      }

      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      path.push(nodeId);
      pathSet.add(nodeId);
      
      let neighborEdges = cy.getElementById(nodeId).edgesWith(graph);

      for (let i = 0; i < neighborEdges.length; i++) {
        let neighborEdge = neighborEdges[i];
        let currentNeighbor;
        if (nodeId == neighborEdge.source().id()) {
          currentNeighbor = neighborEdge.target();
        } else {
          currentNeighbor = neighborEdge.source();
        }
        dfs(currentNeighbor.id(), start, path, pathSet);
      }

      path.pop();
      pathSet.delete(nodeId);
  }

  graph.nodes().forEach(node => {
    let nodeId = node.id();
    dfs(nodeId, nodeId, [], new Set());
  });

  return longestCycle;
}

async function extractLinesWithVision(imageData) {
  // reverse the coloring for skeleton generation
  let data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Invert each color channel
    data[i]     = 255 - data[i];     // Red
    data[i + 1] = 255 - data[i + 1]; // Green
    data[i + 2] = 255 - data[i + 2]; // Blue
  }
  // generate skeleton
  let s = tracer.fromImageData(imageData);
  let polylines = s.polylines;
  let filteredPolylines = polylines.filter(polyline => polyline.length >= 10);
  console.log(filteredPolylines);
  let v = tracer.visualize(s,{scale:1, strokeWidth: 5, rects: false});
  console.log(v);
  // simplify the generated lines
  let tolerance = 5; // Try 1 to 5 depending on how aggressively you want to merge
  let highQuality = true; // Set to true for highest quality simplification
  // Convert, simplify, and revert back to [x, y]
  let simplifiedPolylines = filteredPolylines.map(polyline => {
    const points = polyline.map(([x, y]) => ({ x, y }));
    const simplified = simplify(points, tolerance, highQuality);
    return simplified.map(p => [p.x, p.y]);
  });
  s.polylines = simplifiedPolylines;
  let v2 = tracer.visualize(s,{scale:1, strokeWidth: 5, rects: false});
  console.log(v2);
  console.log(simplifiedPolylines);
  let tempLines = [];
  simplifiedPolylines.forEach(polylines => {
    polylines.forEach((polyline, i) => {
      if (i != polylines.length - 1) {
        let line = {
          "start": [polyline[0], polyline[1]],
          "end": [polylines[i+1][0], polylines[i+1][1]]
        };
        tempLines.push(line);
      }
    });
  });
  console.log("temp: ");
  console.log(tempLines);
  let lines = orderLines(tempLines);
  console.log(lines);
  return lines;
}

function orderLines(edges, tolerance = 5) {
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  const uniquePoints = [];
  function findOrCreateNode(pt) {
    for (let i = 0; i < uniquePoints.length; i++) {
      if (dist(pt, uniquePoints[i]) <= tolerance) return i;
    }
    uniquePoints.push(pt);
    return uniquePoints.length - 1;
  }

  // Build graph
  const graph = new Map();
  for (const { start, end } of edges) {
    const a = findOrCreateNode(start);
    const b = findOrCreateNode(end);
    if (a === b) continue; // skip self-loop
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a);
  }

  // DFS traversal
  let visited = new Set();
  let path = [];
  let foundLoop = false;

  function dfs(current, parent) {
    visited.add(current);
    path.push(current);

    for (const neighbor of graph.get(current) || []) {
      if (neighbor === parent) continue; // don't backtrack
      if (!visited.has(neighbor)) {
        dfs(neighbor, current);
        if (foundLoop) return; // early exit if loop is closed
      } else if (neighbor === path[0] && path.length > 2) {
        // loop detected
        path.push(neighbor); // close loop if needed
        foundLoop = true;
        return;
      }
    }
  }

  dfs(0, -1); // start DFS from first node
  if (!foundLoop) {
    let startNode = path[path.length - 1];
    visited = new Set();
    path = [];
    foundLoop = false;
    dfs(startNode, -1);
  }

  // Convert path from indices to coordinates
  let orderedPoints = path.map((i) => uniquePoints[i]);
  let lines = [];
  orderedPoints.forEach((point, i) => {
    if (i != orderedPoints.length - 1) {
      let line = {
        "start": [point[0], point[1]],
        "end": [orderedPoints[i+1][0], orderedPoints[i+1][1]]
      };
      lines.push(line);
    }
  });

  return lines;
}

export { findDiameter, findLongestPath, splitArrayProportionally, findLongestCycle, calculateLineLengths, extractLinesWithVision, orderLines };