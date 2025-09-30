import { computeConstraints } from "./constraintManager";
import { splitArrayProportionally, findLongestCycle, calculateLineLengths, extractLinesWithVision, findCoverage, rotateLinesClockwise, reorderLines, findNodeBottom } from "./auxiliary";

let extractLines = async function (imageData, connectionTolerance) {

  let lines = await extractLinesWithVision(imageData, connectionTolerance);

  return lines;
};

let assignNodesToLines = function( prunedGraph, lines, cycleThreshold, isSubset ){
  let lineCount = lines.length;
  let lineSizes = calculateLineLengths(lines);
  let applyIncremental = false;
  let isLoop = false;

  if (lines[0].start[0] == lines[lineCount - 1].end[0] && lines[0].start[1] == lines[lineCount - 1].end[1]) { // in case the drawing is a loop
    let graphPath = findLongestCycle(prunedGraph, cy, isSubset);
    let cycleThold = cycleThreshold ? cycleThreshold : 2 * Math.sqrt(prunedGraph.nodes().length);
    if (graphPath.length < cycleThold) {
      let { chunks: newDistribution, parent } = findCoverage(prunedGraph, prunedGraph.nodes()[0], lineSizes, isSubset);
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
    lines = rotateLinesClockwise(lines);
    lineSizes = calculateLineLengths(lines);
    let newDistribution = splitArrayProportionally(graphPath, lineSizes);
    let lastLine = newDistribution[newDistribution.length - 1];
    lastLine.push(newDistribution[0][0]);

    lines.forEach((line, i) => {
      line.nodes = newDistribution[i];
    });

  } else { // in case the drawing is a path consisting segments
    lines = reorderLines(lines);
    lineSizes = calculateLineLengths(lines);
    let nodeAtBottom = findNodeBottom(prunedGraph);
    let { chunks: newDistribution, parent } = findCoverage(prunedGraph, nodeAtBottom, lineSizes, isSubset);
    lines.forEach((line, i) => {
      line.nodesAll = newDistribution[i];
      line.parent = parent;
    });
    applyIncremental = true;
  }
  // we added nodes array to each line and now returning
  return {lines, applyIncremental, isLoop}; 
};

let generateConstraints = async function(cy, imageData, subset, idealEdgeLength, slopeThreshold, cycleThreshold, connectionTolerance){
  let graph = cy.elements();
  let isSubset = false;
  let fixedNodeConstraints = [];
  // if there are selected elements, apply incremental layout on selected elements
  if (subset) {
    graph = subset;
    let unselectedNodes = cy.nodes().difference(graph);
    unselectedNodes.forEach(node => {
      fixedNodeConstraints.push({nodeId: node.id(), position: {x: node.position().x, y: node.position().y}});
    });
    isSubset = true;
  }

  let pruneResult = pruneGraph(cy, graph, isSubset);
  let prunedGraph = pruneResult.prunedGraph;

  // extract lines either using vision techniques or llms
  let lines = await extractLines(imageData, connectionTolerance);

  // lines now have assigned nodes
  let assignment = assignNodesToLines(prunedGraph, lines, cycleThreshold, isSubset);

  let constraints = computeConstraints(assignment.lines, assignment.isLoop, idealEdgeLength, slopeThreshold);
  constraints.fixedNodeConstraint = fixedNodeConstraints;

  return {constraints: constraints, applyIncremental: assignment.applyIncremental};
};

// remove one degree nodes from graph to make it simpler
let pruneGraph = function (cy, graph, isSubset) {
  let prunedGraph = cy.collection();
  let oneDegreeNodes = cy.collection();
  if (!isSubset){ 
    graph.nodes().forEach(node => {
      if (node.degree() == 1) {
        oneDegreeNodes.merge(node);
      }
    });
    if ((oneDegreeNodes.length == 2 && graph.nodes().length == 3) || (graph.nodes().length == 2)) {  // in case it is a 3-node or 2-node line graph
      prunedGraph = graph;
    } else {
      graph.nodes().forEach(node => {
        if (node.degree() > 1) {
          prunedGraph.merge(node);
        }
      });
    }
  } else {
    graph.nodes().forEach(node => {
      if (node.edgesWith(graph).length == 1) {
        oneDegreeNodes.merge(node);
      }
    });
    if (oneDegreeNodes.length == 2) {  // in case it is a 3-node or 2-node line graph
      prunedGraph = graph;
    } else {
      graph.nodes().forEach(node => {
        if (!oneDegreeNodes.has(node)) {
          prunedGraph.merge(node);
        }
      });
    }
  }

  let edgesBetween = prunedGraph.edgesWith(prunedGraph);
  prunedGraph.merge(edgesBetween);
  let ignoredGraph = cy.elements().difference(prunedGraph);

  return { prunedGraph, ignoredGraph };
};

export { generateConstraints };