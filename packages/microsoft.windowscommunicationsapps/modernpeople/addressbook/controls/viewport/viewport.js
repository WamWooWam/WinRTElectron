
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../../Shared/Jx/Core/TreeNode.js"/>
/// <reference path="../../../../Shared/Jx/Core/Component.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../Scheduler/JobSet.js"/>

Jx.delayDefine(People, ["Orientation", "Viewport"], function () {

var P = window.People;

P.Orientation = {
    horizontal: 0,
    vertical: 1
};
Object.freeze(P.Orientation);

P.Viewport = /* @constructor*/function () {
    ///<summary>Viewport is the base interface implemented by components that want to
    ///give child components access to information or control of a panning surface.
    ///
    /// These methods use the term 'extent', 'change', and 'position' and extensively:
    ///
    /// Position is defined as the distance of the edge of the viewport from the edge of the underlying surface.  In
    /// LTR, these the left edges when oriented horizontally.  In RTL, these are the right edges.  In vertical
    /// orientation, these are the top edges.
    ///
    /// Extent is defined as the total scrolling distance of the viewport.  When oriented horizontally, this is the
    /// clientWidth.  When vertical, this is clientHeight.
    ///
    /// Change refers to a positive or negative delta to a position.
    ///
    ///</summary>
    this.initComponent();
    this._children = [];
};
Jx.augment(P.Viewport, Jx.Component);

P.Viewport.prototype.setScrollPosition = function (position) { 
    ///<summary>Moves the viewport's edge to the specified position.</summary>
    ///<param name="position" type="Number"/>
    var parentViewport = /*@static_cast(P.Viewport)*/this.getParent();
    parentViewport.setScrollPosition(position);
};
P.Viewport.prototype.extentReady = function (child) { 
    ///<summary>A control may fire many extentChanged events if its with is dynamic, and based on asynchronously loading data.
    ///This call indicates that this initial shifting is complete.  It is used to control the visibility of peer elements,
    ///to avoid seeing them jitter around as data comes in.</summary>
    ///<param name="child" type="P.Viewport" />
    var parentViewport = /*@static_cast(P.Viewport)*/this.getParent();
    parentViewport.extentReady(this);
};
P.Viewport.prototype.extentChanged = function (child, position, extentChange) { 
    ///<summary>Informs the viewport that content has changed in size, or been created/deleted.  The viewport will
    ///adjust its scroll position as necessary to avoid shifts in the view when those changes occur outside the
    ///viewport</summary>
    ///<param name="child" type="P.Viewport" />
    ///<param name="position" type="Number">The location at which the change occured</param>
    ///<param name="extentChange" type="Number">The amount by which the extent changed: many be positive or negative</param>
    var parentViewport = /*@static_cast(P.Viewport)*/this.getParent();
    parentViewport.extentChanged(child, position, extentChange);
};
P.Viewport.prototype.contentReadyAsync = function () {
    /// <summary> Returns a promise containing an array elements that should animate during an entrance animation.
    /// Default behavior is to join all the promises of the viewport's children and return that</summary>
    var promises = this._children.map(function (/*@type(P.Viewport)*/child) { 
        return child.contentReadyAsync(); 
    });
    Debug.assert(promises.every(function (p) { return !Jx.isNullOrUndefined(p); }));
    if (promises.length > 1) {
        return WinJS.Promise.join(promises).then(function (/*@type(Array)*/listOfLists) {
            // Flatten the list.
            var /*@type(Array)*/ flattenedList = P.Sequence.flatten(listOfLists);
            // Assert we are given elements or arrays of them
            Debug.assert(flattenedList.every(function (/*@type(Array)*/e) { 
                return Jx.isHTMLElement(e) || (Jx.isArray(e) && e.every(Jx.isHTMLElement)); 
            }));
            return flattenedList;
        });
    } else {
        return promises.length > 0 ? promises[0] : [];
    }
};
P.Viewport.prototype.onEnterComplete = function () {
    this._children.forEach(function (/*@type(ViewportChild)*/child) {
        if (child.onEnterComplete) {
            Debug.assert(Jx.isFunction(child.onEnterComplete));
            child.onEnterComplete();
        }
    });
};
P.Viewport.prototype.getScrollPosition = function () {
    ///<summary>Indicates the current position of the viewport over the pannable surface.  Equal to the last
    ///value passed to ViewportChild.scroll.</summary>
    ///<returns type="Number"/>
    var parentViewport = /*@static_cast(P.Viewport)*/this.getParent();
    return parentViewport.getScrollPosition();
};
P.Viewport.prototype.getViewportExtent = function () {
    ///<summary>Returns the size of the viewport in the scrolling direction.  The child can use this information to
    ///determine its clipping region</summary>
    ///<returns type="Number"/>
    var parentViewport = /*@static_cast(P.Viewport)*/this.getParent();
    return parentViewport.getViewportExtent();
};
P.Viewport.prototype.getJobSet = function () {
    ///<returns type="P.JobSet">A JobSet that can be used to coordinate asynchronous activity</returns>
    var parentViewport = /*@static_cast(P.Viewport)*/this.getParent();
    return parentViewport.getJobSet();
};
P.Viewport.prototype.getOrientation = function () {
    ///<returns type="Number">A value from P.Orientation indicating the direction of scrolling (vertical/horizontal)</returns>
    var parentViewport = /*@static_cast(P.Viewport)*/this.getParent();
    return parentViewport.getOrientation();
};

});
