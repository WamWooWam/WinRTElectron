//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    WinJS.Namespace.define("AppMagic.Functions", {
        enable: function(dynamicDataSource) {
            if (dynamicDataSource !== null) {
                var dsName = AppMagic.AuthoringTool.Runtime.getDataSourceName(dynamicDataSource);
                if (dsName !== null)
                    return AppMagic.AuthoringTool.Runtime.enableDynamicDatasource(dsName)
            }
            return null
        }, disable: function(dynamicDataSource) {
                if (dynamicDataSource !== null) {
                    var dsName = AppMagic.AuthoringTool.Runtime.getDataSourceName(dynamicDataSource);
                    if (dsName !== null)
                        return AppMagic.AuthoringTool.Runtime.disableDynamicDatasource(dsName)
                }
                return null
            }
    })
})();