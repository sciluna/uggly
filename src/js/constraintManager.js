let computeConstraints = function (placement, isLoop, idealEdgeLength, slopeThreshold) {
  let relativePlacementConstraints = [];
  let verticalAlignments = [];
  let horizontalAlignments = [];

  placement.forEach(line => {
    let directionInfo = getLineDirection(line, slopeThreshold);
    let direction = directionInfo.direction;
    let angle = directionInfo.angle;
    if (direction == "l-r") {
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((node, i) => {
          if (i != line.nodes.length - 1) {
            relativePlacement.push({left: node, right: line.nodes[i+1]});
          }
        });
        horizontalAlignments.push(line.nodes); 
      } else {
        line.nodesAll.forEach((node, i) => {
          if (line.parent[node] != null && i != 0) {
            relativePlacement.push({left: line.parent[node], right: node});
          }
        });
        horizontalAlignments.push(line.nodesAll); 
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);    
    } else if (direction == "r-l") {
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((node, i) => {
          if (i != line.nodes.length - 1) {
            relativePlacement.push({right: node, left: line.nodes[i+1]});
          }
        });
        horizontalAlignments.push(line.nodes);
      } else {
        line.nodesAll.forEach((node, i) => {
          if (line.parent[node] != null && i != 0) {
            relativePlacement.push({right: line.parent[node], left: node});
          }
        });
        horizontalAlignments.push(line.nodesAll);
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (direction == "t-b") {
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((node, i) => {
          if (i != line.nodes.length - 1) {
            relativePlacement.push({top: node, bottom: line.nodes[i+1]});
          }
        });
        verticalAlignments.push(line.nodes);
      } else {
        line.nodesAll.forEach((node, i) => {
          if (line.parent[node] != null && i != 0) {
            relativePlacement.push({top: line.parent[node], bottom: node});
          }
        });
        verticalAlignments.push(line.nodesAll);
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement); 
    } else if (direction == "b-t") {
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((node, i) => {
          if (i != line.nodes.length - 1) {
            relativePlacement.push({bottom: node, top: line.nodes[i+1]});
          }
        });
        verticalAlignments.push(line.nodes);
      } else {
        line.nodesAll.forEach((node, i) => {
          if (line.parent[node] != null && i != 0) {
            relativePlacement.push({bottom: line.parent[node], top: node});
          }
        });
        verticalAlignments.push(line.nodesAll);
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (direction == "tl-br") {
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((nodeId, i) => {
          if (i != line.nodes.length - 1) {
            let node = cy.getElementById(nodeId);
            let nextNode = cy.getElementById(line.nodes[i+1]);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({left: nodeId, right: line.nodes[i+1], gap: gapResult[0]});
            relativePlacement.push({top: nodeId, bottom: line.nodes[i+1], gap: gapResult[1]});
          }
        });
      } else {
        line.nodesAll.forEach((nodeId, i) => {
          if (line.parent[nodeId] != null && i != 0) {
            let node = cy.getElementById(line.parent[nodeId]);
            let nextNode = cy.getElementById(nodeId);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({left: line.parent[nodeId], right: nodeId, gap: gapResult[0]});
            relativePlacement.push({top: line.parent[nodeId], bottom: nodeId, gap: gapResult[1]});
          }
        });
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (direction == "br-tl") {
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((nodeId, i) => {
          if (i != line.nodes.length - 1) {
            let node = cy.getElementById(nodeId);
            let nextNode = cy.getElementById(line.nodes[i+1]);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({right: nodeId, left: line.nodes[i+1], gap: gapResult[0]});
            relativePlacement.push({bottom: nodeId, top: line.nodes[i+1], gap: gapResult[1]});
          }
        });
      } else {
        line.nodesAll.forEach((nodeId, i) => {
          if (line.parent[nodeId] != null && i != 0) {
            let node = cy.getElementById(line.parent[nodeId]);
            let nextNode = cy.getElementById(nodeId);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({right: line.parent[nodeId], left: nodeId, gap: gapResult[0]});
            relativePlacement.push({bottom: line.parent[nodeId], top: nodeId, gap: gapResult[1]});
          }
        });
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (direction == "tr-bl") {
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((nodeId, i) => {
          if (i != line.nodes.length - 1) {
            let node = cy.getElementById(nodeId);
            let nextNode = cy.getElementById(line.nodes[i+1]);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({right: nodeId, left: line.nodes[i+1], gap: gapResult[0]});
            relativePlacement.push({top: nodeId, bottom: line.nodes[i+1], gap: gapResult[1]});
          }
        });
      } else {
        line.nodesAll.forEach((nodeId, i) => {
          if (line.parent[nodeId] != null && i != 0) {
            let node = cy.getElementById(line.parent[nodeId]);
            let nextNode = cy.getElementById(nodeId);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({right: line.parent[nodeId], left: nodeId, gap: gapResult[0]});
            relativePlacement.push({top: line.parent[nodeId], bottom: nodeId, gap: gapResult[1]});
          }
        });
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    } else if (direction == "bl-tr") {
      direction = "bl-tr";
      // generate appropriate constraints
      let relativePlacement = [];
      if (isLoop) {
        line.nodes.forEach((nodeId, i) => {
          if (i != line.nodes.length - 1) {
            let node = cy.getElementById(nodeId);
            let nextNode = cy.getElementById(line.nodes[i+1]);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({left: nodeId, right: line.nodes[i+1], gap: gapResult[0]});
            relativePlacement.push({bottom: nodeId, top: line.nodes[i+1], gap: gapResult[1]});
          }
        });
      } else {
        line.nodesAll.forEach((nodeId, i) => {
          if (line.parent[nodeId] != null && i != 0) {
            let node = cy.getElementById(line.parent[nodeId]);
            let nextNode = cy.getElementById(nodeId);
            let gapResult = calculateGaps(node, nextNode, idealEdgeLength, angle);
            relativePlacement.push({left: line.parent[nodeId], right: nodeId, gap: gapResult[0]});
            relativePlacement.push({bottom: line.parent[nodeId], top: nodeId, gap: gapResult[1]});
          }
        });
      }
      relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
    }
  });
  if (verticalAlignments.length) {
    verticalAlignments = mergeArrays(verticalAlignments);
  }
  if (horizontalAlignments.length) {
    horizontalAlignments = mergeArrays(horizontalAlignments);
  }

  let alignmentConstraints = { vertical: verticalAlignments.length > 0 ? verticalAlignments : undefined, horizontal: horizontalAlignments.length > 0 ? horizontalAlignments : undefined }

  return { relativePlacementConstraint: relativePlacementConstraints, alignmentConstraint: alignmentConstraints }
};

// calculates line direction
let getLineDirection = function(line, slopeThreshold = 0.15) {
  let direction = "l-r";
  let angle = Math.atan(Math.abs(line.end[1] - line.start[1]) / Math.abs(line.end[0] - line.start[0]));
  if (Math.abs(line.end[1] - line.start[1]) / Math.abs(line.end[0] - line.start[0]) < slopeThreshold) {
    if (line.end[0] - line.start[0] > 0) {
      direction = "l-r";
    } else {
      direction = "r-l";
    }
  } else if (Math.abs(line.end[0] - line.start[0]) / Math.abs(line.end[1] - line.start[1]) < slopeThreshold) {
    if (line.end[1] - line.start[1] > 0) {
      direction = "t-b";
    } else {
      direction = "b-t";
    }
  } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] > 0) {
    direction = "tl-br";
  } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] < 0) {
    direction = "br-tl";
  } else if (line.end[1] - line.start[1] > 0 && line.end[0] - line.start[0] < 0) {
    direction = "tr-bl";
  } else if (line.end[1] - line.start[1] < 0 && line.end[0] - line.start[0] > 0) {
    direction = "bl-tr";
  }
  return {direction, angle};
};

let calculateGaps = function(node1, node2, idealEdgeLength, angle) {
  let r1 = Math.min((node1.width() / 2) / Math.cos(angle), (node1.height() / 2) / Math.sin(angle));
  let r2 = Math.min((node2.width() / 2) / Math.cos(angle), (node2.height() / 2) / Math.sin(angle));
  let gapX = (r1 + r2 + idealEdgeLength) * Math.cos(angle);
  let gapY = (r1 + r2 + idealEdgeLength) * Math.sin(angle);

  return [gapX, gapY];
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

export { computeConstraints };