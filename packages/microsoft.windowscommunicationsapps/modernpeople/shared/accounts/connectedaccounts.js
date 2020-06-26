Jx.delayDefine(People.Accounts, "ConnectedAccounts", function() {
    function r(n, t) {
        return {
            name: "ConnectedAccountsCrossFade" + Jx.uid(),
            delay: 0,
            duration: 167,
            timing: "linear",
            from: n,
            to: t
        }
    }
    function f(n, t, i) {
        if (People.Animation.disabled)
            return WinJS.Promise.wrap();
        var u = WinJS.UI.executeAnimation([t], r("width: " + i.offsetWidth + "px; opacity: 0", "width: " + t.offsetWidth + "px; opacity: 1"))
          , f = WinJS.UI.executeAnimation([i], r("opacity: 1", "opacity: 0"));
        return WinJS.Promise.join([u, f])
    }
    var t = window.People
      , u = t.Accounts
      , i = Microsoft.WindowsLive.Platform
      , n = u.ConnectedAccounts = function(n, i, r, u) {
        this._scenario = n;
        this._jobSet = i ? i.createChild() : (new t.Scheduler).getJobSet();
        this._disabled = u ? u : false;
        this._ellipsisShowing = false;
        this._displayOnTwoLines = r ? r : false;
        this._control = null;
        this._accountTemplate = null;
        this._canvasParent = null;
        this._canvas = null;
        this._accounts = null;
        this._ellipsis = null;
        this._platform = null;
        this._deferredCollection = null;
        this._assets = [];
        this._animating = false;
        this._pendingChanges = false;
        this._populatedUI = false;
        this._onAccountUpdated = this._jobSet.addUIJob.bind(this._jobSet, this, this._crossFadeChanges, null, t.Priority.propertyUpdate);
        this.initComponent();
        $include("$(cssResources)/" + Jx.getAppNameFromId(Jx.appId) + "ConnectedAccounts.css")
    }
    ;
    Jx.inherit(n, Jx.Component);
    Object.defineProperty(n.prototype, "disabled", {
        get: function() {
            return this._disabled
        },
        set: function(n) {
            this._disabled !== n && this._updateDisabledState(n)
        }
    });
    n.prototype.setPlatform = function(n) {
        this._platform = n
    }
    ;
    n.prototype.getElement = function() {
        return this._control
    }
    ;
    n.prototype.isPopulated = function() {
        return this._populatedUI
    }
    ;
    n.prototype.getUI = function(n) {
        var t = this._displayOnTwoLines ? " displayOnTwoLines" : "";
        n.html = "<div id='" + this._id + "' class='connectedAccounts' role='link'><div class='connectedAccounts-label connectedAccounts-inlineBlock connectedAccounts-bottomAligned typeSizeSmall " + t + "'><\/div><div class='connectedAccounts-inlineBlock connectedAccounts-bottomAligned " + t + "'><div class='connectedAccounts-canvasContainer' ><div class='connectedAccounts-canvas'><div class='connectedAccounts-accounts connectedAccounts-inlineBlock'><\/div><div class='connectedAccounts-ellipsis connectedAccounts-inlineBlock connectedAccounts-bottomAligned' style='display: none'>...<\/div><\/div><\/div><\/div><\/div>"
    }
    ;
    n.prototype._updateDisabledState = function(n) {
        this._disabled = n;
        var t = this._control;
        Jx.setClass(t, "disabled", n);
        t.setAttribute("aria-disabled", n);
        t.tabIndex = n ? -1 : 0
    }
    ;
    n.prototype._setCanvasElements = function(n) {
        this._canvas = n;
        this._accounts = n.querySelector(".connectedAccounts-accounts");
        this._accounts.innerHTML = "";
        this._ellipsis = n.querySelector(".connectedAccounts-ellipsis")
    }
    ;
    n.prototype.activateUI = function() {
        var i = this._control = document.getElementById(this._id), n;
        this._updateDisabledState(this._disabled);
        n = document.createElement("div");
        n.innerHTML = "<div id='connectedAccounts-accountTemplate' class='connectedAccounts-account connectedAccounts-inlineBlock connectedAccounts-bottomAligned'><div class='connectedAccounts-icon' ><\/div><\/div>";
        this._accountTemplate = n.firstChild;
        this._setCanvasElements(i.querySelector(".connectedAccounts-canvas"));
        this._canvasParent = this._canvas.parentNode;
        this._jobSet.addUIJob(this, this._query, null, t.Priority.connectedAccounts);
        Jx.Component.prototype.activateUI.call(this)
    }
    ;
    n.prototype._query = function() {
        var r = this._platform.accountManager.getConnectedAccountsByScenario(this._scenario, i.ConnectedFilter.normal, i.AccountSort.rank), n;
        this._deferredCollection = new t.DeferredCollection(r,this);
        n = this._control;
        n.querySelector(".connectedAccounts-label").innerText = Jx.res.loadCompoundString("/accountsStrings/connectedAccounts-label");
        n.addEventListener("click", this._onClickHandler = this._onClick.bind(this), false);
        n.addEventListener("keydown", this._onKeyDownHandler = this._onKeyDown.bind(this), false);
        this._populateUI()
    }
    ;
    n.prototype._disposeAssets = function() {
        this._assets.forEach(Jx.dispose);
        this._assets = []
    }
    ;
    n.prototype._populateUI = function() {
        var u = [], i, f, r;
        for (this._disposeAssets(),
        i = 0,
        f = Math.min(n.maxCount, this._deferredCollection.length); i < f; i++)
            if (r = this._deferredCollection.getItem(i),
            !Jx.isNullOrUndefined(r)) {
                var e = new t.PlatformObjectBinder(r)
                  , o = e.createAccessor(this._onAccountUpdated)
                  , s = this._createNewAccountElement(o);
                this._assets.push(e);
                this._accounts.appendChild(s);
                u.push(o.displayName)
            }
        var h = u.join(", ")
          , c = this._deferredCollection.length > n.maxCount ? "/accountsStrings/connectedAccounts-ariaLabelMoreAccounts" : "/accountsStrings/connectedAccounts-ariaLabel"
          , l = Jx.res.loadCompoundString(c, h);
        this._control.setAttribute("aria-label", l);
        this._populatedUI = true;
        this._setEllipsis()
    }
    ;
    n.prototype._shouldEllipsisShow = function() {
        return this._deferredCollection.length > n.maxCount
    }
    ;
    n.prototype._setEllipsis = function() {
        var n = this._shouldEllipsisShow();
        n !== this._ellipsisShowing && (this._ellipsisShowing = n,
        this._ellipsis.style.display = n ? "" : "none")
    }
    ;
    n.prototype._onClick = function() {
        this._disabled || (Jx.log.info("ConnectedAccounts control activated by user"),
        t.Accounts.showAccountSettingsPage(this._platform, this._scenario, t.Accounts.AccountSettingsPage.connectedAccounts, {
            launchedFromApp: true
        }))
    }
    ;
    n.prototype._onKeyDown = function(n) {
        (n.key === "Spacebar" || n.key === "Enter") && (this._onClick(n),
        n.preventDefault())
    }
    ;
    n.prototype._onAnimationEnd = function(n) {
        this._canvasParent.removeChild(n);
        this._animating = false;
        this._pendingChanges && this.onChangesPending()
    }
    ;
    n.prototype._crossFadeChanges = function() {
        var n, i, t;
        this._animating = true;
        n = this._canvas;
        i = n.style;
        this._setCanvasElements(n.cloneNode(true));
        this._populateUI();
        i.position = "absolute";
        this._canvasParent.appendChild(this._canvas);
        t = this;
        f(this._canvasParent, this._canvas, n).done(function() {
            t._onAnimationEnd(n)
        }, function() {
            t._onAnimationEnd(n)
        })
    }
    ;
    n.prototype._createNewAccountElement = function(n) {
        var t = this._accountTemplate.cloneNode(true), i;
        return t.id = "",
        i = t.firstChild,
        i.style.backgroundImage = "url(" + n.iconSmallUrl + ")",
        i.setAttribute("aria-label", n.displayName),
        t
    }
    ;
    n.prototype.onChangesPending = function() {
        this._jobSet.addUIJob(this, this._applyChanges, null, t.Priority.connectedAccounts)
    }
    ;
    n.prototype._applyChanges = function() {
        this._animating ? this._pendingChanges = true : (this._pendingChanges = false,
        this._deferredCollection.acceptPendingChanges(),
        this._crossFadeChanges())
    }
    ;
    n.prototype.deactivateUI = function() {
        Jx.dispose(this._deferredCollection);
        this._deferredCollection = null;
        this._jobSet.cancelJobs();
        this._control.removeEventListener("click", this._onClickHandler, false);
        this._control.removeEventListener("keydown", this._onKeyDownHandler, false);
        Jx.Component.prototype.deactivateUI.call(this)
    }
    ;
    n.prototype.shutdownComponent = function() {
        this._disposeAssets();
        this._jobSet.dispose();
        this._jobSet = null;
        this._platform = null;
        Jx.Component.prototype.shutdownComponent.call(this)
    }
    ;
    n.maxCount = 4;
    Object.freeze(n)
})
