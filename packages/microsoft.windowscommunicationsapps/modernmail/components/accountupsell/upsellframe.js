
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Debug,Jx,Mail*/
Jx.delayDefine(Mail, "CompUpsellFrame", function () {
    "use strict";

    var UpsellFrame = Mail.CompUpsellFrame = function (platform, splashScreen) {
        Debug.assert(Jx.isObject(platform));
        Debug.assert(Jx.isObject(splashScreen));

        _markStart("ctor");
        this.initComponent();

        this._splashScreen = splashScreen;
        this._upsell = new Mail.Phase1Upsell(platform);
        this.appendChild(this._upsell);

        this._hooks = new Mail.Disposer(
            Mail.EventHook.createEventManagerHook(this._upsell, "upsellAvailable", this._showUpsell, this),
            new Jx.Timer(10000, this._showUpsell, this) // If we haven't heard from the upsell for 10 seconds, just show what we can
        );

        if (this._upsell.shouldShow()) {
            this._showUpsell();
        }

        _markStop("ctor");
    };
    Jx.augment(UpsellFrame, Jx.Component);
    var proto = UpsellFrame.prototype;

    proto.getUI = function (ui) {
        // shouldShow must be called before getUI to get other accounts
        ui.html =
            '<div id="mailFrame">' +
                '<div id="fakePeekBar"></div>' +
                '<div id="mailNavPane" class="mailFrameNavPaneBackground">' +
                    '<div id="mailAccountUpsellEASI" class="mailAccountUpsell">' +
                        Jx.getUI(this._upsell).html +
                    '</div>' +
                '</div>' +
                '<div class="mailFrameMessageListBackground"></div>' +
                '<div id="mailFrameReadingPaneSection" class="invisible"></div>' +
            '</div>';
    };

    proto.shutdownComponent = function () {
        Jx.dispose(this._hooks);
        Jx.Component.prototype.shutdownComponent.call(this);
    };

    proto._showUpsell = function () {
        this._splashScreen.dismiss();
    };

    function _markStart(str) {
        Jx.mark("Mail.CompUpsellFrame." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.CompUpsellFrame." + str + ",StopTA,Mail");
    }
});
