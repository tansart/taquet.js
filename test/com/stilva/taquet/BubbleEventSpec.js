describe("Bubbling Events in taquet.js", function() {
  function appendElement(tagName, id, parent) {
    "use strict";

    if(!tagName) {
      throw new Error("A tagName must be provided");
    }

    var el = document.createElement(tagName);
    if(id) {
      el.id = id;
    }

    if(parent) {
      parent.appendChild(el);
    }

    return el;
  }

  var element,
      wrapper = appendElement('div', "bubbleEventManager"),
      BaseView = require("com/stilva/taquet/view/BaseView"),

      HeaderView, ArticleView,

      wrapperView, deeplyNestedView,
      baseViewOne, baseViewTwo, baseViewThree, baseViewFour,
      articleView, menuView, headerView, asideView;

  HeaderView = BaseView.extend({
    tagName : "header",
    render: function() {
      "use strict";

      this.el.appendChild(document.createTextNode("This is a header"));

      return this;
    }
  });

  ArticleView = BaseView.extend({
    tagName : "article",
    render: function() {
      "use strict";

      baseViewOne   = new BaseView({el:appendElement('section', "section-one", this.el)});
      baseViewTwo   = new BaseView({el:appendElement('section', "section-two", this.el)});
      baseViewThree = new BaseView({el:appendElement('section', "section-three", this.el)});
      baseViewFour  = new BaseView({el:appendElement('section', "section-four", this.el)});

      return this;
    }
  });

  document.body.appendChild(wrapper);

  wrapperView = new BaseView({el:wrapper});

  menuView = new BaseView();
  menuView.setElement(appendElement('nav'));
  appendElement('a', "anchor-one", menuView.el).setAttribute("href", "#section-one");
  appendElement('a', "anchor-two", menuView.el).setAttribute("href", "#section-two");
  appendElement('a', "anchor-three", menuView.el).setAttribute("href", "#section-three");
  appendElement('a', "anchor-four", menuView.el).setAttribute("href", "#section-four");
  wrapper.appendChild(menuView.el);

  headerView = new HeaderView();
  wrapper.appendChild(headerView.render().el);

  element = appendElement('aside');
  element.appendChild(document.createTextNode("This is the old aside"));
  wrapper.appendChild(element);
  asideView = new BaseView({el:element});

  articleView = new ArticleView().render();
  wrapper.appendChild(articleView.el);

  var ul = appendElement("ul");
  ul.innerHTML = "<li><p><span>click me!</span></p></li>";
  deeplyNestedView = new BaseView({el:ul});
  baseViewFour.el.appendChild(deeplyNestedView.el);

  describe("The DOM", function() {
    "use strict";

    it("has all the elements that were created", function() {
      expect(wrapper.id).toBe("bubbleEventManager");
      expect(wrapper.getElementsByTagName("header").length).toBe(1);
      expect(wrapper.getElementsByTagName("aside").length).toBe(1);
      expect(wrapper.getElementsByTagName("article").length).toBe(1);

      expect(wrapper.getElementsByTagName("a").length).toBe(4);
      expect(wrapper.getElementsByTagName("section").length).toBe(4);
    });

    it("has the correct structure", function() {
      // nav
      element = wrapper.childNodes[0];
      expect(element.childNodes.length).toBe(4);
      expect(element.nodeName).toBe("NAV");

      // header
      element = wrapper.childNodes[1];
      expect(element.childNodes.length).toBe(1);
      expect(element.nodeName).toBe("HEADER");

      // aside
      element = wrapper.childNodes[2];
      expect(element.childNodes.length).toBe(1);
      expect(element.nodeName).toBe("ASIDE");

      // article
      element = wrapper.childNodes[3];
      expect(element.childNodes.length).toBe(4);
      expect(element.nodeName).toBe("ARTICLE");

    });
  });

  describe("Each DOM node associated to a view", function() {
    "use strict";

    it("has its correct data-cid attribute", function() {
      // nav
      element = wrapper.childNodes[0];
      expect(element.getAttribute("data-cid")).toBe(menuView.cid);

      // header
      element = wrapper.childNodes[1];
      expect(element.getAttribute("data-cid")).toBe(headerView.cid);

      // aside
      element = wrapper.childNodes[2];
      expect(element.getAttribute("data-cid")).toBe(asideView.cid);

      // article
      element = wrapper.childNodes[3].childNodes;
      var arr = [baseViewOne, baseViewTwo, baseViewThree, baseViewFour];
      for(var i = 0, l = element.length; i<l; i++) {
        expect(element[i].getAttribute("data-cid")).toBe(arr[i].cid);
      }
    });

    it("updates its old data-cid attribute", function() {
      var oldCID = wrapper.childNodes[2].getAttribute("data-cid");
      element = appendElement('aside');
      element.appendChild(document.createTextNode("This is the new aside"));
      asideView.setElement(wrapper.appendChild(element));

      expect(wrapper.childNodes[2].getAttribute("data-cid")).toBeNull();
      expect(wrapper.childNodes[4].getAttribute("data-cid")).toBe(oldCID);
    });
  });

  describe("Checking that BubbleEventManager", function() {
    "use strict";

    /* global jasmine, spyOn */

    var BubbleEvent = require("com/stilva/taquet/event/BubbleEvent"),
      bubbleEvent, bubbleEvent2,
      handlerScope = null, innerHandler,
      wrapperViewHandler, articleViewHandler, baseViewOneHandler, baseViewTwoHandler;

    innerHandler = jasmine.createSpy('innerHandler');
    wrapperViewHandler = {
      on: function(event, string1, string2) {
        handlerScope = this;
        // dirty?
        innerHandler(event, string1, string2);
      },

      two: function(e) {
        e.stopPropagation();
      }
    };

    spyOn(wrapperViewHandler, 'on').andCallThrough();

    articleViewHandler = jasmine.createSpy('articleViewHandler');
    baseViewOneHandler = jasmine.createSpy('baseViewOneHandler');
    baseViewTwoHandler = jasmine.createSpy('baseViewTwoHandler');

    bubbleEvent = new BubbleEvent("bubble");
    bubbleEvent2 = new BubbleEvent("bubble-two");

    wrapperView.on("bubble", wrapperViewHandler.on);
    articleView.on("bubble", articleViewHandler);
    baseViewOne.on("bubble", baseViewOneHandler);
    baseViewTwo.on("bubble", baseViewTwoHandler);
    baseViewTwo.trigger(bubbleEvent, "test string", "Am I there yet?");

    wrapperView.on("bubble-two", wrapperViewHandler.on);
    articleView.on("bubble-two", wrapperViewHandler.two);
    baseViewThree.trigger(bubbleEvent2);

    it("does not react to parallel events", function() {
      expect(baseViewOneHandler).not.toHaveBeenCalled();
    });

    it("does not react to its own events", function() {
      expect(baseViewTwoHandler).not.toHaveBeenCalled();
    });

    it("reacts to events bubbling from its child", function() {
      expect(articleViewHandler).toHaveBeenCalled();
    });

    it("reacts to events bubbling from its grandchild", function() {
      expect(innerHandler).toHaveBeenCalled();
      expect(innerHandler).toHaveBeenCalledWith(bubbleEvent, "test string", "Am I there yet?");
    });

    it("stops an event's propagation with e.stopPropagation", function() {
      expect(innerHandler.callCount).toBe(1);
      expect(bubbleEvent2._stopPropagation).toBeTruthy();
    });

    it("keeps the handler's scope", function() {
      expect(handlerScope).toBe(wrapperView);
    });

  });
});