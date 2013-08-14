/* jshint strict: false */
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
};