let generateConstraints = function (placement, nodeIdMapReverse) {
  let relativePlacementConstraints = [];
  let verticalAlignments = [];
  let horizontalAlignments = [];
  let direction = "";
  placement.forEach(line => {
    // generate collection from nodes in the line together with their edges
    let lineCollection = generateCollectionFromLine(line, nodeIdMapReverse);
    if (line.end[0] - line.start[0] > 0 && line.end[1] - line.start[1] == 0) {
      direction = "l-r";
      // generate appropriate constraints
      let constraints = bfs(lineCollection, direction);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
      horizontalAlignments.push(constraints.alignment);
    } else if (line.end[0] - line.start[0] < 0 && line.end[1] - line.start[1] == 0) {
      direction = "r-l";
      // generate appropriate constraints
      let constraints = bfs(lineCollection, direction);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
      horizontalAlignments.push(constraints.alignment);
    } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] == 0) {
      direction = "t-b";
      // generate appropriate constraints
      let constraints = bfs(lineCollection, direction);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
      verticalAlignments.push(constraints.alignment);
    } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] == 0) {
      direction = "b-t";
      // generate appropriate constraints
      let constraints = bfs(lineCollection, direction);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
      verticalAlignments.push(constraints.alignment);
    } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] > 0) {
      direction = "tl-br";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let constraints = bfs(lineCollection, direction, lineWidth, lineHeight);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
    } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] < 0) {
      direction = "br-tl";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let constraints = bfs(lineCollection, direction, lineWidth, lineHeight);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
    } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] < 0) {
      direction = "tr-bl";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let constraints = bfs(lineCollection, direction, lineWidth, lineHeight);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
    } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] > 0) {
      direction = "bl-tr";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let constraints = bfs(lineCollection, direction, lineWidth, lineHeight);
      relativePlacementConstraints = relativePlacementConstraints.concat(constraints.relativePlacement);
    }
  });
  if (verticalAlignments.length) {
    verticalAlignments = mergeArrays(verticalAlignments);
  }
  if (horizontalAlignments.length) {
    horizontalAlignments = mergeArrays(horizontalAlignments);
  }
  let refinedConstraints = keepOneCommonElement(verticalAlignments, horizontalAlignments);
  verticalAlignments = refinedConstraints[0];
  horizontalAlignments = refinedConstraints[1];

  let alignmentConstraints = { vertical: verticalAlignments.length > 0 ? verticalAlignments : undefined, horizontal: horizontalAlignments.length > 0 ? horizontalAlignments : undefined }

  return { relativePlacementConstraint: relativePlacementConstraints, alignmentConstraint: alignmentConstraints }
};

let generateCollectionFromLine = function (line, nodeIdMapReverse) {
  let lineCollection = cy.collection();
  line.nodes.forEach((node, i) => {
    lineCollection.merge(cy.getElementById(nodeIdMapReverse.get(node)));
  });
  let edgesBetween = lineCollection.edgesWith(lineCollection);
  lineCollection.merge(edgesBetween);
  return lineCollection;
};

let keepOneCommonElement = function(arr1, arr2) {
  const common = arr1.filter(val => arr2.includes(val));

  if (common.length > 1) {
    const [keep] = common;

    arr1 = arr1.filter(val => val === keep || !common.includes(val));
    arr2 = arr2.filter(val => val === keep || !common.includes(val));
  }

  return [arr1, arr2];
}

let generateConstraintsForFcose = function (positioning) {
  let relativePlacementConstraints = [];
  positioning.forEach(item => {
    if (item[1] == "above") {
      relativePlacementConstraints.push({ top: item[0], bottom: item[2] });
    } else if (item[1] == "below") {
      relativePlacementConstraints.push({ top: item[2], bottom: item[0] });
    } else if (item[1] == "left") {
      relativePlacementConstraints.push({ left: item[0], right: item[2] });
    } else if (item[1] == "right") {
      relativePlacementConstraints.push({ left: item[2], right: item[0] });
    } else if (item[1] == "aboveLeft") {
      relativePlacementConstraints.push({ top: item[0], bottom: item[2] });
      relativePlacementConstraints.push({ left: item[0], right: item[2] });
    } else if (item[1] == "aboveRight") {
      relativePlacementConstraints.push({ top: item[0], bottom: item[2] });
      relativePlacementConstraints.push({ left: item[2], right: item[0] });
    } else if (item[1] == "belowLeft") {
      relativePlacementConstraints.push({ top: item[2], bottom: item[0] });
      relativePlacementConstraints.push({ left: item[0], right: item[2] });
    } else if (item[1] == "belowRight") {
      relativePlacementConstraints.push({ top: item[2], bottom: item[0] });
      relativePlacementConstraints.push({ left: item[2], right: item[0] });
    }
  });

  return relativePlacementConstraints;
};

let refineConstraints = function (alignmentConstraint, relativePlacementConstraint) {
  // alignment: merge arrays if two arrays share a common node id (fCoSE doesn't work if they aren't in compact form)
  let verticalAlignments = undefined;
  let horizontalAlignments = undefined;
  if (alignmentConstraint.vertical) {
    verticalAlignments = mergeArrays(alignmentConstraint.vertical);
  }
  if (alignmentConstraint.horizontal) {
    horizontalAlignments = mergeArrays(alignmentConstraint.horizontal);
  }
  let alignmentConstraints = { vertical: verticalAlignments, horizontal: horizontalAlignments };

  // TO DO: work on refinement of relative placement constraints
  //

  return { relativePlacementConstraints: relativePlacementConstraint, alignmentConstraints: alignmentConstraints }
};

let bfs = function (cyCollection, direction, lineWidth, lineHeight) {
  let queue = [];
  let visited = new Set();
  let currentNode = cyCollection[0];
  queue.push(currentNode);
  visited.add(currentNode.id());
  let relativePlacementConstraints = [];

  while (queue.length !== 0) {
    currentNode = queue.shift();
    let neighborEdges = currentNode.edgesWith(cyCollection);
    for (let i = 0; i < neighborEdges.length; i++) {
      let neighborEdge = neighborEdges[i];
      let currentNeighbor;
      if (currentNode.id() == neighborEdge.source().id()) {
        currentNeighbor = neighborEdge.target();
      } else {
        currentNeighbor = neighborEdge.source();
      }
      if (!visited.has(currentNeighbor.id())) {
        if (direction == "l-r") {
          relativePlacementConstraints.push({ left: currentNode.id(), right: currentNeighbor.id() });
        } else if (direction == "r-l") {
          relativePlacementConstraints.push({ right: currentNode.id(), left: currentNeighbor.id() });
        } else if (direction == "t-b") {
          relativePlacementConstraints.push({ top: currentNode.id(), bottom: currentNeighbor.id() });
        } else if (direction == "b-t") {
          relativePlacementConstraints.push({ bottom: currentNode.id(), top: currentNeighbor.id() });
        } else if (direction == "tl-br") {
          let ratio = lineHeight/lineWidth;
          relativePlacementConstraints.push({ left: currentNode.id(), right: currentNeighbor.id()});
          relativePlacementConstraints.push({ top: currentNode.id(), bottom: currentNeighbor.id()});
        } else if (direction == "br-tl") {
          let ratio = lineHeight/lineWidth;
          relativePlacementConstraints.push({ right: currentNode.id(), left: currentNeighbor.id()});
          relativePlacementConstraints.push({ bottom: currentNode.id(), top: currentNeighbor.id() });
        } else if (direction == "tr-bl") {
          let ratio = lineHeight/lineWidth;
          relativePlacementConstraints.push({ right: currentNode.id(), left: currentNeighbor.id() });
          relativePlacementConstraints.push({ top: currentNode.id(), bottom: currentNeighbor.id() });
        } else if (direction == "bl-tr") {
          let ratio = lineHeight/lineWidth;
          relativePlacementConstraints.push({ left: currentNode.id(), right: currentNeighbor.id()});
          relativePlacementConstraints.push({ bottom: currentNode.id(), top: currentNeighbor.id()});
        }
        queue.push(currentNeighbor);
        visited.add(currentNeighbor.id());
      }
    }
  }
  return { relativePlacement: relativePlacementConstraints, alignment: [...visited] };
};

// auxuliary function to merge arrays with duplicates
let mergeArrays = function (arrays) {
  // Function to check if two arrays have common items
  function haveCommonItems(arr1, arr2) {
    return arr1.some(item => arr2.includes(item));
  }

  // Function to merge two arrays and remove duplicates
  function mergeAndRemoveDuplicates(arr1, arr2) {
    return Array.from(new Set([...arr1, ...arr2]));
  }

  // Loop until no more merges are possible
  let merged = false;
  do {
    merged = false;
    for (let i = 0; i < arrays.length; i++) {
      for (let j = i + 1; j < arrays.length; j++) {
        if (haveCommonItems(arrays[i], arrays[j])) {
          // Merge the arrays
          arrays[i] = mergeAndRemoveDuplicates(arrays[i], arrays[j]);
          // Remove the merged array
          arrays.splice(j, 1);
          // Set merged to true to indicate a merge has occurred
          merged = true;
          break;
        }
      }
      if (merged) {
        break;
      }
    }
  } while (merged);

  return arrays;
};

export { generateConstraints, refineConstraints };