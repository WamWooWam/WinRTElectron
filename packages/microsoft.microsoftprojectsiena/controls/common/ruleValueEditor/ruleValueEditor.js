//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var RuleValueEditorView = WinJS.Class.derive(AppMagic.Utility.Disposable, function RuleValueEditorView_ctor(element) {
            var containerDiv = element.children[0];
            ko.applyBindings(element.rule, containerDiv);
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker);
            this._eventTracker.addCapture(containerDiv, "click", this._hanldeClick, this)
        }, {_hanldeClick: function(evt) {
                return evt.target.focus(), !0
            }}, {});
    AppMagic.UI.Pages.define("/controls/common/ruleValueEditor/ruleValueEditor.html", RuleValueEditorView)
})();