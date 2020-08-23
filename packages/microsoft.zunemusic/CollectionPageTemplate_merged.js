/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/components/music/cloudmatchicondialog.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Music");
    WinJS.Namespace.define("MS.Entertainment.Music", {CloudMatchIcon: MS.Entertainment.UI.Framework.defineUserControl("Components/Music/CloudMatchIconDialog.html#cloudMatchIconTemplate", function cloudMatchIcon(element, options) {
            this._closeButton = WinJS.Binding.as({
                title: String.load(String.id.IDS_MUSIC_CLOUD_ICON_CLOSE_BUTTON), isEnabled: true, isAvailable: true, execute: function onClose() {
                        this._onClose()
                    }.bind(this)
            });
            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
            if (signedInUser.isSubscription) {
                this.streamingParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_1_XMP);
                this.streamingParagraphTwoText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_2_XMP);
                this.noneParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_NONE_PARA_1);
                this.cloudParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_CLOUD_PARA_1_XMP)
            }
            else {
                this.streamingParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_1_FREE);
                this.streamingParagraphTwoText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_2_FREE);
                this.streamingMoreInfoLink = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_LINK);
                this.noneParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_NONE_PARA_1);
                this.cloudParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_CLOUD_PARA_1_FREE)
            }
            var featureEnablement = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.featureEnablement);
            var devicesEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.devicesEnabled);
            var cloudEnabledRegion = (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.cloudCollection)).isAvailable;
            this._hideCloud = !cloudEnabledRegion || devicesEnabled;
            if (this._hideCloud)
                this.streamingParagraphTwoText = String.empty
        }, {
            _closeButton: null, _container: null, _hideCloud: false, streamingParagraphOneText: String.empty, streamingParagraphTwoText: String.empty, noneParagraphOneText: String.empty, cloudParagraphOneText: String.empty, setOverlay: function setOverlay(container) {
                    this._container = container;
                    container.buttons = [this._closeButton];
                    if (this._hideCloud)
                        WinJS.Utilities.addClass(this.iconColumn2, "removeFromDisplay")
                }, _onClose: function _onClose() {
                    this._container.hide()
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Music", {cloudMatchIconDialog: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.Dialog", "Components/Music/CloudMatchIconDialog.html#dialogTemplate", null, {}, null, {
            _dialog: null, show: function show() {
                    var options = {
                            width: "900px", height: "700px", cancelButtonIndex: 0, defaultButtonIndex: 0, title: String.load(String.id.IDS_MUSIC_CLOUD_ICON_HEADER), userControl: "MS.Entertainment.Music.CloudMatchIcon", userControlOptions: {}, persistOnNavigate: false
                        };
                    if (!this._dialog) {
                        this._dialog = new MS.Entertainment.Music.cloudMatchIconDialog(document.createElement("div"), options);
                        return this._dialog.show().then(function dialogClosed() {
                                this._dialog = null
                            }.bind(this))
                    }
                    else
                        return WinJS.Promise.wrap()
                }
        })})
})()
})();
