Jx.delayDefine(People, "Animation", function() {
    function l(t) {
        var i = WinJS.UI.Animation;
        n[t] = function() {
            return i[t].apply(i, arguments)
        }
    }
    function a(t) {
        var i = WinJS.UI.Animation;
        n[t] = function() {
            return i[t].apply(i, arguments)
        }
    }
    function v() {
        ["crossFade", "enterContent", "exitContent", "exitPage", "pointerDown", "pointerUp", "updateBadge"].forEach(l);
        ["createAddToListAnimation", "createCollapseAnimation", "createDeleteFromListAnimation", "createExpandAnimation", "createRepositionAnimation"].forEach(a)
    }
    function i(n) {
        u(n);
        WinJS.UI.Animation.pointerDown(n)
    }
    function r(n) {
        WinJS.UI.Animation.pointerUp(n);
        f(n)
    }
    function u(n) {
        Jx.addClass(n, "pressed")
    }
    function f(n) {
        Jx.removeClass(n, "pressed")
    }
    function e(n, t, i) {
        n.addEventListener("pointerdown", o.bind(null, n, t, i), false)
    }
    function o(n, t, i, r, u) {
        if (r.pointerType === "touch" || r.button === 0 || u && r.button === 2) {
            t(n);
            var f = function() {
                i(n);
                document.removeEventListener("pointerup", f, true);
                document.removeEventListener("pointercancel", f, true)
            };
            document.addEventListener("pointerup", f, true);
            document.addEventListener("pointercancel", f, true)
        }
    }
    function y(n, t) {
        Jx.isArray(n) ? n.forEach(function(n) {
            y(n, t)
        }) : n.style.opacity = t ? 1 : 0
    }
    function s(n, t, i, r) {
        return function(u) {
            for (var f = n, e = 0; e < u; e++)
                t *= i,
                f += t;
            return r && (f = Math.min(f, r)),
            f
        }
    }
    function b(n, t) {
        return !t || !n.rtlflip ? t : k(t)
    }
    function k(n) {
        var t = n + "-rtl";
        return function(i, r) {
            return window.getComputedStyle(r).direction === "ltr" ? n : t
        }
    }
    var c = window.People, n = window.People.Animation = {}, t;
    v();
    n.cropStaggeredList = function(n, t) {
        return n.length > t && (n[t] = c.Sequence.flatten(n.splice(t, n.length))),
        n
    }
    ;
    n.fadeIn = function(n) {
        return WinJS.Promise.as(WinJS.UI.Animation.fadeIn(n))
    }
    ;
    n.fadeOut = function(n) {
        return WinJS.Promise.as(WinJS.UI.Animation.fadeOut(n))
    }
    ;
    n.removeOutgoingElements = function(t) {
        t.forEach(n.removeOutgoingElement)
    }
    ;
    n.removeOutgoingElement = function(n) {
        n.parentNode && (n.style.display = "none",
        n.parentNode.removeChild(n))
    }
    ;
    n.addTapAnimation = function(n) {
        e(n, i, r)
    }
    ;
    n.addPressStyling = function(n) {
        e(n, u, f)
    }
    ;
    n.startTapAnimation = function(n, t, u) {
        o(n, i, r, t, u)
    }
    ;
    var p = "transform"
      , w = [{
        top: "0px",
        left: "11px",
        rtlflip: true
    }]
      , h = WinJS.Class.define(function(n, t, i) {
        i = i || w;
        Array.isArray(n) && n.length > 0 ? (this.offsetArray = n,
        n.length === 1 && (this.keyframe = checkKeyframe(n[0], i[0], t))) : n && n.hasOwnProperty("top") && n.hasOwnProperty("left") ? (this.offsetArray = [n],
        this.keyframe = checkKeyframe(n, i[0], t)) : (this.offsetArray = i,
        this.keyframe = b(i[0], t))
    }, {
        getOffset: function(n) {
            return n >= this.offsetArray.length && (n = this.offsetArray.length - 1),
            this.offsetArray[n]
        }
    }, {
        supportedForProcessing: false
    });
    t = function() {
        if (WinJS.Utilities.hasWinRT) {
            var n = Windows.UI.ViewManagement.ApplicationView
              , i = Windows.UI.ViewManagement.ApplicationViewState.snapped;
            t = function() {
                return n.value === i
            }
        } else
            t = function() {
                return false
            }
            ;
        return t()
    }
    ;
    n.enterPage = function(n, i, r) {
        var u, f, e;
        return r = r || 0,
        u = t() ? new h(i,"WinJS-enterPage-snapped",[{
            top: "0px",
            left: "40px",
            rtlflip: true
        }]) : new h(i,"WinJS-enterPage",[{
            top: "0px",
            left: "100px",
            rtlflip: true
        }]),
        f = WinJS.UI.executeAnimation(n, {
            keyframe: u.keyframe,
            property: p,
            delay: s(r, 83, 1, 750),
            duration: 1e3,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            from: u.keyframe || translateCallback(u),
            to: "none"
        }),
        e = WinJS.UI.executeTransition(n, {
            property: "opacity",
            delay: s(r, 83, 1, 750),
            duration: 170,
            timing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            from: 0,
            to: 1
        }),
        WinJS.Promise.join([f, e])
    }
})
