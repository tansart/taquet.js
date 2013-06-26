(function(parent, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define([
      'com/stilva/taquet/event/BaseEvent',
      'com/stilva/taquet/util/TaquetCore',
      'underscore',
      'backbone'
    ], function(BaseEvent, TaquetCore, _, Backbone) {
      return factory(BaseEvent, TaquetCore, _, Backbone);
    });
  } else {
    // Browser globals
    parent.BaseApplication = factory(parent.BaseEvent, parent.TaquetCore, parent._, parent.Backbone);
  }
}(this, function(BaseEvent, TaquetCore, _, Backbone) {
  "use strict";

  var BaseApplication = function() {

    BaseEvent.apply(this);

    this.initialize.apply(this);

    this.$window.trigger(this.RESIZE);
  };

  _.extend(BaseApplication.prototype, TaquetCore);
  _.extend(BaseApplication.prototype, Backbone.Events);

  BaseApplication.extend = Backbone.View.extend;

  return BaseApplication;
}));