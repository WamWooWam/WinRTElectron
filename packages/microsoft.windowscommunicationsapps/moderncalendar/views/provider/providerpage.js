
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug,Calendar,Jx,Microsoft*/

Jx.delayDefine(Calendar, "ProviderPage", function () {

    function _start(s) { Jx.mark("Calendar.ProviderPage." + s + ",StartTA,Calendar,App"); }
    function _stop(s) { Jx.mark("Calendar.ProviderPage." + s + ",StopTA,Calendar,App"); }
    function _info(s) { Jx.mark("Calendar.ProviderPage." + s + ",Info,Calendar,App");}

    var ProviderPage = Calendar.ProviderPage = function () {
        /// <summary>
        /// The ProviderPage class handles initialization and tear-down of the calendar provider page
        /// </summary>
        /// <param name="host" type="HTMLElement">Description</param>
        _start("constructor");

        this.initComponent();

        this._isShutdown = false;

        this._model = null;
        this._view = null;
        this._close = this._close.bind(this);

        this._onRestartNeeded = this._onRestartNeeded.bind(this);

        var activation = Jx.activation;
        activation.addListener(activation.appointmentsProvider, this._onAppActivate, this);

        this._createPlatform();

        Calendar.Helpers.ensureFormats();

        // This is the most appropriate page close/unload event
        window.addEventListener("beforeunload", this._close, false);

        // We also have a dismissUI event that fires when we close the UI. 
        Jx.EventManager.addListener(null, "dismissUI", this._onDismissUI, this);

        _stop("constructor");
    };

    Jx.augment(ProviderPage, Jx.Component);

    var proto = ProviderPage.prototype;

    proto.getUI = function (ui) {
        /// <summary>Returns page UI</summary>

        Debug.assert(this._view, "Unexpected lack of view while building UI");

        var viewHtml = Jx.getUI(this._view).html;

        ui.html = viewHtml;
    };

    proto._onRestartNeeded = function (args) {
        /// <summary>Handles the "restartNeeded" platform event</summary>
        /// <param name="args" type="Microsoft.WindowsLive.Platform.RestartNeededEventArgs"></param>

        if (this._isShutdown) {
            return; // No work to do
        }

        _start("onRestartNeeded");
        
        var hresult = null;

        _info("onRestartNeeded:reason:" + args.reason);
        if (args.reason === Microsoft.WindowsLive.Platform.RestartNeededReason.accountDisconnected) {
            // This hresult will prompt the error UI to display a sign in message.
            hresult = Microsoft.WindowsLive.Platform.Result.forceSignIn;
        }
        // Other reasons really just mean we should ask the user to try again, which we don't have a good hresult for.

        if (this._model) {
            // Transition the view to an error state
            
            this._model.setPlatformError(hresult);
            this._view.displayErrorUI();
        } else {
            // View hasn't displayed yet; re-create the platform before it does.
            this._createPlatform();
        }
        _start("onRestartNeeded");
    };

    proto._createPlatform = function () {
        /// <summary>Creates the platform</summary>
        _start("_createPlatform");

        // This function is important to help with unit testability (can be overridden by unit tests)
        try {
            var MWP = Microsoft.WindowsLive.Platform;
            var ClientCreateOptions = MWP.ClientCreateOptions;
            this._platform = new MWP.Client("calendar", ClientCreateOptions.failIfNoUser | ClientCreateOptions.delayResources | ClientCreateOptions.failIfUnverified);
        } catch (e) {
            Jx.log.exception("Unable to create platform", e);
            this._platformError = e.number;
            // Make sure this is a valid hresult
            if (!Jx.isValidNumber(this._platformError) || e.number ===  0)
            {
                this._platformError = -2147467259; // 0x80004005, E_FAIL;
            }
        }

        // using a scheduler for one deferred task would be overkill, so not doing that now.
        var that = this;
        setTimeout(function platformInit() {
            // We don't currently cancel this task if the platform is unloaded, so check for platform
            if (that._platform) {
                // Set up restartNeeded, let the platform load its plugins
                that._platform.addEventListener("restartneeded", that._onRestartNeeded);
                that._platform.requestDelayedResources();

                // Note that we're not kicking off a sync here, so if this is the user's first time running calendar
                // we will only write to the default calendar and may not have any mail integration.
            }
        }, 500);

        _stop("_createPlatform");
    };

    proto._onAppActivate = function (ev) {
        /// <summary>Handles appointmentsProvider app activation</summary>
        /// <param name="ev" type="Windows.ApplicationModel.Activation.IAppointmentsProviderActivatedEventArgs">Event arguments for activation</param>

        var rootElement = document.getElementById("providerRoot");

        var model = this._model = new Calendar.ProviderModel();
        if (this._platform) {
            model.initialize(ev, this._platform);
        } else {
            model.initialize(ev, null, this._platformError);
        }

        this._view = new Calendar.ProviderEventView(model);

        this.append(this._view);

        // Start up the app UI.
        this.initUI(rootElement);
    };

    proto._onDismissUI = function () {
        /// <summary>Handles dismissUI event</summary>

        this._close(true);
    };

    proto._close = function (isDismissUI) {
        /// <summary>
        /// Handles page unload event.
        /// </summary>
        _start("close");

        Jx.EventManager.removeListener(null, "dismissUI", this._onDismissUI, this);

        var application = Jx.app;

        if (application) {
            application.shutdownUI();
            application.shutdown();
            application = null;
        }

        this._isShutdown = true;

        if (this._model) {
            this._model.dispose(isDismissUI);
            this._model = null;
        }

        if (this._platform) {
            this._platform.dispose();
            this._platform = null;
        }

        this._view = null;
        _stop("close");
    };

});