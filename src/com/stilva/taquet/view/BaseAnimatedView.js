define([

  'com/stilva/taquet/view/BaseView',

  'underscore'

],
  function(BaseView, _) {
    "use strict";

    var BaseAnimatedView = function(options) {
      // BaseAnimatedView's init code
      this.ID = "BaseAnimatedView";

      BaseView.apply(this, [options]);
    };

    _.extend(BaseAnimatedView.prototype, BaseView.prototype, {

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

    BaseAnimatedView.extend = BaseView.extend;

    return BaseAnimatedView;
  }
);