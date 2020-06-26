(function() {
    "use strict";
    var n = Jx.Bidi;
    Mail.setActiveElement = function(n) {
        return Mail.isTopmost() && Jx.safeSetActive(document.getElementById(n))
    }
    ;
    Mail.setActiveHTMLElement = function(n) {
        return Mail.isTopmost() && Jx.safeSetActive(n)
    }
    ;
    Mail.setActiveElementBySelector = function(n, t) {
        return Mail.isTopmost() && Jx.safeSetActive(t.querySelector(n))
    }
    ;
    Mail.setAttribute = function(n, t, i) {
        n.getAttribute(t) !== i && n.setAttribute(t, i)
    }
    ;
    Mail.isElementOrDescendant = function(n, t) {
        while (n && n !== t)
            n = n.parentElement;
        return n === t
    }
    ;
    Mail.isElementEditable = function(n) {
        return n.tagName === "TEXTAREA" || n.tagName === "INPUT" && ["button", "checkbox", "radio"].indexOf(n.type.toLowerCase()) === -1
    }
    ;
    Mail.isTopmost = function() {
        return !document.querySelector(".overlay-root") && !document.querySelector(".navPaneFlyout:not(.invisible)") && !People.Accounts.AccountSettingsControl.isShowing()
    }
    ;
    Mail.safeRemoveNode = function(n, t) {
        var i = null;
        try {
            i = n.removeNode(t)
        } catch (r) {
            Jx.log.exception("safeRemoveNode() failed for element with Id = " + n.id, r)
        }
        return i
    }
    ;
    Mail.applyDirection = function(t, i) {
        var r, u;
        Mail.Utilities.haveRtlLanguage() ? (r = Mail.Globals.appSettings.readingDirection,
        r === Mail.AppSettings.Direction.auto ? (u = n.getTextDirection(i),
        t.style.direction = u !== n.Values.none ? u : document.body.style.direction) : t.style.direction = r) : t.style.direction = document.body.style.direction
    }
}
)()
