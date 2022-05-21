
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../Controls/Viewport/Viewport.js"/>
/// <reference path="../Controls/Scheduler/Scheduler.js"/>
/// <reference path="../Controls/Collections/ArrayCollection.js"/>

Jx.delayDefine(People, "Section", function () {
    
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        U = WinJS.Utilities;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.Section = /* @constructor*/function (sectionName, title) {
        ///<summary>The base section implementation handles loading the header and the content area, and managing the width of the section</summary>
        ///<param name="sectionName" type="String"/>
        P.Viewport.call(this);
        this.name = sectionName;
        this.title = title;
    };
    Jx.inherit(P.Section, People.Viewport);
    P.Section.prototype.getUI = function (ui) {
        ///<summary>A Jx.Component method to generate the HTML</summary>
        ///<param name="ui" type="JxUI" />
        ui.html = "<div id='" + this._id + "' class='section sectionHidden " + this.name + "'>" +
                      "<div class='sectionContent'>" +
                          this.getContent() +
                      "</div>" +
                  "</div>";
    };
    P.Section.prototype.activateUI = function () {
        ///<summary>Called after the HTML has been instantiated.</summary>
        var sectionElement = this._sectionElement = document.getElementById(this._id);
        var element = this._contentElement = sectionElement.querySelector(".sectionContent");

        var parentSection = /*@static_cast(P.Section)*/this.getParent();
        var extent = parentSection.getOrientation() === P.Orientation.horizontal ? U.getTotalWidth(element) : U.getTotalHeight(sectionElement);
        this.extentChanged(this, 0, extent);
    };
    P.Section.prototype.hydrateExtent = function (data) {
        Jx.mark("People.Section.Render,StartTM,People");
    };
    P.Section.prototype.render = function () {
        ///<summary>The base section implementation just makes the section visible when rendered.  Derived types will do more creation of UX inside this._contentElement</summary>
        var jobSet = this._perfJobSet = this.getJobSet().createChild();
        jobSet.setOrder(Number.MAX_VALUE);
        jobSet.addUIJob(this, /* @bind(P.Section)*/function () { Jx.mark("People.Section.Render:abLoadSection_lowFidelity,Info,People"); }, null, P.Priority.perfLowFidelity);
        jobSet.addUIJob(this, /* @bind(P.Section)*/function () { Jx.mark("People.Section.Render,StopTM,People"); }, null, P.Priority.perfHighFidelity);
        Jx.removeClass(this._sectionElement, "sectionHidden");
    };
    P.Section.prototype.extentChanged = function (child, position, extentChange) {
        ///<summary>Called when the content changes size.  Tracks that size in this._extent</summary>
        ///<param name="child" type="P.Section">Passthrough to base class</param>
        ///<param name="position" type="Number">Passthrough to base class</param>
        ///<param name="extentChange" type="Number">The amount by which the size is changing</param>
        Debug.assert(this._extent + extentChange >= 0);

        this._extent += extentChange;
        if (!this._hidden) {
            P.Viewport.prototype.extentChanged.call(this, child, position, extentChange);
            this._updateJobSetVisibility();
        }
    };
    P.Section.prototype.extentReady = function (child) {
        /// <param name="child" type="P.Section" />
        Jx.mark("People.Section.extentReady:abLoadSection_layout,Info,People");
        P.Viewport.prototype.extentReady.call(this, child);
    };
    P.Section.prototype.getSectionExtent = function () { 
        ///<summary>Returns the current size of the section</summary>
        return this._extent;
    };
    P.Section.prototype.scroll = function (position, change) {
        ///<summary>Called when the viewport is scrolled</summary>
        this._updateJobSetVisibility();
    };
    P.Section.prototype.resize = function () {
        ///<summary>Called when the viewport is resized</summary>
        this._updateJobSetVisibility();
    };
    P.Section.prototype.hide = function () {
        ///<summary>Hides the section from view</summary>
        Debug.assert(!this._hidden);
        if (!this._hidden) {
            this._hidden = true;
            this._sectionElement.style.display = "none";
            P.Viewport.prototype.extentChanged.call(this, /* @static_cast(P.Section)*/this, 0, 0 - this._extent);
        }
    };
    P.Section.prototype.show = function () {
        ///<summary>Restores the section from a hidden state</summary>
        Debug.assert(this._hidden);
        if (this._hidden) {
            this._hidden = false;
            this._sectionElement.style.display = "";
            P.Viewport.prototype.extentChanged.call(this, /* @static_cast(P.Section)*/this, 0, this._extent);
        }
    };
    P.Section.prototype.isHidden = function () {
        ///<summary>Reports whether or not the section was hidden by a call to hide</summary>
        ///<returns type="Boolean"/>
        return this._hidden;
    };
    P.Section.prototype.shutdownComponent = function () {
        P.Viewport.prototype.shutdownComponent.call(this);
        if (this._perfJobSet) {
            this._perfJobSet.dispose();
            this._perfJobSet = null;
        }
    };
    P.Section.prototype.appendSemanticZoomCollection = function (collection) {
        /// <summary>Returns an empty collection and should be overriden in sections that want to participate in semantic zoom. </summary>
        /// <param name="collection" type="P.ArrayCollection" />
        var localCollection = new P.ArrayCollection(this.name);
        localCollection.loadComplete();
        collection.appendItem({
            collection: localCollection
        });
    };
    P.Section.prototype.getContent = function () {
        /// <summary>Optionally return static content for this section</summary>
        return "";
    };
    P.Section.prototype.isInView = function () { 
        var scrollPosition = this.getScrollPosition();
        return this._extent > scrollPosition &&  
               scrollPosition + this.getViewportExtent()  > 0;
    };
    P.Section.prototype._updateJobSetVisibility = function () {
        // Don't toggle off visibility of sections that are hidden, they may just be waiting for content to show.
        // Just turn it off if they are outside the viewport.
        this.getJobSet().setVisibility(this.isInView());
    };
    P.Section.prototype.name = /* @static_cast(String)*/ null;
    P.Section.prototype._sectionElement = /* @static_cast(HTMLElement)*/null;
    P.Section.prototype._contentElement = /* @static_cast(HTMLElement)*/null;
    P.Section.prototype._extent = 0;
    P.Section.prototype._hidden = false;
    P.Section.prototype._perfJobSet = /*@static_cast(P.JobSet)*/null;
});

