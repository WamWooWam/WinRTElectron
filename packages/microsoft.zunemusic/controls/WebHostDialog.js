/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {WebHostDialog: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.Dialog", "/Controls/WebHostDialog.html#webHostDialogTemplate", function webHostDialogConstructor(element, options) {
            this.userControl = "MS.Entertainment.UI.Controls.WebHost";
            this.lightDismissEnabled = true;
            var that = this;
            var finishedHandler = options.userControlOptions.finishedListener;
            options.userControlOptions.finishedListener = WinJS.Utilities.markSupportedForProcessing(function() {
                if (finishedHandler !== undefined)
                    finishedHandler();
                that.hide()
            });
            var cancelHandler = options.userControlOptions.cancelListener;
            options.userControlOptions.cancelListener = WinJS.Utilities.markSupportedForProcessing(function() {
                if (cancelHandler !== undefined)
                    cancelHandler();
                that.hide()
            });
            var errorHandler = options.userControlOptions.errorListener;
            options.userControlOptions.errorListener = WinJS.Utilities.markSupportedForProcessing(function(error) {
                if (errorHandler !== undefined)
                    errorHandler(error);
                that.hide()
            });
            this.keyPressEvent = function(event) {
                if (event.keyCode === WinJS.Utilities.Key.escape) {
                    event.stopPropagation();
                    options.userControlOptions.cancelListener()
                }
            };
            this.domElement.addEventListener("keypress", this.keyPressEvent, true);
            if (this.desiredLeft !== null && this.desiredLeft !== undefined && this.desiredLeft !== 0)
                this.left = this.right = this.desiredLeft;
            if (this.desiredTop !== null && this.desiredTop !== undefined && this.desiredTop !== 0)
                this.top = this.bottom = this.desiredTop;
            if (this.desiredHeight)
                this.top = this.bottom = "calc((100% - " + this.desiredHeight + ") / 2)"
        }, {
            autoSetFocus: true, keyPressEvent: null, _resizeImageUrl: "/images/WebDialogResize/RotateResizeIcon.", initialize: function initialize() {
                    MS.Entertainment.UI.Controls.Dialog.prototype.initialize.call(this, arguments);
                    this._tabConstrainerHelper.excludeEndPointElements = false;
                    this._initialized = true;
                    if (this.desiredZIndex !== null)
                        this.overlayContainer.style.zIndex = this.desiredZIndex;
                    if (this.resizeImage)
                        this.resizeImage.target = this._resizeImageUrl + MS.Entertainment.Utilities.getPackageImageFileExtension()
                }, unload: function unload() {
                    this.domElement.removeEventListener("keypress", this.keyPressEvent);
                    MS.Entertainment.UI.Controls.Dialog.prototype.unload.call(this)
                }, backClick: function backClick(){}, closeClick: function closeClick() {
                    this.hide()
                }
        }, {
            showBackButton: null, showCancelButton: null, desiredLeft: null, desiredTop: null, desiredZIndex: null
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ShowWebHostDialogAction: MS.Entertainment.deferredDerive(MS.Entertainment.UI.Actions.Action, null, {
            canExecute: function canExecute() {
                return this.parameter && this.parameter.dataContext && this.parameter.dataContext.options
            }, executed: function() {
                    return MS.Entertainment.UI.Shell.showWebHostDialog(this.parameter.dataContext.title || null, {
                            desiredLeft: "0%", desiredTop: "10%", showBackButton: false, showCancelButton: false, desiredZIndex: 1002
                        }, this.parameter.dataContext.options)
                }
        })});
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.showWebHostDialog, function() {
        return new MS.Entertainment.UI.Controls.ShowWebHostDialogAction
    })
})()
