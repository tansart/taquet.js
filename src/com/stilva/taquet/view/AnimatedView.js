/* jshint strict: false */
/* globals Backbone, _, NAVIGATE_EVENT */

var AnimatedView = function(options) {

  options = options || {};

  options.commands = options.commands || [];

  if(options.commands.indexOf(NAVIGATE_EVENT) < 0) {
    options.commands.push(NAVIGATE_EVENT);
  }

  this.route = this.route || [];

  if(!_.isArray(this.route)) {
    this.route = [this.route];
  }

  if(options.hasOwnProperty("route")) {
    console.log(this.route, options.route, options.route.hasOwnProperty("slice"));
    if(_.isArray(options.route)) {
      [].push.apply(this.route, options.route);
    } else {
      [].push.call(this.route, options.route);
    }
  }

  Backbone.View.call(this, options);
};

_.extend(AnimatedView.prototype, Backbone.View.prototype);

AnimatedView.prototype.initialize = function() {
  console.log("AnimatedView initialized", this);
  if(this.hasOwnProperty("route")) {
    this.sendCommand(NAVIGATE_EVENT, this.route);
  }
};

AnimatedView.prototype.commandHandler = function(command) {
  switch(command.type) {

  case NAVIGATE_EVENT:
    var args = [].slice.call(arguments, 1);
    if(args[0] === this) {
      console.log(">>>", args[1]);

      this.show(args[1]);
      return;
    }
    break;

  }
};

AnimatedView.prototype.show = function() {

};

AnimatedView.prototype.hide = function() {

};

AnimatedView.extend = function(props, staticProps) {

  if(props.hasOwnProperty("initialize")) {
    console.log("initialize overwritten");
  }

  if(props.hasOwnProperty("route")) {
    console.log(props.route);
  }

  return Backbone.View.extend.call(this, props, staticProps);
};