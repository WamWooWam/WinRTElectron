Jx.delayDefine(People.Accounts, ["showLogonErrorDialog", "showMustSignInDialog", "showNoConnectionErrorDialog"], function() {
    function y(n, t) {
        return Jx.res.loadCompoundString("/accountsStrings/" + n, t)
    }
    var e = window.People,
        i = e.Accounts,
        t = Microsoft.WindowsLive.Platform,
        n = t.Result,
        r = true,
        u = function(n, t, i) {
            this._success = n || Jx.fnEmpty;
            this._error = t || Jx.fnEmpty;
            this._cancel = i || Jx.fnEmpty;
            this._dialogClosed = this._dialogClosed.bind(this)
        };
    u.prototype.showDialog = function() {
        var n = null,
            f, e, o;
        try {
            n = new t.Client("getPendingPrimaryAccountUser", t.ClientCreateOptions.failIfUnverified | t.ClientCreateOptions.getPendingPrimaryAccountUser);
            e = n.accountManager.defaultAccount;
            o = n.createVerb("CancelPendingPrimaryAccount", "");
            f = n.runResourceVerbAsync(e, "backgroundTasks", o)
        } catch (u) {
            if (r && u && t.Result.primaryAccountAlreadyConnected === u.number) {
                r = false;
                this._success();
                return
            }
            u && t.Result.primaryAccountNotPending === u.number || Jx.log.exception("Platform getPendingPrimaryAccountUser", u)
        }
        WinJS.Promise.then(f, function() {
                var u, o, e, f;
                n && n.dispose();
                try {
                    n = new t.Client("createPrimaryAccountUser", t.ClientCreateOptions.failIfUnverified | t.ClientCreateOptions.createPrimaryAccountUser);
                    n.addEventListener("restartneeded", this._dialogClosed);
                    this._platform = n;
                    o = n.accountManager.getAccountBySourceId("EXCH", "");
                    u = new i.AccountDialog(o, i.AccountDialogMode.addPrimary, t.ApplicationScenario.mail, n, "addPrimaryAccount")
                } catch (s) {
                    Jx.log.exception("Platform createPrimaryAccountUser", s);
                    this._cleanupListeners();
                    e = s.number || t.Result.primaryAccountAlreadyConnected;
                    r && t.Result.primaryAccountAlreadyConnected === e ? (r = false,
                        this._success()) : this._error(e);
                    return
                }
                f = Jx.activation;
                f.addListener(f.suspending, this._dialogClosed, this);
                this._activation = f;
                u.show(true);
                this._dlg = u;
                u.addListener("closed", this._dialogClosed, this)
            }
            .bind(this))
    };
    u.prototype._cleanupListeners = function() {
        this._dlg && (this._dlg.removeListener("closed", this._dialogClosed, this),
            this._dlg.close(),
            this._dlg = null);
        this._activation && (this._activation.removeListener(this._activation.suspending, this._dialogClosed, this),
            this._activation = null);
        this._platform && (this._platform.removeEventListener("restartneeded", this._dialogClosed),
            this._platform.dispose(),
            this._platform = null)
    };
    u.prototype._dialogClosed = function() {
        var n = this._dlg && this._dlg.wasSuccess;
        this._cleanupListeners();
        n ? this._success() : (r = true,
            this._cancel())
    };
    var l = function(t, r, f, e) {
            var o = false,
                s;
            try {
                o = n.defaultAccountDoesNotExist === e && Windows.Management.Workplace.WorkplaceSettings.isMicrosoftAccountOptional
            } catch (h) {
                Jx.log.exception("WorkplaceSettings lookup", h)
            }
            o ? (s = new u(t, r, f),
                s.showDialog()) : i.showCredUIAsync(t, r, f, e)
        },
        o = i.showLogonErrorDialog = function(t, r, u) {
            var e = [n.accountLocked, n.accountSuspendedAbuse, n.accountSuspendedCompromise, n.accountUpdateRequired, n.actionRequired, n.authRequestThrottled, n.defaultAccountDoesNotExist, n.emailVerificationRequired, n.forceSignIn, n.parentalConsentRequired, n.passwordDoesNotExist, n.passwordLogonFailure, n.passwordUpdateRequired, ].indexOf(u) !== -1,
                f;
            Jx.log.info("People.Accounts.showLogonErrorDialog(), hr = " + u + (", showCredUI = " + (e ? "true" : "false")));
            f = function() {
                var n = function(n) {
                    u = n
                };
                t(n) ? r(true) : o(t, r, u)
            };
            e ? l(f, function(n) {
                c(function() {
                    o(t, r, u)
                }, n)
            }, function() {
                i.showMustSignInDialog(function() {
                    o(t, r, u)
                })
            }, u) : c(f, u)
        },
        a = i.showMustSignInDialog = function(n, t) {
            return s("logonErrorMustSignIn", n, t)
        },
        v = i.showNoConnectionErrorDialog = function(n) {
            return s("logonErrorNoInternet", n)
        },
        h = function(n) {
            return s("logonServerUnavailable", n)
        },
        c = function(n, t) {
            switch (t) {
                case -2147023665:
                    e.Accounts.cannotConnectToNetwork() ? v(n) : h(n);
                    break;
                case -2146893042:
                    a(n);
                    break;
                default:
                    h(n)
            }
        },
        s = function(n, t, i) {
            var u = function() {
                    r.close()
                },
                r = new e.AlertDialog(document.title, new f(n, t, u), {
                    fullscreen: true
                });
            return r.show(false, i)
        },
        f = function(n, t, i) {
            this.initComponent();
            this._retry = t || Jx.fnEmpty;
            this._close = i || Jx.fnEmpty;
            this._contentId = n
        };
    Jx.augment(f, Jx.Component);
    f.prototype.getUI = function(n) {
        this._id = "idErrorDialogContent" + Jx.uid();
        n.html = "<div id='" + this._id + "'><div id='dlgDescription' role='heading'>" + y(this._contentId, document.title) + "<\/div><\/div>"
    };
    f.prototype.activateUI = function() {
        Jx.Component.prototype.activateUI.call(this);
        var t = document.getElementById(this._id),
            n = t.querySelector("a");
        if (n !== null) {
            Jx.isHTMLElement(n) && Jx.isFunction(this._retry) && n.addEventListener("click", function(n) {
                    n.preventDefault();
                    this._close();
                    this._retry()
                }
                .bind(this));
            Jx.safeSetActive(n)
        }
    }
})