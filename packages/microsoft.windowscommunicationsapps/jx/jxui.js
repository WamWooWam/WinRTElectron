Jx.delayDefine(Jx, "Clicker", function() {
    var n = Jx.Clicker = function(n, t, i, r) {
        this._element = n;
        this._callback = t;
        this._context = i;
        this._keys = r || ["Spacebar", "Enter"];
        this._onEvent = this._onEvent.bind(this);
        n.addEventListener("keydown", this._onEvent, false);
        n.addEventListener("click", this._onEvent, false)
    };
    n.prototype = {
        dispose: function() {
            var n = this._element;
            n && (n.removeEventListener("keydown", this._onEvent, false),
                n.removeEventListener("click", this._onEvent, false),
                this._element = null,
                this._callback = null,
                this._context = null)
        },
        _onEvent: function(n) {
            (n.type === "click" || this._keys.indexOf(n.key) !== -1) && (this._callback.call(this._context, n),
                n.preventDefault())
        }
    }
});
Jx.delayDefine(Jx, "KeyboardNavigation", function() {
    function t(n, t) {
        for (var i = 0, r = n.offsetParent; t && t !== r;)
            i += t.offsetTop,
            t = t.offsetParent;
        return i - n.offsetTop
    }

    function i(n, t) {
        return t && n.matches(t)
    }

    function n(n, t) {
        return Array.prototype.indexOf.call(n, t)
    }
    var r = {
            horizontal: {
                Home: {
                    unit: "all",
                    direction: -1
                },
                Left: {
                    unit: "item",
                    get direction() {
                        return Jx.isRtl() ? 1 : -1
                    }
                },
                Right: {
                    unit: "item",
                    get direction() {
                        return Jx.isRtl() ? -1 : 1
                    }
                },
                End: {
                    unit: "all",
                    direction: 1
                }
            },
            vertical: {
                Home: {
                    unit: "all",
                    direction: -1
                },
                PageUp: {
                    unit: "page",
                    direction: -1
                },
                Up: {
                    unit: "item",
                    direction: -1
                },
                Down: {
                    unit: "item",
                    direction: 1
                },
                PageDown: {
                    unit: "page",
                    direction: 1
                },
                End: {
                    unit: "all",
                    direction: 1
                }
            }
        },
        u = {
            "-1": {
                getBoundary: function(n) {
                    return n.scrollTop
                },
                isInRange: function(n, i, r) {
                    return i && t(n, i) >= r
                }
            },
            "1": {
                getBoundary: function(n) {
                    return n.scrollTop + n.clientHeight
                },
                isInRange: function(n, i, r) {
                    return i && t(n, i) + i.offsetHeight <= r
                }
            }
        },
        f = Jx.KeyboardNavigation = function(n, t, i, u, f) {
            if (this._parentContainer = n,
                this._keyMotion = r[t],
                this._component = i,
                i)
                i.on("contentUpdated", this._onContentUpdated, this);
            this._excluded = u;
            this._activeTabIndex = f || 0;
            this._initialize()
        };
    f.prototype = {
        _initialize: function() {
            var t = this._getElements(),
                n;
            this._focusableElement = null;
            this._keydownListener = this._onKeydown.bind(this);
            this._focusListener = this._onFocus.bind(this);
            this._parentContainer.addEventListener("keydown", this._keydownListener, false);
            this._parentContainer.addEventListener("focus", this._focusListener, true);
            n = this._getFocusableIndex(t, 0, 1);
            n !== -1 && this._makeFocusable(t[n])
        },
        _getElements: function() {
            return this._parentContainer.querySelectorAll("[tabIndex]")
        },
        _isFocusable: function(n) {
            return !i(n, this._excluded) && getComputedStyle(n).display !== "none"
        },
        _getFocusableIndex: function(n, t, i) {
            for (var r = n.length; t >= 0 && t < r; t += i)
                if (this._isFocusable(n[t]))
                    return t;
            return -1
        },
        _onContentUpdated: function() {
            this.update()
        },
        update: function(t) {
            var i, r;
            i = this._getElements();
            (t || n(i, this._focusableElement) === -1 || !this._isFocusable(this._focusableElement)) && (r = this._getFocusableIndex(i, 0, 1),
                r !== -1 ? this._makeFocusable(i[r]) : this._makeFocusable(null))
        },
        _onKeydown: function(n) {
            var t = this._keyMotion[n.key];
            t && (n.preventDefault(),
                n.stopPropagation(),
                this._moveBy(t.unit, t.direction))
        },
        _moveBy: function(t, i) {
            var r, o;
            var f = this._getElements(),
                l = f.length,
                e = 0;
            switch (t) {
                case "all":
                    e = this._getFocusableIndex(f, i > 0 ? l - 1 : 0, i);
                    break;
                case "item":
                    e = this._getFocusableIndex(f, n(f, this._focusableElement) + i, i);
                    break;
                case "page":
                    for (r = f[0]; r && ["scroll", "auto"].indexOf(getComputedStyle(r).overflowY) === -1;)
                        r = r.parentElement;
                    r = r || this._parentContainer;
                    var s = u[i],
                        c = n(f, this._focusableElement),
                        h = s.getBoundary(r);
                    e = this._advanceToBoundary(r, f, c, i, s, h);
                    e === c && (h += r.clientHeight * i,
                        e = this._getFocusableIndex(f, e + i, i),
                        e = this._advanceToBoundary(r, f, e, i, s, h))
            }
            o = f[e];
            o && (this._makeFocusable(o),
                o.focus())
        },
        _advanceToBoundary: function(n, t, i, r, u, f) {
            if (i !== -1)
                for (var e = this._getFocusableIndex(t, i + r, r); u.isInRange(n, t[e], f);)
                    i = e,
                    e = this._getFocusableIndex(t, i + r, r);
            return i
        },
        _onFocus: function(n) {
            for (var t = n.target, r = this._parentContainer, u = this._focusableElement; t !== null && t !== r && t !== u;) {
                if (t.hasAttribute("tabIndex") && !i(t, this._excluded)) {
                    this._makeFocusable(t);
                    break
                }
                t = t.parentNode
            }
        },
        _makeFocusable: function(n) {
            this._focusableElement && (this._focusableElement.tabIndex = -1);
            n && (n.tabIndex = this._activeTabIndex);
            this._focusableElement = n
        },
        dispose: function() {
            var n = this._parentContainer,
                t;
            n && (this._parentContainer = null,
                n.removeEventListener("keydown", this._keydownListener, false),
                n.removeEventListener("focus", this._focusListener, true));
            t = this._component;
            t && (this._component = null,
                t.detach("contentUpdated", this._onContentUpdated, this))
        }
    }
});
Jx.delayDefine(Jx, "List", function() {
    function u(n) {
        return {
            element: n,
            originalTop: n.getBoundingClientRect().top,
            adjustment: 0
        }
    }

    function f(n) {
        n.adjustment = n.originalTop - n.element.getBoundingClientRect().top
    }

    function l(n) {
        return n.adjustment !== 0
    }

    function a(n) {
        return n.element
    }

    function i(n, t) {
        return function(i) {
            return "translate(0px, " + n[i].adjustment + "px) " + (t || "")
        }
    }

    function t(n, t) {
        return Array.prototype.indexOf.call(n, t) !== -1
    }

    function v(n, t) {
        return WinJS.UI.executeTransition(n, [{
            property: "transform",
            delay: 0,
            duration: 120,
            timing: "cubic-bezier(0.11, 0.5, 0.24, .96)",
            from: i(t),
            to: i(t, "scale(0.85)"),
            skipStylesReset: true
        }, {
            property: "opacity",
            delay: 0,
            duration: 120,
            timing: "linear",
            from: 1,
            to: 0,
            skipStylesReset: true
        }])
    }

    function y(n, t) {
        var r = t ? 60 : 0;
        return WinJS.UI.executeTransition(n.map(a), {
            property: "transform",
            delay: r,
            duration: 400,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            from: i(n),
            to: ""
        })
    }

    function p(n, t, i) {
        var r = i ? t ? 300 : 240 : t ? 120 : 0;
        return WinJS.UI.executeAnimation(n, [{
            keyframe: "WinJS-scale-up",
            delay: r,
            duration: 120,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)"
        }, {
            keyframe: "WinJS-opacity-in",
            delay: r,
            duration: 120,
            timing: "linear"
        }])
    }

    function r() {
        this.initComponent()
    }
    var e = Jx.scheduler.definePriorities({
            listUpdate: {
                base: Jx.Scheduler.BasePriority.normal,
                description: "Jx.List update"
            }
        }),
        o = 0,
        s = 1,
        h = 2,
        c = 5,
        n;
    n = Jx.List = function(n) {
        this.initComponent();
        n = n || {};
        this._role = Jx.isUndefined(n.role) ? "list" : n.role;
        this._factory = n.factory || function(n) {
            return n
        };
        this._requestAnimation = n.requestAnimation || Jx.fnEmpty;
        this._jobSet = Jx.scheduler.createJobSet(n.jobSet);
        this._priority = n.priority || e.listUpdate;
        this._onCollectionChanged = this._onCollectionChanged.bind(this);
        this._host = null;
        this._source = null;
        this._populated = false;
        this._childElements = null;
        this._pendingAdditions = [];
        this._pendingRemovals = [];
        this._updateJob = null;
        this._animationPromise = null;
        this._animationDisabled = false
    };
    Jx.augment(n, Jx.Component);
    n.prototype.setSource = function(n) {
        this.releaseSource();
        this._source = n;
        this._host && (n.addEventListener("collectionchanged", this._onCollectionChanged),
            this._populateChildren(),
            this._host.scrollTop = 0,
            this.fire("contentUpdated"))
    };
    n.prototype.releaseSource = function() {
        this._source && (this._source.removeEventListener("collectionchanged", this._onCollectionChanged),
            this._source = null,
            this._destroyChildren());
        this._cancelAnimations()
    };
    n.prototype.getUI = function(n) {
        var t = this._role;
        n.html = "<div  id='" + this._id + "' class='list'" + (t ? " role='" + t + "'" : "") + ">";
        this._source && (this._populateChildren(),
            n.html += this._getChildrenHtml());
        n.html += "<\/div>"
    };
    n.prototype.activateUI = function() {
        Jx.Component.prototype.activateUI.call(this);
        var n = this._host = document.getElementById(this._id);
        this._source && (this._source.addEventListener("collectionchanged", this._onCollectionChanged),
            this._populated ? this._childElements = Array.prototype.slice.call(n.children) : this._populateChildren())
    };
    n.prototype.deactivateUI = function() {
        this._destroyChildren();
        var n = this._host;
        n && (this.releaseSource(),
            this._host = null)
    };
    n.prototype.shutdownComponent = function() {
        Jx.dispose(this._jobSet);
        Jx.Component.prototype.shutdownComponent.call(this)
    };
    Jx.augment(r, Jx.Component);
    r.prototype.getUI = function(n) {
        n.html = "<div style='display:none'><\/div>"
    };
    n.prototype._addChild = function(n, t) {
        var i;
        return i = n ? this._factory(n) : new r,
            this.insertChild(i, t),
            i
    };
    n.prototype._populateChildren = function() {
        var i, n, r, u, t;
        for (this._populated = true,
            i = this._source,
            n = 0,
            r = i.count; n < r; n++)
            u = i.item(n),
            this._addChild(u, n);
        t = this._host;
        t && (t.innerHTML = this._getChildrenHtml(),
            this._childElements = Array.prototype.slice.call(t.children),
            this.forEachChild(function(n) {
                n.activateUI()
            }))
    };
    n.prototype._getChildrenHtml = function() {
        for (var t = "", r, n = 0, i = this.getChildrenCount(); n < i; n++)
            r = this.getChild(n),
            t += Jx.getUI(r).html;
        return t
    };
    n.prototype._destroyChildren = function() {
        this._populated = false;
        this._childElements = null;
        this.forEachChild(function(n) {
            n.deactivateUI();
            n.shutdownComponent()
        });
        this.removeChildren()
    };
    n.prototype.getElement = function(n) {
        return this._childElements[n]
    };
    n.prototype.getTarget = function(n) {
        var i = this._childElements,
            r, t;
        return i ? (r = this._getImmediateChildElement(n.target),
            t = i.indexOf(r),
            t !== -1 ? this.getChild(t) : null) : null
    };
    n.prototype._getImmediateChildElement = function(n) {
        for (var t = this._host, i = null; n && n !== t;)
            i = n,
            n = n.parentNode;
        return n === t ? i : null
    };
    n.prototype._queueChange = function(n) {
        var t = {},
            i, r, f = this._childElements,
            u, l, e, c;
        switch (n.eType) {
            case o:
                u = n.index;
                l = this._source.item(u);
                i = this._addChild(l, u);
                e = this._host;
                e.insertAdjacentHTML("beforeend", Jx.getUI(i).html);
                i.activateUI();
                t.newIndex = u;
                r = t.newChild = e.lastElementChild;
                t.newChild.style.display = "none";
                f.splice(u, 0, r);
                this._pendingAdditions.push(r);
                break;
            case s:
                t.oldIndex = n.previousIndex;
                t.newIndex = n.index;
                i = this.removeChildAt(t.oldIndex);
                this.insertChild(i, t.newIndex);
                f.splice(t.newIndex, 0, f.splice(t.oldIndex, 1)[0]);
                break;
            case h:
                t.oldIndex = n.index;
                i = this.removeChildAt(t.oldIndex);
                i.deactivateUI();
                i.shutdownComponent();
                r = f.splice(t.oldIndex, 1)[0];
                c = this._pendingAdditions.indexOf(r);
                c !== -1 ? (this._pendingAdditions.splice(c, 1),
                    this._host.removeChild(r)) : this._pendingRemovals.push(r);
                break;
            default:
                t = null
        }
    };
    n.prototype._applyQueuedChanges = function(n) {
        var r, k, tt, b, d, c, e, a, g;
        n = n || [];
        var nt = this._host,
            w = nt.children,
            o = this._childElements.slice(),
            s = this._pendingAdditions,
            it = s.length,
            i = this._pendingRemovals,
            h = i.length;
        if (this._pendingAdditions = [],
            this._pendingRemovals = [],
            it === 0 && h === 0 && o.every(function(n, t) {
                return n === w[t]
            }))
            return null;
        for (this._animationDisabled || (r = Array.prototype.filter.call(w, function(n) {
                    return !t(i, n) && !t(s, n)
                }).concat(n).map(u),
                k = i.map(u),
                i.forEach(function(n) {
                    var t = n.style;
                    t.position = "absolute";
                    t.top = "0px"
                })),
            s.forEach(function(n) {
                n.style.display = ""
            }),
            tt = this._getImmediateChildElement(document.activeElement),
            b = null,
            d = o.length; d--;) {
            if (c = o[d],
                c !== tt) {
                for (e = c.nextSibling; e && t(i, e);)
                    e = e.nextSibling;
                e !== b && nt.insertBefore(c, b)
            }
            b = c
        }
        return this.fire("contentUpdated"),
            a = [],
            this._animationDisabled || (r.forEach(f),
                k.forEach(f),
                r = r.filter(l),
                g = r.length,
                h && a.push(v(i, k)),
                g && a.push(y(r, h)),
                s.length > 0 && a.push(p(s, h, g))),
            Jx.Promise.cancelable(WinJS.Promise.join(a)).then(function() {
                    h !== 0 && (i.forEach(function(n) {
                            var t = n.parentNode;
                            t && t.removeChild(n)
                        }),
                        this.fire("contentUpdated"))
                }
                .bind(this)).then(this._applyQueuedChanges.bind(this, n))
    };
    n.prototype._cancelAnimations = function() {
        var n = this._animationPromise;
        n && n.cancel();
        this._jobSet.cancelJobs()
    };
    n.prototype._onCollectionChanged = function(n) {
        var t, r, i;
        n.target === this._source && (n.eType === c ? (this._cancelAnimations(),
            this._destroyChildren(),
            this._populateChildren(),
            this.fire("contentUpdated")) : (this._queueChange(n),
            this._animationPromise || (this._animationDisabled || (t = this._requestAnimation()),
                t = WinJS.Promise.then(t, function(n) {
                        return Jx.Promise.schedule(this._jobSet, this._priority).then(function() {
                            return n
                        })
                    }
                    .bind(this)),
                r = this._animationPromise = t.then(this._applyQueuedChanges.bind(this)),
                i = function() {
                    this._animationPromise = null
                }
                .bind(this),
                r.done(i, i))))
    };
    n.prototype.getAffectedElements = function(n) {
        var t, i, r;
        return (t = this._childElements,
            t && (i = this._children.indexOf(n),
                i !== -1)) ? (r = t[i],
            Array.prototype.filter.call(this._host.children, function(n) {
                return n !== r
            })) : []
    };
    n.prototype.waitForAnimation = function() {
        for (var i = [this._animationPromise], t, n = 0, r = this.getChildrenCount(); n < r; ++n)
            t = this.getChild(n),
            t.waitForAnimation && i.push(t.waitForAnimation());
        return Jx.Promise.fork(WinJS.Promise.join(i))
    };
    n.prototype.disableAnimations = function() {
        this._animationDisabled = true
    };
    n.prototype.enableAnimations = function() {
        this._jobSet.runSynchronous();
        this._animationDisabled = false
    }
});
Jx.delayDefine(Jx, "PeekBar", function() {
    function i(n, t) {
        var i = n.style,
            r = t.style;
        i.display = "";
        r.display = "";
        WinJS.UI.Animation.crossFade(n, t).done(function() {
            i.display = "";
            i.opacity = "";
            r.display = "none";
            r.opacity = ""
        })
    }
    var t = Jx.PeekBar = function(n) {
            this._placement = n ? n : "bottom";
            this._element = null;
            this._elementLong = null;
            this._elementTab = null;
            this._showAsTab = false;
            this._allowTabVersion = false;
            this._showAppBar = this._showAppBar.bind(this);
            this._onMouseMove = this._onMouseMove.bind(this);
            this._onPointerDown = this._onPointerDown.bind(this);
            this.initComponent()
        },
        n;
    Jx.augment(t, Jx.Component);
    n = t.prototype;
    t.height = 15;
    n.getUI = function(n) {
        var t = Jx.escapeHtml(Jx.res.getString("peekBarTitle"));
        n.html = "<div id='" + this._id + "' class='peekbar-" + this._placement + "'><div id='" + this._id + "long' role='button' title='" + t + "' class='peekbar peekbar-long'><div aria-hidden='true' class='peekbar-cuelayout'>&#57612;<\/div><\/div><div id='" + this._id + "tab' role='button' title='" + t + "' class='peekbar peekbar-tab'><div aria-hidden='true' class='peekbar-cuelayout'>&#57612;<\/div><\/div><\/div>"
    };
    n._showAppBar = function(n) {
        this.fire("peekBarShow", n)
    };
    n.onActivateUI = function() {
        Jx.Dep.load("/jx/PeekBar.css", Jx.fnEmpty);
        this._element || (this._element = document.getElementById(this._id));
        this._elementLong = document.getElementById(this._id + "long");
        this._elementTab = document.getElementById(this._id + "tab");
        this._elementTab.style.display = "none";
        this._element.addEventListener("click", this._showAppBar, false);
        t.height = this._elementLong.offsetHeight
    };
    n.onDeactivateUI = function() {
        this._element && this._element.removeEventListener("click", this._showAppBar, false);
        this.allowTabVersion(false)
    };
    n.dispose = function() {
        this.deactivateUI();
        this._element = null
    };
    n.show = function() {
        this._element && (this._element.style.display = "")
    };
    n.hide = function() {
        this._element && (this._element.style.display = "none")
    };
    n.isTabMode = function() {
        return this._showAsTab
    };
    n.allowTabVersion = function(n) {
        this._allowTabVersion !== n && (n ? (window.addEventListener("MSPointerDown", this._onPointerDown, true),
            window.addEventListener("mousemove", this._onMouseMove, true)) : (this._showFullView(),
            window.removeEventListener("MSPointerDown", this._onPointerDown, true),
            window.removeEventListener("mousemove", this._onMouseMove, true)));
        this._allowTabVersion = n
    };
    n._onPointerDown = function(n) {
        n.pointerType !== "mouse" && this._showFullView(n)
    };
    n._onMouseMove = function(n) {
        n.buttons === 0 && this._showTabView(n)
    };
    n._showFullView = function(n) {
        this._showAsTab && (this._showAsTab = false,
            i(this._elementLong, this._elementTab),
            Jx.EventManager.broadcast("peekBarFull", n))
    };
    n._showTabView = function(n) {
        this._showAsTab || (this._showAsTab = true,
            i(this._elementTab, this._elementLong),
            Jx.EventManager.broadcast("peekBarTab", n))
    }
});
Jx.delayDefine(Jx, "PressEffect", function() {
    "use strict";
    var n = {
            className: function(n, t) {
                Jx.setClass(n, "pressed", t)
            },
            attribute: function(n, t) {
                t ? n.setAttribute("data-state", "pressed") : n.removeAttribute("data-state")
            },
            animation: function(n, t, i) {
                i && (t ? WinJS.UI.Animation.pointerDown(n) : WinJS.UI.Animation.pointerUp(n))
            }
        },
        t = Jx.PressEffect = function(t, i, r, u) {
            this._onPointerDown = this._onPointerDown.bind(this);
            this._onPointerUp = this._onPointerUp.bind(this);
            this._element = t;
            this._selector = i;
            this._effects = r;
            this._captureSelector = u;
            this._pressed = null;
            this._pointerId = null;
            this._captureElement = null;
            t.addEventListener("MSPointerDown", this._onPointerDown, false)
        };
    t.prototype = {
        dispose: function() {
            var n = this._element;
            n && (n.removeEventListener("MSPointerDown", this._onPointerDown, false),
                this._element = null,
                this._unhook())
        },
        _onPointerDown: function(n) {
            var i, r, t, u, f;
            this._pressed || n.button === 0 && (i = this._getPressedElement(n),
                r = n.pointerId,
                i !== null && (this._applyEffects(i, true),
                    n.pointerType === "touch" && (u = this._captureSelector,
                        u && (t = this._element.querySelector(u))),
                    f = t || window,
                    f.addEventListener("MSPointerUp", this._onPointerUp, false),
                    f.addEventListener("MSPointerCancel", this._onPointerUp, false),
                    t && (t.addEventListener("MSLostPointerCapture", this._onPointerUp, false),
                        t.msSetPointerCapture(r)),
                    this._pressed = i,
                    this._pointerId = r,
                    this._captureElement = t))
        },
        _onPointerUp: function(n) {
            n.pointerId === this._pointerId && (this._applyEffects(this._pressed, false),
                this._unhook())
        },
        _unhook: function() {
            var i = this._pressed,
                n, t;
            i && (n = this._captureElement,
                t = n || window,
                n && (n.removeEventListener("MSLostPointerCapture", this._onPointerUp, false),
                    n.msReleasePointerCapture(this._pointerId)),
                t.removeEventListener("MSPointerCancel", this._onPointerUp, false),
                t.removeEventListener("MSPointerUp", this._onPointerUp, false),
                this._pressed = null,
                this._pointerId = null,
                this._captureElement = null)
        },
        _getPressedElement: function(n) {
            for (var t = n.target, i = this._element, r = this._selector; t && t !== i;) {
                if (t.matches(r))
                    return t;
                t = t.parentNode
            }
            return null
        },
        _applyEffects: function(t, i) {
            for (this._effects.forEach(function(r) {
                    n[r](t, i, true)
                }),
                t = t.parentNode; t && t !== this._element;)
                t.matches(this._selector) && this._effects.forEach(function(r) {
                    n[r](t, i, false)
                }),
                t = t.parentNode
        }
    }
});
Jx.delayDefine(Jx, "Promise", function() {
    Jx.Promise = {
        fork: function(n) {
            return new WinJS.Promise(function(t) {
                WinJS.Promise.then(n, t, t)
            })
        },
        cancelable: function(n) {
            var t;
            return new WinJS.Promise(function(i, r) {
                t = i;
                WinJS.Promise.then(n, function(n) {
                    if (t)
                        return t(n)
                }, r)
            }, function() {
                t = null;
                n.cancel()
            })
        },
        schedule: function(n, t, i) {
            var r;
            return new WinJS.Promise(function(u) {
                r = Jx.scheduler.addJob(n, t, i, u)
            }, function() {
                Jx.dispose(r)
            })
        }
    }
})