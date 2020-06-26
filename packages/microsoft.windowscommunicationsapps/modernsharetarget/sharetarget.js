(function() {
    function f() {
        var t = document.getElementById("splashImage"), i = document.getElementById("splashContent"), n;
        t && i && (n = u.imageLocation,
        t.style.left = n.x + "px",
        t.style.top = n.y + "px",
        t.style.height = n.height + "px",
        t.style.width = n.width + "px",
        i.style.top = n.y + n.height + "px")
    }
    function y() {
        if (a = true,
        !v)
            if (s) {
                var n = Jx.root;
                n.animateUI()
            } else
                Jx.log.verbose("Splash screen dismiss before share target start"),
                window.addEventListener("resize", f, false)
    }
    function e() {
        return t && l && Boolean(Jx.root)
    }
    function p() {
        window.addEventListener("beforeunload", function() {
            n && n.removeEventListener("changed", c);
            i = null;
            n = null;
            u = null;
            window.removeEventListener("resize", f, false);
            Share.TargetRoot.shutdownApp();
            v = true
        }, false);
        Jx.log.verbose("ShareTarget is creating the platform");
        try {
            Jx.log.verbose("Trying To create the platform");
            i = new r.Client("shareAnything", r.ClientCreateOptions.failIfNoUser)
        } catch (e) {
            Jx.fault("ShareToMail.ShareTarget.js", "CreatePlatform", e)
        }
        if (Jx.isNullOrUndefined(i))
            t = true;
        else {
            Jx.log.verbose("Trying to get accounts");
            try {
                if (n = i.accountManager.defaultAccount,
                t = false,
                Boolean(n))
                    if (Number(n.mailScenarioState) !== r.ScenarioState.unknown)
                        t = true;
                    else {
                        var o = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
                        t = !Boolean(o) || o.getNetworkConnectivityLevel() !== Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess
                    }
            } catch (e) {
                Jx.fault("ShareToMail.ShareTarget.js", "GetDefaultAccount", e);
                n = null;
                t = true
            }
            t ? n = null : (Jx.log.info("ShareTarget: mailScenarioState is unknown; subscribing to account change event"),
            n.addEventListener("changed", c),
            Jx.forceSyncAccount(n, r.ApplicationScenario.mail))
        }
    }
    function c() {
        t = Number(n.mailScenarioState) !== r.ScenarioState.unknown;
        t && (n.removeEventListener("changed", c),
        n = null);
        e() && o()
    }
    function o() {
        if (!s) {
            u = null;
            window.removeEventListener("resize", f, false);
            var n = Jx.root;
            i && (n.setPlatform(i),
            i = null);
            s = true;
            Jx.app.initUI(document.body);
            a && n.animateUI()
        }
    }
    var l = false, s = false, n = null, i = null, t = false, u = null, a = false, v = false, r, h;
    Share.mark("PageLoad", Share.LogEvent.start);
    Jx.log.level = Jx.LOG_VERBOSE;
    Jx.app = new Jx.Application;
    r = Microsoft.WindowsLive.Platform;
    Jx.log.info("ShareTarget attaching to activation events");
    h = Jx.activation;
    h.addListener(h.share, function(n) {
        Jx.log.info("Share target receieved activation context");
        n.splashScreen.addEventListener("dismissed", y);
        u = n.splashScreen;
        f();
        Jx.root = new Share.TargetRoot(n.shareOperation);
        e() && o()
    });
    window.addEventListener("DOMContentLoaded", function() {
        l = true;
        Jx.log.verbose("DOMContentLoaded event");
        Jx.res.processAll(document.getElementById("splashContent"));
        p();
        e() ? o() : t || WinJS.Promise.timeout(2e4).then(function() {
            t || (Jx.fault("ShareToMail.ShareTarget.js", "AccountTimeout"),
            t = true,
            e() && setImmediate(o))
        })
    }, false)
}
)()
