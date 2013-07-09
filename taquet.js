/* globals define */
(function(factory) {
  "use strict";

  if (typeof define === 'function' && define.amd) {
    define(['_', '$', 'Backbone', 'BubbleEvent'], function(_, $, Backbone, BubbleEvent) {
      return factory.call(this, _, $, Backbone, BubbleEvent);
    });
  } else {
    // Browser globals
    this.Taquet = factory.call(this, this._, this.$, this.Backbone, this.BubbleEvent);
  }
}.call(this, function(_, $, Backbone, BubbleEvent) {
  "use strict";

  var attribute = "data-cid";
  /* jshint strict: false */
  /* globals TaquetCore, BaseEvent, _ */
  var Queue = function _queue(options) {
    var self = this;

    BaseEvent.apply(this);

    this.QUEUE_UPDATED  = 'QUEUE_UPDATED_EVENT';

    // Let's not iterate through an object with `this.proxy`
    _.each(options, function(item, key){
      self[key] = item;
    });

    this.proxy = TaquetCore.proxy;
  };

  if(!Queue.hasOwnProperty("length")) {
    Queue.length = 0;
  }

  (function(){
    var i = 0,
        l = 0,
        methods = ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join'];
    for(l=methods.length;i<l;i++) {
      /* jshint loopfunc : true */
      (function(method){
        Queue.prototype[method] = function() {
          return [][method].apply(this, arguments);
        };
      }(methods[i]));
    }

  }());

  _.extend(Queue.prototype, {
    push: function() {
      return [].push.apply(this, arguments);
    },

    set: function(array) {
      var item;
      this.clear();

      while(item = array.shift()) {
        this.push(item);
      }

      this.sendCommand(this.QUEUE_UPDATED);
    },

    clear: function() {
      do {
        this.pop();
      } while(this.length>0);
    },

    isEmpty: function() {
      return this.length === 0;
    }
  });  /* exported OriginValidator */
  function OriginValidator(){
  }  /* jshint strict: false */
  /* globals $ */
  var TaquetCore,
      $window = $(window),
      $document = $(document);

  TaquetCore = {

    RESIZE_EVENT: "resize",

    HTML5: {
      canvas: false,
      webgl: false
    },

    $window: $window,
    $document: $document,

    // see tests: http://jsperf.com/proxy/3
    // Attempting to move the Arrays operations overhead
    // (slice & arguments) to the init phase
    proxy: function(fn, context) {
      if(arguments.length > 2) {
        var args = [].slice.call(arguments, 2);
        return function() {
          return fn.apply(context, [].slice.call(arguments).concat(args));
        };
      } else {
        return function() {
          // http://jsperf.com/array-slice-vs-conditional-slice
          // this.proxy is used for events. seeing how there's little gain
          // between the conditional & unconditional slice
          return fn.apply(context, [].slice.call(arguments));
        };
      }
    }
  };  /* jshint strict: false */
  /* exported BubbleEventManager */
  /* globals _, OriginValidator, attribute */

  //TODO see if there is the need for a MutationObserver
  // http://jsperf.com/array-data-insertion

  var _cids = {};

  function _eventIterator(eventTree, event) {
    var src;

    if(eventTree.length > 0) {
      try {
        src = eventTree.shift();
        src.trigger.apply(src, event);
      } catch(e) {
        throw new Error(e);
      }

      if(!event[1]._stopPropagation) {
        _.defer(_eventIterator, eventTree, event);
      }
    }
  }

  function _bubbleUpHierarchy(dom) {
    var matched,
      tree    = [],
      parent  = dom,
      cid     = null;

    while(parent.nodeName !== "HTML" && (parent = parent.parentNode)) {
      // hasAttribute() is broken in <IE8
      if(cid = parent.getAttribute(attribute)) {
        matched = cid.match(/[^,\s]+/ig);
        while(cid = matched.shift()) {
          if(_cids.hasOwnProperty(cid)) {
            tree.push(_cids[cid]);
          }
        }
      }
    }

    return tree;
  }

  function _bubbleDownHierarchy(dom) {
    var matched,
      index,
      child,
      children,
      tree    = [],
      cid     = null,
      pattern = /[^,\s]+/g;

    var concat = [].push,
        slice = [].slice;

    if(!dom) {
      return;
    }

    index = 0;
    children = [dom];
    while(child = children[index]) {
      concat.apply(children, slice.call(child.children));
      ++index;
    }

    while(child = children[--index]){
      cid = child.getAttribute(attribute);
      if(cid && (matched = cid.match(pattern))) {
        concat.apply(tree, matched);
      }
    }

    return tree;
  }

  /**
   * Singleton. There's no real reason for BubblesManager to be a Multiton
   * as the events propagate through the hierarchy. 1 DOM, 1 BubbleEventManger
   */
  function BubbleEventManager() {

    if(BubbleEventManager.prototype._instance) {
      return BubbleEventManager.prototype._instance;
    }

    this.add = function(cid, view) {
      _cids[cid] = view;
    };

    this.trigger = function (e) {
      var args, eventTree;

      // this.trigger is only invoked should e be an instance of BubbleEvent
      if(typeof e !== "string") {
        args = [e.type, e].concat([].slice.call(arguments, 1));

        //TODO see if caching the last few event trees is worth it?
        if(this.el && !!this.el.parentNode) {
          if(e.bubbleUp) {
            eventTree = _bubbleUpHierarchy(this.el);
          } else {
            eventTree = _bubbleDownHierarchy(this.el);
          }
          _eventIterator(eventTree, args);
        }
      }
    };

    this.remove = function() {
      var leaf,
          validator,
          eventTree;

      if(this.el && !!this.el.firstChild) {
        eventTree = _bubbleDownHierarchy(this.el);

        if(eventTree) {
          validator = new OriginValidator();

          while(leaf = eventTree.shift()) {
            if(_cids.hasOwnProperty(leaf)) {
              _cids[leaf].off();
              _cids[leaf].remove(validator);
            }
          }
        }
      }
    };

    BubbleEventManager.prototype._instance = this;

    if (Object.hasOwnProperty('freeze')) {
      Object.freeze(BubbleEventManager.prototype._instance);
    }
  }  /* exported CommandManager */
  /* jshint strict: false */

  /**
   * A Multiton that, as the name suggest manages commands
   */
  function CommandManager(uid) {
    CommandManager.prototype._commands = CommandManager.prototype._commands || {};

    if (CommandManager.prototype._commands[uid]) {
      return CommandManager.prototype._commands[uid];
    }

    var commands  = {};

    /**
     * Returns a reference to the dictionary while making sure
     * the given command type exists.
     *
     * @param type Notification type
     */
    function has(type) {
      commands[type] = commands[type] || [];
      return commands[type];
    }

    this.addCommand = function (type, callback) {
      has(type).push({currentTarget:this, callback: callback});
    };

    this.remove = function (type) {
      if(this instanceof CommandManager) {
        console.warn(type, 'scope issue. Make sure to call exec with the right scope');
      } else if (commands && typeof commands[type] === "object") {
        for (var i = 0, l = commands[type].length; i<l; i++) {
          if(this === commands[type][i].currentTarget) {
            commands[type].splice(i, 1);
            break;
          }
        }
      }
    };

    //TODO Should the scope checking be offloaded elsewhere?
    this.exec = function (type) {
      if (!commands[type]) {
        console.warn(type, 'Nothing to trigger');
      } else if(this instanceof CommandManager) {
        console.warn(type, 'scope issue. Make sure to call exec with the right scope');
      } else {
        var i = 0,
            l = commands[type].length,
            cInstanceOf = this instanceof CommandManager,
            command;

        for (; i<l; i++) {
          command = commands[type][i];

          if(cInstanceOf || (!cInstanceOf && this !== command.currentTarget)) {
            command.callback.apply(this, [{type:type, currentTarget:command.currentTarget}].concat([].slice.call(arguments, 1)));
          }
        }
      }
    };

    CommandManager.prototype._commands[uid] = this;
    if (Object.hasOwnProperty('freeze')) {
      Object.freeze(CommandManager.prototype._commands[uid]);
    }

  }  /* globals TaquetCore, BaseEvent, _ */
  /* jshint strict: false */

  var CommandQueue;

  function _extend(method) {
    CommandQueue.prototype[method] = function() {
      return [][method].apply(this, arguments);
    };
  }

  CommandQueue = function _commandQueue(options) {
    var self = this;

    BaseEvent.apply(this);

    this.QUEUE_UPDATED  = 'QUEUE_UPDATED_EVENT';

    // Let's not iterate through an object with `this.proxy`
    _.each(options, function(item, key){
      self[key] = item;
    });
  //
    this.proxy = TaquetCore.proxy;
  };

  if(!CommandQueue.hasOwnProperty("length")) {
    CommandQueue.length = 0;
  }

  (function(){
    var i = 0,
        l = 0,
        methods = ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join'];

    for(l=methods.length;i<l;i++) {
      _extend.call(this, methods[i]);
    }

  }());

  _.extend(CommandQueue.prototype, {
    push: function() {
      return [].push.apply(this, arguments);
    },

    set: function(array) {
      var item;
      this.clear();

      while(item = array.shift()) {
        this.push(item);
      }

      this.sendCommand(this.QUEUE_UPDATED);
    },

    clear: function() {
      do {
        this.pop();
      } while(this.length>0);
    },

    isEmpty: function() {
      return this.length === 0;
    }
  });  /* globals _, TaquetCore, CommandManager */
  /* jshint strict: false */
  var BaseEvent,
      commandManager  = null,
      singletonID     = _.uniqueId('singleton');

  BaseEvent = function(options) {

    options             = options || {};
    commandManager      = new CommandManager(options.commandManagerId || this.commandManagerId || singletonID);

    /**
     * EVENTS
     */
    this.NAVIGATE = "NAVIGATE_EVENT";

    /**
     * Like the trigger methods, sendCommand is making sure to have
     * the proper scope
     */
    this.sendCommand    = TaquetCore.proxy(commandManager.exec, this);
    this.removeCommand  = commandManager.remove;

    this.commands       = this.commands || [];

    /* type checking to reduce the risk of errors */
    if(typeof this.commands === "string") {
      this.commands = [this.commands];
    }

    if(options.hasOwnProperty("commands") && typeof this.commands.concat === "function") {
      this.commands = _.union(this.commands, options.commands);
    }

    for(var i=0, l=this.commands.length; i<l; i++) {
      if(typeof this.commands[i] === "string") {
        commandManager.addCommand.call(this, this.commands[i], this.commandHandler);
      }
    }
  };  /* globals BaseEvent, TaquetCore, _, Backbone */
  /* jshint strict: false */
  var BaseApplication = function() {

    BaseEvent.apply(this);

    this.initialize.apply(this);

    this.$window.trigger(TaquetCore.RESIZE_EVENT);
  };

  _.extend(BaseApplication.prototype, TaquetCore);
  _.extend(BaseApplication.prototype, Backbone.Events);

  BaseApplication.extend = Backbone.View.extend;  /* jshint strict: false */
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
  };  /* jshint strict: false */
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

  BaseAnimatedView.extend = Backbone.View.extend;  /* jshint strict: false */
  /* globals BaseEvent, _, Backbone */
  var BaseModel = function (options) {

    BaseEvent.apply(this);
    // BaseAnimatedView's init code

    Backbone.Model.apply(this, [options]);
  };

  _.extend(BaseModel.prototype, Backbone.Model.prototype);

  BaseModel.extend = Backbone.Model.extend;  /* jshint strict: false */
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
  var Taquet;
  
  Taquet = {
    CommandManager: CommandManager
  };

  return Taquet;

}));