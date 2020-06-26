//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var AuthoringRequirementsManager = WinJS.Class.derive(AppMagic.Controls.RequirementsManager, function AuthoringRequirementsManager_ctor() {
            AppMagic.Controls.RequirementsManager.call(this)
        }, {_shouldInclude: function(req) {
                return req.shouldInclude
            }});
    WinJS.Namespace.define("AppMagic.Controls", {AuthoringRequirementsManager: AuthoringRequirementsManager})
})();