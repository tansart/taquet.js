define([

  'com/stilva/taquet/event/BaseEvent',

  'underscore',

  'backbone'

],
  function (BaseEvent, _, Backbone) {
    "use strict";

    var BaseModel = function (options) {

      BaseEvent.apply(this);
      // BaseAnimatedView's init code

      Backbone.Model.apply(this, [options]);
    };

    _.extend(BaseModel.prototype, Backbone.Model.prototype);

    BaseModel.extend = Backbone.Model.extend;

    return BaseModel;
  }
);