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
                var UpgradeTile = (function(_super) {
                        __extends(UpgradeTile, _super);
                        function UpgradeTile(element, options) {
                            this.templateStorage = "/Controls/UpgradeTile.html";
                            this.templateName = "upgradeTile";
                            _super.call(this, element, options);
                            if (!this.imageUrl)
                                if (MS.Entertainment.Utilities.isMusicApp)
                                    this.imageUrl = "/images/tiles/XBL_MUSIC_150x150_A.png";
                                else if (MS.Entertainment.Utilities.isVideoApp)
                                    this.imageUrl = "/images/tiles/XBL_VIDEO_150x150_A.png";
                            if (!this.bigMessage)
                                this.bigMessage = String.load(String.id.IDS_VERSION_CHECK_UPGRADE_CAPTION);
                            if (!this.littleMessage)
                                this.littleMessage = String.load(String.id.IDS_VERSION_CHECK_UPGRADE_LINK)
                        }
                        UpgradeTile.prototype.handleClick = function() {
                            var upgradeService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer);
                            upgradeService.launchStore()
                        };
                        UpgradeTile.getUpgradeFeedInformation = function() {
                            var query;
                            if (MS.Entertainment.Utilities.isMusicApp)
                                query = new MS.Entertainment.Data.Query.MusicUpdatePanel;
                            else if (MS.Entertainment.Utilities.isVideoApp)
                                query = new MS.Entertainment.Data.Query.VideoUpdatePanel;
                            else
                                return WinJS.Promise.as();
                            return query.execute().then(function(queryResult) {
                                    if (!queryResult)
                                        return null;
                                    var data = {
                                            bigMessage: queryResult.result.item.title, littleMessage: queryResult.result.item.subtitle
                                        };
                                    return data
                                }, function(e) {
                                    MS.Entertainment.UI.Controls.fail("Upgrade panel query failed: " + (e && e.originalError))
                                })
                        };
                        return UpgradeTile
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.UpgradeTile = UpgradeTile
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
