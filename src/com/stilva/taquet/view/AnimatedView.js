/* jshint strict: false */
/* globals Backbone, _ */
var AnimatedView = function(options) {
  // BaseAnimatedView's init code
  Backbone.View.apply(this, [options]);
};

_.extend(AnimatedView.prototype, Backbone.View.prototype, {

  // all the AnimatedView's methods
  resize: function() {
  },

  _onShown: function() {
    this.trigger(this.SECTION_SHOWN, this.ID);
  },

  _onHidden: function() {
    this.trigger(this.SECTION_HIDDEN, this.ID);
  }
});

AnimatedView.extend = Backbone.View.extend;