let generateConstraintsForFcose = function (positioning) {
  let relativePlacementConstraints = [];
  positioning.forEach(item => {
    if (item[1] == "above") {
      relativePlacementConstraints.push({top: item[0], bottom: item[2]});
    } else if (item[1] == "below") {
      relativePlacementConstraints.push({top: item[2], bottom: item[0]});
    } else if (item[1] == "left") {
      relativePlacementConstraints.push({left: item[0], right: item[2]});
    } else if (item[1] == "right") {
      relativePlacementConstraints.push({left: item[2], right: item[0]});
    } else if (item[1] == "aboveLeft") {
      relativePlacementConstraints.push({top: item[0], bottom: item[2]});
      relativePlacementConstraints.push({left: item[0], right: item[2]});
    } else if (item[1] == "aboveRight") {
      relativePlacementConstraints.push({top: item[0], bottom: item[2]});
      relativePlacementConstraints.push({left: item[2], right: item[0]});
    } else if (item[1] == "belowLeft") {
      relativePlacementConstraints.push({top: item[2], bottom: item[0]});
      relativePlacementConstraints.push({left: item[0], right: item[2]});
    } else if (item[1] == "belowRight") {
      relativePlacementConstraints.push({top: item[2], bottom: item[0]});
      relativePlacementConstraints.push({left: item[2], right: item[0]});
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

  return { relativePlacementConstraints: relativePlacementConstraint, alignmentConstraints: alignmentConstraints}
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

export { generateConstraintsForFcose, refineConstraints };