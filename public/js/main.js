import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';
import { generateConstraints, refineConstraints } from "./constraintManager";
import { cyToTsv, cyToAdjacencyMatrix } from "./auxiliary";
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
  } catch (error) {
    alert("Couldn't process constraints! Please try again!");
    document.getElementById("layoutButton").disabled = false;
    document.getElementById("layoutButton").innerHTML = 'Apply Layout';
  }
});

document.getElementById('clearButton').addEventListener('click', clearCanvas);

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

let reduceTrees = function () {
  let prunedNodesAll = [];
  let containsLeaf = true;
  let node;

  while (containsLeaf) {
    let allNodes = cy.nodes();
    let prunedNodesInStepTemp = [];
    containsLeaf = false;

    for (var i = 0; i < allNodes.length; i++) {
      node = allNodes[i];
      if (node.degree() == 1) {
        prunedNodesInStepTemp.push([node, node.connectedEdges()[0]]);
        containsLeaf = true;
      }
    }
    if (containsLeaf == true) {
      var prunedNodesInStep = [];
      for (var j = 0; j < prunedNodesInStepTemp.length; j++) {
        if (prunedNodesInStepTemp[j][0].degree() == 1) {
          prunedNodesInStep.push(prunedNodesInStepTemp[j]);
          prunedNodesInStepTemp[j][0].remove();
        }
      }
      prunedNodesAll.push(prunedNodesInStep);
    }
  }
  return prunedNodesAll;
};

let growTree = function (prunedNodesAll) {
  let lengthOfPrunedNodesInStep = prunedNodesAll.length;
  let prunedNodesInStep = prunedNodesAll[lengthOfPrunedNodesInStep - 1];

  let nodeData;
  for (let i = 0; i < prunedNodesInStep.length; i++) {
    nodeData = prunedNodesInStep[i];

    //findPlaceforPrunedNode(nodeData);

    let nodeToConnect;
    let prunedNode = nodeData[0];
    if (prunedNode.id() == nodeData[1].source().id()) {
      nodeToConnect = nodeData[1].target();
    }
    else {
      nodeToConnect = nodeData[1].source();
    }

    nodeData[0].restore();
    nodeData[1].restore();

    nodeData[0].position({ x: nodeToConnect.position().x + 100, x: nodeToConnect.position().y });
  }

  prunedNodesAll.splice(prunedNodesAll.length - 1, 1);
  return prunedNodesAll;
};

// Find an appropriate position to replace pruned node, this method can be improved
let findPlaceforPrunedNode = function (nodeData) {

  let gridForPrunedNode;
  let nodeToConnect;
  let prunedNode = nodeData[0];
  if (prunedNode.id() == nodeData[1].source().id()) {
    nodeToConnect = nodeData[1].target();
  }
  else {
    nodeToConnect = nodeData[1].source();
  }

  let startGridX = nodeToConnect.startX;
  let finishGridX = nodeToConnect.finishX;
  let startGridY = nodeToConnect.startY;
  let finishGridY = nodeToConnect.finishY;

  let upNodeCount = 0;
  let downNodeCount = 0;
  let rightNodeCount = 0;
  let leftNodeCount = 0;
  let controlRegions = [upNodeCount, rightNodeCount, downNodeCount, leftNodeCount]

  if (startGridY > 0) {
    for (let i = startGridX; i <= finishGridX; i++) {
      controlRegions[0] += (this.grid[i][startGridY - 1].length + this.grid[i][startGridY].length - 1);
    }
  }
  if (finishGridX < this.grid.length - 1) {
    for (let i = startGridY; i <= finishGridY; i++) {
      controlRegions[1] += (this.grid[finishGridX + 1][i].length + this.grid[finishGridX][i].length - 1);
    }
  }
  if (finishGridY < this.grid[0].length - 1) {
    for (var i = startGridX; i <= finishGridX; i++) {
      controlRegions[2] += (this.grid[i][finishGridY + 1].length + this.grid[i][finishGridY].length - 1);
    }
  }
  if (startGridX > 0) {
    for (var i = startGridY; i <= finishGridY; i++) {
      controlRegions[3] += (this.grid[startGridX - 1][i].length + this.grid[startGridX][i].length - 1);
    }
  }
  var min = Integer.MAX_VALUE;
  var minCount;
  var minIndex;
  for (var j = 0; j < controlRegions.length; j++) {
    if (controlRegions[j] < min) {
      min = controlRegions[j];
      minCount = 1;
      minIndex = j;
    }
    else if (controlRegions[j] == min) {
      minCount++;
    }
  }

  if (minCount == 3 && min == 0) {
    if (controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[2] == 0) {
      gridForPrunedNode = 1;
    }
    else if (controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[3] == 0) {
      gridForPrunedNode = 0;
    }
    else if (controlRegions[0] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0) {
      gridForPrunedNode = 3;
    }
    else if (controlRegions[1] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0) {
      gridForPrunedNode = 2;
    }
  }
  else if (minCount == 2 && min == 0) {
    var random = Math.floor(Math.random() * 2);
    if (controlRegions[0] == 0 && controlRegions[1] == 0) {
      ;
      if (random == 0) {
        gridForPrunedNode = 0;
      }
      else {
        gridForPrunedNode = 1;
      }
    }
    else if (controlRegions[0] == 0 && controlRegions[2] == 0) {
      if (random == 0) {
        gridForPrunedNode = 0;
      }
      else {
        gridForPrunedNode = 2;
      }
    }
    else if (controlRegions[0] == 0 && controlRegions[3] == 0) {
      if (random == 0) {
        gridForPrunedNode = 0;
      }
      else {
        gridForPrunedNode = 3;
      }
    }
    else if (controlRegions[1] == 0 && controlRegions[2] == 0) {
      if (random == 0) {
        gridForPrunedNode = 1;
      }
      else {
        gridForPrunedNode = 2;
      }
    }
    else if (controlRegions[1] == 0 && controlRegions[3] == 0) {
      if (random == 0) {
        gridForPrunedNode = 1;
      }
      else {
        gridForPrunedNode = 3;
      }
    }
    else {
      if (random == 0) {
        gridForPrunedNode = 2;
      }
      else {
        gridForPrunedNode = 3;
      }
    }
  }
  else if (minCount == 4 && min == 0) {
    var random = Math.floor(Math.random() * 4);
    gridForPrunedNode = random;
  }
  else {
    gridForPrunedNode = minIndex;
  }

  if (gridForPrunedNode == 0) {
    prunedNode.setCenter(nodeToConnect.getCenterX(),
      nodeToConnect.getCenterY() - nodeToConnect.getHeight() / 2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getHeight() / 2);
  }
  else if (gridForPrunedNode == 1) {
    prunedNode.setCenter(nodeToConnect.getCenterX() + nodeToConnect.getWidth() / 2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getWidth() / 2,
      nodeToConnect.getCenterY());
  }
  else if (gridForPrunedNode == 2) {
    prunedNode.setCenter(nodeToConnect.getCenterX(),
      nodeToConnect.getCenterY() + nodeToConnect.getHeight() / 2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getHeight() / 2);
  }
  else {
    prunedNode.setCenter(nodeToConnect.getCenterX() - nodeToConnect.getWidth() / 2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getWidth() / 2,
      nodeToConnect.getCenterY());
  }
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




