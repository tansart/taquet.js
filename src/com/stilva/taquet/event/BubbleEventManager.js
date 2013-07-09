/* jshint strict: false */
/* exported BubbleEventManager */
/* globals _, OriginValidator, attribute */

//TODO see if there is the need for a MutationObserver
// http://jsperf.com/array-data-insertion

var _cids = {};

function _eventIterator(eventTree, event) {
  var src;

  if(eventTree.length > 0) {
    try {
      src = eventTree.shift();
      src.trigger.apply(src, event);
    } catch(e) {
      throw new Error(e);
    }

    if(!event[1]._stopPropagation) {
      _.defer(_eventIterator, eventTree, event);
    }
  }
}

function _bubbleUpHierarchy(dom) {
  var matched,
    tree    = [],
    parent  = dom,
    cid     = null;

  while(parent.nodeName !== "HTML" && (parent = parent.parentNode)) {
    // hasAttribute() is broken in <IE8
    if(cid = parent.getAttribute(attribute)) {
      matched = cid.match(/[^,\s]+/ig);
      while(cid = matched.shift()) {
        if(_cids.hasOwnProperty(cid)) {
          tree.push(_cids[cid]);
        }
      }
    }
  }

  return tree;
}

function _bubbleDownHierarchy(dom) {
  var matched,
    index,
    child,
    children,
    tree    = [],
    cid     = null,
    pattern = /[^,\s]+/g;

  var concat = [].push,
      slice = [].slice;

  if(!dom) {
    return;
  }

  index = 0;
  children = [dom];
  while(child = children[index]) {
    concat.apply(children, slice.call(child.children));
    ++index;
  }

  while(child = children[--index]){
    cid = child.getAttribute(attribute);
    if(cid && (matched = cid.match(pattern))) {
      concat.apply(tree, matched);
    }
  }

  return tree;
}

/**
 * Singleton. There's no real reason for BubblesManager to be a Multiton
 * as the events propagate through the hierarchy. 1 DOM, 1 BubbleEventManger
 */
function BubbleEventManager() {

  if(BubbleEventManager.prototype._instance) {
    return BubbleEventManager.prototype._instance;
  }

  this.add = function(cid, view) {
    _cids[cid] = view;
  };

  this.trigger = function (e) {
    var args, eventTree;

    // this.trigger is only invoked should e be an instance of BubbleEvent
    if(typeof e !== "string") {
      args = [e.type, e].concat([].slice.call(arguments, 1));

      //TODO see if caching the last few event trees is worth it?
      if(this.el && !!this.el.parentNode) {
        if(e.bubbleUp) {
          eventTree = _bubbleUpHierarchy(this.el);
        } else {
          eventTree = _bubbleDownHierarchy(this.el);
        }
        _eventIterator(eventTree, args);
      }
    }
  };

  this.remove = function() {
    var leaf,
        validator,
        eventTree;

    if(this.el && !!this.el.firstChild) {
      eventTree = _bubbleDownHierarchy(this.el);

      if(eventTree) {
        validator = new OriginValidator();

        while(leaf = eventTree.shift()) {
          if(_cids.hasOwnProperty(leaf)) {
            _cids[leaf].off();
            _cids[leaf].remove(validator);
          }
        }
      }
    }
  };

  BubbleEventManager.prototype._instance = this;

  if (Object.hasOwnProperty('freeze')) {
    Object.freeze(BubbleEventManager.prototype._instance);
  }
}