/* jshint strict: false */
/* globals Backbone, _, TaquetCore, BaseEvent, BubbleEvent, BubbleEventManager, attribute */
var _backboneView = Backbone.View,
    _bubbleEventsManager = new BubbleEventManager(),
    OriginValidator = function(){};

/**
 * adds the data-cid attribute to this.el || element
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

/**
 * removes the data-cid attribute from this.el || element
 * @private
 */
function _removeCid() {
  /*jshint validthis:true */
  var matched,
      cid = this.el.getAttribute(attribute);

  cid = cid.replace(new RegExp(",*[\\s]*"+this.cid+"[\\s]*,*", 'ig'),
    function(match) {
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
    }
  );

  this.el.setAttribute(attribute, cid);
}

/**
 * patch for setElement
 * @private
 */
function _handleElement(element, delegate) {
  /*jshint validthis:true */

  if(element) {
    _backboneView.prototype.setElement.call(this, element, delegate);
    _addCid.call(this);
  }

  return this;
}

/**
 * Patching Backbone.View
 * @param options Object containing configuration options
 * @constructor
 */
Backbone.View = function (options) {

  this.proxy          = TaquetCore.proxy;

  BaseEvent.call(this, options);

  // This calls the default Backbone.View, which in turn
  // calls initialize();
  _backboneView.call(this, options);

  // Lets the manager add the data attributes
  _bubbleEventsManager.add(this.cid, this);
};

// In Backbone.js, the this.el property can be given through the options,
// set with setElement(), or created in render().
// These following methods are making sure that the cid always stays up-to-date
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

  // Core remove method that takes care of the commands, cid, etc;
  remove: function(origin) {
    if(this.commands) {
      for(var i = 0, l = this.commands.length; i<l; i++) {
        this.removeCommand.call(this, this.commands[i]);
      }
    }

    //TODO there must be a cleaner way to avoid circular calling of remove();
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

  // Abstract Command handler method
  commandHandler: function(command){
    console.warn("commandHandler needs to be overriden. The following command was received, but ignored:", command);
  }

}, BaseEvent.prototype);

/**
 * Patches backbone's extend method so that Taquet's core functionalities don't
 * disappear when a user extends the Backbone.Views
 * @param props
 * @param staticProps
 * @returns Whatever the original Backbone.View would return;
 */
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