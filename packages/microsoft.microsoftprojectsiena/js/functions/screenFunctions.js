//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        updateContext: function(context, screenName) {
            if (context === null || typeof context != "object")
                return !1;
            for (var keys = Object.keys(context), i = 0, len = keys.length; i < len; i++) {
                var key = keys[i],
                    dependency = screenName + "." + key;
                AppMagic.AuthoringTool.Runtime.setAliasValue(dependency, context[key])
            }
            AppMagic.AuthoringTool.Runtime.onAliasesChanged(screenName, keys);
            return !0
        }, navigate: function(target, transition, context) {
                if (target === null || typeof target.OpenAjax == "undefined")
                    return !1;
                transition === null && (transition = "");
                var targetName = target.OpenAjax.getId();
                if (arguments.length === 3 && typeof context == "object") {
                    var targetScreenName = AppMagic.AuthoringTool.Runtime.getParentScreenName(targetName);
                    AppMagic.Functions.updateContext(context, targetScreenName)
                }
                return AppMagic.AuthoringTool.Runtime.navigateTo(targetName, transition), !0
            }, launch: function(hyperlink) {
                var uri;
                try {
                    uri = new Windows.Foundation.Uri(hyperlink)
                }
                catch(e) {
                    return WinJS.Promise.as(!1)
                }
                return Windows.System.Launcher.launchUriAsync(uri)
            }
    })
})();