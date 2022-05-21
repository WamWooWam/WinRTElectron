
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(People, "AppTile", function () {
    
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var AppTile = P.AppTile = {};
    ///<enable>JS2076.IdentifierIsMiscased</enable>

    AppTile._enabled = false;
    AppTile._pending = false;

    AppTile.subscribeNotifications = function (platform) {
        Jx.addListener(P.Social.unreadNotifications, "changed", function (ev) {
            var unreadNotifications = P.Social.unreadNotifications;
            if (unreadNotifications.isEnabled() && unreadNotifications.getCount() === 0) {
                AppTile.pushTiles(platform);
            }
        });
    };

    AppTile.pushTiles = function (platform) {
        if (this._enabled) {
            try {
                platform.runResourceVerbAsync(platform.accountManager.defaultAccount, "peopleTile", platform.createVerb("PushTiles", "5"));
                NoShip.People.etw("appTilePushTiles");
            } catch (err) {
                Jx.log.exception("pushTiles failed", err);
            }
        } else {
            this._pending = true;
        }
    };

    AppTile.enableTilePush = function (platform) {
        Jx.log.info("People.AppTile._enableTilePush");
        this._enabled = true;
        if (this._pending) {
            this._pending = false;
            this.pushTiles(platform);
        }
    };

});
