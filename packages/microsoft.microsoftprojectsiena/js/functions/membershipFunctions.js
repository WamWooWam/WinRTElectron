//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        in_SS: function(left, right, exact) {
            return left === null ? right === null : right === null ? !1 : typeof left != "string" || typeof right != "string" ? null : exact ? right.indexOf(left) >= 0 : right.toLowerCase().indexOf(left.toLowerCase()) >= 0
        }, in_ST: function(value, source, exact) {
                if (source === null)
                    return !1;
                var lhsIsControl = AppMagic.Utility.isOpenAjaxControl(value);
                if (!(source instanceof Array) || value !== null && !lhsIsControl && typeof value == "object")
                    return null;
                exact || typeof value != "string" || (value = value.toLowerCase());
                for (var i = 0, len = source.length; i < len; i++) {
                    var row = source[i];
                    if (typeof row == "object") {
                        var colNames = Object.keys(row);
                        if (colNames.length === 1) {
                            if (lhsIsControl) {
                                if (AppMagic.Utility.deepCompare(value, row[colNames[0]]))
                                    return !0;
                                continue
                            }
                            var rhs = row[colNames[0]];
                            if (exact || typeof rhs != "string" || (rhs = rhs.toLowerCase()), value === rhs)
                                return !0
                        }
                    }
                }
                return !1
            }, in_RT: function(value, source) {
                if (source === null)
                    return !1;
                if (!(source instanceof Array) || typeof value != "object")
                    return null;
                for (var i = 0, len = source.length; i < len; i++) {
                    var row = source[i];
                    if (typeof row == "object" && AppMagic.Utility.deepCompare(value, row))
                        return !0
                }
                return !1
            }, exactin_SS: function(left, right) {
                return AppMagic.Functions.in_SS(left, right, !0)
            }, exactin_ST: function(value, source) {
                return AppMagic.Functions.in_ST(value, source, !0)
            }
    })
})();