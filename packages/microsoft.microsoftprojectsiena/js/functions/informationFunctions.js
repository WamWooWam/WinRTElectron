//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        language: function() {
            return AppMagic.Globalization.currentLocaleName
        }, isNumeric: function(source) {
                switch (typeof source) {
                    case"number":
                        return !0;
                    case"string":
                        return !AppMagic.Functions.isBlank(AppMagic.Functions.value(source));
                    default:
                        return !1
                }
            }
    })
})();