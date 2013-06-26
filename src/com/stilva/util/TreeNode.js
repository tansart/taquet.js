define(function() {

	/**
	 * The deeper into the tree structure you dig, the higher the
	 * node number will be.
	 *
	 * @param element
	 * @param parentNode
	 * @constructor
	 */
	// TODO findNode to be optimised with a different uid structure
	var TreeNode = function (element, parentNode) {
		"use strict";

		var _element = element,
			_parentNode = parentNode,
			_nodes = [],
			_nodeID = parentNode ? _assignUID(parentNode.getUID(), parentNode.getNodes().length) : _assignUID(null);

		this.getParent = function () {
			return _parentNode;
		};

		this.addParentNode = function (parentelement) {
			if (_parentNode) throw new Error("A parent is already assigned to this node.");
			_parentNode = new TreeNode(parentelement);
			return _parentNode;
		};

		this.getNodes = function () {
			return _nodes.slice(0);
		};

		/**
		 * Gets the node which contains the given element.
		 * Only looks within the current node.
		 *
		 * Use @see findNode for multi-level look-ups
		 *
		 * @param element
		 * @returns {*}
		 */
		this.getNode = function (element) {
			for (var i = 0, l = _nodes.length; i < l; i++) {
				if (element === _nodes[i].getElement())
					return _nodes[i];
			}

			return null;
		};

		/**
		 * Finds the first node within the hierarchy that contains the element.
		 *
		 * @param element The element to look for.
		 * @param id while this is an optional parameter, I recommended
		 * passing the id for quicker lookups.
		 */
		this.findNode = function (element, ID) {
			//TODO implement a private method called _findInAll as follow:
			//if(!ID) return _findInAll(element);

			var ci, cl, cParent, cChilds, cIterator, cResult,
					cFalsey    = [],
					cCurrentId = _getLevelAndNumber(_nodeID),
					cLookUpId  = _getLevelAndNumber(ID),
					cGoDeeper   = cLookUpId[0] > cCurrentId[0];

			if(cCurrentId[0] === cLookUpId[0]) {
				return this.getNode(element);
			} else {

				cIterator = [this];
				do {
					cResult = cIterator.splice(0, 1)[0];

					cCurrentId = _getLevelAndNumber(cResult.getUID());

					if(cCurrentId[0]+1 === cLookUpId[0]) {
						if(cChilds = cResult.getNode(element)) {
							return cChilds;
						}
					} else if(cCurrentId[0] === cLookUpId[0] && cCurrentId[1] === cLookUpId[1]) {
						return cResult;
					}

					if(!cGoDeeper && cLookUpId[0] > cCurrentId[0]) {
						cChilds = cResult.getNodes();

						if(cChilds && cChilds.length > 0)
							cIterator = cIterator.concat(cChilds.slice());
					}

					if(cIterator.length === 0 && cLookUpId[0] > cCurrentId[0]) {
						cGoDeeper = true;
						if(cParent = cResult.getParent())
							do {
								cParent = cParent.getParent();
							} while(cParent && _has(cFalsey, cParent.getUID()))
					}

					if(cGoDeeper || cLookUpId[0] < cCurrentId[0]) {

						cParent = cResult;

						do {
							cParent = cParent.getParent();

							if(!cParent) break;

							cChilds = cParent.getNodes();

							cCurrentId = _getLevelAndNumber(cParent.getUID());

							if(cCurrentId[0] === cLookUpId[0] && cCurrentId[1] === cLookUpId[1] && cParent.getElement() === element)
								return cParent;

						} while((cChilds.length === 1) || _has(cFalsey, cParent.getUID()))

						if(!cParent) {

							if(cLookUpId[0] === TreeNode.prototype._lowerLevelID &&
											cChilds.length === 1 && cChilds[0].getElement() !== element)
								return null;

							cGoDeeper = false;
							continue;
						}

						cChilds = cParent.getNodes();
						if((cl = cChilds.length) > 1) {
							cIterator.push(cParent);
							ci = 0;
							for(;ci<cl;ci++) {
								if(!_has(cIterator, cChilds[ci]) && !_has(cFalsey, cChilds[ci].getUID()))
									cIterator.push(cChilds[ci]);
							}
						} else
							cFalsey.push(cParent.getUID());
					}
				} while(cIterator.length > 0)
			}
		}

		this.getElement = function () {
			return _element;
		};

		this.getUID = function () {
			return _nodeID;
		};

		this.addNode = function (element) {
			_nodes.push(new TreeNode(element, this));

			return _nodes[_nodes.length - 1];
		};

		this.remove = function () {
			_nodes = [];
			_parentNode = null;
			_element = null;
			return null;
		}
	};

	var nodePattern = /([^-]*)-([^.]*)/ig,
			_uniqueCounter = 0;

	/**
	 *
	 * @param baseUID
	 * @param baseLen
	 * @returns {string}
	 * @private
	 */
	function _assignUID(baseUID) {
		"use strict";

		if(!baseUID) {
			TreeNode.prototype._lowerLevelID = TreeNode.prototype._lowerLevelID -1 || 0;
			return TreeNode.prototype._lowerLevelID + "-" + (++_uniqueCounter);
		} else {
			return (_getLevelAndNumber(baseUID)[0]+1) + "-" + (++_uniqueCounter)
		}
	};

	function _has(array, element) {
		"use strict";

		var i = 0,
				l = array.length;
		for(;i<l;i++) {
			if(array[i] === element)
				return true;
		}
		return false;
	}

	function _getLevelAndNumber(id) {
		"use strict";
		var lvl, num;
		id.replace(nodePattern, function(match, g1, g2) {
			lvl = g1;
			num = g2;
		});
		return [Number(lvl), Number(num)]
	}

	return TreeNode;
});