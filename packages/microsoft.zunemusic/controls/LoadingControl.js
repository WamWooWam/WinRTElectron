/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LoadingControl: MS.Entertainment.UI.Framework.defineUserControl(null, function loadingConstructor(element) {
            element.value = 1;
            WinJS.Utilities.addClass(element, "loadingProgress");
            WinJS.Utilities.addClass(element, "loadingControlHidden");
            this.bind("isBusy", function isBusyChanged(newValue) {
                if (newValue && !this.currentlyDisplaying) {
                    var callback = function isBusyCallback() {
                            if (this.isBusy) {
                                if (!this.value)
                                    this.domElement.removeAttribute("value");
                                WinJS.Utilities.removeClass(this.domElement, "loadingControlHidden");
                                this.currentlyDisplaying = true
                            }
                        }.bind(this);
                    if (this.displayDelay)
                        WinJS.Promise.timeout(this.displayDelay).then(callback);
                    else
                        callback()
                }
                else if (!newValue && this.currentlyDisplaying) {
                    WinJS.Utilities.addClass(this.domElement, "loadingControlHidden");
                    if (!this.domElement.getAttribute("value"))
                        this.domElement.value = 1;
                    this.currentlyDisplaying = false
                }
            }.bind(this));
            this.bind("progress", function progressChanged(newValue) {
                if (newValue)
                    this.domElement.value = newValue
            }.bind(this));
            if (this.height === this.width)
                WinJS.Utilities.addClass(this.domElement, "ringLoadingControl")
        }, {
            controlName: "LoadingControl", displayDelay: 500, currentlyDisplaying: false, height: "5px", width: null, initialize: function initialize() {
                    if (this.height)
                        this.domElement.style.height = this.height;
                    if (this.width)
                        this.domElement.style.width = this.width;
                    if (this.value) {
                        this.progress = this.value;
                        if (this.max)
                            this.domElement.max = this.max
                    }
                }
        }, {
            isBusy: false, progress: 0
        })})
})()
