
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../../Shared/Jx/Core/Jx.js"/>
/// <reference path="../../../../Shared/Jx/Core/Log.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/JSUtil/Hydration.js"/>
/// <reference path="../Viewport/Viewport.js"/>
/// <reference path="../Viewport/ViewportChild.ref.js"/>
/// <reference path="../Scheduler/Scheduler.js"/>
/// <reference path="OffsetViewport.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "Stitcher", function () {

    var P = window.People;

    P.Stitcher = /* @constructor*/function () {
        ///<summary>The stitcher is a component that horizontally concatenates a series of divs.  The stitcher delegates hydration to the children appropriately, and ensures 
        ///that sections are not visible and bouncing around during initial loading.  It delegates scroll events to the child by using an OffsetViewport component, which will
        ///appropriately translate coordinates to be relative to the child's origin, based on offset information calculated by the Stitcher.</summary>
        NoShip.People.etw("abLoadPage_start");
        P.Viewport.call(this);
        this._isExtentReady = [];
    };
    Jx.inherit(P.Stitcher, P.Viewport);
    P.Stitcher.prototype.addChild = function (child) {
        ///<summary>Adds a child to the stitcher.  This is not dynamic: children should only be added before creating and hydrating the UI.</summary>
        ///<param name="child" type="ViewportChild"/>

        Debug.assert(!this._initializationComplete, "Cannot add children after creating the UI");

        // Wrap the child in an OffsetViewport to handle coordinate transformation
        var viewport = new P.OffsetViewport(this.getJobSet().createChild(), child);
        ///<disable>JS3057.AvoidImplicitTypeCoercion</disable>   OffsetViewport is a Component, which is a TreeNode
        this.appendChild(viewport);

        // Track which children have told us their extent is ready
        this._isExtentReady.push(false);
    };
    P.Stitcher.prototype.getUI = function (ui) {
        ///<summary>This is a Jx.Component method, which returns the HTML for this component</summary>
        this._initializationComplete = true;
        ui.html = "<div id='" + this._id + "' class='stitcher'>" +
                      /*@static_cast(String)*/this._children.reduce(function (html, child) { return html + Jx.getUI(child).html; }, "") +
                  "</div>";
    };
    P.Stitcher.prototype.activateUI = function (ui) {
        ///<summary>This is a Jx.Component method, called after the HTML has been loaded</summary>

        // Before activating children, we must assign the correct grid-(column|row) so their sizes in the DOM are
        // accurate.
        var isHorizontal = this.getOrientation() === P.Orientation.horizontal;
        var gridProperty = isHorizontal ? "-ms-grid-column" : "-ms-grid-row";
        var element = /*@static_cast(HTMLElement)*/document.getElementById(this._id);
        Debug.assert(element.childNodes.length === this.getChildrenCount());
        Array.prototype.forEach.call(element.childNodes, function (el, index) {
            /// <param name="el" type="HTMLElement" />
            el.style.setAttribute(gridProperty, (index + 1).toString());
        });

        var gridString = "";
        for (var i = 0; i < element.childNodes.length; i++) {
            gridString += "auto ";
        }
        gridString += "minmax(1fr, 100%)";
        element.style.setAttribute(gridProperty + "s", gridString);

        Jx.Component.prototype.activateUI.call(this);

        // Get our margin and offset all of our children by it
        var marginString = getComputedStyle(element)[isHorizontal ? "marginLeft" : "marginTop"];
        Debug.assert(marginString !== "marginLeft" || getComputedStyle(element).marginLeft === getComputedStyle(element).marginRight, "Asymmetric margins would require RTL code above");
        Debug.assert(Jx.isNonEmptyString(marginString) && marginString.match(/\d+px/) !== null, "Invalid margin: " + marginString);
        var margin = this._margin = parseInt(marginString);

        for (var i = 0, len = this.getChildrenCount(); i < len; ++i) {
            var child = /* @static_cast(P.OffsetViewport)*/this.getChild(i);
            child.setOffset(child.getOffset() + margin);
        }
        this._zoomSection = element.childNodes.length - 1;
        Array.prototype.forEach.call(element.childNodes, /*@bind(P.Stitcher)*/function (elt, index) {
            /// <param name="elt" type="HTMLElement" />
            elt.addEventListener("focus", this._onFocusChange.bind(this, index), true);
        }, this);
    };
    P.Stitcher.prototype._onFocusChange = function (index) {
        this._zoomSection = index;
    };
    P.Stitcher.prototype.setCurrentItem = function (position) {
        /// <param name="position" type="Position" />
        this._zoomSection = 0;
        var numChildren = this.getChildrenCount();
        for (var i = numChildren - 1; i >= 0; --i) {
            var child = /* @static_cast(P.OffsetViewport) */this.getChild(i);
            if (child.getOffset() < position.scrollPos) {
                this._zoomSection = i;
                break;
            }
        }
        child.setCurrentItem(position);
    };
    P.Stitcher.prototype.getCurrentItem = function (/*@dynamic*/item) {
        item.section = this._zoomSection;
        var child = /* @static_cast(P.OffsetViewport) */this.getChild(this._zoomSection);
        return child.getCurrentItem(item);
    };
    P.Stitcher.prototype.positionItem = function (/*@dynamic*/item) {
        var child = /* @static_cast(P.OffsetViewport) */this.getChild(item.section);
        var position = child.positionItem(item);
        position.scrollPos -= this._margin;
        return position;
    };
    P.Stitcher.prototype.extentReady = function (readyChild) {
        ///<summary>During initial load, extents may fluctuate as data is queried.  To avoid seeing headers and content bounce around as this data comes in, children will be kept
        ///invisible until the extent of each sibling to the left of it is fixed.  On subsequent loads, extents should be fixed quickly as a result of hydration.</summary>
        ///<param name="readyChild" type="P.OffsetViewport">The child whose extent is now fixed</param>

        // Find the child and update the _isExtentReady array to reflect this event.
        // Along the way, check whether sibling to the left (or right in RTL) of this child has fixed its extent.
        var i = 0;
        var numChildren = this.getChildrenCount();
        var isEverythingToTheLeftReady = true;
        for (i = 0; i < numChildren; ++i) {
            var child = /* @static_cast(P.OffsetViewport)*/this.getChild(i);
            if (child === readyChild) {
                this._isExtentReady[i] = true;
                break;
            } else if (!this._isExtentReady[i]) {
                isEverythingToTheLeftReady = false;
            }
        }

        if (isEverythingToTheLeftReady) {

            // If every sibling to the left has fixed its extent, we can display elements to the right of this one.
            if (this._rendering) {
                this._renderChildren(i + 1);
            }

            // If every child has fixed its extent, we can report to our parent that the extent of the stitcher is now fixed.
            var allExtentsReady = true;
            for (i = i + 1; i < numChildren; ++i) {
                if (!this._isExtentReady[i]) {
                    allExtentsReady = false;
                    break;
                }
            }
            if (allExtentsReady) {
                var /*@type(P.Viewport)*/parentViewport = this.getParent();
                parentViewport.extentReady(this);
            }
        }
    };
    P.Stitcher.prototype._renderChildren = function (startingIndex) {
        ///<summary>Displays children starting at the specified index until it encounters a child with an unfixed extent.  Siblings to the right of that child will not
        ///be displayed yet, so they don't move around as data comes in and layout is updated.  They will be displayed when that child calls extentReady.</summary>
        ///<param name="startingIndex" type="Number"/>
        for (var i = startingIndex, len = this.getChildrenCount(); i < len; ++i) {
            var child = /* @static_cast(P.OffsetViewport)*/this.getChild(i);
            child.render();
            if (!this._isExtentReady[i]) {
                break;
            }
        }
        if (i >= len - 1) {
            // The page is fully layed out when all but the last section's extents are known.  
            // The last section can adjust its extent without affecting layout (only the scroll bar thumb)
            NoShip.People.etw("abLoadPage_layout");
        }
    };
    P.Stitcher.prototype.extentChanged = function (child, origin, extentChange) {
        ///<summary>Called when a child's extent is updated.</summary>
        ///<param name="child" type="P.OffsetViewport">The child whose extent has changed</param>
        ///<param name="origin" type="Number">The position at which the change occured.  This has already been translated by OffsetViewport into stitcher-relative coordinates</param>
        ///<param name="extentChange" type="Number">The amount by which the child extent has changed</param>

        // Turn off scroll events, and then inform sections that have been shifted as a result of this change
        var iChangedChild = this.indexOfChild(child);
        var suppressions = [];
        for (var i = iChangedChild + 1, len = this.getChildrenCount(); i < len; ++i) {
            var viewport = /* @static_cast(P.OffsetViewport)*/this.getChild(i);
            suppressions.push(viewport.suppressScrollEvents());
            viewport.setOffset(viewport.getOffset() + extentChange);
        }
        // Now let our viewport know about the change so that it can update position as needed
        var /*@type(P.Viewport)*/parentViewport = this.getParent();
        parentViewport.extentChanged(this, origin, extentChange);

        // And turn scroll events back on now that we are back to a stable state
        for (i = 0, len = suppressions.length; i < len; ++i) {
            suppressions[i].enableScrollEvents();
        }
    };
    P.Stitcher.prototype.hydrateExtent = function (data) {
        ///<summary>The first pass of hydration fixes the extents of elements.  This event is purely delegated to the children.</summary>
        ///<param name="data" type="Object">The value last returned from dehydrate</param>
        var sections = P.Hydration.get(data, "sections", {});
        for (var i = 0, len = this.getChildrenCount(); i < len; ++i) {
            var child = /* @static_cast(P.OffsetViewport)*/this.getChild(i);

            // Prioritize the child according to his position
            child.getJobSet().setOrder(i);

            child.hydrateExtent(P.Hydration.get(sections, child.name, {}));
        }
    };
    P.Stitcher.prototype.hydratePosition = function (data) {
        ///<summary>The second pass of hydration restores the scroll position.  This event is delegated to the child identified in the last
        ///call to dehydrate as owning the scroll position:  the leftmost visible child.</summary>
        ///<param name="data" type="Object">The value last returned from dehydrate</param>

        // Identify which child last owned the scroll position
        var lastVisibleChildName = P.Hydration.get(data, "lastVisibleSection", "");

        // Hydrate that child
        if (Jx.isNonEmptyString(lastVisibleChildName)) {
            for (var i = 0, len = this.getChildrenCount(); i < len; ++i) {
                var child = /* @static_cast(P.OffsetViewport)*/this.getChild(i);
                var childName = child.name;
                if (childName === lastVisibleChildName) {
                    var sections = P.Hydration.get(data, "sections", {});
                    child.hydratePosition(P.Hydration.get(sections, childName, {}));
                }
            }
        }
    };
    P.Stitcher.prototype.dehydrate = function (shouldSaveScrollPosition) {
        ///<summary>Collects information to be used when rehydrated.</summary>
        ///<param name="shouldSaveScrollPosition" type="Boolean">Indicates whether this control should record its current scroll position for future restoration</param>
        ///<returns type="Object">A data object that will be passed to the next call to hydrateExtent/Position</returns>

        var i = 0;
        var numChildren = this.getChildrenCount();
        var data = {};

        // Record the name of the child that overlaps the edge of the viewport
        var visibleChild = /* @static_cast(P.OffsetViewport)*/null;
        var /*@type(P.OffsetViewport)*/child;
        if (shouldSaveScrollPosition) {
            var /*@type(P.Viewport)*/parentViewport = this.getParent();
            var scrollPosition = parentViewport.getScrollPosition();
            for (i = 0; i < numChildren; ++i) {
                child = /* @static_cast(P.OffsetViewport)*/this.getChild(i);
                if (child.getOffset() > scrollPosition) {
                    break;
                }
                visibleChild = child;
            }
            if (visibleChild !== null) {
                P.Hydration.set(data, "lastVisibleSection", visibleChild.name);
            }
        }

        // And dehydrate all of the sections, giving that child a chance to save
        // its scroll position
        data.sections = {};
        for (i = 0; i < numChildren; ++i) {
            child = this.getChild(i);
            data.sections[child.name] = child.dehydrate(child === visibleChild);
        }

        return data;
    };
    P.Stitcher.prototype.render = function () {
        ///<summary>The last phase of hydration is to make the child elements visible and begin rendering them.  The stitcher delays most of this rendering based on the logic
        ///in extentReady, but shows the first element here.</summary>
        this._rendering = true;
        this._renderChildren(0);
        var childJobSet = this._perfJobSet = this.getJobSet().createChild();
        childJobSet.setOrder(this.getChildrenCount());
        
        childJobSet.addUIJob(null, function () { NoShip.People.etw("abLoadPage_lowFidelity"); }, null, P.Priority.perfLowFidelity);
        childJobSet.addUIJob(null, function () { NoShip.People.etw("abLoadPage_end"); }, null, P.Priority.perfHighFidelity);
        
    };
    P.Stitcher.prototype.scroll = function (position, positionChange) {
        ///<summary>Called when the user scrolls the viewport (or it is otherwise adjusted).  Every child will be informed of the scroll.</summary>
        ///<param name="position" type="Number"/>
        ///<param name="positionChange" type="Number"/>
        for (var i = 0, len = this.getChildrenCount(); i < len; ++i) {
            var child = /* @static_cast(P.OffsetViewport)*/this.getChild(i);
            child.scroll(position, positionChange);
        }
    };
    P.Stitcher.prototype.resize = function () {
        ///<summary>Called when the viewport changes size.  Every child will be informed.</summary>
        this.forEachChild(function (child) {
            /// <param name="child" type="P.OffsetViewport" />
            child.resize();
        });
    };
    P.Stitcher.prototype.shutdownComponent = function () {
        P.Viewport.prototype.shutdownComponent.call(this);
        if (this._perfJobSet) {
            this._perfJobSet.dispose();
            this._perfJobSet = null;
        }
        this.forEachChild(function (child) {
            /// <param name="child" type="P.OffsetViewport)" />
            child.getJobSet().dispose();
        });
    };
    P.Stitcher.prototype._zoomSection = -1;
    P.Stitcher.prototype._isExtentReady = /* @static_cast(Array)*/null;
    P.Stitcher.prototype._rendering = false;
    P.Stitcher.prototype._initializationComplete = false;
    P.Stitcher.prototype._perfJobSet = /*@static_cast(P.JobSet)*/null;

});
