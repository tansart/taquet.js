/* jshint strict: false */
/* globals BaseEvent, Backbone */
var _collection = Backbone.Collection;

Backbone.Collection = function(models, options) {

  BaseEvent.apply(this);

  return _collection.call(this, models, options);
};

Backbone.Collection.prototype = _collection.prototype;

Backbone.Collection.extend = _collection.extend;