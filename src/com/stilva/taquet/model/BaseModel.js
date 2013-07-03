/* jshint strict: false */
/* globals BaseEvent, _, Backbone */
var BaseModel = function (options) {

  BaseEvent.apply(this);
  // BaseAnimatedView's init code

  Backbone.Model.apply(this, [options]);
};

_.extend(BaseModel.prototype, Backbone.Model.prototype);

BaseModel.extend = Backbone.Model.extend;