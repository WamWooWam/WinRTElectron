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
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                var PleaseResizeDialog = (function(_super) {
                        __extends(PleaseResizeDialog, _super);
                        function PleaseResizeDialog(element, options) {
                            var _this = this;
                            this.templateName = "pleaseResizeDialog";
                            this.templateStorage = "/Controls/PleaseResizeDialog.html";
                            _super.call(this, element, options);
                            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            this._uiStateHandlers = MS.Entertainment.UI.Framework.addEventHandlers(this._uiStateService, {isSnappedChanged: function(e) {
                                    var snapped = WinJS.Utilities.getMember("detail.newValue", e);
                                    if (snapped)
                                        return;
                                    var dismissEvent = document.createEvent("CustomEvent");
                                    dismissEvent.initEvent("dismissoverlay", true, true);
                                    _this.domElement.dispatchEvent(dismissEvent)
                                }})
                        }
                        PleaseResizeDialog.prototype.initialize = function() {
                            if (this.resizeImage)
                                this.resizeImage.target = PleaseResizeDialog.RESIZE_IMAGE_URL + MS.Entertainment.Utilities.getPackageImageFileExtension()
                        };
                        PleaseResizeDialog.prototype.unload = function() {
                            if (this._uiStateHandlers) {
                                this._uiStateHandlers.cancel();
                                this._uiStateHandlers = null
                            }
                            _super.prototype.unload.call(this)
                        };
                        PleaseResizeDialog.waitForWindowResize = function(disallowUserDismiss) {
                            var existingDialogSignal = MS.Entertainment.UI.Controls.PleaseResizeDialog._currentCompletionSignal;
                            if (existingDialogSignal) {
                                existingDialogSignal.error(new Error("Canceled"));
                                existingDialogSignal = new MS.Entertainment.UI.Framework.Signal;
                                MS.Entertainment.UI.Controls.PleaseResizeDialog._currentCompletionSignal = existingDialogSignal;
                                return existingDialogSignal.promise
                            }
                            var options = {
                                    customStyle: "template-resizeDialog", disallowUserDismiss: disallowUserDismiss
                                };
                            MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_WEBHOST_RESIZE_WINDOW_TITLE), MS.Entertainment.UI.Controls.PleaseResizeDialog, options).done(function(dialog) {
                                var dialogSignal = MS.Entertainment.UI.Controls.PleaseResizeDialog._currentCompletionSignal;
                                if (dialog && dialog.wasCancelled)
                                    dialogSignal.promise.cancel();
                                else
                                    dialogSignal.complete();
                                MS.Entertainment.UI.Controls.PleaseResizeDialog._currentCompletionSignal = null
                            });
                            var dialogDismissed = new MS.Entertainment.UI.Framework.Signal;
                            MS.Entertainment.UI.Controls.PleaseResizeDialog._currentCompletionSignal = dialogDismissed;
                            return dialogDismissed.promise
                        };
                        PleaseResizeDialog.RESIZE_IMAGE_URL = "/images/WebDialogResize/Expand_Screen_Icon.";
                        return PleaseResizeDialog
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.PleaseResizeDialog = PleaseResizeDialog
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.PleaseResizeDialog)
