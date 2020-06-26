Jx.delayDefine(Mail, "NavPaneManager", function() {
    "use strict";
    function t(n, t) {
        t && (n.removeChild(t),
        t.deactivateUI(),
        t.shutdownComponent())
    }
    function i(n, t, i) {
        n.appendChild(t);
        t.initUI(i)
    }
    Mail.NavPaneManager = function(n, t, i, r, u, f) {
        Mail.log("NavPane_Ctor", Mail.LogEvent.start);
        this.initComponent();
        this._host = n;
        this._selection = t;
        this._guiState = i;
        this._animator = r;
        this._platform = u;
        this._appSettings = f;
        this._createFlyout = this._createFlyout.bind(this);
        this._viewSwitcher = new Mail.ViewSwitcher(u,this,t,f,this._createFlyout);
        this._accountSwitcher = new Mail.AccountSwitcher(u,n,t,Jx.scheduler,this._createFlyout);
        this._header = new Mail.AccountNameHeader(t);
        this.append(this._accountSwitcher, this._viewSwitcher, this._header);
        this._hooks = null;
        this._viewSwitcherElement = null;
        Mail.log("NavPane_Ctor", Mail.LogEvent.stop)
    }
    ;
    Jx.augment(Mail.NavPaneManager, Jx.Component);
    Jx.augment(Mail.NavPaneManager, Jx.Events);
    var n = Mail.NavPaneManager.prototype;
    n.deactivateUI = function() {
        this.detach(People.DialogEvents.opened, Mail.AccountSettings.onDialogOpened);
        this.detach(People.DialogEvents.closed, Mail.AccountSettings.onDialogClosed);
        Jx.dispose(this._hooks);
        Jx.Component.deactivateUI.call(this)
    }
    ;
    n.getUI = function(n) {
        n.html = "<div id='" + this._id + "' class='mailFrameNavPaneBackground'><div class='mailNavPane'><div id='mailNavPaneHeaderArea'>" + Jx.getUI(this._header).html + "<\/div><div class='viewSwitcher'>" + Jx.getUI(this._viewSwitcher).html + "<\/div>" + Jx.getUI(this._accountSwitcher).html + "<\/div><\/div>"
    }
    ;
    n.activateUI = function() {
        var i;
        Mail.log("NavPane_activateUI", Mail.LogEvent.start);
        Jx.Component.prototype.activateUI.call(this);
        var t = document.getElementById(this._id)
          , n = t.querySelector(".mailNavPane")
          , r = n.querySelector("#mailNavPaneHeaderArea")
          , u = this._viewSwitcherElement = n.querySelector(".viewSwitcher");
        this._animator.setNavPaneElements(t, n, r, u);
        i = this._guiState;
        this._hooks = new Mail.Disposer(new Mail.EventHook(i,"viewStateChanged",this._viewStateChanged,this),new Mail.EventHook(this._selection,"navChanged",this._onNavigation,this));
        this.on(People.DialogEvents.opened, Mail.AccountSettings.onDialogOpened);
        this.on(People.DialogEvents.closed, Mail.AccountSettings.onDialogClosed);
        Mail.log("NavPane_activateUI", Mail.LogEvent.stop)
    }
    ;
    n._createFlyout = function(n, t) {
        var i = new Mail.NavPaneFlyout(this,n,t);
        return this._host.hostComponent(i),
        i
    }
    ;
    Object.defineProperty(n, "isWide", {
        get: function() {
            return this._guiState.isNavPaneWide
        }
    });
    Object.defineProperty(n, "windowWidth", {
        get: function() {
            return this._guiState.width
        }
    });
    n._viewStateChanged = function() {
        this.raiseEvent("widthChanged")
    }
    ;
    n.selectAccount = function(n, t) {
        this._host.selectAccount(n, t)
    }
    ;
    n.selectViewAsync = function(n) {
        this._host.selectViewAsync(n)
    }
    ;
    n._onNavigation = function(n) {
        if (n.accountChanged) {
            t(this, this._viewSwitcher);
            var r = this._viewSwitcher = new Mail.ViewSwitcher(this._platform,this,this._selection,this._appSettings,this._createFlyout);
            i(this, r, this._viewSwitcherElement)
        }
    }
})
