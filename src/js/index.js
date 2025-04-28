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