Jx.delayDefine(People, "Layout", function() {
    var t = window.People, i = Windows.UI.ViewManagement.ApplicationView, n;
    t.Layout = function() {
        this._queryWindowLayout();
        this._layoutChangedHandler = this._onLayoutChanged.bind(this);
        this._mql = window.matchMedia("(max-width: 375px)");
        this._mqlOrient = window.matchMedia("(orientation: portrait)");
        this._mqlTall = window.matchMedia("(min-height: 1024px)");
        this._mql.addListener(this._layoutChangedHandler);
        this._mqlOrient.addListener(this._orientationChangedHandler = this._onOrientationChanged.bind(this));
        this._tallChangedHandler = this._onTallChanged.bind(this);
        this._mqlTall.addListener(this._tallChangedHandler);
        this._saveLayoutState = true;
        this._tallEventTriggered = false;
        this._layoutEventTriggered = false;
        this._orientationEventTriggered = false;
        this._currentScreenHeight = window.screen.height
    }
    ;
    n = window.People.Layout;
    n.prototype.dispose = function() {
        this._mql && (this._mql.removeListener(this._layoutChangedHandler),
        this._mql = null);
        this._mqlOrient && (this._mqlOrient.removeListener(this._orientationChangedHandler),
        this._mqlOrient = null);
        this._mqlTall && (this._mqlTall.removeListener(this._tallChangedHandler),
        this._mqlTall = null)
    }
    ;
    n.layoutState = {
        snapped: "snapped",
        mobody: "mobody",
        portrait: "portrait"
    };
    n.prototype._currentLayoutState = "";
    n.prototype.layoutChanged = "layoutChanged";
    n.prototype._layoutChangedHandler = null;
    n.prototype.orientationChanged = "orientationChanged";
    n.prototype._orientationChangedHandler = null;
    n.prototype.tallChanged = "tallChanged";
    n.prototype._tallChangedHandler = null;
    n.prototype._onOrientationChanged = function() {
        Jx.log.info("People.CpMain._onOrientationChanged: raising orientationChanged event");
        this._queryWindowLayout();
        this._orientationEventTriggered = true;
        Jx.raiseEvent(this, this.orientationChanged);
        this._reportPerfTrackStopResize()
    }
    ;
    n.prototype.addOrientationChangedEventListener = function(n, t) {
        Jx.addListener(this, this.orientationChanged, n, t)
    }
    ;
    n.prototype.removeOrientationChangedEventListener = function(n, t) {
        Jx.removeListener(this, this.orientationChanged, n, t)
    }
    ;
    n.prototype.getIsTall = function() {
        return window.screen.height >= 1024
    }
    ;
    n.prototype._onTallChanged = function() {
        Jx.log.info("People.CpMain._onTallChanged: raising tallChanged event");
        this._queryWindowLayout();
        this._tallEventTriggered = true;
        Jx.raiseEvent(this, this.tallChanged);
        this._reportPerfTrackStopResize()
    }
    ;
    n.prototype.addTallChangedEventListener = function(n, t) {
        Jx.addListener(this, this.tallChanged, n, t)
    }
    ;
    n.prototype.removeTallChangedEventListener = function(n, t) {
        Jx.removeListener(this, this.tallChanged, n, t)
    }
    ;
    n.prototype.getLayoutState = function() {
        return Jx.log.info("People.Layout.getLayoutState"),
        this._currentLayoutState === "" && this._queryWindowLayout(),
        this._currentLayoutState
    }
    ;
    n.prototype.addLayoutChangedEventListener = function(n, t) {
        Jx.addListener(this, this.layoutChanged, n, t)
    }
    ;
    n.prototype.removeLayoutChangedEventListener = function(n, t) {
        Jx.removeListener(this, this.layoutChanged, n, t)
    }
    ;
    n.prototype.unsnap = function(n, t) {
        return Jx.log.info("People.Layout.unsnap"),
        n && n.call(t),
        true
    }
    ;
    n.prototype._reportPerfTrackStopResize = function() {
        var t = this._oldScreenHeight < 1024 && this._currentScreenHeight >= 1024 || this._oldScreenHeight >= 1024 && this._currentScreenHeight < 1024, r = t && !this._tallEventTriggered, u = this._oldLayoutState !== n.layoutState.snapped && this._currentLayoutState === n.layoutState.snapped || this._oldLayoutState === n.layoutState.snapped && this._currentLayoutState !== n.layoutState.snapped, f = u && !this._layoutEventTriggered, i;
        !this._orientationEventTriggered || f || r || (i = t || this._layoutEventTriggered,
        Jx.ptStopResize(Jx.TimePoint.responsive, i, t, window.screen.width, window.screen.height),
        this._tallEventTriggered = false,
        this._layoutEventTriggered = false,
        this._orientationEventTriggered = false,
        this._saveLayoutState = true)
    }
    ;
    n.prototype._queryWindowLayout = function() {
        Jx.log.info("People.Layout._queryWindowLayout");
        this._saveLayoutState && (this._oldLayoutState = this._currentLayoutState,
        this._oldScreenHeight = this._currentScreenHeight,
        this._saveLayoutState = false);
        this._currentScreenHeight = window.screen.height;
        var t = i.value
          , r = Windows.UI.ViewManagement.ApplicationViewState;
        this._currentLayoutState = t === r.snapped ? n.layoutState.snapped : t === r.fullScreenPortrait ? n.layoutState.portrait : n.layoutState.mobody
    }
    ;
    n.prototype._onLayoutChanged = function() {
        var t, n;
        Jx.log.info("People.Layout._onLayoutChanged");
        t = this._currentLayoutState;
        this._queryWindowLayout();
        n = this._currentLayoutState;
        n !== t && (Jx.log.info("People.CpMain._onLayoutChanged: raising layoutChanged event=" + n),
        this._layoutEventTriggered = true,
        Jx.raiseEvent(this, this.layoutChanged, n),
        this._reportPerfTrackStopResize())
    }
})
