(function(parent, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory();
    });
  } else {
    // Browser globals
    parent.CommandManager = factory();
  }
}(this, function() {
  "use strict";
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

  }

  return CommandManager;

}));