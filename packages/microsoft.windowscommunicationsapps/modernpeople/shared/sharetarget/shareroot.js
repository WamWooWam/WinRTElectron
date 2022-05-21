
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JsUtil/include.js" />
/// <reference path="../JsUtil/namespace.js" />
/// <reference path="../../../shared/Jx/Core/Jx.dep.js" />
/// <reference path="../../Social/Common/Social.dep.js" />

Jx.delayDefine(People.ShareTarget, "ShareRoot", function () {

    var P = window.People;
    var R = P.RecentActivity.UI.Share;
    var S = P.ShareTarget;

    S.ShareRoot = /*@constructor*/function (ev, platform, scheduler) {
        /// <param name="ev" type="Windows.ApplicationModel.Activation.ShareTargetActivatedEventArgs"/>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        /// <param name="scheduler" type="P.Scheduler">The job scheduler</param>
        Jx.log.info("ShareTarget.ShareRoot");
        this._name = "ShareTarget.ShareRoot";
        this.initComponent();

        this._shareOperation = ev.shareOperation;
        this._jobSet = scheduler.getJobSet().createChild();
        this._platformCache = new P.PlatformCache(platform, this._jobSet);
    };

    Jx.augment(S.ShareRoot, Jx.Component);

    S.ShareRoot.prototype._jobSet = /* @static_cast(P.JobSet)*/null;
    S.ShareRoot.prototype._layout = /*@static_cast(People.RecentActivity.UI.Share.ShareLayout)*/null;
    S.ShareRoot.prototype._platformCache = /* @static_cast(P.PlatformCache)*/null;
    S.ShareRoot.prototype._shareOperation = /*static_cast(Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation)*/null;

    S.ShareRoot.prototype.getPlatform = function () {
        /// <summary>Gets the platform.</summary>
        /// <returns type="Microsoft.WindowsLive.Platform.Client"/>
        Jx.log.info("People.ShareTarget.ShareRoot.getPlatform");
        Debug.assert(this._platformCache !== null);
        return this._platformCache.getPlatform();
    };

    S.ShareRoot.prototype.getPlatformCache = function () {
        /// <summary>Gets the platform cache.</summary>
        /// <returns type="P.PlatformCache"/>
        Debug.assert(this._platformCache !== null);
        return this._platformCache;
    };

    S.ShareRoot.prototype.trackStartup = function () {
        /// <summary>Records (or prepares to record) perf-track events for startup</summary>
        Jx.log.info("People.ShareTarget.ShareRoot.trackStartup");
    };

    S.ShareRoot.prototype.getJobSet = function () {
        /// <summary>Gets the scheduler's jobset.</summary>
        /// <returns type="P.JobSet"/>
        return this._jobSet;
    };

    S.ShareRoot.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="JxUI">Returns the object which contains html and css properties.</param>
        Jx.log.info("People.ShareTarget.ShareRoot.getUI");

        // We don't need to return any UI strings here, the layout will take care of it.
        ui.html = "";
        ui.css = "";
    };

    S.ShareRoot.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        Jx.log.info("People.ShareTarget.ShareRoot.deactivateUI");

        if (this._layout) {
            this._layout.dispose();
        }

        Jx.Component.prototype.deactivateUI.call(this);
    };
    
    S.ShareRoot.prototype.shutdownComponent = function () {
        /// <summary>Shut down the Component object.</summary>
        Jx.log.info("People.ShareTarget.ShareRoot.shutdownComponent");

        Jx.dispose(this._platformCache);
        this._platformCache = null;

        this._jobSet.dispose();
        this._jobSet = null;
    };

    S.ShareRoot.prototype.initUI = function (container) {
        /// <summary>Called to initialize the UI.</summary>
        /// <param name="container" type="HTMLElement">The containing element.</param>
        Jx.log.info("People.ShareTarget.ShareRoot.initUI");
        this._layout = new R.ShareLayout(container, this._shareOperation);
        Jx.Component.prototype.initUI.apply(this, arguments);
    };

    S.ShareRoot.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.log.info("People.ShareTarget.ShareRoot.activateUI");
        Jx.Component.prototype.activateUI.call(this);
        this._layout.render();
    };
});
