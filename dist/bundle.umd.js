(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.uggly = factory());
})(this, (function () { 'use strict';

  let computeConstraints = function (placement, isLoop, slopeThreshold) {
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
            if (line.parent[node] != null) {
              relativePlacement.push({left: line.parent[node], right: node});
            }
          });
          line.parent[line.nodesAll[0]] != null ? line.nodesAll.unshift(line.parent[line.nodesAll[0]]) : line.nodesAll;
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
            if (line.parent[node] != null) {
              relativePlacement.push({right: line.parent[node], left: node});
            }
          });
          line.parent[line.nodesAll[0]] != null ? line.nodesAll.unshift(line.parent[line.nodesAll[0]]) : line.nodesAll;
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
            if (line.parent[node] != null) {
              relativePlacement.push({top: line.parent[node], bottom: node});
            }
          });
          line.parent[line.nodesAll[0]] != null ? line.nodesAll.unshift(line.parent[line.nodesAll[0]]) : line.nodesAll;
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
            if (line.parent[node] != null) {
              relativePlacement.push({bottom: line.parent[node], top: node});
            }
          });
          line.parent[line.nodesAll[0]] != null ? line.nodesAll.unshift(line.parent[line.nodesAll[0]]) : line.nodesAll;
          verticalAlignments.push(line.nodesAll);
        }
        relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      } else if (direction == "tl-br") {
        // generate appropriate constraints
        let relativePlacement = [];
        if (isLoop) {
          line.nodes.forEach((node, i) => {
            if (i != line.nodes.length - 1) {
              relativePlacement.push({left: node, right: line.nodes[i+1]});
              relativePlacement.push({top: node, bottom: line.nodes[i+1]});
            }
          });
        } else {
          line.nodesAll.forEach((node, i) => {
            if (line.parent[node] != null) {
              relativePlacement.push({left: line.parent[node], right: node, gap: Math.cos(angle) * 80});
              relativePlacement.push({top: line.parent[node], bottom: node, gap: Math.sin(angle) * 80});
            }
          });
        }
        relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      } else if (direction == "br-tl") {
        // generate appropriate constraints
        let relativePlacement = [];
        if (isLoop) {
          line.nodes.forEach((node, i) => {
            if (i != line.nodes.length - 1) {
              relativePlacement.push({right: node, left: line.nodes[i+1]});
              relativePlacement.push({bottom: node, top: line.nodes[i+1]});
            }
          });
        } else {
          line.nodesAll.forEach((node, i) => {
            if (line.parent[node] != null) {
              relativePlacement.push({right: line.parent[node], left: node, gap: Math.cos(angle) * 80});
              relativePlacement.push({bottom: line.parent[node], top: node, gap: Math.sin(angle) * 80});
            }
          });
        }
        relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      } else if (direction == "tr-bl") {
        // generate appropriate constraints
        let relativePlacement = [];
        if (isLoop) {
          line.nodes.forEach((node, i) => {
            if (i != line.nodes.length - 1) {
              relativePlacement.push({right: node, left: line.nodes[i+1]});
              relativePlacement.push({top: node, bottom: line.nodes[i+1]});
            }
          });
        } else {
          line.nodesAll.forEach((node, i) => {
            if (line.parent[node] != null) {
              relativePlacement.push({right: line.parent[node], left: node, gap: Math.cos(angle) * 80});
              relativePlacement.push({top: line.parent[node], bottom: node, gap: Math.sin(angle) * 80});
            }
          });
        }
        relativePlacementConstraints = relativePlacementConstraints.concat(relativePlacement);
      } else if (direction == "bl-tr") {
        direction = "bl-tr";
        // generate appropriate constraints
        let relativePlacement = [];
        if (isLoop) {
          line.nodes.forEach((node, i) => {
            if (i != line.nodes.length - 1) {
              relativePlacement.push({left: node, right: line.nodes[i+1]});
              relativePlacement.push({bottom: node, top: line.nodes[i+1]});
            }
          });
        } else {
          line.nodesAll.forEach((node, i) => {
            if (line.parent[node] != null) {
              relativePlacement.push({left: line.parent[node], right: node, gap: Math.cos(angle) * 80});
              relativePlacement.push({bottom: line.parent[node], top: node, gap: Math.sin(angle) * 80});
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

    let alignmentConstraints = { vertical: verticalAlignments.length > 0 ? verticalAlignments : undefined, horizontal: horizontalAlignments.length > 0 ? horizontalAlignments : undefined };

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

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var trace_skeleton_min = {exports: {}};

  (function (module, exports) {
  	!function(t,r){module.exports=r();}(commonjsGlobal,(function(){return new function(){var t=this;function r(t,r,e,n){for(var o=0,a=1;a<e-1;a++)for(var i=1;i<r-1;i++){var f=1&t[(a-1)*r+i],h=1&t[(a-1)*r+i+1],l=1&t[a*r+i+1],u=1&t[(a+1)*r+i+1],c=1&t[(a+1)*r+i],s=1&t[(a+1)*r+i-1],v=1&t[a*r+i-1],g=1&t[(a-1)*r+i-1],d=f+h+l+u+c+s+v+g;1==(0==f&&1==h)+(0==h&&1==l)+(0==l&&1==u)+(0==u&&1==c)+(0==c&&1==s)+(0==s&&1==v)+(0==v&&1==g)+(0==g&&1==f)&&d>=2&&d<=6&&0==(0==n?f*l*c:f*l*v)&&0==(0==n?l*c*v:f*c*v)&&(t[a*r+i]|=2);}for(a=0;a<e*r;a++){var p=t[a]>>1,M=1&t[a];t[a]=M&!p,o||t[a]==M||(o=1);}return o}function e(t,r,e,n,o,a,i){for(var f=o;f<o+i;f++)for(var h=n;h<n+a;h++)if(t[f*r+h])return  true;return  false}function n(t,r,e,n,o,a){var i=(a>>1&1)>0,f=(a>>0&1)>0,h=-1,l=4,u=r[e].length-1,c=r[e][f?0:u];if(Math.abs(c[o?1:0]-n)>0)return  false;for(var s=0;s<t.length;s++){var v=t[s].length-1,g=t[s][i?0:v];if(!(Math.abs(g[o?1:0]-n)>1)){var d=Math.abs(g[o?0:1]-c[o?0:1]);d<l&&(h=s,l=d);}}return  -1!=h&&(i&&f?(r[e].reverse(),t[h]=r[e].concat(t[h])):!i&&f?t[h]=t[h].concat(r[e]):i&&!f?t[h]=r[e].concat(t[h]):(r[e].reverse(),t[h]=t[h].concat(r[e])),r.splice(e,1),true)}t.thinningZS=function(t,e,n){var o=true;do{o&=r(t,e,n,0),o&=r(t,e,n,1);}while(o)};function o(t,r,e,o){for(var a=r.length-1;a>=0;a--)if(1==o){if(n(t,r,a,e,false,1))continue;if(n(t,r,a,e,false,3))continue;if(n(t,r,a,e,false,0))continue;if(n(t,r,a,e,false,2))continue}else {if(n(t,r,a,e,true,1))continue;if(n(t,r,a,e,true,3))continue;if(n(t,r,a,e,true,0))continue;if(n(t,r,a,e,true,2))continue}r.map(r=>t.push(r));}function a(t,r,e,n,o,a,i){for(var f=[],h=false,l=-1,u=-1,c=0;c<i+i+a+a-4;c++){c<a?(d=o+0,p=n+c):c<a+i-1?(d=o+c-a+1,p=n+a-1):c<a+i+a-2?(d=o+i-1,p=n+a-(c-a-i+3)):(d=o+i-(c-a-i-a+4),p=n+0),t[d*r+p]?h||(h=true,f.push([[p,d],[Math.floor(n+a/2),Math.floor(o+i/2)]])):h&&(f[f.length-1][0][0]=Math.floor((f[f.length-1][0][0]+u)/2),f[f.length-1][0][1]=Math.floor((f[f.length-1][0][1]+l)/2),h=false),l=d,u=p;}if(2==f.length)f=[[f[0][0],f[1][0]]];else if(f.length>2){for(var s=0,v=-1,g=-1,d=o+1;d<o+i-1;d++)for(var p=n+1;p<n+a-1;p++){var M=t[d*r-r+p-1]+t[d*r-r+p]+t[d*r-r+p-1+1]+t[d*r+p-1]+t[d*r+p]+t[d*r+p+1]+t[d*r+r+p-1]+t[d*r+r+p]+t[d*r+r+p+1];(M>s||M==s&&Math.abs(p-(n+a/2))+Math.abs(d-(o+i/2))<Math.abs(g-(n+a/2))+Math.abs(v-(o+i/2)))&&(v=d,g=p,s=M);}if(-1!=v)for(d=0;d<f.length;d++)f[d][1]=[g,v];}return f}t.traceSkeleton=function(r,n,i,f,h,l,u,c,s,v){var g=[];if(0==s)return g;if(l<=c&&u<=c)return a(r,n,0,f,h,l,u);var d=n+i,p=-1,M=-1;if(u>c)for(var m=h+3;m<h+u-3;m++)if(!(r[m*n+f]||r[(m-1)*n+f]||r[m*n+f+l-1]||r[(m-1)*n+f+l-1])){for(var k=0,w=f;w<f+l;w++)k+=r[m*n+w],k+=r[(m-1)*n+w];(k<d||k==d&&Math.abs(m-(h+u/2))<Math.abs(p-(h+u/2)))&&(d=k,p=m);}if(l>c)for(w=f+3;w<f+l-3;w++)if(!(r[n*h+w]||r[n*(h+u)-n+w]||r[n*h+w-1]||r[n*(h+u)-n+w-1])){for(k=0,m=h;m<h+u;m++)k+=r[m*n+w],k+=r[m*n+w-1];(k<d||k==d&&Math.abs(w-(f+l/2))<Math.abs(M-(f+l/2)))&&(d=k,p=-1,M=w);}if(u>c&&-1!=p){var b=[f,p,l,h+u-p];e(r,n,0,($=[f,h,l,p-h])[0],$[1],$[2],$[3])&&(null!=v&&v.push($),g=t.traceSkeleton(r,n,i,$[0],$[1],$[2],$[3],c,s-1,v)),e(r,n,0,b[0],b[1],b[2],b[3])&&(null!=v&&v.push(b),o(g,t.traceSkeleton(r,n,i,b[0],b[1],b[2],b[3],c,s-1,v),p,2));}else if(l>c&&-1!=M){var $;b=[M,h,f+l-M,u];e(r,n,0,($=[f,h,M-f,u])[0],$[1],$[2],$[3])&&(null!=v&&v.push($),g=t.traceSkeleton(r,n,i,$[0],$[1],$[2],$[3],c,s-1,v)),e(r,n,0,b[0],b[1],b[2],b[3])&&(null!=v&&v.push(b),o(g,t.traceSkeleton(r,n,i,b[0],b[1],b[2],b[3],c,s-1,v),M,1));}return  -1==p&&-1==M&&(g=a(r,n,0,f,h,l,u)),g},t.trace=function(r,e,n,o){t.thinningZS(r,e,n);var a=[];return {rects:a,polylines:t.traceSkeleton(r,e,n,0,0,e,n,o,999,a),width:e,height:n}},t.onload=function(t){t();},t.fromBoolArray=function(r,e,n){return t.trace(r.map(t=>t?1:0),e,n,10)},t.fromCharString=function(r,e,n){return t.trace(r.split("").map(t=>t.charCodeAt(0)),e,n,10)},t.fromImageData=function(r){for(var e=r.width,n=r.height,o=r.data,a=[],i=0;i<o.length;i+=4)o[i]?a.push(1):a.push(0);return t.trace(a,e,n,10)},t.fromCanvas=function(r){var e=r.getContext("2d").getImageData(0,0,r.width,r.height);return t.fromImageData(e)},t.visualize=function(t,r){var e=t.rects,n=t.polylines;null==r&&(r={});var o=null==r.scale?1:r.scale,a=null==r.strokeWidth?1:r.strokeWidth,i=null==r.rects?1:0,f=r.keypoints=1,h=`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${t.width*o}" height="${t.height*o}">`;if(i)for(var l=0;l<e.length;l++)h+=`<rect fill="none" stroke="gray" x="${e[l][0]*o}" y="${e[l][1]*o}" width="${e[l][2]*o}" height="${e[l][3]*o}" />`;for(l=0;l<n.length;l++)h+=`<path fill="none" stroke-width="${a}" stroke="rgb(${Math.floor(200*Math.random())},${Math.floor(200*Math.random())},${Math.floor(200*Math.random())})" d="M${n[l].map(t=>t[0]*o+","+t[1]*o).join(" L")}"/>`;if(f)for(l=0;l<n.length;l++)for(var u=0;u<n[l].length;u++)h+=`<rect fill="none" stroke="red" x="${n[l][u][0]*o-1}" y="${n[l][u][1]*o-1}" width="2" height="2"/>`;return h+="</svg>"};}})); 
  } (trace_skeleton_min));

  var trace_skeleton_minExports = trace_skeleton_min.exports;
  var tracer = /*@__PURE__*/getDefaultExportFromCjs(trace_skeleton_minExports);

  var simplify$1 = {exports: {}};

  /*
   (c) 2017, Vladimir Agafonkin
   Simplify.js, a high-performance JS polyline simplification library
   mourner.github.io/simplify-js
  */

  (function (module) {
  	(function () {
  	// to suit your point format, run search/replace for '.x' and '.y';
  	// for 3D version, see 3d branch (configurability would draw significant performance overhead)

  	// square distance between 2 points
  	function getSqDist(p1, p2) {

  	    var dx = p1.x - p2.x,
  	        dy = p1.y - p2.y;

  	    return dx * dx + dy * dy;
  	}

  	// square distance from a point to a segment
  	function getSqSegDist(p, p1, p2) {

  	    var x = p1.x,
  	        y = p1.y,
  	        dx = p2.x - x,
  	        dy = p2.y - y;

  	    if (dx !== 0 || dy !== 0) {

  	        var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

  	        if (t > 1) {
  	            x = p2.x;
  	            y = p2.y;

  	        } else if (t > 0) {
  	            x += dx * t;
  	            y += dy * t;
  	        }
  	    }

  	    dx = p.x - x;
  	    dy = p.y - y;

  	    return dx * dx + dy * dy;
  	}
  	// rest of the code doesn't care about point format

  	// basic distance-based simplification
  	function simplifyRadialDist(points, sqTolerance) {

  	    var prevPoint = points[0],
  	        newPoints = [prevPoint],
  	        point;

  	    for (var i = 1, len = points.length; i < len; i++) {
  	        point = points[i];

  	        if (getSqDist(point, prevPoint) > sqTolerance) {
  	            newPoints.push(point);
  	            prevPoint = point;
  	        }
  	    }

  	    if (prevPoint !== point) newPoints.push(point);

  	    return newPoints;
  	}

  	function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  	    var maxSqDist = sqTolerance,
  	        index;

  	    for (var i = first + 1; i < last; i++) {
  	        var sqDist = getSqSegDist(points[i], points[first], points[last]);

  	        if (sqDist > maxSqDist) {
  	            index = i;
  	            maxSqDist = sqDist;
  	        }
  	    }

  	    if (maxSqDist > sqTolerance) {
  	        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
  	        simplified.push(points[index]);
  	        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  	    }
  	}

  	// simplification using Ramer-Douglas-Peucker algorithm
  	function simplifyDouglasPeucker(points, sqTolerance) {
  	    var last = points.length - 1;

  	    var simplified = [points[0]];
  	    simplifyDPStep(points, 0, last, sqTolerance, simplified);
  	    simplified.push(points[last]);

  	    return simplified;
  	}

  	// both algorithms combined for awesome performance
  	function simplify(points, tolerance, highestQuality) {

  	    if (points.length <= 2) return points;

  	    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  	    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  	    points = simplifyDouglasPeucker(points, sqTolerance);

  	    return points;
  	}

  	// export as AMD module / Node module / browser or worker variable
  	{
  	    module.exports = simplify;
  	    module.exports.default = simplify;
  	}

  	})(); 
  } (simplify$1));

  var simplifyExports = simplify$1.exports;
  var simplify = /*@__PURE__*/getDefaultExportFromCjs(simplifyExports);

  function bfsFarthestNode(graph, start) {
    const visited = new Set();
    const queue = [[start, null]];
    const parent = {};
    let farthest = start;

    while (queue.length) {
        const [node, from] = queue.shift();
        if (visited.has(node.id())) continue;
        visited.add(node.id());
        parent[node.id()] = from;
        farthest = node;

        let neighborEdges = node.edgesWith(graph);

        for (let i = 0; i < neighborEdges.length; i++) {
          let neighborEdge = neighborEdges[i];
          let currentNeighbor;
          if (node.id() == neighborEdge.source().id()) {
            currentNeighbor = neighborEdge.target();
          } else {
            currentNeighbor = neighborEdge.source();
          }
          if (!visited.has(currentNeighbor.id())) {
            queue.push([currentNeighbor, node.id()]);
          }
        }
    }

    return { farthest, parent };
  }

  function bfsSplitGraph(graph, start, sizeRatios) {
    const visited = new Set();
    const queue = [start];
    const order = []; // Visit order
    const parent = {}; // node.id() => parent.id() or null
    parent[start.id()] = null;

    while (queue.length) {
      const node = queue.shift();
      if (visited.has(node.id())) continue;

      visited.add(node.id());
      order.push(node.id());

      let neighborEdges;
  /*     if(fullGraph){
        neighborEdges = node.connectedEdges();
      } else { */
        neighborEdges = node.edgesWith(graph);
  /*     } */
      for (const edge of neighborEdges) {
        const neighbor = (node.id() === edge.source().id()) ? edge.target() : edge.source();
        if (!visited.has(neighbor.id()) && !(neighbor.id() in parent)) {
          queue.push(neighbor);
          parent[neighbor.id()] = node.id();
        }
      }
    }

    const totalSize = order.length;
    const totalRatio = sizeRatios.reduce((a, b) => a + b, 0);
    const chunks = [];

    let startIdx = 0;
    for (let i = 0; i < sizeRatios.length; i++) {
      const ratio = sizeRatios[i];
      const chunkSize = Math.round((ratio / totalRatio) * totalSize);

      const chunk = order.slice(startIdx, startIdx + chunkSize);
      chunks.push(chunk);
      startIdx += chunkSize;
    }

    // In case of rounding issues, ensure all nodes are included
    if (startIdx < totalSize) {
      chunks[chunks.length - 1].push(...order.slice(startIdx));
    }

    return { chunks, parent };
  }

  function findCoverage(graph, startNode, sizeRatios) {
    const { farthest: end1 } = bfsFarthestNode(graph, startNode);
    const { chunks, parent } = bfsSplitGraph(graph, end1, sizeRatios);
    return { chunks, parent };
  }

  // splits the given array to chunks proportional to the given sizes in sizes array
  function splitArrayProportionally(array, sizes) {
    if (!sizes.length) return [];
    
    const totalSize = sizes.reduce((sum, size) => sum + size, 0);
    const n = array.length + sizes.length - 1;
    
    if (sizes.length > n) {
      throw new Error("More chunks requested than elements in the array.");
    }
    
    const result = [];
    let start = 0;
    
    for (let i = 0; i < sizes.length; i++) {
      let chunkSize = Math.max(1, Math.round((sizes[i] / totalSize) * n)); // Ensure at least one element per chunk
      
      if (i === sizes.length - 1) {
        chunkSize = Math.max(1, n - start); // Ensure the last chunk gets remaining elements
      }
      
      const chunk = array.slice(start, start + chunkSize);
      result.push(chunk);
      
      // Next chunk starts from the last item of this one
      start = start + chunkSize - 1;
    }
    
    return result;
  }

  // calculates the lengths of the given lines
  function calculateLineLengths(lines) {
    let sizes = [];
    lines.forEach(line => {
      let length = Math.sqrt(Math.pow(Math.abs(line.start[0] - line.end[0]), 2) + Math.pow(Math.abs(line.start[1] - line.end[1]), 2));
      sizes.push(length);
    });
    return sizes;
  }

  // find node at bottom of the graph
  function findNodeBottom (prunedGraph) {
    let nodes = prunedGraph.nodes();
    let maxYIndex = 0;
    let maxY = nodes[0].position().y; // y is index 1

    for (let i = 1; i < nodes.length; i++) {
      let y = nodes[i].position().y;
      if (y > maxY) {
        maxY = y;
        maxYIndex = i;
      }
    }
    return nodes[maxYIndex];
  }

  // rotates line array so that the line whose start point is at top (lowest y value) comes first
  function reorderLines(lines) {
    if (lines.length === 0) return lines;

    if (lines[0].start[1] > lines[lines.length - 1].end[1]) {
      lines = lines
        .map(line => ({ start: line.end, end: line.start })) // flip each line
        .reverse(); // reverse order
    }
    return lines;
  }

  // rotates line array so that the line whose start point is at top (lowest y value) comes first
  function rotateLinesClockwise(lines) {
    if (lines.length === 0) return lines;

    // find index of line whose start has the lowest y
    let minYIndex = 0;
    let minY = lines[0].start[1]; // y is index 1

    for (let i = 1; i < lines.length; i++) {
      let y = lines[i].start[1];
      if (y < minY) {
        minY = y;
        minYIndex = i;
      }
    }

    // rotate array so that line with lowest start.y comes first
    let rotated = lines.slice(minYIndex).concat(lines.slice(0, minYIndex));

    // check polygon orientation (using start points)
    let points = rotated.map(line => line.start);
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      let [x1, y1] = points[i];
      let [x2, y2] = points[(i + 1) % points.length];
      area += (x1 * y2 - x2 * y1);
    }

    // if counter-clockwise, reverse to make clockwise
    if (area < 0) {
      rotated = rotated
        .map(line => ({ start: line.end, end: line.start })) // flip each line
        .reverse(); // reverse order
    }

    return rotated;
  }

  function findLongestCycle(graph, cy) {
    let longestCycleLength = 0;
    let longestCycle = [];
    let visited = new Set();

    function dfs(nodeId, start, path, pathSet) {
        if (pathSet.has(nodeId)) {
            let cycleStartIndex = path.indexOf(nodeId);
            let cycle = path.slice(cycleStartIndex);
            if (cycle.length > longestCycleLength) {
                longestCycleLength = cycle.length;
                longestCycle = [...cycle];
            }
            return;
        }

        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        path.push(nodeId);
        pathSet.add(nodeId);
        
        let neighborEdges = cy.getElementById(nodeId).edgesWith(graph);

        for (let i = 0; i < neighborEdges.length; i++) {
          let neighborEdge = neighborEdges[i];
          let currentNeighbor;
          if (nodeId == neighborEdge.source().id()) {
            currentNeighbor = neighborEdge.target();
          } else {
            currentNeighbor = neighborEdge.source();
          }
          dfs(currentNeighbor.id(), start, path, pathSet);
        }

        path.pop();
        pathSet.delete(nodeId);
    }

    graph.nodes().forEach(node => {
      let nodeId = node.id();
      dfs(nodeId, nodeId, [], new Set());
    });

    // Rotate cycle so the node with lowest y (top node) is first
    if (longestCycle.length > 0) {
      let minYIndex = 0;
      let minY = cy.getElementById(longestCycle[0]).position('y');

      for (let i = 1; i < longestCycle.length; i++) {
        let y = cy.getElementById(longestCycle[i]).position('y');
        if (y < minY) {
          minY = y;
          minYIndex = i;
        }
      }

      // Rotate cycle so minY node comes first
      longestCycle = longestCycle.slice(minYIndex).concat(longestCycle.slice(0, minYIndex));

      // Check orientation using shoelace formula
      let points = longestCycle.map(id => {
        let pos = cy.getElementById(id).position();
        return [pos.x, pos.y];
      });

      let area = 0;
      for (let i = 0; i < points.length; i++) {
        let [x1, y1] = points[i];
        let [x2, y2] = points[(i + 1) % points.length];
        area += (x1 * y2 - x2 * y1);
      }

      // For screen coords (y grows downward):
      // area > 0 → CW, area < 0 → CCW
      longestCycle.push(longestCycle[0]); 
      if (area < 0) {
        longestCycle.reverse();
      }
      longestCycle.pop(longestCycle[longestCycle.length - 1]); 
    }

    return longestCycle;
  }

  async function extractLinesWithVision(imageData, connectionTolerance) {
    // reverse the coloring for skeleton generation
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Invert each color channel
      data[i]     = 255 - data[i];     // Red
      data[i + 1] = 255 - data[i + 1]; // Green
      data[i + 2] = 255 - data[i + 2]; // Blue
    }
    // generate skeleton
    let s = tracer.fromImageData(imageData);
    let polylines = s.polylines;
    let filteredPolylines = polylines.filter(polyline => polyline.length >= 10);
    //console.log(filteredPolylines);
    tracer.visualize(s,{scale:1, strokeWidth: 6, rects: false, keypoints: false});
    //console.log(v);
    // simplify the generated lines
    let tolerance = 4; // Try 1 to 5 depending on how aggressively you want to merge
    let highQuality = true; // Set to true for highest quality simplification
    // Convert, simplify, and revert back to [x, y]
    let simplifiedPolylines = filteredPolylines.map(polyline => {
      const points = polyline.map(([x, y]) => ({ x, y }));
      const simplified = simplify(points, tolerance, highQuality);
      return simplified.map(p => [p.x, p.y]);
    });
    s.polylines = simplifiedPolylines;
    tracer.visualize(s,{scale:1, strokeWidth: 6, rects: false});
    //console.log(v2);
    //console.log(simplifiedPolylines);
    let tempLines = [];
    simplifiedPolylines.forEach(polylines => {
      polylines.forEach((polyline, i) => {
        if (i != polylines.length - 1) {
          let line = {
            "start": [polyline[0], polyline[1]],
            "end": [polylines[i+1][0], polylines[i+1][1]]
          };
          tempLines.push(line);
        }
      });
    });

    let lines = orderLines(tempLines, connectionTolerance);
    //console.log(lines);
    return lines;
  }

  function orderLines(edges, connectionTolerance = 5) {
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

    const uniquePoints = [];
    function findOrCreateNode(pt) {
      for (let i = 0; i < uniquePoints.length; i++) {
        if (dist(pt, uniquePoints[i]) <= connectionTolerance) return i;
      }
      uniquePoints.push(pt);
      return uniquePoints.length - 1;
    }

    // Build graph
    const graph = new Map();
    for (const { start, end } of edges) {
      const a = findOrCreateNode(start);
      const b = findOrCreateNode(end);
      if (a === b) continue; // skip self-loop
      if (!graph.has(a)) graph.set(a, []);
      if (!graph.has(b)) graph.set(b, []);
      graph.get(a).push(b);
      graph.get(b).push(a);
    }

    // DFS traversal
    let visited = new Set();
    let path = [];
    let foundLoop = false;

    function dfs(current, parent) {
      visited.add(current);
      path.push(current);

      for (const neighbor of graph.get(current) || []) {
        if (neighbor === parent) continue; // don't backtrack
        if (!visited.has(neighbor)) {
          dfs(neighbor, current);
          if (foundLoop) return; // early exit if loop is closed
        } else if (neighbor === path[0] && path.length > 2) {
          // loop detected
          path.push(neighbor); // close loop if needed
          foundLoop = true;
          return;
        }
      }
    }

    dfs(0, -1); // start DFS from first node
    if (!foundLoop) {
      let startNode = path[path.length - 1];
      visited = new Set();
      path = [];
      foundLoop = false;
      dfs(startNode, -1);
    }

    // Convert path from indices to coordinates
    let orderedPoints = path.map((i) => uniquePoints[i]);
    let lines = [];
    orderedPoints.forEach((point, i) => {
      if (i != orderedPoints.length - 1) {
        let line = {
          "start": [point[0], point[1]],
          "end": [orderedPoints[i+1][0], orderedPoints[i+1][1]]
        };
        lines.push(line);
      }
    });

    return lines;
  }

  let extractLines = async function (imageData, connectionTolerance) {

    let lines = await extractLinesWithVision(imageData, connectionTolerance);

    return lines;
  };

  let assignNodesToLines = function( prunedGraph, lines, cycleThreshold ){
    let lineCount = lines.length;
    let lineSizes = calculateLineLengths(lines);
    let applyIncremental = false;
    let isLoop = false;

    if (lines[0].start[0] == lines[lineCount - 1].end[0] && lines[0].start[1] == lines[lineCount - 1].end[1]) { // in case the drawing is a loop
      let graphPath = findLongestCycle(prunedGraph, cy);
      let cycleThold = cycleThreshold ? cycleThreshold : 2 * Math.sqrt(prunedGraph.nodes().length);
      if (graphPath.length < cycleThold) {
        let { chunks: newDistribution, parent } = findCoverage(prunedGraph, prunedGraph.nodes()[0], lineSizes);
        let lastLine = newDistribution[newDistribution.length - 1];
        lastLine.push(newDistribution[0][0]);
        lines.forEach((line, i) => {
          line.nodesAll = newDistribution[i];
          line.parent = parent;
        });
        applyIncremental = false;
        return {lines, applyIncremental}; 
      }
      isLoop = true;
      lines = rotateLinesClockwise(lines);
      lineSizes = calculateLineLengths(lines);
      let newDistribution = splitArrayProportionally(graphPath, lineSizes);
      let lastLine = newDistribution[newDistribution.length - 1];
      lastLine.push(newDistribution[0][0]);

      lines.forEach((line, i) => {
        line.nodes = newDistribution[i];
      });

    } else { // in case the drawing is a path consisting segments
      lines = reorderLines(lines);
      lineSizes = calculateLineLengths(lines);
      let nodeAtBottom = findNodeBottom(prunedGraph);
      let { chunks: newDistribution, parent } = findCoverage(prunedGraph, nodeAtBottom, lineSizes);
      lines.forEach((line, i) => {
        line.nodesAll = newDistribution[i];
        line.parent = parent;
      });
      applyIncremental = true;
    }
    // we added nodes array to each line and now returning
    return {lines, applyIncremental, isLoop}; 
  };

  let generateConstraints = async function(cy, imageData, subset, slopeThreshold, cycleThreshold, connectionTolerance){
    let graph = cy.elements();

    let fixedNodeConstraints = [];
    // if there are selected elements, apply incremental layout on selected elements
    if (subset) {
      graph = subset;
      let unselectedNodes = cy.nodes().difference(graph);
      unselectedNodes.forEach(node => {
        fixedNodeConstraints.push({nodeId: node.id(), position: {x: node.position().x, y: node.position().y}});
      });
    }

    let pruneResult = pruneGraph(cy, graph);
    let prunedGraph = pruneResult.prunedGraph;

    // extract lines either using vision techniques or llms
    let lines = await extractLines(imageData, connectionTolerance);

    // lines now have assigned nodes
    let assignment = assignNodesToLines(prunedGraph, lines, cycleThreshold);

    let constraints = computeConstraints(assignment.lines, assignment.isLoop, slopeThreshold);
    constraints.fixedNodeConstraint = fixedNodeConstraints;

    return {constraints: constraints, applyIncremental: assignment.applyIncremental};
  };

  // remove one degree nodes from graph to make it simpler
  let pruneGraph = function (cy, graph) {
    let prunedGraph = cy.collection();
    let oneDegreeNodes = cy.collection();
    graph.nodes().forEach(node => {
      if (node.degree() == 1) {
        oneDegreeNodes.merge(node);
      }
    });
    if ((oneDegreeNodes.length == 2 && graph.nodes().length == 3) || (graph.nodes().length == 2)) {  // in case it is a 3-node or 2-node line graph
      prunedGraph = graph;
    } else {
      graph.nodes().forEach(node => {
        if (node.degree() > 1) {
          prunedGraph.merge(node);
        }
      });
    }

    let edgesBetween = prunedGraph.edgesWith(prunedGraph);
    prunedGraph.merge(edgesBetween);
    let ignoredGraph = cy.elements().difference(prunedGraph);

    return { prunedGraph, ignoredGraph };
  };

  let uggly = function () {

  };

  uggly.generateConstraints = function(options){
    let cy = options.cy;
    let imageData = options.imageData;
    let subset = options.subset || undefined;
    let slopeThreshold = options.slopeThreshold || 0.15;
    let cycleThreshold = optFn( options.cycleThreshold, cy ) || undefined;
    let connectionTolerance = options.connectionTolerance || 10;
    return generateConstraints(cy, imageData, subset, slopeThreshold, cycleThreshold, connectionTolerance);
  };

  // Make uggly available globally if running in browser
  if (typeof window !== 'undefined') {
    window.uggly = uggly;
  }

  const isFn = fn => typeof fn === 'function';

  const optFn = ( opt, cy ) => {
    if( isFn( opt ) ){
      return opt( cy );
    } else {
      return opt;
    }
  };

  /*!
   * uggly.js
   * License: CC0 1.0 Universal
   *
   * This project uses simplify.js, licensed under the BSD-2-Clause License:
   *
   * Copyright (c) 2017, Vladimir Agafonkin
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without modification, are
   * permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice, this list of
   *    conditions and the following disclaimer.
   * 
   * 2. Redistributions in binary form must reproduce the above copyright notice, this list
   *    of conditions and the following disclaimer in the documentation and/or other materials
   *    provided with the distribution.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
   * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
   * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
   * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
   * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
   * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   */

  return uggly;

}));
