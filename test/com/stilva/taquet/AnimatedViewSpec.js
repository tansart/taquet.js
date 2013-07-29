/* globals _, $, Taquet, Backbone */

//From Backbone.js QUnit tests for the Router
var Location, mLocation;

Location = function(href) {
  "use strict";

  this.replace(href);
};

var View, AnimatedView, Router;

Router = Backbone.Router.extend({
  routes : {

  }
});

View = Backbone.View.extend({
  show: function() {
    "use strict";
    console.log("hello, says the normal view");
  },
  hide: function() {
    "use strict";
    console.log("bye bye, says the normal view");
  }
});

AnimatedView = Taquet.AnimatedView.extend({
  route: "name",
  show: function() {
    "use strict";
    console.log("hello----!!");
  },
  hide: function() {
    "use strict";
    console.log("bye bye!!");
  }
});

$(function(){
  "use strict";

  _.extend(Location.prototype, {

    replace: function(href) {
      _.extend(this, _.pick($('<a></a>', {href: href})[0],
        'href',
        'hash',
        'host',
        'search',
        'fragment',
        'pathname',
        'protocol'
      ));
      // In IE, anchor.pathname does not contain a leading slash though
      // window.location.pathname does.
      if (!/^\//.test(this.pathname)) {
        this.pathname = '/' + this.pathname;
      }
    },

    toString: function() {
      return this.href;
    }

  });

  mLocation = new Location('http://example.com');
  Backbone.history = _.extend(new Backbone.History(), {location: mLocation});
  Backbone.history.start({pushState: true});

  var a = new Router(),
      b = new View(),
      c = new AnimatedView({route:["nope", "double-nope"]});

  mLocation.replace('http://example.com/nope');
  Backbone.history.checkUrl();

  // this is an unregistered route
  mLocation.replace('http://example.com/nope');
  Backbone.history.checkUrl();

  mLocation.replace('http://example.com/name');
  Backbone.history.checkUrl();

  mLocation.replace('http://example.com/double-nope');
  Backbone.history.checkUrl();

  describe("AnimatedView", function() {
    it("", function() {
      console.log("animatedView::");
//      expect(false).toBeTruthy();
    });
  });

});