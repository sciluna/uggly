let generateConstraints = function (placement, idealEdgeLength) {
  let relativePlacementConstraints = [];
  let verticalAlignments = [];
  let horizontalAlignments = [];
  let direction = "";
  console.log("Post-processed node arrays:");
  placement.forEach(line => {
    if (line.end[0] - line.start[0] > 0 && line.end[1] - line.start[1] == 0) {
      direction = "l-r";
      // generate appropriate constraints
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({left: node, right: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      horizontalAlignments.push(line.nodes);      
    } else if (line.end[0] - line.start[0] < 0 && line.end[1] - line.start[1] == 0) {
      direction = "r-l";
      // generate appropriate constraints
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({right: node, left: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      horizontalAlignments.push(line.nodes);
    } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] == 0) {
      direction = "t-b";
      // generate appropriate constraints
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({top: node, bottom: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      verticalAlignments.push(line.nodes);
    } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] == 0) {
      direction = "b-t";
      // generate appropriate constraints
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({bottom: node, top: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      verticalAlignments.push(line.nodes);
    } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] > 0) {
      direction = "tl-br";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let width = lineWidth / (lineWidth + lineHeight) * idealEdgeLength;
      let height = lineHeight / (lineWidth + lineHeight) * idealEdgeLength;
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({left: node, right: line.nodes[i+1]});
          relativePlacement.push({top: node, bottom: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] < 0) {
      direction = "br-tl";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let width = lineWidth / (lineWidth + lineHeight) * idealEdgeLength;
      let height = lineHeight / (lineWidth + lineHeight) * idealEdgeLength;
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({right: node, left: line.nodes[i+1]});
          relativePlacement.push({bottom: node, top: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] < 0) {
      direction = "tr-bl";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let width = lineWidth / (lineWidth + lineHeight) * idealEdgeLength;
      let height = lineHeight / (lineWidth + lineHeight) * idealEdgeLength;
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({right: node, left: line.nodes[i+1]});
          relativePlacement.push({top: node, bottom: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] > 0) {
      direction = "bl-tr";
      // generate appropriate constraints
      let lineWidth = Math.abs(line.end[0] - line.start[0]);
      let lineHeight = Math.abs(line.end[1] - line.start[1]);
      let width = lineWidth / (lineWidth + lineHeight) * idealEdgeLength;
      let height = lineHeight / (lineWidth + lineHeight) * idealEdgeLength;
      let relativePlacement = [];
      line.nodes.forEach((node, i) => {
        if (i != line.nodes.length - 1) {
          relativePlacement.push({left: node, right: line.nodes[i+1]});
          relativePlacement.push({bottom: node, top: line.nodes[i+1]});
        }
      });
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
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

let keepOneCommonElement = function(arr1, arr2) {
  const common = arr1.filter(val => arr2.includes(val));

  if (common.length > 1) {
    const [keep] = common;

    arr1 = arr1.filter(val => val === keep || !common.includes(val));
    arr2 = arr2.filter(val => val === keep || !common.includes(val));
  }

  return [arr1, arr2];
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

export { generateConstraints };