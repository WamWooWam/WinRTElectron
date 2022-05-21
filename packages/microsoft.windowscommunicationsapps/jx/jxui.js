
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Debug,Jx*/
Jx.delayDefine(Jx, "Clicker", function () {

    var Clicker = Jx.Clicker = /*@constructor*/function (element, callback, /*@optional*/context, /*@optional*/keys) {
        ///<summary>Creates a single event hook for handling default click behavior by turning
        ///keyboard events for Enter and Spacebar into clicks.</summary>
        ///<param name='element' type='HTMLElement'/>
        ///<param name='callback' type='Function'/>
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isFunction(callback));
        Debug.assert(Jx.isNullOrUndefined(keys) || Jx.isArray(keys));
        this._element = element;
        this._callback = callback;
        this._context = context;
        this._keys = keys || ["Spacebar", "Enter"];
        this._onEvent = this._onEvent.bind(this);
        element.addEventListener("keydown", this._onEvent, false);
        element.addEventListener("click", this._onEvent, false);
    };

    Clicker.prototype = {
        dispose: function () {
            var element = this._element;
            if (element) {
                element.removeEventListener("keydown", this._onEvent, false);
                element.removeEventListener("click", this._onEvent, false);
                this._element = null;
                this._callback = null;
                this._context = null;
            }
        },

        _onEvent: function (ev) {
            if (ev.type === "click" || this._keys.indexOf(ev.key) !== -1) {
                this._callback.call(this._context, ev);
                ev.preventDefault();
            }
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug,Jx*/
Jx.delayDefine(Jx, "KeyboardNavigation", function () {

    var keyMotionDefinitions = {
        horizontal: {
            Home:     { unit: "all",  direction: -1 },
            Left:     { unit: "item", get direction() { return Jx.isRtl() ? 1 : -1; } },
            Right:    { unit: "item", get direction() { return Jx.isRtl() ? -1 : 1; } },
            End:      { unit: "all",  direction: 1 }
        },
        vertical: {
            Home:     { unit: "all",  direction: -1 },
            PageUp:   { unit: "page", direction: -1 },
            Up:       { unit: "item", direction: -1 },
            Down:     { unit: "item", direction:  1 },
            PageDown: { unit: "page", direction:  1 },
            End:      { unit: "all",  direction:  1 }
        }
    };

    function getRelativeOffset(parent, element) {
        var offset = 0,
            top = parent.offsetParent;
        while (element && element !== top) {
            offset += element.offsetTop;
            element = element.offsetParent;
        }
        Debug.assert(element === top);
        return offset - parent.offsetTop;
    }

    function matches(element, selector) {
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isNullOrUndefined(selector) || Jx.isNonEmptyString(selector));
        return selector && element.msMatchesSelector(selector);
    }

    function indexOf(list, item) {
        ///<summary>Shorthand for Array.prototype.indexOf.call, for use on the array-like object returned by querySelector.</summary>
        Debug.assert(Jx.isObject(list));
        return Array.prototype.indexOf.call(list, item);
    }

    var pageBoundsDefinitions = {
        "-1": {
            getBoundary: function (container) { return container.scrollTop; },
            isInRange: function (container, element, boundary) { return element && getRelativeOffset(container, element) >= boundary; }
        },
        "1": {
            getBoundary: function (container) { return container.scrollTop + container.clientHeight; },
            isInRange: function (container, element, boundary) { return element && getRelativeOffset(container, element) + element.offsetHeight <= boundary; }
        }
    };

    var KeyboardNavigation = Jx.KeyboardNavigation = function (parentContainer, orientation, component, excluded, activeTabIndex) {
        /// <summary>Provides arrow-key and relate focus navigation for specified children elements in the given parentContainer.</summary>
        /// <param name="parentContainer" type="HTMLElement"/>
        /// <param name="orientation" type="String">Allowed keyboard navigation direction: "horizontal" for Left and Right arrows, "vertical" for Up and Down arrows.</param>
        /// <param name="component" type="Jx.Component" optional="true">A component that will fire (or whose children will bubble) a 'contentUpdated' event when navigable items are added or removed.</param>
        /// <param name="excluded" type="String" optional="true">Defines the set of elements excluded from this set (generally because they are disabled or hidden).  By default, any 
        /// node with display set to none will be skipped.</param>
        /// <param name="activeTabIndex" optional="true">tabIndex for the active element. default is 0.</param>
        Debug.assert(Jx.isHTMLElement(parentContainer));
        Debug.assert(orientation === "vertical" || orientation === "horizontal");
        Debug.assert(Jx.isNullOrUndefined(component) || Jx.isObject(component));
        Debug.assert(Jx.isNullOrUndefined(excluded) || Jx.isNonEmptyString(excluded));
        Debug.assert(Jx.isNullOrUndefined(activeTabIndex) || Jx.isValidNumber(activeTabIndex));

        this._parentContainer = parentContainer;
        this._keyMotion = keyMotionDefinitions[orientation];
        this._component = component;
        if (component) {
            component.on("contentUpdated", this._onContentUpdated, this);
        }
        this._excluded = excluded;
        this._activeTabIndex = activeTabIndex || 0;
        this._initialize();
    };

    KeyboardNavigation.prototype = {
        _initialize: function () {
            var elements = this._getElements();
            this._focusableElement = null;

            Debug.assert(Array.prototype.every.call(elements, function (item) {
                return !this._isFocusable(item) || item.tabIndex === -1;
            }.bind(this))); // Every item in the set is expected to have its tabIndex initialized.

            this._keydownListener = this._onKeydown.bind(this);
            this._focusListener = this._onFocus.bind(this);
            this._parentContainer.addEventListener("keydown", this._keydownListener, false);
            this._parentContainer.addEventListener("focus", this._focusListener, true);

            var index = this._getFocusableIndex(elements, 0, 1);
            if (index !== -1) {
                // set focus on the first element
                this._makeFocusable(elements[index]);
            }
        },

        _getElements: function () {
            return this._parentContainer.querySelectorAll("[tabIndex]");
        },

        _isFocusable: function (element) {
            ///<summary>Returns true if the element can participate in keyboard navigation</summary>
            Debug.assert(Jx.isHTMLElement(element));
            return !matches(element, this._excluded) && getComputedStyle(element).display !== "none";
        },

        _getFocusableIndex: function (elements, index, direction) {
            ///<summary>Gets the index to a focusable element in the provided array, at or beyond the specified index.
            ///Searches forward or backward depending on the value of direction.  Returns -1 if no focusable element is
            ///found.</summary>
            Debug.assert(Jx.isObject(elements));
            Debug.assert(Jx.isValidNumber(index));
            Debug.assert(direction === 1 || direction === -1);

            for (var len = elements.length; index >= 0 && index < len; index += direction) {
                if (this._isFocusable(elements[index])) {
                    return index;
                }
            }
            return -1;
        },

        _onContentUpdated: function (/*ev*/) {
            this.update();
        },

        update: function (reset) {
            /// <summary>Should be called when elements are added/removed/shown/hidden, to ensure a focusable element exist</summary>
            /// <param name="reset" type"Boolean" optional="true"/>
            Debug.assert(Jx.isNullOrUndefined(reset) || Jx.isBoolean(reset));

            var elements = this._getElements();
            if (reset || indexOf(elements, this._focusableElement) === -1 || !this._isFocusable(this._focusableElement)) {
                // If the current focusable element is no longer visible, reset focus to the first visible element
                var index = this._getFocusableIndex(elements, 0, 1);
                if (index !== -1) {
                    this._makeFocusable(elements[index]);
                } else {
                    this._makeFocusable(null);
                }
            }
        },

        _onKeydown: function (ev) {
            var motion = this._keyMotion[ev.key];
            if (motion) {
                ev.preventDefault();
                ev.stopPropagation();
                this._moveBy(motion.unit, motion.direction);
            }
        },

        _moveBy: function (unit, direction) {
            Debug.assert(["all", "page", "item"].indexOf(unit) !== -1);
            Debug.assert(direction === 1 || direction === -1);

            var elements = this._getElements(),
                numElements = elements.length;

            var newIndex = 0;

            switch (unit) {
            case "all":
                newIndex = this._getFocusableIndex(elements, direction > 0 ? numElements - 1 : 0, direction);
                break;

            case "item":
                newIndex = this._getFocusableIndex(elements, indexOf(elements, this._focusableElement) + direction, direction);
                break;

            case "page":
                var container = elements[0]; // Find the scrolling container so that we can compute a page size
                while (container && ["scroll", "auto"].indexOf(getComputedStyle(container).overflowY) === -1) {
                    container = container.parentElement;
                }
                container = container || this._parentContainer;

                var pageBounds = pageBoundsDefinitions[direction],
                    currentIndex = indexOf(elements, this._focusableElement),
                    boundary = pageBounds.getBoundary(container);

                newIndex = this._advanceToBoundary(container, elements, currentIndex, direction, pageBounds, boundary);
                if (newIndex === currentIndex) { // Nothing to move to within this page, move by a full page
                    boundary += container.clientHeight * direction;
                    newIndex = this._getFocusableIndex(elements, newIndex + direction, direction); // Always advance by at least one element
                    newIndex = this._advanceToBoundary(container, elements, newIndex, direction, pageBounds, boundary);
                }
                break;

            default:
                Debug.assert(false, "Unrecognized unit: " + unit);
                break;
            }

            var newElement = elements[newIndex];
            if (newElement) {
                this._makeFocusable(newElement);
                newElement.focus();
            }
        },

        _advanceToBoundary: function (container, elements, index, direction, pageBounds, boundary) {
            ///<summary>Returns the index of the last item before the specified boundary (the edge of a page)</summary>
            Debug.assert(Jx.isHTMLElement(container));
            Debug.assert(Jx.isObject(elements));
            Debug.assert(Jx.isValidNumber(index));
            Debug.assert(direction === 1 || direction === -1);
            Debug.assert(Jx.isObject(pageBounds));
            Debug.assert(Jx.isValidNumber(boundary));

            if (index !== -1) {
                var nextIndex = this._getFocusableIndex(elements, index + direction, direction);
                while (pageBounds.isInRange(container, elements[nextIndex], boundary)) {
                    index = nextIndex;
                    nextIndex = this._getFocusableIndex(elements, index + direction, direction);
                }
            }
            return index;
        },

        _onFocus: function (ev) {
            var element = ev.target;
            var parentContainer = this._parentContainer;
            var focusableElement = this._focusableElement;
            while (element !== null && element !== parentContainer && element !== focusableElement) {
                if (element.hasAttribute("tabIndex") && !matches(element, this._excluded)) {
                    this._makeFocusable(element);
                    break;
                }
                element = element.parentNode;
            }
        },

        _makeFocusable: function (element) {
            if (this._focusableElement) {
                this._focusableElement.tabIndex = -1;
            }
            if (element) {
                element.tabIndex = this._activeTabIndex;
            }
            this._focusableElement = element;
        },

        dispose: function () {
            var parentContainer = this._parentContainer;
            if (parentContainer) {
                this._parentContainer = null;
                parentContainer.removeEventListener("keydown", this._keydownListener, false);
                parentContainer.removeEventListener("focus", this._focusListener, true);
            }

            var component = this._component;
            if (component) {
                this._component = null;
                component.detach("contentUpdated", this._onContentUpdated, this);
            }
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug,Jx,Microsoft,WinJS*/
Jx.delayDefine(Jx, "List", function() {

    var Priority = Jx.scheduler.definePriorities({
        listUpdate: { base: Jx.Scheduler.BasePriority.normal, description: "Jx.List update" }
    });

    var itemAdded = 0,
        itemChanged = 1,
        itemRemoved = 2,
        reset = 5;
    Debug.assert(Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded === itemAdded);
    Debug.assert(Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved === itemRemoved);
    Debug.assert(Microsoft.WindowsLive.Platform.CollectionChangeType.itemChanged === itemChanged);
    Debug.assert(Microsoft.WindowsLive.Platform.CollectionChangeType.reset === reset);

    // Functional (map/filter/etc) helpers for animations
    function snapshotPosition(element) {
        return {
            element: element,
            originalTop: element.getBoundingClientRect().top,
            adjustment: 0
        };
    }
    function computeAdjustment(item) {
        item.adjustment = item.originalTop - item.element.getBoundingClientRect().top;
    }
    function hasAdjustment(item) {
        return item.adjustment !== 0;
    }
    function getElement(item) {
        return item.element;
    }
    function makeTransform(arr, baseTransform) {
        return function (index) {
            return "translate(0px, " + arr[index].adjustment + "px) " + (baseTransform || "");
        };
    }
    function contains(arr, element) {
        return Array.prototype.indexOf.call(arr, element) !== -1;
    }

    // Animations
    function makeRemoveAnimation(elements, positions) {
        return WinJS.UI.executeTransition(elements, [{
            property: "transform",
            delay: 0,
            duration: 120,
            timing: "cubic-bezier(0.11, 0.5, 0.24, .96)",
            from: makeTransform(positions),
            to: makeTransform(positions, "scale(0.85)"),
            skipStylesReset: true
        }, {
            property: "opacity",
            delay: 0,
            duration: 120,
            timing: "linear",
            from: 1,
            to: 0,
            skipStylesReset: true
        }]);
    }

    function makeMoveAnimation(positions, hasRemoves) {
        var delay = hasRemoves ? 60 : 0;
        return WinJS.UI.executeTransition(positions.map(getElement), {
            property: "transform",
            delay: delay,
            duration: 400,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            from: makeTransform(positions),
            to: ""
        });
    }

    function makeAddAnimation(elements, hasRemoves, hasMoves) {
        var delay = hasMoves ?
            (hasRemoves ? 300 : 240) :
            (hasRemoves ? 120 : 0);
        return WinJS.UI.executeAnimation(elements, [{
            keyframe: "WinJS-scale-up",
            delay: delay,
            duration: 120,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)"
        }, {
            keyframe: "WinJS-opacity-in",
            delay: delay,
            duration: 120,
            timing: "linear"
        }]);
    }

    //
    // List
    //

    var List = Jx.List = function(options) {
        this.initComponent();

        // save our params
        options = options || {};
        this._role = Jx.isUndefined(options.role) ? "list" : options.role;
        this._factory = options.factory || function (item) { return item; };
        this._requestAnimation = options.requestAnimation || Jx.fnEmpty;
        this._jobSet = Jx.scheduler.createJobSet(options.jobSet);
        this._priority = options.priority || Priority.listUpdate;

        // bind callbacks
        this._onCollectionChanged = this._onCollectionChanged.bind(this);

        this._host   = null;
        this._source = null;
        this._populated = false;
        this._childElements = null;
        this._pendingAdditions = [];
        this._pendingRemovals = [];

        this._updateJob = null;
        this._animationPromise  = null;
        this._animationDisabled = false;
    };

    Jx.augment(List, Jx.Component);

    //
    // Public
    //

    List.prototype.setSource = function(source) {
        this.releaseSource();
        this._source = source;

        if (this._host) {
            // update our listeners
            source.addEventListener("collectionchanged", this._onCollectionChanged);

            // build our new ui
            this._populateChildren();

            this._host.scrollTop = 0;
            this.fire("contentUpdated");
        }
    };

    List.prototype.releaseSource = function() {
        if (this._source) {
            this._source.removeEventListener("collectionchanged", this._onCollectionChanged);
            this._source = null;
            this._destroyChildren();
        }

        this._cancelAnimations();
    };

    // Jx.Component

    List.prototype.getUI = function(ui) {
        var role = this._role;
        ui.html = "<div " +
                      " id='" + this._id + "'" +
                      " class='list'" +
                      (role ? (" role='" + role + "'") : "") +
                  ">";
        if (this._source) {
            this._populateChildren();
            ui.html += this._getChildrenHtml();
        }
        ui.html += "</div>";
    };

    List.prototype.activateUI = function() {
        Jx.Component.prototype.activateUI.call(this);

        var host = this._host = document.getElementById(this._id);

        if (this._source) {
            this._source.addEventListener("collectionchanged", this._onCollectionChanged);

            if (!this._populated) {
                this._populateChildren();
            } else {
                this._childElements = Array.prototype.slice.call(host.children);
            }
        }
    };

    List.prototype.deactivateUI = function() {
        this._destroyChildren();

        var host = this._host;
        if (host) {
            this.releaseSource();
            this._host = null;
        }
    };

    List.prototype.shutdownComponent = function () {
        Jx.dispose(this._jobSet);
        Jx.Component.prototype.shutdownComponent.call(this);
    };

    //
    // Private
    //

    // Helpers
    function EmptyComponent() { this.initComponent(); }
    Jx.augment(EmptyComponent, Jx.Component);
    EmptyComponent.prototype.getUI = function (ui) { ui.html = "<div style='display:none'></div>"; };

    List.prototype._addChild = function (item, index) {
        var child;
        if (item) {
            child = this._factory(item);
        } else {
            child = new EmptyComponent();
        }

        this.insertChild(child, index);
        return child;
    };

    List.prototype._populateChildren = function () {
        Debug.assert(!this._populated);
        this._populated = true;

        var source = this._source;
        for (var i = 0, len = source.count; i < len; i++) {
            var item = source.item(i);
            this._addChild(item, i);
        }

        var host = this._host;
        if (host) {
            host.innerHTML = this._getChildrenHtml();
            this._childElements = Array.prototype.slice.call(host.children);
            this.forEachChild(function (child) { child.activateUI(); });
        }
    };

    List.prototype._getChildrenHtml = function() {
        var html = "";

        for (var i = 0, len = this.getChildrenCount(); i < len; i++) {
            var child = this.getChild(i);
            html += Jx.getUI(child).html;
        }

        return html;
    };

    List.prototype._destroyChildren = function () {
        this._populated = false;
        this._childElements = null;
        this.forEachChild(function (child) {
            child.deactivateUI();
            child.shutdownComponent();
        });
        this.removeChildren();
    };

    List.prototype.getElement = function (index) {
        ///<returns type="HTMLElement">The HTML element corresponding to the component at the specified index in the list</returns>
        return this._childElements[index];
    };

    List.prototype.getTarget = function (ev) {
        ///<returns type="Jx.Component">The child component targeted by this event.</returns>
        var childElements = this._childElements;
        if (!childElements) {
            Debug.assert(false, "Working around BLUE 461730, please hold the machine for analysis");
            return null;
        }

        var element = this._getImmediateChildElement(ev.target),
            componentIndex = childElements.indexOf(element);
        return (componentIndex !== -1) ? this.getChild(componentIndex) : null;
    };

    List.prototype._getImmediateChildElement = function (el) {
        // Finds the immediate child element of the list from a descendant element
        var host = this._host,
            child = null;

        while (el && el !== host) {
            child = el;
            el = el.parentNode;
        }

        return (el === host) ? child : null;
    };

    // Events
    List.prototype._queueChange = function(ev) {
        var info = {},
            child,
            element,
            childElements = this._childElements;

        switch (ev.eType) {
        case itemAdded:
            // get the new item and its html
            var index = ev.index,
                item = this._source.item(index);
            child = this._addChild(item, index);

            // we'll put it in the tree immediately and hide it,
            // so that it may be updated if changes come in.
            var host = this._host;
            host.insertAdjacentHTML("beforeend", Jx.getUI(child).html);
            child.activateUI();

            info.newIndex = index;
            element = info.newChild = host.lastElementChild;
            info.newChild.style.display = "none";

            childElements.splice(index, 0, element);
            this._pendingAdditions.push(element);
            break;

        case itemChanged:
            // get the old and new indices
            info.oldIndex = ev.previousIndex;
            info.newIndex = ev.index;

            child = this.removeChildAt(info.oldIndex);
            this.insertChild(child, info.newIndex);

            childElements.splice(info.newIndex, 0, childElements.splice(info.oldIndex, 1)[0]);
            break;

        case itemRemoved:
            // get the old index
            info.oldIndex = ev.index;
            child = this.removeChildAt(info.oldIndex);
            child.deactivateUI();
            child.shutdownComponent();

            element = childElements.splice(info.oldIndex, 1)[0];

            var pendingIndex = this._pendingAdditions.indexOf(element);
            if (pendingIndex !== -1) {
                // If the element hasn't begun animating in yet (still a pendingAddition), we can just remove it
                // directly.
                this._pendingAdditions.splice(pendingIndex, 1);
                this._host.removeChild(element);
            } else {
                // Otherwise we'll put it in pendingRemovals and remove it after we animate it out of view
                this._pendingRemovals.push(element);
            }
            break;

        default:
            // ignore batch begin/end, etc.
            info = null;
            break;
        }
    };

    List.prototype._applyQueuedChanges = function(externalAffected) {
        externalAffected = externalAffected || [];

        // Grab two element lists:  current and desired.  These will help us reorder nodes.
        var host = this._host,
            currentChildren = host.children,
            desiredChildren = this._childElements.slice();

        // Get the list of nodes to be added and removed.
        var added = this._pendingAdditions,
            numAdded = added.length,
            removed = this._pendingRemovals,
            numRemoved = removed.length;
        this._pendingAdditions = [];
        this._pendingRemovals = [];

        // Added elements should already be part of both desiredChildren and currentChildren.
        // Removed elements should only be part of currentChildren.
        Debug.assert(added.every(function (el) { return contains(desiredChildren, el) && contains(currentChildren, el); }));
        Debug.assert(removed.every(function (el) { return !contains(desiredChildren, el) && contains(currentChildren, el); }));
        Debug.assert(currentChildren.length - numRemoved === desiredChildren.length);

        // Verify that we actually have something to do
        if (numAdded === 0 && numRemoved === 0 &&
            desiredChildren.every(function (el, index) { return el === currentChildren[index]; })) {
            return null;
        }

        // Snapshot affected nodes: these elements are moved either intentionally, or as a result of 
        // items being added and removed.  They may be above or below the items that are changing, because the updates
        // may shift scroll positions or reposition container boxes.
        var affectedPositions, removedPositions;
        if (!this._animationDisabled) {
            affectedPositions = Array.prototype.filter.call(currentChildren, function (el) {
                return !contains(removed, el) && !contains(added, el);
            }).concat(externalAffected).map(snapshotPosition);
            removedPositions = removed.map(snapshotPosition);

            // Now drop any nodes being deleted from the layout.  They will stay in the UI to animate, and be removed when the animation completes.
            removed.forEach(function (el) {
                var style = el.style;
                style.position = "absolute";
                style.top = "0px";
            });
        }

        // Introduce pending additions into the layout.
        added.forEach(function (el) { el.style.display = ""; });

        // Rearrange child order to be correct.  Avoid moving the active element, so that we don't disrupt focus/hover.
        var pivot = this._getImmediateChildElement(document.activeElement),
            expectedNext = null;
        for (var i = desiredChildren.length; i--; ) {
            var current = desiredChildren[i];
            if (current !== pivot) { // Don't move the pivot.  Moving everything else is sufficient to ensure correctness.
                var actualNext = current.nextSibling;
                while (actualNext && contains(removed, actualNext)) {
                    actualNext = actualNext.nextSibling;
                }
                if (actualNext !== expectedNext) {
                    host.insertBefore(current, expectedNext);
                }
            }
            expectedNext = current;
        }

        this.fire("contentUpdated");

        var promises = [];
        if (!this._animationDisabled) {
            // Compute any offsets that were adjusted by the add/remove action above
            affectedPositions.forEach(computeAdjustment);
            removedPositions.forEach(computeAdjustment);

            affectedPositions = affectedPositions.filter(hasAdjustment); // Drop unaffected nodes
            var numMoved = affectedPositions.length;

            // Play animations
            if (numRemoved) {
                promises.push(makeRemoveAnimation(removed, removedPositions));
            }

            if (numMoved) {
                promises.push(makeMoveAnimation(affectedPositions, numRemoved));
            }

            if (added.length > 0) {
                promises.push(makeAddAnimation(added, numRemoved, numMoved));
            }
        }

        return Jx.Promise.cancelable(WinJS.Promise.join(promises)).then(function () {
            // Clean up after any removes
            if (numRemoved !== 0) {
                removed.forEach(function (el) {
                    var parentNode = el.parentNode;
                    if (parentNode) {
                        parentNode.removeChild(el);
                    }
                });
                this.fire("contentUpdated");
            }
        }.bind(this)).then(
            // And repeat in case changes are queued while animating.
            this._applyQueuedChanges.bind(this, externalAffected)
        );
    };

    List.prototype._cancelAnimations = function() {
        var promise = this._animationPromise;
        if (promise) {
            promise.cancel();
        }
        this._jobSet.cancelJobs();
    };

    List.prototype._onCollectionChanged = function(ev) {
        // we can actually get events for an old event source.
        // this happens when we stop listening after the event has started firing.
        if (ev.target === this._source) {
            if (ev.eType === reset) {
                this._cancelAnimations();
                this._destroyChildren();
                this._populateChildren();
                this.fire("contentUpdated");
            } else {
                this._queueChange(ev);

                if (!this._animationPromise) {
                    var waitPromise;
                    if (!this._animationDisabled) {
                        // Make a request to our host to perform an animation.  The host can use this call to avoid concurrent animations affecting the same elements.
                        // That request will return a set of elements affected by any size changes to this list, these elements will be passed to the WinJS animations.
                        waitPromise = this._requestAnimation();
                    }

                    // Defer the update to the scheduler, to properly prioritize this activity and allow batch changes to
                    // coallesce into a single animation
                    waitPromise = WinJS.Promise.then(waitPromise, function (affectedElements) {
                        return Jx.Promise.schedule(this._jobSet, this._priority).then(function () {
                            return affectedElements;
                        });
                    }.bind(this));

                    var animationPromise = this._animationPromise = waitPromise.then(this._applyQueuedChanges.bind(this));
                    var cleanup = (function () { this._animationPromise = null; }).bind(this);
                    animationPromise.done(cleanup, cleanup);
                }
            }
        }
    };

    List.prototype.getAffectedElements = function (component) {
        ///<summary>Returns the set of elements affected by size changes to the specified child component</summary>
        ///<param name="component" type="Jx.Component" optional="true"/>
        Debug.assert(Jx.isNullOrUndefined(component) || Jx.isObject(component));

        var childElements = this._childElements;
        if (childElements) {
            var componentIndex = this._children.indexOf(component);
            if (componentIndex !== -1) {
                var element = childElements[componentIndex];
                return Array.prototype.filter.call(this._host.children, function (other) { return other !== element; });
            }
        }
        return [];
    };

    List.prototype.waitForAnimation = function () {
        ///<summary>Returns a promise that completes when any in-progress animation in this list is completed or cancelled</summary>
        var promises = [ this._animationPromise ];
        for (var i = 0, len = this.getChildrenCount(); i < len; ++i) {
            var child = this.getChild(i);
            if (child.waitForAnimation) {
                promises.push(child.waitForAnimation());
            }
        }
        return Jx.Promise.fork(WinJS.Promise.join(promises));
    };

    List.prototype.disableAnimations = function () {
        ///<summary>With animations disabled, the list will update synchronously. If an animation is already in progress, it will complete. 
        /// The list will update in as similar a method as possible to the animating case, but the transitions will be instant.</summary>
        Debug.assert(!this._animationDisabled);
        this._animationDisabled = true;
    };

    List.prototype.enableAnimations = function () {
        ///<summary>Re-enable animations after a call to disableAnimations</summary>
        Debug.assert(this._animationDisabled);
        this._jobSet.runSynchronous(); // If we were deferring any updates, force them now
        this._animationDisabled = false;
    };

});


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Debug,WinJS*/
/*jshint browser:true*/
Jx.delayDefine(Jx, "PeekBar", function () {
    var PeekBar = Jx.PeekBar = /*@constructor*/function (placement) {
        // Make sure we have default placement
        this._placement = (placement ? placement : "bottom");

        Debug.assert(this._placement === "bottom" || this._placement === "top");

        this._element = null;
        this._elementLong = null;
        this._elementTab = null;
        this._showAsTab = false;
        this._allowTabVersion = false;
        this._showAppBar = this._showAppBar.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);

        this.initComponent();
    };

    Jx.augment(PeekBar, Jx.Component);
    var proto = PeekBar.prototype;

    PeekBar.height = 15;

    proto.getUI = function (ui) {
        var title = Jx.escapeHtml(Jx.res.getString("peekBarTitle"));
        ui.html = 
            "<div id='" + this._id + "' class='peekbar-" + this._placement + "'>" + 
                "<div id='" + this._id + "long' role='button' title='" + title + "' class='peekbar peekbar-long'>" + 
                    "<div aria-hidden='true' class='peekbar-cuelayout'>&#57612;</div>" + 
                "</div>" +
                "<div id='" + this._id + "tab' role='button' title='" + title + "' class='peekbar peekbar-tab'>" + 
                    "<div aria-hidden='true' class='peekbar-cuelayout'>&#57612;</div>" + 
                "</div>" +
            "</div>";
    };

    proto._showAppBar = function (ev) {
        this.fire("peekBarShow", ev);
    };

    proto.onActivateUI = function () {
        Jx.Dep.load("/Jx/PeekBar.css", Jx.fnEmpty);

        if (!this._element) {
            this._element = document.getElementById(this._id);
            Debug.assert(Jx.isHTMLElement(this._element));
        }

        this._elementLong = document.getElementById(this._id + "long");
        this._elementTab = document.getElementById(this._id + "tab");
        this._elementTab.style.display = "none";

        this._element.addEventListener("click", this._showAppBar, false);

        PeekBar.height = this._elementLong.offsetHeight;
        Debug.assert(PeekBar.height === 15 || PeekBar.height === 17, "PeekBar Height constant not correct.");
    };

    proto.onDeactivateUI = function () {
        if (this._element) {
            this._element.removeEventListener("click", this._showAppBar, false);
        }

        // Removes event listeners if tab view is enabled.
        this.allowTabVersion(false);
    };

    proto.dispose = function () {
        this.deactivateUI();
        this._element = null;
    },

    proto.show = function () {
        if (this._element) {
            this._element.style.display = "";
        }
    },

    proto.hide = function () {
        if (this._element) {
            this._element.style.display = "none";
        }
    };

    proto.isTabMode = function () {
        /// <summary>Returns whether the peek bar is in tab mode currently</summary>
        /// <returns>True if the bar is in tab mode, false otherwise.</returns>
        return this._showAsTab;
    };

    proto.allowTabVersion = function (allowTabVersion) {
        /// <summary>Allows the peekbar to be shown as a small tab when the user is using a mouse.</summary>
        /// <param name="allowTabVersion">If true and mouse movement then show small tab instead of peekbar.</param>
        if (this._allowTabVersion !== allowTabVersion) {
            if (allowTabVersion) {
                // Add listeners for showing/hiding peekbar tab
                window.addEventListener("MSPointerDown", this._onPointerDown, true); 
                window.addEventListener("mousemove", this._onMouseMove, true); 
            } else {
                // Reset to initial state if we are disabling tab view.
                this._showFullView();

                window.removeEventListener("MSPointerDown", this._onPointerDown, true); 
                window.removeEventListener("mousemove", this._onMouseMove, true);                 
            }
        }

        this._allowTabVersion = allowTabVersion;
    };

    proto._onPointerDown = function (ev) {
        // A mouse click can send a pointer down event so make sure the pointer type is touch.
        if (ev.pointerType !== "mouse") {
            this._showFullView(ev);
        }
    };

    proto._onMouseMove = function (ev) {
        // Touch can send a mouse move event so make sure there are no buttons present.
        if (ev.buttons === 0) {
            this._showTabView(ev);
        }
    };

    function _crossFade(elemIn, elemOut) {
        Debug.assert(Jx.isHTMLElement(elemIn));
        Debug.assert(Jx.isHTMLElement(elemOut));

        var styleIn = elemIn.style;
        var styleOut = elemOut.style;

        // Reset both visibilities in case other animation hasn't finished
        styleIn.display = "";
        styleOut.display = "";

        WinJS.UI.Animation.crossFade(elemIn, elemOut).done(function () {
            styleIn.display = "";
            styleIn.opacity = "";
            styleOut.display = "none";
            styleOut.opacity = "";
        });
    }

    proto._showFullView = function (ev) {
        if (this._showAsTab) {
            this._showAsTab = false;

            _crossFade(this._elementLong, this._elementTab);

            Jx.EventManager.broadcast("peekBarFull", ev);
        }
    };

    proto._showTabView = function (ev) {
        if (!this._showAsTab) {
            this._showAsTab = true;

            _crossFade(this._elementTab, this._elementLong);

            Jx.EventManager.broadcast("peekBarTab", ev);
        }
    };
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug,Jx,WinJS*/
Jx.delayDefine(Jx, "PressEffect", function () {
    "use strict";

    var pressEffects = {
        "className": function (elem, set) {
            Jx.setClass(elem, "pressed", set);
        },
        "attribute": function (elem, set) {
            if (set) {
                elem.setAttribute("data-state", "pressed");
            } else {
                elem.removeAttribute("data-state");
            }
        },
        "animation": function (elem, set, innerMost) {
            if (innerMost) {
                if (set) {
                    WinJS.UI.Animation.pointerDown(elem);
                } else {
                    WinJS.UI.Animation.pointerUp(elem);
                }
            }
        }
    };

    var PressEffect = Jx.PressEffect = function (element, selector, effects, /*@optional*/captureSelector) {
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isNonEmptyString(selector));
        Debug.assert(Jx.isArray(effects) && effects.every(function (effect) { return effect in pressEffects; }));
        Debug.assert(Jx.isNullOrUndefined(captureSelector) || Jx.isNonEmptyString(captureSelector));

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerUp   = this._onPointerUp.bind(this);

        this._element = element;
        this._selector = selector;
        this._effects = effects;
        this._captureSelector = captureSelector;

        this._pressed = null;
        this._pointerId = null;
        this._captureElement = null;

        element.addEventListener("MSPointerDown", this._onPointerDown, false);
        Debug.only(Object.seal(this));
    };

    PressEffect.prototype = {
        dispose: function () {
            var element = this._element;
            if (element) {
                element.removeEventListener("MSPointerDown", this._onPointerDown, false);
                this._element = null;

                this._unhook();
            }
        },

        _onPointerDown: function(ev) {
            // ignore multi-touch
            if (!this._pressed) {
                // left-click, touch, or pen
                if (ev.button === 0) {
                    // find the immediate child of the list
                    var pressed  = this._getPressedElement(ev),
                        pointerId = ev.pointerId;

                    if (pressed !== null) {
                        // animate the press
                        this._applyEffects(pressed, true /*set*/);

                        // listen for a lift
                        var captureElement;
                        if (ev.pointerType === "touch") {
                            var captureSelector = this._captureSelector;
                            if (captureSelector) {
                                captureElement = this._element.querySelector(captureSelector);
                                Debug.assert(Jx.isHTMLElement(captureElement));
                            }
                        }

                        var listenElement = captureElement || window;
                        listenElement.addEventListener("MSPointerUp", this._onPointerUp, false);
                        listenElement.addEventListener("MSPointerCancel", this._onPointerUp, false);
                        if (captureElement) {
                            captureElement.addEventListener("MSLostPointerCapture", this._onPointerUp, false);
                            captureElement.msSetPointerCapture(pointerId);
                        }

                        // save info about this
                        this._pressed   = pressed;
                        this._pointerId = pointerId;
                        this._captureElement = captureElement;
                    }
                }
            }
        },

        _onPointerUp: function(ev) {
            if (ev.pointerId === this._pointerId) {
                // animate the lift
                this._applyEffects(this._pressed, false /*unset*/);
                this._unhook();
            }
        },

        _unhook: function () {
            var pressed = this._pressed;
            if (pressed) {

                var captureElement = this._captureElement;
                var listenElement = captureElement || window;

                if (captureElement) {
                    captureElement.removeEventListener("MSLostPointerCapture", this._onPointerUp, false);
                    captureElement.msReleasePointerCapture(this._pointerId);
                }
                listenElement.removeEventListener("MSPointerCancel", this._onPointerUp, false);
                listenElement.removeEventListener("MSPointerUp", this._onPointerUp, false);

                this._pressed   = null;
                this._pointerId = null;
                this._captureElement = null;
            }
        },

        _getPressedElement: function (ev) {
            var target = ev.target,
                root = this._element,
                selector = this._selector;

            while (target && target !== root) {
                if (target.msMatchesSelector(selector)) {
                    return target;
                }
                target = target.parentNode;
            }

            return null;
        },

        _applyEffects: function (element, set) {
            this._effects.forEach(function (effect) {
                pressEffects[effect](element, set, true /* innerMost */);
            });

            element = element.parentNode;
            while (element && element !== this._element) {
                if (element.msMatchesSelector(this._selector)) {
                    /*jshint loopfunc:true*/
                    this._effects.forEach(function (effect) {
                        pressEffects[effect](element, set, false /* not innerMost */);
                    });
                }
                element = element.parentNode;
            }
        }
    };
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Debug,Jx,WinJS*/
Jx.delayDefine(Jx, "Promise", function () {

    Jx.Promise = {

        fork: function (promise) {
            ///<summary>Occasionally, it is desirable to wait on someone else.  For example, one component may want to wait for
            ///another component's animation before running its own.  But just waiting on someone else's promise, incorporating
            ///it into your own promise chain, has some negative effects.  The most predominant is that canceling your promise
            ///will cancel theirs.  
            ///Fork provides a measure of insulation, and ensures a component can safely hand out its promise without exposing
            ///itself to cancellation, and without propagating its own cancellation or error states.</summary>
            return new WinJS.Promise(function (c) {
                WinJS.Promise.then(promise, c, c);
            });
        },

        cancelable: function (promise) {
            ///<summary>WinJS animations, when they are canceled, report completion.  The expectation is that animations are
            /// fire and forget. This behavior is frustrating for multi-stage animation promise chains like:
            ///      removeItems.then(addItems)
            /// Canceling the promise during the removeItems stage does not prevent the addItems stage from running.  This
            /// can lead to crashes on control shutdown.
            ///
            /// This function wraps such promises with ones that support cancellation as expected.  This is accomplished by
            /// creating a new promise to wrap the animation promise, which prevents the inner promise from reporting completion
            /// during a cancel.</summary>
            var complete;
            return new WinJS.Promise(
                function (c, e) {
                    complete = c;
                    WinJS.Promise.then(promise, function (result) {
                        if (complete) {
                            return complete(result);
                        }
                    }, e);
                },
                function () {
                    complete = null; // Ignore the inner promise's attempt to report completion while being canceled
                    promise.cancel();
                }
            );
        },

        schedule: function (jobSet, priority, description) {
            Debug.assert(Jx.isNullOrUndefined(jobSet) || Jx.scheduler.isValidJobSet(jobSet));
            Debug.assert(Jx.scheduler.isValidPriority(priority));
            Debug.assert(Jx.isNullOrUndefined(description) || Jx.isNonEmptyString(description));

            var job;
            return new WinJS.Promise(
                function (c) {
                    job = Jx.scheduler.addJob(jobSet, priority, description, c);
                },
                function () {
                    Jx.dispose(job);
                }
            );
        }
    };

});
