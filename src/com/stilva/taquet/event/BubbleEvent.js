/* globals define */
(function(factory) {
  "use strict";

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory();
    });
  } else {
    // Browser globals
    this.BubbleEvent = factory();
  }
}.call(this, function() {
  "use strict";
  var BubbleEvent;

  BubbleEvent = function (type, cancellable) {

    this.type             = type;

    this.timestamp        = new Date().valueOf();

    this.cancellable       = cancellable;

    this._stopPropagation = false;

    this.stopPropagation  = function () {
      this._stopPropagation = true;
    };

  };

  return BubbleEvent;

}));