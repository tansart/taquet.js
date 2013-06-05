define([

  'backbone',

  'underscore',

  'com/stilva/taquet/util/Core',
  'com/stilva/taquet/event/CommandManager'

],
  function(Backbone, _, Core, CommandManager) {
    "use strict";

    var commandManager  = null,
        singletonID     = _.uniqueId('singleton');

    var BaseEvent = function(options) {

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
      this.sendCommand    = Core.proxy(commandManager.exec, this);
      this.removeCommand  = commandManager.remove;

      this.commands       = this.commands || [];

      /* type checking to reduce the risk of errors */
      if(typeof this.commands === "string") {
        this.commands = [this.commands];
      }

      if(options.hasOwnProperty("commands") && typeof this.commands.concat === "function") {
        this.commands = this.commands.concat(options.commands);
      }

      for(var i=0, l=this.commands.length; i<l; i++) {
        if(typeof this.commands[i] === "string") {
          commandManager.addCommand(this.commands[i], this.commandHandler, this);
        }
      }
    };

    return BaseEvent;
  }
);