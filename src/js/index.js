import { generateConstraints } from "./main";
let uggly = function () {

};

uggly.generateConstraints = function(options){
  let cy = options.cy;
  let imageData = options.imageData;
  let subset = options.subset || undefined;
  let slopeThreshold = options.slopeThreshold || 0.2;
  let cycleThreshold = optFn( options.cycleThreshold, cy ) || undefined;
  return generateConstraints(cy, imageData, subset, slopeThreshold, cycleThreshold);
}

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

export default uggly;