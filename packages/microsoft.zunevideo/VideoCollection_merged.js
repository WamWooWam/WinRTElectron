/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/framework/shell.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";

    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Shell");
    WinJS.Namespace.define("MS.Entertainment.UI.Shell", {
        showDialog: function showDialog(title, userControl, options) {
            if (!title)
                throw"showDialog: title parameter is mandatory";
            if (!userControl)
                throw"showDialog: userControl parameter is mandatory";
            options = options ? options : {};
            options.title = title;
            options.userControl = userControl;
            var dialogElement = document.createElement("div");
            dialogElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.Dialog");
            var dialog = new MS.Entertainment.UI.Controls.Dialog(dialogElement, options);
            return dialog.show()
        }, createOverlay: function createOverlay(userControl, userControlOptions, overlayOptions) {
                var options = overlayOptions || {};
                options.userControl = userControl;
                options.userControlOptions = userControlOptions;
                var overlayElement = document.createElement("div");
                overlayElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.Overlay");
                return new MS.Entertainment.UI.Controls.Overlay(overlayElement, options)
            }, showMessageBox: function showMessageBox(title, description, options) {
                if (!title)
                    throw"showMessageBox: title parameter is mandatory";
                if (!description)
                    throw"showMessageBox: description parameter is mandatory";
                options = options ? options : {};
                options.userControlOptions = {description: description};
                return MS.Entertainment.UI.Shell.showDialog(title, "MS.Entertainment.UI.Controls.MessageBox", options)
            }, showMessageLinkBox: function showMessageLinkBox(title, description, webLink) {
                if (!title)
                    throw"showMessageLinkBox: title parameter is mandatory";
                if (!description)
                    throw"showMessageLinkBox: description parameter is mandatory";
                if (!webLink)
                    throw"showMessageLinkBox: webLink parameter is mandatory";
                var options = {};
                options.userControlOptions = {
                    description: description, webLink: webLink
                };
                return MS.Entertainment.UI.Shell.showDialog(title, "MS.Entertainment.UI.Controls.MessageLinkBox", options)
            }, showFeedbackDialog: function showFeedbackDialog() {
                MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_SETTINGS_FEEDBACK_TITLE), "MS.Entertainment.UI.Controls.UserFeedbackDialog", {
                    width: null, height: null, buttons: [], customStyle: "wecDialog_feedback", persistOnNavigate: true
                })
            }, showRegionMismatchDialog: function showRegionMismatchDialog(title, description) {
                if (description.indexOf("{0}") < 0 || description.indexOf("{1}") < 0) {
                    MS.Entertainment.UI.Shell.fail("showRegionMismatchDialog requires two string placeholders in description to function properly");
                    return WinJS.Promise.wrapError()
                }
                var appRegionCode = (new Microsoft.Entertainment.Util.GlobalizationManager).getRegion();
                var machineRegionCode = (new Windows.Globalization.GeographicRegion).codeTwoLetter;
                var appRegionName = (new Windows.Globalization.GeographicRegion(appRegionCode)).displayName;
                var machineRegionName = (new Windows.Globalization.GeographicRegion(machineRegionCode)).displayName;
                var regionUnavailableDescription = description.format(appRegionName, machineRegionName);
                return MS.Entertainment.UI.Shell.showMessageBox(title, regionUnavailableDescription).then(function completed() {
                        return {
                                appRegionCode: appRegionCode, machineRegionCode: machineRegionCode
                            }
                    })
            }, navigateBackAndShowMessageBox: function navigateBackAndShowMessageBox(title, description) {
                Trace.assert(title, "navigateBackAndShowMessageBox: title is null or undefined");
                Trace.assert(description, "navigateBackAndShowMessageBox: description is null or undefined");
                var promise;
                var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                if (uiState.isSnapped && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.winJSNavigation))
                    promise = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.winJSNavigation).navigateToDefault();
                else
                    promise = MS.Entertainment.UI.Shell.showMessageBox(title, description).then(function() {
                        var navigateBackPromise;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.winJSNavigation))
                            navigateBackPromise = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.winJSNavigation).navigateBack();
                        return WinJS.Promise.as(navigateBackPromise)
                    });
                return WinJS.Promise.as(promise)
            }, showAppUpdateDialog: function showAppUpdateDialog() {
                var cancelConfirmDialogButtons = [{
                            title: String.load(String.id.IDS_VERSION_CHECK_UPGRADE_LINK), execute: function onOk(overlay) {
                                    MS.Entertainment.Utilities.launchStoreUpdatePage();
                                    overlay.hide()
                                }
                        }, {
                            title: String.load(String.id.IDS_CANCEL_BUTTON), execute: function onCancel(overlay) {
                                    overlay.hide()
                                }
                        }];
                return MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_VERSION_CHECK_SERVICE_TITLE), String.load(String.id.IDS_VERSION_CHECK_SERVICE_FOR_FEATURES_TEXT), {
                        buttons: cancelConfirmDialogButtons, defaultButtonIndex: 0, cancelButtonIndex: 1
                    })
            }, showWebHostDialog: function showWebHostDialog(title, dialogOptions, userControlOptions) {
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (MS.Entertainment.Utilities.isApp2 && !MS.Entertainment.isAppModeOverride && userControlOptions.offer)
                    return MS.Entertainment.UI.Shell.ModernWebBlend.showModernPurchaseFlowAsync(userControlOptions.offer);
                else {
                    var buttons = [];
                    dialogOptions.title = title;
                    userControlOptions.title = title;
                    dialogOptions.userControlOptions = userControlOptions;
                    dialogOptions.buttons = buttons;
                    dialogOptions.defaultButtonIndex = -1;
                    var webHostDialogElement = document.createElement("div");
                    webHostDialogElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.WebHostDialog");
                    var dialog = new MS.Entertainment.UI.Controls.WebHostDialog(webHostDialogElement, dialogOptions);
                    return dialog.show()
                }
            }, uiStateEventShowSearchFlyoutHandler: null, showSearchFlyout: function showSearchFlyout() {
                if (MS.Entertainment.UI.Shell.uiStateEventShowSearchFlyoutHandler) {
                    MS.Entertainment.UI.Shell.uiStateEventShowSearchFlyoutHandler.cancel();
                    MS.Entertainment.UI.Shell.uiStateEventShowSearchFlyoutHandler = null
                }
                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                if (uiStateService.stageThreeActivated)
                    if (!Windows.ApplicationModel.Search.Core) {
                        MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithUIPath(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.SearchGlyphClick);
                        var searchAction = new MS.Entertainment.UI.Actions.SearchAction;
                        return searchAction.execute()
                    }
                    else {
                        var height = "100px";
                        var bottom = "auto";
                        var template = "MS.Entertainment.UI.Controls.SearchFlyout";
                        var _centeredStyle = "calc(50% - {0}px)";
                        var top = _centeredStyle.format(parseInt(height) / 2);
                        var overlayOptions = {
                                left: "20%", bottom: bottom, right: "20%", top: top, dontWaitForContent: true, enableKeyboardLightDismiss: true
                            };
                        var openPopup = MS.Entertainment.UI.Shell.createOverlay(template, {}, overlayOptions);
                        return openPopup.show()
                    }
                else
                    MS.Entertainment.UI.Shell.uiStateEventShowSearchFlyoutHandler = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {stageThreeActivatedChanged: function stageThreeActivatedChanged(e) {
                            if (e.detail.newValue)
                                MS.Entertainment.UI.Shell.showSearchFlyout()
                        }.bind(this)})
            }, showError: (function() {
                var _displayedErrors = [];
                var displayError = function displayError(caption, description, errorCode, webUrlPromise, subTitle, additionalButton) {
                        var errorId = description;
                        if (errorCode)
                            errorId = errorCode;
                        var isErrorDisplayed = false;
                        for (var i = 0; i < _displayedErrors.length; i++)
                            if (_displayedErrors[i] === errorId) {
                                isErrorDisplayed = true;
                                break
                            }
                        if (!isErrorDisplayed) {
                            _displayedErrors.push(errorId);
                            var bottomRowAdditionalText = MS.Entertainment.Utilities.isApp2 ? String.empty : errorCode;
                            var options = {
                                    description: description, errorCode: errorCode, webLinkPromise: webUrlPromise, subTitle: subTitle ? subTitle : String.empty, showLinks: !MS.Entertainment.Utilities.isApp2, showErrorCodeInContent: MS.Entertainment.Utilities.isApp2, additionalButton: additionalButton
                                };
                            return MS.Entertainment.UI.Shell.showDialog(caption, "MS.Entertainment.UI.Controls.ErrorDialog", {
                                    buttonRowAdditionalText: bottomRowAdditionalText, userControlOptions: options, persistOnNavigate: true
                                }).then(function() {
                                    for (var i = 0; i < _displayedErrors.length; i++)
                                        if (_displayedErrors[i] === errorId) {
                                            _displayedErrors.splice(i, 1);
                                            break
                                        }
                                })
                        }
                        else
                            return WinJS.Promise.wrap()
                    };
                var formatError = function formatError(errorCode, mappedErrorCode, message) {
                        switch (errorCode) {
                            case MS.Entertainment.Utilities.SignInErrors.NS_E_SIGNIN_INVALID_REGION:
                                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                var lastAccountRegion = configurationManager.service.lastSignInAccountRegion;
                                if (lastAccountRegion)
                                    return message.format((new Windows.Globalization.GeographicRegion(lastAccountRegion)).displayName);
                                else {
                                    MS.Entertainment.UI.Shell.assert(false, "lastAccountRegion was not defined");
                                    return message
                                }
                                break
                        }
                        {};
                        switch (mappedErrorCode) {
                            case Microsoft.Entertainment.Sync.CollectionSyncError.syncError:
                                return String.load(String.id.IDS_CLOUD_SYNC_ERROR_DIALOG_MESSAGE);
                            case MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_CANT_PLAYTO.code:
                                return String.load(String.id.IDS_MUSIC_PLAY_TO_STREAMING_ERROR_TEXT);
                            case MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_CANT_PLAYTO_PREMIUM.code:
                                return String.load(String.id.IDS_MUSIC_PLAY_TO_PREMIUM_STREAMING_ERROR_TEXT);
                            case MS.Entertainment.Platform.Playback.Error.ZEST_E_DEVICE_ACTIVATION_LIMIT_EXCEEDED.code:
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay) && !featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription))
                                    return String.load(String.id.IDS_ACTIVATION_LIMIT_EXCEEDED_DTO);
                                return message;
                            case MS.Entertainment.Platform.Playback.Error.ZUNE_E_DOWNLOAD_LIBRARY_DISK_FULL.code:
                            case MS.Entertainment.Platform.Playback.Error.ZUNE_E_DOWNLOAD_SYSTEM_DISK_FULL.code:
                                return String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_LOW_DISK_SPACE_LONG);
                            default:
                                return message
                        }
                    };
                var toHexString = function toHexString(value) {
                        if (value < 0)
                            value += 0xFFFFFFFF + 1;
                        return "0x" + value.toString(16)
                    };
                return function showError(caption, error, subTitle, postpendedText, additionalButton) {
                        var errorMapper = new Microsoft.Entertainment.Util.ErrorMapper;
                        var mappedError = errorMapper.getMappedError(error);
                        var hexError = toHexString(mappedError.error) + " (" + toHexString(error) + ")";
                        var errorMessage = formatError(error, mappedError.error, mappedError.description);
                        if (postpendedText)
                            errorMessage += ("\n" + postpendedText);
                        var originalErrorQuery = new MS.Entertainment.Data.Query.errorCodeWrapperQuery(error);
                        var mappedErrorQueryPromise = function mappedErrorQueryPromise() {
                                var mappedErrorQuery = new MS.Entertainment.Data.Query.errorCodeWrapperQuery(mappedError.error);
                                return mappedErrorQuery.execute().then(function mappedErrorQueryComplete(query) {
                                        if (query && query.result && query.result.exactMatches)
                                            return query.result.errorCodeUrl;
                                        else
                                            return mappedError.webUrl
                                    }, function mappedErrorQueryFailed(event) {
                                        if (event && event.message === "Canceled") {
                                            var networkStatus = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus;
                                            MS.Entertainment.UI.Shell.fail("Error Code Lookup request canceled.  Network status is: " + networkStatus, null, MS.Entertainment.UI.Debug.errorLevel.low)
                                        }
                                        return mappedError.webUrl
                                    })
                            };
                        var errorQuery = originalErrorQuery.execute().then(function originalErrorQueryComplete(query) {
                                if (query && query.result && query.result.exactMatches)
                                    return query.result.errorCodeUrl;
                                else
                                    return mappedErrorQueryPromise()
                            }, function originalErrorQueryFailed() {
                                return mappedErrorQueryPromise()
                            });
                        return displayError(caption, errorMessage, hexError, errorQuery, subTitle, additionalButton)
                    }
            })()
    })
})()
})();
/* >>>>>>/controls/video_win/videocollection.js:248 */
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
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                var VideoCollectionHeaderControl = (function(_super) {
                        __extends(VideoCollectionHeaderControl, _super);
                        function VideoCollectionHeaderControl(element, options) {
                            _super.call(this, element, options);
                            this._isBackButtonVisible = true;
                            this._videoContextBindings = WinJS.Binding.bind(this, {dataContext: {isChildFolder: this._updateBackButtonVisibility.bind(this)}})
                        }
                        Object.defineProperty(VideoCollectionHeaderControl.prototype, "isBackButtonVisible", {
                            get: function() {
                                return this._isBackButtonVisible
                            }, set: function(value) {
                                    this.updateAndNotify("isBackButtonVisible", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(VideoCollectionHeaderControl.prototype, "videoCollectionQueryViewModel", {
                            get: function() {
                                return this.dataContext
                            }, enumerable: true, configurable: true
                        });
                        VideoCollectionHeaderControl.prototype._updateBackButtonVisibility = function() {
                            this.isBackButtonVisible = (this.videoCollectionQueryViewModel ? this.videoCollectionQueryViewModel.isChildFolder : true)
                        };
                        VideoCollectionHeaderControl.prototype.onBackButtonClicked = function(event) {
                            if (!MS.Entertainment.Utilities.isInvocationEvent(event))
                                return;
                            if (this.videoCollectionQueryViewModel && this.videoCollectionQueryViewModel.goToParentFolder)
                                this.videoCollectionQueryViewModel.goToParentFolder()
                        };
                        return VideoCollectionHeaderControl
                    })(MS.Entertainment.UI.Controls.HeaderControl);
                Controls.VideoCollectionHeaderControl = VideoCollectionHeaderControl
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.VideoCollectionHeaderControl)
})();
/* >>>>>>/viewmodels/video_win/videocollectionviewmodel.js:306 */
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
    (function(Entertainment) {
        (function(ViewModels) {
            var Data = MS.Entertainment.Data;
            var UI = MS.Entertainment.UI;
            (function(VideoCollectionLXTemplates) {
                var VideoCollectionLXTemplateBase = (function() {
                        function VideoCollectionLXTemplateBase() {
                            this.itemTemplate = "select(.templateid-collectionOtherVerticalTile)";
                            this.layout = UI.Controls.GalleryControl && UI.Controls.GalleryControl.Layout.grid;
                            this.orientation = UI.Controls.GalleryControl && UI.Controls.GalleryControl.Orientation.vertical;
                            this.zoomedOutLayout = UI.Controls.GalleryControl && UI.Controls.GalleryControl.ZoomedOutLayout.list;
                            this.headerPosition = UI.Controls.GalleryControl && UI.Controls.GalleryControl.HeaderPosition.top;
                            this.maxRows = NaN;
                            this.minimumListLength = 1;
                            this.forceInteractive = true;
                            this.delayHydrateLibraryId = false;
                            this.selectionStyleFilled = false;
                            this.allowSelectAll = false;
                            this.allowZoom = false;
                            this.itemsDraggable = false;
                            this.swipeBehavior = UI.Controls.GalleryControl && UI.Controls.GalleryControl.swipeBehavior.none;
                            this.invokeBehavior = UI.Controls.GalleryControl && UI.Controls.GalleryControl.InvokeBehavior.action;
                            this.actionOptions = {id: UI.Actions.ActionIdentifiers.navigateToVideoDetails};
                            this.tap = UI.Controls.GalleryControl && UI.Controls.GalleryControl.Tap.invokeOnly;
                            this.selectionMode = UI.Controls.GalleryControl && UI.Controls.GalleryControl.SelectionMode.none
                        }
                        return VideoCollectionLXTemplateBase
                    })();
                VideoCollectionLXTemplates.VideoCollectionLXTemplateBase = VideoCollectionLXTemplateBase;
                var MovieTemplate = (function(_super) {
                        __extends(MovieTemplate, _super);
                        function MovieTemplate() {
                            _super.apply(this, arguments);
                            this.templateSelectorConstructor = MS.Entertainment.UI.Controls.GalleryTemplateSelector;
                            this.debugId = "movie";
                            this.itemTemplate = "select(.templateid-collectionMovieVerticalTile)";
                            this.actionOptions = {id: UI.Actions.ActionIdentifiers.navigateToVideoDetails}
                        }
                        return MovieTemplate
                    })(VideoCollectionLXTemplateBase);
                VideoCollectionLXTemplates.MovieTemplate = MovieTemplate;
                var TvSeriesTemplate = (function(_super) {
                        __extends(TvSeriesTemplate, _super);
                        function TvSeriesTemplate() {
                            _super.apply(this, arguments);
                            this.templateSelectorConstructor = MS.Entertainment.UI.Controls.GalleryTemplateSelector;
                            this.debugId = "tvSeries";
                            this.itemTemplate = "select(.templateid-collectionTVVerticalTile)"
                        }
                        return TvSeriesTemplate
                    })(VideoCollectionLXTemplateBase);
                VideoCollectionLXTemplates.TvSeriesTemplate = TvSeriesTemplate;
                var PersonalVideosTemplate = (function(_super) {
                        __extends(PersonalVideosTemplate, _super);
                        function PersonalVideosTemplate() {
                            _super.apply(this, arguments);
                            this.debugId = "personalVideos";
                            this.itemTemplate = "select(.templateid-collectionOtherVerticalTile)";
                            this.actionOptions = {id: UI.Actions.ActionIdentifiers.personalVideoNavigate}
                        }
                        return PersonalVideosTemplate
                    })(VideoCollectionLXTemplateBase);
                VideoCollectionLXTemplates.PersonalVideosTemplate = PersonalVideosTemplate
            })(ViewModels.VideoCollectionLXTemplates || (ViewModels.VideoCollectionLXTemplates = {}));
            var VideoCollectionLXTemplates = ViewModels.VideoCollectionLXTemplates;
            var VideoCollectionTemplateSelector = (function(_super) {
                    __extends(VideoCollectionTemplateSelector, _super);
                    function VideoCollectionTemplateSelector(collectionView) {
                        _super.call(this);
                        this.addTemplate("personalFolder", "/Components/Video_Win/VideoCollection.html#videoCollectionFolderVerticalTile");
                        this.addTemplate("personalFile", "/Components/Video_Win/VideoCollection.html#videoCollectionFileVerticalTile")
                    }
                    VideoCollectionTemplateSelector.prototype.onSelectTemplate = function(item) {
                        var template = null;
                        if (item && item.data) {
                            var data = item.data || {};
                            if (data.type === Microsoft.Entertainment.Queries.ObjectType.folder)
                                template = "personalFolder";
                            else
                                template = "personalFile"
                        }
                        this.ensureTemplatesLoaded([template]);
                        return _super.prototype.getTemplateProvider.call(this, template)
                    };
                    return VideoCollectionTemplateSelector
                })(UI.Controls.GalleryTemplateSelector);
            ViewModels.VideoCollectionTemplateSelector = VideoCollectionTemplateSelector;
            var VideoPersonalCollectionItems = (function(_super) {
                    __extends(VideoPersonalCollectionItems, _super);
                    function VideoPersonalCollectionItems() {
                        _super.apply(this, arguments);
                        this.templateSelectorConstructor = MS.Entertainment.ViewModels.VideoCollectionTemplateSelector
                    }
                    return VideoPersonalCollectionItems
                })(MS.Entertainment.ViewModels.VideoCollectionLXTemplates.PersonalVideosTemplate);
            ViewModels.VideoPersonalCollectionItems = VideoPersonalCollectionItems;
            var VideoCollectionLX = (function(_super) {
                    __extends(VideoCollectionLX, _super);
                    function VideoCollectionLX(view, defaultPivotIndex, overridePivotSetting) {
                        this._viewModelId = "videoCollection";
                        this._defaultPivotIndex = defaultPivotIndex || 0;
                        this._overridePivotSetting = overridePivotSetting || false;
                        this._folderStack = [];
                        _super.call(this, view);
                        window.msWriteProfilerMark("ent:VideoCollectionLX.constructor,StartTM");
                        this.title = String.load(String.id.IDS_VIDEO_LX_COLLECTION_PIVOT_TC);
                        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._signInBindings = WinJS.Binding.bind(signInService, {isSignedIn: this._updateEmptyActions.bind(this)});
                        this._networkStatusBindings = UI.Framework.addEventHandlers(Entertainment.ServiceLocator.getService(Entertainment.Services.uiState), {networkStatusChanged: this._onNetworkStatusChanged.bind(this)});
                        this.refresh();
                        window.msWriteProfilerMark("ent:VideoCollectionLX.constructor,StopTM")
                    }
                    VideoCollectionLX.prototype.dispose = function() {
                        _super.prototype.dispose.call(this);
                        if (this._delayInitializeScripts) {
                            this._delayInitializeScripts.cancel();
                            this._delayInitializeScripts = null
                        }
                        if (this._signInBindings) {
                            this._signInBindings.cancel();
                            this._signInBindings = null
                        }
                    };
                    VideoCollectionLX.prototype.clearFilter = function() {
                        if (this.filterSelectionManager)
                            this.filterSelectionManager.selectedIndex = 0
                    };
                    VideoCollectionLX.prototype._clearQueryBindings = function() {
                        if (this._collectionQueryBindings) {
                            this._collectionQueryBindings.cancel();
                            this._collectionQueryBindings = null
                        }
                    };
                    VideoCollectionLX.prototype._refresh = function() {
                        var _this = this;
                        this.isDisplayingMovies = (this.selectedPivot && (this.selectedPivot.id === VideoCollectionLX.PivotTypes.movies));
                        this.isOffline = !MS.Entertainment.UI.NetworkStatusService.isOnline();
                        if (!this._lastUsedView)
                            _super.prototype._refresh.call(this);
                        else
                            MS.Entertainment.Utilities.schedulePromiseBelowNormal().done(function() {
                                return _super.prototype._refresh.call(_this)
                            })
                    };
                    VideoCollectionLX.prototype._onBeginQuery = function(query) {
                        var isQueryingChildFolder = false;
                        this._clearQueryBindings();
                        this.isDisplayingMovies = (this.selectedPivot && (this.selectedPivot.id === VideoCollectionLX.PivotTypes.movies));
                        if (this.selectedPivot && this.selectedPivot.id === VideoCollectionLX.PivotTypes.personalVideos)
                            if (this._folderStack.length > 0) {
                                isQueryingChildFolder = true;
                                query.folderId = this._folderStack[this._folderStack.length - 1]
                            }
                            else
                                query.folderId = -1;
                        this.isChildFolder = isQueryingChildFolder;
                        _super.prototype._onBeginQuery.call(this, query)
                    };
                    Object.defineProperty(VideoCollectionLX.prototype, "isDisplayingMovies", {
                        get: function() {
                            return this._isDisplayingMovies
                        }, set: function(value) {
                                this.updateAndNotify("isDisplayingMovies", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoCollectionLX.prototype, "isOffline", {
                        get: function() {
                            return this._isOffline
                        }, set: function(value) {
                                this.updateAndNotify("isOffline", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoCollectionLX.prototype, "isChildFolder", {
                        get: function() {
                            return this._isChildFolder
                        }, set: function(value) {
                                this.updateAndNotify("isChildFolder", value)
                            }, enumerable: true, configurable: true
                    });
                    VideoCollectionLX.prototype._onTotalCountChanged = function(newValue, oldValue) {
                        this._totalCount = newValue;
                        var countFormatter = Entertainment.ServiceLocator.getService(Entertainment.Services.dateTimeFormatters).decimalNumber;
                        this.totalCountString = countFormatter.format(this._totalCount);
                        if (this._totalCount === 0) {
                            this.viewStateViewModel.viewState = 0;
                            this._updateEmptyActions()
                        }
                        else
                            this.viewStateViewModel.viewState = 2
                    };
                    Object.defineProperty(VideoCollectionLX.prototype, "totalCountString", {
                        get: function() {
                            return this._totalCountString
                        }, set: function(value) {
                                this.updateAndNotify("totalCountString", value)
                            }, enumerable: true, configurable: true
                    });
                    VideoCollectionLX.prototype._onQueryCompleted = function(query) {
                        this._clearQueryBindings();
                        this._collectionQueryBindings = WinJS.Binding.bind(query, {totalCount: this._onTotalCountChanged.bind(this)});
                        this.filterValue = this._getCollectionFilter()
                    };
                    VideoCollectionLX.prototype.goToParentFolder = function() {
                        if (this._folderStack && this._folderStack.length > 0) {
                            this._folderStack.pop();
                            this.refresh()
                        }
                    };
                    VideoCollectionLX.prototype.openFolder = function(folderId) {
                        if (this._folderStack && folderId >= 0) {
                            this._folderStack.push(folderId);
                            this.refresh()
                        }
                    };
                    VideoCollectionLX.prototype.delayInitialize = function() {
                        var _this = this;
                        this._delayInitializeScripts = Entertainment.Utilities.schedulePromiseBelowNormal(null, "VideoCollectionDelayedScripts").then(function() {
                            return WinJS.UI.Fragments.renderCopy("/Components/Video_Win/VideoCollectionDelayedScripts.html")
                        }).then(function(){}, function(error) {
                            ViewModels.assert(WinJS.Promise.isCanceledError(error), "Failed to load delayed scripts. error: " + (error && error.message))
                        }).then(function() {
                            if (_this._disposed)
                                return;
                            _super.prototype.delayInitialize.call(_this);
                            _this._delayInitializeScripts = null;
                            _this._initializeEmptyViewStateActions();
                            _this._raiseDelayLoadedEvent()
                        })
                    };
                    VideoCollectionLX.prototype.loadModules = function(){};
                    VideoCollectionLX.prototype.freeze = function(){};
                    VideoCollectionLX.prototype.thaw = function(){};
                    Object.defineProperty(VideoCollectionLX.prototype, "delayInitializePromise", {
                        get: function() {
                            return this.delayInitializeSignal.promise
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoCollectionLX.prototype, "delayInitializeSignal", {
                        get: function() {
                            if (!this._delayInitializeSignal)
                                this._delayInitializeSignal = new UI.Framework.Signal;
                            return this._delayInitializeSignal
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(VideoCollectionLX.prototype, "viewStateViewModel", {
                        get: function() {
                            if (!this._viewStateViewModel) {
                                var viewStateItems = [];
                                viewStateItems[-1] = new ViewModels.ViewStateItem(String.load(String.id.IDS_DOWNLOAD_ERROR_TRY_AGAIN_LATER), String.load(String.id.IDS_SERVICE_UNAVAILABLE_CAPTION), []);
                                viewStateItems[0] = new ViewModels.ViewStateItem(String.load(String.id.IDS_COLLECTION_VIDEO_LIBRARY_EMPTY), String.load(String.id.IDS_COLLECTION_ALL_VIDEO_EMPTY), this._initializeEmptyViewStateActions());
                                this._viewStateViewModel = new ViewModels.ViewStateViewModel(viewStateItems)
                            }
                            return this._viewStateViewModel
                        }, enumerable: true, configurable: true
                    });
                    VideoCollectionLX.prototype._initializeEmptyViewStateActions = function() {
                        if (!this._emptyViewActions)
                            this._emptyViewActions = new Entertainment.ObservableArray;
                        if (this.isDelayInitialized && this._emptyViewActions.length === 0)
                            this._populateObservableArrayWithEmptyActions(this._emptyViewActions);
                        return this._emptyViewActions
                    };
                    VideoCollectionLX.prototype._populateObservableArrayWithEmptyActions = function(array) {
                        var actions = this._createEmptyViewStateActions();
                        if (array && actions && actions.length)
                            array.spliceArray(0, 0, actions)
                    };
                    VideoCollectionLX.prototype._createEmptyViewStateActions = function() {
                        var actionService = Entertainment.ServiceLocator.getService(Entertainment.Services.actions);
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var emptyActions = [];
                        var pivot = this.selectedPivot;
                        if (pivot && pivot.id !== VideoCollectionLX.PivotTypes.personalVideos && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoSignInAvailable)) {
                            var signIn = Entertainment.ServiceLocator.getService(Entertainment.Services.signIn);
                            if (!signIn.isSignedIn) {
                                var signInAction = actionService.getAction(UI.Actions.ActionIdentifiers.signIn);
                                signInAction.automationId = VideoCollectionLxAutomationIds.SignIn;
                                emptyActions.push(new ViewModels.ActionItem(String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_SIGN_IN, String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_SIGN_IN_DESCRIPTION, signInAction, UI.Icon.actionLinkArrow));
                                var signUpAction = actionService.getAction(UI.Actions.ActionIdentifiers.signIn);
                                signUpAction.automationId = VideoCollectionLxAutomationIds.SignUp;
                                emptyActions.push(new ViewModels.ActionItem(String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_SIGN_UP, String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_SIGN_UP_DESCRIPTION, signUpAction, UI.Icon.actionLinkArrow))
                            }
                        }
                        if (pivot && pivot.id === VideoCollectionLX.PivotTypes.movies) {
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace))
                                emptyActions.push(new ViewModels.ActionItem(String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_BROWSE_MOVIES, String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_BROWSE_DESCRIPTION, actionService.getAction(UI.Actions.ActionIdentifiers.moviesStoreNavigate), UI.Icon.movies))
                        }
                        else if (pivot && pivot.id === VideoCollectionLX.PivotTypes.tvSeries) {
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                                emptyActions.push(new ViewModels.ActionItem(String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_BROWSE_TV, String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_BROWSE_DESCRIPTION, actionService.getAction(UI.Actions.ActionIdentifiers.tvStoreNavigate), UI.Icon.tvMonitor))
                        }
                        else if (pivot && pivot.id === VideoCollectionLX.PivotTypes.personalVideos)
                            emptyActions.push(new ViewModels.ActionItem(String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_CHOOSE, String.id.IDS_VIDEO_LX_COLLECTION_EMPTY_CHOOSE_DESCRIPTION, actionService.getAction(UI.Actions.ActionIdentifiers.showLocalGrovelInfoDialog), UI.Icon.folder));
                        return emptyActions
                    };
                    VideoCollectionLX.prototype._updateEmptyActions = function() {
                        if (!this._emptyViewActions || !this.isDelayInitialized)
                            return;
                        this._emptyViewActions.clear();
                        this._populateObservableArrayWithEmptyActions(this._emptyViewActions)
                    };
                    VideoCollectionLX.prototype._onNetworkStatusChanged = function() {
                        this.isOffline = !UI.NetworkStatusService.isOnline()
                    };
                    VideoCollectionLX.createVideoCollectionLX = function() {
                        var defaultPivotIndex = 0;
                        var overridePivotSetting = false;
                        if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.winJSNavigation).isFirstLocationLoaded && MS.Entertainment.Utilities.isLaunchToCollectionSettingEnabled) {
                            defaultPivotIndex = 2;
                            overridePivotSetting = true
                        }
                        return new VideoCollectionLX(VideoCollectionLX.ViewTypes.collection, defaultPivotIndex, overridePivotSetting)
                    };
                    Object.defineProperty(VideoCollectionLX.prototype, "selectedPivot", {
                        get: function() {
                            return this.pivotsSelectionManager ? this.pivotsSelectionManager.selectedItem : null
                        }, enumerable: true, configurable: true
                    });
                    VideoCollectionLX.prototype.getViewDefinition = function(view) {
                        return VideoCollectionLX.Views[view]
                    };
                    VideoCollectionLX.prototype.getPivotDefinition = function(view) {
                        return VideoCollectionLX.Pivots[view]
                    };
                    VideoCollectionLX.prototype.getModifierDefinition = function(view) {
                        this._modifiers = this._modifiers || this._createModifiers();
                        var id = this.selectedPivot && this.selectedPivot.id;
                        var modifierDefinition = id && this._modifiers ? this._modifiers[id] : null;
                        return modifierDefinition
                    };
                    VideoCollectionLX.prototype.getFilterDefinition = function(view) {
                        var pivot = this.selectedPivot;
                        if (pivot && pivot.id !== VideoCollectionLX.PivotTypes.personalVideos)
                            return VideoCollectionLX.Filters
                    };
                    VideoCollectionLX.prototype.getModifierOptions = function(view) {
                        var definition = this.getViewDefinition(view);
                        var pivot = this.selectedPivot;
                        return Entertainment.Utilities.uniteObjects(WinJS.Binding.unwrap(pivot && pivot.value && pivot.value.modifierOptions), WinJS.Binding.unwrap(definition && definition.modelOptions))
                    };
                    VideoCollectionLX.prototype._createModifiers = function() {
                        return new VideoCollectionLxModifiers.Modifiers
                    };
                    VideoCollectionLX.prototype._getCollectionFilter = function() {
                        var collectionFilter;
                        var selectedFilter;
                        if (this.filterSelectionManager)
                            selectedFilter = WinJS.Binding.unwrap(this.filterSelectionManager.selectedItem);
                        if (selectedFilter && selectedFilter.value && selectedFilter.value.queryOptions)
                            collectionFilter = selectedFilter.value.queryOptions.mediaAvailability;
                        return collectionFilter
                    };
                    VideoCollectionLX.prototype.cloneCurrentQuery = function() {
                        if (!this._lastUsedQuery)
                            return null;
                        var clonedQuery = this._lastUsedQuery.clone();
                        if (clonedQuery)
                            clonedQuery.allowGroupHints = false;
                        return clonedQuery
                    };
                    VideoCollectionLX.prototype._onQueryFailed = function(error) {
                        _super.prototype._onQueryFailed.call(this, error);
                        if (!WinJS.Promise.isCanceledError(error)) {
                            this.filterValue = this._getCollectionFilter();
                            this.viewStateViewModel.viewState = -1;
                            Entertainment.Utilities.assertError("VideoCollectionLX::_onQueryFailed() Unexpected failure from the database query.", error)
                        }
                    };
                    Object.defineProperty(VideoCollectionLX, "Filters", {
                        get: function() {
                            return {options: [new ViewModels.Node(VideoCollectionLxAutomationIds.FilterAll, String.load(String.id.IDS_VIDEO_LX_COLLECTION_FILTER_ALL), ViewModels.NodeValues.create({
                                            queryOptions: {mediaAvailability: Microsoft.Entertainment.Platform.MediaAvailability.available}, modelOptions: {showLocalEmptyAction: true}
                                        })), new ViewModels.Node(VideoCollectionLxAutomationIds.FilterOffline, String.load(String.id.IDS_VIDEO_LX_COLLECTION_FILTER_PC), ViewModels.NodeValues.create({
                                            queryOptions: {mediaAvailability: Microsoft.Entertainment.Platform.MediaAvailability.availableOffline}, modelOptions: {showLocalEmptyAction: true}
                                        })), new ViewModels.Node(VideoCollectionLxAutomationIds.FilterCloud, String.load(String.id.IDS_VIDEO_LX_COLLECTION_FILTER_CLOUD), ViewModels.NodeValues.create({
                                            queryOptions: {mediaAvailability: Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloud}, modelOptions: {showLocalEmptyAction: true}
                                        }))]}
                        }, enumerable: true, configurable: true
                    });
                    VideoCollectionLX.ViewTypes = {collection: "collection"};
                    VideoCollectionLX.PivotTypes = {
                        movies: "movies", tvSeries: "tvSeries", personalVideos: "personalVideos"
                    };
                    VideoCollectionLX.Views = {collection: ViewModels.NodeValues.create({
                            filterOptions: {
                                settingsKey: "collection-filter-selection", isRoamingSetting: false
                            }, pivotOptions: {settingsKey: "collection-pivot-selection"}, queryOptions: {
                                    isLive: true, allowReset: true, chunkSize: 25
                                }
                        })};
                    VideoCollectionLX.Pivots = {collection: {itemFactory: function itemFactory() {
                                return [new ViewModels.Node(VideoCollectionLX.PivotTypes.movies, String.load(String.id.IDS_VIDEO_LX_COLLECTION_MODIFIER_MOVIES), ViewModels.NodeValues.create({
                                            query: Data.Query.libraryVideoMovies, modelOptions: {
                                                    selectedTemplate: new VideoCollectionLXTemplates.MovieTemplate, propertyKey: "libraryId", taskKeyGetter: UI.FileTransferService.keyFromProperty("libraryId"), notifier: UI.FileTransferNotifiers.videoDownloadItem
                                                }, modifierOptions: {settingsKey: "collection-movies-modifier-selection"}
                                        })), new ViewModels.Node(VideoCollectionLX.PivotTypes.tvSeries, String.load(String.id.IDS_VIDEO_LX_COLLECTION_MODIFIER_TV), ViewModels.NodeValues.create({
                                            query: Data.Query.libraryTVSeries, modelOptions: {
                                                    selectedTemplate: new VideoCollectionLXTemplates.TvSeriesTemplate, propertyKey: "libraryId", taskKeyGetter: UI.FileTransferService.keyFromProperty("seriesLibraryId"), notifier: UI.FileTransferNotifiers.episodeCollection
                                                }, modifierOptions: {settingsKey: "collection-tvSeries-modifier-selection"}
                                        })), new ViewModels.Node(VideoCollectionLX.PivotTypes.personalVideos, String.load(String.id.IDS_VIDEO_LX_COLLECTION_MODIFIER_PERSONAL), ViewModels.NodeValues.create({
                                            query: Data.Query.LibraryFolderAndVideosQuery, modelOptions: {
                                                    selectedTemplate: new VideoCollectionLXTemplates.PersonalVideosTemplate, propertyKey: "libraryId", taskKeyGetter: UI.FileTransferService.keyFromProperty("libraryId"), notifier: UI.FileTransferNotifiers.genericFile
                                                }, modifierOptions: {settingsKey: "collection-other-modifier-selection"}
                                        }))]
                            }}};
                    return VideoCollectionLX
                })(ViewModels.QueryViewModel);
            ViewModels.VideoCollectionLX = VideoCollectionLX;
            (function(VideoCollectionLxModifiers) {
                var Modifiers = (function() {
                        function Modifiers(){}
                        Object.defineProperty(Modifiers.prototype, "movies", {
                            get: function() {
                                this._movies = this._movies || new VideoCollectionLxModifiers.Movie;
                                return this._movies
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(Modifiers.prototype, "tvSeries", {
                            get: function() {
                                this._series = this._series || new VideoCollectionLxModifiers.Series;
                                return this._series
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(Modifiers.prototype, "personalVideos", {
                            get: function() {
                                this._personalVideos = this._personalVideos || new VideoCollectionLxModifiers.PersonalVideos;
                                return this._personalVideos
                            }, enumerable: true, configurable: true
                        });
                        return Modifiers
                    })();
                VideoCollectionLxModifiers.Modifiers = Modifiers;
                var Movie = (function() {
                        function Movie(){}
                        Movie.prototype.itemFactory = function() {
                            return [new ViewModels.Node(VideoCollectionLxAutomationIds.SortMoviesByDateAdded, String.id.IDS_VIDEO_LX_COLLECTION_SORT_DATE, ViewModels.NodeValues.create({
                                        query: Data.Query.libraryVideoMovies, queryOptions: {sort: Microsoft.Entertainment.Queries.VideosSortBy.dateAddedDescending}, modelOptions: {selectedTemplate: new VideoCollectionLXTemplates.MovieTemplate}
                                    })), new ViewModels.Node(VideoCollectionLxAutomationIds.SortMoviesByAlpha, String.id.IDS_VIDEO_LX_COLLECTION_SORT_ALPHA, ViewModels.NodeValues.create({
                                        query: Data.Query.libraryVideoMovies, queryOptions: {sort: Microsoft.Entertainment.Queries.VideosSortBy.titleAscending}, modelOptions: {selectedTemplate: new VideoCollectionLXTemplates.MovieTemplate}
                                    }))]
                        };
                        return Movie
                    })();
                VideoCollectionLxModifiers.Movie = Movie;
                var Series = (function() {
                        function Series(){}
                        Series.prototype.itemFactory = function() {
                            return [new ViewModels.Node(VideoCollectionLxAutomationIds.SortTvSeriesByDateAdded, String.id.IDS_VIDEO_LX_COLLECTION_SORT_DATE, ViewModels.NodeValues.create({
                                        query: Data.Query.libraryTVSeries, queryOptions: {sort: Microsoft.Entertainment.Queries.TVSeriesSortBy.dateLastEpisodeAddedDescending}, modelOptions: {selectedTemplate: new VideoCollectionLXTemplates.TvSeriesTemplate}
                                    })), new ViewModels.Node(VideoCollectionLxAutomationIds.SortTvSeriesByAlpha, String.id.IDS_VIDEO_LX_COLLECTION_SORT_ALPHA, ViewModels.NodeValues.create({
                                        query: Data.Query.libraryTVSeries, queryOptions: {sort: Microsoft.Entertainment.Queries.TVSeriesSortBy.titleAscending}, modelOptions: {selectedTemplate: new VideoCollectionLXTemplates.TvSeriesTemplate}
                                    }))]
                        };
                        return Series
                    })();
                VideoCollectionLxModifiers.Series = Series;
                var PersonalVideos = (function() {
                        function PersonalVideos(){}
                        PersonalVideos.prototype.itemFactory = function() {
                            return [new ViewModels.Node(VideoCollectionLxAutomationIds.SortPersonalVideosByDateAdded, String.id.IDS_VIDEO_LX_COLLECTION_SORT_DATE, ViewModels.NodeValues.create({
                                        queryOptions: {sort: Microsoft.Entertainment.Queries.VideosSortBy.dateAddedDescending}, modelOptions: {selectedTemplate: new VideoPersonalCollectionItems}
                                    })), new ViewModels.Node(VideoCollectionLxAutomationIds.SortPersonalVideosByAlpha, String.id.IDS_VIDEO_LX_COLLECTION_SORT_ALPHA, ViewModels.NodeValues.create({
                                        queryOptions: {sort: Microsoft.Entertainment.Queries.VideosSortBy.titleAscending}, modelOptions: {selectedTemplate: new VideoPersonalCollectionItems}
                                    }))]
                        };
                        return PersonalVideos
                    })();
                VideoCollectionLxModifiers.PersonalVideos = PersonalVideos
            })(ViewModels.VideoCollectionLxModifiers || (ViewModels.VideoCollectionLxModifiers = {}));
            var VideoCollectionLxModifiers = ViewModels.VideoCollectionLxModifiers;
            var VideoCollectionLxAutomationIds = (function() {
                    function VideoCollectionLxAutomationIds(){}
                    VideoCollectionLxAutomationIds.FilterAll = "FilterAll";
                    VideoCollectionLxAutomationIds.FilterOffline = "FilterOffline";
                    VideoCollectionLxAutomationIds.FilterCloud = "FilterCloud";
                    VideoCollectionLxAutomationIds.SignIn = "VideoCollectionSignIn";
                    VideoCollectionLxAutomationIds.SignUp = "VideoCollectionSignUp";
                    VideoCollectionLxAutomationIds.SortMoviesByAlpha = "SortMoviesByAlpha";
                    VideoCollectionLxAutomationIds.SortMoviesByDateAdded = "SortMoviesByDateAdded";
                    VideoCollectionLxAutomationIds.SortTvSeriesByAlpha = "SortTvSeriesByAlpha";
                    VideoCollectionLxAutomationIds.SortTvSeriesByDateAdded = "SortTvSeriesByDateAdded";
                    VideoCollectionLxAutomationIds.SortPersonalVideosByAlpha = "SortPersonalVideosByAlpha";
                    VideoCollectionLxAutomationIds.SortPersonalVideosByDateAdded = "SortPersonalVideosByDateAdded";
                    return VideoCollectionLxAutomationIds
                })();
            ViewModels.VideoCollectionLxAutomationIds = VideoCollectionLxAutomationIds
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/framework/managefoldersaction.js:814 */
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
    (function(Entertainment) {
        (function(UI) {
            (function(Actions) {
                var ManageFoldersAutomationIds = (function() {
                        function ManageFoldersAutomationIds(){}
                        ManageFoldersAutomationIds.manageFolders = "manageFolders";
                        return ManageFoldersAutomationIds
                    })();
                Actions.ManageFoldersAutomationIds = ManageFoldersAutomationIds;
                (function(ManageFoldersActions) {
                    var ManageFolders = (function(_super) {
                            __extends(ManageFolders, _super);
                            function ManageFolders() {
                                _super.apply(this, arguments);
                                this.automationId = ManageFoldersAutomationIds.manageFolders
                            }
                            ManageFolders.prototype.canExecute = function(param) {
                                this.useOverrideTitleIfExists();
                                return true
                            };
                            ManageFolders.prototype.executed = function(param) {
                                MS.Entertainment.UI.Framework.loadTemplate("/Controls/ManageFoldersPage.html#manageFoldersTemplate", null, true).done(function() {
                                    MS.Entertainment.UI.Controls.ManageFoldersDialog.show()
                                })
                            };
                            return ManageFolders
                        })(Actions.Action);
                    ManageFoldersActions.ManageFolders = ManageFolders
                })(Actions.ManageFoldersActions || (Actions.ManageFoldersActions = {}));
                var ManageFoldersActions = Actions.ManageFoldersActions
            })(UI.Actions || (UI.Actions = {}));
            var Actions = UI.Actions
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
(function() {
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.manageFolders, function() {
        return new MS.Entertainment.UI.Actions.ManageFoldersActions.ManageFolders
    })
})()
})();
/* >>>>>>/controls/managefoldersview.js:873 */
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
    (function(Entertainment) {
        (function(UI) {
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
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
