Jx.delayDefine(People, "CpContent", function() {
    function i(n) {
        Jx.mark("People.CpContent." + n + ",Info,People,AppFrame")
    }
    function r(n) {
        return n + "_state"
    }
    function e(n, t) {
        if (t.prepareSaveState) {
            var i = t.prepareSaveState()
              , u = Jx.root;
            f().setObject(r(n), {
                version: u.getHydraDataVersion(),
                controlState: i
            })
        }
    }
    function o(n, t) {
        var u = null, s;
        if (t.prepareSaveState) {
            var e = r(n)
              , o = f()
              , i = o.getObject(e);
            o.setObject(e, {});
            s = Jx.root;
            i && i.version === s.getHydraDataVersion() && (u = i.controlState)
        }
        return u
    }
    function u(n, t) {
        return t.prepareSaveBackState ? t.prepareSaveBackState() : null
    }
    function f() {
        return Jx.appData.localSettings().container("controlState")
    }
    var n = window.People
      , t = window.People.Nav;
    n.CpContent = function(t) {
        this._name = "People.CpContent";
        this.initComponent();
        this._jobSet = t.createChild("CpContent");
        this._controlMap = new n.ControlMap;
        this._control = null;
        this._leftoverControls = [];
        this._container = null;
        this._pendingEnterAnimation = false;
        this._outgoingElements = []
    }
    ;
    Jx.augment(n.CpContent, Jx.Component);
    n.CpContent.prototype.deactivateUI = function() {
        this._cleanupLeftoverControls();
        Jx.isNonEmptyString(this._page) && !Jx.isNullOrUndefined(this._control) && this._unloadControl(this._page, this._control);
        Jx.Component.prototype.deactivateUI.call(this)
    }
    ;
    n.CpContent.prototype._cleanupLeftoverControls = function() {
        this._leftoverControls.forEach(function(n) {
            this._unloadControl(n.page, n.control)
        }, this);
        this._leftoverControls = []
    }
    ;
    n.CpContent.prototype.getUI = function(n) {
        n.html = '<div id="content_container" class="content-container"><\/div>'
    }
    ;
    n.CpContent.prototype.activateUI = function() {
        Jx.log.info("People.CpContent.activateUI");
        this._container = document.getElementById("content_container");
        Jx.Component.prototype.activateUI.call(this)
    }
    ;
    n.CpContent.prototype._getControl = function(n) {
        var r = null, u = t.Pages[n].control, i;
        return u && (i = this._controlMap[u],
        i.scriptSrc && $include(i.scriptSrc),
        r = i.createInstance()),
        r
    }
    ;
    n.CpContent.prototype._currentControlName = "";
    n.CpContent.prototype._page = "";
    n.CpContent.clearControlState = function() {
        Jx.appData.localSettings().deleteContainer("controlState")
    }
    ;
    n.CpContent.prototype.getCurrentLocationState = function() {
        var n = null;
        return Jx.isNonEmptyString(this._page) && !Jx.isNullOrUndefined(this._control) && (n = u(this._currentControlName, this._control)),
        n
    }
    ;
    n.CpContent.prototype.deactivate = function(n) {
        var t = true
          , i = this._control;
        return i && (t = i.deactivate(n),
        t === undefined && (t = true),
        n || t || Jx.log.info("People.CpContent.deactivate: can't deactivate current hosted control " + this._currentControlName),
        n && Jx.log.info("People.CpContent.deactivate: current hosted control " + this._currentControlName + " is being forced to be closed ")),
        t
    }
    ;
    n.CpContent.prototype._clearEntering = Jx.fnEmpty;
    n.CpContent.prototype.setupUpdate = function(i) {
        var o, r, u, f, e, s, h;
        this._jobSet.cancelJobs();
        o = document.getElementsByClassName("win-searchbox-input").item(0);
        (document.activeElement != o || i !== t.Pages.allcontacts.id) && document.body.focus();
        Jx.isNonEmptyString(this._currentControlName) && (this._cleanupAnimations(),
        r = this._outgoing = this._container,
        u = this._container = document.createElement("div"),
        u.id = "content_container",
        r.parentNode.appendChild(u),
        r.id = "idOutgoingContent",
        f = n.CpHeader.Scenes.none,
        e = n.CpTitle.PageToScene,
        (e[this._page] === f || e[i] === f) && (s = r.offsetHeight,
        h = r.parentNode.offsetTop,
        r.style.position = "fixed",
        r.style.height = String(s) + "px",
        r.style.top = String(h) + "px"),
        Jx.isNullOrUndefined(this._control) || this._leftoverControls.push({
            page: this._page,
            control: this._control
        }))
    }
    ;
    n.CpContent.prototype._cleanupAnimations = Jx.fnEmpty;
    n.CpContent.prototype.update = function(i, r, f, e, s, h) {
        var l, p, w, a, c, v, y;
        if (Jx.log.info("People.CpContent.update: " + i),
        l = this._getControl(i),
        l) {
            p = this._control;
            w = Jx.root;
            p && (h !== "back" && w.setBackStateOfTopItem(u(this._currentControlName, p)),
            w.getCommandBar().reset());
            a = this._container;
            a.className = "content-container under";
            var b = t.Pages[i].control
              , g = o(b, l) || s
              , nt = e === null ? "load" : "hydrate"
              , k = false
              , d = WinJS.Promise.wrap()
              , tt = {
                element: a,
                mode: nt,
                data: r,
                fields: f,
                context: e,
                state: g
            }
              , it = l.load(tt);
            return d = WinJS.Promise.wrap(it),
            k = !!l.activate(),
            this._currentControlName = b,
            this._page = i,
            this._control = l,
            c = this._outgoing,
            this._outgoing = null,
            v = null,
            this._cleanupAnimations = function() {
                v && (v.onExitComplete = v.onEnterComplete = Jx.fnEmpty);
                c = this._removeOutgoing(c);
                this._cleanupAnimations = Jx.fnEmpty;
                this._cleanupLeftoverControls()
            }
            ,
            y = this,
            d.then(function(t) {
                t = t || {};
                var i = t.elements || [a]
                  , r = n.Sequence.flatten(i);
                return Jx.removeClass(a, "under"),
                Jx.addClass(a, "entering"),
                c && Jx.addClass(c, "under"),
                r.forEach(function(n) {
                    n.style.opacity = "0"
                }),
                v = {
                    entering: i,
                    exiting: c ? [c] : [],
                    onExitComplete: function() {
                        c = y._removeOutgoing(c);
                        y._cleanupLeftoverControls()
                    },
                    onEnterComplete: function() {
                        Jx.removeClass(a, "entering");
                        t.onEnterComplete && t.onEnterComplete.call(l);
                        k || y._jobSet.addUIJob(y, y._setDefaultFocus, null, n.Priority.focus);
                        v = null;
                        y._cleanupAnimations()
                    }
                }
            })
        }
        return WinJS.Promise.wrap({
            entering: [],
            exiting: []
        })
    }
    ;
    n.CpContent.prototype._removeOutgoing = function(t) {
        return t && n.Animation.removeOutgoingElement(t),
        null
    }
    ;
    n.CpContent.prototype._setDefaultFocus = function() {
        var n = document.activeElement;
        Jx.isHTMLElement(n) && n === document.body && this.setDefaultFocus()
    }
    ;
    n.CpContent.prototype.setDefaultFocus = function() {
        var i, r, t, u, n;
        for (Jx.log.info("People.CpContent.setDefaultFocus"),
        r = this._container.querySelectorAll("[tabIndex='0']"),
        t = 0,
        u = r.length; t < u; t++)
            if (n = r[t],
            n.offsetWidth > 0 && n.offsetHeight > 0 && getComputedStyle(n).visibility !== "hidden") {
                i = n;
                break
            }
        i && Jx.safeSetActive(i)
    }
    ;
    n.CpContent.prototype._unloadControl = function(n, i) {
        i && (e(t.Pages[n].control, i),
        i.unload())
    }
    ;
    n.CpContent.prototype.trackStartup = function() {
        var n = this._control;
        Jx.isObject(n) && Jx.isFunction(n.trackStartup) && n.trackStartup()
    }
    ;
    n.CpContent.prototype.prepareSuspension = function() {
        var t = null, n;
        return this._currentControlName && (n = this._control,
        n && (t = n.prepareSuspension())),
        t
    }
    ;
    n.CpContent.prototype.getControl = function() {
        return this._control
    }
    ;
    n.CpContent.prototype.getAddressBookControl = function() {
        return this._currentControlName === t.Pages.viewab.control ? this._control : null
    }
    ;
    n.CpContent.prototype.scrollToBeginning = function() {
        Jx.isFunction(this._control.scrollToBeginning) && this._control.scrollToBeginning()
    }
    ;
    n.CpContent.prototype.trackNavStart = function(n) {
        var r = this._controlMap[t.Pages[n].control];
        r.navStartEvent && i("trackNavStart:" + r.navStartEvent);
        r.perfTrackStart && Jx.ptStart(r.perfTrackStart)
    }
    ;
    n.CpContent.prototype.trackNavEnd = function(n) {
        var r = this._controlMap[t.Pages[n].control];
        r.navEndEvent && i("trackNavEnd:" + r.navEndEvent);
        r.perfTrackStop && Jx.ptStop(r.perfTrackStop)
    }
})
