'use strict'

//-------------------------------------------------------------------------------------------------

function diffRegions(a, b) {
  // a, b are assumed to be sorted alphabetically
  var aIndex = 0, bIndex = 0, difference = [];

  while ( aIndex < a.length ) {
    if (b.length === bIndex) {
      // End of B reached. Everything remaining in A is not in B.
      difference.push(a[aIndex]);
      aIndex += 1;
    }
    else if ( a[aIndex] === b[bIndex] ) {
      // Region at indicies is present in both lists
      aIndex += 1;
      bIndex += 1;
    }
    else if ( a[aIndex] < b[bIndex] ) {
      // Region at aIndex is not present in B
      difference.push(a[aIndex]);
      aIndex += 1;
    }
    else /* a[aIndex] > b[bIndex] */ {
      // Region at bIndex is not present in A
      bIndex += 1;
    }
  }

  return difference;
}

//-------------------------------------------------------------------------------------------------

module.exports = diffRegions;

