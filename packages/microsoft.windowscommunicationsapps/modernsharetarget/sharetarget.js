
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Share,Jx,Microsoft,Debug,Windows,WinJS*/
/*jshint browser:true*/

// This file contains logic specific to the share page and outside any component hierarchy.
(function () {

    var _contentLoaded = false;
    var _startedShareTarget = false;
    var _platformAccount = null;
    var _platform = null;
    var _platformIsReady = false;
    var _splashScreen = null;
    var _splashScreenDismissed = false;
    var _isShutdown = false;

    // Log the app startup
    Share.mark("PageLoad", Share.LogEvent.start);

    Jx.log.level = Jx.LOG_VERBOSE;
    Jx.app = new Jx.Application();

    var wl = Microsoft.WindowsLive.Platform;

    // Add hook to log errors in promises. This does not currently assert since we should be able to handle most issues, but it will still log them.
    Debug.hookPromiseErrors(false);

    Jx.log.info("ShareTarget attaching to activation events");
    var activation = Jx.activation;
    activation.addListener(activation.share, function onShareActivation(ev) {
        /// <param name="ev" type="Windows.ApplicationModel.Activation.ShareTargetActivatedEventArgs" />

        Jx.log.info("Share target receieved activation context");

        ev.splashScreen.addEventListener("dismissed", onSplashDismiss);
        _splashScreen = ev.splashScreen;

        // Need to set up fake splash screen position before it's rendered, do this now.
        updateSplashScreen();

        Jx.root = /*@static_cast(Jx.Component)*/new Share.TargetRoot(ev.shareOperation);

        if (readyForStart()) {
            shareTargetStart();
        }
    });

    window.addEventListener("DOMContentLoaded", function shareTargetContentLoaded() {
        _contentLoaded = true;

        Jx.log.verbose("DOMContentLoaded event");

        // Keep track of loaded scripts and assert if it finds duplicates
        Debug.only(Jx.Dep.collect());

        // Localize the content inside the splash screen
        Jx.res.processAll(document.getElementById("splashContent"));

        // Create and set up the platform object
        initializePlatform();

        // Check to see if everything is ready to go
        if (readyForStart()) {
            shareTargetStart();
        } else if (!_platformIsReady) {
            // Timeout for waiting for the account information
            WinJS.Promise.timeout(20000).then(function accountChangeTimeout() {
                // If we haven't started yet, start now.
                if (!_platformIsReady) {
                    Jx.fault("ShareToMail.ShareTarget.js", "AccountTimeout");
                    _platformIsReady = true;
                    if (readyForStart()) {
                        // Using setImmediate remove this from the promise call stack and allows errors to propagate to the global window error handler.
                        setImmediate(shareTargetStart);
                    }
                }
            });
        }
    }, false);

    function updateSplashScreen() {
        /// <summary>
        /// Sets the position of the fake splash screen.
        /// </summary>

        var splashImage = document.getElementById("splashImage");
        var splashContent = document.getElementById("splashContent");

        // The splash screen isn't positioned in CSS, we position it here - the system passes us the correct values for position
        // This helps it match the system splash screen exactly.

        if (splashImage && splashContent) {
            var splashLocation = _splashScreen.imageLocation;

            splashImage.style.left = splashLocation.x + "px";
            splashImage.style.top = splashLocation.y + "px";
            splashImage.style.height = splashLocation.height + "px";
            splashImage.style.width = splashLocation.width + "px";

            // Put the loading spinner underneath the splash image (horizontal positioning done with css)

            /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>  // Intentional type coercion
            splashContent.style.top = (splashLocation.y + splashLocation.height) + "px";
            /// <enable>JS3057.AvoidImplicitTypeCoercion</enable> 
        }
    }

    function onSplashDismiss() {
        ///<summary>
        /// Handles the splash screen dismiss event. 
        ///</summary>

        _splashScreenDismissed = true;

        if (_isShutdown) {
            // Don't need to do anything if the app is shut down.
            return;
        }

        if (_startedShareTarget) {
            // Let the share target know it's ready to be animated in
            var shareTarget = /*@static_cast(Share.TargetRoot)*/Jx.root;
            shareTarget.animateUI();

        } else {
            Jx.log.verbose("Splash screen dismiss before share target start");

            // This resize handler will update the splash image position in case the app is rotated during the splash screen.
            window.addEventListener("resize", updateSplashScreen, false);
        }
    }

    function readyForStart() {
        /// <summary>
        /// Checks to see if we're ready for shareTargetStart()
        /// </summary>
        /// <returns type="Boolean">True if ready</returns>

        // Ready if: the platform information is ready,
        //   the DOMContentLoaded event has fired,
        //   the Share.TargetRoot has been constructed
        return _platformIsReady && _contentLoaded && Boolean(Jx.root);
    }

    function initializePlatform() {
        /// <summary>
        /// Sets up the platform object
        /// </summary>

        // We're using beforeunload because it's the most appropriate close event
        window.addEventListener("beforeunload", function shareTargetUnload() {

            if (_platformAccount) {
                _platformAccount.removeEventListener("changed", accountChangedHandler);
            }

            _platform = null;
            _platformAccount = null;
            _splashScreen = null;

            // Remove the splash screen resize handler
            window.removeEventListener("resize", updateSplashScreen, false);

            // Let the TargetRoot clean up/etc
            Share.TargetRoot.shutdownApp();

            _isShutdown = true;

        }, false);

        Jx.log.verbose("ShareTarget is creating the platform");

        // Try to initialize the platform.
        try {
            Jx.log.verbose("Trying To create the platform");
            _platform = wl.Client("shareAnything", wl.ClientCreateOptions.failIfNoUser);
        } catch (e) {
            Jx.fault("ShareToMail.ShareTarget.js", "CreatePlatform", e);
        }

        // Check to see if we have the account information ready.  This isn't necessarily ready right away.
        if (!Jx.isNullOrUndefined(_platform)) {
            Jx.log.verbose("Trying to get accounts");
            try {
                _platformAccount = /*@static_cast(Microsoft.WindowsLive.Platform.Account)*/_platform.accountManager.defaultAccount;
                // Platform is ready whether it's connected or not, so long as it isn't in "unknown" state
                // The TargetRoot will figure out whether to show an error or not at that point
                // Also, the platform won't be able to transition from unknown to any known state while offline - so it's "ready" in that case too (for the error message).
                _platformIsReady = false;
                if (Boolean(_platformAccount)) {
                    if ((Number(_platformAccount.mailScenarioState) !== wl.ScenarioState.unknown)) {
                        _platformIsReady = true;
                    } else {
                        // connectionProfile may be null if there is no current connection.
                        var connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
                        _platformIsReady = !Boolean(connectionProfile) || /*@static_cast(Number)*/connectionProfile.getNetworkConnectivityLevel() !== Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
                    }
                }

            } catch (e) {
                Jx.fault("ShareToMail.ShareTarget.js", "GetDefaultAccount", e);
                _platformAccount = null;
                _platformIsReady = true;
            }

            if (!_platformIsReady) {
                Jx.log.info("ShareTarget: mailScenarioState is unknown; subscribing to account change event");

                _platformAccount.addEventListener("changed", accountChangedHandler);

                // Sync causes the mailScenarioState field to update, and sync isn't triggered on first run
                Jx.forceSyncAccount(/*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/_platformAccount, wl.ApplicationScenario.mail);
            } else {
                // We don't need a reference to this anymore
                _platformAccount = null;
            }
        } else {
            // No platform
            _platformIsReady = true;
        }
    }

    function accountChangedHandler() {
        ///<summary>
        /// Reacts to changes in the default account, looks for updates to mailScenarioState
        ///</summary>

        // Platform is ready whether the account is connected or not, so long as it isn't in "unknown" state
        // The TargetRoot will figure out whether to show an error or not at that point
        _platformIsReady = Number(_platformAccount.mailScenarioState) !== wl.ScenarioState.unknown;

        if (_platformIsReady) {
            // We don't need the account anymore
            _platformAccount.removeEventListener("changed", accountChangedHandler);
            _platformAccount = null;
        }

        if (readyForStart()) {
            shareTargetStart();
        }
    }

    function shareTargetStart() {
        ///<summary>
        /// The start function should be called after all of these:
        /// the onActivated event, and
        /// DomContentLoaded, and
        /// the platform is ready (or is acknowledged to not be available)
        ///</summary>

        if (_startedShareTarget) {
            // Don't need to do anything if we've started already
            return;
        }

        // Remove the splash screen resize handler
        _splashScreen = null;
        window.removeEventListener("resize", updateSplashScreen, false);

        var shareTarget = /*@static_cast(Share.TargetRoot)*/Jx.root;

        if (_platform) {
            shareTarget.setPlatform(_platform);

            // shareTarget will dispose the platform
            _platform = null;
        }

        _startedShareTarget = true;

        Jx.app.initUI(document.body);

        if (_splashScreenDismissed) {
            shareTarget.animateUI();
        }
    }

})();