/* globals _, TaquetCore, CommandManager */
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
};