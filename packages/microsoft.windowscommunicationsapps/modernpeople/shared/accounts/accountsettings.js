Jx.delayDefine(People.Accounts, ["AccountSettingsControl", "AccountSettingsEvents", "AccountSettingsPage", "showAccountSettingsPage"], function() {
    var t = window.People.Accounts,
        u = t.AccountSettingsEvents = {
            opened: "People.Accounts.AccountSettingsEvents.opened",
            closed: "People.Accounts.AccountSettingsEvents.closed"
        },
        n, i, r;
    Object.freeze(u);
    n = t.AccountSettingsControl = function(n, i, r, u, f) {
        t.AccountControlBase.call(this, n, i);
        this._platform = n;
        this._scenario = i;
        this._flyout = r;
        this._jobSet = f;
        this._pageContent = null;
        this._container = null;
        this._launchedFromApp = !!u;
        this._msSetImmediateID = -1;
        this.initComponent();
        $include("$(cssResources)/" + Jx.getAppNameFromId(Jx.appId) + "AccountSettings.css")
    };
    Jx.augment(n, Jx.Component);
    Jx.augment(n, t.AccountControlBase);
    i = t.AccountSettingsPage = {
        connectedAccounts: 0,
        upsells: 1,
        perAccountSettings: 2
    };
    Object.freeze(i);
    n.prototype.navigateToPage = function(n, r, u) {
        var f, e, s, o;
        if (f = this._container,
            this._activePage !== n) {
            Jx.dispose(this._accountSync);
            this._accountSync = null;
            //msClearImmediate(this._msSetImmediateID);
            this._msSetImmediateID = -1;
            switch (n) {
                case i.connectedAccounts:
                    s = {
                        onPrimaryAction: function(n) {
                                var r = this._getCurrentError(n),
                                    u;
                                return r === t.KnownAccountError.reconnectNeeded ? this._launchWebAuthAddFlow(n, true) : r === t.KnownAccountError.upgradeNeeded ? this._launchWebAuthAddFlow(n, false) : r === t.KnownAccountError.oauthCredentialError ? (u = new t.AccountDialog(n, t.AccountDialogMode.update, this._scenario, this._platform, People.Bici.EntryPoint.accountSettings),
                                        u.show()) : this.navigateToPage(i.perAccountSettings, n),
                                    false
                            }
                            .bind(this),
                        supportsContextMenus: false,
                        showErrorStates: true,
                        largeIcons: true
                    };
                    e = new t.AccountListControl(t.AccountListType.connectedUpsells, this._platform, this._scenario, "settings", s);
                    this._makePageAriaLive(true);
                    f.querySelector("#asc_pageTitle").innerText = Jx.res.getString("/accountsStrings/asc-accountsTitle");
                    f.className = "asc asc-connectedPage";
                    break;
                case i.upsells:
                    e = new t.AccountListControl(t.AccountListType.unfilteredUpsells, this._platform, this._scenario, "settings", {
                        supportsContextMenus: false,
                        largeIcons: true
                    });
                    this._makePageAriaLive(true);
                    f.querySelector("#asc_pageTitle").innerText = Jx.res.getString("/accountsStrings/asc-addAnAccount");
                    f.className = "asc asc-upsellsPage";
                    this._accountSync || (o = this._accountSync = new t.AccountSynchronization(this._platform),
                        o.areAccountsAvailable() ? this._msSetImmediateID = msSetImmediate(function() {
                                this._onUpsellAvailable()
                            }
                            .bind(this)) : o.addListener("accountsAvailable", this._onUpsellAvailable, this));
                    break;
                case i.perAccountSettings:
                    e = new t.PerAccountSettingsPage(this._platform, r, this._scenario, this._jobSet, !!u);
                    this._makePageAriaLive(false);
                    f.querySelector("#asc_pageTitle").innerText = r.displayName;
                    f.className = "asc asc-perAccountSettingsPage"
            }
            this._replacePageContent(e);
            this._tooltipCheck();
            f.style.visibility = "visible";
            Jx.isNullOrUndefined(this._activePage) && (this._topmostPage = n);
            Jx.safeSetActive(f.querySelector("#asc_backButton"));
            this._activePage = n
        }
    };
    n.prototype.updateHeaderText = function() {
        i.perAccountSettings === this._activePage && this._pageContent && (this._container.querySelector("#asc_pageTitle").innerText = this._pageContent.accountName)
    };
    n.prototype.flyoutReady = function() {
        Jx.safeSetActive(this._container.querySelector("#asc_backButton"));
        this._pageContent.flyoutReady && this._pageContent.flyoutReady()
    };
    n.prototype.getUI = function(n) {
        this._id = "idAccountSettings_" + Jx.uid();
        n.html = "<div id='" + this._id + "' class='asc' ><div id='asc_page' class='asc-page' aria-live='polite' aria-relevant='all' aria-atomic='false'><div class='win-header asc-header win-ui-dark'><button id='asc_backButton' type='button' class='win-backbutton asc-backButton' aria-label='" + Jx.escapeHtml(Jx.res.getString("/accountsStrings/asc-backButtonAriaLabel")) + "'><\/button><div id='asc_pageTitle' class='asc-title singleLineText' role='heading'><\/div><div class='asc-appIcon'><\/div><\/div><div class='win-content'><div id='asc_pageContent' class='asc_pageContent'><\/div><div class='asc-separator'><\/div><div id='asc_addAccountLink' class='asc-addAccountLink' tabIndex='0' role='link'><\/div><\/div><\/div><\/div>"
    };
    n.prototype.activateUI = function() {
        var n, t, i;
        Jx.Component.prototype.activateUI.call(this);
        n = this._container = document.getElementById(this._id);
        n.style.visibility = "hidden";
        t = n.querySelector("#asc_addAccountLink");
        t.addEventListener("click", this._onAddAnAccount.bind(this), false);
        t.addEventListener("keyup", this._onKeyDown.bind(this), false);
        t.innerText = Jx.res.getString("/accountsStrings/asc-addAnAccount");
        i = n.querySelector("#asc_backButton");
        i.addEventListener("click", this._onBack.bind(this), false);
        n.addEventListener("focus", function() {
            i.focus()
        }, false)
    };
    n.prototype._tooltipCheck = function() {
        var n = this._container.querySelector("#asc_pageTitle");
        n.title = n.scrollWidth > n.clientWidth ? n.innerText : ""
    };
    n.prototype._onUpsellAvailable = function() {
        this._msSetImmediateID = -1;
        this._pageContent.getCount() <= 0 && this._replacePageContent(new r)
    };
    n.prototype._makePageAriaLive = function(n) {
        var t = this._container.querySelector("#asc_page");
        Jx.isHTMLElement(t) && t.setAttribute("aria-live", n ? "polite" : "off")
    };
    n.prototype._replacePageContent = function(n) {
        Jx.isObject(this._pageContent) && (this.removeChild(this._pageContent),
            this._pageContent.shutdownUI(),
            this._pageContent = null);
        this._pageContent = n;
        this.append(n);
        n.initUI(this._container.querySelector("#asc_pageContent"))
    };
    n.prototype._onBack = function() {
        this._topmostPage !== this._activePage ? this.navigateToPage(this._topmostPage) : (this._flyout.hide(),
            this._launchedFromApp || Windows.UI.ApplicationSettings.SettingsPane.show())
    };
    n.prototype._onAddAnAccount = function() {
        this.navigateToPage(t.AccountSettingsPage.upsells)
    };
    n.prototype._onKeyDown = function(n) {
        (n.key === "Spacebar" || n.key === "Enter") && this._onAddAnAccount()
    };
    n.prototype.shutdownUI = function() {
        this._pageContent.shutdownUI();
        this._pageContent = null;
        this._activePage = -1;
        this._platform = null;
        this._flyout = null;
        Jx.dispose(this._accountSync);
        this._accountSync = null;
        //msClearImmediate(this._msSetImmediateID);
        this._msSetImmediateID = -1;
        Jx.Component.prototype.shutdownUI.call(this)
    };
    n.prototype._getBiciSuffix = function() {
        return "settings"
    };
    Object.defineProperty(n.prototype, "id", {
        get: function() {
            return this._id
        }
    });
    n._flyout = null;
    n.isShowing = function() {
        return n._flyout !== null
    };
    t.showAccountSettingsPage = function(t, i, r, f) {
        var s, e, o, h;
        Jx.log.info("showAccountSettingsPage()");
        n._flyout && n._flyout.hide();
        s = document.createElement("div");
        s.setAttribute("aria-label", Jx.res.getString("/accountsStrings/asc-accountsSettingsFlyoutAriaLabel"));
        e = n._flyout = new WinJS.UI.SettingsFlyout(s);
        o = null;
        f = f || {};
        var a = function() {
                try {
                    Jx.log.info("launch flyout");
                    o = new People.Accounts.AccountSettingsControl(t, i, e, f.launchedFromApp, f.jobSet);
                    var n = Jx.getUI(o);
                    s.innerHTML = n.html;
                    document.body.appendChild(s);
                    o.activateUI();
                    o.navigateToPage(r, f.account, true)
                } catch (u) {
                    h = Jx.fnEmpty;
                    l = Jx.fnEmpty;
                    e.hide();
                    Jx.log.exception("AccountSettingFlyout afterhide failed", u)
                }
            },
            l = function() {
                o.flyoutReady();
                Jx.EventManager.broadcast(u.opened)
            },
            v = function() {
                WinJS.Promise.timeout(500).then(function() {
                    h()
                })
            },
            y = function() {
                h()
            },
            c = function(n) {
                switch (n.type) {
                    case "beforeshow":
                        a(n);
                        break;
                    case "aftershow":
                        l(n);
                        break;
                    case "beforehide":
                        v(n);
                        break;
                    case "afterhide":
                        y(n)
                }
            };
        e.addEventListener("beforeshow", c, false);
        e.addEventListener("aftershow", c, false);
        e.addEventListener("beforehide", c, false);
        e.addEventListener("afterhide", c, false);
        h = function() {
            o.shutdownUI();
            document.body.removeChild(s);
            h = Jx.fnEmpty;
            n._flyout = null;
            Jx.EventManager.broadcast(u.closed)
        };
        e.show()
    };
    r = function() {
        this.initComponent()
    };
    Jx.augment(r, Jx.Component);
    r.prototype.getUI = function(n) {
        n.html = "<div class='asc-error'>" + Jx.res.getString("/accountsStrings/ascNoUpsellsMessage") + "<\/div>"
    }
})