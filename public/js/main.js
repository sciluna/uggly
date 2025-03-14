import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';
import sbgnStylesheet from 'cytoscape-sbgn-stylesheet';
import { generateConstraints, refineConstraints } from "./constraintManager";
import { cyToTsv } from "./auxiliary";

cytoscape.use(fcose);

let cy = window.cy = cytoscape({
  container: document.getElementById('cy'),
  style: [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-wrap': 'wrap'
      }
    },
  ],
  elements: [
    { "data": { "id": "n0", "group": "nodes" } },
    { "data": { "id": "n1", "group": "nodes" } },
    { "data": { "id": "n2", "group": "nodes" } },
    { "data": { "id": "n3", "group": "nodes" } },
    { "data": { "id": "n4", "group": "nodes" } },
    { "data": { "id": "n5", "group": "nodes" } },
    { "data": { "id": "n6", "group": "nodes" } },
    { "data": { "id": "n7", "group": "nodes" } }, // actual until here
    { "data": { "id": "n8", "group": "nodes" } },
    { "data": { "id": "n9", "group": "nodes" } },
    { "data": { "id": "n10", "group": "nodes" } },
    { "data": { "id": "n11", "group": "nodes" } },
    { "data": { "id": "n12", "group": "nodes" } },
    { "data": { "id": "n13", "group": "nodes" } },
    { "data": { "id": "n14", "group": "nodes" } },
    { "data": { "id": "n15", "group": "nodes" } },
    { "data": { "id": "n16", "group": "nodes" } },
    { "data": { "id": "n17", "group": "nodes" } },
    { "data": { "id": "n18", "group": "nodes" } },
    { "data": { "id": "n19", "group": "nodes" } },
    { "data": { "id": "e0", "source": "n0", "target": "n1", "group": "edges" } },
    { "data": { "id": "e1", "source": "n1", "target": "n2", "group": "edges" } },
    { "data": { "id": "e2", "source": "n2", "target": "n3", "group": "edges" } },
    { "data": { "id": "e3", "source": "n3", "target": "n4", "group": "edges" } },
    { "data": { "id": "e4", "source": "n4", "target": "n5", "group": "edges" } },
    { "data": { "id": "e5", "source": "n5", "target": "n6", "group": "edges" } },
    { "data": { "id": "e6", "source": "n6", "target": "n7", "group": "edges" } },
    { "data": { "id": "e7", "source": "n1", "target": "n8", "group": "edges" } },
    { "data": { "id": "e8", "source": "n1", "target": "n9", "group": "edges" } },
    { "data": { "id": "e9", "source": "n2", "target": "n10", "group": "edges" } },
    { "data": { "id": "e10", "source": "n2", "target": "n11", "group": "edges" } },
    { "data": { "id": "e11", "source": "n3", "target": "n12", "group": "edges" } },
    { "data": { "id": "e12", "source": "n3", "target": "n13", "group": "edges" } },
    { "data": { "id": "e13", "source": "n4", "target": "n14", "group": "edges" } },
    { "data": { "id": "e14", "source": "n4", "target": "n15", "group": "edges" } },
    { "data": { "id": "e15", "source": "n5", "target": "n16", "group": "edges" } },
    { "data": { "id": "e16", "source": "n5", "target": "n17", "group": "edges" } },
    { "data": { "id": "e17", "source": "n6", "target": "n18", "group": "edges" } },
    { "data": { "id": "e18", "source": "n6", "target": "n19", "group": "edges" } }
  ],
  layout: "grid"
});

let sampleName = "";

document.getElementById("samples").addEventListener("change", function (event) {
	let sample = event.target.value;
	let filename = "";
	if (sample == "sample1") {
		filename = "sample1.json";
    sampleName = "sample1";
	}
  if (sample == "sample2") {
		filename = "sample2copy.json";
    sampleName = "sample2";
	}
  if (sample == "tca_cycle") {
		filename = "tca_cycle.json";
    sampleName = "tca_cycle";
	}

	loadSample('../samples/' + filename);
});

// randomize layout
document.getElementById("randomizeButton").addEventListener("click", async function () {
  cy.layout({name: "random", animate: true, animationDuration: 500}).run();
});

let base64Content;
document.getElementById("layoutButton").addEventListener("click", async function () {
  // let userDescription = document.getElementById("textInput").value;
  let userDescription = "";
  let base64Image = getBase64Image();

  let nodeIdMap = new Map();  // actual id to pseudo id 
  let nodeIdMapReverse = new Map(); // pseudo id to actual id 
  cy.nodes().forEach((node, i) => {
    nodeIdMap.set(node.id(), "n" + i);
    nodeIdMapReverse.set("n" + i, node.id());
  });

  let pruneResult = pruneGraph();
  let prunedGraph = pruneResult.prunedGraph;
  prunedGraph.select();
  let ignoredGraph = pruneResult.ignoredGraph;
/*   let prunedNodesAll = reduceTrees();
  let prunedGraph = cy.elements(); */
  console.log(prunedGraph.nodes().length);
  //console.log(prunedGraph.ap({damping: 0.8, preference: 'median'}));
  let graphData;
  let randomize = true;
  if(sampleName == ""){
    //prunedGraph = cy.elements();
  }
  // if there are selected elements, apply incremental layout
  if (prunedGraph.edges(':selected').length > 10000) {
    graphData = cyToTsv(prunedGraph.edges(':selected'), nodeIdMap);
    randomize = false;
  } else {
    graphData = cyToTsv(prunedGraph, nodeIdMap);
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

  try {
    cy.layout({
      name: "fcose",
      randomize: true,
      idealEdgeLength: 100,
      animationDuration: 2000,
      relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined,
      alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined,
      stop: () => {
  /*      while(prunedNodesAll.length > 0) {
          prunedNodesAll = growTree(prunedNodesAll);
        } */
        prunedGraph.select();
        let nodeToConnect;
        ignoredGraph.nodes().forEach(node => {
          let connectedEdge = node.connectedEdges()[0];
          if(node.id() == connectedEdge.source().id()){
            nodeToConnect = connectedEdge.target();
          }
          else {
            nodeToConnect = connectedEdge.source();  
          }
          let random1 = Math.random() * 100 - 50;
          node.position({x: nodeToConnect.position().x + (Math.random() * 200 - 100), y: nodeToConnect.position().y + (Math.random() * 200 - 100)});
        });
        //removedEles.restore();
        cy.layout({
          name: "fcose", 
          randomize: false, 
          idealEdgeLength: (edge) => {
            if(ignoredGraph.has(edge.source()) || ignoredGraph.has(edge.target()))
              return 50;
            else
              return 100; 
          }, 
          relativePlacementConstraint: constraints.relativePlacementConstraint ? constraints.relativePlacementConstraint : undefined, 
          /* alignmentConstraint: constraints.alignmentConstraint ? constraints.alignmentConstraint : undefined, */initialEnergyOnIncremental: 0.1}).run();
      }
    }).run();
  } catch (error) {
    alert("Couldn't process constraints! Please try again!");
  }
});

document.getElementById('clearButton').addEventListener('click', clearCanvas);

let loadSample = function (fname) {
	cy.remove(cy.elements());
	fetch(fname).then(function (res) {
		return res.json();
	}).then(data => new Promise((resolve, reject) => {
    cy.json({elements: data});
    cy.nodes().forEach(node => {
      if(!node.data('stateVariables'))
        node.data('stateVariables', []);
      if(!node.data('unitsOfInformation'))
        node.data('unitsOfInformation', []);
    });
    cy.style(sbgnStylesheet(cytoscape));
    cy.layout({"name": "fcose"}).run();
    cy.fit();
	}))
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
      if(node.degree() == 1){
        prunedNodesInStepTemp.push([node, node.connectedEdges()[0]]);
        containsLeaf = true;
      }
    }
    if(containsLeaf == true){
      var prunedNodesInStep = [];
      for(var j = 0; j < prunedNodesInStepTemp.length; j++){
        if(prunedNodesInStepTemp[j][0].degree() == 1){
          prunedNodesInStep.push(prunedNodesInStepTemp[j]);  
          prunedNodesInStepTemp[j][0].remove();
        }
      }
      prunedNodesAll.push(prunedNodesInStep);
    }
  }
  return prunedNodesAll;
};

let growTree = function(prunedNodesAll) {
  let lengthOfPrunedNodesInStep = prunedNodesAll.length; 
  let prunedNodesInStep = prunedNodesAll[lengthOfPrunedNodesInStep - 1];  

  let nodeData;  
  for(let i = 0; i < prunedNodesInStep.length; i++){
    nodeData = prunedNodesInStep[i];
    
    //findPlaceforPrunedNode(nodeData);

    let nodeToConnect;
    let prunedNode = nodeData[0];
    if(prunedNode.id() == nodeData[1].source().id()){
      nodeToConnect = nodeData[1].target();
    }
    else {
      nodeToConnect = nodeData[1].source();  
    }
    
    nodeData[0].restore();
    nodeData[1].restore();

    nodeData[0].position({x: nodeToConnect.position().x + 100, x: nodeToConnect.position().y});
  }

  prunedNodesAll.splice(prunedNodesAll.length - 1, 1);
  return prunedNodesAll;
};

// Find an appropriate position to replace pruned node, this method can be improved
let findPlaceforPrunedNode = function(nodeData){
  
  let gridForPrunedNode;  
  let nodeToConnect;
  let prunedNode = nodeData[0];
  if(prunedNode.id() == nodeData[1].source().id()){
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

  if(startGridY > 0){
    for(let i = startGridX; i <= finishGridX; i++ ){
      controlRegions[0] += (this.grid[i][startGridY - 1].length + this.grid[i][startGridY].length - 1);   
    }
  }
  if(finishGridX < this.grid.length - 1){
    for(let i = startGridY; i <= finishGridY; i++ ){
      controlRegions[1] += (this.grid[finishGridX + 1][i].length + this.grid[finishGridX][i].length - 1);   
    }
  }
  if(finishGridY < this.grid[0].length - 1){
    for(var i = startGridX; i <= finishGridX; i++ ){
      controlRegions[2] += (this.grid[i][finishGridY + 1].length + this.grid[i][finishGridY].length - 1);   
    }
  }
  if(startGridX > 0){
    for(var i = startGridY; i <= finishGridY; i++ ){
      controlRegions[3] += (this.grid[startGridX - 1][i].length + this.grid[startGridX][i].length - 1);   
    }
  }
  var min = Integer.MAX_VALUE;
  var minCount;
  var minIndex;
  for(var j = 0; j < controlRegions.length; j++){
    if(controlRegions[j] < min){
      min = controlRegions[j];
      minCount = 1;
      minIndex = j;
    }  
    else if(controlRegions[j] == min){
      minCount++;  
    }
  }

  if(minCount == 3 && min == 0){
    if(controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[2] == 0){
      gridForPrunedNode = 1;    
    }
    else if(controlRegions[0] == 0 && controlRegions[1] == 0 && controlRegions[3] == 0){
      gridForPrunedNode = 0;  
    }
    else if(controlRegions[0] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0){
      gridForPrunedNode = 3;  
    }
    else if(controlRegions[1] == 0 && controlRegions[2] == 0 && controlRegions[3] == 0){
      gridForPrunedNode = 2;  
    }
  }
  else if(minCount == 2 && min == 0){
    var random = Math.floor(Math.random() * 2);
    if(controlRegions[0] == 0 && controlRegions[1] == 0){;
      if(random == 0){
        gridForPrunedNode = 0;
      }
      else{
        gridForPrunedNode = 1;
      }
    }
    else if(controlRegions[0] == 0 && controlRegions[2] == 0){
      if(random == 0){
        gridForPrunedNode = 0;
      }
      else{
        gridForPrunedNode = 2;
      }
    }
    else if(controlRegions[0] == 0 && controlRegions[3] == 0){
      if(random == 0){
        gridForPrunedNode = 0;
      }
      else{
        gridForPrunedNode = 3;
      }
    }
    else if(controlRegions[1] == 0 && controlRegions[2] == 0){
      if(random == 0){
        gridForPrunedNode = 1;
      }
      else{
        gridForPrunedNode = 2;
      }
    }
    else if(controlRegions[1] == 0 && controlRegions[3] == 0){
      if(random == 0){
        gridForPrunedNode = 1;
      }
      else{
        gridForPrunedNode = 3;
      }
    }
    else {
      if(random == 0){
        gridForPrunedNode = 2;
      }
      else{
        gridForPrunedNode = 3;
      }
    }
  }
  else if(minCount == 4 && min == 0){
    var random = Math.floor(Math.random() * 4);
    gridForPrunedNode = random;  
  }
  else {
    gridForPrunedNode = minIndex;
  }

  if(gridForPrunedNode == 0) {
    prunedNode.setCenter(nodeToConnect.getCenterX(),
                          nodeToConnect.getCenterY() - nodeToConnect.getHeight()/2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getHeight()/2);  
  }
  else if(gridForPrunedNode == 1) {
    prunedNode.setCenter(nodeToConnect.getCenterX() + nodeToConnect.getWidth()/2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getWidth()/2,
                          nodeToConnect.getCenterY());  
  }
  else if(gridForPrunedNode == 2) {
    prunedNode.setCenter(nodeToConnect.getCenterX(),
                          nodeToConnect.getCenterY() + nodeToConnect.getHeight()/2 + FDLayoutConstants.DEFAULT_EDGE_LENGTH + prunedNode.getHeight()/2);  
  }
  else { 
    prunedNode.setCenter(nodeToConnect.getCenterX() - nodeToConnect.getWidth()/2 - FDLayoutConstants.DEFAULT_EDGE_LENGTH - prunedNode.getWidth()/2,
                          nodeToConnect.getCenterY());  
  }
};

let runLLM = async function (data) {
	let url = "http://localhost:8080/llm/";

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




