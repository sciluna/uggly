import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';
import { generateConstraints, refineConstraints } from "./constraintManager";
import { cyToTsv, cyToAdjacencyMatrix, findLongestPath, splitArrayIntoChunks } from "./auxiliary";
import { cy, sampleName } from './menu'; 

cytoscape.use(fcose);

let ugly = !(location.hostname === "localhost" || location.hostname === "127.0.0.1");

// randomize layout
document.getElementById("randomizeButton").addEventListener("click", async function () {
  cy.layout({ name: "random", animate: true, animationDuration: 500 }).run();
});

let base64Content;
document.getElementById("layoutButton").addEventListener("click", async function () {
  document.getElementById("layoutButton").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only"> Processing...</span>';
  document.getElementById("layoutButton").disabled = true;

  // let userDescription = document.getElementById("textInput").value;
  let userDescription = "";
  let base64Image = getBase64Image();

  let nodeIdMap = new Map();  // actual id to pseudo id 
  let nodeIdMapReverse = new Map(); // pseudo id to actual id 
  cy.nodes().forEach((node, i) => {
    nodeIdMap.set(node.id(), "n" + i);
    nodeIdMapReverse.set("n" + i, node.id());
  });
  console.log(nodeIdMapReverse);

  let pruneResult = pruneGraph();
  let prunedGraph = pruneResult.prunedGraph;
  let ignoredGraph = pruneResult.ignoredGraph;
  console.log(prunedGraph.nodes().length);

  let graphData;
  let randomize = true;

  // if there are selected elements, apply incremental layout
  if (prunedGraph.edges(':selected').length > 0) {
    graphData = cyToTsv(prunedGraph.edges(':selected'), nodeIdMap);
    randomize = false;
  } else {
    graphData = cyToTsv(prunedGraph, nodeIdMap);
    console.log(graphData);
  }

  let data = {
    graph: graphData,
    userDescription: userDescription,
    image: base64Image
  };

  let result = await runLLM(data);
  console.log(result);
  let placement = JSON.parse(result).lines;
  let constraints = generateConstraints(placement, nodeIdMapReverse);
  console.log(constraints);

  let idealEdgeLength;
  if (sampleName == "glycolysis" || sampleName == "tca_cycle"){
    idealEdgeLength = 150;
  } else {
    idealEdgeLength = 100;
  }
  try {
    callLayout(randomize, idealEdgeLength, constraints, prunedGraph, ignoredGraph);
  } catch (error) {
    let lineCount = placement.length;
    if (placement[0].start[0] == placement[lineCount - 1].end[0] && placement[0].start[1] == placement[lineCount - 1].end[1]) {
      alert("Couldn't process constraints! Please try again!");
      document.getElementById("layoutButton").disabled = false;
      document.getElementById("layoutButton").innerHTML = 'Apply Layout';
    } 
    else { // make some postprocesssing and give a second chance
      console.log('here');

      let graphPath = findLongestPath(prunedGraph, prunedGraph.nodes()[0]); // TODO: look for a smarter way
      console.log(graphPath);
      let graphPathFakeIds = [];
      graphPath.forEach(nodeId => {
        graphPathFakeIds.push(nodeIdMap.get(nodeId));
      });
      console.log(graphPathFakeIds);

      let newDistribution = splitArrayIntoChunks(graphPathFakeIds, placement.length);
      placement.forEach((line, i) => {
        line.nodes = newDistribution[i];
      });
      let constraints = generateConstraints(placement, nodeIdMapReverse);

      try {
        callLayout(randomize, idealEdgeLength, constraints, prunedGraph, ignoredGraph);
      } catch (error) {
        alert("Couldn't process constraints! Please try again!");
        document.getElementById("layoutButton").disabled = false;
        document.getElementById("layoutButton").innerHTML = 'Apply Layout';
      }
    }
  }
});

document.getElementById('clearButton').addEventListener('click', clearCanvas);

let callLayout = function(randomize, idealEdgeLength, constraints, prunedGraph, ignoredGraph){
  cy.layout({
    name: "fcose",
    randomize: randomize,
    idealEdgeLength: idealEdgeLength,
    animationDuration: 2000,
    relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
    alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined,
    stop: () => {
      if (cy.elements(":selected").length == 0) {
        prunedGraph.nodes().forEach(node => {
          let oneDegreeNeighborEdges = node.edgesWith(ignoredGraph);
          oneDegreeNeighborEdges.forEach((edge, i) => {
            let neighbor;
            if (node.id() == edge.source().id()) {
              neighbor = edge.target();
            }
            else {
              neighbor = edge.source();
            }
            if (i % 4 == 0) { // north-west
              let random1 = Math.random() * 100;
              let random2 = Math.random() * 100;
              neighbor.position({ x: node.position().x - random1, y: node.position().y - random2 });
            } else if (i % 4 == 1) {  // north-east
              let random1 = Math.random() * 100;
              let random2 = Math.random() * 100;
              neighbor.position({ x: node.position().x + random1, y: node.position().y - random2 });
            } else if (i % 4 == 2) {  // south-east
              let random1 = Math.random() * 100;
              let random2 = Math.random() * 100;
              neighbor.position({ x: node.position().x + random1, y: node.position().y + random2 });
            } else if (i % 4 == 3) {  // south-west
              let random1 = Math.random() * 100;
              let random2 = Math.random() * 100;
              neighbor.position({ x: node.position().x - random1, y: node.position().y + random2 });
            }
          });
        });
      }
      
      cy.layout({
        name: "fcose",
        randomize: false,
        idealEdgeLength: (edge) => {
          if (sampleName == "glycolysis" || sampleName == "tca_cycle"){
            if (ignoredGraph.has(edge.source()) || ignoredGraph.has(edge.target()))
              return 75;
            else
              return 150;
          } else {
            if (ignoredGraph.has(edge.source()) || ignoredGraph.has(edge.target()))
              return 50;
            else
              return 100;
          }
        },
        relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
        /* alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined, */initialEnergyOnIncremental: 0.1
      }).run();

      document.getElementById("layoutButton").disabled = false;
      document.getElementById("layoutButton").innerHTML = 'Apply Layout';
    }
  }).run();
};

// remove one degree nodes from graph to make it simpler
let pruneGraph = function () {
  let prunedGraph = cy.collection();
  cy.nodes().forEach(node => {
    if (node.degree() > 1) {
      prunedGraph.merge(node);
    }
  });
  let edgesBetween = prunedGraph.edgesWith(prunedGraph);
  prunedGraph.merge(edgesBetween);
  let ignoredGraph = cy.elements().difference(prunedGraph);
  //let removedEles = cy.remove(cy.elements().difference(prunedGraph));
  return { prunedGraph, ignoredGraph };
};

let runLLM = async function (data) {
	let url = "http://localhost:8080/llm/";
	if (ugly) {
		url = "http://ec2-3-87-167-56.compute-1.amazonaws.com/llm/";
	}
  const settings = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'text/plain'
    },
    body: JSON.stringify(data)
  };

  let res = await fetch(url, settings)
    .then(response => response.json())
    .then(result => {
      return result;
    })
    .catch(e => {
      console.log("Error!");
    });

  return res;
};

// Function to get the Base64 image from the canvas
function getBase64Image() {
  const dataURL = canvas.toDataURL('image/png'); // Default is PNG, but you can specify 'image/jpeg'
  return dataURL;
}
