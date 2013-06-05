define([

  'com/stilva/taquet/event/BaseEvent',

  'com/stilva/taquet/util/Core',

  'underscore',

  'backbone'

],
  function(BaseEvent, Core, _, Backbone) {
    "use strict";

    var BaseApplication = function() {

      BaseEvent.apply(this);

      this.initialize.apply(this);

      this.$window.trigger(this.RESIZE);
    };

    _.extend(BaseApplication.prototype, Core);
    _.extend(BaseApplication.prototype, Backbone.Events);

    BaseApplication.extend = Backbone.View.extend;

    return BaseApplication;
  }
);