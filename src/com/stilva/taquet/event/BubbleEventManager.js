/* jshint strict: false */
/* exported BubbleEventManager */
/* globals _, OriginValidator, attribute */

//TODO see if there is the need for a MutationObserver
// http://jsperf.com/array-data-insertion

/**
 * Collection containing cid <=> Backbone.View relation
 * @type {{}}
 * @private
 */
var _cids = {};

/**
 *
 * @param target
 * @param event
 */
function dispatcher(target, event) {
  // stops propagation of the event.
  if(event[1]._stopPropagation) {
    return;
  }

  try {
    target.trigger.apply(target, event);
  } catch(e) {
    throw new Error(e);
  }
}

/**
 * Helper method which iterates through the eventTree object,
 * then triggers the associated event with the appropriate scope.
 * @param eventTree Array containing the node with a
 * @param event Array containing the event name, BubbleEvent object and extra parameters
 * @private
 */
function _eventIterator(eventTree, event) {
  //TODO see if this is worthwhile. The idea was to avoid recursive calls
  while(eventTree[0]){
    _.defer(dispatcher, eventTree.shift(), event);
  }
}

/**
 * Given a dom node, it returns a collection of Backbone.Views
 * that are attached to the given tree, from the given node all the way up to the roots.
 * @param dom A given dom node to traverse all the way up
 * @returns Array containing Backbone.Views
 * @private
 */
//TODO Maybe allow for a more module based approach, where events bubble up within a module only?
function _bubbleUpHierarchy(dom) {
  var matched,
      tree    = [],
      parent  = dom,
      cid     = null;

  // Goes up the DOM hierarchy
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

/**
 * Given a dom node, it returns a collection of Backbone.Views
 * that are attached to the given tree, from the given node to all its leafs.
 * @param dom A given dom node to traverse all the way up
 * @returns Array containing Backbone.Views
 * @private
 */
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

  // Flattens the dom tree into an array
  while(child = children[index]) {
    concat.apply(children, slice.call(child.children));
    ++index;
  }

  // Goes through the flattened tree and filters through the nodes
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
//TODO unless we go for a more mudole-based approach?
function BubbleEventManager() {

  //TODO maybe a getInstance interface instead?
  if(BubbleEventManager.prototype._instance) {
    return BubbleEventManager.prototype._instance;
  }

  BubbleEventManager.prototype._instance = this;

  // Attempt at making it a more solid singleton :)
  if (Object.hasOwnProperty('freeze')) {
    Object.freeze(BubbleEventManager.prototype._instance);
  }
}

BubbleEventManager.prototype.add = function(cid, view) {
  _cids[cid] = view;
};

BubbleEventManager.prototype.trigger = function (e) {
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

BubbleEventManager.prototype.remove = function() {
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