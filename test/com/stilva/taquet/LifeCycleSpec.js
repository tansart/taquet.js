/* globals $, Backbone, BubbleEvent */
$(function() {
  "use strict";

  var p,
      sibling,
      containerView,
      paragraphView,
      spanView,
      linkView,
      View = Backbone.View,
      dom = document.createElement("div");

  dom.id = "life-cycle-container";
  document.body.appendChild(dom);

  dom.innerHTML = "<p id=\"life-cycle-paragraph\"><span id=\"life-cycle-span\"><a id=\"life-cycle-link\">link within</a></span></p>";

  p = document.getElementById("life-cycle-paragraph");
  sibling = document.createElement("span");
  sibling.id = "life-cycle-span-sibling";
  sibling.innerHTML = "<div><p><a></a></p></div><div><h1></h1></div><div></div>";
  p.appendChild(sibling);

  /*
    div#life-cycle-container
      p#life-cycle-paragraph
        span#life-cycle-span
          a#life-cycle-link
        span#life-cycle-span-sibling
  */

  containerView = new View({el:dom});
  paragraphView = new View({el:document.getElementById("life-cycle-paragraph")});
  spanView = new View({el:document.getElementById("life-cycle-span")});
  linkView = new View({el:document.getElementById("life-cycle-link")});

  //multiple views per node
  new View({el:document.getElementById("life-cycle-span")});
  new View({el:document.getElementById("life-cycle-span")});

  describe("Life cycle in taquet.js", function() {

    describe("Initialise", function() {
      it("has the desired structure", function(){
        expect(dom).not.toBeNull();
        expect(document.getElementById("life-cycle-paragraph")).not.toBeNull();
        expect(document.getElementById("life-cycle-span")).not.toBeNull();
        expect(document.getElementById("life-cycle-span-sibling")).not.toBeNull();
        expect(document.getElementById("life-cycle-link")).not.toBeNull();
      });
    });

    describe("listeners are properly removed", function() {
      var spanHandler = jasmine.createSpy('spanHandler');

      spanView.on("event", spanHandler);
      paragraphView.on("event", spanHandler);
      containerView.on("event", spanHandler);

      spanView.trigger("event");
      spanView.trigger(new BubbleEvent("event"));

      it("bubbles events up the dom tree", function(){
        runs(function() {
          expect(spanHandler).toHaveBeenCalled();
          expect(spanHandler.callCount).toBe(3);
        });
      });

      it("removes all events from its children too", function(){
        runs(function() {
          containerView.remove();
          spanView.trigger("event");
          spanView.trigger(new BubbleEvent("event"));
          expect(spanHandler.callCount).toBe(3);
        });
      });

    });
  });

});