(function(parent, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define([
      'com/stilva/taquet/util/TaquetCore',
      'com/stilva/taquet/event/BaseEvent',
      'underscore'
    ], function(TaquetCore, BaseEvent, _) {
      return factory(TaquetCore, BaseEvent, _);
    });
  } else {
    // Browser globals
    parent.CommandQueue = factory(parent.TaquetCore, parent.BaseEvent, parent._);
  }
}(this, function(TaquetCore, BaseEvent, _) {
  "use strict";

  var Queue = function _queue(options) {
    var self = this;

    BaseEvent.apply(this);

    this.QUEUE_UPDATED  = 'QUEUE_UPDATED_EVENT';

    // Let's not iterate through an object with `this.proxy`
    _.each(options, function(item, key){
      self[key] = item;
    });

    this.proxy = TaquetCore.proxy;
  };

  Queue.length = 0;

  (function(){
    var i = 0,
        l = 0,
        methods = ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join'];

    for(l=methods.length;i<l;i++) {
      _extend.call(this, methods[i]);
    }

  }());

  _.extend(Queue.prototype, {
    push: function() {
      return [].push.apply(this, arguments);
    },

    set: function(array) {
      var item;
      this.clear();

      while(item = array.shift()) {
        this.push(item);
      }

      this.sendCommand(this.QUEUE_UPDATED);
    },

    clear: function() {
      do {
        this.pop();
      } while(this.length>0);
    },

    isEmpty: function() {
      return this.length === 0;
    }
  });

  function _extend(method) {
    Queue.prototype[method] = function() {
      return [][method].apply(this, arguments);
    };
  }

  return Queue;
}));