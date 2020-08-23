/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {CommandViewModel: MS.Entertainment.UI.Framework.define(function(caption, isEnabled, clicked) {
            this.caption = caption;
            this.isEnabled = isEnabled;
            this.clicked = clicked
        }, {
            caption: null, isEnabled: false, clicked: null
        }, {})})
})()
