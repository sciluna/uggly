# User-Guided Force-Directed Graph Layout

User-guided force-directed graph layout is a layout approach that lets users specify their desired layout structure by drawing sketches (e.g., rectangle, L-shape). Our method leverages a well-established image analysis technique, skeletonization (i.e., medial axis transform), to interpret the user sketch and uses the extracted structural information to guide force-directed layout algorithms with placement constraint support. It works well for small to medium-sized graphs and generates visually effective layouts aligned with user intent.

Click [here](https://sciluna.github.io/uggly/demo/index.html) for a demo.

Here is a video tutorial:

https://github.com/user-attachments/assets/21c3380e-7239-41cb-86d6-a2e0b76a1876

## Dependencies
  
  * Cytoscape.js ^3.2.0
  * [Skeleton Tracing](https://github.com/LingDong-/skeleton-tracing)
  * Simplify.js ^1.2.4
  * cytoscape-fcose ^2.2.0 (optional)
  * cytoscape-cola ^2.5.1 (optional)

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
  // ideal edge length expected between adjacent nodes
  idealEdgeLength: 50,
  // slope threshold to capture the horizontal and vertical line segments more efficiently
  // higher value gives more flexibility
  slopeThreshold: 0.15, 
  // you can provide a number or a function which takes cy as the input and returns a value
  // if it is undefined, then algorithm applies 2 * Math.sqrt(|V|)
  cycleThreshold: undefined,
  // number of pixel amount to accept disconnected consecutive line segments as connected 
  // to better capture loose drawings
  connectionTolerance: 20
};
```

`generateConstraints` function returns a JS object 
```js
{
  constraints: {  // constraints compatible with fCoSE layout algorithm, they need appropriate conversion for CoLa layout
    relativePlacementConstraint: ...,
    alignmentConstraint: ...,
    fixedNodeConstraint: ...
  },
  applyIncremental: true/false  // This is a recommendation whether to apply a second incremental layout after applying a layout with constraints. (see demo)
}
```

After constraints are generated, they can be used as options in the layout algorithm as shown in the [demo](https://github.com/sciluna/uggly/blob/main/demo/demo.js).

## Performance comparison between fCoSE and CoLa layouts

We provide a detailed analysis of how well our method integrates with the two constraint-aware layout algorithms, fCoSE and CoLa. To this end, we constructed a dataset by randomly sampling 160 graphs from [Rome graph dataset](https://graphdrawing.unipg.it/data.html) and designed 20 base sketches consisting of consecutive line and curve segments. Each base sketch was then rotated clockwise by
  30°, 45°, and 60° to produce variants with different orientations, resulting in a total of 80 distinct sketches. These sketches were then randomly assigned to the 160 graphs, producing 160 graph–sketch pairs. For each pair, we generated placement constraints using our approach and then applied both [fCoSE](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) and [CoLa](https://github.com/cytoscape/cytoscape.js-cola) algorithms in the final layout step. 

We report results on run time performance, soft constraint satisfaction (average edge length, edge crossings, node-node overlaps and node-edge crossings), and alignment accuracy measured by Chamfer distance between the sketch and the final layout. The graph and sketch dataset, along with the resulting layouts and measurements, can be found at [10.5281/zenodo.15306614](https://doi.org/10.5281/zenodo.15306614).

## Credits

Our method uses [Cytoscape.js](https://js.cytoscape.org) for graph visualization and other graph-related operations. [Skeleton Tracing](https://github.com/LingDong-/skeleton-tracing) algorithm is used to extract the skeleton of the user sketch and [simplify-js](https://github.com/mourner/simplify-js) (licensed under the [BSD 2-Clause License](https://github.com/mourner/simplify-js/blob/master/LICENSE)) is used for polyline simplification. [cytoscape-fcose](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) and [cytoscape-cola](https://github.com/cytoscape/cytoscape.js-cola) are used as the layout algoriths with constraint support.

Third-party libraries used in demo: [Bootstrap](https://getbootstrap.com/), [FileSaver.js](https://github.com/eligrey/FileSaver.js/), [cytoscape-graphml](https://github.com/iVis-at-Bilkent/cytoscape.js-graphml), [cytoscape-sbgn-stylesheet](https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet), [cytoscape-svg](https://github.com/kinimesi/cytoscape-svg) 

## Team
[Hasan Balci](https://github.com/hasanbalci) and [Augustin Luna](https://github.com/cannin) of [Luna Lab](https://github.com/sciluna)
