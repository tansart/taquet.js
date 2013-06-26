define(function() {
  "use strict";
  /**
   * This is a Javascript port of Robert W. Floyd's Treesort 3's algorithm
   *
   * Robert W. Floyd, Algorithm 245: Treesort,
   * Communications of the ACM, v.7 n.12, p.701, Dec. 1964  [doi>10.1145/355588.365103]
   *
   * This is much faster than Array.sort(), or a recursive (and non-recursive) Quicksort
   * http://jsperf.com/sorting-algorithm-comparisons/2
   */

  var _swap, _siftUp, TreeSort;

  _siftUp = (function(){
    var j, copy;

    return function _siftUp(arr, i, n) {

      copy = arr[i];

      do {
        j = 2*i;
        if(j<n) {
          if(arr[j+1] > arr[j]) {
            j++;
          }
          if(arr[j] > copy) {
            arr[i] = arr[j];
            i = j;
          }
        } else {
          arr[i] = copy;
          return arr;
        }
      } while(true);
      return arr;
    };
  }());

  TreeSort = function(arr){
    /* jshint bitwise: false */
    var n = arr.length,
        i = (n/2)|0;
    for(;i>=2;i--) {
      arr = _siftUp(arr, i-1, n-1);
    }
    for(i=n;i>=2;i--) {
      arr = _siftUp(arr, 0, i-1);
      _swap = arr[0];
      arr[0] = arr[i-1];
      arr[i-1] = _swap;
    }
    return arr;
  }
});