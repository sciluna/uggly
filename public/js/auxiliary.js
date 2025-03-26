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


export { cyToTsv, cyToAdjacencyMatrix };