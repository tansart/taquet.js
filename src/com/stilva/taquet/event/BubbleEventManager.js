define([
  'vendor/setImmediate' // registers to window
],
  function () {
    "use strict";

    //TODO see if there is the need for a MutationObserver
    // http://jsperf.com/array-data-insertion
    /**
    * Singleton. There's no real reason for BubblesManager to be a Multiton
    * as the events propagate through the hierarchy. 1 DOM, 1 BubbleEventManger
    */
    function BubbleEventManager() {

      if (BubbleEventManager.prototype._instance) {
        return BubbleEventManager.prototype._instance;
      }

      this.add = function(cid, view) {
        _cids[cid] = view;
      };

      this.trigger = function (e) {
        var args, eventTree;

        // this.trigger is only invoked should e be an instance of BubbleEvent
        if(typeof e.type !== "string") {
          return;
        }

        args = [e.type, e].concat([].slice.call(arguments, 1));

        //TODO see if caching the last few event trees is worth it?
        if(this.el && _hasParent(this.el)) {
          eventTree = _checkHierarchy(this.el);
          _eventIterator(eventTree, args);
        }
      };

      BubbleEventManager.prototype._instance = this;

      if (Object.hasOwnProperty('freeze')) {
        Object.freeze(BubbleEventManager.prototype._instance);
      }
    }

    var _cids = {};

    function _hasParent(dom) {
      try {
        return (dom.parentNode !== null && dom.parentNode !== undefined);
      } catch(e) {
        return console.error(e);
      }
    }

    function _checkHierarchy(dom) {
      var tree    = [],
          parent  = dom,
          cid     = null;

      do {
        // hasAttribute() is broken in <IE8
        if(cid = parent.getAttribute("data-cid")) {
          if(_cids.hasOwnProperty(cid)) {
            tree.unshift(_cids[cid]);
          }
        }
      } while(parent.nodeName !== "HTML" && (parent = parent.parentNode));

      return tree;
    }

    function _eventIterator(eventTree, event) {
      var src;
      if(eventTree.length > 0) {
        try {
          src = eventTree.splice(0, 1)[0];
          src.trigger.apply(src, event);
        } catch(e) {
          throw new Error(e);
        }

        if(!event._stopPropagation) {
          /* global setImmediate */
          setImmediate(_eventIterator, eventTree, event);
        }
      }
    }

    return BubbleEventManager;
  }
);