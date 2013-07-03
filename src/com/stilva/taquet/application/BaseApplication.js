/* globals BaseEvent, TaquetCore, _, Backbone */
/* jshint strict: false */
var BaseApplication = function() {

  BaseEvent.apply(this);

  this.initialize.apply(this);

  this.$window.trigger(TaquetCore.RESIZE_EVENT);
};

_.extend(BaseApplication.prototype, TaquetCore);
_.extend(BaseApplication.prototype, Backbone.Events);

BaseApplication.extend = Backbone.View.extend;