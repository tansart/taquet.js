/* jshint strict: false */
/* globals BaseEvent, Backbone */
var _model = Backbone.Model;

Backbone.Model = function(attributes, options) {

  BaseEvent.apply(this);

  return _model.call(this, attributes, options);
};

Backbone.Model.prototype = _model.prototype;

Backbone.Model.extend = _model.extend;