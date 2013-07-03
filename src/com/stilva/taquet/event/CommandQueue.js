/* globals TaquetCore, BaseEvent, _ */
/* jshint strict: false */

var CommandQueue;

function _extend(method) {
  CommandQueue.prototype[method] = function() {
    return [][method].apply(this, arguments);
  };
}

CommandQueue = function _commandQueue(options) {
  var self = this;

  BaseEvent.apply(this);

  this.QUEUE_UPDATED  = 'QUEUE_UPDATED_EVENT';

  // Let's not iterate through an object with `this.proxy`
  _.each(options, function(item, key){
    self[key] = item;
  });
//
  this.proxy = TaquetCore.proxy;
};

if(!CommandQueue.hasOwnProperty("length")) {
  CommandQueue.length = 0;
}

(function(){
  var i = 0,
      l = 0,
      methods = ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join'];

  for(l=methods.length;i<l;i++) {
    _extend.call(this, methods[i]);
  }

}());

_.extend(CommandQueue.prototype, {
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