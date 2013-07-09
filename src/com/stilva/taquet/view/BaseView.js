/* jshint strict: false */
/* globals Backbone, _, TaquetCore, BaseEvent, BubbleEvent, BubbleEventManager, OriginValidator, attribute */
var _backboneView = Backbone.View,
  _bubbleEventsManager = new BubbleEventManager();

/**
 * adds the data-cid attribute to this.el || element
 * @param element (optional) new DOM element
 * @private
 */
function _addCid() {
  /*jshint validthis:true */
  var cid;

  if(this.el) {
    cid = this.el.getAttribute(attribute);
    if(cid) {
      if(cid.indexOf(this.cid) === -1) {
        cid += ", "+this.cid;
      } else {
        return;
      }
    } else {
      cid = this.cid;
    }

    this.el.setAttribute(attribute, cid);
  }
}

function _removeCid() {
  /*jshint validthis:true */
  var matched,
      cid = this.el.getAttribute(attribute);

  cid = cid.replace(new RegExp(",*[\\s]*"+this.cid+"[\\s]*,*", 'ig'), function(match) {

    matched = match.match(/,/g);

    if(!matched) {
      return "";
    } else if(matched.length === 1) {
      return match.indexOf(",")===0?"":", ";
    } else if(matched.length === 2) {
      return ",";
    } else {
      throw new Error("data-cid is corrupted");
    }
  });

  this.el.setAttribute(attribute, cid);
}

function _handleElement(element, delegate) {
  /*jshint validthis:true */

  if(element) {
    _backboneView.prototype.setElement.call(this, element, delegate);
    _addCid.call(this);
  }

  return this;
}

Backbone.View = function (options) {

  this.ID             = "Backbone.View";

  this.proxy          = TaquetCore.proxy;

//      this.$window        = TaquetCore.$window;
//      this.$document      = TaquetCore.$document;

  BaseEvent.call(this, options);

  // initialize is called in the following call
  _backboneView.call(this, options);

//  _handleCid.call(this);
  _bubbleEventsManager.add(this.cid, this);
};

_.extend(Backbone.View.prototype, _backboneView.prototype, {

  setElement: function(element, delegate) {
    if(this.el instanceof HTMLElement && element && this.el !== element) {
      _removeCid.call(this);
    }

    return _handleElement.call(this, element, delegate);
  },

  render: function() {
    if(this.el) {
      _addCid.call(this);
    }

    return this;
  },

  remove: function(origin) {
    if(this.commands) {
      for(var i = 0, l = this.commands.length; i<l; i++) {
        this.removeCommand.call(this, this.commands[i]);
      }
    }

    if(!(origin instanceof OriginValidator)) {
      _bubbleEventsManager.remove.call(this);
    }
    _backboneView.prototype.remove.call(this);
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

//Backbone.View.extend = Backbone.View.extend;
Backbone.View.extend = function(props, staticProps) {

  if(props.hasOwnProperty("render")) {
    var render = props.render;
    props.render = function() {
      var rendered = render.call(this);
      Backbone.View.prototype.render.call(this);
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

  return _backboneView.extend.call(this, props, staticProps);
};