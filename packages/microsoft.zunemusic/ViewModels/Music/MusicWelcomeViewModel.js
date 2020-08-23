/* Copyright (C) Microsoft Corporation. All rights reserved. */
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
this.scriptValidator();
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var MusicWelcomeViewModel = (function(_super) {
                    __extends(MusicWelcomeViewModel, _super);
                    function MusicWelcomeViewModel() {
                        _super.call(this);
                        this._signIn = null;
                        this._title = String.empty;
                        this._details = String.empty;
                        this._actionText = String.empty;
                        this.signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        WinJS.Binding.bind(this.signIn, {isSignedIn: this._onSignInChanged.bind(this)});
                        this._getData()
                    }
                    Object.defineProperty(MusicWelcomeViewModel.prototype, "signIn", {
                        get: function() {
                            return this._signIn
                        }, set: function(value) {
                                this.updateAndNotify("signIn", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicWelcomeViewModel.prototype, "title", {
                        get: function() {
                            return this._title
                        }, set: function(value) {
                                this.updateAndNotify("title", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicWelcomeViewModel.prototype, "details", {
                        get: function() {
                            return this._details
                        }, set: function(value) {
                                this.updateAndNotify("details", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicWelcomeViewModel.prototype, "actionText", {
                        get: function() {
                            return this._actionText
                        }, set: function(value) {
                                this.updateAndNotify("actionText", value)
                            }, enumerable: true, configurable: true
                    });
                    MusicWelcomeViewModel.prototype.signOrDiveIn = function() {
                        if (this.signIn && !this.signIn.isSignedIn) {
                            MS.Entertainment.Utilities.Telemetry.logSignInWelcomePanel();
                            this.signIn.signIn()
                        }
                        else {
                            MS.Entertainment.Utilities.Telemetry.logWelcomePanelStartButton();
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var selectArtistAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.selectArtist);
                            selectArtistAction.execute()
                        }
                    };
                    MusicWelcomeViewModel.prototype.acknowledgeDismissal = function() {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        configurationManager.music.welcomeAcknowledged = true;
                        MS.Entertainment.Utilities.Telemetry.logWelcomePanelDismissed()
                    };
                    MusicWelcomeViewModel.prototype._getData = function() {
                        var _this = this;
                        var query = new MS.Entertainment.Data.Query.Music.IntroPanel;
                        query.execute().done(function(query) {
                            if (query && query.result && query.result.item) {
                                _this.title = query.result.item.title || String.load(String.id.IDS_MUSIC_INTRO_HEADER);
                                _this.details = query.result.item.details || String.load(String.id.IDS_MUSIC_INTRO_DETAILS)
                            }
                        }, function(error) {
                            MS.Entertainment.ViewModels.fail("Intro panel query to xml reach feed failed: " + (error && error.message), null, MS.Entertainment.UI.Debug.errorLevel.low);
                            _this.title = String.load(String.id.IDS_MUSIC_INTRO_HEADER);
                            _this.details = String.load(String.id.IDS_MUSIC_INTRO_DETAILS)
                        })
                    };
                    MusicWelcomeViewModel.prototype._onSignInChanged = function() {
                        if (this.signIn && this.signIn.isSignedIn)
                            this.actionText = String.load(String.id.IDS_MUSIC_INTRO_BROWSE_BUTTON_AUTHED);
                        else
                            this.actionText = String.load(String.id.IDS_MUSIC_INTRO_BROWSE_BUTTON_NONAUTHED)
                    };
                    return MusicWelcomeViewModel
                })(MS.Entertainment.UI.Framework.ObservableBase);
            ViewModels.MusicWelcomeViewModel = MusicWelcomeViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
