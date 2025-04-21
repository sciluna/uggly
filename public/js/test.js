import { applyLayout } from "./main";
import { saveAs } from 'file-saver';
let runTest = function(){

  let filename = "g_03000_07";
  let drawingFilename = "drawing19";
  let filePath = "../graphs/" + filename + ".json";
  let drawingFilepath = "../drawings/" + drawingFilename + ".png";

  fetch(filePath).then(function (res) {
      return res.json();
    }).then(data => new Promise(async (resolve, reject) => {
      cy.style(defaultStylesheet);
      cy.json({ elements: data });
      loadImage(drawingFilepath);
      console.log("ready");
      setTimeout(async() => {
        let computationMode = "cvbased";
        let base64Image = getBase64Image();
        let imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

        // layout with computer vision
        await applyLayout(computationMode, base64Image, imageData);
        let pngContent = cy.png({ output: "blob", scale: 1, bg: "#ffffff", full: false });
        saveAs(pngContent, filename + "_" + drawingFilename + "_cv.png");

        computationMode = "openai";
        // layout with computer vision
        await applyLayout(computationMode, base64Image, imageData, false);
        pngContent = cy.png({ output: "blob", scale: 1, bg: "#ffffff", full: false });
        saveAs(pngContent, filename + "_" + drawingFilename + "_openai.png");

        await applyLayout(computationMode, base64Image, imageData, true);
        pngContent = cy.png({ output: "blob", scale: 1, bg: "#ffffff", full: false });
        saveAs(pngContent, filename + "_" + drawingFilename + "_openai_withascii.png");

        computationMode = "gemini";
        await applyLayout(computationMode, base64Image, imageData, false);
        pngContent = cy.png({ output: "blob", scale: 1, bg: "#ffffff", full: false });
        saveAs(pngContent, filename + "_" + drawingFilename + "_gemini.png");

        await applyLayout(computationMode, base64Image, imageData, true);
        pngContent = cy.png({ output: "blob", scale: 1, bg: "#ffffff", full: false });
        saveAs(pngContent, filename + "_" + drawingFilename + "_gemini_withascii.png");
      }, "3000");
    
    }));
};

function loadImage(imagePath) {
  let ctx = canvas.getContext('2d');

  //Loading of the home test image - img1
  let img = new Image();

  //drawing of the test image - img1
  img.onload = function () {
      //draw background image
      ctx.drawImage(img, 0, 0);
  };

  img.src = imagePath;
}

// function to get the Base64 image from the canvas
function getBase64Image() {
  const dataURL = canvas.toDataURL('image/png'); // Default is PNG, but you can specify 'image/jpeg'
  return dataURL;
}

let defaultStylesheet = [
  {
    selector: 'node',
    style: {
      'label': function( ele ){ return ele.data('fakeID') || ''; },
      'text-wrap': 'wrap'
    }
  },
];

export {runTest};