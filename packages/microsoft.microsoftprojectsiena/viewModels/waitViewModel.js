//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var WaitViewModel = WinJS.Class.define(function WaitViewModel_ctor() {
            this._active = ko.observable(!1);
            this._text = ko.observable("");
            this._descriptionText = ko.observable("");
            this._showCancelButton = ko.observable(!1)
        }, {
            _pendingStartComplete: null, _pendingStartPromise: null, _active: null, _text: null, _descriptionText: null, _showCancelButton: null, _cancelHandler: null, _skipAnimationDelay: null, notifyViewRendered: function() {
                    this._pendingStartComplete && (this._pendingStartComplete(), this._pendingStartComplete = null)
                }, startAsync: function(text, options) {
                    options = options || {};
                    var currentActive = this._active();
                    return this._active(!0), this._text(text), this._descriptionText(options.descriptionText), this._showCancelButton(options.showCancelButton || !1), this._cancelHandler = options.cancelHandler || null, this._skipAnimationDelay = options.skipAnimationDelay || !1, this.dispatchEvent(WaitViewModel.events.start), currentActive || (this._pendingStartPromise = new WinJS.Promise(function(complete) {
                                this._pendingStartComplete = complete
                            }.bind(this))), this._pendingStartPromise
                }, stop: function() {
                    this._active(!1);
                    this.dispatchEvent(WaitViewModel.events.stop)
                }, active: {get: function() {
                        return this._active()
                    }}, text: {get: function() {
                        return this._text()
                    }}, descriptionText: {get: function() {
                        return this._descriptionText()
                    }}, showCancelButton: {get: function() {
                        return this._showCancelButton()
                    }}, cancelHandler: {get: function() {
                        return this._cancelHandler
                    }}, handleCancelClicked: function() {
                    this._active() && this._cancelHandler()
                }, skipAnimationDelay: {get: function() {
                        return this._skipAnimationDelay
                    }}
        }, {events: {
                start: "start", stop: "stop"
            }});
    WinJS.Class.mix(WaitViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {WaitViewModel: WaitViewModel})
})();