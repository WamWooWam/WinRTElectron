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
            (function(Video) {
                var VideoDashboardViewModel = (function(_super) {
                        __extends(VideoDashboardViewModel, _super);
                        function VideoDashboardViewModel() {
                            _super.apply(this, arguments)
                        }
                        VideoDashboardViewModel.prototype._refreshData = function() {
                            this.getItems(true)
                        };
                        return VideoDashboardViewModel
                    })(MS.Entertainment.UI.Dashboard.DashboardViewModel);
                Video.VideoDashboardViewModel = VideoDashboardViewModel;
                var EditorialDashboardViewModel = (function(_super) {
                        __extends(EditorialDashboardViewModel, _super);
                        function EditorialDashboardViewModel() {
                            _super.apply(this, arguments)
                        }
                        EditorialDashboardViewModel.prototype.canDisplayMediaType = function(item) {
                            var canDisplayMediaType = false;
                            var editorialType = item && item.actionType && item.actionType.mediaType;
                            if (item)
                                canDisplayMediaType = (editorialType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode || editorialType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie || editorialType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series || (editorialType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season && MS.Entertainment.Utilities.isValidServiceId(item.seriesId)) || editorialType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub || editorialType === MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.FlexHub || item.mediaType === Microsoft.Entertainment.Queries.ObjectType.video || item.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries) && editorialType !== MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.MovieTrailer;
                            return canDisplayMediaType
                        };
                        EditorialDashboardViewModel.prototype.processMediaItemQuery = function(query, maxItems, raiseError) {
                            var _this = this;
                            return query.getItems().then(function gotItems(items) {
                                    return items.toArrayAll()
                                }).then(function(listItems) {
                                    return WinJS.Promise.as(_this.wrapMediaItems(listItems, maxItems))
                                }, function(error) {
                                    if (raiseError)
                                        return WinJS.Promise.wrapError(error);
                                    return WinJS.Promise.as(_this._fillEmptyResults(maxItems))
                                })
                        };
                        EditorialDashboardViewModel.prototype.wrapMediaItems = function(listItems, maxItems) {
                            var items = [];
                            for (var i = 0; i < listItems.length && items.length < maxItems; i++) {
                                var currentItem = listItems[i];
                                currentItem.index = i;
                                if (this.canDisplayMediaType(currentItem))
                                    items.push(this._wrapMediaItem(currentItem))
                            }
                            if (items.length < maxItems)
                                items = items.concat(this._fillEmptyResults(maxItems - items.length));
                            MS.Entertainment.ViewModels.assert(items.length === maxItems, "itemList has the wrong number of items");
                            return items
                        };
                        EditorialDashboardViewModel.prototype._wrapEditorialItem = function(item) {
                            var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                            var query;
                            var promoClicked;
                            var flexHubClicked;
                            var popOverConstructor;
                            var mediaItem = item;
                            var showItemDetails = true;
                            var editorialType = item && item.actionType && item.actionType.mediaType;
                            switch (editorialType) {
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie:
                                    popOverConstructor = "MS.Entertainment.Pages.MovieInlineDetails";
                                    break;
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                                    popOverConstructor = "MS.Entertainment.Pages.TvSeriesInlineDetailsFullScreen";
                                    break;
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub:
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.FlexHub:
                                    setProperty(item, "isFlexHub", true);
                                    break;
                                case MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Media:
                                    break;
                                default:
                                    showItemDetails = false;
                                    MS.Entertainment.ViewModels.assert(editorialType === undefined, "Unknown type passed into wrapItem: " + editorialType);
                                    break
                            }
                            if (editorialType !== MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Hub && !item.isFlexHub) {
                                var queriedData = mediaItem;
                                promoClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function(e) {
                                    var hydrate = mediaItem && mediaItem.hydrate && mediaItem.hydrate();
                                    if (queriedData && showItemDetails) {
                                        var popOverParameters = {
                                                itemConstructor: popOverConstructor, dataContext: {
                                                        location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace, data: queriedData
                                                    }
                                            };
                                        var hydrate = mediaItem && mediaItem.hydrate && mediaItem.hydrate();
                                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                                    }
                                    else if (!this._isOnline) {
                                        var offlinePopOverParameters = null;
                                        offlinePopOverParameters = {itemConstructor: "MS.Entertainment.UI.Controls.FailedPanel"};
                                        return MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver(offlinePopOverParameters)
                                    }
                                }, this);
                                setProperty(item, "doclick", promoClicked)
                            }
                            else {
                                flexHubClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function(e) {
                                    if (!this._isOnline) {
                                        var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                                        return MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode)
                                    }
                                    else
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.flexHubPage, MS.Entertainment.UI.Monikers.flexHub, null, {
                                            query: item.target || item.actionTarget, sourceQueryId: item.queryId
                                        })
                                }, this);
                                setProperty(item, "doclick", flexHubClicked)
                            }
                            return item
                        };
                        EditorialDashboardViewModel.prototype._fillEmptyResults = function(maxItems) {
                            var emptyItems = [];
                            for (var i = 0; i < maxItems; i++)
                                emptyItems.push(null);
                            return emptyItems
                        };
                        EditorialDashboardViewModel.prototype._wrapMediaItem = function(item) {
                            var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                            var promoClicked;
                            var popOverConstructor;
                            var mediaItem = item;
                            var showItemDetails = true;
                            setProperty(item, "primaryText", item.name);
                            MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(item).then(function setPrimaryImageUrl(url) {
                                setProperty(item, "imagePrimaryUrl", url)
                            }.bind(this));
                            setProperty(item, "imageFallbackUrl", MS.Entertainment.UI.Shell.ImageLoader.getMediaItemDefaultImageUrl(item));
                            switch (item.type) {
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Movie:
                                    popOverConstructor = "MS.Entertainment.Pages.MovieInlineDetails";
                                    break;
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                                case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                                    popOverConstructor = "MS.Entertainment.Pages.TvSeriesInlineDetailsFullScreen";
                                    break;
                                default:
                                    showItemDetails = false;
                                    MS.Entertainment.ViewModels.assert(item.type === undefined, "Unknown type passed into wrapItem: " + item.type);
                                    break
                            }
                            promoClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function(e) {
                                if (mediaItem && showItemDetails) {
                                    var popOverParameters = {
                                            itemConstructor: popOverConstructor, dataContext: {
                                                    location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace, data: mediaItem
                                                }
                                        };
                                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                                }
                                else if (!this._isOnline) {
                                    var offlinePopOverParameters = null;
                                    offlinePopOverParameters = {itemConstructor: "MS.Entertainment.UI.Controls.FailedPanel"};
                                    return MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver(offlinePopOverParameters)
                                }
                            }, this);
                            setProperty(item, "doclick", promoClicked);
                            return item
                        };
                        return EditorialDashboardViewModel
                    })(MS.Entertainment.UI.Video.VideoDashboardViewModel);
                Video.EditorialDashboardViewModel = EditorialDashboardViewModel
            })(UI.Video || (UI.Video = {}));
            var Video = UI.Video
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
