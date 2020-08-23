/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/servicelocator.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Shell", {PrimaryNavigationButton: MS.Entertainment.UI.Framework.defineUserControl(null, function PrimaryNavigationButton(){}, {
            controlName: "PrimaryNavigationButton", index: -1, initialize: function initialize() {
                    this.domElement.addEventListener("click", function() {
                        if (this.domElement.doClick)
                            this.domElement.doClick.call(this.domElement)
                    }.bind(this))
                }
        }, {})})
})();
(function runVoiceMixins() {
    MS.Entertainment.Utilities.runVoicePropertyMixins(MS.Entertainment.UI.Shell.PrimaryNavigationButton)
})()
