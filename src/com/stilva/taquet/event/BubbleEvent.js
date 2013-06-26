(function(parent, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory();
    });
  } else {
    // Browser globals
    parent.BubbleEvent = factory();
  }
}(this, function() {
  "use strict";

  var BubbleEvent = function (type, cancellable) {

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