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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var CopyAction = (function(_super) {
                    __extends(CopyAction, _super);
                    function CopyAction() {
                        _super.apply(this, arguments);
                        this.automationId = MS.Entertainment.UI.AutomationIds.copy
                    }
                    CopyAction.prototype.canExecute = function(param) {
                        return true
                    };
                    CopyAction.prototype.executed = function(param) {
                        var text = MS.Entertainment.UI.Actions.extractMediaItemFromParam(param);
                        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage;
                        dataPackage.requestedOperation = Windows.ApplicationModel.DataTransfer.DataPackageOperation.copy;
                        dataPackage.setText(text);
                        Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage)
                    };
                    return CopyAction
                })(MS.Entertainment.UI.Actions.Action);
            ViewModels.CopyAction = CopyAction;
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.copy, function() {
                return new CopyAction
            })
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
