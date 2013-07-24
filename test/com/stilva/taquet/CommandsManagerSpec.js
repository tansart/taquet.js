/* globals _, Taquet, jasmine */
describe("CommandManagerSpec ::", function() {
  "use strict";

  var CommandManager  = Taquet.CommandManager;

  var manager     = new CommandManager(_.uniqueId()),
      manager2    = new CommandManager(_.uniqueId()),

      container   = {},

      onCallBack  = jasmine.createSpy("onCallBack"),
      onCallBack2 = jasmine.createSpy("onCallBack2"),
      onCallBack3 = jasmine.createSpy("onCallBack3");

  manager.addCommand("ONE", onCallBack);
  manager.addCommand("TWO", onCallBack);
  manager.addCommand("THREE", onCallBack);

  container.init = function() {
    manager.addCommand.call(this, "TWO", onCallBack2);
  };
  container.remove = function() {
    manager.remove.call(this, "TWO");
  };

  container.init();


  manager2.addCommand("TWO", onCallBack3);

  manager.exec.call(this, "ONE");
  manager.exec.call(this, "TWO");
  manager.exec.call(this, "THREE");

  it("adds multiple commands to one callback", function() {
    expect(onCallBack).toHaveBeenCalled();
    expect(onCallBack.calls.length).toEqual(3);
  });

  it("one command-type can be associated to many callbacks", function() {
    expect(onCallBack2).toHaveBeenCalled();
    expect(onCallBack2.calls.length).toEqual(1);
  });

  it("commands are kept within their respective CommandManagers", function() {
    expect(onCallBack3).not.toHaveBeenCalled();
    manager2.exec.call(this, "TWO");
    expect(onCallBack3).toHaveBeenCalled();
  });

  it("remove() properly removes the callbacks", function() {
    container.remove();

    manager.exec.call(this, "TWO", "test string");

    expect(onCallBack.calls.length).toEqual(4);
    expect(onCallBack2.calls.length).toEqual(1);
  });
});