/* globals jasmine, Backbone */
describe("CommandsSpec :: ", function() {
  "use strict";

  var OuterView, InnerView, InnerInnerView, MenuView,

      outerCommandHandler = jasmine.createSpy("outerCommandHandler"),
      innerCommandHandler = jasmine.createSpy("innerCommandHandler"),
      innerInnerCommandHandler = jasmine.createSpy("innerInnerCommandHandler"),
      menuCommandHandler = jasmine.createSpy("menuCommandHandler"),

      ON_NAVIGATE = "ON_NAVIGATE",
      START_UP = "START_UP",
      SHUT_DOWN = "SHUT_DOWN",
      RESET = "RESET";

  OuterView = Backbone.View.extend({
    commands: [START_UP],
    initialize: function() {
      console.log("outerview initialised");
      this.son = new InnerView();
    },
    commandHandler: outerCommandHandler
  });

  InnerView = OuterView.extend({
    initialize: function() {
      console.log("innerview initialised");
      this.son = new InnerInnerView({commands: [RESET]});
    },
    commandHandler: innerCommandHandler
  });

  InnerInnerView = OuterView.extend({
    commands: [RESET],
    initialize: function() {
      console.log("inner-innerview initialised");
      // nothing
    },
    commandHandler: innerInnerCommandHandler
  });

  MenuView = Backbone.View.extend({
    commands: [START_UP, SHUT_DOWN],
    initialize: function() {
      // nothing
    },
    commandHandler: menuCommandHandler
  });

  describe("Each command is", function(){
    var outerView = new OuterView(),
        menuView  = new MenuView({commands: ON_NAVIGATE});

    it("invoking only the right views", function() {
      menuView.sendCommand(START_UP, "hello, world!");

      expect(outerCommandHandler.calls.length).toBe(1);
      expect(innerCommandHandler.calls.length).toBe(1);
      expect(innerInnerCommandHandler.calls.length).toBe(1);
    });

    it("not invoking the invoker's commandHandler", function(){
      expect(menuCommandHandler.calls.length).toBe(0);
    });

    it("invoking receiving the right arguments", function() {
      outerView.sendCommand(SHUT_DOWN);
      menuView.sendCommand(RESET, "inner, inner view");

      expect(menuCommandHandler.calls.length).toEqual(1);
      expect(innerInnerCommandHandler.mostRecentCall.args[1]).toBe("inner, inner view");
    });

    it("not invoking other commandHandlers", function() {
      expect(outerCommandHandler.calls.length).toBe(1);
      expect(innerCommandHandler.calls.length).toBe(1);
      expect(menuCommandHandler.calls.length).toBe(1);

      expect(innerInnerCommandHandler.calls.length).toBe(2);
      expect(innerInnerCommandHandler.mostRecentCall.args[1]).toBe("inner, inner view");
    });

    it("properly removed on View.remove()", function() {
      outerView.sendCommand(ON_NAVIGATE);
      expect(menuCommandHandler.calls.length).toBe(2);

      menuView.remove();
      outerView.remove();

      menuView.sendCommand(START_UP);
      menuView.sendCommand(RESET);
      outerView.sendCommand(ON_NAVIGATE);

      expect(outerCommandHandler.calls.length).toBe(1);
      expect(innerCommandHandler.calls.length).toBe(2);
      expect(menuCommandHandler.calls.length).toBe(2);

      expect(innerInnerCommandHandler.calls.length).toBe(4);
    });
  });
});