/* jshint strict: false */
/* globals BaseEvent, Queue, _, Backbone */
var BaseRouter = function(options) {
  BaseEvent.apply(this);
  // BaseAnimatedView's init code

  // queue is an array containing an Event name that is to be dispatched around
  this._queue = new Queue();

  Backbone.Router.apply(this, [options]);

  this.on(this.SECTION_SHOWN, this._onAnimationShownHandler, this);
  this.on(this.SECTION_HIDDEN, this._onAnimationHiddenHandler, this);

  this.commands = this.commands || [];
  this.commands.push(this.NAVIGATE, this._queue.QUEUE_UPDATED);
//      this.sendCommand.on(this.NAVIGATE, this._onNavigationHandler, this);
//      this._eventManager.on(this._queue.QUEUE_UPDATED, this.proxy(this._proceed, this));
};

_.extend(BaseRouter.prototype, Backbone.Router.prototype, {
  // all the BaseAnimatedView's methods
  /**
   *
   * @param e event type
   * @private
   */
  _onAnimationShownHandler: function() {
    this._proceed();
  },

  /**
   *
   * @param e event type
   * @private
   */
  _onAnimationHiddenHandler: function() {
    // this._queue should not be empty.
    if(!this._queue.isEmpty()) {
      this._eventManager.trigger(this.SECTION_SHOW, this._queue.slice(0));
    } else {
      throw new Error("this._queue in your Router should not be empty. If on purpose override _onAnimationHiddenHandler in your Router");
    }
  },

  _proceed: function() {
    if(this.hasOwnProperty('_onNavigationHandler')) {
      console.warn("The abstract _proceed() method/function was invoked");
    }

    if(!this._queue.isEmpty()) {
      var q = this._queue.slice(0);
      this._eventManager.trigger.apply(this._eventManager, [].concat(this.SECTION_HIDE, q));
    }
  },

  _onNavigationHandler: function(path, options) {
    Backbone.history.navigate(path, options);
  },

  onCommandHandler: function() {
    console.log("onCommand handler", arguments);
  }
});

BaseRouter.extend = Backbone.Router.extend;