
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/Accounts/AccountDialog.js"/>
/// <reference path="../Controls/Viewport/Viewport.js"/>
/// <reference path="../Controls/Viewport/ScrollingViewport.js"/>
/// <reference path="../../AppFrame/main.js"/>

Jx.delayDefine(People, "ViewportPage", function () {

    var P = window.People;

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var ViewportPage = P.ViewportPage = /* @constructor*/function (host, options) {
        ///<summary>Base class for a page that is a viewport.</summary>
        ///<param name="host" type="P.CpMain">The object that hosts the viewport.</param>
        ///<param name="options" type="Object" optional="true">Unused</param>
        this._host = host;
        $include("$(cssResources)/AddressBook.css");
    };
    ViewportPage.prototype.load = function (/*@dynamic*/params) {
        ///<summary>Loads the page into the view.</summary>
        var host = this._host;
        var parentJobSet = /*@static_cast(P.JobSet)*/host.getJobSet();
        var jobSet = this._jobSet = parentJobSet.createChild();

        
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        if (Boolean(Debug) && Debug.abLoad) {
            Debug.abLoad = false;
            msSetImmediate(this.load.bind(this, params));
            return WinJS.Promise.wrap({});
        }
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        

        var element = this._element = params.element;
        Debug.assert(Jx.isHTMLElement(element));
        if (this._semanticZoomActivated) {
            Jx.addClass(element, "semanticZoomEnabled");
        }

        // Get the current layout state
        var layout = this._layout = host.getLayout();
        var layoutState = this._layoutState = layout.getLayoutState();
        var orientation = this._orientation = (layoutState === P.Layout.layoutState.snapped) ? P.Orientation.vertical : P.Orientation.horizontal;
        Jx.addListener(layout, layout.layoutChanged, this._onLayoutChange, this);

        // Add the commands
        host.getCommandBar().addCommand(
            new P.Command("addContact", "/strings/abAddContactCommandText", "/strings/abAddContactCommandTooltip",
                "\uE109", true, true, null, null, P.Nav.getCreateContactUri()));

        var zoomedOutJobSet = this._zoomedOutJobSet = parentJobSet.createChild();
        jobSet.setOrder(0);
        zoomedOutJobSet.setOrder(1);

        // Create the components
        var child = this._createViewportChild(params.data, params.fields);
        var viewport = this._viewport = new P.ScrollingViewport(jobSet, child, orientation);
        this._initViewportChild(child, orientation);

        // Add the UI to the view
        NoShip.People.etw("abBuildHtml_start");
        var ui = Jx.getUI(viewport);
        element.innerHTML = ui.html;
        viewport.activateUI();
        NoShip.People.etw("abBuildHtml_end");
        Jx.mark("People.Viewport.load:abBuildHtml,StopTA,People"); 

        NoShip.People.etw("abHydrate_start");
        Jx.mark("People.Viewport.load:abHydrate,StartTA,People");
        viewport.hydrate(params.state, !(params.fields && params.fields.pos === "home"));
        NoShip.People.etw("abHydrate_end");
        Jx.mark("People.Viewport.load:abHydrate,StopTA,People");
        if (this._semanticZoomActivated && params.isZoomedOut) {
            this._initializeSemanticZoom(true);
        }
        var viewportContent = viewport.contentReadyAsync();

        var getAnimationData = function (elements) {
            return {
                elements: elements,
                // Prevent the Semantic Zoom DOM manipulation from interfering with exit/enter animations
                onEnterComplete: /*@bind(ViewportPage)*/function () {
                    if (viewport === this._viewport) { // If we snap/unsnap before this event arrives, we should ignore this event.
                        if (this._semanticZoomActivated && !params.isZoomedOut) {
                            this._jobSet.addUIJob(this, this._initializeSemanticZoom, [false], P.Priority.semanticZoom);
                        }
                        viewport.onEnterComplete();
                    }
                }
            };
        };

        return WinJS.Promise.as(viewportContent).then(getAnimationData);
    };

    ViewportPage.prototype._initializeSemanticZoom = function (isZoomedOut) {
        ///<summary>Initializes the semantic zoom control on the page</summary>
        ///<param name="isZoomedOut" type="Boolean">Whether to enter the page in an initially zoomed state</param>

        // It's possible the user navigated away from the page and our element is no longer in the UI
        if (document.getElementById(this._element.id)) {
            var options = { initiallyZoomedOut: isZoomedOut };
            this._zoom = P.ZoomHost.create(this._viewport, this._jobSet, this._zoomedOutJobSet, this._orientation, this._host, options, this._element);
        }
    };
    ViewportPage.prototype.resetScrollPosition = function () {
        ///<summary>Reset scroll position to zero</summary>
        if (this._viewport !== null) {
            this._viewport.setScrollPosition(0);
        }
    };
    ViewportPage.prototype.prepareSaveState = function () {
        /// <summary>Dehydrate the control</summary>
        /// <returns type="Object"/>
        if (this._viewport !== null) {
            return this._viewport.dehydrate();
        } else {
            return null;
        }
    };
    ViewportPage.prototype.prepareSuspension = function () {
        /// <summary>All the data is stored in prepareSaveState</summary>
        /// <returns type="Object"/>
        return null;
    };
    ViewportPage.prototype.activate = function () {
        ///<summary>Called when the page is activated</summary>
    };
    ViewportPage.prototype.deactivate = function () {
        /// <summary>Called when the page is deactivated</summary>
        /// <returns type="Boolean">Indicates whether it is okay to proceed with navigation</returns>
        var jobSet = this._jobSet,
            zoomedOutJobSet = this._zoomedOutJobSet;
        if (jobSet) {
            jobSet.cancelAllChildJobs();
        }
        if (zoomedOutJobSet) {
            zoomedOutJobSet.cancelAllChildJobs();
        }
        if (this._layout !== null) {
            Jx.removeListener(this._layout, this._layout.layoutChanged, this._onLayoutChange, this);
            this._layout = null;
        }
        this._unhookNavigationCompletedEvent();
        return true;
    };
    ViewportPage.prototype.unload = function () {
        ///<summary>Called asynchronously, after the control has been unloaded</summary>
        var root = /*@static_cast(Jx.Component)*/this._zoom || this._viewport;
        if (root !== null) {
            root.shutdownUI();
            root.shutdownComponent();
        }
        this._zoom = null;
        this._viewport = null;
        Jx.dispose(this._jobSet);
        Jx.dispose(this._zoomedOutJobSet);
        this._jobSet = this._zoomedOutJobSet = null;
        this._element = null;
    };
    ViewportPage.prototype._onLayoutChange = function () {
        ///<summary>Changing layouts simulates a navigation to reload the tree</summary>
        var host = this._host;
        if (host.isNavigating()) {
            // If navigation is happening, postpone page reload until navigation is completed.
            if (!this._navigationCompletedListener) {
                this._navigationCompletedListener = this._onNavigationCompleted.bind(this);
                Jx.addListener(host, host.navigationCompleted, this._navigationCompletedListener, null);
            }
        } else {
            this._reload();
        }
    };
    ViewportPage.prototype._onNavigationCompleted = function () {
        ///<summary>Navigation completed event handler</summary>
        this._unhookNavigationCompletedEvent();
        this._reload();
    };
    ViewportPage.prototype._unhookNavigationCompletedEvent = function () {
        ///<summary>Unhook navigation completed event</summary>
        if (this._navigationCompletedListener) {
            var host = this._host;
            Jx.removeListener(host, host.navigationCompleted, this._navigationCompletedListener, null);
            this._navigationCompletedListener = null;
        }
    };

    ViewportPage.prototype._reload = function () {
        ///<summary>Reload the control</summary>
        var element = this._element;
        var isZoomedOut = !Jx.isNullOrUndefined(this._zoom) && this._zoom.zoomedOut;
        var state = this.prepareSaveState();
        this.deactivate();
        this.unload();

        var that = this;
        var contentAnimationData = this.load({ element: element, state: state, isZoomedOut: isZoomedOut });
        WinJS.Promise.wrap(contentAnimationData).done(function (/*@dynamic*/contentResult) {
            Debug.assert(contentResult && contentResult.onEnterComplete);
            contentResult.onEnterComplete.call(that);
        });

        this.activate();
        this._host.getCommandBar().refresh();
    };

    
    ViewportPage.prototype._initViewportChild = function (child, orientation) {
        Debug.assert(false, "Derived classes must implement");
    };
    ViewportPage.prototype._createViewportChild = function (data, fields) {
        ///<returns type="ViewportChild" />
        Debug.assert(false, "Derived classes must implement");
    };
    ViewportPage.prototype._getViewportChild = function (orientation, data) {
        ///<summary>Derived classes must provide the section(s) to populate the viewport</summary>
        ///<param name="orientation">Scroll orientation, e.g. vertical or horizontal</param>
        ///<param name="data">The params.data value provided when the control is loaded</param>
        ///<returns type="P.Section" />
        Debug.assert(false, "Derived classes must implement");
    };
    ViewportPage.prototype.save = function () {
        ///<summary>Not applicable</summary>
        ///<returns type="Boolean"/>
        Debug.assert(false, "Page does not support save");
    };
    

    ViewportPage.prototype._host = /* @static_cast(P.CpMain)*/null;
    ViewportPage.prototype._element = /* @static_cast(HTMLElement)*/null;
    ViewportPage.prototype._viewport = /* @static_cast(P.ScrollingViewport)*/null;
    ViewportPage.prototype._jobSet = /* @static_cast(P.JobSet)*/null;
    ViewportPage.prototype._zoom = /* @static_cast(P.ZoomHost)*/null;
    ViewportPage.prototype._semanticZoomActivated = false;
    ViewportPage.prototype._navigationCompletedListener = null;
});
