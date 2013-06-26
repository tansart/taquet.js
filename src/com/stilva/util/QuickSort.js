define([

  'com/stilva/taquet/util/TaquetCore',

  'underscore'

], function(TaquetCore, _) {
  "use strict";

  /* jshint unused: false */
  var QuickSort = function (options) {
    this._type = null;

    if(options && !options.hasOwnProperty("push")) {
      this._type = options;
    }

    this.proxy = Core.proxy;

    this.length = 0;
  };

//  QuickSort.length = 0;

  (function(){
    var i = 0,
      l = 0,
      methods = ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join', 'toString'];

    for(l=methods.length;i<l;i++) {
      /* jshint loopfunc: true */
      (function(method){
        QuickSort.prototype[method] = function() {
          return [][method].apply(this, arguments);
        };
      }(methods[i]));
    }

  }());

  _.extend(QuickSort.prototype, {
    push: function() {
      var i = 0,
          l = 0,
          n,
          args = [].slice.call(arguments);

      l = args.length;

      for(;i<l;i++) {
        n = Number(args[i][this._type])+0;
        if(!isNaN(n)) {
          [].push.call(this, args[i]);
        }
      }

      return this;
    },

    /* external quickSort */
    quickSort: function() {
      _quickSort.call(this, 0, this.length-1);
    }
  });

  function _quickSort(left, right) {
    /* jshint bitwise: false, validthis: true */

    var i, j, index, pivot, tmp;
    if (this.length > 1) {
      i = left;
      j = right;
      pivot = _get.call(this, ((j + i)/2)|0);

      while (i <= j) {
        while (_get.call(this, i) < pivot) {
          i++;
        }
        while (_get.call(this, j) > pivot) {
          j--;
        }
        if (i <= j) {
          tmp = this[i];
          this[i++] = this[j];
          this[j--] = tmp;
        }
      }
      index = i;

      if (left < index - 1) {
        _quickSort.call(this, left, index - 1);
      }
      if (index < right) {
        _quickSort.call(this, index, right);
      }
    }
    return this;
  }

  function _get(index) {
    /* jshint validthis: true */
    try {
      if(this._type) {
        return this[index][this._type];
      } else {
        return this[index];
      }
    } catch(e) {
      throw new Error(e);
    }
  }

  return QuickSort;
});