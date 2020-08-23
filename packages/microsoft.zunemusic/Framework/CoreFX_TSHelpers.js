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
            var Framework;
            (function(Framework) {
                var UserControl = (function(_super) {
                        __extends(UserControl, _super);
                        function UserControl(element, options) {
                            _super.call(this)
                        }
                        UserControl.prototype.initialize = function(){};
                        UserControl.prototype.delayInitialize = function(){};
                        UserControl.prototype.dispose = function(){};
                        UserControl.prototype.unload = function(){};
                        UserControl.prototype.freeze = function(){};
                        UserControl.prototype.thaw = function(){};
                        return UserControl
                    })(Framework.ObservableBase);
                Framework.UserControl = UserControl
            })(Framework = UI.Framework || (UI.Framework = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var Overlay = (function(_super) {
                        __extends(Overlay, _super);
                        function Overlay() {
                            _super.apply(this, arguments)
                        }
                        Overlay.prototype.show = function() {
                            return WinJS.Promise.as()
                        };
                        Overlay.prototype.lightDismiss = function() {
                            return true
                        };
                        Overlay.prototype.hide = function() {
                            return WinJS.Promise.as()
                        };
                        Overlay.prototype.setAccessibilityTitle = function(title){};
                        return Overlay
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.Overlay = Overlay;
                var Dialog = (function(_super) {
                        __extends(Dialog, _super);
                        function Dialog() {
                            _super.apply(this, arguments)
                        }
                        return Dialog
                    })(Overlay);
                Controls.Dialog = Dialog;
                var EditBox = (function(_super) {
                        __extends(EditBox, _super);
                        function EditBox() {
                            _super.apply(this, arguments)
                        }
                        EditBox.prototype.setValue = function(value){};
                        EditBox.prototype.setPlaceholderText = function(watermark){};
                        EditBox.prototype.reinitialize = function(){};
                        EditBox.prototype.clearInput = function(){};
                        return EditBox
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.EditBox = EditBox
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
