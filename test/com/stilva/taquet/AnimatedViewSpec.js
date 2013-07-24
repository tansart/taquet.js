/* globals $, Taquet, Backbone */
$(function(){
  "use strict";

  var AnimatedView = new Taquet.AnimatedView();

  describe("AnimatedView", function() {
    it("", function() {
      console.log("animatedView::", AnimatedView);
      expect(false).toBeTruthy();
    });
  });

});

var View, Router;

View = new Taquet.AnimatedView.extend({
  route: "test"
});

Router = new Backbone.Router.extend({
  routes : {

  }
});