# User-Guided Force-Directed Graph Layout

User-guided force-directed graph layout is a layout approach that lets users specify their desired layout structure by drawing sketches (e.g., rectangle, L-shape). Our method leverages a well-established image analysis technique, skeletonization (i.e., medial axis transform), to interpret the user sketch and uses the extracted structural information to guide force-directed layout algorithms with placement constraint support. It works well for small to medium-sized graphs and generates visually effective layouts aligned with user intent.

Click [here](https://sciluna.github.io/uggly/demo/index.html) for a demo.

Here is a video tutorial:

https://github.com/user-attachments/assets/21c3380e-7239-41cb-86d6-a2e0b76a1876

## Dependencies
  
  * Cytoscape.js ^3.2.0
  * [Skeleton Tracing](https://github.com/LingDong-/skeleton-tracing)
  * Simplify.js ^1.2.4

## Usage instructions

Download the library:
 * via npm: `npm install uggly`,
 * via bower: `bower install uggly`, or
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import uggly from 'uggly';
```

CommonJS require:

```js
const uggly = require('uggly');
```

For plain HTML/JS, just add the following:
```
<script src="https://unpkg.com/uggly/dist/bundle.umd.js"></script>
```

Then to generate the required placement constraints, call 
```js
let result = await uggly.generateConstraints({...});
```

## API

`uggly.generateConstraints(options)`

To generate the required placement constraints based on the given graph and image data.

When calling the `generateConstraints` function, the following options are supported:

```js
let options = {
  // cy instance that the algorithm will apply (required)
  cy: cyInstance,
  // an ImageData object returned from CanvasRenderingContext2D: getImageData() method (required)
  imageData: imageData, 
  // a cy collection that contains graph elements that the algorithm will apply
  // if it is undefined, then algorithm applies to whole graph
  subset: undefined, 
  // slope threshold to capture the horizontal and vertical line segments more efficiently
  // higher value gives more flexibility
  slopeThreshold: 0.2, 
  // you can provide a number or a function which takes cy as the input and returns a value
  // if it is undefined, then algorithm applies 2 * Math.sqrt(|V|)
  cycleThreshold: undefined
};
```

`generateConstraints` function returns a JS object 
```js
{
  constraints: {  // constraints compatible with fCoSE layout algorithm
    relativePlacementConstraint: ...,
    alignmentConstraint: ...,
    fixedNodeConstraint: ...
  },
  applyIncremental: true/false  // This is a recommendation whether to apply a second incremental layout after applying a layout with constraints. (see demo)
}
```

After constraints are generated, they can be used as options in the layout algorithm as shown in the [demo](https://github.com/sciluna/uggly/blob/main/demo/demo.js).

## Test with LLMs

We explored the use of popular multimodal large language models (LLMs) for our extraction step by comparing our skeletonization/polyline simplification processing method to line extraction done solely with GPT-4o and Gemini 2.0 Flash. For this experiment, we randomly selected 160 graphs from the Rome graph dataset and generated 20 random user drawings, pairing each graph with a randomly chosen drawing. Each graph was then laid out using different approaches. For the LLM-based methods, we tested two strategies: (1) providing only the image alongside a prompt, and (2) providing both the image and an ASCII representation of the image, following the approach described here: https://spatialeval.github.io/.

As a result, we produced sketch-based layouts for 160 graphs. To evaluate these layouts, we conducted a human study on Amazon Mechanical Turk, where participants were shown random pairs of layouts for the same graph, each produced by different methods. They were then asked to select the layout that best matched the corresponding drawing. In total, we collected 2,500 pairwise comparisons from 51 workers. The results showed a clear preference for layouts generated with our method.  Using the Bradley-Terry model to rank user preferences, our approach achieved a score of 1.60, compared to 0.86 for Gemini, 0.80 for Gemini with image + ASCII input, 0.76 for GPT-4o, and 0.97 for GPT-4o with image + ASCII input. Failures in the LLM-based approaches were mostly due to their instability and incorrect assumptions about the sketch content. The layouts we generated for this experiment, together with the human evaluation results and score calculation scripts, can be found at [10.5281/zenodo.15306614](https://doi.org/10.5281/zenodo.15306614) 

## Credits

Our method uses [Cytoscape.js](https://js.cytoscape.org) for graph visualization and other graph-related operations. [Skeleton Tracing](https://github.com/LingDong-/skeleton-tracing) algorithm is used to extract the skeleton of the user sketch and [simplify-js](https://github.com/mourner/simplify-js) (licensed under the [BSD 2-Clause License](https://github.com/mourner/simplify-js/blob/master/LICENSE)) is used for polyline simplification. [cytoscape-fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) is used as the layout algorithm with constraint support.

Third-party libraries used in demo: [Bootstrap](https://getbootstrap.com/), [FileSaver.js](https://github.com/eligrey/FileSaver.js/), [cytoscape-graphml](https://github.com/iVis-at-Bilkent/cytoscape.js-graphml), [cytoscape-sbgn-stylesheet](https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet), [cytoscape-svg](https://github.com/kinimesi/cytoscape-svg) 

## Team
[Hasan Balci](https://github.com/hasanbalci) and [Augustin Luna](https://github.com/cannin) of [Luna Lab](https://github.com/sciluna)
