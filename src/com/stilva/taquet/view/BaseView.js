(function(parent, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define([
      'backbone',
      'underscore',
      'jquery',
      'com/stilva/taquet/util/TaquetCore',
      'com/stilva/taquet/event/BaseEvent',
      'com/stilva/taquet/event/BubbleEvent',
      'com/stilva/taquet/event/BubbleEventManager'
    ], function(Backbone, _, $, TaquetCore, BaseEvent, BubbleEvent, BubbleEventManager) {
      return factory(Backbone, _, $, TaquetCore, BaseEvent, BubbleEvent, BubbleEventManager);
    });
  } else {
    // Browser globals
    parent.BasView = factory(parent.Backbone, parent._, parent.$, parent.TaquetCore, parent.BaseEvent, parent.BubbleEvent, parent.BubbleEventManager);
  }
}(this, function (Backbone, _, $, TaquetCore, BaseEvent, BubbleEvent, BubbleEventManager) {
  "use strict";

  var BaseView,
    _bubbleEventsManager = new BubbleEventManager();

  BaseView = function (options) {

    this.ID             = "BaseView";

    this.proxy          = TaquetCore.proxy;

//      this.$window        = TaquetCore.$window;
//      this.$document      = TaquetCore.$document;

    BaseEvent.call(this, options);

    // initialize is called in the following call
    Backbone.View.call(this, options);

    _handleElement.call(this);
  };

  //TODO Consider overriding listenTo & listenToOnce
  _.extend(BaseView.prototype, Backbone.View.prototype, {

    initialize: function() {
      _handleElement.call(this);
      _bubbleEventsManager.add(this.cid, this);
    },

    setElement: function(element) {
      _handleElement.call(this, element);
    },

    render: function() {
      if(this.el) {
        _handleElement.call(this, this.el);
      }

      return this;
    },

    remove: function() {
      if(this.commands) {
        for(var i = 0, l = this.commands.length; i<l; i++) {
          this.removeCommand.call(this, this.commands[i]);
        }
      }

      if(this.el.getAttribute("data-cid") === this.cid) {
        this.el.removeAttribute("data-cid");
      }

      _bubbleEventsManager.remove(this.cid);
      Backbone.View.prototype.remove.call(this);
    },

    trigger: function(name) {
      var args = [name].concat([].slice.call(arguments, 1));

      if(typeof name === "object" && name instanceof BubbleEvent) {
        _bubbleEventsManager.trigger.apply(this, args);
        return this;
      }

      return Backbone.Events.trigger.apply(this, args);
    },

    /**
     * Abstract Command handler method
     */
    commandHandler: function(command){
      console.warn("commandHandler needs to be overriden. The following command was received, but ignored:", command);
    }

  }, BaseEvent.prototype);

  //  BaseView.extend = Backbone.View.extend;
  BaseView.extend = function(props, staticProps) {

    if(props.hasOwnProperty("initialize")) {
      var initialize = props.initialize;
      props.initialize = function() {
        var initialized = initialize.call(this);
        BaseView.prototype.initialize.call(this);
        return initialized;
      };
    }

    if(props.hasOwnProperty("render")) {
      var render = props.render;
      props.render = function() {
        var rendered = render.call(this);
        BaseView.prototype.render.call(this);
        return rendered;
      };
    }

    var commands;
    if(this.prototype.hasOwnProperty("commands")){
      commands = this.prototype.commands;
    }

    if(props.hasOwnProperty("commands")) {
      [].unshift.apply(props.commands, commands);
    } else {
      props.commands = commands;
    }

    if(props.hasOwnProperty("stopListening")) {
      console.warn("stopListening() is not supposed to be overriden");
    }

    if(props.hasOwnProperty("remove")) {
      console.warn("remove() is not supposed to be overriden");
    }

    if(props.hasOwnProperty("setElement")) {
      console.warn("setElement() is not supposed to be overriden");
    }

    if(props.hasOwnProperty("stopListening")) {
      console.warn("stopListening() is not supposed to be overriden");
    }

    return Backbone.View.extend.call(this, props, staticProps);
  };

  /**
   * adds the data-cid attribute to this.el || element
   * @param element (optional) new DOM element
   * @private
   */
  function _handleElement(element) {
    var cid;
    /*jshint validthis:true */
    if(element) {
      if(element instanceof $) {
        element = element[0];
      }

      cid = element.getAttribute("data-cid");

      if(this.el && this.el !== element) {
        if(cid && cid !== this.cid) {
          throw new Error("The given DOM is already associated to a View, with cid::"+cid);
        }

        this.el.removeAttribute("data-cid");
      }

      element.setAttribute("data-cid", this.cid);

      Backbone.View.prototype.setElement.call(this, element);

    } else if(this.el) {
      this.el.setAttribute("data-cid", this.cid);
    }
  }

  return BaseView;
}));