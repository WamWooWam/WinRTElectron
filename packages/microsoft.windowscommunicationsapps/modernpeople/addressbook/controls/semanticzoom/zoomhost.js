

//
// Copyright (C) Microsoft. All rights reserved.
//

Jx.delayDefine(People, "ZoomHost", function () {

    var P = window.People;

    P.ZoomHost = /* @constructor*/function (zoomedInViewport, zoomedInJobSet, zoomedOutJobSet, orientation, host, /* @dynamic*/options) {
        /// <param name="zoomedInViewport" type="P.ScrollingViewport" />
        /// <param name="zoomedOutJobSet" type="P.JobSet" />
        /// <param name="zoomedInJobSet" type="P.JobSet" />
        /// <param name="orientation" type="Number" />
        /// <param name="host" type="P.CpMain">The object that hosts the app.</param>
        /// <param name="options" type="Object" optional="true"> 
        /// options: {  // configuration options, defaults are as shown and can be omitted.
        ///     disableEnterKey: false, // controls whether for tiles to ignore Enter key or not 
        ///     initiallyZoomedOut: false   // true to show the zoomed out view first
        /// }
        /// </param>
        Debug.assert(Jx.isNullOrUndefined(options) || Jx.isObject(options));

        this._host = host;
        this._semanticZoomControl = /*@static_cast(WinJS.UI.SemanticZoom)*/null;
        options = options || {};
        this._initiallyZoomedOut = !!options.initiallyZoomedOut;
        this._disableEnterKey = !!options.disableEnterKey;

        // Creates the zoomed in and zoomed out view.
        var sezoOrientation = this._orientation = (orientation === P.Orientation.horizontal) ? "horizontal" : "vertical";

        // Build the zoomed out view
        var zoomedOutView = new P.ZoomedOutView(this);
        var zoomedOutViewport = this._zoomedOutViewport = new P.ScrollingViewport(zoomedOutJobSet, zoomedOutView, orientation);

        this._zoomedIn = new P.ZoomableView("zoomedIn", zoomedInViewport, sezoOrientation, zoomedInJobSet);
        this._zoomedOut = new P.ZoomableView("zoomedOut", zoomedOutViewport, sezoOrientation, zoomedOutJobSet);

        this.initComponent();
        this.appendChild(/*@static_cast(Jx.TreeNode)*/this._zoomedIn);
        this.appendChild(/*@static_cast(Jx.TreeNode)*/this._zoomedOut);
    };

    Jx.inherit(P.ZoomHost, Jx.Component);

    Object.defineProperty(P.ZoomHost.prototype, "zoomedOut", {
        get: function () {
            return !Jx.isNullOrUndefined(this._semanticZoomControl) && this._semanticZoomControl.zoomedOut;
        },
        set: function (isZoomedOut) {
            Debug.assert(!Jx.isNullOrUndefined(this._semanticZoomControl));
            this._semanticZoomControl.zoomedOut = isZoomedOut;
        }
    });

    P.ZoomHost.prototype.getUI = function (ui) {
        /// <param name="ui" type="JxUI" />
        ui.html =
            "<div id='" + this._id + "' class='semanticZoom'>" +
                Jx.getUI(this._zoomedIn).html +
                Jx.getUI(this._zoomedOut).html +
            "</div>";
    };

    P.ZoomHost.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        this._activateSemanticZoom();
    };

    P.ZoomHost.prototype.deactivateUI = function () {
        if (Jx.isFunction(this._zoomChangedHandler)) {
            this._semanticZoomControl.element.removeEventListener("zoomchanged", this._zoomChangedHandler, false);
            this._zoomChangedHandler = null;
        }
        if (Jx.isFunction(this._onZoomElementHandler)) {
            this._semanticZoomControl.element.removeEventListener("zoomOnElement", this._onZoomElementHandler, false);
            this._onZoomElementHandler = null;
        }
        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.ZoomHost.prototype._activateSemanticZoom = function () {
        var semanticZoomElement = document.getElementById(this._id);
        Jx.addClass(semanticZoomElement, "sezo-" + this._orientation);

        var semanticZoomControl = this._semanticZoomControl = new WinJS.UI.SemanticZoom(semanticZoomElement, {
            // Maps the provided zoomed out header item to an AB section & grid item.  We want the section corresponding
            // to the groupIndex of the header (0 => Social, 1 => Favorites, 2 => All).  We want the groupIndex within the grid
            // corresponding to the itemIndex of this item. (1 => 'B', 2 => 'C', ...).
            zoomedInItem: function (/* @dynamic*/item) {
                return {
                    section: item.groupIndex,
                    groupIndex: item.itemIndex,
                    itemIndex: 0
                };
            },
            // Maps the provided zoomed In item to a zoomed out header.  We want the group corresponding to the section
            // (Social => 0, Favorites => 1, All => 2).  We want the header's itemOffset to correspond to this item's groupIndex:
            // ('B' => 1, 'C' => 2, ...).
            zoomedOutItem: function (/* @dynamic*/item) {
                return {
                    groupIndex: item.section,
                    itemIndex: item.groupIndex
                };
            },

            initiallyZoomedOut: this._initiallyZoomedOut
        });
        semanticZoomControl.element.addEventListener("zoomchanged", this._zoomChangedHandler = this._zoomChanged.bind(this), false);
        semanticZoomControl.element.addEventListener("zoomOnElement", this._onZoomElementHandler = this._zoomOnElement.bind(this), false);
        var zoomButton = semanticZoomElement.querySelector(".win-semanticzoom-button");
        Debug.assert(Jx.isHTMLElement(zoomButton));
        if (Jx.isHTMLElement(zoomButton)) {
            // The default type of button element is "submit", explicitly set type to "button"
            // to prevent the semantic zoome button from stealing "enter" key events.
            zoomButton.type = "button";
        }
    };

    P.ZoomHost.prototype._zoomChanged = function () {
        this._host.zoomChanged(this.zoomedOut);
    };

    P.ZoomHost.prototype._zoomOnElement = function (/* @dynamic*/ev) {
        /// <param name="ev" type="Object" optional="false"> 
        /// ev.detail: {  
        ///     originalEvent: Event // keydown or click event
        ///     zoomDirection: String // in or out
        /// }
        /// </param>
        var origEv = /*@static_cast(Event)*/ev.detail.originalEvent;
        if (!Jx.isNullOrUndefined(origEv.key) && (origEv.key === "Spacebar" || (origEv.key === "Enter" && !this._disableEnterKey))) {
            origEv.stopPropagation();
            origEv.preventDefault();
        } else if (origEv.key) {
            // This was a keypress but not space or enter so ignore it
            return;
        }

        var triggerZoom = null,
            zoomDirection = ev.detail.zoomDirection;

        triggerZoom = (zoomDirection === P.ZoomableHeader.Direction.zoomIn ? this._zoomedOut : this._zoomedIn).getTriggerZoom();
        Debug.assert(Jx.isFunction(triggerZoom));
        triggerZoom();
        Jx.log.info("ZoomHost._zoomOnElement: triggerZoom, " + zoomDirection);
    };

    P.ZoomHost.prototype.getCollection = function () {
        var collection = new P.ArrayCollection("SemanticZoom");
        var addToCollection = function (/* @dynamic*/child) {
            if (child.appendSemanticZoomCollection) {
                child.appendSemanticZoomCollection(collection);
            } else {
                child.forEachChild(addToCollection, this);
            }
        };
        this.forEachChild(addToCollection, this);
        collection.loadComplete();
        return collection;
    };

    P.ZoomHost.prototype.hydrateZoomedOutViewport = function () {
        return this._zoomedOutViewport.hydrate(null);
    };

    P.ZoomHost.create = function (viewport, zoomedInJobSet, zoomedOutJobSet, orientation, /*@dynamic*/host, /*@dynamic*/options, parentElement) {
        ///<summary>Factory function for semantic zoom: creates a semantic zoom control over an existing viewport</summary>
        ///<param name="viewport" type="P.ScrollingViewport"/>
        ///<param name="zoomedInJobSet" type="P.JobSet"/>
        ///<param name="zoomedOutJobSet" type="P.JobSet"/>
        ///<param name="orientation" type="Number"/>
        ///<param name="host" type="Object"/>
        ///<param name="options" type="Object"/>
        ///<param name="parentElement" type="HTMLElement"/>

        // Record the focus and scroll position, as they are lost several times during this reparenting and during Semantic Zoom's
        // own reparenting and intermediate layouts
        var activeElement = document.activeElement;
        viewport.freeze();

        // Remove the existing viewport from the HTML tree, it'll be re-added in the right spot when we activate the ZoomHost
        parentElement.removeChild(viewport.getElement());

        // Create the semantic zoom host as a parent of the viewport
        var zoomhost = new P.ZoomHost(viewport, zoomedInJobSet, zoomedOutJobSet, orientation, host, options);

        // Add the zoom host to the HTML tree
        var ui = Jx.getUI(zoomhost);
        parentElement.innerHTML = ui.html;

        // Activate the UI, initializing the semantic zoom control
        zoomhost.activateUI();

        // Restore the focus and scroll position now that the UI has been rearranged
        if (Jx.isHTMLElement(activeElement) && document.activeElement !== activeElement) {
            Jx.safeSetActive(activeElement);
        }
        viewport.thaw();

        // Begin building the zoomed-out view
        zoomhost.hydrateZoomedOutViewport();

        return zoomhost;
    };

});
