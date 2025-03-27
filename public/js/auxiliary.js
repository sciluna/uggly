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

function findLongestPath(graph, startNode) {
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

function splitArrayIntoChunks(array, k) {
  if (k < 1) return [];

  const n = array.length;
  if (k === 1) return [array];

  const approxSize = Math.floor((n + (k - 1)) / k); // includes overlaps
  const result = [];

  let start = 0;
  for (let i = 0; i < k; i++) {
      let end = start + approxSize;
      if (i === k - 1) {
          // Last chunk goes to the end
          end = array.length;
      }
      const chunk = array.slice(start, end);
      result.push(chunk);

      // Next chunk starts from the last item of this one
      start = end - 1;
  }

  return result;
}


export { cyToTsv, cyToAdjacencyMatrix, findLongestPath, splitArrayIntoChunks };