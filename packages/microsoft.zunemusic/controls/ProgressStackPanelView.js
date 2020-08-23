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
                var ProgressStackPanelControl = (function(_super) {
                        __extends(ProgressStackPanelControl, _super);
                        function ProgressStackPanelControl(element, options) {
                            this.templateStorage = "/Controls/ProgressStackPanelControl.html";
                            this.templateName = "templateid-progressPanel";
                            _super.call(this, element, options)
                        }
                        Object.defineProperty(ProgressStackPanelControl.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    this.updateAndNotify("dataContext", value)
                                }, enumerable: true, configurable: true
                        });
                        ProgressStackPanelControl.prototype.initialize = function() {
                            this.dataContext = new Entertainment.ViewModels.ProgressStackPanelViewModel
                        };
                        ProgressStackPanelControl.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            if (this.dataContext) {
                                this.dataContext.dispose();
                                this.dataContext = null
                            }
                        };
                        return ProgressStackPanelControl
                    })(UI.Framework.UserControl);
                Controls.ProgressStackPanelControl = ProgressStackPanelControl;
                WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.ProgressStackPanelControl)
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
