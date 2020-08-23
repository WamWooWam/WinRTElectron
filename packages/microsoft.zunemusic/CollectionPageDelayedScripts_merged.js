/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/managefoldersview.js:2 */
(function() {
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

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var FolderItem = (function(_super) {
                        __extends(FolderItem, _super);
                        function FolderItem(folder) {
                            _super.call(this);
                            if (folder) {
                                this._isAddFolderButton = false;
                                this._name = folder.name;
                                this._path = folder.path;
                                this._folder = folder
                            }
                            else
                                this._isAddFolderButton = true
                        }
                        Object.defineProperty(FolderItem.prototype, "name", {
                            get: function() {
                                return this._name
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(FolderItem.prototype, "path", {
                            get: function() {
                                return this._path
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(FolderItem.prototype, "isAddFolderButton", {
                            get: function() {
                                return this._isAddFolderButton
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(FolderItem.prototype, "folder", {
                            get: function() {
                                return this._folder
                            }, enumerable: true, configurable: true
                        });
                        return FolderItem
                    })(MS.Entertainment.UI.Framework.ObservableBase);
                var ManageFoldersDialog = (function(_super) {
                        __extends(ManageFoldersDialog, _super);
                        function ManageFoldersDialog(element, options) {
                            this.templateStorage = "/Controls/ManageFoldersPage.html";
                            this.templateName = "dialogTemplate";
                            _super.call(this, element, options)
                        }
                        ManageFoldersDialog.show = function() {
                            if (ManageFoldersDialog._dialog && ManageFoldersDialog._dialog.visible)
                                return;
                            var options = {
                                    width: "60%", height: "100%", buttons: [WinJS.Binding.as({
                                                title: String.load(String.id.IDS_MANAGE_FOLDERS_DONE_BUTTON), execute: function execute_done(dialog) {
                                                        dialog.hide();
                                                        ManageFoldersDialog._dialog = null
                                                    }
                                            })], defaultButtonIndex: 0, title: MS.Entertainment.Utilities.isVideoApp1 ? String.load(String.id.IDS_VIDEO1_MANAGE_FOLDERS_TITLE) : String.load(String.id.IDS_MUSIC_MANAGE_FOLDERS_TITLE), userControl: "MS.Entertainment.UI.Controls.ManageFolders", userControlOptions: {}, persistOnNavigate: false
                                };
                            if (!ManageFoldersDialog._dialog)
                                ManageFoldersDialog._dialog = new MS.Entertainment.UI.Controls.ManageFoldersDialog(document.createElement("div"), options);
                            if (!ManageFoldersDialog._dialog.visible)
                                ManageFoldersDialog._dialog.show()
                        };
                        ManageFoldersDialog.hide = function() {
                            var returnValue = ManageFoldersDialog._dialog.hide();
                            ManageFoldersDialog._dialog = null;
                            return returnValue
                        };
                        return ManageFoldersDialog
                    })(MS.Entertainment.UI.Controls.Dialog);
                Controls.ManageFoldersDialog = ManageFoldersDialog;
                var ManageFolders = (function(_super) {
                        __extends(ManageFolders, _super);
                        function ManageFolders(element, options) {
                            this.templateStorage = "/Controls/ManageFoldersPage.html";
                            this.templateName = "manageFoldersTemplate";
                            _super.call(this, element, options)
                        }
                        Object.defineProperty(ManageFolders.prototype, "items", {
                            get: function() {
                                return this._items
                            }, set: function(value) {
                                    this.updateAndNotify("items", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(ManageFolders.prototype, "itemCounts", {
                            get: function() {
                                return this._itemCounts
                            }, enumerable: true, configurable: true
                        });
                        ManageFolders.prototype._load = function() {
                            var _this = this;
                            var addFolderItem = new Array;
                            var itemsInLibrary = new Array;
                            var libraryId;
                            libraryId = MS.Entertainment.Utilities.isVideoApp1 ? Windows.Storage.KnownLibraryId.videos : Windows.Storage.KnownLibraryId.music;
                            addFolderItem.push(new FolderItem(null));
                            Windows.Storage.StorageLibrary.getLibraryAsync(libraryId).then(function(library) {
                                if (library)
                                    library.folders.forEach(function(folder) {
                                        itemsInLibrary.push(new FolderItem(folder))
                                    })
                            }).done(function() {
                                _this._itemCounts = itemsInLibrary.length;
                                if (_this._itemCounts > 0)
                                    itemsInLibrary.reverse();
                                _this.items = new MS.Entertainment.ObservableArray(addFolderItem.concat(itemsInLibrary))
                            }, function(error) {
                                MS.Entertainment.Utilities.assertError("ManageFolders::_load() failed to get library items.", error)
                            })
                        };
                        ManageFolders.prototype.initialize = function() {
                            this._load()
                        };
                        ManageFolders.showLastFolderDialog = function() {
                            return MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_MANAGE_FOLDERS_LAST_FOLDER_ERROR_TITLE), String.load(String.id.IDS_MANAGE_FOLDERS_LAST_FOLDER_ERROR_TEXT), {
                                    width: "60%", height: "100%", buttons: [WinJS.Binding.as({
                                                title: String.load(String.id.IDS_CLOSE_BUTTON), execute: function execute_done(dialog) {
                                                        dialog.hide()
                                                    }
                                            })], defaultButtonIndex: 0
                                })
                        };
                        ManageFolders.folderTemplateSelector = function(item) {
                            function loadItemTemplate(itemTemplate) {
                                return MS.Entertainment.UI.Framework.loadTemplate(itemTemplate, null, true).then(function(templateControl) {
                                        return templateControl
                                    })
                            }
                            if (item.isAddFolderButton)
                                return loadItemTemplate("/Controls/ManageFoldersPage.html#addFolderItemTemplate");
                            else
                                return loadItemTemplate("/Controls/ManageFoldersPage.html#removeFolderItemTemplate")
                        };
                        ManageFolders.prototype.onModuleItemClicked = function(event) {
                            var element = event.srcElement;
                            while (element && element !== this.domElement) {
                                if (element.clickDataContext) {
                                    this._invokeModuleItem(element.clickDataContext);
                                    event.stopPropagation();
                                    break
                                }
                                element = element.parentElement
                            }
                        };
                        ManageFolders.prototype._invokeModuleItem = function(item) {
                            var _this = this;
                            if (!item)
                                return;
                            var libraryId;
                            libraryId = MS.Entertainment.Utilities.isVideoApp1 ? Windows.Storage.KnownLibraryId.videos : Windows.Storage.KnownLibraryId.music;
                            if (item.isAddFolderButton)
                                Windows.Storage.StorageLibrary.getLibraryAsync(libraryId).then(function(library) {
                                    return library.requestAddFolderAsync()
                                }).done(function() {
                                    _this._load()
                                }, function(error) {
                                    MS.Entertainment.fail("AddFolder Failed: " + (error && error.message))
                                });
                            else
                                Windows.Storage.StorageLibrary.getLibraryAsync(libraryId).then(function(library) {
                                    MS.Entertainment.UI.Controls.ManageFoldersDialog.hide();
                                    if (_this.itemCounts === 1)
                                        return MS.Entertainment.UI.Controls.ManageFolders.showLastFolderDialog();
                                    else
                                        return library.requestRemoveFolderAsync(item.folder)
                                }).done(function() {
                                    MS.Entertainment.UI.Controls.ManageFoldersDialog.show()
                                }, function(error) {
                                    MS.Entertainment.fail("RemoveFolder Failed: " + (error && error.message))
                                })
                        };
                        return ManageFolders
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.ManageFolders = ManageFolders;
                WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.ManageFolders.folderTemplateSelector)
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/components/music/cloudgrovelinfo.js:199 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Music");
    WinJS.Namespace.define("MS.Entertainment.Music", {cloudGrovelInfo: MS.Entertainment.UI.Framework.defineUserControl("Components/Music/CloudGrovelInfo.html#cloudGrovelInfoTemplate", function cloudGrovelInfo(element, options) {
            this._nextButton = WinJS.Binding.as({
                title: String.load(String.id.IDS_FAI_NEXT_BUTTON), isEnabled: true, isAvailable: true, execute: function onNext() {
                        this._onNext()
                    }.bind(this)
            });
            this._finishButton = WinJS.Binding.as({
                title: String.load(String.id.IDS_CLOSE_BUTTON), isEnabled: true, isAvailable: true, execute: function onFinish() {
                        this._onFinish()
                    }.bind(this)
            });
            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
            if (signedInUser.isSubscription) {
                this.subHeaderString = String.load(String.id.IDS_MUSIC_CLOUD_MATCH_SUB_HEADER_XMP);
                this.streamIconParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_1_XMP);
                this.streamIconParagraphTwoText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_2_XMP);
                this.cloudIconParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_CLOUD_PARA_1_XMP)
            }
            else {
                this.subHeaderString = String.load(String.id.IDS_MUSIC_CLOUD_MATCH_SUB_HEADER_FREE);
                this.streamIconParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_1_FREE);
                this.streamIconParagraphTwoText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_STREAM_PARA_2_FREE);
                this.cloudIconParagraphOneText = String.load(String.id.IDS_MUSIC_CLOUD_ICON_CLOUD_PARA_1_FREE)
            }
        }, {
            _nextButton: null, _finishButton: null, _container: null, _currentPage: 0, _dialogContainer: null, subHeaderString: String.empty, streamIconParagraphOneText: String.empty, streamIconParagraphTwoText: String.empty, cloudIconParagraphOneText: String.empty, initialize: function initialize() {
                    this.xboxMusicPassWebLink.domElement.href = MS.Entertainment.UI.FWLink.cloudGrovelLearnMore;
                    this._dialogContainer = document.querySelector(".dialogContainerBackground")
                }, setOverlay: function setOverlay(container) {
                    this._container = container;
                    container.buttons = [this._nextButton, this._finishButton];
                    container.backClickHandler = this._onBack.bind(this);
                    var featureEnablement = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.featureEnablement);
                    var devicesEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.devicesEnabled);
                    if (devicesEnabled)
                        WinJS.Utilities.addClass(this.iconColumn2, "removeFromDisplay");
                    this._updateState()
                }, _onNext: function _onNext() {
                    this._currentPage = 1;
                    this._updateState()
                }, _onBack: function _onBack() {
                    this._currentPage = 0;
                    this._updateState()
                }, _onFinish: function _onFinish() {
                    this._container.hide()
                }, _updateState: function _updateState() {
                    this._showElement(this.cloudInfoDialogPage1, this._currentPage === 0);
                    this._showElement(this.cloudInfoDialogPage2, this._currentPage === 1);
                    this._showElement(this._container._backButton, this._currentPage !== 0);
                    this._container.defaultButtonIndex = (this._currentPage === 0) ? 0 : 1;
                    this._nextButton.isAvailable = this._currentPage === 0;
                    if (this._dialogContainer)
                        if (this._currentPage === 0) {
                            WinJS.Utilities.addClass(this._dialogContainer, "page1");
                            WinJS.Utilities.removeClass(this._dialogContainer, "page2")
                        }
                        else {
                            WinJS.Utilities.addClass(this._dialogContainer, "page2");
                            WinJS.Utilities.removeClass(this._dialogContainer, "page1")
                        }
                }, _showElement: function _showElement(element, show) {
                    if (element.domElement)
                        element = element.domElement;
                    if (show)
                        WinJS.Utilities.removeClass(element, "removeFromDisplay");
                    else
                        WinJS.Utilities.addClass(element, "removeFromDisplay")
                }, _sendTelemetryEvent: function _sendTelemetryEvent(event) {
                    MS.Entertainment.Utilities.Telemetry.logTelemetryEvent(event)
                }
        }, {}, {})});
    WinJS.Namespace.define("MS.Entertainment.Music", {cloudGrovelInfoDialog: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.Dialog", "Components/Music/CloudGrovelInfo.html#dialogTemplate", null, {
            backClickHandler: null, onBackClick: function onBackClick(event) {
                    if (this.backClickHandler)
                        this.backClickHandler(event)
                }
        }, null, {show: function show() {
                var options = {
                        width: "900px", height: "700px", cancelButtonIndex: 2, defaultButtonIndex: 0, title: String.load(String.id.IDS_MUSIC_CLOUD_INFO_DIALOG_TITLE), userControl: "MS.Entertainment.Music.cloudGrovelInfo", userControlOptions: {}, persistOnNavigate: false
                    };
                var dialog = new MS.Entertainment.Music.cloudGrovelInfoDialog(document.createElement("div"), options);
                return dialog.show()
            }})})
})()
})();
/* >>>>>>/controls/appbar/removeoverlay.js:290 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {RemoveOverlay: MS.Entertainment.UI.Framework.defineUserControl("/Controls/AppBar/RemoveOverlay.html#removeOverlayTemplate", function removeOverlayConstructor(element, options) {
            this._inputItems = options.items;
            MS.Entertainment.UI.Controls.assert(this._inputItems, "Need item(s) for deletion in RemoveOverlay!");
            this._inputItems = this._inputItems || []
        }, {
            items: null, collectionFilter: null, deleteLocalFilesOnly: false, removed: false, _inputItems: null, _dialog: null, _okEnabled: true, _cancelEnabled: true, _mediaType: null, _ids: null, initialize: function initialize() {
                    this._waitCursor.isBusy = true;
                    this._setOKEnabled(false);
                    var length = 0;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isCloudCollectionV2Enabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.cloudCollectionV2Enabled);
                    return this._getCount().then(function gotCount(count) {
                            length = count;
                            if (isCloudCollectionV2Enabled)
                                return MS.Entertainment.Data.List.listToArray(this._inputItems, 0, MS.Entertainment.UI.Controls.RemoveOverlay.DELETE_CONFIRMATION_VERIFICATION_LIMIT);
                            else
                                return MS.Entertainment.Data.List.listToArray(this._inputItems, 0, 3)
                        }.bind(this)).then(function copiedItems(arrayMediaItems) {
                            this._waitCursor.isBusy = false;
                            this._setOKEnabled(true);
                            var mediaItem = arrayMediaItems ? arrayMediaItems[0] : null;
                            var mediaAvailability = this.collectionFilter || Microsoft.Entertainment.Platform.MediaAvailability.available;
                            var isFilteredToMusicPass = mediaAvailability === Microsoft.Entertainment.Platform.MediaAvailability.musicPass;
                            if (!mediaItem || !mediaItem.isRemovable) {
                                MS.Entertainment.UI.Controls.fail("Item is invalid or has mediaType not supported for deletion.");
                                this._hide()
                            }
                            else if (length === 1) {
                                var isAlbum = mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album;
                                var isTrack = mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track;
                                var hasLocalFiles = mediaItem.localTracksCount && mediaItem.localTracksCount > 0;
                                if (!mediaItem.name && mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason)
                                    this._removeDescription.text = String.load(String.id.IDS_DELETE_DESCRIPTION_LOCAL_SINGLE).format(mediaItem.seriesTitle);
                                else if (isTrack || isAlbum)
                                    if (isFilteredToMusicPass)
                                        if (hasLocalFiles)
                                            if (isTrack)
                                                this._removeDescription.text = String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_ONLY_CLOUD_SINGLE_TRACK_WITH_LOCAL);
                                            else
                                                this._removeDescription.text = String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_ONLY_CLOUD_SINGLE_ALBUM_WITH_LOCAL);
                                        else if (isTrack)
                                            this._removeDescription.text = String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_ONLY_CLOUD_SINGLE_TRACK);
                                        else
                                            this._removeDescription.text = String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_ONLY_CLOUD_SINGLE_ALBUM);
                                    else if (isCloudCollectionV2Enabled && (mediaItem.inCloudCollectionV2 || mediaItem.roamingViaOneDriveTrackCount > 0)) {
                                        this._removeDescription.text = String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_SINGLE_ONEDRIVE).format(mediaItem.name);
                                        MS.Entertainment.Utilities.displayElement(this._oneDriveIcon)
                                    }
                                    else
                                        this._removeDescription.text = String.load(String.id.IDS_MUSIC_DELETE_DIALOG_BODY_SINGLE_LIBRARY).format(mediaItem.name);
                                else
                                    this._removeDescription.text = String.load(String.id.IDS_DELETE_DESCRIPTION_LOCAL_SINGLE).format(mediaItem.name)
                            }
                            else if (length !== 0) {
                                var decimalFormatter = new Windows.Globalization.NumberFormatting.DecimalFormatter;
                                decimalFormatter.fractionDigits = 0;
                                var decimalFormattedNumber = decimalFormatter.format(length);
                                var messageId = String.id.IDS_DELETE_DESCRIPTION_LOCAL_PLURAL;
                                var isAlbum = mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.album;
                                var isTrack = mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track;
                                var hasLocalFiles = mediaItem.localTracksCount && mediaItem.localTracksCount > 0;
                                if (isTrack || isAlbum)
                                    if (isFilteredToMusicPass)
                                        if (isTrack)
                                            messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_ONLY_CLOUD_TRACKS_PLURAL;
                                        else
                                            messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_ONLY_CLOUD_ALBUMS_PLURAL;
                                    else if (isCloudCollectionV2Enabled)
                                        if (length <= MS.Entertainment.UI.Controls.RemoveOverlay.DELETE_CONFIRMATION_VERIFICATION_LIMIT) {
                                            var mixedContent = false;
                                            for (var i = 1; i < length; i++)
                                                if (arrayMediaItems[i - 1].inCloudCollectionV2 !== arrayMediaItems[i].inCloudCollectionV2) {
                                                    mixedContent = true;
                                                    break
                                                }
                                            if (!mixedContent)
                                                if (mediaItem.inCloudCollectionV2) {
                                                    if (isTrack)
                                                        messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_ONEDRIVE_PLURAL;
                                                    else
                                                        messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_ONEDRIVE_PLURAL;
                                                    MS.Entertainment.Utilities.displayElement(this._oneDriveIcon)
                                                }
                                                else if (isTrack)
                                                    messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_LIBRARY_PLURAL;
                                                else
                                                    messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_LIBRARY_PLURAL;
                                            else {
                                                if (isTrack)
                                                    messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_MIXED_PLURAL;
                                                else
                                                    messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_MIXED_PLURAL;
                                                MS.Entertainment.Utilities.displayElement(this._oneDriveIcon)
                                            }
                                        }
                                        else {
                                            if (isTrack)
                                                messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_MIXED_PLURAL;
                                            else
                                                messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_MIXED_PLURAL;
                                            MS.Entertainment.Utilities.displayElement(this._oneDriveIcon)
                                        }
                                    else if (isTrack)
                                        messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_TRACKS_LIBRARY_PLURAL;
                                    else
                                        messageId = String.id.IDS_MUSIC_DELETE_DIALOG_BODY_MULTIPLE_ALBUMS_LIBRARY_PLURAL;
                                this._removeDescription.text = MS.Entertainment.Utilities.Pluralization.getPluralizedString(messageId, length).format(decimalFormattedNumber)
                            }
                            else {
                                MS.Entertainment.UI.Controls.fail("Need item(s) for deletion in RemoveOverlay! List was empty");
                                this._hide()
                            }
                            this._mediaType = mediaItem ? mediaItem.mediaType : null
                        }.bind(this), function copiedFailed() {
                            MS.Entertainment.UI.Controls.fail("Error occured when attempting to get items to delete.");
                            this._waitCursor.isBusy = false;
                            this._hide()
                        }.bind(this))
                }, setOverlay: function setOverlay(overlay) {
                    this._dialog = overlay;
                    this._setOKEnabled(this._okEnabled);
                    this._setCanceledEnabled(this._cancelEnabled)
                }, submit: function submit() {
                    this._setOKEnabled(false);
                    this._setCanceledEnabled(false);
                    this.removed = true;
                    this._waitCursor.isBusy = true;
                    return this._getIds().then(function deleteItems() {
                            return this._deleteItems()
                        }.bind(this))
                }, _hide: function _hide() {
                    if (this._dialog)
                        this._dialog.hide()
                }, _setOKEnabled: function _setOKEnabled(enabled) {
                    if (this._dialog && this._dialog.buttons && (this._dialog.buttons.length > 0))
                        this._dialog.buttons[0].isEnabled = enabled;
                    this._okEnabled = enabled
                }, _setCanceledEnabled: function _setCanceledEnabled(enabled) {
                    if (this._dialog && this._dialog.buttons && (this._dialog.buttons.length > 1))
                        this._dialog.buttons[1].isEnabled = enabled;
                    this._cancelEnabled = enabled
                }, _getCount: function _getCount() {
                    var promise;
                    if (Array.isArray(this._inputItems))
                        promise = this._inputItems.length;
                    else if (MS.Entertainment.Data.List.isList(this._inputItems))
                        promise = this._inputItems.getCount();
                    else if (this._inputItems)
                        promise = 1;
                    else
                        promise = 0;
                    return WinJS.Promise.as(promise)
                }, _clearCurrentMediaIfMatch: function _clearCurrentMediaIfMatch(playbackSession, id) {
                    if (playbackSession) {
                        if (playbackSession.isMediaCurrentlyLoaded(id)) {
                            var removeItemIfMatch = function removeItemIfMatch(item) {
                                    if (item && item.data && item.data.libraryId === id) {
                                        playbackSession.mediaCollection.remove(item.key);
                                        if (MS.Entertainment.Utilities.useModalNowPlaying) {
                                            playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                            if (navigationService.currentPage && navigationService.currentPage.iaNode && navigationService.currentPage.iaNode.moniker === "immersiveDetails")
                                                navigationService.navigateBack()
                                        }
                                    }
                                    return WinJS.Promise.wrap()
                                };
                            MS.Entertainment.Platform.Playback.Playlist.PlaylistCore.forEachItemSequentially(playbackSession.mediaCollection, removeItemIfMatch, null, null)
                        }
                        if (MS.Entertainment.Utilities.useModalNowPlaying && playbackSession.lastPlayedMedia && playbackSession.lastPlayedMedia.libraryId === id)
                            playbackSession.setLastPlayedMedia(null)
                    }
                }, _getIds: function _getIds() {
                    var ids = [];
                    var promise = ids;
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionMgr.primarySession;
                    this._ids = ids;
                    if (Array.isArray(this._inputItems))
                        this._inputItems.forEach(function iteration(item) {
                            if (MS.Entertainment.Utilities.isValidLibraryId(item.libraryId)) {
                                ids.push(item.libraryId);
                                this._clearCurrentMediaIfMatch(playbackSession, item.libraryId)
                            }
                        }, this);
                    else if (MS.Entertainment.Data.List.isList(this._inputItems))
                        promise = this._inputItems.forEachAll(function iteration(args) {
                            if (args.item && args.item.data && MS.Entertainment.Utilities.isValidLibraryId(args.item.data.libraryId)) {
                                ids.push(args.item.data.libraryId);
                                this._clearCurrentMediaIfMatch(playbackSession, args.item.data.libraryId)
                            }
                        }.bind(this)).then(null, function ignoreErrors(){}).then(function returnIds() {
                            return ids
                        });
                    else if (this._inputItems && MS.Entertainment.Utilities.isValidLibraryId(this._inputItems.libraryId)) {
                        ids.push(this._inputItems.libraryId);
                        this._clearCurrentMediaIfMatch(playbackSession, this._inputItems.libraryId)
                    }
                    return WinJS.Promise.as(promise)
                }, _deleteItems: function _deleteItems() {
                    var handleDeleteSuccess = this._handleDeleteSuccess.bind(this);
                    var handleDeleteFailure = this._handleDeleteCompleted.bind(this);
                    if (!this._ids || !this._ids.length || !this._mediaType) {
                        handleDeleteFailure();
                        return WinJS.Promise.wrapError(new Error("Ids are invalid or has mediaType not supported for deletion."))
                    }
                    var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                    var mediaProvider = mediaStore.mediaProvider;
                    var playlistProvider = mediaStore.playlistProvider;
                    var mediaAvailability = this.collectionFilter || Microsoft.Entertainment.Platform.MediaAvailability.available;
                    switch (this._mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.playlist:
                            return playlistProvider.deletePlaylistAsync(this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                        case Microsoft.Entertainment.Queries.ObjectType.track:
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            if (this.deleteLocalFilesOnly)
                                return mediaProvider.deleteFilesForMediaAsync(this._mediaType, this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                            return mediaProvider.deleteMediaAsync(this._mediaType, this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                        default:
                            this._waitCursor.isBusy = true;
                            var deletePromises = [];
                            var ids = [];
                            var mediaType = null;
                            this._ids.forEach(function deleteItem(collectionId) {
                                deletePromises.push(this._getIdsFromQuery(collectionId, this._mediaType).then(function addIds(deleteIds) {
                                    ids = ids.concat(deleteIds.ids);
                                    mediaType = deleteIds.mediaType
                                }))
                            }.bind(this));
                            return WinJS.Promise.join(deletePromises).then(function deleteQueryItems() {
                                    if (ids.length === 0)
                                        return WinJS.Promise.wrapError("No items to delete");
                                    if (this.deleteLocalFilesOnly)
                                        return mediaProvider.deleteFilesForMediaAsync(this._mediaType, this._ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure);
                                    return mediaProvider.deleteMediaAsync(mediaType, ids, mediaAvailability).then(handleDeleteSuccess, handleDeleteFailure)
                                }.bind(this))
                    }
                }, _handleDeleteSuccess: function _handleDeleteSuccess() {
                    return this._clearLibraryIds().then(this._handleDeleteCompleted.bind(this))
                }, _handleDeleteCompleted: function _handleDeleteCompleted() {
                    this._waitCursor.isBusy = false;
                    this._hide()
                }, _clearLibraryId: function _clearLibraryId(item) {
                    if (item && !item.fromCollection && MS.Entertainment.Utilities.isValidLibraryId(item.libraryId))
                        item.libraryId = MS.Entertainment.Utilities.invalidateLibraryId
                }, _clearLibraryIds: function _clearLibraryIds() {
                    var promise;
                    if (Array.isArray(this._inputItems))
                        this._inputItems.forEach(this._clearLibraryId, this);
                    else if (MS.Entertainment.Data.List.isList(this._inputItems))
                        promise = this._inputItems.forEachAll(function iteration(args) {
                            this._clearLibraryId(args.item && args.item.data)
                        }.bind(this)).then(null, function ignoreErrors(error) {
                            MS.Entertainment.UI.Controls.fail("Failed to clear all library ids after delete. Error message: " + error && error.message)
                        });
                    else
                        this._clearLibraryId(this._inputItems);
                    return WinJS.Promise.as(promise)
                }, _getIdsFromQuery: function _getIdsFromQuery(libraryId, mediaType) {
                    var currentId;
                    var ids = [];
                    var childMediaType = null;
                    var itemsPromise = WinJS.Promise.wrap();
                    var queryComplete = function queryComplete(q) {
                            return q.result.items.itemsFromIndex(0).then(function processItems(dataContext) {
                                    for (var x = 0; x < dataContext.items.length; x++) {
                                        currentId = dataContext.items[x].data.libraryId;
                                        if (MS.Entertainment.Utilities.isValidLibraryId(currentId))
                                            ids.push(currentId)
                                    }
                                })
                        };
                    switch (mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                            childMediaType = Microsoft.Entertainment.Queries.ObjectType.track;
                            var tracksQuery = new MS.Entertainment.Data.Query.libraryTracks;
                            tracksQuery.albumId = libraryId;
                            tracksQuery.mediaAvailability = this.collectionFilter;
                            itemsPromise = tracksQuery.execute().then(queryComplete);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            childMediaType = Microsoft.Entertainment.Queries.ObjectType.video;
                            var episodeQuery = new MS.Entertainment.Data.Query.libraryVideoTV;
                            episodeQuery.seasonId = libraryId;
                            itemsPromise = episodeQuery.execute().then(queryComplete);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                            childMediaType = Microsoft.Entertainment.Queries.ObjectType.video;
                            var seriesEpisodesQuery = new MS.Entertainment.Data.Query.libraryVideoTV;
                            seriesEpisodesQuery.seriesId = libraryId;
                            itemsPromise = seriesEpisodesQuery.execute().then(queryComplete);
                            break
                    }
                    return itemsPromise.then(function returnIds() {
                            return {
                                    ids: ids, mediaType: childMediaType
                                }
                        })
                }
        }, {}, {
            _isRemoveOverlayOpen: false, DELETE_CONFIRMATION_VERIFICATION_LIMIT: 25, show: function show(dataSource, collectionFilter, deleteLocalFilesOnly) {
                    if (MS.Entertainment.UI.Controls.RemoveOverlay._isRemoveOverlayOpen)
                        return WinJS.Promise.wrap();
                    MS.Entertainment.UI.Controls.RemoveOverlay._isRemoveOverlayOpen = true;
                    return MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_DELETE_LABEL), "MS.Entertainment.UI.Controls.RemoveOverlay", {
                            userControlOptions: {
                                items: dataSource, collectionFilter: collectionFilter, deleteLocalFilesOnly: deleteLocalFilesOnly
                            }, width: "40%", height: "310px", buttons: [WinJS.Binding.as({
                                        isEnabled: true, title: String.load(String.id.IDS_DELETE_BUTTON), execute: function execute_submit(dialog) {
                                                WinJS.Promise.as(dialog.userControlInstance.submit()).done(null, function(error) {
                                                    MS.Entertainment.UI.Controls.fail("Submit failed in the delete dialog. Error message: " + error && error.message)
                                                })
                                            }
                                    }), WinJS.Binding.as({
                                        isEnabled: true, title: String.load(String.id.IDS_CANCEL_BUTTON_TC), execute: function execute_cancel(dialog) {
                                                dialog.hide()
                                            }
                                    })], defaultButtonIndex: 0, cancelButtonIndex: 1
                        }).then(function onDismiss(overlay) {
                            if (overlay)
                                MS.Entertainment.UI.Controls.RemoveOverlay._isRemoveOverlayOpen = false;
                            return overlay
                        })
                }
        })})
})()
})();
/* >>>>>>/viewmodels/music1/metadataeditcommon.js:625 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Framework = MS.Entertainment.UI.Framework;
            var MetadataSavable = (function(_super) {
                    __extends(MetadataSavable, _super);
                    function MetadataSavable(destination) {
                        _super.call(this);
                        this._disposed = false;
                        this._destination = destination
                    }
                    Object.defineProperty(MetadataSavable.prototype, "isValid", {
                        get: function() {
                            return !this._lastError
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataSavable.prototype, "hasError", {
                        get: function() {
                            return !!this._lastError
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataSavable.prototype, "lastError", {
                        get: function() {
                            return this._lastError
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataSavable.prototype, "destination", {
                        get: function() {
                            return this._destination
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataSavable.prototype, "disposed", {
                        get: function() {
                            return this._disposed
                        }, enumerable: true, configurable: true
                    });
                    MetadataSavable.prototype.dispose = function() {
                        this._disposed = true
                    };
                    MetadataSavable.prototype.validate = function() {
                        MS.Entertainment.ViewModels.fail("MetadataSavable::validate is undefined")
                    };
                    MetadataSavable.prototype.cancel = function() {
                        MS.Entertainment.ViewModels.fail("MetadataSavable::cancel is undefined")
                    };
                    MetadataSavable.prototype.save = function() {
                        MS.Entertainment.ViewModels.fail("MetadataSavable::save is undefined");
                        return null
                    };
                    MetadataSavable.prototype._setLastError = function(value) {
                        var wasValid = this.isValid;
                        this.updateAndNotify("lastError", value);
                        if (wasValid !== !value) {
                            this.dispatchChangeAndNotify("isValid", !value, wasValid);
                            this.dispatchChangeAndNotify("hasError", !!value, !wasValid)
                        }
                    };
                    return MetadataSavable
                })(Framework.ObservableBase);
            ViewModels.MetadataSavable = MetadataSavable
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataeditfields.js:706 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Framework = MS.Entertainment.UI.Framework;
            var Utilities = MS.Entertainment.Utilities;
            var MetadataValueFieldType = (function() {
                    function MetadataValueFieldType(regexp, converter, maxLength) {
                        this._converter = null;
                        this._regexp = regexp;
                        this._converter = converter;
                        this._maxLength = null;
                        if (maxLength && typeof(maxLength) === "number")
                            if (maxLength > 0)
                                this._maxLength = maxLength;
                            else
                                MS.Entertainment.ViewModels.fail("Positive number expected for max field length")
                    }
                    Object.defineProperty(MetadataValueFieldType.prototype, "regexp", {
                        get: function() {
                            return this._regexp
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataValueFieldType.prototype, "maxLength", {
                        get: function() {
                            return this._maxLength
                        }, enumerable: true, configurable: true
                    });
                    MetadataValueFieldType.prototype.validate = function(value) {
                        var error = null;
                        if (this.maxLength && value && value.length > this.maxLength)
                            error = new ViewModels.MetadataError(null, null, "Value entered is too long for the given type. Maximum length: " + this.maxLength + "\" Value: \"" + value + "\"");
                        if (!error && this.regexp) {
                            this.regexp.lastIndex = 0;
                            if (!this.regexp.test(value))
                                error = new ViewModels.MetadataError(null, null, "Value can't be converted to given type. Type: \"" + this.regexp.toString() + "\" Value: \"" + value + "\"")
                        }
                        return error
                    };
                    MetadataValueFieldType.prototype.convert = function(value) {
                        if (this._converter)
                            return this._converter(value);
                        else
                            return null
                    };
                    return MetadataValueFieldType
                })();
            ViewModels.MetadataValueFieldType = MetadataValueFieldType;
            var MetadataValueField = (function(_super) {
                    __extends(MetadataValueField, _super);
                    function MetadataValueField(originalValue, stringId, destination) {
                        _super.call(this, destination);
                        this.allowEmpty = false;
                        if (stringId)
                            this._displayName = String.load(stringId);
                        else
                            this._displayName = String.empty;
                        originalValue = Utilities.trimCharacterDirection(originalValue);
                        var validOriginalValue = true;
                        this._valueDestination = destination;
                        if (this.destination)
                            validOriginalValue = !this.destination.validate(originalValue);
                        if (!validOriginalValue)
                            originalValue = String.empty;
                        this._originalValue = originalValue;
                        this._value = originalValue
                    }
                    Object.defineProperty(MetadataValueField.prototype, "destination", {
                        get: function() {
                            return this._valueDestination
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataValueField.prototype, "displayName", {
                        get: function() {
                            return this._displayName
                        }, set: function(value) {
                                this.updateAndNotify("displayName", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataValueField.prototype, "displayValue", {
                        get: function() {
                            return MS.Entertainment.Data.Factory.appendCharacterDirection(this.value)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataValueField.prototype, "value", {
                        get: function() {
                            return this._value
                        }, set: function(value) {
                                value = Utilities.trimCharacterDirection(value);
                                if (value !== this.value) {
                                    var oldDisplayValue = this.displayValue;
                                    this.updateAndNotify("value", value);
                                    this.dispatchChangeAndNotify("displayValue", this.displayValue, oldDisplayValue)
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataValueField.prototype, "savedValue", {
                        get: function() {
                            return this._savedValue
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataValueField.prototype, "originalValue", {
                        get: function() {
                            return this._originalValue
                        }, set: function(value) {
                                this.updateAndNotify("originalValue", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataValueField.prototype, "maxLength", {
                        get: function() {
                            return this.destination.type.maxLength
                        }, enumerable: true, configurable: true
                    });
                    MetadataValueField.prototype.validate = function() {
                        var error = null;
                        if ((this.value || this.allowEmpty) && this.destination)
                            error = this.destination.validate(this.value);
                        this._setLastError(error)
                    };
                    MetadataValueField.prototype.cancel = function() {
                        this.value = this.originalValue;
                        this._setLastError(null)
                    };
                    MetadataValueField.prototype.save = function() {
                        var result = null;
                        this.validate();
                        if (!this.isValid)
                            result = WinJS.Promise.wrapError(this.lastError);
                        else if ((this.value || this.allowEmpty) && (this.value !== this.originalValue)) {
                            this._savedValue = this.value;
                            if (this.destination)
                                result = WinJS.Promise.as(this.destination.convert(this.value))
                        }
                        return WinJS.Promise.as(result)
                    };
                    return MetadataValueField
                })(ViewModels.MetadataSavable);
            ViewModels.MetadataValueField = MetadataValueField;
            var MetadataMultipleValuesField = (function(_super) {
                    __extends(MetadataMultipleValuesField, _super);
                    function MetadataMultipleValuesField(originalValue, possibleValues, stringId, customizeStringId, destination) {
                        _super.call(this, originalValue, stringId, destination);
                        this._selectionManager = null;
                        this._possibleValues = possibleValues || [];
                        this._customizeStringId = customizeStringId;
                        this._initializeSelectionManager()
                    }
                    Object.defineProperty(MetadataMultipleValuesField.prototype, "selectionManager", {
                        get: function() {
                            return this._selectionManager
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataMultipleValuesField.prototype, "allowCustomValue", {
                        get: function() {
                            return !!this._customizeStringId
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataMultipleValuesField.prototype, "valueInOriginalPossibleValues", {
                        get: function() {
                            var possibleValueIndex = this._possibleValues.indexOf(this.value);
                            var isPossibleValue = possibleValueIndex >= 0;
                            return isPossibleValue
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataMultipleValuesField.prototype, "customIndex", {
                        get: function() {
                            var customIndex = -1;
                            if (this.allowCustomValue && this.dataSource)
                                customIndex = this.dataSource.length - 1;
                            return customIndex
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataMultipleValuesField.prototype, "totalPossibleValues", {
                        get: function() {
                            var total = this.dataSource ? this.dataSource.length : 0;
                            if (total > 2 && this.allowCustomValue)
                                total -= 2;
                            return total
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataMultipleValuesField.prototype, "dataSource", {
                        get: function() {
                            var dataSource = null;
                            dataSource = this.selectionManager.dataSource;
                            return dataSource
                        }, enumerable: true, configurable: true
                    });
                    MetadataMultipleValuesField.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        if (this._selectionManagerHandlers) {
                            this._selectionManagerHandlers.cancel();
                            this._selectionManagerHandlers = null
                        }
                    };
                    MetadataMultipleValuesField.prototype._initializeSelectionManager = function() {
                        if (!this._selectionManager && !this.disposed) {
                            var dataSource;
                            if (this.allowCustomValue) {
                                dataSource = this._possibleValues.slice(0);
                                dataSource.push(null);
                                dataSource.push(String.load(this._customizeStringId))
                            }
                            else
                                dataSource = this._possibleValues;
                            this._selectionManager = new Framework.SelectionManager;
                            this._selectionManager.dataSource = new MS.Entertainment.ObservableArray(dataSource);
                            this._selectionManagerHandlers = Utilities.addEventHandlers(this._selectionManager, {selectedIndexChanged: this._onSelectionChanged.bind(this)});
                            Utilities.addEventHandlers(this, {valueChanged: this._onValueChanged.bind(this)});
                            this._onValueChanged()
                        }
                    };
                    MetadataMultipleValuesField.prototype._onValueChanged = function() {
                        if (this._selectionManager.selectedIndex < 0 || this._selectionManager.selectedItem !== this.value) {
                            var possibleValueIndex = this.dataSource.indexOf(this.value);
                            var isPossibleValue = possibleValueIndex >= 0 && possibleValueIndex < this.totalPossibleValues;
                            if (isPossibleValue)
                                this._selectionManager.selectedIndex = possibleValueIndex;
                            else if (this.allowCustomValue && (!!this.value || this.allowEmpty)) {
                                this.dataSource.splice(this.totalPossibleValues, 0, this.value);
                                this.dispatchChangeAndNotify("customIndex", this.customIndex, this.customIndex - 1);
                                this._selectionManager.selectedIndex = this.totalPossibleValues - 1
                            }
                            else if (this._selectionManager.selectedIndex >= 0 && this._selectionManager.selectedIndex < this.totalPossibleValues)
                                this.value = this._selectionManager.selectedItem;
                            else
                                this.value = this.originalValue
                        }
                    };
                    MetadataMultipleValuesField.prototype._onSelectionChanged = function(args) {
                        if (!this.allowCustomValue || this._selectionManager.selectedIndex !== this.customIndex)
                            this.value = this._selectionManager.selectedItem
                    };
                    return MetadataMultipleValuesField
                })(MetadataValueField);
            ViewModels.MetadataMultipleValuesField = MetadataMultipleValuesField
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataeditcollection.js:961 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var MetadataSavableCollection = (function(_super) {
                    __extends(MetadataSavableCollection, _super);
                    function MetadataSavableCollection(destination) {
                        _super.call(this, destination);
                        this._collectionDestination = destination
                    }
                    Object.defineProperty(MetadataSavableCollection.prototype, "destination", {
                        get: function() {
                            return this._collectionDestination
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataSavableCollection.prototype, "dataSource", {
                        get: function() {
                            this._dataSource = this._dataSource || [];
                            return this._dataSource
                        }, enumerable: true, configurable: true
                    });
                    MetadataSavableCollection.prototype.validate = function() {
                        var childErrors = [];
                        this.dataSource.forEach(function(item) {
                            if (item) {
                                item.validate();
                                if (!item.isValid)
                                    childErrors.push(item.lastError)
                            }
                        });
                        var error = null;
                        if (childErrors && childErrors.length)
                            error = new ViewModels.MetadataError(this, null, "Invalid data in children", childErrors);
                        this._setLastError(error)
                    };
                    MetadataSavableCollection.prototype.cancel = function() {
                        this.dataSource.forEach(function(item, index, source) {
                            if (item)
                                item.cancel()
                        });
                        this._setLastError(null)
                    };
                    MetadataSavableCollection.prototype.save = function() {
                        var _this = this;
                        var result = null;
                        var childChanged = false;
                        var childPromises;
                        this.validate();
                        if (!this.isValid)
                            result = WinJS.Promise.wrapError(this.lastError);
                        else {
                            childPromises = this.dataSource.map(function(item, index, source) {
                                var childPromise = null;
                                if (item)
                                    childPromise = item.save().then(function(childFieldDestination) {
                                        if (childFieldDestination)
                                            childChanged = true;
                                        return childFieldDestination
                                    });
                                return WinJS.Promise.as(childPromise)
                            });
                            result = WinJS.Promise.join(childPromises).then(function(childFieldDestinations) {
                                var fieldDestination = null;
                                if (_this.destination && childChanged)
                                    fieldDestination = _this.destination.convert(childFieldDestinations);
                                return WinJS.Promise.as(fieldDestination)
                            })
                        }
                        return result
                    };
                    return MetadataSavableCollection
                })(ViewModels.MetadataSavable);
            ViewModels.MetadataSavableCollection = MetadataSavableCollection
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataediterror.js:1054 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Framework = MS.Entertainment.UI.Framework;
            var MetadataError = (function(_super) {
                    __extends(MetadataError, _super);
                    function MetadataError(field, displayMessageId, message, childErrors) {
                        _super.call(this);
                        this._field = field;
                        if (displayMessageId)
                            this._displayMessage = String.load(displayMessageId);
                        else
                            this._displayMessage = String.empty;
                        if (message !== null && message !== undefined) {
                            this.name = message;
                            this.message = message
                        }
                        else {
                            this.name = this._displayMessage;
                            this.message = this._displayMessage
                        }
                    }
                    Object.defineProperty(MetadataError.prototype, "field", {
                        get: function() {
                            return this._field
                        }, set: function(value) {
                                this.updateAndNotify("field", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataError.prototype, "childErrors", {
                        get: function() {
                            this._childErrors = this._childErrors || [];
                            return this._childErrors
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataError.prototype, "displayMessage", {
                        get: function() {
                            return this._displayMessage
                        }, enumerable: true, configurable: true
                    });
                    return MetadataError
                })(Framework.ObservableBase);
            ViewModels.MetadataError = MetadataError
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataediteditors.js:1118 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var MetadataEditor = (function(_super) {
                    __extends(MetadataEditor, _super);
                    function MetadataEditor(destination) {
                        _super.call(this, destination);
                        this._parentDestination = destination;
                        this._items = {}
                    }
                    Object.defineProperty(MetadataEditor.prototype, "items", {
                        get: function() {
                            return this._items
                        }, set: function(value) {
                                this.updateAndNotify("items", value || {})
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataEditor.prototype, "destination", {
                        get: function() {
                            return this._parentDestination
                        }, enumerable: true, configurable: true
                    });
                    MetadataEditor.prototype._forAllItems = function(callback) {
                        MS.Entertainment.ViewModels.assert(callback, "Callback must be supplied to call to _forAllItems.");
                        if (this.items && callback)
                            for (var key in this.items)
                                callback(this.items[key], key)
                    };
                    MetadataEditor.prototype.validate = function() {
                        var childErrors = [];
                        this._forAllItems(function(item) {
                            if (item) {
                                item.validate();
                                if (!item.isValid)
                                    childErrors.push(item.lastError)
                            }
                        });
                        var error = null;
                        var numErrors = childErrors ? childErrors.length : 0;
                        if (numErrors)
                            error = new ViewModels.MetadataError(this, String.id.IDS_MUSIC_EDIT_METADATA_MULTI_ERROR_MESSAGE, "Metadata edit failed.", childErrors);
                        this._setLastError(error)
                    };
                    MetadataEditor.prototype.cancel = function() {
                        this._forAllItems(function(item, key) {
                            if (item)
                                item.cancel()
                        });
                        this._setLastError(null)
                    };
                    MetadataEditor.prototype.save = function() {
                        var _this = this;
                        var result = null;
                        var childPromises;
                        var childChanged = !!this.allowUnchangedSaved;
                        this.validate();
                        if (!this.isValid)
                            result = WinJS.Promise.wrapError(this.lastError);
                        else if (this.destination) {
                            childPromises = [];
                            this.destination.start();
                            this._forAllItems(function(item, key) {
                                if (item)
                                    childPromises.push(item.save().then(function(fieldDestination) {
                                        if (fieldDestination) {
                                            childChanged = true;
                                            _this.destination.write(fieldDestination)
                                        }
                                    }))
                            });
                            result = WinJS.Promise.join(childPromises).then(function() {
                                if (childChanged)
                                    return _this.destination.end();
                                else {
                                    _this.destination.cancel();
                                    return null
                                }
                            })
                        }
                        return WinJS.Promise.as(result)
                    };
                    MetadataEditor.prototype.load = function() {
                        return WinJS.Promise.as()
                    };
                    return MetadataEditor
                })(ViewModels.MetadataSavable);
            ViewModels.MetadataEditor = MetadataEditor
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataeditmediaviewmodel.js:1226 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Queries = Microsoft.Entertainment.Queries;
            var Factory = MS.Entertainment.Data.Factory;
            var MediaMetadataEditor = (function(_super) {
                    __extends(MediaMetadataEditor, _super);
                    function MediaMetadataEditor(destination) {
                        _super.call(this, destination)
                    }
                    Object.defineProperty(MediaMetadataEditor.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel)
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel([]);
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaMetadataEditor.prototype, "mediaItem", {
                        get: function() {
                            return this._mediaItem
                        }, set: function(value) {
                                this.updateAndNotify("mediaItem", value)
                            }, enumerable: true, configurable: true
                    });
                    MediaMetadataEditor.prototype.load = function() {
                        var _this = this;
                        this.viewStateViewModel.viewState = 1;
                        return this._onLoad().then(function() {
                                _this.viewStateViewModel.viewState = 2
                            }, function(error) {
                                _this.viewStateViewModel.viewState = -1;
                                return WinJS.Promise.wrapError(error)
                            })
                    };
                    MediaMetadataEditor.prototype._onLoad = function() {
                        MS.Entertainment.ViewModels.fail("MediaMetadataEditor::_onLoad not implemented");
                        return WinJS.Promise.as()
                    };
                    MediaMetadataEditor.prototype._blockOnItemsChange = function() {
                        var signal = new MS.Entertainment.UI.Framework.Signal;
                        var binding = WinJS.Binding.bind(this, {items: function() {
                                    if (binding) {
                                        signal.complete();
                                        binding.cancel();
                                        binding = null
                                    }
                                }});
                        return signal.promise
                    };
                    return MediaMetadataEditor
                })(ViewModels.MetadataEditor);
            ViewModels.MediaMetadataEditor = MediaMetadataEditor;
            var MusicMetadataEditor = (function(_super) {
                    __extends(MusicMetadataEditor, _super);
                    function MusicMetadataEditor(destination) {
                        _super.call(this, destination);
                        this._genres = null;
                        this._showSorts = false
                    }
                    Object.defineProperty(MusicMetadataEditor.prototype, "genres", {
                        get: function() {
                            return this._genres
                        }, set: function(value) {
                                this.updateAndNotify("genres", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MusicMetadataEditor.prototype, "showSorts", {
                        get: function() {
                            return this._showSorts
                        }, set: function(value) {
                                if (value !== this._showSorts) {
                                    this.updateAndNotify("showSorts", value);
                                    this._onShowSortsChanged()
                                }
                            }, enumerable: true, configurable: true
                    });
                    MusicMetadataEditor.prototype.loadGenres = function(mediaType) {
                        var _this = this;
                        var resultPromise;
                        if (this.genres)
                            resultPromise = WinJS.Promise.as(this.genres);
                        else
                            resultPromise = this.executeGenresQuery(mediaType).then(function(genres) {
                                _this.genres = genres;
                                return genres
                            });
                        return resultPromise
                    };
                    MusicMetadataEditor.prototype.executeGenresQuery = function(mediaType) {
                        var query = new MS.Entertainment.Data.Query.libraryGenres;
                        query.sort = Queries.GenresSortBy.nameAscending;
                        query.mediaType = mediaType;
                        query.chunked = false;
                        query.chunkSize = 1000;
                        return query.execute().then(function() {
                                var genres = [];
                                if (query.result && query.result.itemsArray)
                                    genres = query.result.itemsArray.map(function(genre, index, source) {
                                        return genre.name
                                    });
                                return genres
                            }, function(error) {
                                MS.Entertainment.ViewModels.fail("MusicMetadataEditor::executeGenresQuery failed to load genred. Error: " + (error && error.message));
                                return []
                            }).then(function(genres) {
                                query.dispose();
                                return genres
                            })
                    };
                    MusicMetadataEditor.prototype._onShowSortsChanged = function(){};
                    return MusicMetadataEditor
                })(MediaMetadataEditor);
            ViewModels.MusicMetadataEditor = MusicMetadataEditor;
            var MediaMetadataType = (function() {
                    function MediaMetadataType(){}
                    Object.defineProperty(MediaMetadataType, "stringValue", {
                        get: function() {
                            return new ViewModels.MetadataValueFieldType(/^.*$/, Factory.string)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaMetadataType, "year", {
                        get: function() {
                            return new ViewModels.MetadataValueFieldType(/^(175[3-9]|17[5-9][0-9]|1[8-9][0-9]{2}|[2-9][0-9]{3})$/, Factory.databaseDateFromYear, 4)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaMetadataType, "numberValue", {
                        get: function() {
                            return new ViewModels.MetadataValueFieldType(/^[0-9]+$/, Factory.intNumber)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaMetadataType, "discNumber", {
                        get: function() {
                            return new ViewModels.MetadataValueFieldType(/^[0-9]+$/, Factory.intNumber, 2)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaMetadataType, "trackNumber", {
                        get: function() {
                            return new ViewModels.MetadataValueFieldType(/^[0-9]+$/, Factory.intNumber, 3)
                        }, enumerable: true, configurable: true
                    });
                    return MediaMetadataType
                })();
            ViewModels.MediaMetadataType = MediaMetadataType;
            var MediaMetadataDestination = (function() {
                    function MediaMetadataDestination(value, propertyName, propertyFieldMask) {
                        this._value = value;
                        this._propertyName = propertyName;
                        this._propertyFieldMask = propertyFieldMask
                    }
                    Object.defineProperty(MediaMetadataDestination.prototype, "value", {
                        get: function() {
                            return this._value
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaMetadataDestination.prototype, "propertyName", {
                        get: function() {
                            return this._propertyName
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaMetadataDestination.prototype, "propertyFieldMask", {
                        get: function() {
                            return this._propertyFieldMask
                        }, enumerable: true, configurable: true
                    });
                    return MediaMetadataDestination
                })();
            ViewModels.MediaMetadataDestination = MediaMetadataDestination;
            var MediaDestinationConverterBase = (function() {
                    function MediaDestinationConverterBase(propertyName, propertyFieldMask) {
                        this._propertyName = propertyName;
                        this._propertyFieldMask = propertyFieldMask
                    }
                    Object.defineProperty(MediaDestinationConverterBase.prototype, "propertyName", {
                        get: function() {
                            return this._propertyName
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MediaDestinationConverterBase.prototype, "propertyFieldMask", {
                        get: function() {
                            return this._propertyFieldMask
                        }, enumerable: true, configurable: true
                    });
                    return MediaDestinationConverterBase
                })();
            ViewModels.MediaDestinationConverterBase = MediaDestinationConverterBase;
            var MediaMetadataFieldConverter = (function(_super) {
                    __extends(MediaMetadataFieldConverter, _super);
                    function MediaMetadataFieldConverter(type, propertyName, propertyFieldMask) {
                        _super.call(this, propertyName, propertyFieldMask);
                        this._type = null;
                        this._type = type
                    }
                    Object.defineProperty(MediaMetadataFieldConverter.prototype, "type", {
                        get: function() {
                            return this._type
                        }, enumerable: true, configurable: true
                    });
                    MediaMetadataFieldConverter.prototype.validate = function(value) {
                        var error = null;
                        if (this.type)
                            error = this.type.validate(value);
                        return error
                    };
                    MediaMetadataFieldConverter.prototype.convert = function(value) {
                        var result = null;
                        if (this.type)
                            result = new MediaMetadataDestination(this.type.convert(value), this.propertyName, this.propertyFieldMask);
                        return result
                    };
                    return MediaMetadataFieldConverter
                })(MediaDestinationConverterBase);
            ViewModels.MediaMetadataFieldConverter = MediaMetadataFieldConverter;
            var MediaMetadataCollectionConverter = (function(_super) {
                    __extends(MediaMetadataCollectionConverter, _super);
                    function MediaMetadataCollectionConverter(propertyName, propertyFieldMask) {
                        _super.call(this, propertyName, propertyFieldMask)
                    }
                    MediaMetadataCollectionConverter.prototype.convert = function(value) {
                        var array = [];
                        value = value || [];
                        value.forEach(function(fieldDestination, index, source) {
                            if (fieldDestination)
                                array.push(fieldDestination.value)
                        });
                        return new MediaMetadataDestination(array, this.propertyName, this.propertyFieldMask)
                    };
                    return MediaMetadataCollectionConverter
                })(MediaDestinationConverterBase);
            ViewModels.MediaMetadataCollectionConverter = MediaMetadataCollectionConverter;
            var MediaMetadataEditorConverter = (function() {
                    function MediaMetadataEditorConverter(){}
                    Object.defineProperty(MediaMetadataEditorConverter.prototype, "_destination", {
                        get: function() {
                            return this.__destination
                        }, set: function(value) {
                                this.__destination = value
                            }, enumerable: true, configurable: true
                    });
                    MediaMetadataEditorConverter.prototype.start = function() {
                        if (!this._destination)
                            this._onStart()
                    };
                    MediaMetadataEditorConverter.prototype._onStart = function() {
                        MS.Entertainment.ViewModels.fail("MediaMetadataEditorConverter::_onStart is not defined")
                    };
                    MediaMetadataEditorConverter.prototype.write = function(field) {
                        if (this._destination && this._destination.value && field && field instanceof MediaMetadataDestination) {
                            var mediaFieldDestination = field;
                            var value = this._destination.value;
                            value[mediaFieldDestination.propertyName] = mediaFieldDestination.value;
                            value.editedFields |= mediaFieldDestination.propertyFieldMask
                        }
                    };
                    MediaMetadataEditorConverter.prototype.end = function() {
                        var _this = this;
                        var promise = null;
                        if (this._destination)
                            promise = this._onEnd().then(function() {
                                var result = _this._destination;
                                _this._destination = null;
                                return result
                            });
                        return WinJS.Promise.as(promise)
                    };
                    MediaMetadataEditorConverter.prototype._onEnd = function() {
                        MS.Entertainment.ViewModels.fail("MediaMetadataEditorConverter::_onEnd is not defined");
                        return WinJS.Promise.as()
                    };
                    MediaMetadataEditorConverter.prototype.cancel = function() {
                        this._destination = null
                    };
                    return MediaMetadataEditorConverter
                })();
            ViewModels.MediaMetadataEditorConverter = MediaMetadataEditorConverter
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataeditimagefields.js:1521 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Framework = MS.Entertainment.UI.Framework;
            var MetadataImageValueField = (function(_super) {
                    __extends(MetadataImageValueField, _super);
                    function MetadataImageValueField(originalValue, stringId) {
                        this._imageConverter = new MetadataImageFieldValueConverter("imageUrl", Microsoft.Entertainment.Platform.FieldMask.image_URL_BIT_MASK);
                        _super.call(this, this._imageConverter);
                        if (stringId)
                            this._displayName = String.load(stringId);
                        else
                            this._displayName = String.empty;
                        this._originalValue = originalValue;
                        if (this._originalValue)
                            this.value = this._originalValue.copy()
                    }
                    Object.defineProperty(MetadataImageValueField.prototype, "destination", {
                        get: function() {
                            return this._imageConverter
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValueField.prototype, "value", {
                        get: function() {
                            return this._value
                        }, set: function(value) {
                                var _this = this;
                                if (value !== this.value) {
                                    this.updateAndNotify("value", value);
                                    var imagePromise = WinJS.Promise.as(value && value.resolveFullFilePath());
                                    imagePromise.done(function(fullFilePath) {
                                        if (value === _this.value) {
                                            _this.displayValue = fullFilePath;
                                            _this._setLastError(null)
                                        }
                                    }, function(error) {
                                        _this._setLastError(new ViewModels.MetadataError(_this, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_ALBUM_ART_LOAD_ERROR, error && error.message))
                                    })
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValueField.prototype, "savedValue", {
                        get: function() {
                            return this._savedValue
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValueField.prototype, "originalValue", {
                        get: function() {
                            return this._originalValue
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValueField.prototype, "displayName", {
                        get: function() {
                            return this._displayName
                        }, set: function(value) {
                                this.updateAndNotify("displayName", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValueField.prototype, "displayValue", {
                        get: function() {
                            return this._displayValue
                        }, set: function(value) {
                                this.updateAndNotify("displayValue", value)
                            }, enumerable: true, configurable: true
                    });
                    MetadataImageValueField.prototype.validate = function() {
                        var error = this.destination.validate(this.value);
                        this._setLastError(error)
                    };
                    MetadataImageValueField.prototype.cancel = function() {
                        this.value = this.originalValue
                    };
                    MetadataImageValueField.prototype.save = function() {
                        var _this = this;
                        var promise = null;
                        if (this.value && !this.value.isEqual(this.originalValue))
                            promise = this.value.getTemporaryImage().then(function(mediaImage) {
                                return _this.destination.convert(_this.value)
                            });
                        this.savedValue = this.value;
                        return WinJS.Promise.as(promise)
                    };
                    return MetadataImageValueField
                })(ViewModels.MetadataSavable);
            ViewModels.MetadataImageValueField = MetadataImageValueField;
            var MetadataImageFieldValueConverter = (function(_super) {
                    __extends(MetadataImageFieldValueConverter, _super);
                    function MetadataImageFieldValueConverter(propertyName, propertyFieldMask) {
                        _super.call(this, propertyName, propertyFieldMask);
                        this._type = new MetadataImageFieldValueType
                    }
                    Object.defineProperty(MetadataImageFieldValueConverter.prototype, "type", {
                        get: function() {
                            return this._type
                        }, enumerable: true, configurable: true
                    });
                    MetadataImageFieldValueConverter.prototype.validate = function(value) {
                        return this.type.validate(value)
                    };
                    MetadataImageFieldValueConverter.prototype.convert = function(value) {
                        return new ViewModels.MediaMetadataDestination(this.type.convert(value), this.propertyName, this.propertyFieldMask)
                    };
                    return MetadataImageFieldValueConverter
                })(ViewModels.MediaDestinationConverterBase);
            ViewModels.MetadataImageFieldValueConverter = MetadataImageFieldValueConverter;
            var MetadataImageFieldValueType = (function() {
                    function MetadataImageFieldValueType(){}
                    MetadataImageFieldValueType.prototype.validate = function(value) {
                        var error = null;
                        if (!value)
                            error = new ViewModels.MetadataError(null, null, "MetadataImageFieldValueType::validate() - Invalid input value");
                        else if (!value.fullFilePath && !value.storageFile)
                            error = new ViewModels.MetadataError(null, null, "MetadataImageFieldValueType::validate() - Invalid storage file and image path");
                        else if (!value.mediaItem || !value.mediaItem.inCollection)
                            error = new ViewModels.MetadataError(null, null, "MetadataImageFieldValueType::validate() - Invalid media item");
                        return error
                    };
                    MetadataImageFieldValueType.prototype.convert = function(value) {
                        return value && value.storedImage.filePath
                    };
                    return MetadataImageFieldValueType
                })();
            ViewModels.MetadataImageFieldValueType = MetadataImageFieldValueType;
            var MetadataImageValue = (function(_super) {
                    __extends(MetadataImageValue, _super);
                    function MetadataImageValue() {
                        _super.apply(this, arguments)
                    }
                    Object.defineProperty(MetadataImageValue.prototype, "storageFile", {
                        get: function() {
                            return this._storageFile
                        }, set: function(value) {
                                if (value !== this._storageFile) {
                                    this.updateAndNotify("storageFile", value);
                                    this._loadTemporaryImage()
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValue.prototype, "fullFilePath", {
                        get: function() {
                            return this.storedImage ? this.storedImage.url : String.empty
                        }, set: function(value) {
                                this.storedImage = {
                                    url: value, filePath: String.empty
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValue.prototype, "storedImage", {
                        get: function() {
                            return this._storedImage
                        }, set: function(value) {
                                if (value != this._storedImage) {
                                    var oldFullFilePath = this.fullFilePath;
                                    this.updateAndNotify("storedImage", value);
                                    this.dispatchChangeAndNotify("fullFilePath", this.fullFilePath, oldFullFilePath)
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MetadataImageValue.prototype, "mediaItem", {
                        get: function() {
                            return this._mediaItem
                        }, set: function(value) {
                                this.updateAndNotify("mediaItem", value)
                            }, enumerable: true, configurable: true
                    });
                    MetadataImageValue.prototype.getTemporaryImage = function() {
                        return WinJS.Promise.as(this._temporaryImage)
                    };
                    MetadataImageValue.prototype.resolveFullFilePath = function() {
                        var _this = this;
                        return this.getTemporaryImage().then(function() {
                                return _this.fullFilePath
                            })
                    };
                    MetadataImageValue.prototype.copy = function() {
                        var copy = new MetadataImageValue;
                        copy.mediaItem = this.mediaItem;
                        copy.storedImage = this.storedImage;
                        copy.storageFile = this.storageFile;
                        return copy
                    };
                    MetadataImageValue.prototype.isEqual = function(value) {
                        return value && value.fullFilePath === this.fullFilePath
                    };
                    MetadataImageValue.prototype._loadTemporaryImage = function() {
                        var _this = this;
                        if (this._temporaryImage) {
                            this._temporaryImage.cancel();
                            this._temporaryImage = null
                        }
                        if (this.mediaItem && this.mediaItem.inCollection && this.storageFile) {
                            var imageManager = new Microsoft.Entertainment.ImageManager;
                            var innerPromise = imageManager.copyFileToImageStoreAsync(this.storageFile);
                            this._temporaryImage = new WinJS.Promise(function(c, e, p) {
                                if (MetadataImageValue.forceFailures)
                                    c = e;
                                innerPromise.done(c, e)
                            }, function() {
                                innerPromise.cancel()
                            });
                            this._temporaryImage.done(function(result) {
                                _this.storedImage = result
                            }, function(error) {
                                if (!error || error.name !== "Canceled") {
                                    _this.storedImage = null;
                                    _this.storageFile = null
                                }
                            })
                        }
                    };
                    MetadataImageValue.createFromAlbum = function(album) {
                        var value = new MetadataImageValue;
                        if (album) {
                            if (album.imageResizeUri)
                                value.fullFilePath = MS.Entertainment.UI.Shell.ImageLoader.appendResizeParameters(album.imageResizeUri, MetadataImageValue.displayWidth, MetadataImageValue.displayHeight);
                            else
                                value.fullFilePath = album.imageUri || MS.Entertainment.UI.ImagePaths.missingAlbum150;
                            value.mediaItem = album
                        }
                        return value
                    };
                    MetadataImageValue.displayWidth = 120;
                    MetadataImageValue.displayHeight = 120;
                    MetadataImageValue.forceFailures = false;
                    return MetadataImageValue
                })(Framework.ObservableBase);
            ViewModels.MetadataImageValue = MetadataImageValue
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataeditalbumviewmodel.js:1769 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Platform = Microsoft.Entertainment.Platform;
            var Queries = Microsoft.Entertainment.Queries;
            var Utilities = MS.Entertainment.Utilities;
            var Query = MS.Entertainment.Data.Query;
            var AlbumMetadataEditor = (function(_super) {
                    __extends(AlbumMetadataEditor, _super);
                    function AlbumMetadataEditor(source) {
                        _super.call(this, new AlbumMetadataEditorConverter(source && source.libraryId));
                        this._source = null;
                        this._source = source
                    }
                    Object.defineProperty(AlbumMetadataEditor.prototype, "album", {
                        get: function() {
                            return this._source
                        }, enumerable: true, configurable: true
                    });
                    AlbumMetadataEditor.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        this._disposeImageFieldHandlers()
                    };
                    AlbumMetadataEditor.prototype._disposeImageFieldHandlers = function() {
                        if (this._imageFieldHandlers) {
                            this._imageFieldHandlers.cancel();
                            this._imageFieldHandlers = null
                        }
                    };
                    AlbumMetadataEditor.prototype._onShowSortsChanged = function() {
                        _super.prototype._onShowSortsChanged.call(this);
                        var showSortsEnabled = this.showSorts;
                        var trackEditors = WinJS.Utilities.getMember("items.tracks.dataSource", this);
                        if (trackEditors)
                            trackEditors.forEach(function(trackEditor) {
                                trackEditor.showSorts = showSortsEnabled
                            })
                    };
                    AlbumMetadataEditor.prototype._onLoad = function() {
                        var _this = this;
                        var loadPromise = null;
                        if (this._source && Utilities.isValidLibraryId(this._source.libraryId)) {
                            var album;
                            var query = new Query.Music.LibraryAlbumWithTracks;
                            var albumGenres = [];
                            var trackGenres = [];
                            var tracksField;
                            query.id = this._source.libraryId;
                            loadPromise = this.loadGenres(Queries.GenresQueryMediaType.album).then(function(genresResult) {
                                albumGenres = genresResult;
                                return _this.executeGenresQuery(Queries.GenresQueryMediaType.track)
                            }).then(function(genresResult) {
                                trackGenres = genresResult;
                                return query.execute()
                            }).then(function() {
                                var tracks = [];
                                album = (query.result && query.result.item);
                                _this.mediaItem = album;
                                if (album && album.tracks)
                                    tracks = album.tracks.toArrayAll();
                                return tracks
                            }).then(function(tracks) {
                                var trackLoadPromises = [];
                                tracks = tracks || [];
                                tracksField = new ViewModels.MetadataSavableCollection(new ViewModels.MediaMetadataCollectionConverter("trackMetadata", Platform.FieldMask.tracks_BIT_MASK));
                                tracks.forEach(function(track, index, source) {
                                    var albumTrackEditor = new ViewModels.AlbumTrackMetadataEditor(track);
                                    albumTrackEditor.genres = trackGenres;
                                    trackLoadPromises.push(albumTrackEditor.load());
                                    tracksField.dataSource.push(albumTrackEditor)
                                });
                                return WinJS.Promise.join(trackLoadPromises)
                            }).then(function() {
                                var itemsChangedPromise = _this._blockOnItemsChange();
                                _this._disposeImageFieldHandlers();
                                _this.items = {
                                    name: new ViewModels.MetadataValueField(album.name, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_TITLE, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "title", Platform.FieldMask.title_BIT_MASK)), sortName: new ViewModels.MetadataValueField(album.sortName, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_SORT_TITLE, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "sortTitle", Platform.FieldMask.sort_TITLE_BIT_MASK)), artistName: new ViewModels.MetadataValueField(album.artist ? album.artist.name : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_ARTIST, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "artist", Platform.FieldMask.artist_BIT_MASK)), sortArtist: new ViewModels.MetadataValueField(album.artist ? album.artist.sortName : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_SORT_ARTIST, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "sortArtist", Platform.FieldMask.sort_ARTIST_BIT_MASK)), genre: new ViewModels.MetadataMultipleValuesField(album.genreName, albumGenres, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_GENRE, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_GENRE_CUSTOM, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "genre", Platform.FieldMask.genre_BIT_MASK)), year: new ViewModels.MetadataValueField(album.releaseDate ? album.releaseDate.getUTCFullYear() + String.empty : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_RELEASE_YEAR, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.year, "releaseDate", Platform.FieldMask.release_DATE_BIT_MASK)), image: new ViewModels.MetadataImageValueField(ViewModels.MetadataImageValue.createFromAlbum(album), String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_ALBUM_ART_LABEL), tracks: tracksField, firstTrack: tracksField && tracksField.dataSource[0]
                                };
                                _this._imageFieldHandlers = MS.Entertainment.Utilities.addEventHandlers(_this.items.image, {lastErrorChanged: _this._handleImageErrorChanged.bind(_this)});
                                query.dispose();
                                return itemsChangedPromise
                            }, function(error) {
                                query.dispose();
                                return WinJS.Promise.wrapError(error)
                            })
                        }
                        return WinJS.Promise.as(loadPromise)
                    };
                    AlbumMetadataEditor.prototype._handleImageErrorChanged = function() {
                        var field = this.items && this.items.image;
                        var error = field && field.lastError;
                        if (error)
                            this._setLastError(error);
                        else if (this.lastError && this.lastError.field === field)
                            this._setLastError(null)
                    };
                    return AlbumMetadataEditor
                })(ViewModels.MusicMetadataEditor);
            ViewModels.AlbumMetadataEditor = AlbumMetadataEditor;
            var AlbumMetadataEditorConverter = (function(_super) {
                    __extends(AlbumMetadataEditorConverter, _super);
                    function AlbumMetadataEditorConverter(libraryId) {
                        _super.call(this);
                        this._libraryId = libraryId
                    }
                    AlbumMetadataEditorConverter.prototype._onStart = function() {
                        var albumMetadata = new Platform.AlbumMetadata;
                        this._destination = new ViewModels.MediaMetadataDestination(albumMetadata)
                    };
                    AlbumMetadataEditorConverter.prototype._onEnd = function() {
                        var promise = null;
                        if (Utilities.isValidLibraryId(this._libraryId) && this._destination && this._destination instanceof ViewModels.MediaMetadataDestination) {
                            var destination = this._destination;
                            var mediaStore = new Platform.MediaStore;
                            var albumProvider = mediaStore.albumProvider;
                            promise = albumProvider.updateAlbumMetadataAsync(destination.value, Platform.RequestType.userEditRequest, this._libraryId).then(function(){})
                        }
                        return WinJS.Promise.as(promise)
                    };
                    return AlbumMetadataEditorConverter
                })(ViewModels.MediaMetadataEditorConverter);
            ViewModels.AlbumMetadataEditorConverter = AlbumMetadataEditorConverter
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/music1/metadataedittrackviewmodel.js:1912 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Platform = Microsoft.Entertainment.Platform;
            var Queries = Microsoft.Entertainment.Queries;
            var Utilities = MS.Entertainment.Utilities;
            var Query = MS.Entertainment.Data.Query;
            var AlbumTrackMetadataEditor = (function(_super) {
                    __extends(AlbumTrackMetadataEditor, _super);
                    function AlbumTrackMetadataEditor(source) {
                        _super.call(this, new TrackMetadataEditorConverter(source && source.libraryId));
                        this._source = null;
                        this._source = source
                    }
                    AlbumTrackMetadataEditor.prototype._onLoad = function() {
                        var _this = this;
                        var loadPromise;
                        this.mediaItem = this._source;
                        if (this._source)
                            loadPromise = this.loadGenres(Queries.GenresQueryMediaType.track).then(function(trackGenres) {
                                var track = _this._source;
                                var itemsChangedPromise = _this._blockOnItemsChange();
                                _this.items = {
                                    trackNumber: new ViewModels.MetadataValueField(track.trackNumber + String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_TRACK_NUMBER, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.trackNumber, "trackNumber", Platform.FieldMask.track_NUMBER_BIT_MASK)), name: new ViewModels.MetadataValueField(track.name, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_TRACK_TITLE, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "title", Platform.FieldMask.title_BIT_MASK)), sortName: new ViewModels.MetadataValueField(track.sortName, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_SONG_SORT_TITLE, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "sortTitle", Platform.FieldMask.sort_TITLE_BIT_MASK)), artistName: new ViewModels.MetadataValueField(track.artist ? track.artist.name : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_SONG_ARTIST, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "artist", Platform.FieldMask.artist_BIT_MASK)), sortArtist: new ViewModels.MetadataValueField(track.artist ? track.artist.sortName : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_SONG_SORT_ARTIST, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "sortArtist", Platform.FieldMask.sort_ARTIST_BIT_MASK)), genre: new ViewModels.MetadataMultipleValuesField(track.genreName, trackGenres, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_SONG_GENRE, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_GENRE_CUSTOM, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "genre", Platform.FieldMask.genre_BIT_MASK)), disc: new ViewModels.MetadataValueField(track.discNumber + String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_DISC_NUMBER, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.discNumber, "discNumber", Platform.FieldMask.disc_NUMBER_BIT_MASK)), year: new ViewModels.MetadataValueField(track.releaseDate ? track.releaseDate.getUTCFullYear() + String.empty : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_RELEASE_YEAR, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.year, "releaseDate", Platform.FieldMask.release_DATE_BIT_MASK))
                                };
                                return itemsChangedPromise
                            });
                        return WinJS.Promise.as(loadPromise)
                    };
                    return AlbumTrackMetadataEditor
                })(ViewModels.MusicMetadataEditor);
            ViewModels.AlbumTrackMetadataEditor = AlbumTrackMetadataEditor;
            var TrackMetadataEditor = (function(_super) {
                    __extends(TrackMetadataEditor, _super);
                    function TrackMetadataEditor(source) {
                        _super.call(this, new TrackToAlbumMetadataEditorConverter(source && source.libraryId));
                        this._source = null;
                        this._source = source
                    }
                    TrackMetadataEditor.prototype._onShowSortsChanged = function() {
                        _super.prototype._onShowSortsChanged.call(this);
                        var showSortsEnabled = this.showSorts;
                        var trackEditor = WinJS.Utilities.getMember("items.track", this);
                        if (trackEditor)
                            trackEditor.showSorts = showSortsEnabled
                    };
                    TrackMetadataEditor.prototype._onLoad = function() {
                        var _this = this;
                        var loadPromise;
                        this.mediaItem = this._source;
                        if (this._source && Utilities.isValidLibraryId(this._source.libraryId)) {
                            var track;
                            var album;
                            var trackQuery = new Query.Music.LibraryTrack;
                            var albumQuery = new Query.Music.LibraryAlbum;
                            var albumGenres = [];
                            var trackGenres = [];
                            var tracksField;
                            trackQuery.trackId = this._source.libraryId;
                            loadPromise = this.loadGenres(Queries.GenresQueryMediaType.album).then(function(genresResult) {
                                albumGenres = genresResult;
                                return _this.executeGenresQuery(Queries.GenresQueryMediaType.track)
                            }).then(function(genresResult) {
                                trackGenres = genresResult;
                                return trackQuery.execute()
                            }).then(function() {
                                track = (trackQuery.result && trackQuery.result.item);
                                albumQuery.albumId = track && track.album && track.album.libraryId;
                                return albumQuery.execute()
                            }).then(function() {
                                album = (albumQuery.result && albumQuery.result.item);
                                tracksField = new ViewModels.MetadataSavableCollection(new ViewModels.MediaMetadataCollectionConverter("trackMetadata", Platform.FieldMask.tracks_BIT_MASK));
                                var albumTrackEditor = new AlbumTrackMetadataEditor(track);
                                albumTrackEditor.genres = trackGenres;
                                albumTrackEditor.allowUnchangedSaved = true;
                                tracksField.dataSource.push(albumTrackEditor);
                                return albumTrackEditor.load()
                            }).then(function() {
                                var itemsChangedPromise = _this._blockOnItemsChange();
                                var trackField = tracksField.dataSource[0];
                                _this.items = {
                                    albumName: new ViewModels.MetadataValueField(album.name, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_TITLE, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "title", Platform.FieldMask.title_BIT_MASK)), albumSortName: new ViewModels.MetadataValueField(album.sortName, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_SORT_TITLE, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "sortTitle", Platform.FieldMask.sort_TITLE_BIT_MASK)), albumArtistName: new ViewModels.MetadataValueField(album.artist ? album.artist.name : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_ARTIST, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "artist", Platform.FieldMask.artist_BIT_MASK)), albumArtistSortName: new ViewModels.MetadataValueField(album.artist ? album.artist.sortName : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_SORT_ARTIST, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "sortArtist", Platform.FieldMask.sort_ARTIST_BIT_MASK)), albumYear: new ViewModels.MetadataValueField(album.releaseDate ? album.releaseDate.getUTCFullYear() + String.empty : String.empty, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_RELEASE_YEAR, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.year, "releaseDate", Platform.FieldMask.release_DATE_BIT_MASK)), albumGenre: new ViewModels.MetadataMultipleValuesField(album.genreName, albumGenres, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_GENRE, String.id.IDS_MUSIC_EDIT_METADATA_DIALOG_FIELD_ALBUM_GENRE_CUSTOM, new ViewModels.MediaMetadataFieldConverter(ViewModels.MediaMetadataType.stringValue, "genre", Platform.FieldMask.genre_BIT_MASK)), tracks: tracksField, track: trackField
                                };
                                trackQuery.dispose();
                                albumQuery.dispose();
                                return itemsChangedPromise
                            }, function(error) {
                                trackQuery.dispose();
                                albumQuery.dispose();
                                return WinJS.Promise.wrapError(error)
                            })
                        }
                        return WinJS.Promise.as(loadPromise)
                    };
                    return TrackMetadataEditor
                })(ViewModels.MusicMetadataEditor);
            ViewModels.TrackMetadataEditor = TrackMetadataEditor;
            var TrackMetadataEditorConverter = (function(_super) {
                    __extends(TrackMetadataEditorConverter, _super);
                    function TrackMetadataEditorConverter(libraryId) {
                        _super.call(this);
                        this._libraryId = libraryId
                    }
                    TrackMetadataEditorConverter.prototype._onStart = function() {
                        var trackMetadata = new Platform.TrackMetadata;
                        trackMetadata.requestId = this._libraryId + String.empty;
                        this._destination = new ViewModels.MediaMetadataDestination(trackMetadata)
                    };
                    TrackMetadataEditorConverter.prototype._onEnd = function() {
                        return WinJS.Promise.as()
                    };
                    return TrackMetadataEditorConverter
                })(ViewModels.MediaMetadataEditorConverter);
            ViewModels.TrackMetadataEditorConverter = TrackMetadataEditorConverter;
            var TrackToAlbumMetadataEditorConverter = (function(_super) {
                    __extends(TrackToAlbumMetadataEditorConverter, _super);
                    function TrackToAlbumMetadataEditorConverter(libraryId) {
                        _super.call(this);
                        this._libraryId = libraryId
                    }
                    TrackToAlbumMetadataEditorConverter.prototype._onStart = function() {
                        var albumMetadata = new Platform.AlbumMetadata;
                        this._destination = new ViewModels.MediaMetadataDestination(albumMetadata)
                    };
                    TrackToAlbumMetadataEditorConverter.prototype._onEnd = function() {
                        var promise = null;
                        if (Utilities.isValidLibraryId(this._libraryId) && this._destination && this._destination instanceof ViewModels.MediaMetadataDestination) {
                            var destination = this._destination;
                            var mediaStore = new Platform.MediaStore;
                            var trackProvider = mediaStore.trackProvider;
                            promise = trackProvider.updateTracksMetadataAsync(destination.value, Platform.RequestType.userEditRequest).then(function(){})
                        }
                        return WinJS.Promise.as(promise)
                    };
                    return TrackToAlbumMetadataEditorConverter
                })(ViewModels.MediaMetadataEditorConverter);
            ViewModels.TrackToAlbumMetadataEditorConverter = TrackToAlbumMetadataEditorConverter
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
})();
/* >>>>>>/components/music1/musicmetadataeditdialog.js:2070 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var MusicMetadataEditDialogContent = (function(_super) {
                        __extends(MusicMetadataEditDialogContent, _super);
                        function MusicMetadataEditDialogContent() {
                            _super.apply(this, arguments)
                        }
                        MusicMetadataEditDialogContent.prototype.initialize = function() {
                            var _this = this;
                            _super.prototype.initialize.call(this);
                            var sortToggleSwitchElement = this.domElement.querySelector(".sortToggleSwitch-toggleSwitch");
                            if (sortToggleSwitchElement) {
                                this._sortToggleSwitch = sortToggleSwitchElement.winControl;
                                this._sortToggleSwitchEventHandler = MS.Entertainment.Utilities.addEventHandlers(sortToggleSwitchElement, {change: function() {
                                        return _this._updateSortsEnabled()
                                    }})
                            }
                            var metadataList = this.domElement.querySelector("[data-ent-type='metadataList']");
                            if (metadataList)
                                this._list = metadataList.winControl
                        };
                        Object.defineProperty(MusicMetadataEditDialogContent.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    this.updateAndNotify("dataContext", value)
                                }, enumerable: true, configurable: true
                        });
                        MusicMetadataEditDialogContent.prototype._updateSortsEnabled = function() {
                            var _this = this;
                            if (this.dataContext && this._sortToggleSwitch)
                                this.dataContext.showSorts = this._sortToggleSwitch.checked;
                            if (this._list) {
                                this._list.recalculateSize();
                                WinJS.Promise.timeout().done(function() {
                                    _this._list.recalculateSize()
                                })
                            }
                        };
                        return MusicMetadataEditDialogContent
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.MusicMetadataEditDialogContent = MusicMetadataEditDialogContent
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.MusicMetadataEditDialogContent)
})();
/* >>>>>>/components/music1/albummetadataeditdialog.js:2138 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var AlbumMetadataEditDialogContent = (function(_super) {
                        __extends(AlbumMetadataEditDialogContent, _super);
                        function AlbumMetadataEditDialogContent(element, options) {
                            this.templateStorage = "/Components/Music1/AlbumMetadataEditDialog.html";
                            this.templateName = "templateid-metadataEditorDialogContent";
                            _super.call(this, element, options)
                        }
                        return AlbumMetadataEditDialogContent
                    })(Controls.MusicMetadataEditDialogContent);
                Controls.AlbumMetadataEditDialogContent = AlbumMetadataEditDialogContent
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.AlbumMetadataEditDialogContent)
})();
/* >>>>>>/components/music1/trackmetadataeditdialog.js:2176 */
(function() {
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
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");

(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var TrackMetadataEditDialogContent = (function(_super) {
                        __extends(TrackMetadataEditDialogContent, _super);
                        function TrackMetadataEditDialogContent(element, options) {
                            this.templateStorage = "/Components/Music1/TrackMetadataEditDialog.html";
                            this.templateName = "templateid-metadataEditorDialogContent";
                            _super.call(this, element, options)
                        }
                        return TrackMetadataEditDialogContent
                    })(Controls.MusicMetadataEditDialogContent);
                Controls.TrackMetadataEditDialogContent = TrackMetadataEditDialogContent
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.TrackMetadataEditDialogContent)
})();
