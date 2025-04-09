import cv from "@techstark/opencv-js";
import { generateConstraints } from "./constraintManager";
import { cyToTsv, cyToAdjacencyMatrix, findDiameter, findLongestPath, splitArrayProportionally, findLongestCycle, calculateLineSizes } from "./auxiliary";
import { cy, sampleName } from './menu'; 

let ugly = !(location.hostname === "localhost" || location.hostname === "127.0.0.1");

// randomize layout
document.getElementById("randomizeButton").addEventListener("click", async function () {
  cy.layout({ name: "random", animate: true, animationDuration: 500 }).run();
});

let base64Content;
document.getElementById("layoutButton").addEventListener("click", async function () {
  document.getElementById("layoutButton").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only"> Processing...</span>';
  document.getElementById("layoutButton").disabled = true;

  const llmMode = document.querySelector('input[name="llmMode"]:checked').value;
  //const layoutMode = document.querySelector('input[name="layoutMode"]:checked').value;

  let base64Image = getBase64Image();
  if (llmMode == 'opencv') {
    let lines = extractLines();
    //console.log("Number of lines: " + lines.length);
    //console.log(JSON.stringify(lines));
    document.getElementById("layoutButton").disabled = false;
    document.getElementById("layoutButton").innerHTML = 'Apply Layout';
    return;
  }

  let nodeIdMap = new Map();  // actual id to pseudo id 
  let nodeIdMapReverse = new Map(); // pseudo id to actual id 
  cy.nodes().forEach((node, i) => {
    nodeIdMap.set(node.id(), "n" + i);
    nodeIdMapReverse.set("n" + i, node.id());
  });

  let graph = cy.elements();
  let randomize = true;
  let initialEnergyOnIncremental = 0.3;
  let fullGraph = true;

  // if there are selected elements, apply incremental layout on selected elements
  if (cy.elements(':selected').length > 0) {
    graph = cy.elements(':selected');
    randomize = false;
    initialEnergyOnIncremental = 0.1;
    fullGraph = false;
  }

  let pruneResult = pruneGraph(graph);
  let prunedGraph = pruneResult.prunedGraph;
  let ignoredGraph = pruneResult.ignoredGraph;
  console.log("Number of nodes in skeleton graph: " + prunedGraph.nodes().length);

  //let graphData;

  let data = {
    image: base64Image,
    llmMode: llmMode,
  };

  let result = await runLLM(data);
  console.log(result);

  let placement = JSON.parse(result).lines;

  let idealEdgeLength;
  if (sampleName == "glycolysis" || sampleName == "tca_cycle"){
    idealEdgeLength = function(edge) {
      if(edge.source().degree() == 1 || edge.target().degree() == 1) {
        return 75;
      } else {
        return 200;
      }
    };
  } else {
    idealEdgeLength = 50;
  }

  let lineCount = placement.length;
  let lineSizes = calculateLineSizes(placement);
  if (placement[0].start[0] == placement[lineCount - 1].end[0] && placement[0].start[1] == placement[lineCount - 1].end[1]) { // in case the drawing is a loop
    let graphPath = findLongestCycle(prunedGraph, cy);
    console.log(graphPath);

    if (graphPath.length < 2 * Math.sqrt(prunedGraph.nodes().length)) {
/*       if (prunedGraph.nodes().length < 100) { */
        graphPath = findDiameter(prunedGraph, prunedGraph.nodes()[0]);
/*       } else {
        graphPath = findLongestPath(prunedGraph, cy, fullGraph, 2 * Math.sqrt(prunedGraph.nodes().length)); // TODO: look for a smarter way
        console.log(graphPath);
      } */
    }
  
    let newDistribution = splitArrayProportionally(graphPath, lineSizes);
    let lastLine = newDistribution[newDistribution.length - 1];
    lastLine.push(newDistribution[0][0]);
    console.log(newDistribution);

    placement.forEach((line, i) => {
      line.nodes = newDistribution[i];
    });

  } else { // in case the drawing is a path consisting segments
    let graphPath;
/*     if (prunedGraph.nodes().length < 100) { */
      graphPath = findDiameter(prunedGraph, prunedGraph.nodes()[0]);
/*     } else {
      graphPath = findLongestPath(prunedGraph, cy, fullGraph, 2 * Math.sqrt(prunedGraph.nodes().length)); // TODO: look for a smarter way
      console.log(graphPath);
    } */
  
    let newDistribution = splitArrayProportionally(graphPath, lineSizes);
    console.log(newDistribution);
    placement.forEach((line, i) => {
      line.nodes = newDistribution[i];
    });
  }
  let constraints;
  try {
    constraints = generateConstraints(placement, idealEdgeLength);
    console.log(constraints);
    callLayout(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints);
  } catch (error) {
    alert("Couldn't process constraints! Please try again!");
    document.getElementById("layoutButton").disabled = false;
    document.getElementById("layoutButton").innerHTML = 'Apply Layout';
  }
});

document.getElementById('clearButton').addEventListener('click', clearCanvas);

let callLayout = function(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints){
  cy.layout({
    name: "fcose",
    randomize: randomize,
    idealEdgeLength: idealEdgeLength,
    animationDuration: 2000,
    relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
    alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined,
    initialEnergyOnIncremental: initialEnergyOnIncremental,
/*     stop: () => {
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
                return 40;
              else
                return 60;
            }
          },
          relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
          alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined, initialEnergyOnIncremental: 0.1
        }).run();
      }

      document.getElementById("layoutButton").disabled = false;
      document.getElementById("layoutButton").innerHTML = 'Apply Layout';
    } */
  }).run();
  document.getElementById("layoutButton").disabled = false;
  document.getElementById("layoutButton").innerHTML = 'Apply Layout';
};

// remove one degree nodes from graph to make it simpler
let pruneGraph = function (graph) {
  let prunedGraph = cy.collection();
  let oneDegreeNodes = cy.collection();
  graph.nodes().forEach(node => {
    if (node.degree() == 1) {
      oneDegreeNodes.merge(node);
    }
  });
  if (oneDegreeNodes.length == 2) {
    prunedGraph = graph;
  } else {
    graph.nodes().forEach(node => {
      if (node.degree() > 1) {
        prunedGraph.merge(node);
      }
    });
  }

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

// function to get the Base64 image from the canvas
function getBase64Image() {
  const dataURL = canvas.toDataURL('image/png'); // Default is PNG, but you can specify 'image/jpeg'
  return dataURL;
}

// function to extract lines from image in the canvas by using openCV
function extractLines() {
  let src = cv.imread(canvas);
  let dst = new cv.Mat();
  let gray = new cv.Mat();
  let edges = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.Canny(gray, edges, 50, 150, 3);

  // Use Hough Line Transform
  let lines = new cv.Mat();
  cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 75, 20);

  // Create a copy of the source image to draw lines on
  dst = src.clone();

  // Draw lines on the destination image
  for (let i = 0; i < lines.rows; ++i) {
    let x1 = lines.data32S[i * 4];
    let y1 = lines.data32S[i * 4 + 1];
    let x2 = lines.data32S[i * 4 + 2];
    let y2 = lines.data32S[i * 4 + 3];

    // Draw the line (red color with thickness of 2)
    let startPoint = new cv.Point(x1, y1);
    let endPoint = new cv.Point(x2, y2);
    cv.line(dst, startPoint, endPoint, [255, 0, 0, 255], 2);
  }
  // Display the result on canvas (optional, for visualization)
  cv.imshow('drawingCanvas', dst);

  // Build the output structure
  let lineData = [];

  for (let i = 0; i < lines.rows; ++i) {
      let x1 = lines.data32S[i * 4];
      let y1 = lines.data32S[i * 4 + 1];
      let x2 = lines.data32S[i * 4 + 2];
      let y2 = lines.data32S[i * 4 + 3];

      lineData.push({
          start: [x1, y1],
          end: [x2, y2]
      });
  }

  console.log(lineData);

  //const simplifiedLines = simplifyRandomShape(lineData);

  src.delete(); dst.delete(); gray.delete(); edges.delete(); lines.delete();
  return lineData;
}
