/* jshint strict: false */
/* exported BubbleEventManager */
/* globals _ */

//TODO see if there is the need for a MutationObserver
// http://jsperf.com/array-data-insertion

var _cids = {};

function _eventIterator(eventTree, event) {
  var src;


  if(eventTree.length > 0) {
    try {
//      src = eventTree.splice(0, 1)[0];
//      src.trigger.apply(src, event);
      src = eventTree.shift();
      src.trigger.apply(src, event);
    } catch(e) {
      throw new Error(e);
    }

    if(!event[1]._stopPropagation) {
//      setImmediate(_eventIterator, eventTree, event);
      _.defer(_eventIterator, eventTree, event);
    }
  }
}

function _checkCid(cid) {
  console.log(arguments);
//  if(_cids.hasOwnProperty(cid)) {
//    tree.push(_cids[cid]);
//  }
}

function _hasParent(dom) {
  try {
    return (dom.parentNode !== null && dom.parentNode !== undefined);
  } catch(e) {
    return console.error(e);
  }
}

function _checkHierarchy(dom) {
  var matched,
    tree    = [],
    parent  = dom,
    cid     = null;

  while(parent.nodeName !== "HTML" && (parent = parent.parentNode)) {
    // hasAttribute() is broken in <IE8
    if(cid = parent.getAttribute("data-cid")) {
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

  this.remove = function(cid) {
    delete _cids[cid];
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