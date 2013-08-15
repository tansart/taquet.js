/* globals $, Backbone, BubbleEvent */

// We rely on jQuery & DOM in some of the test
$(function(){
  "use strict";

  describe("BubbleEventSpec", function() {

    /**
     * Short-hand for appending DOM elements. Should the parent node not
     * be provided, the function simply returns the newly constructed element.
     * @param tagName String representing the type of the node
     * @param id String ID of the given DOM element
     * @param parent Optional Parent node to which we want to append the node
     * @returns {HTMLElement} Reference of the newly appended element
     */
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

    /**
     * returns the node with the given ID
     * @param id of the node we're looking for
     * @returns {HTMLElement} If matched, null otherwise
     */
    function get(id) {
      return document.getElementById(id);
    }

    /**
     * returns the first node with the given Tag
     * @param parent within which we'd like to search
     * @param tag of the node we're looking for
     * @returns {HTMLElement} If matched, null otherwise
     */
    function firstTag(parent, tag) {
      return parent.getElementsByTagName(tag)[0];
    }

    // I'm just declaring everything up-top as per JSLint...
    var element,
        wrapper,

        HeaderView, ArticleView,

        wrapperView, deeplyNestedView,
        baseViewOne, baseViewTwo, baseViewThree, baseViewFour,
        articleView, menuView, headerView, asideView, navView;

    /*
      The following represents the HTML structure.

      <div id="bubbleEventManager">
        <nav>
          <a id="anchor-one" href="#section-one"></a>
          <a id="anchor-two" href="#section-two"></a>
          <a id="anchor-three" href="#section-three"></a>
          <a id="anchor-four" href="#section-four"></a>
        </nav>
        <header>This is a header</header>
        <article id="container-article">
          <section id="section-one"></section>
          <section id="section-two"></section>
          <section id="section-three"></section>
          <section id="section-four"></section>
        </article>
      </div>
     */

    /* globals _ */
    wrapper = document.createElement("div");
    wrapper.innerHTML = _.template(document.getElementById("BubbleEvent_tmpl").innerHTML)();
    wrapper = wrapper.children[0];
    // Let's append the wrapper to the body here,
    document.body.appendChild(wrapper);

    // View attaching itself to the Header tag
    HeaderView = Backbone.View.extend({
      render: function() {
        return this;
      }
    });

    // View attaching itself to the Article tag
    ArticleView = Backbone.View.extend({
      render: function() {

        // Let's append nested section tags within this article View.
        baseViewOne   = new Backbone.View({el:get("section-one")});
        baseViewTwo   = new Backbone.View({el:get("section-two")});
        baseViewThree = new Backbone.View({el:get("section-three")});
        baseViewFour  = new Backbone.View({el:get("section-four")});

        return this;
      }
    });

    // wrapperView is attached to the wrapper Node
    wrapperView = new Backbone.View({el:wrapper});

    // This is where we fill <nav> with all the anchords
    menuView = new Backbone.View();
    menuView.setElement(firstTag(wrapper, 'nav'));
    wrapper.appendChild(menuView.el);

    navView = new Backbone.View({el: menuView.el});

    headerView = new HeaderView({el:firstTag(wrapper, "header")});
    wrapper.appendChild(headerView.render().el);

    element = appendElement('aside');
    element.appendChild(document.createTextNode("This is the old aside"));
    wrapper.appendChild(element);
    asideView = new Backbone.View({el:element});

    articleView = new ArticleView({el:firstTag(wrapper, "article")}).render();
    wrapper.appendChild(articleView.el);

    var ul = appendElement("ul");
    ul.innerHTML = "<li><p><span>click me!</span></p></li>";
    deeplyNestedView = new Backbone.View({el:ul});
    baseViewFour.el.appendChild(deeplyNestedView.el);

    describe("Each DOM node associated to a view", function() {

      it("has its correct data-cid attribute", function() {
        // nav
        element = firstTag(wrapper, "nav");
        expect(element.getAttribute("data-cid").indexOf(menuView.cid)).not.toBe(-1);
        // header
        element = firstTag(wrapper, "header");
        expect(element.getAttribute("data-cid").indexOf(headerView.cid)).not.toBe(-1);

        // aside
        element = firstTag(wrapper, "aside");
        expect(element.getAttribute("data-cid").indexOf(asideView.cid)).not.toBe(-1);

        // article
        element = firstTag(wrapper, "article");
        element = element.children;
        var arr = [baseViewOne, baseViewTwo, baseViewThree, baseViewFour];
        for(var i = 0, l = element.length; i<l; i++) {
          expect(element[i].getAttribute("data-cid")).toBe(arr[i].cid);
        }
      });

      it("updates its old data-cid attribute", function() {
        var oldCID = firstTag(wrapper, "aside").getAttribute("data-cid");
        element = appendElement('aside');
        element.appendChild(document.createTextNode("This is the new aside"));
        asideView.setElement(wrapper.appendChild(element));

        var asides = wrapper.getElementsByTagName("aside");
        expect(asides[0].getAttribute("data-cid")).toBe("");
        expect(asides[1].getAttribute("data-cid")).toBe(oldCID);
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