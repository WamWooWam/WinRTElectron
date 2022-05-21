
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Jx,Debug,People,NoShip,Windows,WinJS,$include*/

Jx.delayDefine(People.Accounts, ["AccountSettingsControl", "AccountSettingsEvents", "AccountSettingsPage", "showAccountSettingsPage"], function () {

    var A = window.People.Accounts;

    var AccountSettingsEvents = A.AccountSettingsEvents = {
        opened: "People.Accounts.AccountSettingsEvents.opened",
        closed: "People.Accounts.AccountSettingsEvents.closed"
    };
    Object.freeze(AccountSettingsEvents);

    var AccountSettingsControl = A.AccountSettingsControl = /* @constructor */function (platform, scenario, flyout, launchedFromApp, jobSet) {
        // <summary>Constructor</summary>
        // <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        // <param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario"/>
        // <param name="flyout" type="WinJS.UI.SettingsFlyout">The flyout in which we are hosted</param>
        // <param name="launchedFromApp" type="Boolean" optional="true">true if the settings pane is activate directly from the app.</param>
        // <param name="jobSet" type="P.JobSet" optional="true"/>
        A.AccountControlBase.call(this, platform, scenario);

        Debug.assert(Jx.isObject(platform), "The platform object is non-optional");
        this._platform = platform;
        this._scenario = scenario;
        this._flyout = flyout;
        this._jobSet = jobSet;
        this._pageContent = /* @static_cast(Jx.Component)*/null;
        this._container = /* @static_cast(HTMLElement)*/null;
        this._launchedFromApp = !!launchedFromApp;
        this._msSetImmediateID = -1;

        this.initComponent();

        // Load the CSS
        //$include("$(sharedResources)/css/shared_styles.css");
        $include("$(cssResources)/" + Jx.getAppNameFromId(Jx.appId) + "AccountSettings.css");
    };
    Jx.augment(AccountSettingsControl, Jx.Component);
    Jx.augment(AccountSettingsControl, A.AccountControlBase);

    var AccountSettingsPage = A.AccountSettingsPage = {
        connectedAccounts: 0,
        upsells: 1,
        perAccountSettings: 2
    };
    Object.freeze(AccountSettingsPage);

    AccountSettingsControl.prototype.navigateToPage = function (page, account, firstLaunch) {
        // <summary>Navigates to a particular accounts view within the control</summary>
        // <param name="page" type="A.AccountSettingsPage"/>
        // <param name="account" type="Microsoft.WindowsLive.Platform.Account" optional="true">Only applicable if page == AccountSettingsPage.perAccountSettings</param>
        // <param name="firstLaunch" type="Boolean" optional="true">If it's first time launching the Account Settings flyout</param>
        Debug.assert(Jx.isHTMLElement(this._container), "You must host the control before calling AccountSettingsControl.navigateToPage()");
        Debug.assert(this._activePage !== page, "The page you are navigating to is already the active one.");
        var container = this._container;

        if (this._activePage !== page) {
            var pageContent;
            Jx.dispose(this._accountSync);
            this._accountSync = null;
            msClearImmediate(this._msSetImmediateID);
            this._msSetImmediateID = -1;

            switch (page) {
                case AccountSettingsPage.connectedAccounts:
                    var accountListOptions = { onPrimaryAction: function (account) {
                        var error = this._getCurrentError(account);
                        if (error === A.KnownAccountError.reconnectNeeded) {
                            this._launchWebAuthAddFlow(account, true/*reconnect*/);
                        } else if (error === A.KnownAccountError.upgradeNeeded) {
                            this._launchWebAuthAddFlow(account, false/*reconnect*/);
                        } else if (error === A.KnownAccountError.oauthCredentialError) {
                            var dlg = new A.AccountDialog(account,
                                                          A.AccountDialogMode.update,
                                                          this._scenario,
                                                          this._platform,
                                                          People.Bici.EntryPoint.accountSettings);
                            dlg.show();
                        } else {
                            this.navigateToPage(AccountSettingsPage.perAccountSettings, account);
                        }
                        return false;
                    } .bind(this),
                        supportsContextMenus: false,
                        showErrorStates: true,
                        largeIcons: true
                    };
                    pageContent = new A.AccountListControl(A.AccountListType.connectedUpsells, this._platform, this._scenario, "settings", accountListOptions);

                    this._makePageAriaLive(true);

                    container.querySelector("#asc_pageTitle").innerText = Jx.res.getString("/accountsStrings/asc-accountsTitle");
                    container.className = "asc asc-connectedPage";
                    break;
                case AccountSettingsPage.upsells:
                    pageContent = new A.AccountListControl(A.AccountListType.unfilteredUpsells, this._platform, this._scenario, "settings", { supportsContextMenus: false, largeIcons: true });

                    this._makePageAriaLive(true);

                    container.querySelector("#asc_pageTitle").innerText = Jx.res.getString("/accountsStrings/asc-addAnAccount");
                    container.className = "asc asc-upsellsPage";

                    if (!this._accountSync) {
                        var accountSync = this._accountSync = new A.AccountSynchronization(this._platform);
                        if (accountSync.areAccountsAvailable()) {
                            Debug.assert(this._msSetImmediateID === -1);
                            this._msSetImmediateID = msSetImmediate(function () { this._onUpsellAvailable(); } .bind(this));
                        } else {
                            accountSync.addListener("accountsAvailable", this._onUpsellAvailable, this);
                        }
                    }

                    break;
                case AccountSettingsPage.perAccountSettings:
                    Debug.assert(Jx.isObject(account));
                    pageContent = new A.PerAccountSettingsPage(this._platform, account, this._scenario, this._jobSet, !!firstLaunch /*delay focus setting*/);

                    this._makePageAriaLive(false);

                    container.querySelector("#asc_pageTitle").innerText = account.displayName;
                    container.className = "asc asc-perAccountSettingsPage";
                    break;
                default:
                    Debug.assert("unknown page given AccountSettingsControl.navigateToPage()");
                    break;
            }

            
            if (pageContent instanceof A.AccountListControl) {
                Jx.EventManager.addListener(pageContent, "ready", function () {
                    NoShip.People.etw("alReady_success");
                });
            }
            

            this._replacePageContent(pageContent);
            this._tooltipCheck();

            container.style.visibility = "visible";
            if (Jx.isNullOrUndefined(this._activePage)) {
                this._topmostPage = page; // record the enter/topmost page to back-button management.
            }
            Jx.safeSetActive(container.querySelector("#asc_backButton"));
            this._activePage = page;
        }
    };

    AccountSettingsControl.prototype.updateHeaderText = function () {
        /// <summary>Updates the text of the header to match the current displayName of the perAccountSetting's account. 
        /// Only applicable if perAccountSettings is the current page.</summary>
        if (AccountSettingsPage.perAccountSettings === this._activePage && this._pageContent) {
            // The account's displayName has likely changed, update our current header to match it.
            this._container.querySelector("#asc_pageTitle").innerText = this._pageContent.accountName;
        }
    };

    AccountSettingsControl.prototype.flyoutReady = function () {
        Jx.safeSetActive(this._container.querySelector("#asc_backButton"));
        if (this._pageContent.flyoutReady) {
            this._pageContent.flyoutReady();
        }
    };

    // Jx.Component
    AccountSettingsControl.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        this._id = "idAccountSettings_" + Jx.uid();
        ui.html =
            "<div id='" + this._id + "' class='asc' >" +
                "<div id='asc_page' class='asc-page' aria-live='polite' aria-relevant='all' aria-atomic='false'>" +
                    "<div class='win-header asc-header win-ui-dark'>" +
                        "<button id='asc_backButton' type='button' class='win-backbutton asc-backButton' aria-label='" + Jx.escapeHtml(Jx.res.getString("/accountsStrings/asc-backButtonAriaLabel")) + "'></button>" +
                        "<div id='asc_pageTitle' class='asc-title singleLineText' role='heading'></div>" +
                        "<div class='asc-appIcon'></div>" +
                    "</div>" +
                    "<div class='win-content'>" +
                        "<div id='asc_pageContent' class='asc_pageContent'></div>" +
                        "<div class='asc-separator'></div>" +
                        "<div id='asc_addAccountLink' class='asc-addAccountLink' tabIndex='0' role='link'></div>" +
                    "</div>" +
                "</div>" +
            "</div>";
    };

    AccountSettingsControl.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.Component.prototype.activateUI.call(this);

        var container = this._container = document.getElementById(this._id);
        container.style.visibility = "hidden"; // Hide the control until the first navigation occurs.

        var link = container.querySelector("#asc_addAccountLink");
        link.addEventListener("click", this._onAddAnAccount.bind(this), false);
        link.addEventListener("keyup", this._onKeyDown.bind(this), false);
        link.innerText = Jx.res.getString("/accountsStrings/asc-addAnAccount");

        var backBtn = container.querySelector("#asc_backButton");
        backBtn.addEventListener("click", this._onBack.bind(this), false);

        // Redirect explicit focus events sent to the container itself to the back-button.
        container.addEventListener("focus", function () {
            Debug.assert(Jx.isHTMLElement(backBtn));
            backBtn.focus();
        }, false);
    };

    AccountSettingsControl.prototype._tooltipCheck = function () {
        // Check if a tooltip is need from the header text
        var headerTitle = this._container.querySelector("#asc_pageTitle");
        headerTitle.title = ((headerTitle.scrollWidth > headerTitle.clientWidth) ? headerTitle.innerText : "");
    };

    AccountSettingsControl.prototype._onUpsellAvailable = function () {
        /// <summary>Event handler for the AccountSynchronization's "accountsAvailable" event</summary>
        Debug.assert(this._pageContent);
        Debug.assert(this._pageContent instanceof A.AccountListControl);
        this._msSetImmediateID = -1;

        if (this._pageContent.getCount() <= 0) {
            // No available upsells. Inform the user, rather than just showing a blank pane.
            this._replacePageContent(new NoUpsellsContent());
        }
    };

    AccountSettingsControl.prototype._makePageAriaLive = function (makeLive) {
        /// <summary>Enables or disables the aria-live property on the settings page, 
        /// i.e. the main contents of the pane.</summary>
        var page = this._container.querySelector("#asc_page");
        if (Jx.isHTMLElement(page)) {
            page.setAttribute("aria-live", (makeLive ? "polite" : "off"));
        }
    };

    AccountSettingsControl.prototype._replacePageContent = function (pageContent) {
        /// <summary>Replaces the content page content with the given control</summary>
        /// <param name="pageContent" type="Jx.Component"/>
        Debug.assert(pageContent);

        if (Jx.isObject(this._pageContent)) {
            // Remove the current content
            this.removeChild(this._pageContent);
            this._pageContent.shutdownUI();
            this._pageContent = null;
        }
        // Set the the new content.
        this._pageContent = pageContent;
        this.append(pageContent);
        pageContent.initUI(this._container.querySelector("#asc_pageContent"));
    };

    AccountSettingsControl.prototype._onBack = function () {
        /// <summary>Click-event handler for back button</summary>

        // Within the settings pane we can only navigate one-page deep. Consequently,
        // we have only two options here: navigate to the top-most page or close the flyout. 
        if (this._topmostPage !== this._activePage) {
            this.navigateToPage(this._topmostPage);
        } else {
            this._flyout.hide();
            if (!this._launchedFromApp) {
                // If we weren't launched from an app, the Window Settings pane
                // invoked us, go back to it.
                Windows.UI.ApplicationSettings.SettingsPane.show();
            }
        }
    };

    AccountSettingsControl.prototype._onAddAnAccount = function () {
        /// <summary>Click-event handler for the add-an-account link</summary>
        /// <param name="ev" type="HTMLEvent"/>
        // Update the back-button functionality so that it returns to the connected-accounts page.
        this.navigateToPage(A.AccountSettingsPage.upsells);
    };

    AccountSettingsControl.prototype._onKeyDown = function (ev) {
        /// <summary>Key-down handler for the add-more-accounts link</summary>
        /// <param name="ev" type="HTMLEvent"/>
        if (ev.key === "Spacebar" || ev.key === "Enter") {
            this._onAddAnAccount();
        }
    };

    AccountSettingsControl.prototype.shutdownUI = function () {
        /// <summary>Called when our control being hidden</summary>
        this._pageContent.shutdownUI();
        this._pageContent = null;

        this._activePage = -1;
        this._platform = /* @static_cast(Mocks.Microsoft.WindowsLive.Platform.Client)*/null;
        this._flyout = null;

        Jx.dispose(this._accountSync);
        this._accountSync = null;

        msClearImmediate(this._msSetImmediateID);
        this._msSetImmediateID = -1;

        Jx.Component.prototype.shutdownUI.call(this);
    };

    AccountSettingsControl.prototype._getBiciSuffix = function () {
        return "settings";
    };

    Object.defineProperty(AccountSettingsControl.prototype, "id", { get: function () { return this._id; } });

    AccountSettingsControl._flyout = null;
    AccountSettingsControl.isShowing = function () { return AccountSettingsControl._flyout !== null; };

    A.showAccountSettingsPage = function (platform, scenario, page, options) {
        /// <summary>Static function for launching the accounts settings page flyout</summary>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        /// <param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario"/>
        /// <param name="page" type="People.Accounts.AccountSettingsPage">The desired page to land on.</param>
        // options: { //configuration options, defaults are as shown and can be omitted.
        //     launchedFromApp: false, // true if the settings pane is activate directly from the app
        //     account: null, // Only applicable if page == AccountSettingsPage.perAccountSetting
        //     jobSet: null
        // } </param>

        Jx.log.info("showAccountSettingsPage()");

        // Ensure any currently-visible flyout is hidden.
        if (AccountSettingsControl._flyout) {
            AccountSettingsControl._flyout.hide();
        }

        // Dynamically create our settings container
        var settingsContainer = document.createElement("div");
        settingsContainer.setAttribute("aria-label", Jx.res.getString("/accountsStrings/asc-accountsSettingsFlyoutAriaLabel"));

        var flyout = AccountSettingsControl._flyout = new WinJS.UI.SettingsFlyout(settingsContainer);
        var accountSettings = null;
        options = options || {};

        var beforeShow = function () {
            try {
                Jx.log.info("launch flyout");
                accountSettings = new People.Accounts.AccountSettingsControl(platform, scenario, flyout, options.launchedFromApp, options.jobSet);

                var ui = Jx.getUI(accountSettings);
                settingsContainer.innerHTML = ui.html;
                document.body.appendChild(settingsContainer);
                accountSettings.activateUI();

                accountSettings.navigateToPage(page, options.account, true /*first launch*/);
            } catch (e) {
                cleanup = Jx.fnEmpty;
                afterShow = Jx.fnEmpty;
                flyout.hide(); // force the flyout to close so that we don't show an empty flyout.
                Jx.log.exception("AccountSettingFlyout afterhide failed", e);
            }
        };

        var afterShow = function () {
            accountSettings.flyoutReady();
            Jx.EventManager.broadcast(AccountSettingsEvents.opened);  
        };

        var beforeHide = function () {
            // This is a workaround for an issue with the "afterhide" not
            // firing after the accountdialog is fired from the accounts pane.
            // Then ensure that we still tear down and wait for the animation to
            // complete.
            WinJS.Promise.timeout(500).then(function () { cleanup(); });
        };

        var afterHide = function () {
            cleanup();
        };

        var flyoutEventsHandler = function (ev) {
            // There is a bug in IE (Win8 #860766) which sometimes causes the wrong
            // event handler to get invoked for custom events. By having a single event
            // handler, we can dispatch the event to the correct handler by using the event type,
            // which is correct.
            switch (ev.type) {
                case "beforeshow": beforeShow(ev);
                    break;
                case "aftershow": afterShow(ev);
                    break;
                case "beforehide": beforeHide(ev);
                    break;
                case "afterhide": afterHide(ev);
                    break;
            }
        };

        flyout.addEventListener("beforeshow", flyoutEventsHandler, false);
        flyout.addEventListener("aftershow", flyoutEventsHandler, false);
        flyout.addEventListener("beforehide", flyoutEventsHandler, false);
        flyout.addEventListener("afterhide", flyoutEventsHandler, false);

        var cleanup = function () {
            accountSettings.shutdownUI();
            document.body.removeChild(settingsContainer);
            cleanup = Jx.fnEmpty;
            AccountSettingsControl._flyout = null;

            Jx.EventManager.broadcast(AccountSettingsEvents.closed);
        };

        flyout.show();
    };

    var NoUpsellsContent = function () {
        this.initComponent();
    };
    Jx.augment(NoUpsellsContent, Jx.Component);

    NoUpsellsContent.prototype.getUI = function (ui) {
        ui.html = "<div class='asc-error'>" + Jx.res.getString("/accountsStrings/ascNoUpsellsMessage") + "</div>";
    };
});
