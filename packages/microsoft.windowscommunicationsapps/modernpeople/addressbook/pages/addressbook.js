
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../Controls/Stitcher/Stitcher.js"/>
/// <reference path="../Sections/FavoriteContactsSection.js"/>
/// <reference path="../Sections/AlphabetsSection.js"/>


Jx.delayDefine(People, "AddressBookPage", function () {

    var P = window.People;

    P.AddressBookPage = /* @constructor*/function (host, options) {
        ///<summary>Creates the address book page.</summary>
        ///<param name="host" type="P.CpMain">The object that hosts the address book.</param>
        ///<param name="options" type="Object" optional="true">Unused</param>
        P.ViewportPage.call(this, host, options);
    };
    Jx.inherit(P.AddressBookPage, P.ViewportPage);

    P.AddressBookPage.prototype.trackStartup = function () {
        ///<summary>Queues perfTrack startup reporting</summary>
        this._jobSet.addUIJob(Jx, Jx.ptStopLaunch, [Jx.TimePoint.responsive, Jx.activation.lastKind], P.Priority.perfLowFidelity);
    };

    P.AddressBookPage.prototype.goHome = function () {
        ///<summary>Go to the home position of the page</summary>
        // Dismiss the semantic zoom view if that is the current view
        if (!Jx.isNullOrUndefined(this._zoom)) {
            this._zoom.zoomedOut = false;
        }
        this.resetScrollPosition();
    };

    P.AddressBookPage.prototype._createViewportChild = function (data, fields) {
        return new P.Stitcher();
    };

    P.AddressBookPage.prototype._initViewportChild = function (stitcher, orientation) {
        ///<summary>Our viewport is a stitcher containing the sections</summary>
        ///<param name="stitcher" type="P.Stitcher" />
        ///<param name="orientation">Scroll orientation, e.g. vertical or horizontal</param>
        var platformCache = this._host.getPlatformCache(),
            platform = platformCache.getPlatform();
        var upsellSettings = new P.Accounts.UpsellSettings(Jx.appData.roamingSettings().container("People"));
        if (orientation === P.Orientation.horizontal) {
            if (upsellSettings.shouldShow()) {
                stitcher.addChild(new P.UpsellSection(platform, upsellSettings));
            }
        }
        stitcher.addChild(new P.SocialSection(platformCache, upsellSettings));
        stitcher.addChild(new P.FavoriteContactsSection(platformCache));
        stitcher.addChild(new P.AlphabetsSection(platformCache));
    };

});
