/* jshint strict: false */
/* globals BaseEvent, Backbone */
var _model = Backbone.Model;

Backbone.Model = function (options) {

  BaseEvent.apply(this);

  return _model.call(this, options);
};

Backbone.Model.extend = _model.extend;