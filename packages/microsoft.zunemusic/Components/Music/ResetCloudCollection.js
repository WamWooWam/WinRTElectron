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
            var ResetCloudCollectionDialogContent = (function(_super) {
                    __extends(ResetCloudCollectionDialogContent, _super);
                    function ResetCloudCollectionDialogContent(element, options) {
                        this.templateStorage = "/Components/Music/ResetCloudCollection.html";
                        this.templateName = "dialogContentTemplate";
                        _super.call(this, element, options)
                    }
                    Object.defineProperty(ResetCloudCollectionDialogContent.prototype, "isChecked", {
                        get: function() {
                            return this._isChecked
                        }, set: function(value) {
                                this.updateAndNotify("isChecked", value)
                            }, enumerable: true, configurable: true
                    });
                    ResetCloudCollectionDialogContent.prototype.initialize = function() {
                        var _this = this;
                        var catalogCountQuery = new Entertainment.Data.Query.libraryTracks;
                        catalogCountQuery.mediaAvailability = Microsoft.Entertainment.Platform.MediaAvailability.musicPass;
                        catalogCountQuery.execute().done(function(result) {
                            catalogCountQuery.dispose();
                            var catalogCount = result && result.result && result.result.totalCount;
                            _this._deleteMusicPassLabel.innerText = Entertainment.Utilities.Pluralization.getPluralizedString(String.id.IDS_MUSIC_RESET_COLLECTION_DIALOG_OPTION_PASS_PLURAL, catalogCount).format(catalogCount)
                        }, function(error) {
                            catalogCountQuery.dispose();
                            Music.fail("ResetCloudCollectionDialogContent::initialize() Library tracks query failed for music pass conent." + (error && error.message))
                        });
                        var purchasedCountQuery = new Entertainment.Data.Query.libraryTracks;
                        purchasedCountQuery.mediaAvailability = Microsoft.Entertainment.Platform.MediaAvailability.purchased;
                        purchasedCountQuery.execute().done(function(result) {
                            purchasedCountQuery.dispose();
                            var purchasedCount = result && result.result && result.result.totalCount;
                            _this._deletePurchasedLabel.innerText = Entertainment.Utilities.Pluralization.getPluralizedString(String.id.IDS_MUSIC_RESET_COLLECTION_DIALOG_OPTION_PURCHASE_PLURAL, purchasedCount).format(purchasedCount)
                        }, function(error) {
                            purchasedCountQuery.dispose();
                            Music.fail("ResetCloudCollectionDialogContent::initialize() Library tracks query failed for purchased conent." + (error && error.message))
                        });
                        var playlistCountQuery = new Entertainment.Data.Query.libraryPlaylists;
                        playlistCountQuery.execute().done(function(result) {
                            playlistCountQuery.dispose();
                            var playlistCount = result && result.result && result.result.totalCount;
                            _this._deletePlaylistsLabel.innerText = Entertainment.Utilities.Pluralization.getPluralizedString(String.id.IDS_MUSIC_RESET_COLLECTION_DIALOG_OPTION_PLAYLIST_PLURAL, playlistCount).format(playlistCount)
                        }, function(error) {
                            playlistCountQuery.dispose();
                            Music.fail("ResetCloudCollectionDialogContent::initialize() Library playlists query failed!" + (error && error.message))
                        })
                    };
                    ResetCloudCollectionDialogContent.prototype._onCheckBoxClicked = function(event) {
                        this.isChecked = this._deleteMusicPassOption.checked || this._deletePurchasedOption.checked || this._deletePlaylistsOption.checked
                    };
                    return ResetCloudCollectionDialogContent
                })(MS.Entertainment.UI.Framework.UserControl);
            Music.ResetCloudCollectionDialogContent = ResetCloudCollectionDialogContent;
            var ResetCloudCollectionDialog = (function(_super) {
                    __extends(ResetCloudCollectionDialog, _super);
                    function ResetCloudCollectionDialog(element, options) {
                        _super.call(this, element, options);
                        this._checkBoxBindings = null;
                        this.templateStorage = "/Components/Music/ResetCloudCollection.html";
                        this.templateName = "dialogTemplate"
                    }
                    ResetCloudCollectionDialog.prototype.initialize = function() {
                        var _this = this;
                        _super.prototype.initialize.call(this);
                        this.buttons = [new ResetButton, this._createCancelButton()];
                        this._checkBoxBindings = Entertainment.Utilities.addEventHandlers(this.overlayContent.winControl, {isCheckedChanged: function() {
                                return _this._onCheckBoxChanged()
                            }})
                    };
                    ResetCloudCollectionDialog.prototype.unload = function() {
                        _super.prototype.unload.call(this);
                        if (this._checkBoxBindings) {
                            this._checkBoxBindings.cancel();
                            this._checkBoxBindings = null
                        }
                    };
                    ResetCloudCollectionDialog.showDialog = function() {
                        var options = {
                                title: String.load(String.id.IDS_MUSIC_RESET_COLLECTION_DIALOG_TITLE), userControl: "MS.Entertainment.Music.ResetCloudCollectionDialogContent", userControlOptions: {}
                            };
                        var dialog = new ResetCloudCollectionDialog(document.createElement("div"), options);
                        return dialog.show()
                    };
                    ResetCloudCollectionDialog.prototype._createCancelButton = function() {
                        return {
                                title: String.load(String.id.IDS_MUSIC_RESET_COLLECTION_DIALOG_ACTION_CANCEL), execute: function(dialog) {
                                        return dialog.hide()
                                    }
                            }
                    };
                    ResetCloudCollectionDialog.prototype._onCheckBoxChanged = function() {
                        if (this.buttons && this.buttons.length > 0 && this.overlayContent && this.overlayContent.winControl) {
                            this.buttons[0].isEnabled = this.overlayContent.winControl.isChecked;
                            this.buttons[0].isDisabled = !this.overlayContent.winControl.isChecked
                        }
                    };
                    return ResetCloudCollectionDialog
                })(MS.Entertainment.UI.Controls.Dialog);
            Music.ResetCloudCollectionDialog = ResetCloudCollectionDialog;
            var ResetButton = (function(_super) {
                    __extends(ResetButton, _super);
                    function ResetButton() {
                        _super.apply(this, arguments);
                        this._isDisabled = true;
                        this.isEnabled = false;
                        this.title = String.load(String.id.IDS_MUSIC_RESET_COLLECTION_DIALOG_ACTION_DELETE)
                    }
                    Object.defineProperty(ResetButton.prototype, "isDisabled", {
                        get: function() {
                            return this._isDisabled
                        }, set: function(value) {
                                this.updateAndNotify("isDisabled", value)
                            }, enumerable: true, configurable: true
                    });
                    ResetButton.prototype.execute = function(dialog) {
                        var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                        var resetAction = actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.resetCloudCollection);
                        resetAction.parameter = {
                            deleteMusicPassContent: dialog.userControlInstance._deleteMusicPassOption.checked, deletePurchasedContent: dialog.userControlInstance._deletePurchasedOption.checked, deletePlaylists: dialog.userControlInstance._deletePlaylistsOption.checked
                        };
                        resetAction.execute();
                        dialog.hide()
                    };
                    return ResetButton
                })(Entertainment.UI.Framework.ObservableBase);
            Music.ResetButton = ResetButton
        })(Music = Entertainment.Music || (Entertainment.Music = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.Music.ResetCloudCollectionDialog);
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Actions;
            (function(Actions) {
                var Settings;
                (function(Settings) {
                    var ResetCloudCollectionAction = (function(_super) {
                            __extends(ResetCloudCollectionAction, _super);
                            function ResetCloudCollectionAction() {
                                _super.apply(this, arguments);
                                this.automationId = UI.AutomationIds.resetCloudCollection
                            }
                            ResetCloudCollectionAction.prototype.executed = function(param) {
                                Actions.assert(param, "ResetCloudCollectionAction::executed() param cannot be null.");
                                var resetQuery = new Entertainment.Data.Query.Music.ResetCloudCollection;
                                resetQuery.deleteMusicPassContent = param.deleteMusicPassContent;
                                resetQuery.deletePurchasedContent = param.deletePurchasedContent;
                                resetQuery.deletePlaylists = param.deletePlaylists;
                                resetQuery.execute().done(function() {
                                    var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                                    if (actionService.isRegistered(UI.Actions.ActionIdentifiers.showResetCloudCollectionFlyout)) {
                                        var action = actionService.getAction(UI.Actions.ActionIdentifiers.showResetCloudCollectionFlyout);
                                        action.execute()
                                    }
                                }, function(error) {
                                    Actions.fail("ResetCloudCollectionAction::executed() failed. Error:" + error && error.message)
                                })
                            };
                            ResetCloudCollectionAction.prototype.canExecute = function(param) {
                                return param && (param.deleteMusicPassContent || param.deletePurchasedContent || param.deletePlaylists)
                            };
                            return ResetCloudCollectionAction
                        })(MS.Entertainment.UI.Actions.Action);
                    Settings.ResetCloudCollectionAction = ResetCloudCollectionAction;
                    var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                    actionService.register(UI.Actions.ActionIdentifiers.resetCloudCollection, function() {
                        return new UI.Actions.Settings.ResetCloudCollectionAction
                    })
                })(Settings = Actions.Settings || (Actions.Settings = {}))
            })(Actions = UI.Actions || (UI.Actions = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
