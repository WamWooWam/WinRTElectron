

(function (Skype) {
    "use strict";

    var PAGEFULL_PEEK_HEIGHT = 100; 
    var SELECTABLE_ITEM_CLASS = "list-selectable";
    var COMPLEX_ITEM_CLASS = "complex";

    var listStyleNavigation = Skype.UI.Control.define(function (element) {
        this._init(element);
    }, {
        _element: null,
        _scroller: null,
        _container: null,

        focusedListElement: null,

        _init: function (element) {
            this._element = element;
            this._scroller = element;
            this._container = element;

            this.regEventListener(this._element, "keydown", this._keyPress.bind(this));
        },

        _isNavigatingList: function () {
            return this._getListItemParent(document.activeElement) === this.focusedListElement;
        },

        _keyPress: function (e) {

            if (!this._isNavigatingList()) {
                return; 
            }

            
            switch (e.keyCode) {
                case WinJS.Utilities.Key.upArrow:
                    this._upPressed(e);
                    break;
                case WinJS.Utilities.Key.downArrow:
                    this._downPressed(e);
                    break;
                case WinJS.Utilities.Key.home:
                    this._homePressed(e);
                    break;
                case WinJS.Utilities.Key.end:
                    this._endPressed(e);
                    break;
                case WinJS.Utilities.Key.pageUp:
                    this._pageUpPressed(e);
                    break;
                case WinJS.Utilities.Key.pageDown:
                    this._pageDownPressed(e);
                    break;
                case WinJS.Utilities.Key.tab:
                    this._tabPressed(e);
                    break;
                case WinJS.Utilities.Key.enter:
                    this._enterPressed(e);
                    break;
                case WinJS.Utilities.Key.space:
                    this._spacePressed(e);
                    break;
                default:
                    return;
            }
        },

        _focusElement: function (element) {
            if (!element) {
                return;
            }
            var listElement = this._getListItemParent(element);
            if (listElement) {
                this._setFocusedListItem(listElement);
            }
            element.focus();
        },

        _setFocusedListItem: function (focusedListItem) {
            if (document.activeElement === focusedListItem) {
                
                
                return;
            }

            this.focusedListElement = focusedListItem;
            if (focusedListItem) {
                assert(this._isListItem(focusedListItem), "Cannot play with anything else than list item !");
                
                Skype.UI.Util.addTemporaryTabIndex(this, focusedListItem);
                this.dispatchEvent(listStyleNavigation.Events.ListItemFocused, { item: focusedListItem });
            }
        },

        _enterPressed: function (e) {
            if (this.focusedListElement) {
                this.dispatchEvent(listStyleNavigation.Events.ListItemActivated, { item: this.focusedListElement });
            }
        },

        _spacePressed: function (e) {
            
            

            if (e.target != this._container) {
                
                e.preventDefault();
            }

            if (this.focusedListElement) {
                this.dispatchEvent(listStyleNavigation.Events.ListItemActivated, { item: this.focusedListElement });
            }
        },

        _upPressed: function (e) {
            
            
            e.preventDefault();

            
            this._focusElement(this._prevItem(e.target));
        },

        _downPressed: function (e) {
            
            
            e.preventDefault();

            this._focusElement(this._nextItem(e.target));
        },

        _homePressed: function (e) {
            var firstNode = this._firstItem();
            if (firstNode && e.target != firstNode && this._isListItem(e.target)) {
                this._focusElement(firstNode);
            } else {
                e.preventDefault();  
            }
        },

        _endPressed: function (e) {
            var lastNode = this._lastItem();
            if (lastNode && e.target != lastNode && this._isListItem(e.target)) {
                this._focusElement(lastNode);
            } else {
                e.preventDefault();  
            }
        },

        _pageUpPressed: function (e) {
            var toOffsetTop = this._scroller.scrollTop - this._scroller.clientHeight + PAGEFULL_PEEK_HEIGHT;
            for (var toNode = e.target; this._prevItem(toNode) ; toNode = this._prevItem(toNode)) {
                if (this._prevItem(toNode).offsetTop < toOffsetTop) {
                    break;
                }
            }

            if (e.target != toNode) {
                e.preventDefault();
                this._focusElement(toNode);
            }
        },
        _pageDownPressed: function (e) {
            var toOffsetTop = this._scroller.scrollTop + 2 * this._scroller.clientHeight - PAGEFULL_PEEK_HEIGHT;
            for (var toNode = e.target; this._nextItem(toNode) ; toNode = this._nextItem(toNode)) {
                if (this._nextItem(toNode).offsetTop > toOffsetTop) {
                    break;
                }
            }

            if (e.target != toNode) {
                e.preventDefault();
                this._focusElement(toNode);
            }
        },

        _getListItemParent: function (element) {
            while (element) {
                if (this._isListItem(element)) {
                    return element;
                }
                element = element.parentNode;
            }
            return element;
        },

        _handleLinksNavigation: function (links, event, nodeEl) {
            var linkPos = links.indexOf(event.target);

            
            if (linkPos === -1 && !event.shiftKey) {
                this._focusElement(links[0]);
                return true;
            }

            
            if (event.shiftKey && linkPos === 0) {
                this._focusElement(nodeEl);
                return true;
            }

            
            if (!event.shiftKey && linkPos === links.length - 1) {
                return false;
            }

            
            var nextElement = links[linkPos + (event.shiftKey ? -1 : 1)];
            if (nextElement) {
                this._focusElement(nextElement);
                return true;
            }
            return false;
        },

        _handleComplexControlsNavigation: function (event, nodeEl) {
            if (event.target === nodeEl && !event.shiftKey) {
                this._focusElement(nodeEl.querySelector("div.complexControl"));
                return true;
            } else if (event.shiftKey && event.target !== nodeEl) { 
                
                this._focusElement(nodeEl);
                return true;
            }
            return false;
        },

        _tabPressed: function (event) {
            var nodeEl = this._getListItemParent(event.target);
            if (!nodeEl) {
                return;
            }
            var stopPropagation = false;
            var isComplex = WinJS.Utilities.hasClass(nodeEl, COMPLEX_ITEM_CLASS);

            if (isComplex) {
                stopPropagation = this._handleComplexControlsNavigation(event, nodeEl);
            } else {
                var links = Array.prototype.slice.call(nodeEl.querySelectorAll(listStyleNavigation.NAVIGABLE_ELEMENTS), 0);
                if (links.length > 0) {
                    stopPropagation = this._handleLinksNavigation(links, event, nodeEl);
                }
            }

            if (stopPropagation) {
                event.preventDefault();
                event.stopPropagation();
            }
        },

        _isListItem: function (element) {
            return element && WinJS.Utilities.hasClass(element, SELECTABLE_ITEM_CLASS);
        },

        _getSiblingItem: function (element, siblingType) {
            if (!element || !element[siblingType]) {
                return null;
            }

            var toNode = element[siblingType];
            while (toNode && !this._isListItem(toNode)) {
                toNode = toNode[siblingType];
            }
            return toNode;
        },

        _nextItem: function (element) {
            return this._getSiblingItem(element, "nextSibling");
        },

        _prevItem: function (element) {
            return this._getSiblingItem(element, "previousSibling");
        },

        _firstItem: function () {
            var firstElement = this._container.firstElementChild;
            if (this._isListItem(firstElement)) {
                return firstElement;
            } else {
                return this._nextItem(firstElement);
            }
        },

        _lastItem: function () {
            var lastElement = this._container.lastElementChild;
            if (this._isListItem(lastElement)) {
                return lastElement;
            } else {
                return this._prevItem(lastElement);
            }
        },

        
        setFocus: function (suggestedListItem) {
            
            
            
            
            
            

            if (!this.focusedListElement) {
                this._focusElement(suggestedListItem);
            } else {
                
                this.focusedListElement.focus();
            }
        },

        onContainerChildReplaced: function (newNode, oldNode) {
            
            
            
            
            
            
            
            
            

            if (this.focusedListElement != oldNode) {
                
                return;
            }

            this._focusElement(newNode);
        },

        onContainerChildRemoved: function (deletedElement) {
            
            
            
            
            
            

            if (this.focusedListElement != deletedElement) {
                
                return;
            }

            if (!this._isListItem(deletedElement)) {
                return;
            }

            var prevItem = this._prevItem(deletedElement);
            var nextItem = this._nextItem(deletedElement);

            if (prevItem) {
                this._focusElement(prevItem);
            } else if (nextItem) {
                this._focusElement(nextItem);
            } else {
                
                this._setFocusedListItem(null);
            }
        },

    }, { 

        Events: {
            ListItemFocused: "ListItemFocused",
            ListItemActivated: "ListItemActivated"
        },
        
        NAVIGABLE_ELEMENTS: ["a[href]", ".navigable"],
    });


    WinJS.Namespace.define("Skype.UI", {
        ListStyleNavigation: WinJS.Class.mix(listStyleNavigation, WinJS.Utilities.eventMixin)
    });

})(Skype);