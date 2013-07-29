/* jshint strict: false */
/* globals Backbone */
var _checkUrl = Backbone.History.prototype.checkUrl;

Backbone.History.prototype.checkUrl = function() {
  console.log("checkUrl!");
  return _checkUrl.call(Backbone.history);
};