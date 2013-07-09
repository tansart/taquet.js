/* globals $, Backbone, BubbleEvent */

$(function(){
  "use strict";

  describe("BubbleEventSpec", function() {

    function appendElement(tagName, id, parent) {

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

        HeaderView, ArticleView,

        wrapperView, deeplyNestedView,
        baseViewOne, baseViewTwo, baseViewThree, baseViewFour,
        articleView, menuView, headerView, asideView, navView;

    HeaderView = Backbone.View.extend({
      tagName : "header",
      render: function() {

        this.el.appendChild(document.createTextNode("This is a header"));

        return this;
      }
    });

    ArticleView = Backbone.View.extend({
      tagName : "article",
      render: function() {

        baseViewOne   = new Backbone.View({el:appendElement('section', "section-one", this.el)});
        baseViewTwo   = new Backbone.View({el:appendElement('section', "section-two", this.el)});
        baseViewThree = new Backbone.View({el:appendElement('section', "section-three", this.el)});
        baseViewFour  = new Backbone.View({el:appendElement('section', "section-four", this.el)});

        return this;
      }
    });

    document.body.appendChild(wrapper);
    wrapperView = new Backbone.View({el:wrapper});

    menuView = new Backbone.View();
    menuView.setElement(appendElement('nav'));
    appendElement('a', "anchor-one", menuView.el).setAttribute("href", "#section-one");
    appendElement('a', "anchor-two", menuView.el).setAttribute("href", "#section-two");
    appendElement('a', "anchor-three", menuView.el).setAttribute("href", "#section-three");
    appendElement('a', "anchor-four", menuView.el).setAttribute("href", "#section-four");
    wrapper.appendChild(menuView.el);

    navView = new Backbone.View({el: menuView.el});

    headerView = new HeaderView();
    wrapper.appendChild(headerView.render().el);

    element = appendElement('aside');
    element.appendChild(document.createTextNode("This is the old aside"));
    wrapper.appendChild(element);
    asideView = new Backbone.View({el:element});

    articleView = new ArticleView().render();
    wrapper.appendChild(articleView.el);

    var ul = appendElement("ul");
    ul.innerHTML = "<li><p><span>click me!</span></p></li>";
    deeplyNestedView = new Backbone.View({el:ul});
    baseViewFour.el.appendChild(deeplyNestedView.el);

    describe("The DOM", function() {

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

      it("has its correct data-cid attribute", function() {
        // nav
        element = wrapper.childNodes[0];
        expect(element.getAttribute("data-cid").indexOf(menuView.cid)).not.toBe(-1);

        // header
        element = wrapper.childNodes[1];
        expect(element.getAttribute("data-cid").indexOf(headerView.cid)).not.toBe(-1);

        // aside
        element = wrapper.childNodes[2];
        expect(element.getAttribute("data-cid").indexOf(asideView.cid)).not.toBe(-1);

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

        expect(wrapper.childNodes[2].getAttribute("data-cid")).toBe("");
        expect(wrapper.childNodes[4].getAttribute("data-cid")).toBe(oldCID);
      });
    });

    describe("Checking that BubbleEventManager", function() {

      /* global jasmine, spyOn */

      var bubbleEvent, bubbleEvent2, bubbleDown,
        handlerScope = null, innerHandler,
        wrapperViewHandler, articleViewHandler, baseViewOneHandler, baseViewTwoHandler, bubbleDownHandler;

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

      bubbleDownHandler = jasmine.createSpy('bubbleDownHandler');

      articleViewHandler = jasmine.createSpy('articleViewHandler');
      baseViewOneHandler = jasmine.createSpy('baseViewOneHandler');
      baseViewTwoHandler = jasmine.createSpy('baseViewTwoHandler');

      bubbleEvent = new BubbleEvent("bubble");
      bubbleEvent2 = new BubbleEvent("bubble-two");
      bubbleDown = new BubbleEvent("bubbleDown", false);

      wrapperView.on("bubble", wrapperViewHandler.on);
      articleView.on("bubble", articleViewHandler);
      baseViewOne.on("bubble", baseViewOneHandler);
      baseViewTwo.on("bubble", baseViewTwoHandler);
      baseViewTwo.trigger(bubbleEvent, "test string", "Am I there yet?");

      wrapperView.on("bubble-two", wrapperViewHandler.on);
      articleView.on("bubble-two", wrapperViewHandler.two);
      baseViewThree.trigger(bubbleEvent2);

      wrapperView.on("bubbleDown", bubbleDownHandler);
      articleView.on("bubbleDown", bubbleDownHandler);
      baseViewFour.on("bubbleDown", bubbleDownHandler);
      deeplyNestedView.trigger(bubbleDown);

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

      it("bubbles the events down the dom", function() {
        expect(bubbleDownHandler).toHaveBeenCalled();
        waitsFor(function() {
          return (bubbleDownHandler.callCount === 3);
        });
        runs(function() {
          expect(bubbleDownHandler.callCount).toBe(3);
        });
      });
    });

    describe("Events are triggered on multi-node to one dom", function() {
      var navHandler  = jasmine.createSpy('navHandler'),
          bubble      = new BubbleEvent("navigationEvent");

      menuView.on("navigationEvent", navHandler);
      navView.on("navigationEvent", navHandler);
      (new Backbone.View({el:$("#anchor-one")})).trigger(bubble);

      it("reacts to events bubbling from its grandchild", function() {
        expect(navHandler).toHaveBeenCalled();
        expect(navHandler).toHaveBeenCalledWith(bubble);
      });

      it("stops an event's propagation with e.stopPropagation", function() {
        expect(navHandler.callCount).toBe(2);
      });
    });

  });

});