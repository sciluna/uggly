import { generateConstraints } from "./constraintManager";
import { splitArrayProportionally, findLongestCycle, calculateLineLengths, extractLinesWithVision, orderLines, findCoverage } from "./auxiliary";
import { cy, sampleName } from './menu'; 

let extractLines = async function (imageData) {

  let lines = await extractLinesWithVision(imageData);

  return lines;
};

let assignNodesToLines = function( prunedGraph, lines, fullGraph ){
  let lineCount = lines.length;
  let lineSizes = calculateLineLengths(lines);
  let applyIncremental = false;
  let isLoop = false;

  if (lines[0].start[0] == lines[lineCount - 1].end[0] && lines[0].start[1] == lines[lineCount - 1].end[1]) { // in case the drawing is a loop
    let graphPath = findLongestCycle(prunedGraph, cy);

    if (graphPath.length < 2 * Math.sqrt(prunedGraph.nodes().length)) {
      let { chunks: newDistribution, parent } = findCoverage(prunedGraph, prunedGraph.nodes()[0], lineSizes, fullGraph);
      let lastLine = newDistribution[newDistribution.length - 1];
      lastLine.push(newDistribution[0][0]);
      lines.forEach((line, i) => {
        line.nodesAll = newDistribution[i];
        line.parent = parent;
      });
      applyIncremental = false;
      return {lines, applyIncremental}; 
    }
    isLoop = true;
    let newDistribution = splitArrayProportionally(graphPath, lineSizes);
    let lastLine = newDistribution[newDistribution.length - 1];
    lastLine.push(newDistribution[0][0]);

    lines.forEach((line, i) => {
      line.nodes = newDistribution[i];
    });

  } else { // in case the drawing is a path consisting segments
    let { chunks: newDistribution, parent } = findCoverage(prunedGraph, prunedGraph.nodes()[0], lineSizes, fullGraph);
    lines.forEach((line, i) => {
      line.nodesAll = newDistribution[i];
      line.parent = parent;
    });
    applyIncremental = true;
  }
  // we added nodes array to each line and now returning
  return {lines, applyIncremental, isLoop}; 
};

let applyLayout = async function(imageData){
  let graph = cy.elements();
  let randomize = true;
  let initialEnergyOnIncremental = 0.3;
  let fullGraph = true;

  let fixedNodeConstraints = [];
  // if there are selected elements, apply incremental layout on selected elements
  if (cy.elements(':selected').length > 0) {
    graph = cy.elements(':selected');
    randomize = false;
    initialEnergyOnIncremental = 0.1;
    fullGraph = false;
    let unselectedNodes = cy.nodes().difference(graph);
    unselectedNodes.forEach(node => {
      fixedNodeConstraints.push({nodeId: node.id(), position: {x: node.position().x, y: node.position().y}});
    });
  }

  let pruneResult = pruneGraph(graph);
  let prunedGraph = pruneResult.prunedGraph;

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
  let lines = await extractLines(imageData);

  // lines now have assigned nodes
  let assignment = assignNodesToLines(prunedGraph, lines, fullGraph);

  // generate constraints and apply layout
  let constraints;
  try {
    constraints = generateConstraints(assignment.lines, assignment.isLoop);
    constraints.fixedNodeConstraint = fixedNodeConstraints;
    callLayout(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, assignment.applyIncremental);
  } catch (error) {
    alert("Couldn't process constraints! Please try again!");
  }
};

let callLayout = function(randomize, idealEdgeLength, initialEnergyOnIncremental, constraints, applyIncremental) {
  cy.layout({
    name: "fcose",
    randomize: randomize,
    idealEdgeLength: idealEdgeLength,
    animationDuration: 1500,
    fixedNodeConstraint: constraints.fixedNodeConstraint.length != 0 ? constraints.fixedNodeConstraint : undefined,
    relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
    alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined,
    initialEnergyOnIncremental: initialEnergyOnIncremental,
    stop: () => {      
      if (applyIncremental) {
        cy.layout({
          name: "fcose",
          randomize: false,
          animationDuration: 500,
          idealEdgeLength: idealEdgeLength,
          fixedNodeConstraint: constraints.fixedNodeConstraint.length != 0 ? constraints.fixedNodeConstraint : undefined,
          initialEnergyOnIncremental: 0.05
        }).run();
      }
    }
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

export { applyLayout };