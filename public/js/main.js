import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';
import sbgnStylesheet from 'cytoscape-sbgn-stylesheet';
import { generateConstraintsForFcose, refineConstraints } from "./constraintManager";
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
    { "data": { "id": "n7", "group": "nodes" } },
    { "data": { "id": "n8", "group": "nodes" } },
    { "data": { "id": "e0", "source": "n0", "target": "n1", "group": "edges" } },
    { "data": { "id": "e1", "source": "n1", "target": "n2", "group": "edges" } },
    { "data": { "id": "e2", "source": "n2", "target": "n3", "group": "edges" } },
    { "data": { "id": "e3", "source": "n3", "target": "n4", "group": "edges" } },
    { "data": { "id": "e4", "source": "n4", "target": "n5", "group": "edges" } },
    { "data": { "id": "e5", "source": "n5", "target": "n6", "group": "edges" } },
    { "data": { "id": "e6", "source": "n6", "target": "n7", "group": "edges" } },
    { "data": { "id": "e7", "source": "n7", "target": "n8", "group": "edges" } }
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

	loadSample('../samples/' + filename);
});

// randomize layout
document.getElementById("randomizeButton").addEventListener("click", async function () {
  cy.layout({name: "random"}).run();
});

let base64Content;
document.getElementById("layoutButton").addEventListener("click", async function () {
  let userDescription = document.getElementById("textInput").value;
  let base64Image = getBase64Image();

  let prunedGraph = pruneGraph();
  let graphData;
  let randomize = true;
  if(sampleName == ""){
    prunedGraph = cy.elements();
  }
  // if there are selected elements, apply incremental layout
  if (prunedGraph.edges(':selected').length > 0) {
    graphData = cyToTsv(prunedGraph.edges(':selected'));
    randomize = false;
  } else {
    graphData = cyToTsv(prunedGraph);
  }

	let data = {
		graph: graphData,
    userDescription: userDescription,
		image: base64Image
	};

  let answer = await runLLM(data);
  //let positioning = JSON.parse(answer).positioning;

  let relativePlacementConstraint = JSON.parse(answer).relativePlacementConstraint;
  let alignmentConstraint = JSON.parse(answer).alignmentConstraint;
  let refinedConstraints = refineConstraints(alignmentConstraint, relativePlacementConstraint);
  relativePlacementConstraint = refinedConstraints.relativePlacementConstraints;
  alignmentConstraint = refinedConstraints.alignmentConstraints;
  //let relativePlacementConstraint = generateConstraintsForFcose(positioning);
  console.log(relativePlacementConstraint);

  cy.layout({
    name: "fcose",
    randomize: randomize,
    relativePlacementConstraint: relativePlacementConstraint ? relativePlacementConstraint : undefined,
    alignmentConstraint: alignmentConstraint ? alignmentConstraint : undefined,
    stop: () => {cy.layout({name: "fcose", randomize: false}).run()}
  }).run();
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
  return prunedGraph;
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




