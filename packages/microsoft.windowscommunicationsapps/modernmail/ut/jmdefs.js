
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    window.Jm = window.Jm || {};
    window.JmDefs = window.JmDefs || {};

    JmDefs.bindUtVerify = function (tc) {
        var utVerify = function (tc, exp, /*@optional*/msg) {
            tc.isTrue(Boolean(exp), msg);
        };

        Jm.$utVerify = utVerify.bind(undefined, tc);
    };

    JmDefs.unbindUtVerify = function () {
        Jm.$utVerify = null;
    };

})();