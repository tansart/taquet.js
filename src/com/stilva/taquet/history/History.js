/* jshint strict: false */
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
};