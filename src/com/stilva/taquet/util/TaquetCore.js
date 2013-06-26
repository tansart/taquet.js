(function(parent, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define([
      'jquery'
    ], function($) {
      return factory($);
    });
  } else {
    // Browser globals
    parent.TaquetCore = factory(parent.$);
  }
}(this, function($) {
  "use strict";

//    var $window = $(window),
//        $document = $(document);

  return {

    HTML5: {
      canvas: false,
      webgl: false
    },

//      $window: $window,
//      $document: $document,

    // see tests: http://jsperf.com/proxy/3
    // Attempting to move the Arrays operations overhead
    // (slice & arguments) to the init phase
    proxy: function(fn, context) {
      if(arguments.length > 2) {
        var args = [].slice.call(arguments, 2);
        return function() {
          return fn.apply(context, [].slice.call(arguments).concat(args));
        };
      } else {
        return function() {
          // http://jsperf.com/array-slice-vs-conditional-slice
          // this.proxy is used for events. seeing how there's little gain
          // between the conditional & unconditional slice
          return fn.apply(context, [].slice.call(arguments));
        };
      }
    }
  };
}));