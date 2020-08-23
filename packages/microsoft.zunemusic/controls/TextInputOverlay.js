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
                var TextInputOverlay = (function(_super) {
                        __extends(TextInputOverlay, _super);
                        function TextInputOverlay(element, options) {
                            _super.call(this, element, options);
                            this._isSubmitting = false;
                            this._wasSubmitted = false;
                            this._canSubmit = false;
                            this._showingError = false
                        }
                        Object.defineProperty(TextInputOverlay.prototype, "templateStorage", {
                            get: function() {
                                return "/Controls/TextInputOverlay.html"
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(TextInputOverlay.prototype, "templateName", {
                            get: function() {
                                return "control-textInputOverlay"
                            }, enumerable: true, configurable: true
                        });
                        TextInputOverlay.prototype.initialize = function() {
                            var _this = this;
                            this._bindings = WinJS.Binding.bind(this.editBox, {scratchValue: this._handleValueChange.bind(this)});
                            this.editBox.setValue(this.initialText || String.empty);
                            this.watermark.value = this.watermarkText || String.empty;
                            if (this.validationRegex) {
                                this.editBox.validationExpression = this.validationRegex;
                                this.editBox.validationFailedText = this.errorMessage
                            }
                            if (this.editBox && this.editBox.domElement)
                                this._textBoxFocusBinding = MS.Entertainment.UI.Framework.addEventHandlers(this.editBox.domElement, {focusin: function() {
                                        Windows.UI.ViewManagement.InputPane.getForCurrentView().visible = true
                                    }});
                            this._inputCurrentView = Windows.UI.ViewManagement.InputPane.getForCurrentView();
                            this._inputEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._inputCurrentView, {hiding: function() {
                                    _this._onSoftKeyboardClosed()
                                }})
                        };
                        TextInputOverlay.prototype.unload = function() {
                            if (this._bindings) {
                                this._bindings.cancel();
                                this._bindings = null
                            }
                            if (this._textBoxFocusBinding) {
                                this._textBoxFocusBinding.cancel();
                                this._textBoxFocusBinding = null
                            }
                            if (this._inputEventHandlers) {
                                this._inputEventHandlers.cancel();
                                this._inputEventHandlers = null
                            }
                            _super.prototype.unload.call(this)
                        };
                        Object.defineProperty(TextInputOverlay.prototype, "currentValue", {
                            get: function() {
                                if (!this.editBox)
                                    return null;
                                return this.editBox.scratchValue
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(TextInputOverlay.prototype, "canSubmit", {
                            get: function() {
                                return this._canSubmit
                            }, set: function(val) {
                                    this.updateAndNotify("canSubmit", val)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(TextInputOverlay.prototype, "submitText", {
                            get: function() {
                                return this._submitText
                            }, set: function(val) {
                                    this.updateAndNotify("submitText", val)
                                }, enumerable: true, configurable: true
                        });
                        TextInputOverlay.prototype.setOverlay = function(overlay) {
                            this._parentOverlay = overlay
                        };
                        TextInputOverlay.prototype.handleSubmit = function(e) {
                            this._successfulDismiss()
                        };
                        TextInputOverlay.prototype.handleKeyboardSubmit = function(e) {
                            switch (e.keyCode) {
                                case WinJS.Utilities.Key.enter:
                                    break;
                                default:
                                    return
                            }
                            this._successfulDismiss()
                        };
                        TextInputOverlay.prototype.gestureCloseClicked = function() {
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("dismissoverlay", true, true);
                            this.domElement.dispatchEvent(domEvent)
                        };
                        TextInputOverlay.prototype._handleValueChange = function() {
                            var canSubmit = this.editBox.isValid;
                            if (canSubmit)
                                canSubmit = !!this.currentValue.trim();
                            this.canSubmit = canSubmit;
                            if (this.currentValue) {
                                WinJS.Utilities.addClass(this.editBox.domElement, "hasContent");
                                WinJS.Utilities.addClass(this.watermark, "removeFromDisplay")
                            }
                            else {
                                WinJS.Utilities.removeClass(this.editBox.domElement, "hasContent");
                                WinJS.Utilities.removeClass(this.watermark, "removeFromDisplay")
                            }
                            this._showingError = false;
                            if (this.errorSubmitText && this.submitText !== this.defaultSubmitText)
                                this.submitText = this.defaultSubmitText;
                            if (this.valueChanged)
                                this.valueChanged(this.currentValue)
                        };
                        TextInputOverlay.prototype._onSoftKeyboardClosed = function() {
                            if (this._parentOverlay)
                                this._parentOverlay.lightDismiss()
                        };
                        TextInputOverlay.prototype._successfulDismiss = function() {
                            if (!this.canSubmit && !this._isSubmitting)
                                return;
                            var validate;
                            if (this._showingError && this.validateError) {
                                validate = this.validateError;
                                this._isSubmitting = true
                            }
                            else if (!this.validateInput)
                                validate = function() {
                                    return WinJS.Promise.as()
                                };
                            else {
                                validate = this.validateInput;
                                this._isSubmitting = true
                            }
                            validate(this.currentValue).done(function valid() {
                                this._wasSubmitted = true;
                                if (this._parentOverlay)
                                    this._parentOverlay.lightDismiss()
                            }.bind(this), function invalid(error) {
                                this._showingError = true;
                                this.editBox.setError(error.message);
                                if (this.errorSubmitText)
                                    this.submitText = this.errorSubmitText;
                                this._isSubmitting = false
                            }.bind(this))
                        };
                        TextInputOverlay.getTextInput = function(options) {
                            if (!MS.Entertainment.UI.Controls.TextInputOverlay.textInputOpen) {
                                MS.Entertainment.UI.Controls.TextInputOverlay.textInputOpen = true;
                                var result = WinJS.Promise.as();
                                var userControlOptions = {
                                        userControl: TextInputOverlay, enableKeyboardLightDismiss: true, customStyle: "control-textInputOverlay", useGoBackForVoice: true, userControlOptions: {
                                                submitText: options.submitText, defaultSubmitText: options.submitText, errorSubmitText: options.errorSubmitText, watermarkText: options.watermark, initialText: options.initialText, validationRegex: options.validationRegex, errorMessage: options.errorMessage, validateInput: options.validateInput, validateError: options.validateError, valueChanged: options.valueChanged
                                            }
                                    };
                                var textInput = new MS.Entertainment.UI.Controls.Overlay(document.createElement("div"), userControlOptions);
                                return textInput.show().then(function() {
                                        MS.Entertainment.UI.Controls.TextInputOverlay.textInputOpen = false;
                                        var textInputControl = textInput.userControlInstance;
                                        if (!textInputControl._wasSubmitted)
                                            return WinJS.Promise.wrapError();
                                        return textInputControl.currentValue
                                    })
                            }
                            else
                                return WinJS.Promise.as()
                        };
                        TextInputOverlay.textInputOpen = false;
                        return TextInputOverlay
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.TextInputOverlay = TextInputOverlay
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
