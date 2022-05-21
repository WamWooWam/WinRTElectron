
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/JSUtil/Hydration.js"/>
/// <reference path="../../Shared/Mocks/Platform/Collection.js"/>
/// <reference path="../../Shared/Mocks/Platform/People.js"/>
/// <reference path="../Controls/Viewport/Viewport.js"/>
/// <reference path="Section.js"/>
/// <reference path="../Controls/Collections/BaseCollection.js"/>
/// <reference path="../Controls/Scheduler/Scheduler.js"/>
/// <reference path="../Controls/VirtualizedGrid/VirtualizedGrid.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "ContactGridSection", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        U = WinJS.Utilities;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.ContactGridSection = /* @constructor*/function (sectionName, title, peopleManager) {
        ///<summary>ContactGridSection provides a base implementation for the Favorites and All views, that host a
        ///VirtualizedGrid full of IdentityControls</summary>
        ///<param name="sectionName" type="String"/>
        ///<param name="title" type="String"/>
        ///<param name="peopleManager" type="Microsoft.WindowsLive.Platform.PeopleManager" optional="true" />
        P.Section.call(this, sectionName, title);
        this._peopleManager = peopleManager;
    };
    Jx.inherit(P.ContactGridSection, P.Section);
    P.ContactGridSection.prototype.getContent = function () {
        return this._getPlaceholderUI() +
               "<div class='gridContainer' role='group' aria-label='" + (this.title ? Jx.escapeHtml(Jx.res.getString(this.title)) : "") + "'></div>";
    };
    P.ContactGridSection.prototype._getPlaceholderUI = function () {
        ///<summary>Can be overriden by derived classes to add a "placeholder" - an element that will be shown
        ///when the grid is empty</summary>
        return "";
    };
    P.ContactGridSection.prototype.activateUI = function () {
        P.Section.prototype.activateUI.call(this);
        var gridContainer = this._gridContainer = this._contentElement.querySelector(".gridContainer");
        if (this._getPlaceholderUI() !== "") {
            this._placeholder = gridContainer.previousSibling;
        }
        Debug.assert(!this._placeholder || getComputedStyle(this._placeholder).display === "none"); // Placeholder should be initially hidden
    };
    P.ContactGridSection.prototype.hydrateExtent = function (data) {
        ///<summary>Hydration of the section begins by creating a contact grid and asking it its size, a straightforward
        ///computation based on the number and grouping of elements, and the size of an individual element.  To facilitate
        ///doing this quickly, before query results have returned, the number and grouping of items in the collection will 
        ///be hydrated as well.</summary>
        ///<param name="data" type="Object">The last value returned from dehydrate</param>

        this._emptyExtent = this.getSectionExtent(); // Record our "empty" extent: the size of our padding
        P.Section.prototype.hydrateExtent.call(this, data);

        // Figure out the offset to the grid from the section: margin + padding
        this._computeGridOffsets();

        // Get the collection
        var collection = this._collection = this._getCollection();

        // If our queries aren't loaded or hydrated (loaded with persisted sizes), wait for them to load before declaring that our
        // extent is ready. 
        var unloadedCollections = this._unloadedCollections = [];
        for (var i = 0, len = collection.length; i < len; ++i) {
            var item = collection.getItem(i);
            var /*@type(P.Collection)*/subCollection = item.collection;
            if (!subCollection.isLoaded) {
                if (!collection.isHydrated) {
                    unloadedCollections.push(subCollection);
                    subCollection.addListener("load", this._onCollectionLoaded, this);
                }
            } else {
                // If a collection is already loaded, it may have updates pending.  Accept them now.
                subCollection.acceptPendingChanges();
            }
        }

        // Get the node factory map
        var factories = this._getFactories();
        factories["none"] = new P.Callback(function () { return new NullNode(); });
        var canonicalType = this._getCanonicalType();

        // Create the grid
        Debug.assert(this._grid === null);
        this._grid = P.Grid.createGrid(/*@static_cast(People.Init)*/{
            items: collection,
            factories: factories,
            canonicalType: canonicalType,
            jobSet: this.getJobSet(),
            viewport: this,
            containerElement: this._gridContainer
        });
        this._grid.hydrate(P.Hydration.get(data, "grid", {}));

        if (collection.isHydrated || unloadedCollections.length === 0) {
            this.extentReady(/* @static_cast(P.Section)*/this);
        }
    };
    P.ContactGridSection.prototype.hydratePosition = function (data) {
        ///<summary>Hydration of the scroll position is delegated to the grid</summary>
        ///<param name="data" type="Object">The last value returned from dehydrate</param>
        this._grid.hydratePosition(P.Hydration.get(data, "grid", {}));
    };
    P.ContactGridSection.prototype.contentReadyAsync = function () {
        // If (a) We're on screen and the grid has cells, return the grid elements (ensuring we add the header element
        //        to its first animation set)
        //    (b) We have a placeholder, return the section element (housing both header and content)
        //    (c) Otherwise return the empty list.
        if (this.isInView()) {
            var that = this;
            return this._grid.contentReadyAsync().then(function (/*@type(Array)*/gridElements) {
                var animatingGrid = gridElements.length > 0;
                return animatingGrid ? gridElements : (Boolean(that._placeholder) ? [that._sectionElement] : []);
            });
        }
        return [];
    };
    P.ContactGridSection.prototype.onEnterComplete = function () {
        this._grid.onEnterComplete();
    };
    P.ContactGridSection.prototype.render = function () {
        ///<summary>Rendering of the grid starts with its first scroll event.</summary>
        P.Section.prototype.render.call(this);
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        this.scroll(parentViewport.getScrollPosition(), 0);
    };
    P.ContactGridSection.prototype.scroll = function (position, change) {
        ///<summary>Forwards scroll events to the grid</summary>
        P.Section.prototype.scroll.call(this, position, change);
        this._grid.onScroll(position - this._gridScrollableOffset, change);
    };
    P.ContactGridSection.prototype.setScrollPosition = function (position) {
        ///<param name="position" type="Number">The grid's desired scroll position</param>
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        return parentViewport.setScrollPosition(position + this._gridScrollableOffset);
    };
    P.ContactGridSection.prototype.getScrollPosition = function () {
        ///<returns type="Number">The grid's current scroll position</returns>
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        return parentViewport.getScrollPosition() - this._gridScrollableOffset;
    };
    P.ContactGridSection.prototype.positionItem = function (item) {
        /// <summary> Calculate and return a bounding rectangle in grid coordinates
        /// of the corresponding item in the other view (zoomed in when zooming out and vice versa). </summary>
        /// <param name="item" type="Object">format: { itemOffset: _, groupIndex: _ }</param>
        /// <returns type="Position"> bounding rectangle </returns>
        var position = this._grid.positionItem(item);
        if ((this.getOrientation() === P.Orientation.vertical) && !position.isFirstGroup) {
            // It's not the first group in the section, no need to keep the grid offset for showing section header.
            position.scrollPos += this._gridScrollableOffset;
        }
        return position;
    };
    P.ContactGridSection.prototype.getCurrentItem = function (item) {
        /// <summary> Calculate and return a bounding rectangle in grid coordinates
        /// of the current item in focused, set by setCurrentItem previously. </summary>
        /// <param name="item" />
        /// <returns type="Position"> bounding rectangle </returns>
        var position = this._grid.getCurrentItem(item);
        position.scrollPos += this._gridScrollableOffset;
        return position;
    };
    P.ContactGridSection.prototype.setCurrentItem = function (position) {
        /// <summary> Translate mouse coordinates into grid coordinates by incorporating grid offsets.
        /// Pass the coordinates down to set focus on the corresponding cell in the grid at the given location
        /// to prepare for a later call to getCurrentItem </summary>
        /// <param name="position" type="Position" />
        position.scrollPos -= this._gridScrollableOffset;
        position.orthoPos -= this._gridOrthogonalOffset;
        this._grid.setCurrentItem(position);
    };
    P.ContactGridSection.prototype.resize = function () {
        ///<summary>Forwards resize events to the grid if not hidden</summary>
        P.Section.prototype.resize.call(this);
        if (!this.isHidden()) {
            this._grid.onResize();
            var /*@type(P.Viewport)*/parentViewport = this.getParent();
            this.scroll(parentViewport.getScrollPosition(), 0);
        }
    };
    P.ContactGridSection.prototype.show = function () {
        ///<summary>Adds resize to default behavior to notify grid of potential resize</summary>
        P.Section.prototype.show.call(this);
        this.resize();
    };
    P.ContactGridSection.prototype.dehydrate = function (shouldDehydratePosition) {
        ///<summary>Dehydrates data for use in subsequent hydration calls</summary>
        ///<returns type="Object">Data to be passed to future hydrate calls</returns>
        var data = {};
        P.Hydration.set(data, "grid", this._grid.dehydrate());
        return data;
    };
    P.ContactGridSection.prototype.shutdownComponent = function () {
        P.Section.prototype.shutdownComponent.call(this);
        Jx.dispose(this._grid);
        this._unloadedCollections.forEach(/*@bind(P.ContactGridSection)*/function (/*@type(P.Collection)*/subCollection) {
            subCollection.removeListener("load", this._onCollectionLoaded, this);
        }, this);
        this._unloadedCollections = null;

    };
    P.ContactGridSection.prototype._getCanonicalType = function () {
        return "person";
    };

    
    P.ContactGridSection.prototype._getCollection = function () {
        ///<summary>Returns the collection of items and headers to be rendered by the grid</summary>
        ///<returns type="P.Collection"/>
        Debug.assert(false, "ContactGridSection._getCollection should be overridden by derived types");
    };
    P.ContactGridSection.prototype._getFactories = function () {
        ///<summary>Returns a map from type string to factory function that will be used to populate visual items in the 
        ///grid</summary>
        ///<returns type="Object"/>
        Debug.assert(false, "ContactGridSection._getFactories should be overridden by derived types");
    };
    

    P.ContactGridSection.prototype._onCollectionLoaded = function (/*@dynamic*/ev) {
        ///<summary>Called when one of the sub-collections is loaded</summary>
        ///<param name="ev"/>
        var subCollection = /*@static_cast(P.Collection)*/ev.target;

        subCollection.removeListener("load", this._onCollectionLoaded, this);

        var index = this._unloadedCollections.indexOf(subCollection);
        Debug.assert(index !== -1);
        this._unloadedCollections.splice(index, 1);

        if (this._unloadedCollections.length === 0) {
            this.extentReady(/* @static_cast(P.Section)*/this);
        }
    };
    P.ContactGridSection.prototype.extentReady = function (section) {
        ///<summary>Called when the content has determined its initial size from hydration or querying the database</summary>
        ///<param name="section" type="P.Section">Passthrough to base class</param>
        this._extentReady = true;
        this._hideIfEmpty(); // Check before propagating extentReady to avoid showing the next section and then immediately moving it
        P.Section.prototype.extentReady.call(this, section);
    };
    P.ContactGridSection.prototype.extentChanged = function (section, position, change) {
        ///<summary>Called when the content changes size</summary>
        ///<param name="section" type="P.Section">Passthrough to base class</param>
        ///<param name="position" type="Number">Passthrough to base class</param>
        ///<param name="change" type="Number">Passthrough to base class</param>
        P.Section.prototype.extentChanged.call(this, section, position + this._gridScrollableOffset, change);
        this._hideIfEmpty(); // Check after propagating extentChanged so that this.getSectionExtent() is updated.
    };
    P.ContactGridSection.prototype._hideIfEmpty = function () {
        ///<summary>Hides the section if it is empty.  This is necessary because sections may have margins/padding, so
        ///leaving just them empty still leaves a gap in the UI.</summary>
        if (this._extentReady) {
            Debug.assert(this.getSectionExtent() >= this._emptyExtent, "ContactGridSection became smaller than its padding");
            var isEmpty = this.getSectionExtent() <= this._emptyExtent;
            if (isEmpty !== this.isHidden()) {
                if (isEmpty) {
                    this.hide();
                } else {
                    this.show();
                }
            }
        }
    };
    P.ContactGridSection.prototype._computeGridOffsets = function () {
        /// <summary>Figures out the offset between the section and the grid by inspecting margin and padding</summary>
        /// <returns type="Number"/>
        var gridElement = this._gridContainer;
        var sectionElement = this._sectionElement;

        var offsetVertical = gridElement.offsetTop - sectionElement.offsetTop;
        var offsetHorizontal = getComputedStyle(gridElement).direction === "ltr" ?
                                    (gridElement.offsetLeft - sectionElement.offsetLeft) :
                                    // in RTL, offsetLeft is the distance from the right edge of the viewport to the left edge of the element
                                    // this means it is a negative number and includes the width of the element.  We'll add the width back,
                                    // which will give us the distance from the right edge of the viewport to the right edge of the element.
                                    // Then we'll reverse the computation, to handle the negative values.
                                    (sectionElement.offsetLeft + sectionElement.offsetWidth - gridElement.offsetLeft - gridElement.offsetWidth);

        if (this.getOrientation() === P.Orientation.vertical) {
            this._gridScrollableOffset = offsetVertical;
            this._gridOrthogonalOffset = offsetHorizontal;
        } else {
            this._gridScrollableOffset = offsetHorizontal;
            this._gridOrthogonalOffset = offsetVertical;
        }
    };

    P.ContactGridSection.prototype._grid = null;
    P.ContactGridSection.prototype._unloadedCollections = /*@static_cast(Array)*/null;
    P.ContactGridSection.prototype._collection = /* @static_cast(P.Collection)*/null;
    P.ContactGridSection.prototype._extentReady = false;
    P.ContactGridSection.prototype._emptyExtent = 0;
    P.ContactGridSection.prototype._gridScrollableOffset = 0;
    P.ContactGridSection.prototype._gridOrthogonalOffset = 0;
    P.ContactGridSection.prototype._gridContainer = /* @static_cast(HTMLElement)*/null;
    P.ContactGridSection.prototype._placeholder = /* @static_cast(HTMLElement)*/null;

    /*@constructor*/function NullNode() {
        ///<summary>On occasion, we will find ourselves unable to fetch an item from a collection (most likely because
        ///it has already been deleted.  This is expected to be brief: a delete notification should soon follow.  In this 
        ///situation, we will put a blank placeholder into the grid.  This node is that placeholder.</summary>
        this._element = document.createElement("div");
        this._element.id = this.id = "NullNode_" + String(Jx.uid());
    }
    NullNode.prototype.getElement = function () {
        return this._element;
    };
    NullNode.prototype.getHandler = function () {
        return this;
    };
    NullNode.prototype.setDataContext = function (data) {
        Debug.assert(data === undefined);
    };
    NullNode.prototype.nullify = NullNode.prototype.dispose = Jx.fnEmpty;
});

