
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "ObjectListControl", function () {

    var A = window.People.Accounts;
    var Plat = Microsoft.WindowsLive.Platform;

    var ObjectListControl = A.ObjectListControl = function (name, options) {
        // <summary>Constructor</summary>
        // <param name="name" type="String">The name of the list (e.g. AccountList)</param>
        //  represents. E.g. account, device, etc. </param>
        // <param name="options" type="Object" optional="true">
        // options: { //configuration options, defaults are as shown and can be omitted.
        //     selectionEnabled: false,
        //     delayRender: false
        // } </param>
        this._elContainer = /*@static_cast(HTMLElement)*/null;
        this._elItemTemplate = /*@static_cast(HTMLElement)*/null;
        this._selection = /*@static_cast(Object)*/{object: null, item: null };
        this._collection = /*@static_cast(Microsoft.WindowsLive.Platform.Collection)*/null;
        this._focusListener = this._onLoseFocus.bind(this);
        this._objectChangeListener = this._onObjectChanged.bind(this);
        this._childObjectChangeListener = this._onChildObjectChanged.bind(this);
        this._name = name;
        this._childIdToParent = {};
        options = options || {};

        // Handle options
        this._selectionEnabled = !!options.selectionEnabled;
        this._delayRender = !!options.delayRender;

        this.initComponent();
    };
    Jx.augment(ObjectListControl, Jx.Component);

    // Jx.Component
    ObjectListControl.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        this._id = "id" + this._name + "_" + Jx.uid();
        ui.html = "<div id='" + this._id + "' role='list'></div>";
    };

    ObjectListControl.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        this._elContainer = document.getElementById(this._id);

        // Add DOM event handlers
        if (this._selectionEnabled) {
            this._elContainer.addEventListener("MSPointerDown", this._onPointerDown.bind(this), false);
        }
        this._elContainer.addEventListener("click", this._onClick.bind(this), false);
        this._elContainer.addEventListener("keydown", this._onKeyDown.bind(this), false);
        this._elContainer.addEventListener("keyup", this._onKeyUp.bind(this), false);

        this._collection = this._collection || this._getCollection();

        if (!this._delayRender) {
            this._populateList();
        }

        Jx.Component.prototype.activateUI.call(this);
    };

    ObjectListControl.prototype.render = function () {
        /// <summary>If the delayRender option was set, and the control has been added to the DOM,
        /// this will populate our list of object item into the UI.</summary>
        Debug.assert(this._delayRender, "Render should not be called unless the delayRender options is set. And it should only be called once.");
        if (this._delayRender) {
            this._populateList();
        }
        // Reset this value, so that render cannot be called multiple times and for the cases where render is
        // called too early.
        this._delayRender = false;
    };

    ObjectListControl.prototype.getCount = function () {
        /// <summary>Returns the number of object objects in our list</summary>
        var count = 0;
        var collection = this._collection = this._collection || this._getCollection();
        if (collection !== null) {
            count = this._collection.count;
        }
        return count;
    };

    ObjectListControl.prototype._updateObjectData = function (object) {
        /// <summary>Forces UI for the given Object to update</summary>
        /// <param name="object" type="Plat.Object"/>
        var index = this._findObjectIndex(object);
        if (index !== -1) {
            var element = /*@static_cast(HTMLElement)*/this._findElementByObjectIndex(index);

            this._applyObject(element, object);
        }
    };

    ObjectListControl.prototype.setInitialSelection = function (object) {
        /// <summary>Sets the initially selection object object. Must be called prior to adding to the DOM.</summary>
        /// <param name="object" type="Plat.Object"/>
        Debug.assert(this._elContainer === null, "setInitialSelection() must not be called after control is added to DOM.");
        Debug.assert(this._selectionEnabled, "selection should be enabled");

        this._selection = { object: object, item: null /* we don't know the item yet.*/ };
    };

    ObjectListControl.prototype._verticalNavigate = function (dy) {
        // Find our current focus item
        var focused = this._elContainer.querySelector("div :focus");

        // Walk up until we find the child of our container.
        while (focused !== null && focused.parentElement !== this._elContainer) {
            focused = focused.parentElement;
        }

        if (focused) {
            if (dy > 0) {
                // Move focus down, if possible.
                if (focused.nextSibling) {
                    this._switchFocus(focused, focused.nextSibling);
                }
            } else {
                // Move focus up, if possible.
                if (focused.previousSibling) {
                    this._switchFocus(focused, focused.previousSibling);
                }
            }
        }
    };

    ObjectListControl.prototype._switchFocus = function (curFocus, newFocus) {
        /// <summary>Swaps the focus between to items</summary>
        curFocus.tabIndex = -1;
        curFocus.removeEventListener("blur", this._focusListener);

        newFocus.tabIndex = 0;
        newFocus.addEventListener("blur", this._focusListener);

        newFocus.focus();
    };

    ObjectListControl.prototype._getCollection = function () {
        ///<summary>Returns the collection of objects to render in the list. Not ObjectListControl assumes ownership of the list.</summary>
        ///<returns type="Plat.Collection"/>
        Debug.assert(false, "ObjectListControl._getCollection should be overridden by derived types");
    };

    ObjectListControl.prototype._getChildObject = function (object) {
        ///<summary>The list may support listening to changes of child objects, this is the accessor function</summary>
        ///<param name="object" type="Plat.Object"/>
        ///<return type="Plat.Object"/>
        return null;
    };

    ObjectListControl.prototype._populateList = function () {
        /// <summary>Builds the UI for queried objects, and adds them to the DOM.</summary>
        if (this._collection !== null) {
            this._collectionChangeListener = this._onCollectionChanged.bind(this);
            this._collection.addEventListener("collectionchanged", this._collectionChangeListener);

            // Add all of the elements to the tree
            this._createAllElements();

            // Signal to any listeners that the control is ready for interaction
            Jx.EventManager.fire(/*@static_cast(Object)*/this, "ready", null, null);
        }
    };

    ObjectListControl.prototype._createAllElements = function () {
        // Build the UI items for our list of objects and add them to the container
        var count = this._collection.count;
        for (var i = 0; i < count; i++) {
            var objectItem = this._getNewObjectItem();
            this._applyObject(objectItem, this._collection.item(i));
            this._elContainer.appendChild(objectItem);
            this._setAriaIndex(objectItem, i + 1, count);
        }

        // Make sure our first item is tab-accessible.
        this._fixTabAccessibility();

        // Ensure that, if selection is enabled, we have an initial selection
        if (this._selectionEnabled) {
            var index = (count > 0 ? 0 : -1);
            if (this._selection.object !== null) {
                index = this._findObjectIndex(this._selection.object);
            }
            if (index !== -1) {
                // Lookup and select the associate element.
                var element = /*@static_cast(HTMLElement)*/this._findElementByObjectIndex(index);

                this._selection.object = this._collection.item(index);
                this._selection.item = element; // Save the selected element for faster de-selection.
                this._addSelectionStyle(element);
            }
        }

    };

    ObjectListControl.prototype._removeAllElements = function () {
        if (this._elContainer !== null) {
            for (var i = 0; i < this._elContainer.children.length; i++) {
                var el = this._elContainer.children[i];
                this._unhookEventsForItem(el);
                el.__object = null;
                el.__childObject = null;
            }
            this._elContainer.innerText = "";
        }
    };

    ObjectListControl.prototype._unhookEventsForItem = function (item) {
        /// <summary>Unhooks the "changed" event listeners associated with the given list item</summary>
        /// <param name="item" type="HTMLElement"/>
        if (Jx.isObject(item.__object)) {
            item.__object.removeEventListener("changed", this._objectChangeListener);
            if (Jx.isObject(item.__childObject)) {
                item.__childObject.removeEventListener("changed", this._childObjectChangeListener);
            }
        }
    };

    ObjectListControl.prototype._fixTabAccessibility = function () {
        if (this._elContainer.children.length > 0) {
            this._elContainer.firstChild.tabIndex = 0;
        }
    };

    ObjectListControl.prototype._setAriaIndex = function (item, posInSet, setSize) {
        /// <param name="item" type="HTMLElement"/>
        /// <param name="posInSet" type="Number">Value for aria-posinset.  "Item ??? of 200"</param>
        /// <param name="setSize" type="Number">Value for aria-setsize.  "Item 112 of ???"</param>
        Debug.assert(Jx.isHTMLElement(item));
        Debug.assert(Jx.isNumber(posInSet));
        Debug.assert(Jx.isNumber(setSize));

        item.setAttribute("aria-posinset", posInSet.toString());
        item.setAttribute("aria-setsize", setSize.toString());
    };

    ObjectListControl.prototype._fixAriaIndicesFrom = function (indexStart) {
        /// <summary>When an item is inserted or removed from the list, all of the items that come after
        /// that one in the list need there aria-index updated.</summary>
        /// <param name="indexStart" type="Number">The index from which to start repairing the indices</param>
        /// <param name="posInSet" type="Number">Value for aria-posinset.  "Item ??? of 200"</param>
        /// <param name="setSize" type="Number">Value for aria-setsize.  "Item 112 of ???"</param>
        Debug.assert(Jx.isNumber(indexStart));

        var childrenItems = this._elContainer.children,
            count = childrenItems.length;

        for (var i = indexStart; i < count; i++) {
            this._setAriaIndex(childrenItems[i], i + 1, count);
        }
    };

    ObjectListControl.prototype._getNewObjectItem = function () {
        /// <summary>Generates a new element ready to be filled with object data and added to the DOM.</summary>
        /// <returns type="HTMLElement"/>
        Debug.assert(false, "ObjectListControl._getNewObjectItem should be overridden by derived types");
    };

    ObjectListControl.prototype._applyObject = function (item, object) {
        /// <summary>Generates a new element ready to be filled with object data and added to the DOM.</summary>
        /// <param name="item" type="HTMLElement"/>
        /// <param name="object" type="Plat.Object"/>

        // We may be re-apply the object data to the same item, check for that condition before setting the listener
        if (!Jx.isObject(item.__object) || item.__object.objectId !== object.objectId) {

            this._unhookEventsForItem(item);

            // Listen for change notifications to the object
            object.addEventListener("changed", this._objectChangeListener, false);

            // Listen for changes to a child object, if supported.
            var childObject = (this._getChildObject(object));
            if (Jx.isObject(childObject)) {
                // map the resource to its parent
                this._childIdToParent[childObject.objectId] = object;
                item.__childObject = childObject;

                childObject.addEventListener("changed", this._childObjectChangeListener, false);
            }

            // This will help lookups and keep the object alive.
            item.__object = object;
        }
    };

    ObjectListControl.prototype._handlePrimaryAction = function (object) {
        /// <summary>Performs the primary action in response to a list item being clicked</summary>
        /// <param name="object" type="Plat.Object"/>
        Debug.assert(false, "ObjectListControl._onPrimaryActionDefault should be overridden by derived types");
    };

    ObjectListControl.prototype._onPointerDown = function (ev) {
        var item = this._findObjectItemByInputEvent(ev);
        if (item !== null) {
            People.Animation.startTapAnimation(item, ev);
        }
    };

    ObjectListControl.prototype._onClick = function (ev) {
        var objectItem = /*@static_cast(HTMLElement)*/this._findObjectItemByInputEvent(ev);
        if (objectItem !== null) {
            var object = /*@static_cast(Plat.Object)*/this._findObjectByElement(objectItem);

            // Selection will intentionally fail if it's disabled.
            this._selectObject(object, objectItem);
            this._handlePrimaryAction(object);
        }
    };

    ObjectListControl.prototype._selectObject = function (object, objectItem) {
        /// <summary>Update the selection to select the given object</summary>
        /// <param name="object" type="Plat.Object"/>
        /// <param name="objectItem" type="HTMLElement"/>
        if (this._selectionEnabled) {
            var previousSelection = this._selection;

            // Make sure our selection changed before firing the event
            if (this._selection.object === null || object === null || this._selection.object.objectId !== object.objectId) {

                // A null object item just means the selection is being cleared.
                if (objectItem) {
                    this._addSelectionStyle(objectItem);
                }
                this._selection = { object: object, item: objectItem };

                // De-select the previously selected object
                if (previousSelection.item !== null) {
                    this._removeSelectionStyle(previousSelection.item);
                }

                // Fire the selection-changed notification
                Jx.EventManager.fire(/*@static_cast(Object)*/this, "selectionChanged", { object: object }, null);
            }
        }
    };

    ObjectListControl.prototype._addSelectionStyle = function (objectItem) {
        /// <summary>Updates the styles for the the given object item to look selected</summary>
        /// <param name="objectItem" type="HTMLElement"/>
        Jx.addClass(objectItem, "selected");
        objectItem.ariaSelected = true;
    };

    ObjectListControl.prototype._removeSelectionStyle = function (objectItem) {
        ///<summary>Updates the styles for the the given object item to look normal</summary>
        /// <param name="objectItem" type="HTMLElement"/>
        Jx.removeClass(objectItem, "selected");
        objectItem.ariaSelected = false;
    };

    ObjectListControl.prototype._onKeyDown = function (ev) {
        if (["Up", "Down"].indexOf(ev.key) >= 0) {
            this._verticalNavigate(ev.key === "Up" ? -1 : 1);
            ev.preventDefault();
        }
    };

    ObjectListControl.prototype._onKeyUp = function (ev) {
        if (ev.key === "Spacebar" || ev.key === "Enter") {
            // Treat this like a click event.
            this._onClick(ev);
        }
    };

    ObjectListControl.prototype._onLoseFocus = function (ev) {
        var item = this._findObjectItemByInputEvent(ev);
        if (item) {
            // Check to see if the focus is leaving our control.
            if (!this._controlHasFocus()) {
                // We're losing keyboard focus, reset the tab-index.
                item.tabIndex = -1;
                this._fixTabAccessibility();
            }
        }
    };

    ObjectListControl.prototype._controlHasFocus = function () {
        /// <summary>Checks if our control has the keyboard focus</summary>
        /// <returns type="Boolean">true is we have focus</returns>
        var focused = this._elContainer.querySelector("div :focus");
        return (focused !== null);
    };


    ObjectListControl.prototype._findObjectItemByInputEvent = function (ev) {
        /// <summary>Lookup HTML object item that contains the target element of the DOM input event</summary>
        /// <returns type="HTMLElement">null if not found</returns>
        var element = ev.target;

        // Walk up until we find the child of our container.
        while (element !== null && element.parentElement !== this._elContainer) {
            element = element.parentElement;
        }
        return element;
    };

    ObjectListControl.prototype._findObjectByMouseEvent = function (ev) {
        ///<summary>Lookup an object object from the HTML element targeted by the given mouse event</summary>
        ///<returns type="Plat.object">null if not found</returns>
        var object = /*@static_cast(Plat.Object)*/null;
        var element = this._findObjectItemByInputEvent(ev);

        if (element !== null) {
            object = this._findObjectByElement(element);
            Debug.assert(object !== null, "always should find an object");
        }
        return object;
    };

    ObjectListControl.prototype._findObjectByElement = function (el) {
        ///<summary>Lookup an object object from it's associated HTML element</summary>
        ///<param name="el" type="HTMLElement"/>
        ///<returns type="Plat.Object">null if not found</returns>
        return el.__object;
    };

    ObjectListControl.prototype._findElementByObjectIndex = function (index) {
        ///<summary>Lookup an object HTML element associate with the give object index</summary>
        ///<param name="index" type="Number">index in the ICollection of the object.</param>
        ///<returns type="HTMLElement">null if not found</returns>
        return this._elContainer.children[index] || null;
    };

    ObjectListControl.prototype._findObjectIndex = function (object) {
        ///<summary>Lookup the index for an object in our ICollection</summary>
        ///<param name="object" type="Plat.Object"/>
        ///<returns type="Number">Return -1 if the object wasn't found</returns>
        var index = -1;
        for (var i = 0; i < this._collection.count; i++) {
            if (this._collection.item(i).objectId === object.objectId) {
                index = i;
                break;
            }
        }
        return index;
    };

    ObjectListControl.prototype._onObjectChanged = function (ev) {
        // Update the display to match the new object data.
        var object = ev.target;
        var index = this._findObjectIndex(object);
        if (index !== -1) {
            this._applyObject(this._findElementByObjectIndex(index), object);
        }
    };

    ObjectListControl.prototype._onChildObjectChanged = function (ev) {
        // Update the display to match the new object data.
        var parent = this._childIdToParent[ev.target.objectId];
        if (parent) {
            this._applyObject(this._findElementByObjectIndex(this._findObjectIndex(parent)), parent);
        }
    };

    ObjectListControl.prototype._onCollectionChanged = function (ev) {
        var change = ev.detail[0];
        var item = null;

        switch (change.eType) {
            case Plat.CollectionChangeType.itemAdded:
                this._addObject(this._collection.item(change.index), change.index);

                // Forward on the notification to any listeners.
                Jx.EventManager.fire(/*@static_cast(Object)*/this, "objectAdded", { object: this._collection.item(change.index) }, null);
                Jx.log.info("ObjectListControl._onCollectionChanged, changeType: add, change.index: " + change.index + ", objectId = " + change.objectId);
                break;
            case Plat.CollectionChangeType.itemRemoved:
                item = this._findElementByObjectIndex(change.index);
                if (item) {
                    this._removeObjectItem(item);

                    // Forward on the notification to any listeners.
                    Jx.EventManager.fire(/*@static_cast(Object)*/this, "objectRemoved", { objectId: change.objectId }, null);
                }
                Jx.log.info("ObjectListControl._onCollectionChanged, changeType: remove, change.index: " + change.index + ", objectId = " + change.objectId);
                break;
            case Plat.CollectionChangeType.itemChanged:
                item = /*@static_cast(HTMLElement)*/this._findElementByObjectIndex(change.previousIndex);
                // We need to move an item
                this._moveObjectItem(item, change.index, change.previousIndex);
                Jx.log.info("ObjectListControl._onCollectionChanged, changeType: move, change.index: " + change.index + ", change.previousIndex = " + change.previousIndex);
                break;
            case Plat.CollectionChangeType.reset:
                this._removeAllElements();
                this._createAllElements();
                break;
            default:
                Debug.assert(false, "Unrecognized change type: " + change.eType);
                break;
        }
    };

    ObjectListControl.prototype._addObject = function (object, index) {
        /// <summary>Create a new UI item for the object, add it to the DOM, animates the change, and updates our mappings</summary>
        /// <param name="object" type="Plat.Object"/>
        /// <param name="index" type="Number"/>

        var item = this._getNewObjectItem();
        this._applyObject(item, object);

        var allItems = this._elContainer.children,
            count = allItems.length,
            currentItems = [];

        for (var i = 0; i < count; i++) {
            currentItems.push(allItems[i]);
        };

        var animation = WinJS.UI.Animation.createAddToListAnimation(item, currentItems);

        // Find the element at the new index
        Debug.assert(index <= this._elContainer.children.length, "Index out of bounds!");
        var itemBefore = this._elContainer.children[index] || null;

        // Insert the item at the new index.
        this._elContainer.insertBefore(item, itemBefore);

        // If our control doesn't currently have keyboard focus, reset the tab-index
        if (!this._controlHasFocus()) {
            this._fixTabAccessibility();
        }
        this._fixAriaIndicesFrom(index);

        // If the count is now 1 and selection is enabled, select this one by default.
        if (this._collection.count === 1 && this._selectionEnabled) {
            this._selectObject(object, item);
        }

        animation.execute();
    };

    ObjectListControl.prototype._removeObjectItem = function (removedItem) {
        /// <summary>Removes an object item from the DOM, animates the change, and updates our mappings</summary>
        /// <param name="removedItem" type="HTMLElement"/>

        // build a list of object item, minus the one we're deleting
        var allItems = this._elContainer.children,
            count = allItems.length,
            removeItemIndex = 0,
            remainingItems = [];

        // Build the list of remaining items for the deletion animation.
        for (var i = 0; i < count; i++) {
            if (allItems[i].id !== removedItem.id) {
                remainingItems.push(allItems[i]);
            } else {
                removeItemIndex = i;
            }
        };

        var animation = WinJS.UI.Animation.createDeleteFromListAnimation(removedItem, remainingItems);

        var newItemSelection;
        // Determine what to select, if the deleted object was selected.
        if (this._selection.item !== null && this._selection.item.id === removedItem.id) {
            newItemSelection = null;
            if (removedItem.previousSibling !== null) {
                newItemSelection = removedItem.previousSibling;
            } else if (removedItem.nextSibling !== null) {
                newItemSelection = removedItem.nextSibling;
            }
        }

        // Unhook the change event on the object
        this._unhookEventsForItem(removedItem);

        // Remove the item from the tree
        this._elContainer.removeChild(removedItem);

        // Perform the actual selection.
        if (newItemSelection !== undefined) {
            this._selectObject((newItemSelection ? this._findObjectByElement(newItemSelection) : null), newItemSelection);
        }

        // Ensure we're still in tab-accessible
        this._fixTabAccessibility();

        this._fixAriaIndicesFrom(removeItemIndex);

        animation.execute();
    };

    ObjectListControl.prototype._moveObjectItem = function (item, newIndex, prevIndex) {
        /// <summary>Moves an object item's position in our list, animates the change, and updates our mappings</summary>
        /// <param name="item" type="HTMLElement"/>
        /// <param name="newIndex" type="Number"/>
        /// <param name="prevIndex" type="Number"/>

        var animation = WinJS.UI.Animation.createRepositionAnimation(item);

        // Find the element at the new index
        Debug.assert(newIndex < this._elContainer.children.length, "Index out of bounds!");

        // remove the item from the DOM and re-insert it before the item current at newIndex
        this._elContainer.removeChild(item);
        var itemBefore = this._elContainer.children[newIndex] || null;
        this._elContainer.insertBefore(item, itemBefore);

        // If our control doesn't currently have keyboard focus, reset the tab-index
        if (!this._controlHasFocus()) {
            this._fixTabAccessibility();
        }

        this._fixAriaIndicesFrom(Math.min(item, prevIndex));

        animation.execute();
    };

    ObjectListControl.prototype.deactivateUI = function () {
        this._removeAllElements();
        if (Jx.isFunction(this._collectionChangeListener)) {
            this._collection.removeEventListener("collectionchanged", this._collectionChangeListener);
            this._collectionChangeListener = null;
        }
        Jx.dispose(this._collection);
        this._collection = /*@static_cast(Mocks.Microsoft.WindowsLive.Platform.Collection)*/null;
        Jx.Component.prototype.deactivateUI.call(this);
    };

    ObjectListControl.prototype.shutdownUI = function () {
        /// <summary>Called when our control is being removed from the DOM</summary>
        this._platform = /* @static_cast(Mock.Microsoft.WindowsLive.Platform.Client)*/null;

        Jx.Component.prototype.shutdownUI.call(this);
    };

});
