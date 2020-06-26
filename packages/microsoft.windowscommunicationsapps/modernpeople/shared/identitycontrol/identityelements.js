Jx.delayDefine(People, "IdentityElements", function() {
    "use strict";
    function l(t, i, r, u) {
        var f = r
          , e = u;
        return i !== undefined && (Jx.isFunction(i) ? (f = i,
        e = null) : (f = n(i, "element"),
        e = i),
        f && u && u.className && (e = g(u.className, e))),
        f ? t.getUI(f, e) : ""
    }
    function p(n, t) {
        n.parentNode && (n.nodeValue = t || "")
    }
    var i = window.People, k = i.IdentityControl, g = k.addClassNameToOptions, n = k.getOption, h = Microsoft.WindowsLive.Platform, r = i.IdentityElements = {}, a = r.makeElement = function(n, t, i, r, u) {
        return d(n, t, i, r, "", u)
    }
    , d = r.makeElementWithAttributes = function(t, i, r, u, f, e) {
        return "<" + t + " class='" + i + " " + r + " " + n(u, "className", "") + "' " + n(u, "attributes", "") + " " + f + ">" + e + "<\/" + t + ">"
    }
    , u = r.BaseElement = function() {}
    , o, f, c, s, t, e, y, b;
    u.prototype.getUI = function() {}
    ;
    u.prototype.clone = function() {
        return new this.constructor
    }
    ;
    u.prototype.activateUI = function() {}
    ;
    u.prototype.shutdownUI = function() {}
    ;
    u.prototype.getTooltip = function() {
        return ""
    }
    ;
    o = r.Name = function() {
        this._textNode = null;
        this._value = ""
    }
    ;
    Jx.inherit(o, u);
    o.prototype.getUI = function(n, t, i) {
        var r = n.getDataObject()
          , u = this._value = r ? o.getName(r, true) : null;
        return a("span", t, "ic-name", i, u ? Jx.escapeHtml(u) : " ")
    }
    ;
    o.prototype.activateUI = function(n, t) {
        this._textNode = t.firstChild;
        n.bind(this._setName, this, i.Priority.synchronous)
    }
    ;
    o.prototype.shutdownUI = function() {
        this._textNode = null
    }
    ;
    o.getName = function(n, t) {
        var i, r;
        switch (n.objectType) {
        case "Person":
        case "MeContact":
            i = n.calculatedUIName;
            break;
        case "Contact":
            i = n.calculatedUIName || Jx.res.getString("/strings/person_calculatedUIName_unnamed");
            break;
        case "literal":
            i = n.name;
            break;
        case "Recipient":
            t ? i = n.fastName : (i = n.calculatedUIName,
            r = n.person,
            r && r.calculatedUIName)
        }
        return i
    }
    ;
    o.prototype._setName = function(n) {
        var t = o.getName(n);
        t !== this._value && (this._value = t,
        p(this._textNode, t))
    }
    ;
    f = r.Networks = function() {
        this._textNode = null;
        this._priority = i.Priority.slowData
    }
    ;
    Jx.inherit(f, u);
    f.prototype.getUI = function(t, r, u) {
        return this._priority = n(u, "priority", i.Priority.slowData),
        a("span", r, "ic-name", u, " ")
    }
    ;
    f.prototype.clone = function() {
        var n = new f;
        return n._priority = this._priority,
        n
    }
    ;
    f.prototype.activateUI = function(n, t) {
        this._textNode = t.firstChild;
        n.bind(this._clear, this, i.Priority.synchronous);
        n.bind(this._setNetworks, this, this._priority)
    }
    ;
    f.prototype.shutdownUI = function() {
        this._textNode = null
    }
    ;
    f.getNetworks = function(n) {
        var t, r, i;
        switch (n.objectType) {
        case "Person":
        case "MeContact":
            t = n.linkedContacts;
            break;
        case "Recipient":
            r = n.person;
            r && (t = r.linkedContacts);
            break;
        case "Contact":
            t = [n];
            break;
        case "literal":
            return n.networkDisplayName || ""
        }
        return i = [],
        t && t.forEach(function(n) {
            var r = n.account, t;
            r && (t = r.displayName,
            Jx.isNonEmptyString(t) && i.indexOf(t) === -1 && i.push(t))
        }),
        i.join(Jx.res.getString("/identityControl/icNetworkSeperator"))
    }
    ;
    f.prototype._setNetworks = function(n) {
        p(this._textNode, f.getNetworks(n))
    }
    ;
    f.prototype._clear = function() {
        p(this._textNode, "")
    }
    ;
    f.prototype.getTooltip = function() {
        return this._textNode.nodeValue
    }
    ;
    c = r.StatusIndicator = function() {
        this._node = null;
        this._baseClassName = "";
        this._currentStatusClass = "";
        this._status = Microsoft.WindowsLive.Platform.ContactStatus.offline
    }
    ;
    Jx.inherit(c, u);
    c.prototype.getUI = function(t, i, r) {
        return this._baseClassName = "ic-status " + n(r, "className", ""),
        a("div", i, "ic-status", r, "")
    }
    ;
    c.prototype.clone = function() {
        var n = new c;
        return n._baseClassName = this._baseClassName,
        n
    }
    ;
    c.prototype.activateUI = function(n, t) {
        this._node = t;
        n.bind(this._setStatus, this, i.Priority.synchronous)
    }
    ;
    c.prototype._setStatus = function(n) {
        var i = n.onlineStatus
          , t = "";
        switch (i) {
        case h.ContactStatus.online:
            t = "ic-status-online";
            break;
        case h.ContactStatus.away:
            t = "ic-status-away";
            break;
        case h.ContactStatus.busy:
            t = "ic-status-busy"
        }
        this._status = i;
        this._currentStatusClass !== t && (this._currentStatusClass = t,
        this._node.className = this._baseClassName + " " + t)
    }
    ;
    c.prototype.getTooltip = function() {
        return s.getStatusText(this._status)
    }
    ;
    s = r.StatusText = function() {
        this._textNode = null
    }
    ;
    Jx.inherit(s, u);
    s.prototype.getUI = function(n, t, i) {
        return a("span", t, "ic-statusText", i, " ")
    }
    ;
    s.prototype.activateUI = function(n, t) {
        this._textNode = t.firstChild;
        n.bind(this._setStatus, this, i.Priority.synchronous)
    }
    ;
    s.prototype.shutdownUI = function() {
        this._textNode = null
    }
    ;
    s.prototype._setStatus = function(n) {
        var t = n.onlineStatus
          , i = n.objectType === "MeContact";
        p(this._textNode, s.getStatusText(t, true, i))
    }
    ;
    s.getStatusText = function(n, t, i) {
        var r;
        if (!Jx.isNullOrUndefined(n)) {
            switch (n) {
            case h.ContactStatus.online:
                r = "/identityControl/icStatusOnline";
                break;
            case h.ContactStatus.busy:
                r = "/identityControl/icStatusBusy";
                break;
            case h.ContactStatus.away:
                t && (r = "/identityControl/icStatusAway");
                break;
            case h.ContactStatus.offline:
                t && (r = i ? "/identityControl/isStatusMeOffline" : "/identityControl/icStatusOffline");
                break;
            case h.ContactStatus.appearOffline:
                t && (r = "/identityControl/icStatusAppearOffline")
            }
            if (r)
                return Jx.res.getString(r)
        }
        return ""
    }
    ;
    t = r.Tile = function() {
        this._node = null;
        this._style = null;
        this._path = "";
        this._url = "";
        this._clampedSize = 220;
        this._tilePriority = i.Priority.synchronous;
        this._collapse = false;
        this._defaultImage = null;
        this._download = false;
        this._userTileBinder = null;
        this._userTile = null;
        this._imgToVerify = null;
        this._imgListener = null;
        this._entranceAnimation = false;
        this._animation = null;
        this._animatingNode = null;
        this._pendingUrl = ""
    }
    ;
    Jx.inherit(t, u);
    var v = Microsoft.WindowsLive.Platform.UserTileSize
      , w = {
        32: v.tiny,
        40: v.extraSmall,
        60: v.small,
        95: v.medium,
        100: v.large,
        220: v.extraLarge
    }
      , nt = function(n) {
        var t, i;
        for (i in w)
            if (t = parseInt(i),
            t >= n)
                break;
        return t
    };
    t.prototype.getUI = function(t, r, u) {
        var f = n(u, "size", 220);
        return this._clampedSize = nt(f),
        this._tilePriority = n(u, "tilePriority", i.Priority.synchronous),
        this._collapse = n(u, "collapse", false),
        this._entranceAnimation = n(u, "animate", false),
        this._defaultImage = n(u, "defaultImage", null),
        this._download = false,
        d("div", r, "ic-tile", u, "style='width:" + f + "px; height:" + f + "px;'", "")
    }
    ;
    t.prototype.clone = function() {
        var n = new t;
        return n._clampedSize = this._clampedSize,
        n._tilePriority = this._tilePriority,
        n._collapse = this._collapse,
        n._entranceAnimation = this._entranceAnimation,
        n._defaultImage = this._defaultImage,
        n
    }
    ;
    t.prototype.activateUI = function(n, t) {
        this._node = t;
        this._style = t.style;
        n.bind(this._reset, this, i.Priority.synchronous);
        n.bind(this._setDataObject, this, this._tilePriority);
        n.bind(this._downloadTile, this, i.Priority.userTileDownload)
    }
    ;
    t.prototype._setDataObject = function(n) {
        if (this._disposeTile(),
        n.objectType === "literal") {
            var t = n.userTile;
            this._clampedSize > 100 && Jx.isNonEmptyString(n.largeUserTile) && (t = n.largeUserTile);
            this._setUrl(t)
        } else
            n.objectType === "Recipient" && (n = n.person),
            n && (this._userTileBinder = n.getUserTile(w[this._clampedSize], !this._download),
            this._userTileBinder && (this._userTile = this._userTileBinder.createAccessor(this._setPath.bind(this)))),
            this._setPath();
        this._download && this._verifyImage(this._url)
    }
    ;
    t.prototype._setPath = function() {
        var n = this._userTile ? this._userTile.appdataURI : null;
        this._url && this._path === n || (this._path = n,
        this._setUrl(n))
    }
    ;
    t.prototype._setUrl = function(n) {
        var t, i;
        Jx.isNonEmptyString(n) || (this._defaultImage === null && (this._defaultImage = Include.replacePaths("$(imageResources)/ic-default-" + this._clampedSize + ".png")),
        n = this._defaultImage,
        !this._url && this._collapse && Jx.addClass(this._node, "ic-collapsed"));
        this._url !== n && (this._animation ? this._pendingUrl = n : (!this._url && n ? this._entranceAnimation && (t = WinJS.UI.Animation.fadeIn(this._node)) : this._url && (i = this._animatingNode = document.createElement("div"),
        i.style.backgroundImage = this._style.backgroundImage,
        i.className = "ic-tile-fade",
        this._node.insertBefore(i, this._node.firstChild),
        t = WinJS.UI.Animation.fadeOut(i)),
        this._style.backgroundImage = "url(" + n + ")",
        this._url = n,
        this._verifyImage(n),
        t && (this._animation = t,
        t.done(this._onAnimationComplete.bind(this)))))
    }
    ;
    t.prototype._onAnimationComplete = function() {
        this._animation = null;
        this._removeAnimatingNode();
        var n = this._pendingUrl;
        n && (this._pendingUrl = null,
        this._setUrl(n))
    }
    ;
    t.prototype._verifyImage = function(n) {
        if (this._stopVerification(),
        Jx.isNonEmptyString(n) && n.substr(0, 4) === "http") {
            var i = this._imgToVerify = new Image
              , t = this._imgListener;
            t || (t = this._imgListener = this._onVerificationError.bind(this));
            i.addEventListener("error", t);
            i.src = n
        }
    }
    ;
    t.prototype._onVerificationError = function() {
        Jx.log.error("Failed to download usertile");
        Jx.log.pii(this._imgToVerify.src);
        this._setUrl(null)
    }
    ;
    t.prototype._stopVerification = function() {
        var n = this._imgToVerify;
        n && (n.removeEventListener("error", this._imgListener),
        n.src = "",
        this._imgToVerify = null)
    }
    ;
    t.prototype._downloadTile = function(n) {
        this._download = true;
        this._setDataObject(n)
    }
    ;
    t.prototype._disposeTile = function() {
        this._userTileBinder && (this._userTileBinder.dispose(),
        this._userTileBinder = this._userTile = null)
    }
    ;
    t.prototype._removeAnimatingNode = function() {
        var n = this._animatingNode, t;
        n && (this._animatingNode = null,
        t = n.parentElement,
        t && t.removeChild(n))
    }
    ;
    t.prototype._cleanup = function() {
        this._stopVerification();
        this._disposeTile();
        this._pendingUrl = "";
        var n = this._animation;
        n && (this._animation = null,
        n.cancel())
    }
    ;
    t.prototype._reset = function() {
        this._download = false;
        this._cleanup();
        this._url && (this._url = this._style.backgroundImage = "",
        this._collapse && Jx.removeClass(this._node, "ic-collapsed"));
        this._removeAnimatingNode()
    }
    ;
    t.prototype.shutdownUI = function() {
        this._cleanup()
    }
    ;
    e = r.BillboardLayout = function() {
        this._isSelected = null;
        this._selectionManager = null;
        this._selectionNode = null;
        this._selectionHost = null;
        this._selectionOnParent = false;
        this._observer = null
    }
    ;
    Jx.inherit(e, u);
    e.prototype.getUI = function(t, i, u) {
        var e = n(u, "size", 60), f, c, v;
        f = n(u, "fontSize", "medium");
        var y = l(t, n(u, "tile"), r.Tile, {
            className: "ic-billboardLayout-tile",
            size: e,
            statusIndicator: n(u, "statusIndicator"),
            tilePriority: n(u, "tilePriority")
        })
          , o = l(t, n(u, "primaryContent"), r.Name, {
            className: "ic-billboardLayout-primaryContent ic-billboardLayout-primaryContent-" + f + " singleLineText"
        })
          , s = o
          , h = "";
        return t.getSelectionManager() && (h = "<div class='ic-billboardLayout-selection ic-billboardLayout-selectionBackground'><\/div>",
        s = "<div class='ic-billboardLayout-primaryArea'>" + o + "<div class='ic-billboardLayout-selection ic-billboardLayout-selectionMark'><\/div><\/div>",
        this._selectionOnParent = n(u, "selectionOnParent", false)),
        c = "<div class='ic-billboardLayout-textArea ic-billboardLayout-textArea-" + e + " ic-billboardLayout-textArea-" + f + "'>" + s + l(t, n(u, "secondaryContent"), null, {
            className: "ic-billboardLayout-secondaryContent singleLineText"
        }) + "<\/div>",
        v = "ic-billboardLayout ic-billboardLayout-" + e + " ic-billboardLayout-" + f,
        a("div", i, v, u, h + y + c)
    }
    ;
    e.prototype.clone = function() {
        var n = new e;
        return n._selectionOnParent = this._selectionOnParent,
        n
    }
    ;
    e.prototype.activateUI = function(n, t) {
        var r = this._selectionManager = n.getSelectionManager();
        r && (this._selectionHost = n,
        this._selectionNode = this._selectionOnParent ? t.parentElement : t,
        this._observer = Jx.observeAttribute(this._selectionNode, "aria-selected", this._onAttrChange, this),
        r.addListener("selectionchange", this._onSelectionChange, this),
        n.bind(this._initializeSelection, this, i.Priority.synchronous))
    }
    ;
    e.prototype.shutdownUI = function() {
        var t = this._selectionManager, n;
        t && (this._selectionManager = null,
        t.removeListener("selectionchange", this._onSelectionChange, this));
        n = this._observer;
        n && (this._observer = null,
        n.disconnect())
    }
    ;
    e.prototype._initializeSelection = function() {
        this._updateSelection(false)
    }
    ;
    e.prototype._onSelectionChange = function() {
        this._updateSelection(true)
    }
    ;
    e.prototype._updateSelection = function(n) {
        var r, t;
        r = this._selectionHost.getDataObject();
        r && (t = this._selectionManager.isSelected(r),
        t !== this._isSelected && (this._isSelected = t,
        this._selectionNode.setAttribute("aria-selected", t.toString()),
        Jx.setClass(this._selectionNode, "win-selected", t),
        !n || i.Animation && i.Animation.disabled || WinJS.UI.Animation[t ? "swipeSelect" : "swipeDeselect"](null, this._selectionNode.querySelectorAll(".ic-billboardLayout-selection"))))
    }
    ;
    e.prototype._onAttrChange = function() {
        var n = this._selectionNode;
        n.getAttribute("aria-selected") !== this._isSelected.toString() && msSetImmediate(function() {
            n.click()
        })
    }
    ;
    y = r.PickerLayout = function() {}
    ;
    Jx.inherit(y, u);
    y.prototype.getUI = function(t, i, r) {
        var u = Object.create(r);
        return u.className = "",
        u.selectionOnParent = true,
        a("div", i, "ic-pickerLayout", r, t.getUI(e, u) + l(t, n(r, "secondaryHitTarget"), null, {
            className: "ic-pickerLayout-secondaryHitTarget"
        }))
    }
    ;
    y.prototype.activateUI = function(n, t) {
        var u = t.querySelector(".ic-billboardLayout"), r;
        i.Animation.addPressStyling(u);
        r = t.querySelector(".ic-pickerLayout-secondaryHitTarget");
        r.setAttribute("role", "button");
        r.setAttribute("aria-label", Jx.res.getString("/identityControl/icSecondaryHitTarget"));
        r.setAttribute("aria-haspopup", "true");
        r.addEventListener("click", function(n) {
            n.stopPropagation()
        }, false);
        r.addEventListener("MSPointerDown", function(n) {
            n.stopPropagation()
        }, false);
        r.addEventListener("mousedown", function(n) {
            n.stopPropagation()
        }, false);
        i.Animation.addPressStyling(r)
    }
    ;
    b = r.TileLayout = function() {}
    ;
    Jx.inherit(b, u);
    b.prototype.getUI = function(t, i, u) {
        var s = n(u, "size", 220), p = "<div class='ic-tileContainer'>" + l(t, n(u, "tile"), r.Tile, {
            className: "ic-tileLayout-tile",
            size: s,
            tilePriority: n(u, "tilePriority"),
            defaultImage: n(u, "defaultImage")
        }) + "<\/div>", f = l(t, n(u, "primaryContent"), r.Name, {
            className: "ic-tileLayout-primaryText"
        }), h, e, o, c, v, y;
        return Jx.isNonEmptyString(f) && (f = "<div class='ic-tileLayout-primary'>" + f + "<\/div>"),
        h = l(t, n(u, "secondaryContent"), null, {
            className: "ic-tileLayout-secondary"
        }),
        e = "",
        n(u, "useInnerHighlight", false) && (o = s - 4,
        c = "'position:absolute; top:2px; left:2px; width:" + o + "px; height:" + o + "px; outline-style:solid; outline-width:2px'",
        e = "<div class='ic-tile-innerHighlight' style=" + c + "><\/div>"),
        v = n(u, "snap") ? "ic-tileLayout-snap" : "",
        y = n(u, "portrait") ? "ic-tileLayout-portrait" : "",
        a("div", i, "ic-tileLayout " + v + " " + y, u, p + f + h + e)
    }
})
