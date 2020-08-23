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
                (function(EducationFlyouts) {
                    EducationFlyouts[EducationFlyouts["offlineFilterChanged"] = 0] = "offlineFilterChanged";
                    EducationFlyouts[EducationFlyouts["cloudContentV2FilterChanged"] = 1] = "cloudContentV2FilterChanged"
                })(Controls.EducationFlyouts || (Controls.EducationFlyouts = {}));
                var EducationFlyouts = Controls.EducationFlyouts;
                var EducationFlyout = (function(_super) {
                        __extends(EducationFlyout, _super);
                        function EducationFlyout(flyout) {
                            _super.call(this);
                            this._educationFlyout = 1;
                            this._templateStorage = "/Controls/Music1/EducationFlyoutTemplates.html";
                            this._templateName = "templateid-educationFlyout";
                            this._educationFlyout = flyout;
                            this.flyoutAlignment = 2;
                            this._configureFlyout()
                        }
                        Object.defineProperty(EducationFlyout.prototype, "configManager", {
                            get: function() {
                                if (!this._configManager)
                                    this._configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                return this._configManager
                            }, enumerable: true, configurable: true
                        });
                        EducationFlyout.prototype._configureFlyout = function() {
                            switch (this._educationFlyout) {
                                case 1:
                                    {
                                        this.text = String.load(String.id.IDS_COLLECTION_FILTER_FLYOUT_CLOUDV2);
                                        this.referenceDomElement = document.querySelector(".navHeader-filters");
                                        break
                                    }
                                case 0:
                                    {
                                        this.text = String.load(String.id.IDS_COLLECTION_FILTER_FLYOUT_OFFLINE);
                                        this.referenceDomElement = document.querySelector(".navHeader-filters");
                                        break
                                    }
                                default:
                                    {
                                        Controls.fail("EducationFlyout::_configureFlyout() : Unsupported flyout.");
                                        break
                                    }
                            }
                            Controls.assert(this.text, "EducationFlyout::_configureFlyout() : Flyout text was not set as expected.");
                            Controls.assert(this.referenceDomElement, "EducationFlyout::_configureFlyout() : Flyout anchor point element was not found.")
                        };
                        EducationFlyout.prototype.showFlyout = function() {
                            switch (this._educationFlyout) {
                                case 1:
                                    {
                                        if (!this.configManager.fue.musicCloudContentV2FlyoutFilterShown) {
                                            _super.prototype.showFlyout.call(this);
                                            this.configManager.fue.musicCloudContentV2FlyoutFilterShown = true
                                        }
                                        break
                                    }
                                case 0:
                                    {
                                        if (!this.configManager.fue.musicAvailableOfflineFlyoutFilterShown) {
                                            _super.prototype.showFlyout.call(this);
                                            this.configManager.fue.musicAvailableOfflineFlyoutFilterShown = true
                                        }
                                        break
                                    }
                                default:
                                    {
                                        Controls.fail("EducationFlyout::showFlyout() : Unsupported flyout.");
                                        break
                                    }
                            }
                        };
                        return EducationFlyout
                    })(Controls.NotificationFlyoutBase);
                Controls.EducationFlyout = EducationFlyout
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
