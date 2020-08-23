/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var PurchaseConfirmationFlyout = (function(_super) {
                        __extends(PurchaseConfirmationFlyout, _super);
                        function PurchaseConfirmationFlyout() {
                            _super.call(this);
                            this._templateStorage = "/Controls/Music1/PurchaseConfirmationFlyout.html";
                            this._templateName = "templateid-purchaseConfirmationFlyout";
                            var uiSettings = new Windows.UI.ViewManagement.UISettings;
                            this._autoDismissTimeOut = uiSettings.messageDuration * 1000 * 2
                        }
                        return PurchaseConfirmationFlyout
                    })(Controls.NotificationFlyoutBase);
                Controls.PurchaseConfirmationFlyout = PurchaseConfirmationFlyout
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
