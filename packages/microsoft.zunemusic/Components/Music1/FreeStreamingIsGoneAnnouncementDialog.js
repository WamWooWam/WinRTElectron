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
        var Music;
        (function(Music) {
            var FreeStreamingIsGoneAnnouncementDialogContent = (function(_super) {
                    __extends(FreeStreamingIsGoneAnnouncementDialogContent, _super);
                    function FreeStreamingIsGoneAnnouncementDialogContent(element, options) {
                        this.templateStorage = "/Components/Music1/FreeStreamingIsGoneAnnouncementDialog.html";
                        this.templateName = "dialogContentTemplate";
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        this.showFreeGiveAways = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreeGiveAwayMarketplace);
                        _super.call(this, element, options);
                        this._actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions)
                    }
                    FreeStreamingIsGoneAnnouncementDialogContent.prototype.onGetMusicPassClicked = function(event) {
                        FreeStreamingIsGoneAnnouncementDialog.dismissDialog();
                        var signupAction = this._actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.subscriptionSignup);
                        signupAction.automationId = MS.Entertainment.UI.AutomationIds.showSubscriptionSignUpFromFreeStreamingIsGoneDialog;
                        signupAction.execute()
                    };
                    FreeStreamingIsGoneAnnouncementDialogContent.prototype.onShowFreeGiveAwaysClicked = function(event) {
                        FreeStreamingIsGoneAnnouncementDialog.dismissDialog();
                        this._actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.exploreHubNavigate).execute()
                    };
                    return FreeStreamingIsGoneAnnouncementDialogContent
                })(Entertainment.UI.Framework.UserControl);
            Music.FreeStreamingIsGoneAnnouncementDialogContent = FreeStreamingIsGoneAnnouncementDialogContent;
            var FreeStreamingIsGoneAnnouncementDialog = (function(_super) {
                    __extends(FreeStreamingIsGoneAnnouncementDialog, _super);
                    function FreeStreamingIsGoneAnnouncementDialog(element, options) {
                        this.templateStorage = "/Components/Music1/FreeStreamingIsGoneAnnouncementDialog.html";
                        this.templateName = "dialogTemplate";
                        _super.call(this, element, options)
                    }
                    FreeStreamingIsGoneAnnouncementDialog._getConfigurationManager = function() {
                        if (!this._configurationManager)
                            this._configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        return this._configurationManager
                    };
                    FreeStreamingIsGoneAnnouncementDialog.showDialogIfNecessary = function() {
                        var _this = this;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var signedInUser = Entertainment.ServiceLocator.getService(Entertainment.Services.signedInUser);
                        if (!this._getConfigurationManager().fue.freeStreamingIsGoneAnnouncementDismissed && !featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay) && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.formerMusicFreePlay) && signIn && signIn.isSignedIn && signedInUser && !signedInUser.isSubscription) {
                            var options = {
                                    userControl: "MS.Entertainment.Music.FreeStreamingIsGoneAnnouncementDialogContent", userControlOptions: {}
                                };
                            this._dialog = new FreeStreamingIsGoneAnnouncementDialog(document.createElement("div"), options);
                            this._dialog.buttons = [{
                                    title: String.load(String.id.IDS_MUSIC_FREE_STREAM_CHANGED_ACTION), isEnabled: true, isAvailable: true, execute: function() {
                                            _this.dismissDialog();
                                            _this.showCloudCleanupDialogIfNecessary()
                                        }
                                }];
                            this._dialog.show()
                        }
                    };
                    FreeStreamingIsGoneAnnouncementDialog.dismissDialog = function() {
                        this._getConfigurationManager().fue.freeStreamingIsGoneAnnouncementDismissed = true;
                        if (this._dialog)
                            this._dialog.hide()
                    };
                    FreeStreamingIsGoneAnnouncementDialog.showCloudCleanupDialogIfNecessary = function() {
                        var navigationService = Entertainment.ServiceLocator.getService(Entertainment.Services.winJSNavigation);
                        var collectionViewModel = navigationService.realizedDataContext;
                        if (collectionViewModel && collectionViewModel.view === Entertainment.ViewModels.MusicCollectionLX.ViewTypes.collection && collectionViewModel.showCloudCleanupDialogIfNecessary)
                            collectionViewModel.showCloudCleanupDialogIfNecessary()
                    };
                    return FreeStreamingIsGoneAnnouncementDialog
                })(Entertainment.UI.Controls.Dialog);
            Music.FreeStreamingIsGoneAnnouncementDialog = FreeStreamingIsGoneAnnouncementDialog
        })(Music = Entertainment.Music || (Entertainment.Music = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.Music.FreeStreamingIsGoneAnnouncementDialog)
