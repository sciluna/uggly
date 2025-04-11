// menu operations
import cytoscape from "cytoscape";
import graphml from "cytoscape-graphml";
import svg from 'cytoscape-svg';
import fcose from 'cytoscape-fcose';
import { saveAs } from 'file-saver';
import sbgnStylesheet from 'cytoscape-sbgn-stylesheet';
import jquery from 'jquery';
import { applyLayout } from "./main";

cytoscape.use(graphml, jquery);
cytoscape.use(svg);
cytoscape.use(fcose);

let defaultStylesheet = [
  {
    selector: 'node',
    style: {
      'label': function( ele ){ return ele.data('fakeID') || ''; },
      'text-wrap': 'wrap'
    }
  },
];

let cy = window.cy = cytoscape({
  container: document.getElementById('cy'),
  style: defaultStylesheet,
  elements: [
    { "data": { "id": "n0", "group": "nodes", "fakeID": "n0"} },
    { "data": { "id": "n1", "group": "nodes", "fakeID": "n1" } },
    { "data": { "id": "n2", "group": "nodes", "fakeID": "n2" } },
    { "data": { "id": "n3", "group": "nodes", "fakeID": "n3" } },
    { "data": { "id": "n4", "group": "nodes", "fakeID": "n4" } },
    { "data": { "id": "n5", "group": "nodes", "fakeID": "n5" } },
    { "data": { "id": "n6", "group": "nodes", "fakeID": "n6" } },
    { "data": { "id": "n7", "group": "nodes", "fakeID": "n7" } }, // actual until here
    { "data": { "id": "n8", "group": "nodes", "fakeID": "n8" } },
    { "data": { "id": "n9", "group": "nodes", "fakeID": "n9" } },
    { "data": { "id": "n10", "group": "nodes", "fakeID": "n10" } },
    { "data": { "id": "n11", "group": "nodes", "fakeID": "n11"} },
    { "data": { "id": "n12", "group": "nodes", "fakeID": "n12" } },
    { "data": { "id": "n13", "group": "nodes", "fakeID": "n13" } },
    { "data": { "id": "n14", "group": "nodes", "fakeID": "n14" } },
    { "data": { "id": "n15", "group": "nodes", "fakeID": "n15" } },
    { "data": { "id": "n16", "group": "nodes", "fakeID": "n16" } },
    { "data": { "id": "n17", "group": "nodes", "fakeID": "n17" } },
    { "data": { "id": "n18", "group": "nodes", "fakeID": "n17" } },
    { "data": { "id": "n19", "group": "nodes", "fakeID": "n19" } },
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
  layout: {name: "fcose", idealEdgeLength: 75}
});

let sampleName = "";

// file operations - samples
document.getElementById("samples").addEventListener("change", function (event) {
  let sample = event.target.value;
  let filename = "";
  if (sample == "sample1") {
    filename = "sample1.json";
    sampleName = "sample1";
  }
  if (sample == "sample2") {
    filename = "sample2.json";
    sampleName = "sample2";
  }
  if (sample == "sample3") {
    filename = "sample3.json";
    sampleName = "sample3";
  }
  if (sample == "sample4") {
    filename = "sample4.json";
    sampleName = "sample4";
  }
  if (sample == "glycolysis") {
    filename = "glycolysis.json";
    sampleName = "glycolysis";
  }
  if (sample == "tca_cycle") {
    filename = "tca_cycle.json";
    sampleName = "tca_cycle";
  }

  loadSample('../samples/' + filename, sampleName);
});

let loadSample = function (fname, sampleName) {
  cy.remove(cy.elements());
  fetch(fname).then(function (res) {
    return res.json();
  }).then(data => new Promise((resolve, reject) => {
    if (sampleName && (sampleName == "glycolysis" || sampleName == "tca_cycle")) {
      cy.style(sbgnStylesheet(cytoscape, "purple_green"));
      cy.style().selector('node').style({'label': function( ele ){ return ele.data('fakeID') || ''; }}).update();
      
      cy.json({ elements: data });
      cy.nodes().forEach(node => {
        if (!node.data('stateVariables'))
          node.data('stateVariables', []);
        if (!node.data('unitsOfInformation'))
          node.data('unitsOfInformation', []);
      });
    } else {
      cy.style(defaultStylesheet);
      cy.json({ elements: data });
    }
    cy.nodes().forEach((node, i) => {
      node.data("fakeID", "n" + i);
    });
    //document.getElementById("fileName").innerHTML = sampleName;
    cy.layout({ "name": "fcose", idealEdgeLength: 75}).run();
    cy.fit();
  }))
};

// file operations - file upload
document.getElementById("openFile").addEventListener("click", function () {
  document.getElementById("inputFile").click();
});

document.getElementById("inputFile").addEventListener("change", function (e) {
  let file = e.target.files[0];
  if (!file) {
    alert("Failed to load file");
  }
  let fileExtension = file.name.split('.').pop();
  let reader = new FileReader();
  reader.onload = function (e) {
    cy.remove(cy.elements());
    var content = e.target.result;
    if (fileExtension == "graphml" || fileExtension == "xml") {
      cy.graphml({ layoutBy: 'fcose' });
      cy.style(defaultStylesheet);
      cy.graphml(content);
      cy.nodes().forEach((node, i) => {
        node.data("fakeID", "n" + i);
      });
    } else if (fileExtension == "json") {
      cy.json({elements: JSON.parse(content)});
      cy.style(defaultStylesheet);
      cy.nodes().forEach((node, i) => {
        node.data("fakeID", "n" + i);
      });
      cy.layout({name: "fcose"}).run();
    }
  };
  reader.addEventListener('loadend', function(){
    //document.getElementById("fileName").innerHTML = file.name;
  });
  reader.readAsText(file);
  document.getElementById("inputFile").value = null;
  document.getElementById("samples").value = "";
});

// file operations - image download
document.getElementById("savePNG").addEventListener("click", function () {
  let pngContent = cy.png({ output: "blob", scale: 2, bg: "#ffffff", full: true });
  saveAs(pngContent, "graph.png");
});

document.getElementById("saveJPG").addEventListener("click", function () {
  let jpgContent = cy.jpg({ output: "blob", scale: 2, full: true });
  saveAs(jpgContent, "graph.jpg");
});

document.getElementById("saveSVG").addEventListener("click", function () {
  let svgContent = cy.svg({scale: 2, full: true});
  let blob = new Blob([svgContent], {type:"image/svg+xml;charset=utf-8"});
  saveAs(blob, "graph.svg");
});

document.getElementById('clearButton').addEventListener('click', clearCanvas);

// layout operations
// randomize layout
document.getElementById("randomizeButton").addEventListener("click", async function () {
  cy.layout({ name: "random", animate: true, animationDuration: 500 }).run();
});

// user-guided layout 
document.getElementById("layoutButton").addEventListener("click", async function () {
  document.getElementById("layoutButton").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only"> Processing...</span>';
  document.getElementById("layoutButton").disabled = true;
  // get computation mode
  const computationMode = document.querySelector('input[name="computationMode"]:checked').value;
  const base64Image = getBase64Image();
  let imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  await applyLayout(computationMode, base64Image, imageData);

  document.getElementById("layoutButton").disabled = false;
  document.getElementById("layoutButton").innerHTML = 'Apply Layout';
});

// function to get the Base64 image from the canvas
function getBase64Image() {
  const dataURL = canvas.toDataURL('image/png'); // Default is PNG, but you can specify 'image/jpeg'
  return dataURL;
}

export {cy, sampleName};