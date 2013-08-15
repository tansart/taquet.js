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

  var attribute = "data-cid",
      /**
       * EVENTS
       */
      NAVIGATE_EVENT = "TAQUET_NAVIGATE_EVENT";

  /* jshint strict: false */
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
  /* globals Backbone */

  var old = Backbone.History;
  Backbone.History = function (){
    console.log(">>> History instanciating!");
    old.call(this);
  };
  Backbone.History.prototype = old.prototype;

  var _checkUrl = Backbone.History.prototype.checkUrl;

  Backbone.History.prototype.checkUrl = function() {
    console.log("checkUrl!", Backbone.history.getFragment());
    return _checkUrl.call(Backbone.history);
  };  /* jshint strict: false */
  /* exported BubbleEventManager */
  /* globals _, OriginValidator, attribute */

  //TODO see if there is the need for a MutationObserver
  // http://jsperf.com/array-data-insertion

  /**
   * Collection containing cid <=> Backbone.View relation
   * @type {{}}
   * @private
   */
  var _cids = {};

  /**
   * Helper method which iterates through the eventTree object,
   * then triggers the associated event with the appropriate scope.
   * @param eventTree Array containing the node with a
   * @param event Array containing the event name, BubbleEvent object and extra parameters
   * @private
   */
  function _eventIterator(eventTree, event) {
    var src;

    try {
      if(event[1]._stopPropagation) {
        return;
      }
    } catch(e) {
      throw new Error("the event parameter is malformed");
    }

    src = eventTree.shift();

    if(src) {
      src.trigger.apply(src, event);
    }

    if(!!eventTree[0]) {
      _.defer(_eventIterator, eventTree, event);
    }
  }

  /**
   * Given a dom node, it returns a collection of Backbone.Views
   * that are attached to the given tree, from the given node all the way up to the roots.
   * @param dom A given dom node to traverse all the way up
   * @returns Array containing Backbone.Views
   * @private
   */
  //TODO Maybe allow for a more module based approach, where events bubble up within a module only?
  function _bubbleUpHierarchy(dom) {
    var matched,
        tree    = [],
        parent  = dom,
        cid     = null;

    // Goes up the DOM hierarchy
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

  /**
   * Given a dom node, it returns a collection of Backbone.Views
   * that are attached to the given tree, from the given node to all its leafs.
   * @param dom A given dom node to traverse all the way up
   * @returns Array containing Backbone.Views
   * @private
   */
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

    // Flattens the dom tree into an array
    while(child = children[index]) {
      concat.apply(children, slice.call(child.children));
      ++index;
    }

    // Goes through the flattened tree and filters through the nodes
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
  //TODO unless we go for a more mudole-based approach?
  function BubbleEventManager() {

    //TODO maybe a getInstance interface instead?
    if(BubbleEventManager.prototype._instance) {
      return BubbleEventManager.prototype._instance;
    }

    BubbleEventManager.prototype._instance = this;

    // Attempt at making it a more solid singleton :)
    if (Object.hasOwnProperty('freeze')) {
      Object.freeze(BubbleEventManager.prototype._instance);
    }
  }

  BubbleEventManager.prototype.add = function(cid, view) {
    _cids[cid] = view;
  };

  BubbleEventManager.prototype.trigger = function (e) {
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

  BubbleEventManager.prototype.remove = function() {
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
  };  /* exported CommandManager */
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
      has(type).push({scope:this, callback: callback});
    };

    this.remove = function (type) {
      if(this instanceof CommandManager) {
        console.warn(type, 'scope issue. Make sure to call exec with the right scope');
      } else if (commands && typeof commands[type] === "object") {
        for (var i = 0, l = commands[type].length; i<l; i++) {
          if(this === commands[type][i].scope) {
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

          if(cInstanceOf || (!cInstanceOf && this !== command.scope)) {
            command.callback.apply(command.scope, [{type:type, currentTarget:this}].concat([].slice.call(arguments, 1)));
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
     * Like the trigger methods, sendCommand is making sure to have
     * the proper scope
     */
    this.sendCommand    = TaquetCore.proxy(commandManager.exec, this);
    this.removeCommand  = commandManager.remove;

    this.commands       = this.commands || [];

    // type checking to reduce the risk of errors
    if(typeof this.commands === "string") {
      this.commands = [this.commands];
    }

    // 
    if(("commands" in options) && _.isArray(this.commands)) {
      this.commands = _.union(this.commands, options.commands);
    }

    for(var i=0, l=this.commands.length; i<l; i++) {
      if(typeof this.commands[i] === "string") {
        commandManager.addCommand.call(this, this.commands[i], this.commandHandler);
      }
    }
  };  /* jshint strict: false */
  /* globals BaseEvent, Backbone */
  var _model = Backbone.Model;

  Backbone.Model = function(attributes, options) {

    BaseEvent.apply(this);

    return _model.call(this, attributes, options);
  };

  Backbone.Model.prototype = _model.prototype;

  Backbone.Model.extend = _model.extend;  /* jshint strict: false */
  /* globals BaseEvent, Backbone */
  var _collection = Backbone.Collection;

  Backbone.Collection = function(models, options) {

    BaseEvent.apply(this);

    return _collection.call(this, models, options);
  };

  Backbone.Collection.prototype = _collection.prototype;

  Backbone.Collection.extend = _collection.extend;  /* jshint strict: false */
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
  };  /* jshint strict: false */
  /* globals Backbone, _, NAVIGATE_EVENT */

  /**
   *
   * @param options
   * @constructor
   */
  var RoutedView = function(options) {

    options = options || {};

    options.commands = options.commands || [];

    //NAVIGATE_EVENT command will help with the loose coupling of Router <-> View
    //making sure we don't double the NAVIGATE_EVENT commands
    if(options.commands.indexOf(NAVIGATE_EVENT) < 0) {
      options.commands.push(NAVIGATE_EVENT);
    }

    this.route = this.route || [];
    //Strings, Arrays are both acceptable inputs
    if(!_.isArray(this.route)) {
      this.route = [this.route];
    }

    if(options.hasOwnProperty("route")) {
      if(_.isArray(options.route)) {
        [].push.apply(this.route, options.route);
      } else {
        [].push.call(this.route, options.route);
      }
    }

    Backbone.View.call(this, options);
  };

  _.extend(RoutedView.prototype, Backbone.View.prototype);

  RoutedView.prototype.initialize = function() {
    console.log("RoutedView initialized", this);
    if(this.hasOwnProperty("route")) {
      this.sendCommand(NAVIGATE_EVENT, this.route);
    }
  };

  RoutedView.prototype.commandHandler = function(command) {
    switch(command.type) {

    case NAVIGATE_EVENT:
      var args = [].slice.call(arguments, 1);
      if(args[0] === this) {
        console.log(">>>", args);
        this.show(args[1]);
        return;
      }
      break;

    }
  };

  RoutedView.prototype.show = function() {

  };

  RoutedView.prototype.hide = function() {

  };

  RoutedView.extend = function(props, staticProps) {

    if(props.hasOwnProperty("initialize")) {
      console.log("initialize overwritten");
    }

    if(props.hasOwnProperty("route")) {
      console.log(props.route);
    }

    return Backbone.View.extend.call(this, props, staticProps);
  };  /* jshint strict: false, loopfunc: true */
  /* globals _, Backbone, BaseEvent, NAVIGATE_EVENT */
  var _router = Backbone.Router;

  Backbone.Router = function (options) {

    options = options || {};

    options.commands = options.commands || [];

    if(options.commands.indexOf(NAVIGATE_EVENT) < 0) {
      options.commands.push(NAVIGATE_EVENT);
    }

    BaseEvent.call(this, options);

    return _router.call(this, options);
  };

  Backbone.Router.prototype = _router.prototype;

  Backbone.Router.prototype.commandHandler = function(command) {

    if(command) {
      switch(command.type) {

      case NAVIGATE_EVENT:
        var i, l, route = [].slice.call(arguments[1]);
        for(i = 0, l = route.length; i<l; i++) {
          this.route(route[i], "animatedView", (function(path) {
            return function() {
              //this being the router
              //command.currentTarget being the caller
              //path is the path that matched
              this.sendCommand(NAVIGATE_EVENT, command.currentTarget, path);
            };
          }( route[i])) );
        }
        break;

      }
    }
  };

  Backbone.Router.extend = function(props, staticProps) {

    if(props.hasOwnProperty("commandHandler")) {

      var commandHandler = props.commandHandler;
      props.commandHandler = function() {

        return commandHandler.call(this, arguments);
      };

    }

    return _router.extend.call(this, props, staticProps);
  };  /* globals BaseEvent, TaquetCore, _, Backbone */
  /* jshint strict: false */
  var BaseApplication = function() {

    BaseEvent.apply(this);

    this.initialize.apply(this);

    this.$window.trigger(TaquetCore.RESIZE_EVENT);
  };

  _.extend(BaseApplication.prototype, TaquetCore);
  _.extend(BaseApplication.prototype, Backbone.Events);

  BaseApplication.extend = Backbone.View.extend;
  var Taquet;
  
  Taquet = {
    CommandManager: CommandManager,
    RoutedView: RoutedView
  };

  return Taquet;

}));