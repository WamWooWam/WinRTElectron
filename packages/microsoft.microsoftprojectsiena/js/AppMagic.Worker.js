//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(workerContext) {
    var initialContextEventListener = function(evt) {
            eval(evt.data.detail.code)
        },
        removeInitialContextEventListener = function() {
            workerContext.removeEventListener("message", initialContextEventListener, !1)
        };
    workerContext.addEventListener("message", initialContextEventListener, !1)
})(self);