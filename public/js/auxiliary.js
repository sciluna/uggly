// convert cy graph data to space separated values (name is tsv but inserts space, not tab) 
let cyToTsv = function (cyElements, nodeIdMap) {
  let tsvString = "";
  let edges = cyElements.edges().toArray();
  shuffleArray(edges);
  edges.forEach(edge => {
    let source = edge.source();
    let target = edge.target();
    tsvString += nodeIdMap.get(source.id()) + " " + nodeIdMap.get(target.id());
    tsvString += "\n";
  });
  return tsvString;
};

let cyToAdjacencyMatrix = function (cyElements, nodeIdMap) {
  const adjacencyList = {};
  
  // Build the adjacency list
  let edges = cyElements.edges().toArray();
  shuffleArray(edges);
  edges.forEach(edge => {
    let a = edge.source();
    let b = edge.target();
    if (!adjacencyList[nodeIdMap.get(a.id())]) adjacencyList[nodeIdMap.get(a.id())] = [];
    if (!adjacencyList[nodeIdMap.get(b.id())]) adjacencyList[nodeIdMap.get(b.id())] = [];
    adjacencyList[nodeIdMap.get(a.id())].push(nodeIdMap.get(b.id()));
    adjacencyList[nodeIdMap.get(b.id())].push(nodeIdMap.get(a.id())); // Since it's an undirected graph
  });

  return JSON.stringify(adjacencyList);
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

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

function calculateLineSizes(lines) {
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



export { cyToTsv, cyToAdjacencyMatrix, findDiameter, findLongestPath, splitArrayProportionally, findLongestCycle, calculateLineSizes };