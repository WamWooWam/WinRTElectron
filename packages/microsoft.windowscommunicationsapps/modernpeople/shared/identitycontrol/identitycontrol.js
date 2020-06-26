Jx.delayDefine(People, "IdentityControl", function() {
    "use strict";
    function r(n) {
        this._identityControl = n
    }
    var i = window.People, n = i.IdentityControl = function(n, i, u) {
        f();
        this._ownJobSet = false;
        this._jobSet = i;
        this._elementHost = new r(this);
        u && (this._options = u);
        this._elements = [];
        this._bindings = [];
        this._binder = this._lastBinder = null;
        this._lastBinderType = "";
        this._dataObject = null;
        n && this._setDataObject(n);
        this._selectionManager = t(u, "selectionManager");
        this._needsTooltip = false
    }
    , f = function() {
        $include("$(cssResources)/IdentityControl.css");
        f = Jx.fnEmpty
    }, e, o, t, u;
    n.prototype.getUI = function(n, i) {
        var r = this._options;
        return t(r, "interactive", true) && (i = i ? Object.create(i) : {},
        i.attributes = t(i, "attributes", "") + " tabIndex='" + t(i, "tabIndex", t(r, "tabIndex", "0")) + "' role='" + t(r, "role", "button") + "'"),
        this._getUI(n, i, false)
    }
    ;
    n.prototype._getUI = function(n, t, i) {
        var r = new n
          , u = "ic-locator-" + String(Jx.uid())
          , f = r.getUI(this._elementHost, u, t);
        return this._elements.push({
            element: r,
            selector: "." + u,
            nested: Boolean(i)
        }),
        f
    }
    ;
    n.prototype.activateUI = function(n) {
        var o, e, c, r, f;
        n = n || document.body;
        t(this._options, "createJobSet", true) && (this._ownJobSet = true,
        o = this._jobSet || u(),
        this._jobSet = o.createChild());
        var s = t(this._options, "interactive", true)
          , h = this._elements
          , l = this._elementHost;
        for (e = 0,
        c = h.length; e < c; ++e)
            r = h[e],
            f = n.querySelector(r.selector),
            f === null && n.matches(r.selector) && (f = n),
            r.node = f,
            s && !r.nested && this.attachBehaviors(f),
            r.element.activateUI(l, f);
        s && (this._needsTooltip = true,
        this._addTooltip());
        this._bind(this._updateLabel, this, i.Priority.accessibility)
    }
    ;
    n.prototype.updateDataSource = function(n) {
        this._closeTooltip();
        this._ownJobSet && this._jobSet.cancelJobs();
        this._dataObject !== null && this._clearDataObject();
        n !== null && (this._setDataObject(n),
        this._bindings.forEach(this._startBinding, this),
        this._addTooltip())
    }
    ;
    n.prototype.clone = function(t, i, r) {
        var u = new n(i,r,this._options)
          , f = u._elementHost;
        return u._elements = this._elements.map(function(n) {
            var t = n.element
              , i = t.clone(f);
            return {
                element: i,
                selector: n.selector,
                nested: n.nested
            }
        }),
        u.activateUI(t),
        u
    }
    ;
    n.prototype.shutdownUI = function() {
        var n, r;
        this._closeTooltip();
        this._ownJobSet && (this._jobSet.dispose(),
        this._jobSet = null,
        this._ownJobSet = false);
        this._binder && (this._binder.dispose(),
        this._binder = null);
        this._dataObject = null;
        var f = t(this._options, "interactive", true)
          , i = this._elements
          , u = this._elementHost;
        for (n = 0,
        r = i.length; n < r; ++n)
            i[n].element.shutdownUI(u)
    }
    ;
    e = ["click", "pointerdown", "keydown", "beforeopen"];
    n.prototype.attachBehaviors = function(n) {
        var i = this._onDomEvent.bind(this, n);
        e.forEach(function(t) {
            n.addEventListener(t, i, false)
        });
        t(this._options, "onRightClick") && (n.addEventListener("contextmenu", i, false),
        n.addEventListener("MSHoldVisual", function(n) {
            n.preventDefault()
        }, false))
    }
    ;
    n.prototype._addTooltip = function() {
        this._needsTooltip && this._jobSet.addUIJob(this, function() {
            var i, n, r, t, u, f;
            if (this._needsTooltip)
                for (this._needsTooltip = false,
                i = this._elements,
                n = 0,
                r = i.length; n < r; ++n)
                    t = i[n],
                    t.nested || (u = t.node,
                    f = t.tooltip = new WinJS.UI.Tooltip(u))
        }, null, i.Priority.tooltip)
    }
    ;
    n.prototype._closeTooltip = function() {
        for (var i = this._elements, t, n = 0, r = i.length; n < r; ++n)
            t = i[n].tooltip,
            t && t.close()
    }
    ;
    n.prototype._onDomEvent = function(n, t) {
        switch (t.type) {
        case "click":
            this._onClick(n, t);
            break;
        case "pointerdown":
        case "MSPointerDown":
            this._onPointerDown(n, t);
            break;
        case "keydown":
            this._onKeyDown(n, t);
            break;
        case "beforeopen":
            this._onTooltip(n);
            break;
        case "contextmenu":
            this._onContextMenu(n, t)
        }
    }
    ;
    n.prototype._onPointerDown = function(n, r) {
        var u, f;
        u = this._dataObject;
        u !== null && t(this._options, "pressEffect", true) && (f = t(this._options, "onRightClick"),
        i.Animation.startTapAnimation(n, r, f))
    }
    ;
    n.prototype._onClick = function(n, r) {
        var u, f;
        r.stopPropagation();
        u = this._dataObject;
        u !== null && (f = t(this._options, "onClick"),
        (!f || f(u, n, r)) && i.IdentityControlActions.primaryAction(u, n))
    }
    ;
    n.prototype._onContextMenu = function(n, i) {
        var r, u;
        i.which === 3 && (r = this._dataObject,
        r !== null && (u = t(this._options, "onRightClick"),
        i.stopPropagation(),
        i.preventDefault(),
        u(r, n)))
    }
    ;
    n.prototype._onKeyDown = function(n, t) {
        t.key !== "Spacebar" && (t.key !== "Enter" || this._selectionManager) || (t.stopPropagation(),
        t.preventDefault(),
        this._onClick(n, t))
    }
    ;
    n.prototype._onTooltip = function(n) {
        var i = "", f = this._dataObject, r, u, t;
        for (f && (i = this._getTextLabel(f, "getTooltip")),
        r = n.winControl,
        u = "",
        Jx.isNonEmptyString(i) && (u = i.split("\n").map(function(n) {
            return "<div class='ic-tooltip'>" + Jx.escapeHtml(n) + "<\/div>"
        }).join("")),
        r.innerHTML = u,
        t = n.parentElement; t; t = t.parentElement)
            if (getComputedStyle(t).overflow === "scroll")
                break;
        t && n.addEventListener("opened", function e() {
            n.removeEventListener("opened", e, false);
            var i = function() {
                r.close()
            };
            t.addEventListener("scroll", i, false);
            n.addEventListener("closed", function u() {
                n.removeEventListener("closed", u, false);
                t.removeEventListener("scroll", i, false)
            }, false)
        }, false)
    }
    ;
    n.prototype._getTextLabel = function(n, r) {
        var e = this._elementHost
          , u = [i.IdentityElements.Name.getName(n)].concat(this._elements.map(function(t) {
            return t.element.getTooltip ? t.element.getTooltip(e, n, t.nested) : null
        }).filter(Jx.isNonEmptyString)).join("\n")
          , f = t(this._options, r);
        return f && (u = f(n, u)),
        u
    }
    ;
    n.prototype._updateLabel = function(n) {
        for (var f = this._getTextLabel(n, "getLabel"), r = this._elements, i, t = 0, u = r.length; t < u; ++t)
            i = r[t],
            i.nested || i.node.setAttribute("aria-label", f)
    }
    ;
    n.prototype._clearDataObject = function() {
        var n = this._binder;
        n !== null && (this._binder = null,
        this._lastBinder = n,
        this._lastBinderType = this._dataObject.objectType,
        n.dispose());
        this._dataObject = null
    }
    ;
    n.prototype._setDataObject = function(n) {
        var t, r;
        n.getPlatformObject && (n = n.getPlatformObject());
        this._dataObject = n;
        t = n.objectType;
        t !== "literal" && (this._lastBinderType === t ? (r = this._binder = this._lastBinder,
        r.setObject(n)) : this._binder = new i.PlatformObjectBinder(n));
        this._lastBinder = null;
        this._lastBinderType = ""
    }
    ;
    n.prototype._bind = function(n, t, r) {
        var u = {
            callback: n,
            context: t,
            priority: r,
            binder: null,
            accessor: null
        };
        u.onUpdate = this._updateBinding.bind(this, u, i.Priority.propertyUpdate);
        this._bindings.push(u);
        this._dataObject && this._startBinding(u)
    }
    ;
    n.prototype._startBinding = function(n) {
        var t = this._binder;
        t ? n.binder !== t && (n.binder = t,
        n.accessor = t.createAccessor(n.onUpdate)) : n.accessor = this._dataObject;
        this._updateBinding(n, n.priority)
    }
    ;
    n.prototype._updateBinding = function(n, t) {
        t === i.Priority.synchronous ? n.callback.call(n.context, n.accessor) : this._jobSet.addUIJob(n.context, n.callback, [n.accessor], t)
    }
    ;
    o = n.addClassNameToOptions = function(n, t) {
        return t ? t.className ? t.className += " " + n : t.className = n : t = {
            className: n
        },
        t
    }
    ;
    t = n.getOption = function(n, t, i) {
        var r = i;
        return n && (r = n[t],
        r === undefined && (r = i)),
        r
    }
    ;
    r.prototype.bind = function(n, t, i) {
        this._identityControl._bind(n, t, i)
    }
    ;
    r.prototype.getUI = function(n, t) {
        return this._identityControl._getUI(n, t, true)
    }
    ;
    r.prototype.getSelectionManager = function() {
        return this._identityControl._selectionManager
    }
    ;
    r.prototype.getDataObject = function() {
        return this._identityControl._dataObject
    }
    ;
    u = function() {
        var t = new i.Scheduler
          , n = t.getJobSet();
        return u = function() {
            return n
        }
        ,
        n
    }
})
