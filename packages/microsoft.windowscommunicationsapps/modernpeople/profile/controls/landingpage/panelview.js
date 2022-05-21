
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../AppFrame/Main.js"/>
/// <reference path="PanelView.ref.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
/// <dictionary>suspendable,upsell</dictionary>

Jx.delayDefine(People, "PanelView", function () {

    var P = window.People;

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var PanelView = P.PanelView = /*@constructor*/function (host, jobSet, person, fields, hydrationData, state, panelProviders) {
        /// <summary>The panel view provides a hosting API for a page that is composed of a series of horizontally flowing panels.
        /// Panels are added to the page through its hosting interface by PanelProviders, and can be added and removed dynamically
        /// in response to changing data.</summary>
        /// <param name="host" type="P.CpMain"/>
        /// <param name="jobSet" type="P.JobSet"/>
        /// <param name="person"/>
        /// <param name="fields" type="Object">The data parsed from the URI</param>
        /// <param name="hydrationData" type="Object">Data returned by a previous call to suspend</param>
        /// <param name="state" type="Object">Data returned by a previous call to prepareSaveBackState</param>
        /// <param name="panelProviders" type="Array">The providers that will populate this view with panels</param>
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isObject(jobSet));
        Debug.assert(Jx.isObject(person));
        Debug.assert(Jx.isArray(panelProviders));

        this._host = /*@static_cast(P.CpMain)*/host;
        this._person = person;
        this._fields = fields;
        this._panelProviders = /*@static_cast(Array)*/panelProviders;
        this._panels = [
            new PaddingPanel(Number.POSITIVE_INFINITY)
        ];
        this._jobSet = jobSet;
        this._element = /*@static_cast(HTMLElement)*/null;
        this._viewport = /*@static_cast(HTMLElement)*/null;
        this._hydrationData = hydrationData || state;
        this.initComponent();
    };
    Jx.inherit(PanelView, Jx.Component);
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    PanelView.prototype.getUI = function (ui) {
        ///<summary>Jx.component method, retrieves HTML for this component</summary>
        Debug.assert(Jx.isObject(ui));

        this._panelProviders.forEach(/*@bind(PanelView)*/function (/*@type(P.PanelProvider)*/panelProvider) {
            panelProvider.load(this, this._person, this._fields, this._hydrationData);
        }, this);

        ui.html = "<div id='" + this._id + "' class='panelView-viewport'>" + 
                    "<div class='panelView-canvas'>" +
                       this._panels.map(getPanelUI).join("") +
                    "</div>" +
                  "</div>";
    };

    PanelView.prototype.activateUI = function () {
        ///<summary>Jx.component method, called after the HTML for this component has been added to the document</summary>
        var viewport = this._viewport = document.getElementById(this._id);
        this._element = viewport.firstChild;
        Debug.assert(this._element);
        this._panels.forEach(activatePanel);

        if (this._host.getLayoutState() !== P.Layout.layoutState.snapped) {
            // Prepare panels to populate slow content.  This is fine normally, but in snap it may cause the panels to reflow and that will conflict with our entrance
            // animation.  So we'll wait in that case.  But only that case:  waiting for the animation means the data shows up later.
            this._scheduleReady();
        }

        var hydration = this._hydrationData;
        if (hydration) {
            var savedViewport = /*@static_cast(P.PanelViewscrollPos)*/hydration["viewport"];
            if (Jx.isObject(savedViewport)) {
                var property = this._getScrollProperty();
                if (savedViewport[property]) {
                    viewport[property] = savedViewport[property];
                }
            }
        }
    };

    PanelView.prototype.onEnterComplete = function () {
        // Now that the entrance animation has completed, we can safely reflow panels.  So if we skipped the ready calls
        // in activateUI, we can run them now.
        this._scheduleReady();
    };

    PanelView.prototype.getPanelElements = function () {
        /// <summary> Return the list of panel elements in our UI. </summary>
        return Array.prototype.slice.call(this._element.querySelectorAll(".panelView-panel:not(.panelView-paddingPanel)"));
    };
    
    PanelView.prototype._getScrollProperty = function () {
        /// <summary>Returns the scroll property based on view state</summary>
        /// <returns type="String"/>        
        return (this._host.getLayoutState() === P.Layout.layoutState.snapped) ? "scrollTop" : "scrollLeft";
    };

    PanelView.prototype.prepareSaveBackState = function () {
        /// <summary>Saves the scroll position to be used for back navigation</summary>
        /// <returns type="Object"/>
        return this.suspend();
    };

    PanelView.prototype.suspend = function () {
        ///<summary>Saves state in preparation for app-suspension</summary>
        ///<returns type="Object">Suspension data, will be passed to the constructor when restarted</returns>
        var result = { };

        var suspend = function (/*@dynamic*/suspendable) {
            /// <summary>Because we don't have identifiers for providers and the id on a panel is optional, all of these
            /// objects will share the same hydration storage object.  The expectation is that any object implementing 
            /// hydration will do something like:  data["MyPanel"] = { ... } rather than spraying potentially conflicting
            /// names into the store.</summary> 
            var data = { };
            suspendable.suspend(data);
            Jx.mix(result, data);
        };

        this._panelProviders.forEach(suspend);
        this._panels.forEach(suspend);

        // Record the scroll position
        var property = this._getScrollProperty();
        var savedViewport = result["viewport"] = { };
        savedViewport[property] = this._viewport[property];

        return result;
    };

    PanelView.prototype.scrollToBeginning = function () {
        /// <summary>Scroll to beginning of the page</summary>
        var property = this._getScrollProperty();
        this._viewport[property] = 0;
    };

    PanelView.prototype._onReady = function () {
        ///<summary>Async method, calls ready on one panel at a time and requeues itself until all the panels are ready</summary>
        var panels = this._panels;
        for (var i = 0, len = panels.length; i < len; ++i) {
            var /*@type(P.Panel)*/panel = panels[i];
            if (panel.needsReady) {
                panel.needsReady = false;
                panel.ready();
                this._scheduleReady();
                break;
            }
        }
    };

    PanelView.prototype._scheduleReady = function () {
        /// <summary>Queues an async call to _onReady</summary>
        this._jobSet.addUIJob(this, this._onReady, null, P.Priority.panel);
    };

    function getPanelUI(panel) {
        /// <summary>Gets HTML for a panel</summary>
        /// <param name="panel" type="P.Panel"/>
        /// <returns type="String"/>

        if (!panel.id) {
            panel.id = "panel" + String(Jx.uid());
        }

        var pos = Number(panel.position);
        if (pos === Number.NEGATIVE_INFINITY) {
            // the first padding panel is positioned at the start.
            pos = 1;
        } else if (pos === Number.POSITIVE_INFINITY) {
            // the last padding panel is positioned at the end -- seeing as infinity is an invalid value 
            // we just go with the best next thing (if there are ever 1000 panels, we have bigger problems.)
            pos = 1000;
        } else {
            // panel positions start at 0, but grid columns start at 1. plus, there is the first
            // padding panel to take into account.
            pos += 2;
        }

        return "<div class='panelView-panel " + (panel.className || "") + "' id='" + panel.id + "' style='-ms-grid-column:" + String(pos) + "'>" +
                   panel.getUI() +
               "</div>";
    }

    function activatePanel(panel) {
        /// <summary>Informs a panel when it has been added to the DOM</summary>
        /// <param name="panel" type="P.Panel"/>
        panel.activateUI(document.getElementById(panel.id));
        panel.needsReady = true;
    }
   
    PanelView.prototype.addPanel = function (panel) {
        ///<summary>Adds a panel to the view, sorted by panel.position</summary>
        ///<param name="panel" type="P.Panel"/>

        // Add the panel to this._panels at the correct position
        var panelIndex = 0;
        while (panelIndex < this._panels.length &&
               this._panels[panelIndex].position < panel.position) {
            panelIndex++;
        }
        this._panels.splice(panelIndex, 0, panel);

        // If the UI has been created, add the panel to it and activate it.
        // If the UI has not been created, the panel will be added during getUI.
        if (this._element) {
            var childElements = this._element.children;

            var adjacentElement;
            var adjacentLocation;
            if (panelIndex < childElements.length) {
                adjacentElement = childElements[panelIndex];
                adjacentLocation = "beforebegin";
            } else {
                adjacentElement = this._element;
                adjacentLocation = "beforeend";
            }
            ///<disable>DeclarePropertiesBeforeUse</disable>
            adjacentElement.insertAdjacentHTML(adjacentLocation, getPanelUI(panel));
            ///<enable>DeclarePropertiesBeforeUse</enable>

            activatePanel(panel);
            this._scheduleReady();
        }
    };

    PanelView.prototype.removePanel = function (id) {
        ///<summary>Removes a panel from the view</summary>
        ///<param name="id" type="String">The panel.id value of the panel to be removed</param>
        ///<returns type="Boolean">false if the panel was not found</returns>
        var found = false;
        for (var i = 0, len = this._panels.length; i < len; i++) {
            if (this._panels[i].id === id) {
                var /*@type(P.Panel)*/panel = this._panels.splice(i, 1)[0];
                panel.deactivateUI();
                found = true;
                break;
            }
        }
        Debug.assert(found, "Panel " + id + " not found");

        if (found && this._element !== null) {
            var panelElement = document.getElementById(id);
            this._element.removeChild(panelElement);
        }

        return found;
    };

    PanelView.prototype.getJobSet = function () {
        /// <returns type="P.JobSet"/>
        return this._jobSet;
    };

    PanelView.prototype.getPlatform = function () {
        /// <returns type="Microsoft.WindowsLive.Platform.Client"/>
        return this._host.getPlatform();
    };

    PanelView.prototype.getFrameCommands = function () {
        /// <returns type="P.FrameCommands"/>
        return this._host.getFrameCommands();
    };

    PanelView.prototype.getCommandBar = function () {
        /// <returns type="P.CpCommandBar"/>
        return this._host.getCommandBar();
    };

    PanelView.prototype.getNavBar = function () {
        /// <returns type="P.CpNavBar"/>
        return this._host.getNavBar();
    };

    PanelView.prototype.getLayout = function () {
        /// <returns type="P.AppLayout"/>
        return this._host.getLayout();
    };

    PanelView.prototype.back = function (uri) {
        /// <param name="uri" type="String" optional="true"/>
        this._host.back(uri);
    };

    PanelView.prototype.deactivateUI = function () {
        ///<summary>Called when the control is unloaded</summary>
        this._element = null;

        if (this._panels) {
            this._panels.forEach(function (/*@type(P.Panel)*/panel) {
                panel.deactivateUI();
            });
        }

        this._panels = [];

        if (this._panelProviders) {
            this._panelProviders.forEach(function (/*@type(P.PanelProvider)*/panelProvider) {
                panelProvider.unload();
            });
        }

        Jx.Component.prototype.deactivateUI.call(this);
    };

    // The panel view doesn't care about the panels it contains, it just considers position to be a number.
    // But to avoid a proliferation of random constant values around the code-base, this enum exists to coordinate 
    // position values for our different panels.
    PanelView.PanelPosition = {
        contactPanel: 0,
        upsellPanel: 1,
        feedPanel: 2,
        notificationsPanel: 3,
        photosPanel: 4
    };

    function PaddingPanel(position) {
        this.position = position;
    }
    PaddingPanel.prototype = {
        className: "panelView-inactivePanel panelView-paddingPanel",
        getUI: function () { return ""; },
        activateUI: function (element) { },
        ready: function () { },
        suspend: function (hydrationData) { },
        deactivateUI: function () { }
    };

});
