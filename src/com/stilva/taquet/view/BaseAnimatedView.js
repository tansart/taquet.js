/* jshint strict: false */
/* globals Backbone, _ */
var BaseAnimatedView = function(options) {
  // BaseAnimatedView's init code
  this.ID = "BaseAnimatedView";

  Backbone.View.apply(this, [options]);
};

_.extend(BaseAnimatedView.prototype, Backbone.View.prototype, {

  // all the BaseAnimatedView's methods
  resize: function() {
  },

  _onShown: function() {
    this.trigger(this.SECTION_SHOWN, this.ID);
  },

  _onHidden: function() {
    this.trigger(this.SECTION_HIDDEN, this.ID);
  }
});

BaseAnimatedView.extend = Backbone.View.extend;