define([
],
  function () {
    "use strict";

    var BubbleEvent = function (type, bubbles, cancelable) {

      this.type             = type;

      this.timestamp        = new Date().valueOf();

      this.bubbles          = bubbles;
      this.cancelable       = cancelable;

      this._stopPropagation = false;

      this.stopPropagation  = function () {
        this._stopPropagation = true;
      };

      this.originalEvent   = null;

    };

    return BubbleEvent;
  }
);