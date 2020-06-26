//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Group = function() {
                function Group(){}
                return Group.prototype.initView = function(container, controlContext) {
                        ko.applyBindings(controlContext, container)
                    }, Group
            }();
        Controls.Group = Group
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));