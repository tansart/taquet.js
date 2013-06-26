/**
 * @name  Backbone.Model
 */
/**
 * @name  Backbone.View
 */
/**
 * @name  Backbone.Collection
 */
/**
 * @name  define
 */
/**
 * @name  Backbone.View
 */
/**
 * @name  Backbone.Collection
 */
/**
 * @name  define
 */
/**
 * @name  require
 */
/**
 * @name  requirejs
 */
/**
 * @name  describe
 */

requirejs.config({

  baseUrl: './src/',

  paths: {
    jquery:'vendor/jquery',
    underscore: 'vendor/lodash',
    backbone: 'vendor/backbone',
    text: 'vendor/text'
  },

  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore'],
      exports: "Backbone"
    }
  }
});

require([
  'com/stilva/taquet/view/BaseView',
  'com/stilva/taquet/event/BubbleEvent'
], function(BaseView, BubbleEvent) {
  "use strict";

  function onBubblingEventHandler(e) {
    /* jshint validthis: true */
    console.error("bubbling event triggered:", this.el, e);
  }

  var outerView, innerView, innerView2, innerInnerView,

  OuterView = BaseView.extend({
    initialize: function(){
      this.on("bubbles", onBubblingEventHandler);
      this.once("bubbles", onBubblingEventHandler);

      innerView = new InnerView();
    }
  }),

  InnerView = BaseView.extend({
    initialize: function() {
      this.on("bubbles", onBubblingEventHandler);
    }
  }),

  InnerInnerView = BaseView.extend({
    tagName: "aside",
    id: "i-am-inner-inner-view",
    initialize: function() {
      this.on("bubbles", onBubblingEventHandler);
    },
    dispatch: function() {
      this.trigger(new BubbleEvent("bubbles", true, true));
    }
  });

  innerInnerView = new InnerInnerView();
  console.warn('nothing should happen');
  innerInnerView.dispatch();

  outerView = new OuterView();
  document.body.appendChild(outerView.render().el);
  outerView.el.id = "i-am-outer-view";
  outerView.el.appendChild(innerInnerView.el);
  console.warn('outerView should react twice');
  innerInnerView.dispatch();

  var span = document.createElement("span");
  span.id = "i-am-inner-view-two";
  outerView.el.appendChild(span);

  innerView2 = new InnerView({el:span});
  innerView2.on("bubbling-alone", onBubblingEventHandler);

  var dom = document.createElement('nav');
  dom.id = "i-am-inner-view";
  innerView.setElement(dom);
  outerView.el.insertBefore(dom, document.getElementById("i-am-inner-view"));

  dom.appendChild(innerInnerView.el);
  console.warn('everyone and everything should react once');
  innerInnerView.dispatch();
});

/*
require(['com/nnewView', 'com/stilva/taquet/view/BaseView'],
  function(nnewView, BaseView) {
    var aaa = "abababa";
    var newView = BaseView.extend({
      commands: ["a", "b", "c"],

//      commandManagerId : "id",
      initialize: function() {
        var bbb = 'aaa';
        console.log("instantiating nnewView() >>>");
        console.log(this.addChild(new nnewView()));

        this.on("test", function() {
          console.log('blabla', this)
        });

        this.a = BaseView.extend({

          initialize: function() {
            console.log("instanciating b");
          },

          commands: ["a", "b", "c"],

          commandHandler : function(){
            console.log('new-view-1-2', this);
          }
        });

        console.log("instanciating a");
        new this.a();
      },

      commandHandler : function(){
        console.log('new-view-1', this);
      }
    });

    console.log("instanciated instance");
    var instance = new newView({
//      commandManagerId : "id",
      commands : ["d", "e", "f"]
    });

    instance.sendCommand("b");

  }
);*/