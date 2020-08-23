/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {RentalOptionsDialog: MS.Entertainment.UI.Framework.defineUserControl("/Controls/Video/RentalOptionsDialog.html#rentalOptionsDialogTemplate", function rentalOptionsDialogConstructor(element, options){}, {
            _selectedRadioButton: null, initialize: function initialize() {
                    var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                    var download = settingsStorage.values["preferRentalDownload"] || false;
                    this._selectedRadioButton = download ? this._download : this._streaming;
                    this._streaming.checked = !download;
                    this._download.checked = download
                }, onSubmit: function _onSubmit() {
                    var offer = null;
                    var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                    if (this._selectedRadioButton === this._streaming) {
                        offer = this.streamingOffer;
                        settingsStorage.values["preferRentalDownload"] = false
                    }
                    else {
                        offer = this.downloadOffer;
                        settingsStorage.values["preferRentalDownload"] = true
                    }
                    return offer
                }, _onDeliveryFormatChange: function _onDeliveryFormatChange(args) {
                    this._selectedRadioButton = args.target
                }
        }, {}, {showRentalOptionsDialog: function showRentalOptionsDialog(mediaItem, streamingOffer, downloadOffer) {
                var completionSignal = new MS.Entertainment.UI.Framework.Signal;
                var options = {
                        userControlOptions: {
                            movieTitle: mediaItem.name, streamingOffer: streamingOffer, downloadOffer: downloadOffer
                        }, width: "80%", height: "320px", buttons: [WinJS.Binding.as({
                                    isEnabled: true, title: String.load(String.id.IDS_NEXT_BUTTON), execute: function execute_submit(dialog) {
                                            var offer = dialog.userControlInstance.onSubmit();
                                            completionSignal.complete({
                                                offer: offer, dialog: dialog
                                            })
                                        }
                                }), WinJS.Binding.as({
                                    isEnabled: true, title: String.load(String.id.IDS_CANCEL_BUTTON_TC), execute: function execute_cancel(dialog) {
                                            dialog.hide();
                                            completionSignal.promise.cancel()
                                        }
                                })], defaultButtonIndex: 0, cancelButtonIndex: 1
                    };
                MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_VIDEO_MOVIE_RENTAL_DIALOG_TITLE), "MS.Entertainment.UI.Controls.RentalOptionsDialog", options);
                return completionSignal.promise
            }})})
})()
