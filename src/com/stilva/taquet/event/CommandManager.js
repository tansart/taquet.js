define(function () {
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

    this.addCommand = function (type, callback, context) {
      has(type).push({caller: this, callback: callback, currentTarget: context});
    };

    this.remove = function (type) {
      var iterator;
      if (commands && typeof commands[type] === "object") {
        for (iterator in commands[type]) {
          if (commands[type].hasOwnProperty(iterator)) {
            console.log(iterator);
          }
        }
      }
    };

    this.exec = function (type) {
      if (!commands[type]) {
        console.warn(type, 'Nothing to trigger');
      } else {
        var event, iterator;
        for (iterator in commands[type]) {
          if (commands[type].hasOwnProperty(iterator)) {
            event = {type: type, target: this, currentTarget: commands[type][iterator].currentTarget};
            commands[type][iterator].callback.apply(this, [event].concat([].slice.call(arguments, 1)));
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

});