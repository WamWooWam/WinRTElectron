//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(global) {"use strict";
    WinJS.Namespace.define("AppMagic.Controls.modelValueConstrainers", {
        valueRangeConstrainer: function(value, minValue, maxValue) {
            return value === null ? null : minValue !== null && value < minValue ? minValue : maxValue !== null && value > maxValue ? maxValue : value
        }, screenWidthConstrainer: function(value) {
                return value === null ? 0 : AppMagic.Controls.modelValueConstrainers.valueRangeConstrainer(value, 0, AppMagic.DocumentLayout.instance.width)
            }, screenHeightConstrainer: function(value) {
                return value === null ? 0 : AppMagic.Controls.modelValueConstrainers.valueRangeConstrainer(value, 0, AppMagic.DocumentLayout.instance.height)
            }, templateWidthConstrainer: function(value) {
                return value === null ? AppMagic.Constants.MinimumTemplateWidth : AppMagic.Controls.modelValueConstrainers.valueRangeConstrainer(value, AppMagic.Constants.MinimumTemplateWidth, AppMagic.DocumentLayout.instance.width)
            }, templateHeightConstrainer: function(value) {
                return value === null ? AppMagic.Constants.MinimumTemplateHeight : AppMagic.Controls.modelValueConstrainers.valueRangeConstrainer(value, AppMagic.Constants.MinimumTemplateHeight, AppMagic.DocumentLayout.instance.height)
            }
    })
})(this);