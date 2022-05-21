
//
// Copyright (C) Microsoft. All rights reserved.
//

/*jshint browser:true*/
/*global Jx, Windows, WinJS, Mail, Debug, Microsoft, NoShip, AddressWell, FromControl, ModernCanvas, Share, setImmediate*/

Share.TargetRoot = /*@constructor*/function (shareOperation) {
    ///<summary>
    /// Share.TargetRoot constructor.  Call using new.
    /// Share.TargetRoot is the share root component for the share target page.
    /// Will associate itself with document.body
    /// This component cannot be activated again once it has been deactivated.
    ///</summary>
    ///<param name="shareOperation" optional="true" type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">ShareOperation for this request</param>

    // Verify that "this" is an object of the correct type
    if (/* @static_cast(Function) */this.constructor !== Share.TargetRoot) {
        throw new Error("Share.TargetRoot is a constructor; it must be called using new");
    }

    this.initComponent();

    this._data = new Share.MailData(shareOperation);
};

Share.TargetRoot.prototype.setPlatform = function (platform) {
    ///<summary>
    /// Initializes the TargetRoot with the platform
    /// The TargetRoot component will dispose the platform.
    /// This method should be called before initUI - if it is not, the error case will be rendered.
    ///</summary>
    ///<param name="platform" type="Microsoft.WindowsLive.Platform.Client"></param>

    // _checkStartupState checks for user accounts with mail available and sets this._startupError if it's not ready for sharing
    // _checkStartupState also handles the null/not present platform case
    this._platform = platform;
    this._checkStartupState();

    if (this._startupError === Share.MailConstants.StartupError.none) {
        this._data.platform = this._platform;

        // Load the data
        this._beginLoadData();

        // Create components that don't rely on async tasks
        this._createChildren();
    } else {
        // There are errors - we don't need to do any of the async tasks or load data. 
        // We can render as soon as Jx is ready to render.
        Jx.log.verbose("ShareTarget skipping data load due to startup error");
        this._dataLoadComplete();
    }
};

Jx.augment(Share.TargetRoot, Jx.Component.prototype);

Share.TargetRoot.prototype.activateUI = /*@bind(Share.TargetRoot)*/function () {
    /// <summary>
    /// activateUI contains initialization that occurs after the UI is present.
    /// Note that this component can only be activated/deactivated once.
    /// </summary>

    if (!this._uiInitialized) {

        Jx.log.verbose("Share.TargetRoot.activateUI");

        this._uiInitialized = true;

        // Calls activateUI on children
        Jx.Component.activateUI.call(this);

        // Localize the html
        Jx.res.processAll(document.getElementById("shareFlyout"));

        if (this._startupError === Share.MailConstants.StartupError.none) {

            // Bind event handlers
            var proto = Share.TargetRoot.prototype;
            this._keyboardShow = proto._keyboardShow.bind(this);
            this._keyboardHide = proto._keyboardHide.bind(this);
            this._scrollIntoView = proto._scrollIntoView.bind(this);

            // Attach a handler to handle the keyboard show/hide events - we perform our own scrolling logic.
            this._inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            this._inputPane.addEventListener("showing", this._keyboardShow);
            this._inputPane.addEventListener("hiding", this._keyboardHide);

            // Set aria-labelledyby on the addresswell.
            this._address.setLabelledBy("shareToLabel");

            // The aria-flowto and aria-flowfrom properties on the addresswell.
            this._address.setAriaFlow("shareToLabel"/*flowFrom*/, "shareSubject" /*flowTo*/);
            
            // The button is ready and activated, attach handler to listen for keyboard shortcuts that would initiate sharing
            this._attachDocumentListeners();			
        }
    }
};

Share.TargetRoot.prototype.animateUI = function () {
    /// <summary>
    /// Indicates that the UI is visible and ready to be animated in.
    /// This may occur immediately after activateUI, or some time after activateUI.  
    /// </summary>

    // Animate the UI in
    var page = document.getElementById("shareFlyout");
    page.style.display = "-ms-grid";
    var animationPromise = WinJS.UI.Animation.enterPage(page);

    var renderData = this._renderDataArea.bind(this);
    // Using setImmediate removes the callback from the promise call stack, allowing errors to propagate up to the global window error handler.
    animationPromise.done(function shareTarget_activateUI_animationThen() { setImmediate(renderData); });
};

Share.TargetRoot.prototype._beginLoadData = function () {
    /// <summary>
    /// Begins loading the data from the sharedata object
    /// </summary>

    // Set up a timeout for the data timeout function if we don't have all the required information by the time limit.
    // The timeout function will then render the error case.
    this._waitForDataTimeout = setTimeout(this._dataTimeout.bind(this), Share.MailConstants.waitForRender);

    // Start the next task: load the data
    this._dataLoadPromise = this._data.loadDataAsync(this._handledShareTypes);
    var dataLoadEnd = this._endDataLoad.bind(this);
    var dataLoadError = this._endDataLoadError.bind(this);
    // setImmediate removes the callback from the promise call stack, allowing errors to propagate up to the global window error handler.
    this._dataLoadPromise.done(
        function shareTargetRoot_dataLoadThen(result) { setImmediate(dataLoadEnd, result); },
        function shareTargetRoot_dataLoadError(result) { setImmediate(dataLoadError, result); }
    );
};

Share.TargetRoot.prototype._shutdownAndRemoveChild = function (child) {
    /// <summary>
    /// Appropriately shuts down the child component and removes it from the component hierarchy
    /// </summary>
    /// <param name="child" type="Jx.Component">Child to remove</param>

    child.deactivateUI();
    child.shutdownComponent();
    this.removeChild(child);
};

Share.TargetRoot.prototype._renderDataArea = function () {
    /// <summary>
    /// This function renders the data area - either with the data, if it's ready, or with loading UI if not.
    /// Called after the initial page-load animation is complete.
    /// </summary>

    if (this.isShutdown()) {
        // This is a callback, check to make sure the component is still around before proceeding.
        return;
    }

    if (this._startupError === Share.MailConstants.StartupError.none) {
        // Prepopulate recipients from quicklinkID
        // Do this after animation is completed to avoid WinLive bug 598981
        this._prefillRecipientFromQuicklink();
        
        // Put the default focus on the inputwell
        // We do this in a setImmediate as a workaround for BLUE:383904 (which manifests in Mail when animations are turned off)
        var that = this;
        setImmediate(function () {
            that._address.focusInput();
        });

        // If the data is ready, show the data
        if (this._dataReady) {
            Jx.log.verbose("Share.TargetRoot: Share data is ready upon initial page animation complete");
            this._startRenderData(true);
        } else {
            Jx.log.verbose("Share.TargetRoot: Share data is not ready upon initial page animation complete - rendering loading UI");
            // Fade in loading UI
            var shareContentArea = document.getElementById("shareContentArea");
            shareContentArea.style.display = "-ms-grid";
            shareContentArea.style.opacity = "0";
            WinJS.UI.Animation.fadeIn(shareContentArea);

            // This timeout (and _initialUIReady state variable) helps implement a feature
            // where the loading UI needs to show up either not at all or for a minimum time before showing the data,
            // to prevent having the loading UI flash in/out of view quickly.
            // Minimum time here is arbitrarily 1 second (1000 ms).
            setTimeout(
                function ShareTargetRoot_loadMinTimePromiseComplete() {
                    if (that.isShutdown()) {
                        return;
                    }
                    that._initialUIReady = true;
                    Jx.log.verbose("Share.TargetRoot: Min time for loading UX expired");

                    // Need to make sure that the loading UI is ready and data is ready before rendering data
                    // See dataRenderReady comments for more information
                    if (that._dataRenderReady()) {
                        Jx.log.verbose("Share.TargetRoot: Rendering data immediately after loading timer since data is ready");
                        that._startRenderData(false);
                    }
                },
                1000
            );
        }
    }

    Share.mark("PageLoad", Share.LogEvent.end);
};

Share.TargetRoot.prototype.shutdownComponent = function () {
    /// <summary>
    /// Cleans up any DOM/etc references
    /// Note that this component can only be activated/deactivated once.
    /// </summary>

    Jx.Component.shutdownComponent.call(this);

    this._deactivateTimeout();

    if (this._inputPane) {
        this._inputPane.removeEventListener("showing", this._keyboardShow);
        this._inputPane.removeEventListener("hiding", this._keyboardHide);
        this._inputPane = null;
        this._keyboardShow = null;
        this._keyboardHide = null;
        this._scrollIntoView = null;
    }

    try {
        if (this._dataLoadPromise) {
            this._dataLoadPromise.cancel();
            this._dataLoadPromise = null;
        }

        if (this._canvas) {
            this._canvas.dispose();
            this._canvas = null;
        }

    } catch (e) {
        // We generally don't expect exceptions here now that Windows 8 Bugs #637158 has been fixed
        Jx.log.exception("Error during shareTarget cleanup", e);
    }

    if (this._platform) {
        // Keeping platform dispose separate since it seems more important
        try {
            this._platform.dispose();
        } catch (e) {
            Jx.log.exception("Error disposing platform", e);
        }
        this._platform = null;
    }

    if (window.Mail) {
        Debug.assert(Boolean(Mail.Globals.appSettings));
        try {
            Mail.Globals.appSettings.dispose();
        } catch (e) {
            Jx.log.exception("Error disposing platform", e);
        }
    }
};

Share.TargetRoot.prototype.getUI = function (ui) {
    /// <summary>
    /// Retrieves the HTML representing the share anything flyout
    /// </summary>
    /// <param name="ui" type="JxUI">Object container for html/css</param>

    Jx.log.verbose("Share.TargetRoot.getUI");

    // Make sure we've checked the startup state before rendering any UI 
    this._checkStartupState();

    if (this._startupError === Share.MailConstants.StartupError.none) {
        ui.html = '<div id="shareFlyout">' +
                        '<div class="share-from">' +
                            Jx.getUI(this._fromCtrl).html +
                        '</div>' +
                        '<div class="share-buttonBox">' +
                            Jx.getUI(this._shareButton).html +
                        '</div>' +
                        '<div id="shareScrollArea" role="group">' + // role="group" puts this in the accessibility tree allowing narrator to scroll it
                            '<div id="shareToArea">' +
                                '<div id="shareAddressError"></div>' +
                                '<div class="share-label">' +
                                    '<label id="shareToLabel" data-win-res="innerText:/sharetargetstrings/toLabel"></label>' +
                                '</div>' +
                                '<div id="shareAddressWell">' +
                                    Jx.getUI(this._address).html +
                                '</div>' +
                            '</div>' +
                            '<div id="shareContentArea">' +
                                '<div class="share-dataLoad">' +
                                    '<progress class="win-ring"></progress>' +
                                    '<span data-win-res="innerText:/sharetargetstrings/dataLoading"></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
    } else if (this._startupError === Share.MailConstants.StartupError.mailNotSetup) {
        // We need the user to go to mail to set up a mail-connected account.
        ui.html = '<div id="shareFlyout" class="share-errorContainer">' +
                        '<div class="share-error-title share-error1" data-win-res="innerText:/sharetargetstrings/errorTitle"></div>' +
                        '<div class="share-error share-error2" data-win-res="innerText:/sharetargetstrings/errorText"></div>' +
                    '</div>';
    } else {
        // All of the other error messages use the same html format
        var errorString = "shareDataErrorGeneric"; // generic error string

        if (this._startupError === Share.MailConstants.StartupError.needsInternet) {
            // Not connected, and no Internet case
            errorString = "networkErrorText";
        }

        ui.html = '<div id="shareFlyout" class="share-errorContainer">' +
                        '<div class="share-error share-error1" data-win-res="innerText:/sharetargetstrings/' + errorString + '"></div>' +
                    '</div>';
    }
};

Share.TargetRoot.prototype.shareClose = function () {
    /// <summary>
    /// Indicates that the share UI has been closed
    /// If the user hasn't clicked share, then we'll cancel the share by deleting any temporary data (draft mail).
    /// </summary>

    // Delete the draft if we have one and we haven't started the share
    if (!this._shareStarted && Boolean(this._data) && Boolean(this._data.mailMessage) && this._data.mailMessage.canDelete) {
        Jx.log.verbose("Attempting to delete mail message on close");
        this._data.mailMessage.deleteObject();
    }

    if (this._address) {
        this._address.cancelPendingSearches();
    }
};

Share.TargetRoot.prototype._checkStartupState = function () {
    /// <summary>
    /// Checks current state to see if we should render normal UI or an error.  Sets this._startupError
    /// </summary>

    // Only run through this check if we haven't already decided there is an error
    if (this._startupError !== Share.MailConstants.StartupError.none) {
        return;
    }

    if (!Boolean(this._platform)) {
        Jx.log.error("ShareTarget: unable to run shareTarget due to lack of platform");
        this._startupError = Share.MailConstants.StartupError.genericError;
    } else {

        // Static casts to Number here are due to a bug in jscop where the js reference files are incorrectly recording the types of enum values

        // Check the list of mail-enabled accounts to make sure we have at least one.  The default account will be in this list if it is mail-enabled.
        // If we are not connected to the Internet and there are no accounts, then we'll need to prompt the user to do that,
        //   as the Platform can't transition the default account from the unknown state to connected state without an Internet connection.
        var accounts;
        try {
            var wl = Microsoft.WindowsLive.Platform;
            var defaultAccount = /*@static_cast(Microsoft.WindowsLive.Platform.Account)*/this._platform.accountManager.defaultAccount;
            accounts = this._platform.accountManager.getConnectedAccountsByScenario(wl.ApplicationScenario.mail, wl.ConnectedFilter.normal, wl.AccountSort.rank);

            if (accounts.count > 0) {
                // User has connected at least one account and we can show our UI.
                this._startupError = Share.MailConstants.StartupError.none;
            } else {
                // User is not connected, figure out which error message to show.

                // connectionProfile may be null if there is no current connection.
                var connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();

                // Check for Internet connectivity 
                if (Boolean(defaultAccount) &&
                    /*@static_cast(Number)*/defaultAccount.mailScenarioState === wl.ScenarioState.unknown &&
                (!Boolean(connectionProfile) || /*@static_cast(Number)*/connectionProfile.getNetworkConnectivityLevel() !== Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess)) {
                    // Not connected, and we don't know the state.  We need an Internet connection to determine the state.
                    this._startupError = Share.MailConstants.StartupError.needsInternet;
                } else {
                    var scenarioState = Boolean(defaultAccount) ? defaultAccount.mailScenarioState.toString() : "no defaultAccount";
                    Jx.log.info("mailScenarioState is not connected: " + scenarioState);
                    this._startupError = Share.MailConstants.StartupError.mailNotSetup;
                }
            }

        } catch (e) {
            this._startupError = Share.MailConstants.StartupError.genericError;
            Jx.fault("ShareToMail.ShareTargetRoot.js", "AccountException", e);
        } finally {
            if (accounts) {
                accounts.dispose();
            }
        }
    }
};

Share.TargetRoot.prototype._endDataLoadError = function (/*@dynamic*/error) {
    /// <summary>
    /// Callback for completion of the Share.MailData.loadDataAsync function when there was an error
    /// </summary>
    /// <param name="error">error encountered during data load</param>

    if (this.isShutdown()) {
        // This is a callback, check to make sure the component is still around before proceeding.
        return;
    }

    // If this is the timeout case, the error may already have been set by the timeout code:
    // timeout sets the error and cancels the promise, and canceling the promise calls into this error callback.
    // Only set error if the error is not already set.
    if (this._data.errorCategory === Share.Constants.DataError.none) {
        this._data.recordError("Error loading data", Share.Constants.DataError.internalError, error);
        Jx.fault("ShareToMail.ShareTargetRoot.js", "DataLoadError", error);
    }

    this._endDataLoad();
};

Share.TargetRoot.prototype._endDataLoad = function () {
    /// <summary>
    /// Callback for completion of the Share.MailData.loadDataAsync function
    /// </summary>

    if (this.isShutdown()) {
        // This is a callback, check to make sure the component is still around before proceeding.
        return;
    }

    // Clear out data promise state
    this._dataLoadPromise = null;

    // Sets internal state, creates data-related components
    Jx.log.verbose("Data load complete.");
    this._dataLoadComplete();

    Debug.assert(this._startupError === Share.MailConstants.StartupError.none, "Internal error: should not be able to get to _endDataLoad with startupError");

    // Make sure we only render the data-related UI after the other UI has rendered.
    // See comments in dataRenderReady for details
    if (this._dataRenderReady()) {
        Jx.log.verbose("Starting to render data after data load complete");
        this._startRenderData(false);
    }
};

Share.TargetRoot.prototype._dataLoadComplete = function () {
    /// <summary>
    /// Consolidates code to handle the "data ready" state:
    /// Sets _dataReady.
    /// If they still exist, cancels ongoing promises.
    /// If it's still going, cancels the data timeout.
    /// If we're going to render the data, initializes data-related components.
    /// Caller should call _startRenderData if appropriate.
    /// </summary>

    if (this._dataReady) {
        // This method can be called more than once in the timeout case.
        return;
    }

    this._dataReady = true;

    // Note that cancel will also fire the error callback (which will call this function again)
    if (this._dataLoadPromise) {
        this._dataLoadPromise.cancel();
        this._dataLoadPromise = null;
    }

    this._deactivateTimeout();

    // Only create child components if there isn't an error (only if we're going to render them)
    if (this._startupError === Share.MailConstants.StartupError.none) {
        this._createDependentChildren();
    }
};

Share.TargetRoot.prototype._prefillRecipientFromQuicklink = function () {
    /// <summary>
    /// If there are selected recipients from quick link, prefill the recipients inside the address well.
    /// </summary>

    if (!Jx.isNullOrUndefined(this._data.shareOperation) && Jx.isNonEmptyString(this._data.shareOperation.quickLinkId)) {
        this._address.addRecipientsByString(this._data.shareOperation.quickLinkId);
        NoShip.log("Prepopulating contacts using the quicklinkID: " + this._data.shareOperation.quickLinkId);

        // Since they're using a quicklink, they don't need suggestions in the address well
        this._address.setAutoSuggestOnFocus(false);
    }
};

Share.TargetRoot.prototype._deactivateTimeout = function () {
    /// <summary>
    /// If the render timeout is still going, deactivates the timeout.
    /// </summary>

    if (Jx.isNumber(this._waitForDataTimeout)) {
        clearTimeout(this._waitForDataTimeout);
        this._waitForDataTimeout = null;
    }
};

Share.TargetRoot.prototype._createChildren = function () {
    /// <summary>
    /// Creates child components with no dependencies on any async work
    /// </summary>

    // Create the components, bind to component events (but not DOM events), and put in component tree
    Jx.log.verbose("Creating ShareButton");
    this._shareButton = new Share.ShareButton();
    this._shareButton.addListener("share", this._shareClick, this);

    Jx.log.verbose("Creating address well");
    this._address = new AddressWell.Controller(
        "shareTo" /* idPrefix */,
        null /* recipients */,
        this._platform /* contactsPlatform */,
        true /* showSuggestions */,
        "" /* hintText */,
        null /* contactSelectionMode */,
        false /* allowViewProfile */);
    
    // We don't need the AddressWell to scroll into view in Share because it causes jumpiness and doesn't really give us anything
    this._address.setScrollsIntoView(false);

    Jx.log.verbose("Creating quick link data object");
    this._quickLinkData = new Share.QuickLinkData(this._platform);

    Jx.log.verbose("Creating FromControl");
    this._fromCtrl = new FromControl.FromControl(this._platform.accountManager, this._platform.peopleManager);

    // Set the initial From account
    if (!Jx.isNullOrUndefined(this._data.shareOperation) && Jx.isNonEmptyString(this._data.shareOperation.quickLinkId)) {
        // Set the value of the From account to the last From account used for this quick link, or the last used From account
        var account = this._quickLinkData.getAssociatedFromAccount(this._data.shareOperation.quickLinkId);
        if (!Jx.isNullOrUndefined(account)) {
            this._fromCtrl.select(account.objectId, account.preferredSendAsAddress);
        } else {
            this._prefillLastUsedFromAccount();
        }
    } else {
        // No quick link, just use the last used From account
        this._prefillLastUsedFromAccount();
    }

    // Set the address well's contextual account to whatever we set the From account to
    this._address.setContextualAccount(this._fromCtrl.selectedAccount);

    Jx.log.verbose("Appending controls");
    this.append(this._shareButton, this._fromCtrl, this._address);
};

Share.TargetRoot.prototype._prefillLastUsedFromAccount = function () {
    /// <summary>
    /// Prefills the value of the from control to the last from account that was used to share
    /// </summary>
    if (Jx.isNonEmptyString(this._lastFromAccountId)) {
        var account = this._platform.accountManager.loadAccount(this._lastFromAccountId);
        if (!Jx.isNullOrUndefined(account)) {
            this._fromCtrl.select(this._lastFromAccountId, account.preferredSendAsAddress);
        }
    }
};

Share.TargetRoot.prototype._createDependentChildren = function () {
    /// <summary>
    /// Creates child components that require async work
    /// </summary>

    // Create the mail here, but don't save it unless we need it for attachments
    if (Jx.isNullOrUndefined(this._data.mailMessage)) {
        this._createMailMessage();
    }

    // If fileshare create attachment Well and save mail
    if (this._data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems) ||
        this._data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap)) {
        // Need to commit the mail message to add attachments
        this._data.mailMessage.commit();

        this._attachmentWrapper = new Share.AttachmentWrapper(this._data.storageItems, this._platform.mailManager, this._data.mailMessage);

        // Attach to the global event waiting for the files to be added to the database.
        Jx.EventManager.addListener(null, "attachcomplete", this._uploadComplete, this);
        this.append(this._attachmentWrapper);
    } else {
        // Don't wait for upload
        Jx.log.verbose("No files - upload complete.");
        this._uploadCompleted = true;
    }

    // If sharing a bitmap, save it to the attachments
    if (this._data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap)) {
        var that = this;
        var bitmapStream = null;
        this._data.bitmap.openReadAsync().then(
            function (openedStream) {
                bitmapStream = openedStream;
                return ModernCanvas.Mail.createAttachmentAsync(that._data.mailMessage, Microsoft.WindowsLive.Platform.AttachmentUIType.ordinary, bitmapStream, "image/bmp", Jx.res.getString(Share.MailConstants.stringsPrefix + "bitmapFileName"));
            }
        ).done(
            function () {
                Jx.dispose(bitmapStream);
                that._bitmapAttachedCallback();
            },
            that._bitmapAttachErrorCallback.bind(that)
        );
    } else {
        // No attachment needed
        Jx.log.verbose("No bitmap.");
        this._bitmapAttached = true;
    }
};

Share.TargetRoot.prototype._bitmapAttachErrorCallback = function (error) {
    /// <summary>
    /// Called when there is an error attaching the bitmap
    /// </summary>

    // This is a callback
    Debug.assert(this instanceof Share.TargetRoot);

    // There was a problem attaching the bitmap, show the error message
    this._data.recordError("Unable to attach bitmap", Share.Constants.DataError.internalError, error);

    // We still want to mark the attachments as having been completed
    this._bitmapAttachedCallback();
};

Share.TargetRoot.prototype._bitmapAttachedCallback = function () {
    /// <summary>
    /// Called when the bitmap has completed attaching, whether successfully or unsuccessfully
    /// </summary>

    // This is a callback
    Debug.assert(this instanceof Share.TargetRoot);

    this._bitmapAttached = true;

    // This could be the last thing we were waiting for before send.
    // See comments in _readyForSend for details.
    if (this._readyForSend()) {
        this._beginShare();
    }
};

Share.TargetRoot.prototype._createMailMessage = function () {
    /// <summary>
    /// Create a mail message. (does not commit message)
    /// </summary>

    var defaultAccount = this._platform.accountManager.defaultAccount;
    var mailManager = this._platform.mailManager;

    var newMessage = mailManager.createMessage(defaultAccount);
    var mailBody = newMessage.createBody();
    // TODO: Windows 8 Bug 452194 Remove once JSGen bug is fixed.
    /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
    mailBody.type = Microsoft.WindowsLive.Platform.MailBodyType.html;
    /// <enable>JS3057.AvoidImplicitTypeCoercion</enable>
    this._data.mailMessage = newMessage;
};

Share.TargetRoot.prototype._callValidate = function () {
    /// <summary>
    /// Call validate on the attachmentWell after send has been hit.
    /// </summary>

    if (!this._attachmentWrapper.attachmentWell.validate()) {
        Jx.log.info("Attachment errors after send has been hit!");
        this._data.mailMessage.commit();
        this._data.shareOperation.reportError(Jx.res.getString(Share.MailConstants.stringsPrefix + "attachmentUploadError"));
    }
};

Share.TargetRoot.prototype._uploadComplete = function () {
    /// <summary>
    /// Upload Complete Event.
    /// </summary>

    Jx.log.verbose("Attachment upload complete");

    this._attachmentWrapper.attachmentWell.validate();

    if (this._shareStarted) {
        // The attachment well can fire this event multiple times - only record the "final" upload complete once the user has clicked share (see bug 574731)
        // We'll also check to see if it's complete inside _shareClick
        this._uploadCompleted = this._attachmentWrapper.isReady();
    }

    // This could be the last thing we were waiting for before send.
    // See comments in _readyForSend for details.
    if (this._readyForSend()) {
        this._beginShare();
    }

};

Share.TargetRoot.prototype._dataTimeout = function () {
    /// <summary>
    /// This method is called if the data load timeout is reached.
    /// It will render the data UI (which will render in error state)
    /// </summary>

    this._waitForDataTimeout = null;

    // Set data error
    this._data.recordError("Timeout reached for ShareTargetRoot data loading",
        Share.Constants.DataError.internalError,
        null, // exception
        Share.Constants.ErrorCode.timeout);

    // Sets internal state, creates data-related components
    this._dataLoadComplete();

    // Render data if ready (see comments in dataRenderReady for details)
    if (this._dataRenderReady()) {
        Jx.log.verbose("Starting to render data after data timeout");
        this._startRenderData(false);
    } else {
        Jx.log.error("ShareTargetRoot internal error: component initial render did not happen before data load timeout");
    }
};

Share.TargetRoot.prototype._dataRenderReady = function () {
    /// <summary>
    /// Checks to see whether it's time to render the data
    /// </summary>
    /// <returns type="Boolean">True if OK to render data, false otherwise</returns>

    // We have to wait for the data to be loaded in order to render data-related UI - _dataReady will be true if the data is loaded.
    // We also want to make sure that if we have shown the Loading UI, it has shown for some minimum time period before we render the data UI instead
    // to prevent it from "flashing" in.  
    // _initialUIReady is true if the loading UI has shown for the minimum time period.
    return this._initialUIReady && this._dataReady;
};

Share.TargetRoot.prototype._startRenderData = function (isPageLoad) {
    /// <summary>
    /// Renders data-related UI: canvas, subject
    /// </summary>
    /// <param name="isPageLoad">Indicates whether this is the page load scenario (true), or a later load scenario (false)</param>

    // This function can potentially be called more than once if there is a timeout and then the async result completes.
    if (this._renderDataComplete) {
        Jx.log.verbose("Not rendering since render has already happened");
        return;
    }

    if (this._shareStarted) {
        // If the share has started already, we can skip animations.
        // renderData does need to be called, but it behaves slightly differently in this case.
        this._renderData();
        this._activateData();

    } else {
        // This method starts rendering:
        // transition out the loading UI (if appropriate), 
        // render the data-related UI, 
        // transition in the data-related UI.

        // Container for all the data-related UI
        var contentContainer = document.getElementById("shareContentArea");
        contentContainer.style.display = "-ms-grid";

        var that = this;
        var renderFunction = function ShareTargetRoot_startRenderData_renderActivateData() {
            // Once the loading text is gone, render the new content on top.
            // We could potentially try rendering the data earlier and animating separately, but I'll leave that to future optimizers.
            that._renderData();
            that._activateData();
            if (isPageLoad) {
                // Recommendation from PVL team is to use fadeIn if bringing in the data immediately after the rest of the content is animated in
                WinJS.UI.Animation.fadeIn(contentContainer);
            } else {
                // When replacing the existing loading text we should use exit/enter content.
                WinJS.UI.Animation.enterContent(contentContainer);
            }
        };

        if (!isPageLoad) {
            // Hide the loading UI with exitContent before rendering the data
            WinJS.UI.Animation.exitContent(contentContainer).
                then(
                    function ShareTargetRoot_startRenderData_animationThen() {
                        // This allows unhandled exceptions in the renderFunction to properly bubble up to the page exception handler
                        setImmediate(renderFunction);
                    }
                );
        } else {
            // Remove loading (it hasn't been visible yet) and then render data
            contentContainer.innerHTML = "";
            renderFunction();
        }
    }

    this._renderDataComplete = true;
};

Share.TargetRoot.prototype._renderData = function () {
    /// <summary>
    /// Actually renders data-related UI
    /// Called by _startRenderData
    /// </summary>

    // Rendering in progress mode is necessary because the components don't work properly if not activated
    // It may be worth investigating an alternative approach
    var contentContainer;
    if (!this._shareStarted) {
        contentContainer = document.getElementById("shareContentArea");
    } else {
        contentContainer = document.getElementById("shareProgressHidden");
    }

    var dataErrorMessage = this._getDataErrorMessage();

    var dataHtml =
        '<div id="shareSubjectArea">' +
            '<div id="shareSubjectBorder"><input id="shareSubject" type="text" maxlength="250" data-win-res="placeholder:composeSubjectPlaceholder;aria-label:/sharetargetstrings/subjectLabel" spellcheck="true" /></div>' +
        '</div>';

    var attachmentArea = '';
    if (this._attachmentWrapper) {
        attachmentArea = Jx.getUI(this._attachmentWrapper).html;
    } else if (dataErrorMessage) {
        // We don't have any data. For this case, we'll render an error string in the attachment area, but allow the user to share anyway.
        attachmentArea = '<div class="share-awError">' + Jx.escapeHtml(dataErrorMessage) + '</div>';
    }

    dataHtml +=
        '<div id="shareAttachmentWell">' +
            attachmentArea +
        '</div>' +
        '<div id="shareMsgBoxContainer">' +
            '<div id="shareMsgBox" aria-label="' + Jx.escapeHtml(Jx.res.getString(Share.Constants.stringsPrefix + "messageBoxLabel")) + '"></div>' +
        '</div>';

    contentContainer.innerHTML = dataHtml;

    Jx.log.verbose("_renderData finished");
};

Share.TargetRoot.prototype._activateData = function () {
    /// <summary>
    /// Activates renders data-related UI
    /// Called by _startRenderData
    /// </summary>

    // Prefill subject box with subject text
    var subject = document.getElementById("shareSubject");
    subject.addEventListener("change", this._fireSubjectChanged, false);
    subject.value = this._data.subject;

    // Localize the HTML
    var contentContainer = document.getElementById("shareContentArea");
    Jx.res.processAll(contentContainer);

    if (this._attachmentWrapper) {
        this._attachmentWrapper.activateUI();
    }

    // Create the canvas
    this._createCanvasAsync()
        .done(/*@bind(Share.TargetRoot)*/function () {
            Jx.log.verbose("ShareTargetRoot - data children ready");
            this._dataChildrenReady = true;

            // If the user has already started the share, we need to start the send process once the canvas is ready
            if (this._shareStarted) {
                this._canvas.callWhenContentReady(this._canvasContentReadyCallback.bind(this));
            }
        }.bind(this));
};

Share.TargetRoot.prototype._fireSubjectChanged = function () {
    /// <summary>
    /// Fires the subject change event for the attacmentWell
    /// </summary>

    Jx.EventManager.fire(null, "subjectChanged", { subject: document.getElementById("shareSubject").value });
};

Share.TargetRoot.prototype._createCanvasAsync = function () {
    /// <summary>
    /// Creates the canvas control, attaches to DOM.
    /// Must happen after getUI.
    /// </summary>

    // Prepare for the from control / canvas signature interaction - get the mail account
    var fromAccount;
    if (this._fromCtrl) {
        fromAccount = this._fromCtrl.selectedAccount;
    } else {
        Debug.assert(this._data.account, "Did not have a saved from account when the from control is no longer available");
        fromAccount = this._data.account;
    }
    
    // Set up the Mail.Globals.appSettings for canvas
    window.Mail = { Globals: {}};
    
    // Set up the styling. The /"/g regex replaces all " with ' in order to keep quotes from being escaped by the values
    var appSettings = window.Mail.Globals.appSettings = new Share.AppSettings(),
        style = '';

    style += (Boolean(appSettings.composeFontFamily)) ? 'font-family: ' + appSettings.composeFontFamily.replace(/"/g, "'") + ';' : "";
    style += (Boolean(appSettings.composeFontSize)) ? 'font-size: ' + appSettings.composeFontSize.replace(/"/g,"'") + ';' : "";
    style += (Boolean(appSettings.composeFontColor)) ? 'color: ' + appSettings.composeFontColor.replace(/"/g,"'") + ';' : "";
    
    this._style = style;

    var emptyLineContents = "<br>";

    // Create a contents div into which we will place all of the data we want put into the canvas
    var contents = document.createDocumentFragment();

    // Always start with an empty line
    contents.appendChild(this._createDivWithContents(emptyLineContents));

    if (Jx.isNonEmptyString(this._data.messageHtml)) {
        // Insert space above the HTML content to give the hint text space to display and allow the user to add text
        contents.appendChild(this._createDivWithContents(emptyLineContents));
        
        // We want to mark the HTML content as a non-editable block
        var nonEditableDiv = document.createElement("div"),
            htmlContentDiv = this._createDivWithContents(this._data.messageHtml, false /*useDefaultFont*/);
        nonEditableDiv.contentEditable = "false";
        nonEditableDiv.appendChild(htmlContentDiv);
        contents.appendChild(nonEditableDiv);
    }

    // Add the URI
    if (this._data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink)) {
        contents.appendChild(this._createDivWithContents(emptyLineContents));
        contents.appendChild(this._createDivWithContents(this._htmlFromUri(this._data.uri)));
    }

    // Add the source URI
    var sourceUri = this._data.sourceUri;
    if (Jx.isObject(sourceUri)) {
        // We only want to add the source URI if it's different from the shared URI
        if (!this._data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink) || !sourceUri.equals(this._data.uri)) {
            contents.appendChild(this._createDivWithContents(emptyLineContents));
            contents.appendChild(this._createDivWithContents(Jx.res.loadCompoundString(Share.MailConstants.stringsPrefix + "sourceLink", this._htmlFromUri(sourceUri))));
        }
    }

    // Store the dirty tracker
    this._canvasDirtyTracker = new ModernCanvas.Plugins.DirtyTracker();

    var canvasOptions = {
        className: "stm", // Sets up preset list of commands appropriate for share to mail
        mailMessage: this._data.mailMessage,
        mailAccount: fromAccount,
        plugins: {
            indent: new ModernCanvas.Plugins.Indent(),
            defaultFont: new ModernCanvas.Plugins.DefaultFont(),
            dirtyTracker: this._canvasDirtyTracker
        }
    };

    var urlToStreamMap;
    return this._createCanvasUrlToStreamMapAsync()
        .then(function (map) {
            urlToStreamMap = map;
        }, function (error) {
            // Occasionally createCanvasUrlToStreamMapAsync can throw; empty images are better than crashing in this case.
            Jx.fault("ShareToMail.ShareTargetRoot.js", "CreateCanvasUrlToStreamMap", error);
        })
        .then(function () {
            return ModernCanvas.createCanvasAsync(document.getElementById("shareMsgBox"), canvasOptions);
        })
        .then(function (canvasControl) {
            /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />

            this._canvas = canvasControl;
            canvasControl.setCueText(Jx.res.getString(Share.Constants.stringsPrefix + "messageBoxLabel"));

            if (this._data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html)) {
                // We need a few more arguments if we're passing HTML content
                canvasControl.addContent(
                    contents,
                    ModernCanvas.ContentFormat.documentFragment,
                    ModernCanvas.ContentLocation.start,
                    false,
                    urlToStreamMap,
                    this._data.shareOperation.data.properties.applicationListingUri);
            } else {
                // for other types of content (text), we only need the base content
                canvasControl.addContent(
                    contents,
                    ModernCanvas.ContentFormat.documentFragment,
                    ModernCanvas.ContentLocation.start);
            }

            // Hook up canvas / from control, this will switch the signature when the account is changed.
            if (this._fromCtrl) {
                this._fromCtrl.onAccountChanged = this._onFromAccountChanged.bind(this);
            }

            // Prevent the user from using undo on the previous insert
            canvasControl.clearUndoRedo();

            canvasControl.components.commandManager.setCommand(new ModernCanvas.Command("focusNext", this._focusNext.bind(this), { undoable: false }));
            canvasControl.components.commandManager.setCommand(new ModernCanvas.Command("focusPrevious", this._focusPrevious.bind(this), { undoable: false }));

            // Show the hint text even though there is probably already content / signature in it
            canvasControl.showCueText();

            this._canvasKeyDown = this._documentKeyDownHandler.bind(this);
            canvasControl.addEventListener("keydown", this._canvasKeyDown, false);

            return canvasControl;
        }.bind(this));
};

Share.TargetRoot.prototype._createCanvasUrlToStreamMapAsync = function () {
    /// <summary>
    /// Creates a map from image/resource URL to streams for the canvas control.
    /// </summary>
    
    if (this._data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html)) {
        // Because HTML is being passed to the canvas, create a URL to stream map for any image URLs in the HTML
        return ModernCanvas.createUrlToStreamMapAsync(this._data.shareOperation.data);
    } else {
        // No map is necessary since only text is being added to the canvas
        return WinJS.Promise.as();
    }
};

Share.TargetRoot.prototype._htmlFromUri = function (uri) {
    /// <summary>
    /// Generates the HTML for a link to a given URI
    /// </summary>
    /// <param name="uri" type="Windows.Foundation.Uri"></param>

    return "<a href='" + Jx.escapeHtml(uri.absoluteCanonicalUri) + "'>" + Jx.escapeHtml(uri.displayUri) + "</a>";
};

Share.TargetRoot.prototype._createDivWithContents = function (html, useDefaultFont) {
    /// <summary>
    /// Generates a new div element with the given html as its contents
    /// </summary>
    /// <param name="html" type="String"></param>
    /// <param name="useDefaultFont" type="Boolean" optional="true"></param>

    // Use the default font unless noted otherwise
    useDefaultFont = Jx.isBoolean(useDefaultFont) ? useDefaultFont : true;
    var div = document.createElement("div");
    div.innerHTML = window.toStaticHTML(html);

    if (useDefaultFont) {
        div.classList.add("defaultFont");
        div.setAttribute("style", this._style);
    }

    return div;
};

Share.TargetRoot.prototype._onFromAccountChanged = function (account) {
    /// <summary>
    /// Handles account change in the from account control.
    /// </summary>
    if (Boolean(account)) {
        this._canvas.setMailAccount(account);
        this._address.setContextualAccount(account);
    }
};

Share.TargetRoot.prototype._focusNext = function () {
    /// <summary>Moves focus to the next element outside of the body</summary>
    this._shareButton.focus();
};

Share.TargetRoot.prototype._focusPrevious = function () {
    /// <summary>Moves focus to the previous element outside of the body</summary>
    if (Boolean(this._attachmentWrapper) && Boolean(this._attachmentWrapper.attachmentWell) && !this._attachmentWrapper.attachmentWell.isHidden()) {
        this._attachmentWrapper.attachmentWell.focus();
    } else {
        document.getElementById("shareSubject").focus();
    }
};

Share.TargetRoot.prototype._readyForSend = function () {
    /// <summary>
    /// Helper function checks to see whether we're ready to start sending the mail
    /// </summary>
    /// <returns type="Boolean">True if ready to send, false otherwise</returns>

    // We allow the share button to be clicked before everything is ready, so we need to make sure everything is ready before actually sending:
    // 1. Share button needs to have been clicked
    // 2. We need to wait for the attachments to finish loading (if there are attachments)
    // 3. Quicklink needs to be finished
    // 4. We need to wait for the data to finish loading/rendering, if it hasn't already.
    // 5. We need to wait for the canvas to finish parsing its own content (for instance, in the case of a paste with images)

    Jx.log.verbose("readyForSend check: " + this._shareStarted.toString() + ", " + this._uploadCompleted.toString() + ", " + this._bitmapAttached.toString() + ", " + this._quickLinkCompleted.toString() + ", " + this._dataChildrenReady.toString() + ", " + this._canvasContentReady.toString());

    // Ready if button has been clicked, files are successfully attached to the mail, the quicklink is ready, and the data components have been activated.
    return this._shareStarted && this._uploadCompleted && this._bitmapAttached && this._quickLinkCompleted && this._dataChildrenReady && this._canvasContentReady;
};

Share.TargetRoot.prototype._shareClick = function () {
    /// <summary>
    /// This is the event handler for share button click
    /// </summary>

    // Save this for later - it affects how we deal with the case where we couldn't find any data to share.
    this._wasDataReadyOnSend = this._dataChildrenReady;

    Jx.log.info("Share click event handled");

    // First check if the address well has invalid recipients, if so, display an inline error
    var addressWellErrorElement = document.getElementById("shareAddressError");
    var addressError = this._address.getError();
    if (Jx.isNonEmptyString(addressError)) {
        Jx.log.info("AddressWell error: " + addressError);
        // Show the error message, and scroll to it so that the user can see it.
        addressWellErrorElement.innerText = addressError;
        Jx.addClass(addressWellErrorElement, "errorVisible");
        document.getElementById("shareFlyout").scrollTop = 0;
    } else if (!this._shareStarted) {
        // Remove inline error
        addressWellErrorElement.innerText = "";
        Jx.removeClass(addressWellErrorElement, "errorVisible");

        Share.mark("Send", Share.LogEvent.start);

        // Register as an extended Share - at this point the user can close the window without losing the share.
        this._data.shareOperation.reportStarted();
        this._data.shareOperation.dismissUI();

        // Start the quicklink process
        var recipientArray = this._address.getRecipients();
        if ((Jx.isArray(recipientArray)) && (0 < recipientArray.length) && (recipientArray.length <= 3)) {
            this._constructQuicklink(recipientArray);
        } else {
            // Not doing quicklinks
            Jx.log.verbose("ShareTargetRoot: no quicklinks");
            this._quickLinkCompleted = true;
        }

        // See if we need to wait for attachments
        if (this._attachmentWrapper) {
            this._uploadCompleted = this._attachmentWrapper.isReady();
        }
        this._wasAttachReadyOnSend = this._uploadCompleted; // Saved for BICI

        // Check if the body content is done loading
        if (this._canvas) {
            if (this._canvas.isContentReady()) {
                this._canvasContentReady = true;
            } else {
                // It's not done, wait for it to complete
                this._canvas.callWhenContentReady(this._canvasContentReadyCallback.bind(this));
            }
        }

        // Grabs information out of the non-data-dependent child components. This will also shut down those components.
        this._getDataAndRemoveChildren();

        this._shareStarted = true;

        // If we're ready, begin the share.  Otherwise, _beginShare should happen after finishing quicklinks, data, or attachment load.
        // See comments in _readyForSend for details.
        if (this._readyForSend()) {
            this._beginShare();
        }

        // Switch to progress UI
        this._showProgress();
    }
};

Share.TargetRoot.prototype._canvasContentReadyCallback = function () {
    /// <summary>
    /// Called when the canvas has finished manipulating its content and is ready for send
    /// </summary>

    // This is a callback
    Debug.assert(this instanceof Share.TargetRoot);

    this._canvasContentReady = true;

    // This could be the last thing we're waiting on for sending the mail - if so, send the mail.
    // See comments in _readyForSend for details.
    if (this._readyForSend()) {
        this._beginShare();
    }
};

Share.TargetRoot.prototype._getDataAndRemoveChildren = function () {
    /// <summary>
    /// Grabs data out of the non-data UI components for sharing
    /// Also shuts down and removes these children
    /// </summary>

    // Fill out the data object based on the UI components not in the data area

    // Create the mail if it doesn't already exist
    if (Jx.isNullOrUndefined(this._data.mailMessage)) {
        this._createMailMessage();
    }

    // AddressWell
    this._data.mailMessage.to = this._address.getRecipientsStringInNameEmailPairs();
    this._recipientsCount = this._address.getRecipients().length;

    this._getFromControlData();

    // Save the from account for use later
    this._data.account = this._fromCtrl.selectedAccount;

    this._shutdownAndRemoveChild(this._address);
    this._shutdownAndRemoveChild(this._fromCtrl);
    this._shutdownAndRemoveChild(this._shareButton);
    this._address = null;
    this._fromCtrl = null;
    this._shareButton = null;
};

Share.TargetRoot.prototype._getFromControlData = function () {
    var fromAccount = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/this._fromCtrl.selectedAccount,
        fromEmail = this._fromCtrl.selectedEmailAddress;
    this._lastFromAccountId = this._data.mailMessage.accountId = fromAccount.objectId;

    var from = FromControl.buildFromString(fromEmail, fromAccount);
    this._data.mailMessage.from = from;
};

Share.TargetRoot.prototype._getDataAndRemoveDependentChildren = function () {
    /// <summary>
    /// Grabs data out of the data-related UI components for sharing
    /// Shuts down and removes the children
    /// Also fires BICI event
    /// </summary>

    // Fill out the data object based on data-specific components

    // Get the body out of the canvas
    this._canvas.finalizeMailMessage();
    var htmlString = ModernCanvas.ContentFormat.htmlString,
        content = this._canvas.getContent([htmlString]);
    this._data.messageHtml = content[htmlString];
    var body = this._data.mailMessage.getBody();
    body.body = this._data.messageHtml;
    var canvasCharacterCount = this._canvas.getCharacterCount(),
        canvasIsDirty = this._canvasDirtyTracker.isDirty;
    this._canvas.removeEventListener("keydown", this._canvasKeyDown, false);
    this._canvas.dispose();
    this._canvas = null;
    this._canvasKeyDown = null;

    // Set the subject on the mail.
    var subjectElement = document.getElementById("shareSubject");
    this._data.subject = this._data.mailMessage.subject = subjectElement.value;
    subjectElement.removeEventListener("change", this._fireSubjectChanged, false);

    // AttachmentWell
    if (!Jx.isNullOrUndefined(this._attachmentWrapper) && !Jx.isNullOrUndefined(this._attachmentWrapper.attachmentWell)) {
        this._shutdownAndRemoveChild(this._attachmentWrapper);
        this._attachmentWrapper = null;
    }

    // Fire BICI event
    this._sendBici(false /*Old SOXE-Related point "link was customized", not used anymore*/, this._recipientsCount, canvasCharacterCount, canvasIsDirty);
};

Share.TargetRoot.prototype._sendBici = function (isCustomLink, numRecipients, messageLength, isDirty) {
    /// <summary>
    /// Records BICI datapoint for share
    /// </summary>
    /// <param name="isCustomLink" type="Boolean">Indicates whether the user has customized the link information</param>
    /// <param name="numRecipients" type="Number">Number of recipients</param>
    /// <param name="messageLength" type="Number">Character count of message</param>
    /// <param name="isDirty" type="Boolean">Whether or not the canvas is dirty</param>

    // Put together BICI data. 
    var isDataReady = (this._wasAttachReadyOnSend && this._wasDataReadyOnSend) ? 1 : 0,
        dataPackage = /*@static_cast(Windows.ApplicationModel.DataTransfer.DataPackageView)*/ this._data.shareOperation.data,
        appName = "UNKNOWN_APP";
    try {
        appName = dataPackage.properties.applicationName;
    } catch (e) {
        // WinLive 625004 / 603261 - sometimes there is an exception here during automation. Oddly enough, this try/catch seems to prevent the exception.
        Jx.log.exception(e, "Error accessing ApplicationName");
    }
    var biciIds = Microsoft.WindowsLive.Instrumentation.Ids,
        sendMailBiciId = biciIds.Mail.sendMailModern;
    NoShip.log("ShareTargetRoot.sendBICI: Calling bici.addToStream");
    Jx.bici.addToStream(
        sendMailBiciId,
        messageLength,
        numRecipients,
        this._data.subject.length,
        null, // shareType has been deprecated
        appName,
        isCustomLink ? 1 : 0,
        isDataReady);

    var shareToMailOnSendBiciId = biciIds.Mail.shareToMailOnSend;
    Jx.bici.addToStream(
        shareToMailOnSendBiciId,
        isDirty ? 1 : 0,
        appName);
};

Share.TargetRoot.prototype._shareCancel = function () {
    /// <summary>
    /// Handles the "cancel" button click
    /// </summary>

    // Delete the mail message to prevent it from being sent.
    this._shareService.cancelShare(this._data);
};

Share.TargetRoot.prototype._showProgress = function () {
    /// <summary>
    /// Switches the target to the progress UI, and deactivate child controls.
    /// </summary>

    // Initialize the progress component.
    this._progress = new Share.Progress();
    this.append(this._progress);

    // Replace HTML with progress and localize
    var progressContainer = document.createElement("div");
    progressContainer.style.display = "none";
    progressContainer.innerHTML = Jx.getUI(this._progress).html;
    var flyoutContainer = document.getElementById("shareFlyout");
    var container = flyoutContainer.parentNode;
    container.appendChild(progressContainer);

    Jx.res.processAll(progressContainer);

    var that = this;

    // Activate the progress component
    this._progress.activateUI();
    this._progress.addListener("cancel", this._shareCancel, this);

    Share.mark("Send_animation", Share.LogEvent.start);
    WinJS.UI.Animation.exitPage(flyoutContainer, null).
        then(
            function ShareTargetRoot_showProgress_exitPageComplete() {
                // Once the animation is complete, move the previous page HTML.

                if (!that._readyForSend()) {
                    // We need to keep the data-related component UI around in a hidden div until we've finished using them.
                    var dataUIContainer = document.getElementById("shareContentArea");
                    dataUIContainer.parentNode.removeChild(dataUIContainer);

                    var hiddenContainer = document.getElementById("shareProgressHidden");
                    hiddenContainer.appendChild(dataUIContainer);
                }

                // remove remaining UI.
                flyoutContainer.parentNode.removeChild(flyoutContainer);
            }
        ).
        then(function ShareTargetRoot_showProgress_startEnterPage() {
            // The enterPage animation requires that you set the desired end-result properties immediately before the animation
            progressContainer.style.display = "block";
            return WinJS.UI.Animation.enterPage(progressContainer, null);
        }).then(function ShareTargetRoot_showProgress_animationComplete() {
            that._progress.animateUI();
            Share.mark("Send_animation", Share.LogEvent.end);
            Share.mark("Send", Share.LogEvent.end);
        });

    // Remove listener for handling keyboard shortcuts
    this._detachDocumentListeners();
};

Share.TargetRoot.prototype._calculateQuicklinkName = function (recipient) {
    /// <summary>
    /// Get a string to use for the name for a given recipient in a group. The current preference order is calculatedUIName then email.
    /// </summary>
    /// <param name="recipient" type="Microsoft.WindowsLive.Platform.IRecipient">The recipient to calculate the name for.</param>
    /// <returns type="string">The string for the given recipient.</returns> 

    var usersName = null;
    if (Jx.isNonEmptyString(recipient.calculatedUIName)) {
        usersName = recipient.calculatedUIName;
    } else {
        usersName = recipient.emailAddress;
    }

    return usersName;
};

Share.TargetRoot.prototype._constructQuicklink = function (recipients) {
    /// <summary>
    /// Construct the quicklink to send to the share platform. Then calls beginShare which will send the shareData to the backend.
    /// </summary>
    /// <param name="recipients" type="Array">Array of IRecipients.</param>

    // setup the quicklink
    this._quickLink = new Windows.ApplicationModel.DataTransfer.ShareTarget.QuickLink();
    var emailArray = [];

    // order the quicklink emails to prevent duplication
    for (var i = 0; i < recipients.length; i++) {
        emailArray[i] = recipients[i].emailAddress;
    }

    // sort the email addresses
    emailArray.sort();
    // construct the quicklink with the ordered string
    this._quickLink.id = emailArray.join(";");
    this._quickLink.id += ';';

    // Save the account from which we are sending this email
    this._quickLinkData.associateFromAccount(this._quickLink.id, this._fromCtrl.selectedAccount);

    // If we only have one recipient get tile for the user for use in quicklinks
    if (recipients.length === 1) {
        this._quickLink.title = Jx.res.loadCompoundString(Share.MailConstants.stringsPrefix + "quickLinkSingleEmail", this._calculateQuicklinkName(recipients[0])); // Title for user

        if (!Jx.isNullOrUndefined(recipients[0].person)) {
            // This image gets sent to the share platform where they scale it to 128x128 to save and then scale again on render (~40px).  
            // Scaling down is better. extraLarge is always larger than 128.
            var userTileStream = AddressWell.getUserTileStream(recipients[0].person, Microsoft.WindowsLive.Platform.UserTileSize.extraLarge);
            if (!Jx.isNullOrUndefined(userTileStream)) {
                this._quickLink.thumbnail = this._createFromStream(userTileStream);
            }
        }

    } else if (recipients.length === 2) {
        this._quickLink.title = Jx.res.loadCompoundString(Share.MailConstants.stringsPrefix + "quickLinkDoubleEmail", this._calculateQuicklinkName(recipients[0]), this._calculateQuicklinkName(recipients[1])); // Title for user

    } else {
        this._quickLink.title = Jx.res.loadCompoundString(Share.MailConstants.stringsPrefix + "quickLinkTripleEmail", this._calculateQuicklinkName(recipients[0]), this._calculateQuicklinkName(recipients[1]), this._calculateQuicklinkName(recipients[2])); // Title for user
    }

    // Get thumbnail if a group, or the user does not have one.
    if (Jx.isNullOrUndefined(this._quickLink.thumbnail)) {
        var fileSuccessCallback = this._finishQuickLink.bind(this);
        var fileErrorCallback = this._quicklinkFileError.bind(this);
        // setImmediate removes the callback from the promise call stack, allowing errors to propagate up to the global window error handler
        Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("Resources\\ModernShareTarget\\images\\MailQuickLinkIcon.png").
            done(
                function shareTargetRoot_constructQuicklink_getFileThen(result) { setImmediate(fileSuccessCallback, result); },
                function shareTargetRoot_constructQuicklink_getFileError(result) { setImmediate(fileErrorCallback, result); }
            );
    } else {
        // Complete quicklink
        this._setQuicklinkFormats(this._quickLink);

        Jx.log.verbose("Quicklink complete");

        this._data.quickLink = this._quickLink;
        this._quickLinkCompleted = true;

        // This could be the last thing we're waiting on for sending the mail - if so, send the mail.
        // See comments in _readyForSend for details.
        if (this._readyForSend()) {
            this._beginShare();
        }
    }
};

Share.TargetRoot.prototype._quicklinkFileError = function (error) {
    /// <summary>
    /// Error callback while getting the quicklink thumbnail
    /// </summary>
    /// <param name="error" type="Error">The error encountered while calling getFileAsync.</param>

    if (this.isShutdown()) {
        // This is a callback, check to make sure the component is still around before proceeding.
        return;
    }

    if (error) {
        Jx.log.exception("Share.TargetRoot: Quicklink thumbnail could not be retrieved", error);
    } else {
        Jx.log.error("Share.TargetRoot: Quicklink thumbnail could not be retrieved");
    }

    // Send mail despite not being able to get the thumbnail
    // May not yet be ready for send - see comments in readyForSend for details.
    this._quickLinkCompleted = true;
    if (this._readyForSend()) {
        this._beginShare();
    }
};

Share.TargetRoot.prototype._finishQuickLink = function (storageFile) {
    /// <summary>
    /// Callback for generic quicklink thumbnail load.
    /// Gets the thumbnail for the generic tile and starts the share (if ready)
    /// </summary>
    /// <param name="storageFile" type="Windows.Storage.IStorageFile">The pawn image for the quicklink tile.</param>

    if (this.isShutdown()) {
        // This is a callback, check to make sure the component is still around before proceeding.
        return;
    }

    try {
        var thumnailStreamRef = Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(storageFile);
        this._quickLink.thumbnail = thumnailStreamRef;
        // Setup our expected data formats for which the quicklink will appear
        this._setQuicklinkFormats(this._quickLink);
        this._data.quickLink = this._quickLink;

    } catch (ex) {
        Jx.log.exception("Could not retrieve the thumbnail reference for the generic pawn", ex);
    }

    Jx.log.verbose("Quicklink thumbnail complete with loaded image");

    // Initiate the share if ready.  See comments in readyForSend for details.
    this._quickLinkCompleted = true;
    if (this._readyForSend()) {
        this._beginShare();
    }
};

Share.TargetRoot.prototype._setQuicklinkFormats = function (quicklink) {
    /// <summary>
    /// Fills out the supportedDataFormats / supportedFileTypes fields of the quicklink object
    /// </summary>
    /// <param name="quicklink" type="Windows.ApplicationModel.DataTransfer.ShareTarget.QuickLink">Quicklink object for which supportedDataFormats should be populated</param>

    quicklink.supportedFileTypes.replaceAll(["*"]);
    quicklink.supportedDataFormats.replaceAll(this._handledShareTypes);
};

Share.TargetRoot.prototype._beginShare = function () {
    /// <summary>
    /// Begins the share
    /// </summary>

    Jx.log.verbose("ShareTargetRoot: quicklinks and data are ready for send, beginning share process");

    var dataErrorMessage = this._getDataErrorMessage();

    if (!Jx.isNullOrUndefined(this._attachmentWrapper)) {
        // Check if the attachments are valid for sending
        this._callValidate();
        // Finalize for send calls the sqm datapoints for mail.
        this._attachmentWrapper.attachmentWell.finalizeForSend();
    }

    if (!this._wasDataReadyOnSend && Boolean(dataErrorMessage)) {
        Jx.log.info("Share.TargetRoot reporting error since there was an error loading the data, but the user had already clicked send");
        // If the data wasn't loaded when the user clicked share, and there isn't any data, then report this share as an error.
        // This prevents us from sending blank emails
        this._data.shareOperation.reportError(dataErrorMessage);
        return;
    }

    // Grab the data out of the UI components before sharing, shut down those children
    this._getDataAndRemoveDependentChildren();

    if (Jx.appData.localSettings().get("RetailExperience")) {
        // Use the retail share service in retail mode; it handles the share differently.
        // Load RetailShareService
        var node = document.createElement("script");
        node.type = "text/javascript";
        node.src = "/modernsharetarget/retailshareservice.js";
        document.head.appendChild(node);

        this._shareService = new Share.RetailShareService();
    } else {
        this._shareService = new Share.ShareService();
    }

    Jx.log.verbose("Share.TargetRoot: Initiating share");

    // Listen for the message to be sent so we can clean our quicklink data
    var cleanQuickLinks = function () {
        Jx.EventManager.removeListener(null, Share.MailConstants.messageSentEvent, cleanQuickLinks);
        this._cleanQuickLinks();
    };
    Jx.EventManager.addListener(null, Share.MailConstants.messageSentEvent, cleanQuickLinks, this);

    this._shareService.initiateShare(this._data);
};

Share.TargetRoot.prototype._cleanQuickLinks = function () {
    /// <summary>
    /// Cleans out any old quick links to prevent the list from bloating
    /// </summary>

    // This is a callback
    Debug.assert(this instanceof Share.TargetRoot);

    this._quickLinkData.clean(Share.MailConstants.maximumQuicklinkDataCount /* size of list at which cleaning kicks in */,
                              Share.MailConstants.daysToKeepQuicklinkData /* number of days' worth of contacts to keep */);
};

Share.TargetRoot.prototype._attachDocumentListeners = function () {
    /// <summary>
    /// Defines and attaches a handler for keydown event on the current document.
    /// </summary>

    if (this._documentKeyDown === null) {
        this._documentKeyDown = this._documentKeyDownHandler.bind(this);
        document.addEventListener("keydown", this._documentKeyDown, false);
    }
};

Share.TargetRoot.prototype._detachDocumentListeners = function () {
    /// <summary>
    /// Removes the handler for keydown event on the current document.
    /// </summary>

    if (this._documentKeyDown !== null) {
        document.removeEventListener("keydown", this._documentKeyDown, false);
        this._documentKeyDown = null;
    }
};

Share.TargetRoot.prototype._documentKeyDownHandler = function (ev) {
    /// <summary>
    /// The keydown event handler for the document.
    /// </summary>
    /// <param name="ev" type="Event">the keyboard event.</param>

    var key = ev.key;

    var modifier = 0;
    if (ev.altKey) {
        modifier |= 0x1;
    }
    if (ev.ctrlKey) {
        modifier |= 0x2;
    }
    if (ev.shiftKey) {
        modifier |= 0x4;
    }

    // Detects key combinations that we are interested in and performs appropriate action
    // Note: We should only proceed with the key modifier that we are interested in without the interference from another key modifier, e.g. we should only trigger on Alt + s and not on Alt + Ctrl + s (WinLive 603435),
    // Note: WinLive 603512 to check if we should enforce the same rule for Ctrl + Enter scenario
    if ((ev.ctrlKey && key === "Enter") || (modifier === 0x1 && key === "s")) {
        // Simulate clicking the share button
        this._shareClick();
    }
};

Share.TargetRoot.prototype._getDataErrorMessage = function () {
    /// <summary>
    /// If there is an error, returns the appropriate user-facing error message
    /// </summary>
    /// <returns type="String">Error message, or null if no error.</returns>

    var errorMessage = null;

    if (this._data.errorCategory === Share.Constants.DataError.invalidFormat) {
        errorMessage = Jx.res.getString("/sharetargetstrings/shareDataErrorFormat");
    } else if (this._data.errorCategory === Share.Constants.DataError.internalError) {

        // Generic - include the error code in the message if we have one.
        var numberString = this._data.getErrorCodeString();
        if (numberString) {
            errorMessage = Jx.res.loadCompoundString("/sharetargetstrings/shareDataErrorGenericCode", numberString);
        } else {
            // Don't put generic fail error code into the message, that's not useful.
            errorMessage = Jx.res.getString("/sharetargetstrings/shareDataErrorGeneric");
        }
    } else {
        Debug.assert(this._data.errorCategory === Share.Constants.DataError.none, "Unexpected value for errorCategory: " + /*@static_cast(String)*/this._data.errorCategory);
    }

    return errorMessage;
};

Share.TargetRoot.shutdownApp = function () {
    /// <summary>
    /// "Static" method shuts down the share target page and Jx application
    /// </summary>

    var application = /* @static_cast(Jx.Application)*/ Jx.app;
    var root = /* @static_cast(Share.TargetRoot)*/Jx.root;
    if (application && root) {
        // Notify the TargetRoot that the window is closing
        root.shareClose();

        application.shutdownUI();
        application.shutdown();
    }
};

Share.TargetRoot.prototype._keyboardShow = function (e) {
    /// <summary>
    /// Event handler for keyboard show event
    /// We handle our own positioning / scroll logic for the keyboard
    /// </summary>
    /// <param name="e" type="Windows.UI.ViewManagement.InputPaneVisibilityEventArgs">Keyboard show event arguments</param>

    // Tell the keyboard we'll be handling the positioning / scrolling logic
    e.ensuredFocusedElementInView = true;

    var flyoutElement = document.getElementById("shareFlyout");
    
    // Animate the flyout to stop at the bottom of the keyboard
    // When finished, scroll into view appropriately.
    var newPosition = e.occludedRect.height + "px";
    flyoutElement.style.bottom = newPosition;
    WinJS.UI.executeAnimation(flyoutElement, {
        property: "bottom",
        delay: 0,
        duration: 367,
        timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
        from: "0px",
        to: newPosition
    }).done(this._scrollIntoView, this._scrollIntoView);
};

Share.TargetRoot.prototype._keyboardHide = function () {
    /// <summary>
    /// Event handler for keyboard hide event
    /// We handle our own positioning / scroll logic for the keyboard
    /// </summary>

    var flyoutElement = document.getElementById("shareFlyout");

    if (!Jx.isNullOrUndefined(flyoutElement)) {
        // Save start position
        var startPosition = flyoutElement.style.bottom;

        // Set the position we expect at the end of the animation
        flyoutElement.style.bottom = "0px";

        // Animate in time with the keyboad
        WinJS.UI.executeAnimation(flyoutElement, {
            property: "bottom",
            delay: 0,
            duration: 367,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            from: startPosition,
            to: "0px"
        }).done(null, function (e) {
            Debug.assert(false, "_keyboardHide animation failed: " + e);
        });
    }
};

Share.TargetRoot.prototype._scrollIntoView = function () {
    /// <summary>
    /// Makes sure that the focused element is in view
    /// </summary>

    // If it's the AddressWell, don't do anything.  It has its own scrolling logic.
    if (Boolean(this._address) && this._address.hasFocus()) {
        return;
    }

    var scrollArea = document.getElementById("shareScrollArea");

    // Make sure that the current selection point in the content area is scrolled into view
    // This code was stolen from Compose
    var startingLeft = scrollArea.scrollLeft;
    var selObj = document.getSelection();
    if (selObj.rangeCount > 0) {
        var element = /*@static_cast(HTMLElement)*/selObj.getRangeAt(0).commonAncestorContainer;
        if (element.nodeType !== element.ELEMENT_NODE) {
            element = element.parentNode;
        }
        AddressWell.scrollIntoViewIfNotInView(element, false, scrollArea);
    }
    // Restore the left scroll point of the content area, as the keyboard coming up should not affect this (but the call to scrollIntoView may).
    scrollArea.scrollLeft = startingLeft;
};


// Controls
Share.TargetRoot.prototype._attachmentWrapper = /*@static_cast(Share.AttachmentWrapper)*/ null;
Share.TargetRoot.prototype._canvas = /* @static_cast(ModernCanvas.ModernCanvas) */ null;
Share.TargetRoot.prototype._canvasDirtyTracker = null;
Share.TargetRoot.prototype._fromCtrl = /* @static_cast(FromControl.FromControl) */ null;
Share.TargetRoot.prototype._shareButton = /* @static_cast(Share.ShareButton) */ null;
Share.TargetRoot.prototype._progress = /* @static_cast(Share.Progress) */ null;
Share.TargetRoot.prototype._address = /* @static_cast(AddressWell.Controller)*/null;

// Font styling
Share.TargetRoot.prototype._style = "";

// Promises
Share.TargetRoot.prototype._dataLoadPromise = /*@static_cast(WinJS.Promise)*/null;
Share.TargetRoot.prototype._waitForDataTimeout = /*@static_cast(Number)*/null;

// State
Share.TargetRoot.prototype._dataReady = false; // this._data has been filled out with data
Share.TargetRoot.prototype._dataChildrenReady = false; // Data-dependent children are activated and ready
Share.TargetRoot.prototype._initialUIReady = false; // Whether the initial loading UI has rendered and has been visible for min time; ready to show data
Share.TargetRoot.prototype._renderDataComplete = false; // Whether data UI has started rendering (prevents multiple calls to render method)
Share.TargetRoot.prototype._uploadCompleted = false; // Has attachment upload completed
Share.TargetRoot.prototype._canvasContentReady = false; // Is the canvas done parsing its contents
Share.TargetRoot.prototype._bitmapAttached = false; // Has bitmap been attached
Share.TargetRoot.prototype._quickLinkCompleted = false; // Has the quicklink completed
Share.TargetRoot.prototype._shareStarted = false; // Internal state indicates whether a share has been started. True as soon as button click happens.
Share.TargetRoot.prototype._wasDataReadyOnSend = false; // Indicates whether the data had rendered at the time that the user clicked send.  
Share.TargetRoot.prototype._wasAttachReadyOnSend = false; // Indicates whether the attachments were ready at the time that the user clicked send.  
Share.TargetRoot.prototype._uiInitialized = false; // Indicates whether activateUI has been called

Share.TargetRoot.prototype._data = /* @static_cast(Share.MailData) */ null;
Share.TargetRoot.prototype._platform = /* @static_cast(Microsoft.WindowsLive.Platform.Client)*/null;
Share.TargetRoot.prototype._shareService = /*@static_cast(Share.ShareService)*/null;
Share.TargetRoot.prototype._quickLinkData = null;
Share.TargetRoot.prototype._quickLink = /*@static_cast(Windows.ApplicationModel.DataTransfer.ShareTarget.QuickLink)*/null;
Share.TargetRoot.prototype._createFromStream = Windows.Storage.Streams.RandomAccessStreamReference.createFromStream; // CreateFromStream function save in a variable for unit testing purposes
Share.TargetRoot.prototype._documentKeyDown = /* @static_cast(Function) */null; // Bound method for _documentKeyDownHandler (saved for removeEventListener)
Share.TargetRoot.prototype._canvasKeyDown = /* @static_cast(Function) */null; // Bound method for _documentKeyDownHandler (saved for removeEventListener)
Share.TargetRoot.prototype._recipientsCount = 0; // Number of recipients inside the address well
Share.TargetRoot.prototype._inputPane = null;

Share.TargetRoot.prototype._handledShareTypes = [Windows.ApplicationModel.DataTransfer.StandardDataFormats.html,
    Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink,
    Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems,
    Windows.ApplicationModel.DataTransfer.StandardDataFormats.text];

Object.defineProperty(Share.TargetRoot.prototype, "_lastFromAccountId", {
    enumerable: true,
    get: function () {
        return Jx.appData.localSettings().get("ShareToMailAccount") || "";
    },
    set: function (value) {
        Jx.appData.localSettings().set("ShareToMailAccount", value || "");
    }
});

Share.TargetRoot.prototype._startupError = Share.MailConstants.StartupError.none;

