
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js" />
/// <reference path="../../../Shared/ShareSource/ShareSource.js" />
/// <reference path="PanelView.ref.js"/>
/// <reference path="LandingPage.ref.js" />
/// <reference path="../../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../AppFrame/Main.js"/>
/// <reference path="../../../AppFrame/People.js"/>
/// <reference path="PanelView.js"/>
/// <reference path="../../../Shared/Platform/PlatformObjectBinder.js"/>
/// <reference path="../../../Shared/IdentityControl/IdentityControl.js"/>
/// <reference path="../../../Shared/IdentityControl/FriendOfFriend.ref.js"/>
/// <reference path="../../../Shared/Accounts/AccountSettings.js"/>
/// <reference path="ContactPanel.js"/>
/// <dictionary>params,upsell</dictionary>

Jx.delayDefine(People, "LandingPage", function () {

    var P = window.People;
    
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var LandingPage = P.LandingPage = /* @constructor*/function (host, options) {
        ///<summary>The landing page provides a high level summary of a person or the me contact, in the form of 
        /// a series of small panels.</summary>
        ///<param name="host" type="P.CpMain"/>
        ///<param name="options" type="Object" optional="true">Unused</param>
        this._host = host;
        this._panelView = /*@static_cast(P.PanelView)*/null;
        $include("$(cssResources)/LandingPage.css");
    };
    LandingPage.prototype.load = function (/*@dynamic*/params) {
        ///<summary>Loads the page into the view.</summary>
        Debug.assert(Jx.isObject(params));
        Debug.assert(Jx.isObject(params.data));

        Debug.assert(!this._panelView);
        var jobSet = this._jobSet = this._host.getJobSet().createChild();
        this._panelView = new P.PanelView(this._host, jobSet, params.data, params.fields, params.context, params.state, [
            new PeoplePanelProvider(),
            new SocialPanelProvider()
        ]);
        this._panelView.initUI(params.element);

        if (params.data.objectType === "MeContact") {
            Jx.addClass(params.element, "meLandingPage");
        }

        // Register to Share this person.
        this._shareCallback = P.ShareSource.sharePersonCallback.bind(this, params.data);
        var app = /*@static_cast(P.App)*/Jx.app;
        app.addListener("sharesourcedatarequested", this._shareCallback);

        return { elements: this._panelView.getPanelElements(), onEnterComplete: this.onEnterComplete };
    };
    LandingPage.prototype.update = function (/*@dynamic*/params) {
        ///<summary>If you navigate directly from one profile page to another (by leaving the app and invoking deep linking 
        ///or pinning), the same instance of this control will be reused.</summary>
        this.unload();
        this.load(params);
    };
    LandingPage.prototype.activate = function () {
        ///<summary>Called when the page is activated</summary>
    };
    LandingPage.prototype.onEnterComplete = function () {
        ///<summary>Called when the entrance animation has completed.  Useful for coordinating animations.</summary>
        this._panelView.onEnterComplete();
    };
    LandingPage.prototype.prepareSaveState = function () {
        /// <summary>Dehydrate the control</summary>
    };
    LandingPage.prototype.prepareSaveBackState = function () {
        /// <summary>Saves the back-state for the current control</summary>
        /// <returns type="Object"/>
        return this._panelView.prepareSaveBackState();
    };
    LandingPage.prototype.prepareSuspension = function () {
        /// <summary>All data the is stored in prepareSaveState</summary>
        /// <returns type="Object"/>
        return this._panelView.suspend();
    };
    LandingPage.prototype.scrollToBeginning = function () {
        /// <summary>Scroll to beginning of page</summary>
        this._panelView.scrollToBeginning();
    };
    LandingPage.prototype.deactivate = function () {
        /// <summary>Called when the page is deactivated</summary>
        /// <returns type="Boolean">Indicates whether it is okay to proceed with navigation</returns>
        if (this._jobSet) {
            this._jobSet.cancelAllChildJobs();
        }
        // Reset edit mode for this page to its default before leaving - it will get set whenever we enter for edit
        P.Nav.Pages.viewperson.isEdit = false;
        return true;
    };
    LandingPage.prototype.unload = function () {
        ///<summary>Called when the control is unloaded</summary>
        if (this._panelView) {
            this._panelView.shutdownUI();
            this._panelView.shutdownComponent();
            this._panelView = null;
        }

        if (this._shareCallback) {
            var app = /*@static_cast(P.App)*/Jx.app;
            app.removeListener("sharesourcedatarequested", this._shareCallback);
            this._shareCallback = null;
        }

        Jx.dispose(this._jobSet);
        this._jobSet = null;
    };
    
    LandingPage.prototype.save = function () {
        ///<summary>Not applicable</summary>
        ///<returns type="Boolean"/>
        Debug.assert(false, "Page does not support save");
    };
    

    LandingPage.prototype._shareCallback = null;


    function PeoplePanelProvider() {
        ///<summary>The people panel provider only adds one panel: the ContactPanel</summary>
    }
    PeoplePanelProvider.prototype.load = function (host, person, fields, hydrationData) {
        ///<summary>Called at startup to add the panel to the page</summary>
        ///<param name="host" type="P.PanelView"/>
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        ///<param name="fields" type="Object">The data parsed from the URI</param>
        ///<param name="hydrationData" type="Object">Data returned from the last call to suspend</param>
        host.addPanel(new P.ContactPanel(host, person, fields));
    };
    PeoplePanelProvider.prototype.suspend = function (hydrationData) {
        ///<summary>Called before suspension. No action is taken.</summary>
    };
    PeoplePanelProvider.prototype.unload = function () {
        ///<summary>Called at shutdown. Panels will be removed automatically.</summary>
    };
    
    function SocialPanelProvider() {
        ///<summary>The social panel provider wraps the real P.RecentActivity.UI.Host.LandingPagePanelProvider, and adds
        /// an upsell panel when necessary</summary>
        this._panels = 0;
        this._provider = /*@static_cast(P.PanelProvider)*/new P.RecentActivity.UI.Host.LandingPagePanelProvider();
        this._upsellPanel = null;
    }
    SocialPanelProvider.prototype.load = function (host, person, fields, hydrationData) {
        ///<summary>Called at startup to add panels to the page</summary>
        ///<param name="host" type="P.PanelView"/>
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        ///<param name="fields" type="Object">The data parsed from the URI</param>
        ///<param name="hydrationData" type="Object">Data returned from the last call to suspend</param>
        this._upsellEnabled = (person.objectType === "MeContact");
        this._host = host;
        this._provider.load(this, person, fields, hydrationData);
        this._checkForUpsell();
    };
    SocialPanelProvider.prototype.suspend = function (hydrationData) {
        this._provider.suspend(hydrationData);
    };
    SocialPanelProvider.prototype.unload = function () {
        this._provider.unload();
    };
    SocialPanelProvider.prototype.addPanel = function (panel) {
        ///<param name="panel" type="P.Panel"/>
        this._host.addPanel(panel);
        this._panels++;
        this._checkForUpsell();
    };
    SocialPanelProvider.prototype.removePanel = function (id) {
        ///<param name="id" type="String"/>
        Debug.assert(Jx.isNonEmptyString(id));
        Debug.assert(this._panels > 0);
        var found = this._host.removePanel(id);
        if (found) {
            this._panels--;
            this._checkForUpsell();
        }
        return found;
    };
    SocialPanelProvider.prototype.getJobSet = function () {
        ///<returns type="P.JobSet"/>
        return this._host.getJobSet();
    };
    SocialPanelProvider.prototype.getPlatform = function () {
        ///<returns type="Microsoft.WindowsLive.Platform.Client"/>
        return this._host.getPlatform();
    };
    SocialPanelProvider.prototype.getCommandBar = function () {
        ///<returns type="P.CpCommandBar"/>
        return this._host.getCommandBar();
    };
    SocialPanelProvider.prototype._checkForUpsell = function () {
        if (this._upsellEnabled) {
            if (this._panels === 0 && this._upsellPanel === null) {
                this._upsellPanel = new UpsellPanel(this._host);
                this._host.addPanel(this._upsellPanel);
            } else if (this._panels !== 0 && this._upsellPanel !== null) {
                this._host.removePanel(this._upsellPanel.id);
                this._upsellPanel = null;
            }
        }
    };

    function UpsellPanel(host) {
        /// <summary>A panel that encourages the user to add accounts</summary>
        /// <param name="host" type="P.PanelView"/>
        this._host = host;
    }
    UpsellPanel.prototype._element = null;
    UpsellPanel.prototype._upsellHandler = null;
    UpsellPanel.prototype.id = "upsellPanel";
    UpsellPanel.prototype.className = "panelView-inactivePanel landingPage-upsellPanel";
    UpsellPanel.prototype.position = P.PanelView.PanelPosition.upsellPanel;
    UpsellPanel.prototype.getUI = function () {
        /// <returns type="String">The HTML for this panel</returns>
        return "<div class='landingPage-upsellContent'>" + 
                   "<div class='landingPage-upsellPrimary'>" + 
                       Jx.escapeHtml(Jx.res.getString("/landingPage/upsellTitle")) +
                   "</div>" +
                   "<div class='landingPage-upsellSecondary'>" + 
                       Jx.escapeHtml(Jx.res.getString("/strings/raPSAUpsellText")) +
                   "</div>" +
                   "<div class='landingPage-upsellButton' tabindex='0' role='button'>" +
                       Jx.escapeHtml(Jx.res.getString("/accountsStrings/upsellOK")) +
                   "</div>" +
               "</div>";
    };
    UpsellPanel.prototype.activateUI = function (element) {
        ///<param name="element" type="HTMLElement"/>
        Debug.assert(Jx.isHTMLElement(element));
        this._element = element;
        var upsell = element.querySelector(".landingPage-upsellButton");
        var upsellHandler = function (host, evt) {
            /// <param name="host" type="P.PanelView"/>
            /// <param name="evt" type="Event"/>
            if (evt.type === "click" || 
                (evt.type === "keyup" && (evt.key === "Spacebar" || evt.key === "Enter"))) {
                P.Accounts.showAccountSettingsPage(
                    host.getPlatform(),
                    Microsoft.WindowsLive.Platform.ApplicationScenario.people,
                    P.Accounts.AccountSettingsPage.upsells,
                    { launchedFromApp: true }
                );
            }
        };
        this._upsellHandler = upsellHandler.bind(this, this._host);
        upsell.addEventListener("click", this._upsellHandler, false);
        upsell.addEventListener("keyup", this._upsellHandler, false);
    };
    UpsellPanel.prototype.ready = function () { };
    UpsellPanel.prototype.suspend = function () { };
    UpsellPanel.prototype.deactivateUI = function () {
        if (this._upsellHandler && this._element) {
            var upsell = this._element.querySelector(".landingPage-upsellButton");
            if (upsell) {
                upsell.removeEventListener("click", this._upsellHandler, false);
                upsell.removeEventListener("keyup", this._upsellHandler, false);
            }
            this._upsellHandler = null;
            this._element = null;
        }
    };

});
