import { generateConstraints } from "./constraintManager";
import { findDiameter, findLongestPath, splitArrayProportionally, findLongestCycle, calculateLineLengths, extractLinesWithVision, orderLines } from "./auxiliary";
import { cy, sampleName } from './menu'; 

let uggly = !(location.hostname === "localhost" || location.hostname === "127.0.0.1");

let extractLines = async function( computationMode, base64Image, imageData ){
  let lines = []; // final lines array

  if (computationMode != 'cvbased'){
    let data = {
      image: base64Image,
      llmMode: computationMode,
    };
    let result = await runLLM(data);
    console.log(result);
    let tempLines = JSON.parse(result).lines;
    lines = orderLines(tempLines, 5);
    console.log(lines);
  } else {
    lines = await extractLinesWithVision(imageData);
  }

  return lines;
};

let assignNodesToLines = function( prunedGraph, lines ){
  let lineCount = lines.length;
  let lineSizes = calculateLineLengths(lines);

  if (lines[0].start[0] == lines[lineCount - 1].end[0] && lines[0].start[1] == lines[lineCount - 1].end[1]) { // in case the drawing is a loop
    let graphPath = findLongestCycle(prunedGraph, cy);
    console.log(graphPath);

    if (graphPath.length < 2 * Math.sqrt(prunedGraph.nodes().length)) {
      graphPath = findDiameter(prunedGraph, prunedGraph.nodes()[0]);
    }
  
    let newDistribution = splitArrayProportionally(graphPath, lineSizes);
    let lastLine = newDistribution[newDistribution.length - 1];
    lastLine.push(newDistribution[0][0]);
    console.log(newDistribution);

    lines.forEach((line, i) => {
      line.nodes = newDistribution[i];
    });

  } else { // in case the drawing is a path consisting segments
    let graphPath = findDiameter(prunedGraph, prunedGraph.nodes()[0]);
  
    let newDistribution = splitArrayProportionally(graphPath, lineSizes);
    console.log(newDistribution);
    lines.forEach((line, i) => {
      line.nodes = newDistribution[i];
    });
  }
  // we added nodes array to each line and now returning
  return lines; 
};

let applyLayout = async function( computationMode, base64Image, imageData ){
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
  console.log("Number of nodes in skeleton graph: " + prunedGraph.nodes().length);

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

  // extract lines either using vision techniques or llms
  let lines = await extractLines(computationMode, base64Image, imageData);

  // lines now have assigned nodes
  lines = assignNodesToLines(prunedGraph, lines);

  // generate constraints and apply layout
  let constraints;
  try {
    constraints = generateConstraints(lines, idealEdgeLength);
    console.log(constraints);
    callLayout(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints);
  } catch (error) {
    alert("Couldn't process constraints! Please try again!");
  }
};

let callLayout = function(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints) {
  cy.layout({
    name: "fcose",
    randomize: randomize,
    idealEdgeLength: idealEdgeLength,
    animationDuration: 2000,
    relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
    alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined,
    initialEnergyOnIncremental: initialEnergyOnIncremental,
  }).run();
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

  return { prunedGraph, ignoredGraph };
};

let runLLM = async function (data) {
	let url = "http://localhost:8080/llm/";
	if (uggly) {
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

export { applyLayout };