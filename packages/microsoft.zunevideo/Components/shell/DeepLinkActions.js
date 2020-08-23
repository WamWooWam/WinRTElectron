/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
    var testIaPath = "/Test/InformationArchitecture.js";
    WinJS.Namespace.define("MS.Entertainment.UI.Components.Shell", {DeepLinkMarketplaceRequiredAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
            this.base()
        }, {canExecute: function canExecute(parameter) {
                var supportedAction = true;
                if (MS.Entertainment.Utilities.isVideoApp2) {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var hasMarketplace = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                    supportedAction = hasMarketplace
                }
                return supportedAction
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Components.Shell", {
        testMarketplaceLogic: null, MarketplaceFeaturesLogic: (function() {
                function Features() {
                    var features = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    function getFeatureEnabled(featureName) {
                        try {
                            return !!features.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem[featureName])
                        }
                        catch(ex) {
                            return false
                        }
                    }
                    for (var featureName in Microsoft.Entertainment.FeatureEnablement.FeatureItem)
                        try {
                            Object.defineProperty(this, featureName, {
                                get: getFeatureEnabled.bind(this, featureName), enumerable: true, configurable: false
                            })
                        }
                        catch(ex) {
                            {}
                        }
                }
                {};
                function userHasSubscription() {
                    if (MS.Entertainment.UI.Components.Shell.testDeeplinkSubStatus !== undefined)
                        return !!MS.Entertainment.UI.Components.Shell.testDeeplinkSubStatus;
                    else
                        return MS.Entertainment.Utilities.currentOrLastUserSubscriptionEnabled()
                }
                function isDeepPlayAction(action) {
                    return action.automationId.indexOf("deepLinkPlay") === 0
                }
                function AnyMarket() {
                    this.deepLinkPlayMedia2 = function AnyMarket_deepLinkPlayMedia2(media, options) {
                        MS.Entertainment.Platform.PlaybackHelpers.playMedia2(media, options)
                    };
                    this.name = "AnyMarket";
                    this.toString = function AnyMarket_toString() {
                        return this.name
                    };
                    this._enableFallbackToPreview = function AnyMarket_enableFallbackToPreview(obj) {
                        obj.enableFallbackToPreview = true;
                        MS.Entertainment.Platform.Playback.Etw.traceString(this.toString() + " rules: enabling fallbackToPreview")
                    };
                    this._playPreviewOnly = function AnyMarket_playPreviewOnly(obj) {
                        obj.playPreviewOnly = true;
                        MS.Entertainment.Platform.Playback.Etw.traceString(this.toString() + " rules: requesting playPreviewOnly")
                    }
                }
                function FreeStreamingMarket() {
                    this.processDeepLinkAction = function FreeStreamingMarket_processAction(playAction) {
                        if (isDeepPlayAction(playAction) && playAction.parameter.mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                            this._enableFallbackToPreview(playAction.parameter)
                    }
                }
                FreeStreamingMarket.prototype = new AnyMarket;
                FreeStreamingMarket.prototype.name = "FreeStreamingMarket";
                function PremiumMarket() {
                    this.processDeepLinkAction = function PremiumMarket_processAction(playAction) {
                        if (isDeepPlayAction(playAction))
                            if (userHasSubscription()) {
                                if (playAction.parameter.mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                                    this._enableFallbackToPreview(playAction.parameter)
                            }
                            else
                                this._enableFallbackToPreview(playAction.parameter)
                    }
                }
                PremiumMarket.prototype = new AnyMarket;
                PremiumMarket.prototype.name = "PremiumMarket";
                var premiumBasePlay = PremiumMarket.prototype.deepLinkPlayMedia2;
                PremiumMarket.prototype.deepLinkPlayMedia2 = function PremiumMarket_deepLinkPlayMedia2(media, options) {
                    if (!userHasSubscription())
                        this._enableFallbackToPreview(options);
                    premiumBasePlay.bind(this)(media, options)
                };
                function DTOMarket() {
                    this.processDeepLinkAction = function DTOMarket_processAction(playAction) {
                        if (isDeepPlayAction(playAction)) {
                            playAction.parameter.navigateToDetailsPage = true;
                            this._enableFallbackToPreview(playAction.parameter)
                        }
                    }
                }
                DTOMarket.prototype = new AnyMarket;
                DTOMarket.prototype.name = "DTOMarket";
                var dtoBasePlay = DTOMarket.prototype.deepLinkPlayMedia2;
                DTOMarket.prototype.deepLinkPlayMedia2 = function DTOMarket_deepLinkPlayMedia2(media, options) {
                    this._enableFallbackToPreview(options);
                    dtoBasePlay.bind(this)(media, options)
                };
                function NoMarket() {
                    this.processDeepLinkAction = function NoMarket_processAction(action){}
                }
                NoMarket.prototype = new AnyMarket;
                NoMarket.prototype.name = "NoMarket";
                var marketInstance = {
                        freeStreamingMarket: new FreeStreamingMarket, premiumMarket: new PremiumMarket, dtoMarket: new DTOMarket, noMarket: new NoMarket
                    };
                function createMarketplaceFeaturesLogicImplementation() {
                    var market = new Features;
                    var impl = null;
                    if (market.musicMarketplace)
                        if (market.musicFreePlay)
                            impl = marketInstance.freeStreamingMarket;
                        else if (market.musicSubscription)
                            impl = marketInstance.premiumMarket;
                        else
                            impl = marketInstance.dtoMarket;
                    else
                        impl = marketInstance.noMarket;
                    return impl
                }
                var logicImplementation = createMarketplaceFeaturesLogicImplementation();
                function MarketplaceFeaturesLogic() {
                    var impl = MS.Entertainment.UI.Components.Shell.testMarketplaceLogic === null ? logicImplementation : marketInstance[MS.Entertainment.UI.Components.Shell.testMarketplaceLogic];
                    if (!impl)
                        MS.Entertainment.UI.Components.Shell.fail("No  MarketplaceFeatureLogic for deep linking found.");
                    this.processDeepLinkAction = function MarketplaceFeaturesLogic_processPlayAction(action) {
                        return impl ? impl.processDeepLinkAction(action) : undefined
                    };
                    this.deepLinkPlayMedia2 = function MarketplaceFeaturesLogic_deepLinkPlayMedia2(media, options) {
                        return impl ? impl.deepLinkPlayMedia2(media, options) : undefined
                    };
                    this.toString = function() {
                        return impl ? impl.toString() : "undefined implementation"
                    }
                }
                {};
                return MarketplaceFeaturesLogic
            })(), DeepLinkLocationAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Components.Shell.DeepLinkMarketplaceRequiredAction", function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkLocationAction: params.id not defined");
                    var navigationPromise;
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (!params.dialogOnly)
                        navigationService.clearBackStackOnNextNavigate(true);
                    else if (!navigationService.currentPage)
                        navigationService.navigateToDefaultPage();
                    var promise = WinJS.Promise.as();
                    if (params.navigationDelay)
                        promise = WinJS.Promise.timeout(params.navigationDelay);
                    promise.then(function executeNavigation() {
                        if (MS.Entertainment.Utilities.isMusicApp2 && !MS.Entertainment.Utilities.appRegionMatchesMachineRegion())
                            return MS.Entertainment.UI.Shell.showRegionMismatchDialog(String.load(String.id.IDS_MUSIC2_REGION_MISMATCH_CANT_DEEPLINK_HEADER), String.load(String.id.IDS_MUSIC2_REGION_MISMATCH_CANT_DEEPLINK_BODY)).then(function completed(regionData) {
                                    return WinJS.Promise.wrapError(new Error("DeepLinkActions::_deeplinkLocationAction: App region doesn't match console region. App Region: {0} Console Region: {1}".format(regionData.appRegionCode, regionData.machineRegionCode)))
                                });
                        var moniker = MS.Entertainment.UI.Monikers[params.id];
                        if (moniker) {
                            var args = null;
                            var forcePageNavigation = false;
                            var mapping = {
                                    homeHub: MS.Entertainment.UI.Monikers.root, movieMarketplaceNewReleases: MS.Entertainment.UI.Monikers.movieMarketplace, movieMarketplaceFeatured: MS.Entertainment.UI.Monikers.movieMarketplace, tvMarketplaceNewReleases: MS.Entertainment.UI.Monikers.tvMarketplace, tvMarketplaceFeatured: MS.Entertainment.UI.Monikers.tvMarketplace, musicMarketplaceFeatured: MS.Entertainment.UI.Monikers.musicMarketplace, flexHub: MS.Entertainment.UI.Monikers.flexHubPage
                                };
                            var mappedMoniker = mapping[params.id];
                            if (mappedMoniker) {
                                if (mappedMoniker === MS.Entertainment.UI.Monikers.flexHubPage) {
                                    MS.Entertainment.UI.Components.Shell.assert(params.targetId, "DeepLinkLocationAction: targetId required for a flexhub deeplink");
                                    args = {query: params.targetId};
                                    forcePageNavigation = true
                                }
                                MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver();
                                navigationService.navigateTo(mappedMoniker, moniker, null, args, forcePageNavigation)
                            }
                            else
                                navigationService.navigateTo(moniker, null, null, args, forcePageNavigation)
                        }
                    }.bind(this)).done(null, function handleDeeplinkFailed() {
                        if (!params.dialogOnly)
                            navigationService.navigateToDefaultPage()
                    })
                }}), DeepLinkDetailsAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Components.Shell.DeepLinkMarketplaceRequiredAction", function() {
                this.base()
            }, {
                executed: function executed(params) {
                    var navigationPromise;
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (!params.dialogOnly)
                        navigationService.clearBackStackOnNextNavigate(true);
                    else if (!navigationService.currentPage) {
                        navigationService.navigateToDefaultPage();
                        navigationPromise = WinJS.Promise.timeout(params.navigationDelay || 0)
                    }
                    WinJS.Promise.as(navigationPromise).then(function executeNavigation() {
                        if (MS.Entertainment.Utilities.isMusicApp && params.desiredMediaItemType)
                            return this._executeMusicDetails(params);
                        else if (MS.Entertainment.Utilities.isVideoApp && params.desiredMediaItemType)
                            return this._executeVideoDetails(params);
                        else
                            return this._executeUnknownMediaTypeDetails(params)
                    }.bind(this)).done(null, function handleDeeplinkFailed(error) {
                        if (!params.dialogOnly || MS.Entertainment.Utilities.isMusicApp2)
                            navigationService.navigateToDefaultPage();
                        if (MS.Entertainment.Utilities.isVideoApp && (!error || !error.doNotShowErrorDialog))
                            WinJS.Promise.timeout(1).done(function showErrorDialog() {
                                MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_VIDEO_DEEPLINK_ERROR_GENERIC_TITLE), String.load(String.id.IDS_VIDEO_DEEPLINK_ERROR_GENERIC_DESC), {dismissOnNavigateDelay: 30000})
                            })
                    })
                }, _executeMusicDetails: function _executeMusicDetails(params) {
                        var navigationPromise;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (MS.Entertainment.Utilities.isMusicApp2 && !MS.Entertainment.Utilities.appRegionMatchesMachineRegion())
                            return WinJS.Promise.timeout(1).then(function showMismatchDialog() {
                                    return MS.Entertainment.UI.Shell.showRegionMismatchDialog(String.load(String.id.IDS_MUSIC2_REGION_MISMATCH_CANT_DEEPLINK_HEADER), String.load(String.id.IDS_MUSIC2_REGION_MISMATCH_CANT_DEEPLINK_BODY))
                                }).then(function dialogDismissed(regionData) {
                                    return WinJS.Promise.wrapError(new Error("DeepLinkActions::_executeMusicDetails: App region doesn't match console region. App Region: {0} Console Region: {1}".format(regionData.appRegionCode, regionData.machineRegionCode)))
                                });
                        var isMusicMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        if (!isMusicMarketplaceEnabled) {
                            navigationPromise = WinJS.Promise.wrapError(new Error("Music maretkplace is not enabled. Cannot execute to music details deeplink."));
                            WinJS.Promise.timeout().done(function _showNonMarketplaceError() {
                                MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_MUSIC_DEEPLINK_NON_MARKETPLACE_ERROR_TITLE), String.load(String.id.IDS_MUSIC_DEEPLINK_NON_MARKETPLACE_ERROR_DESC))
                            })
                        }
                        var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                        if (!isMusicMarketplaceNetworkEnabled && !navigationPromise)
                            navigationPromise = WinJS.Promise.wrapError(new Error("Music maretkplace network is not enabled. Cannot execute to music details deeplink."));
                        MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkDetailsAction: params.id not defined");
                        var useCanonicalId = true;
                        if (params.idType && !navigationPromise) {
                            var idType = params.idType.toLocaleLowerCase();
                            if (idType === MS.Entertainment.Data.Query.edsIdType.canonical.toLocaleLowerCase())
                                useCanonicalId = true;
                            else if (idType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsIdType.zuneCatalog.toLocaleLowerCase())
                                useCanonicalId = false;
                            else
                                MS.Entertainment.UI.Components.Shell.fail("Unknown media ID type.")
                        }
                        if (params.id && !navigationPromise) {
                            var dialogOnly = !!params.dialogOnly;
                            var item = useCanonicalId ? {ID: params.id} : {ZuneId: params.id};
                            item.location = MS.Entertainment.Data.ItemLocation.marketplace;
                            switch (params.desiredMediaItemType.toLocaleLowerCase()) {
                                case MS.Entertainment.Data.Query.edsMediaType.musicArtist.toLocaleLowerCase():
                                    navigationPromise = this._processArtistDeeplink(item, dialogOnly);
                                    break;
                                case MS.Entertainment.Data.Query.edsMediaType.album.toLocaleLowerCase():
                                    navigationPromise = this._processAlbumDeeplink(item, dialogOnly);
                                    break;
                                case MS.Entertainment.Data.Query.edsMediaType.track.toLocaleLowerCase():
                                    navigationPromise = this._processTrackDeeplink(item, dialogOnly);
                                    break;
                                case MS.Entertainment.Data.Query.edsMediaType.musicPlaylist.toLocaleLowerCase():
                                    navigationPromise = this._processPlaylistDeeplink(params.id, dialogOnly);
                                    break;
                                default:
                                    MS.Entertainment.UI.Components.Shell.fail("Unknown desired media type.");
                                    break
                            }
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid id. Cannot execute to music details deeplink."));
                        return navigationPromise
                    }, _executeUnknownMediaTypeDetails: function _executeUnknownMediaTypeDetails(params) {
                        MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkDetailsAction: params.id not defined");
                        MS.Entertainment.Platform.PlaybackHelpers.getMediaByServiceId(params.id, params.idType).then(function getMediaByServiceIdSuccess(media) {
                            if (!media)
                                return WinJS.Promise.wrapError(new Error("Invalid id. Cannot execute to details deeplink."));
                            if (MS.Entertainment.Utilities.isVideoApp)
                                media.hydrate().done(function onHydrated() {
                                    if (media.isValid)
                                        this._showVideoImmersive(media, params)
                                }.bind(this));
                            else
                                MS.Entertainment.Platform.PlaybackHelpers.showImmersive(media)
                        }.bind(this), function getMediaByServiceIdError(errorCode) {
                            if (errorCode)
                                MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_MEDIA_ERROR_CAPTION), errorCode);
                            MS.Entertainment.UI.Components.Shell._navigateToDefaultPage()
                        })
                    }, _executeVideoDetails: function _executeVideoDetails(params) {
                        return this._getSignInPromise().then(function onSignInComplete() {
                                var navigationPromise;
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                var isMoviesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                                var isTvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                                var isVideoMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.videoMarketplace);
                                var isMovieDeeplink = params.desiredMediaItemType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsMediaType.movie.toLocaleLowerCase();
                                var isTvDeeplink = params.desiredMediaItemType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsMediaType.tvSeries.toLocaleLowerCase() || params.desiredMediaItemType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsMediaType.tvSeason.toLocaleLowerCase() || params.desiredMediaItemType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsMediaType.tvEpisode.toLocaleLowerCase();
                                var showRegionMismatchDialog = MS.Entertainment.Utilities.isVideoApp2 && !MS.Entertainment.Utilities.appRegionMatchesMachineRegion();
                                MS.Entertainment.UI.Components.Shell.assert(params.desiredMediaItemType && (isMovieDeeplink || isTvDeeplink), "Unknown desiredMediaItemType.");
                                if (isMovieDeeplink && !isMoviesMarketplaceEnabled)
                                    navigationPromise = WinJS.Promise.wrapError(new Error("Movies marketplace is not enabled. Cannot execute to movie deeplink."));
                                if (isTvDeeplink && !isTvMarketplaceEnabled)
                                    navigationPromise = WinJS.Promise.wrapError(new Error("TV marketplace is not enabled. Cannot execute to tv deeplink."));
                                if (!isVideoMarketplaceNetworkEnabled && !navigationPromise)
                                    navigationPromise = WinJS.Promise.wrapError(new Error("Video marketplace network is not enabled. Cannot execute to video details deeplink."));
                                if (showRegionMismatchDialog && !navigationPromise)
                                    navigationPromise = MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_VIDEO2_REGION_WARNING_TITLE), String.load(String.id.IDS_VIDEO2_REGION_WARNING_BODY), {dismissOnNavigateDelay: 30000}).then(function onDialogDismissed() {
                                        var errorInfo = new Error("Deeplink failed due to region mismatch between machine and user");
                                        errorInfo.doNotShowErrorDialog = true;
                                        return WinJS.Promise.wrapError(errorInfo)
                                    });
                                MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkDetailsAction: params.id not defined");
                                var useCanonicalId = true;
                                if (params.idType && !navigationPromise) {
                                    var idType = params.idType.toLocaleLowerCase();
                                    if (idType === MS.Entertainment.Data.Query.edsIdType.canonical.toLocaleLowerCase())
                                        useCanonicalId = true;
                                    else if (idType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsIdType.zuneCatalog.toLocaleLowerCase())
                                        useCanonicalId = false;
                                    else
                                        MS.Entertainment.UI.Components.Shell.fail("Unknown media ID type.")
                                }
                                if (params.id && !navigationPromise) {
                                    var item = useCanonicalId ? {ID: params.id} : {ZuneId: params.id};
                                    item.location = MS.Entertainment.Data.ItemLocation.marketplace;
                                    switch (params.desiredMediaItemType.toLocaleLowerCase()) {
                                        case MS.Entertainment.Data.Query.edsMediaType.movie.toLocaleLowerCase():
                                            navigationPromise = this._processMovieDeeplink(item, params);
                                            break;
                                        case MS.Entertainment.Data.Query.edsMediaType.tvSeries.toLocaleLowerCase():
                                            navigationPromise = this._processTvSeriesDeeplink(item, params);
                                            break;
                                        case MS.Entertainment.Data.Query.edsMediaType.tvSeason.toLocaleLowerCase():
                                            navigationPromise = this._processTvSeasonDeeplink(item, params);
                                            break;
                                        case MS.Entertainment.Data.Query.edsMediaType.tvEpisode.toLocaleLowerCase():
                                            navigationPromise = this._processTvEpisodeDeeplink(item, params);
                                            break;
                                        default:
                                            MS.Entertainment.UI.Components.Shell.fail("Unknown desired media type.");
                                            navigationPromise = WinJS.Promise.wrapError(new Error("Unknown desired media type."));
                                            break
                                    }
                                }
                                else if (!navigationPromise)
                                    navigationPromise = WinJS.Promise.wrapError(new Error("Invalid id. Cannot execute to video details deeplink."));
                                return navigationPromise
                            }.bind(this))
                    }, _processArtistDeeplink: function _processArtistDeeplink(item, dialogOnly) {
                        var navigationPromise;
                        var artist = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EDSArtist);
                        if (artist) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(artist);
                            navigationPromise = artist.hydrate().then(function _onArtistHydrated() {
                                if (artist.hasServiceId)
                                    if (dialogOnly) {
                                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                        var artistDetailsNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.artistDetailsNavigate);
                                        artistDetailsNavigateAction.parameter = {
                                            data: artist, clearBackStackOnExecute: true
                                        };
                                        MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver();
                                        return artistDetailsNavigateAction.execute()
                                    }
                                    else {
                                        var immersiveOptions = {
                                                startFullScreen: false, overridePageChange: MS.Entertainment.Utilities.isMusicApp2
                                            };
                                        MS.Entertainment.Platform.PlaybackHelpers.showImmersive(artist, immersiveOptions)
                                    }
                                else
                                    return WinJS.Promise.wrapError(new Error("Invalid artist id. Cannot execute to music artist details deeplink."))
                            }.bind(this))
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid artist object. Cannot execute to music artist details deeplink."));
                        return navigationPromise
                    }, _processAlbumDeeplink: function _processAlbumDeeplink(item, dialogOnly) {
                        var navigationPromise;
                        var album = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EDSAlbum);
                        if (album) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(album);
                            navigationPromise = album.hydrate().then(function _onAlbumHydrated() {
                                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                var albumDetailsNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate);
                                albumDetailsNavigateAction.parameter = {
                                    data: album, clearBackStackOnExecute: true
                                };
                                return albumDetailsNavigateAction.execute()
                            }.bind(this))
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid album object. Cannot execute to music album details deeplink."));
                        return navigationPromise
                    }, _processTrackDeeplink: function _processTrackDeeplink(item, dialogOnly) {
                        var navigationPromise;
                        var track = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EDSTrack);
                        if (track) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(track);
                            navigationPromise = track.hydrate({forceUpdate: true}).then(function _onTrackHydrated() {
                                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                var albumDetailsNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.albumDetailsNavigate);
                                albumDetailsNavigateAction.parameter = {
                                    data: track, clearBackStackOnExecute: true
                                };
                                return albumDetailsNavigateAction.execute()
                            }.bind(this))
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid track object. Cannot execute to music track details deeplink."));
                        return navigationPromise
                    }, _processPlaylistDeeplink: function _processPlaylistDeeplink(id, dialogOnly) {
                        return MS.Entertainment.UI.Actions.Playlists.queryPlaylistById(id, true).then(null, function fallbackOnLibraryPlaylist(error) {
                                if (!WinJS.Promise.isCanceledError(error))
                                    return MS.Entertainment.UI.Actions.Playlists.getCloudPlaylist(id);
                                return WinJS.Promise.wrapError(error)
                            }).then(function showPlaylistPopover(playlist) {
                                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                var playlistDetailsNavigateAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playlistDetailsNavigate);
                                playlistDetailsNavigateAction.parameter = {
                                    data: playlist, clearBackStackOnExecute: true
                                };
                                MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver();
                                return playlistDetailsNavigateAction.execute()
                            }.bind(this))
                    }, _getSignInPromise: function _getSignInPromise() {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var signedInSignal = new MS.Entertainment.UI.Framework.Signal;
                        var signInBindings;
                        var signInPromise = WinJS.Promise.wrap();
                        var cleanupSignInBindings = function cleanupSignInBindings() {
                                if (!signInBindings)
                                    return;
                                signInBindings.cancel();
                                signInBindings = null;
                                signedInSignal.complete()
                            };
                        if (signIn.isSigningIn) {
                            signInBindings = WinJS.Binding.bind(signIn, {isSigningIn: cleanupSignInBindings});
                            signInPromise = signedInSignal.promise
                        }
                        return signInPromise
                    }, _getOfferIds: function _getOfferIds(mediaItem) {
                        var offerIds = [];
                        var defaultClientTypeFromApp = MS.Entertainment.Utilities.defaultClientTypeFromApp;
                        var rights = MS.Entertainment.ViewModels.SmartBuyStateHandlers.getMatchingRights(mediaItem, defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.SeasonPurchase, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.SeasonPurchaseStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Purchase, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PurchaseStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Rent, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.RentStream, ]);
                        for (var i = 0; i < rights.length; ++i) {
                            var currentRight = rights[i];
                            if (currentRight && offerIds.indexOf(currentRight.offerId) === -1) {
                                MS.Entertainment.assert(currentRight.offerId, "DeepLinkActions: Invalid offerId: " + currentRight.offerId);
                                offerIds.push(currentRight.offerId)
                            }
                        }
                        return offerIds
                    }, _prepareMediaItemForPlayback: function _prepareMediaItemForPlayback(mediaItem) {
                        MS.Entertainment.assert(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn);
                        var offerIds = this._getOfferIds(mediaItem);
                        return MS.Entertainment.UI.PurchaseHistoryService.refreshVideoOffersAsync(offerIds).then(function addToDatabaseComplete() {
                                return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(mediaItem)
                            }).then(null, function onError(error) {
                                if (!WinJS.Promise.isCanceledError(error))
                                    return WinJS.Promise.wrap();
                                else
                                    return WinJS.Promise.wrapError(error)
                            })
                    }, _processMovieDeeplink: function _processMovieDeeplink(item, params) {
                        var navigationPromise;
                        var movie = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EdsMovie);
                        if (movie && MS.Entertainment.Platform.PlaybackHelpers.isMovie(movie)) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(movie);
                            navigationPromise = movie.hydrate().then(function _onMovieHydrated() {
                                if (movie.hasServiceId && movie.isValid)
                                    this._prepareMediaItemForPlayback(movie).done(function mediaItemReady() {
                                        this._showVideoImmersive(movie, params)
                                    }.bind(this));
                                else
                                    return WinJS.Promise.wrapError(new Error("Invalid movie id. Cannot execute to movie details deeplink. Service ID " + params.id))
                            }.bind(this))
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid movie object. Cannot execute to movie details deeplink. Service ID " + params.id));
                        return navigationPromise
                    }, _processTvSeriesDeeplink: function _processTvSeriesDeeplink(item, params) {
                        var navigationPromise;
                        var series = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EdsTVSeries);
                        if (series && MS.Entertainment.Platform.PlaybackHelpers.isTVSeries(series)) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(series);
                            navigationPromise = series.hydrate().then(function _onSeriesHydrated() {
                                if (series.hasServiceId && series.isValid)
                                    this._showVideoImmersive(series, params);
                                else
                                    return WinJS.Promise.wrapError(new Error("Invalid series id. Cannot execute to series details deeplink. Service ID " + params.id))
                            }.bind(this))
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid series object. Cannot execute to series details deeplink. Service ID " + params.id));
                        return navigationPromise
                    }, _processTvSeasonDeeplink: function _processTvSeasonDeeplink(item, params) {
                        var navigationPromise;
                        var season = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EdsTVSeason);
                        if (season && MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(season)) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(season);
                            navigationPromise = season.hydrate().then(function _onSeasonHydrated() {
                                if (season.hasServiceId && season.isValid)
                                    this._showVideoImmersive(season, params);
                                else
                                    return WinJS.Promise.wrapError(new Error("Invalid season object. Cannot execute to season details deeplink. Service ID " + params.id))
                            }.bind(this))
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid season object. Cannot execute to season details deeplink. Service ID " + params.id));
                        return navigationPromise
                    }, _processTvEpisodeDeeplink: function _processTvEpisodeDeeplink(item, params) {
                        var navigationPromise;
                        var episode = MS.Entertainment.Data.augment(item, MS.Entertainment.Data.Augmenter.Marketplace.EdsTVEpisode);
                        if (episode && MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(episode)) {
                            MS.Entertainment.ViewModels.MediaItemModel.augment(episode);
                            navigationPromise = episode.hydrate().then(function _onEpisodeHydrated() {
                                if (episode.hasServiceId && episode.isValid)
                                    this._prepareMediaItemForPlayback(episode).done(function mediaItemReady() {
                                        this._showVideoImmersive(episode, params)
                                    }.bind(this));
                                else
                                    return WinJS.Promise.wrapError(new Error("Invalid episode object. Cannot execute to episode details deeplink. Service ID " + params.id))
                            }.bind(this))
                        }
                        else
                            navigationPromise = WinJS.Promise.wrapError(new Error("Invalid episode object. Cannot execute to episode details deeplink. Service ID " + params.id));
                        return navigationPromise
                    }, _showPopover: function _showPopover(mediaItem, popoverConstructor, isCollection) {
                        MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver();
                        var popOverParameters = {
                                itemConstructor: popoverConstructor, dataContext: {
                                        data: mediaItem, location: isCollection ? MS.Entertainment.Data.ItemLocation.collection : MS.Entertainment.Data.ItemLocation.marketplace
                                    }
                            };
                        if (MS.Entertainment.Utilities.isApp2) {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            navigationService.clearBackStackOnNextNavigate(true)
                        }
                        MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
                    }, _showItemDetailsAndPopover: function _showItemDetailsAndPopover(popOverMediaItem, immersiveMediaItem, popoverConstructor) {
                        var navigationPromise;
                        MS.Entertainment.ViewModels.MediaItemModel.augment(immersiveMediaItem);
                        navigationPromise = immersiveMediaItem.hydrate().then(MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver).then(function _onHydrated() {
                            return new WinJS.Promise(function initializePromise(complete) {
                                    var immersiveOptions = {
                                            startFullScreen: false, completeCallback: complete, forceDetails: true
                                        };
                                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({dataContext: {data: immersiveMediaItem}}, immersiveOptions)
                                })
                        }).then(function _waitForImmersive(navigated) {
                            if (!navigated) {
                                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                navigationService.clearBackStackOnNextNavigate(false)
                            }
                            return WinJS.Promise.timeout(1)
                        }).then(function _showMediaPopover() {
                            this._showPopover(popOverMediaItem, popoverConstructor)
                        }.bind(this));
                        return navigationPromise
                    }, _showImmersiveAndPopover: function _showImmersiveAndPopover(popOverMediaItem, immersiveMediaItem, popoverConstructor) {
                        if (!popOverMediaItem || !popOverMediaItem.hasServiceId || (!popOverMediaItem.hasArtistServiceId && MS.Entertainment.Utilities.isMusicApp) || !immersiveMediaItem)
                            return WinJS.Promise.wrapError(new Error("Invalid media object or id. Cannot execute to navigate to immersive details and show a pop-over."));
                        var navigationPromise;
                        MS.Entertainment.ViewModels.MediaItemModel.augment(immersiveMediaItem);
                        navigationPromise = immersiveMediaItem.hydrate().then(MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver).then(function _onHydrated() {
                            return new WinJS.Promise(function initializePromise(complete) {
                                    var immersiveOptions = {
                                            startFullScreen: false, completeCallback: complete
                                        };
                                    MS.Entertainment.Platform.PlaybackHelpers.showImmersive(immersiveMediaItem, immersiveOptions)
                                })
                        }).then(function _waitForImmersive(navigated) {
                            if (!navigated) {
                                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                navigationService.clearBackStackOnNextNavigate(false)
                            }
                            return WinJS.Promise.timeout()
                        }).then(function _showMediaPopover() {
                            this._showPopover(popOverMediaItem, popoverConstructor)
                        }.bind(this));
                        return navigationPromise
                    }, _getFreePlayPromise: function _getFreePlayPromise(media, isSeason) {
                        var freePlayPromise = WinJS.Promise.wrap(false);
                        var bestFreeRight = null;
                        if (isSeason)
                            bestFreeRight = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getBestFreeSeasonRight(media);
                        else
                            bestFreeRight = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getBestFreeRight(media, false);
                        if (bestFreeRight) {
                            var offerId = bestFreeRight.offerId;
                            var currencyCode = bestFreeRight.priceCurrencyCode;
                            var purchaseType = MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_BUY;
                            if (bestFreeRight.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Rent || bestFreeRight.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.RentStream)
                                purchaseType = MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_RENT;
                            freePlayPromise = MS.Entertainment.Platform.PurchaseHelpers.freePurchaseFlow(media, offerId, currencyCode, purchaseType, true, bestFreeRight.signedOffer, bestFreeRight, MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.deepLink).then(function freeJustPlaysInvoked() {
                                return WinJS.Promise.wrap(true)
                            }, function freeJustPlaysErrors() {
                                return WinJS.Promise.wrap(false)
                            })
                        }
                        return freePlayPromise
                    }, _showVideoImmersive: function _showVideoImmersive(media, params) {
                        MS.Entertainment.UI.Components.Shell.assert(media, "_showVideoImmersive.  media argument is invalid");
                        var autoPlay = params.autoPlay;
                        var startPaused = params.startPaused;
                        var autoPlayPreview = params.autoPlayPreview && !!media.videoPreviewUrl;
                        if (autoPlayPreview)
                            media.playPreviewOnly = true;
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var isMovie = MS.Entertainment.Platform.PlaybackHelpers.isMovie(media);
                        var isSeries = MS.Entertainment.Platform.PlaybackHelpers.isTVSeries(media);
                        var isSeason = MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(media);
                        var isEpisode = MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(media);
                        var canPlay = false;
                        var navToDetails = true;
                        var getVideoToPlayPromise = WinJS.Promise.wrap();
                        if ((autoPlay || autoPlayPreview || startPaused) && (!isSeries || configurationManager.video.videoPlaySeasonDeepLinkEnabled))
                            if (isSeries || isSeason) {
                                var hydrateSeries = WinJS.Promise.wrap();
                                var series = isSeason ? null : media;
                                var season = isSeason ? media : null;
                                if (isSeason) {
                                    series = MS.Entertainment.Utilities.convertMediaItemToTvSeries(media);
                                    hydrateSeries = media.hydrate()
                                }
                                getVideoToPlayPromise = hydrateSeries.then(function onSeriesHydrated() {
                                    var episodeProgressionHelper = new MS.Entertainment.Components.Video.EpisodeProgressionHelper(series);
                                    return episodeProgressionHelper.findNextEpisode(season).then(function foundWNR(results) {
                                            if (results && results.episode && (!season || season.seasonNumber === results.episode.seasonNumber)) {
                                                var playMedia = results.episode;
                                                canPlay = playMedia.inCollection;
                                                return WinJS.Promise.wrap(playMedia)
                                            }
                                            else if (season)
                                                return this._getFreePlayPromise(season, true).then(function onGetFreePurchase(succeeded) {
                                                        canPlay = false;
                                                        navToDetails = !succeeded;
                                                        return WinJS.Promise.wrap(null)
                                                    }.bind(this));
                                            else {
                                                canPlay = false;
                                                return WinJS.Promise.wrap(null)
                                            }
                                        }.bind(this))
                                }.bind(this))
                            }
                            else if (isMovie || isEpisode) {
                                getVideoToPlayPromise = WinJS.Promise.wrap(media);
                                canPlay = (media.inCollection || autoPlayPreview) && !media.isPresale
                            }
                        getVideoToPlayPromise.then(function gotVideoToPlay(video) {
                            if (!video)
                                return WinJS.Promise.wrap(null);
                            if (video && (video.inCollection || autoPlayPreview))
                                return WinJS.Promise.wrap(video);
                            return this._getFreePlayPromise(video, false).then(function onGetFreePurchase(succeeded) {
                                    canPlay = false;
                                    navToDetails = !video.inCollection;
                                    return WinJS.Promise.wrap(video)
                                }.bind(this))
                        }.bind(this)).then(function handleMedia(video) {
                            if (canPlay && video)
                                MS.Entertainment.Platform.PlaybackHelpers.playMedia2(video, {
                                    autoPlay: autoPlay && !startPaused, playPreviewOnly: autoPlayPreview, startPositionMsec: params.startPositionMsec, showImmersive: true, immersiveOptions: {
                                            startFullScreen: true, forcePageChange: true
                                        }, playbackSource: MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.deeplink
                                });
                            else if (navToDetails)
                                if (isEpisode && MS.Entertainment.Utilities.isVideoApp1)
                                    this._showItemDetailsAndPopover(media, media, MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl());
                                else
                                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({dataContext: {data: media}}, {forceDetails: true})
                        }.bind(this))
                    }
            }), DeepLinkPlayAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Components.Shell.DeepLinkMarketplaceRequiredAction", function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkDetailsAction: params.id not defined");
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    if (MS.Entertainment.Utilities.isMusicApp && !isMusicMarketplaceEnabled) {
                        MS.Entertainment.UI.Components.Shell._navigateToDefaultPage();
                        MS.Entertainment.UI.Framework.loadTemplate("/Controls/MessageBox.html", "messageBoxTemplate", true).done(function onLoadCompleted() {
                            WinJS.Promise.timeout().done(function _showNonMarketplaceError() {
                                MS.Entertainment.UI.Shell.showMessageBox(String.load(String.id.IDS_MUSIC_DEEPLINK_NON_MARKETPLACE_ERROR_TITLE), String.load(String.id.IDS_MUSIC_DEEPLINK_NON_MARKETPLACE_ERROR_DESC))
                            })
                        }, function onLoadError(error) {
                            MS.Entertainment.UI.Components.Shell.fail("failed to load MessageBox loadTemplate for deeplink play action: " + error && error.message)
                        });
                        return
                    }
                    var marketplaceLogic = new MS.Entertainment.UI.Components.Shell.MarketplaceFeaturesLogic;
                    var mediaPromise = null;
                    if (params.desiredMediaItemType)
                        mediaPromise = MS.Entertainment.Platform.PlaybackHelpers.getMusicMediaByServiceId(params.id, params.idType, params.desiredMediaItemType);
                    else
                        mediaPromise = MS.Entertainment.Platform.PlaybackHelpers.getMediaByServiceId(params.id, params.idType);
                    mediaPromise.then(null, function onPlaylistErrorTryCollection(errorCode) {
                        if (params.desiredMediaItemType && params.desiredMediaItemType.toLowerCase() === MS.Entertainment.Data.Query.edsMediaType.musicPlaylist.toLowerCase())
                            return MS.Entertainment.UI.Actions.Playlists.queryPlaylistById(params.id, true).then(null, function fallbackOnLibraryPlaylist(error) {
                                    if (!WinJS.Promise.isCanceledError(error))
                                        return MS.Entertainment.UI.Actions.Playlists.getCloudPlaylist(params.id);
                                    return WinJS.Promise.wrapError(error)
                                });
                        return WinJS.Promise.wrapError(errorCode)
                    }).done(function getMediaByServiceIdSuccess(media) {
                        if (!MS.Entertainment.Utilities.isMusicApp)
                            media.addProperty("playFromXbox", true);
                        var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var pollAttempt = 0;
                        checkSignInStatus();
                        function letsTryToPlay() {
                            MS.Entertainment.UI.Components.Shell.assert(appSignIn.isSignedIn || appSignIn.signInError, "signing in process should be finished!");
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.playbackErrorDisplayService))
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackErrorDisplayService).showDialogForNonCriticalErrors = true;
                            switch (media.mediaType) {
                                case Microsoft.Entertainment.Queries.ObjectType.track:
                                case Microsoft.Entertainment.Queries.ObjectType.album:
                                    playTrackOrAlbum();
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.person:
                                    playArtistOrSmartDJ();
                                    break;
                                case Microsoft.Entertainment.Queries.ObjectType.playlist:
                                    if (media.count > 0)
                                        marketplaceLogic.deepLinkPlayMedia2(media, {
                                            sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, autoPlay: true, startPositionMsec: params.startPositionMsec, showImmersive: true, immersiveOptions: {
                                                    sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: true
                                                }
                                        });
                                    break;
                                default:
                                    if (MS.Entertainment.Platform.PlaybackHelpers.isMusicVideo(media))
                                        playTrackOrAlbum();
                                    else
                                        marketplaceLogic.deepLinkPlayMedia2(media, {
                                            sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, autoPlay: true, startPositionMsec: params.startPositionMsec, showImmersive: true, immersiveOptions: {
                                                    sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: true
                                                }
                                        })
                            }
                        }
                        function playTrackOrAlbum() {
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var playAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playMedia);
                            playAction.automationId = MS.Entertainment.UI.AutomationIds.deepLinkPlay;
                            playAction.parameter = {
                                mediaItem: media, autoPlay: true, showImmersive: MS.Entertainment.Utilities.isMusicApp2, showDetails: false, showAppBar: true, startPositionMsec: params.startPositionMsec
                            };
                            marketplaceLogic.processDeepLinkAction(playAction);
                            var adService = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.adService) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService);
                            var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            if (adService && signInService.isSignedIn && !signedInUserService.isSubscription)
                                adService.playVideoAdIfRequired(media).done(function playVideoAdIfRequired_complete(adPlayedIfNeeded) {
                                    if (adPlayedIfNeeded)
                                        playAction.execute()
                                }, function playVideoAdIfRequired_failed(error) {
                                    MS.Entertainment.UI.Components.Shell.fail("playVideoAdIfRequired_failed: " + error && error.message);
                                    playAction.execute()
                                });
                            else
                                playAction.execute()
                        }
                        function playArtistOrSmartDJ() {
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var playAction = null;
                            if (params.playSmartDJ) {
                                playAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playSmartDJ);
                                playAction.automationId = MS.Entertainment.UI.AutomationIds.deepLinkPlaySmartDJ
                            }
                            else {
                                playAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playArtist);
                                playAction.automationId = MS.Entertainment.UI.AutomationIds.deepLinkPlayArtist
                            }
                            playAction.parameter = {
                                mediaItem: media, autoPlay: true, showImmersive: false, showDetails: false, showAppBar: true, startPositionMsec: params.startPositionMsec
                            };
                            marketplaceLogic.processDeepLinkAction(playAction);
                            playAction.execute()
                        }
                        function checkSignInStatus() {
                            if (appSignIn.isSigningIn)
                                var signingInBindings = WinJS.Binding.bind(appSignIn, {isSigningIn: function onIsSigningInChanged(isSigningIn, isSigningInOld) {
                                            if (isSigningInOld !== undefined && !isSigningIn) {
                                                letsTryToPlay();
                                                signingInBindings.cancel()
                                            }
                                        }});
                            else
                                letsTryToPlay()
                        }
                    }, function getMediaByServiceIdError(errorCode) {
                        if (errorCode)
                            MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_MEDIA_ERROR_CAPTION), errorCode);
                        MS.Entertainment.UI.Components.Shell._navigateToDefaultPage()
                    })
                }}), DeepLinkPlayToAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Components.Shell.DeepLinkMarketplaceRequiredAction", function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (MS.Entertainment.Utilities.isVideoApp2)
                        navigationService.navigateTo(MS.Entertainment.UI.Monikers.playToSpinner)
                }}), DeepLinkPlayPinAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Components.Shell.DeepLinkMarketplaceRequiredAction", function() {
                this.base()
            }, {
                executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.id, "DeepLinkPlayPinAction: params.id not defined");
                    var media = null;
                    var canPlay = false;
                    this._getMediaItemAsync(params).then(function _getMediaItemAsync_complete(mediaItem) {
                        if (!mediaItem)
                            return WinJS.Promise.wrapError("Could not find media item.");
                        media = mediaItem;
                        return this._waitForSigningInCompleteAsync()
                    }.bind(this)).then(function _waitForSigningInCompleteAsync_complete() {
                        switch (media.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                                return this._navigateToMediaItemAsync(media, false);
                            default:
                                return MS.Entertainment.ViewModels.SmartBuyStateEngine.queryMediaStateAsync(media).then(function queryMediaStateAsync_complete(stateInfo) {
                                        canPlay = stateInfo.canPlay || (MS.Entertainment.Utilities.isMusicApp && this._canStreamMusicMediaItem(media));
                                        return this._navigateToMediaItemAsync(media, canPlay)
                                    }.bind(this))
                        }
                    }.bind(this)).then(function _navigateToMediaItemAsync_complete() {
                        if (canPlay)
                            return this._playMediaItemAsync(media, params);
                        return WinJS.Promise.wrap()
                    }.bind(this)).done(function _playMediaItemAsync_complete() {
                        return WinJS.Promise.wrap()
                    }, function executePlayPinDeepLink_error(errorCode) {
                        if (errorCode)
                            MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_MEDIA_ERROR_CAPTION), errorCode);
                        MS.Entertainment.UI.Components.Shell._navigateToDefaultPage()
                    })
                }, _canStreamMusicMediaItem: function _canStreamMusicMediaItem(media) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (configurationManager.service.lastSignedInUserSubscription)
                            return true;
                        if (signIn.isSignedIn) {
                            var isFreeTrialCompleted = true;
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.freePlayLimits))
                                isFreeTrialCompleted = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.freePlayLimits).isFreeTrialCompleted;
                            if (!isFreeTrialCompleted)
                                return true
                        }
                        return false
                    }, _showImmersiveAndPopoverAsync: function _showImmersiveAndPopoverAsync(popOverMediaItem, immersiveMediaItem, popoverConstructor) {
                        if (!popOverMediaItem || !popOverMediaItem.hasServiceId || (!popOverMediaItem.hasArtistServiceId && MS.Entertainment.Utilities.isMusicApp) || !immersiveMediaItem)
                            return WinJS.Promise.wrapError(new Error("Invalid media object or id. Cannot excute to navigate to immersive details and show a pop-over."));
                        MS.Entertainment.ViewModels.MediaItemModel.augment(immersiveMediaItem);
                        return immersiveMediaItem.hydrate().then(MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver).then(function hydrate_complete() {
                                return new WinJS.Promise(function showImmersiveForMedia(complete) {
                                        var immersiveOptions = {
                                                startFullScreen: false, completeCallback: complete
                                            };
                                        MS.Entertainment.Platform.PlaybackHelpers.showImmersive(immersiveMediaItem, immersiveOptions)
                                    })
                            }).then(function waitForShowImmersiveToComplete() {
                                return WinJS.Promise.timeout()
                            }).then(MS.Entertainment.UI.Controls.PopOver.dismissCurrentPopOver).then(function dismissCurrentPopOver_complete() {
                                var popOverParameters = {
                                        itemConstructor: popoverConstructor, dataContext: {
                                                data: popOverMediaItem, location: MS.Entertainment.Data.ItemLocation.marketplace
                                            }
                                    };
                                MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters).done();
                                return WinJS.Promise.wrap()
                            })
                    }, _navigateToMediaItemAsync: function _navigateToMediaItemAsync(media, attemptingToAutoPlay) {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        navigationService.clearBackStackOnNextNavigate(true);
                        MS.Entertainment.ViewModels.MediaItemModel.augment(media);
                        if (!media.hydrate)
                            return WinJS.Promise.wrap();
                        return media.hydrate().then(function hydrate_complete() {
                                if (!media.hasZuneId && MS.Entertainment.Utilities.isVideoApp)
                                    return WinJS.Promise.wrap();
                                if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(media) && !attemptingToAutoPlay)
                                    return this._showImmersiveAndPopoverAsync(media, media, MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl());
                                else {
                                    var immersiveOptions = {startFullScreen: false};
                                    MS.Entertainment.Platform.PlaybackHelpers.showImmersive(media, immersiveOptions);
                                    return WinJS.Promise.wrap()
                                }
                            }.bind(this), function hydrate_error(e) {
                                return WinJS.Promise.wrapError(new Error("Cannot navigate to the media because it could not be hydrated. Error message: " + (e && e.message)))
                            })
                    }, _playMediaItemAsync: function _playMediaItemAsync(media, params) {
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.playbackErrorDisplayService)) {
                            var playbackErrorDisplayService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackErrorDisplayService);
                            playbackErrorDisplayService.showDialogForNonCriticalErrors = false
                        }
                        if (MS.Entertainment.Utilities.isMusicApp)
                            return this._playMusicMediaItemAsync(media, params);
                        else {
                            MS.Entertainment.Platform.PlaybackHelpers.playMedia2(media, {
                                sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, autoPlay: true, startPositionMsec: params.startPositionMsec, showImmersive: true, playbackSource: MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.deepLink, immersiveOptions: {
                                        sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: true
                                    }
                            });
                            return WinJS.Promise.wrap()
                        }
                    }, _playMusicMediaItemAsync: function _playMusicMediaItemAsync(media, params) {
                        return this._playAdIfRequiredAsync(media, params).then(function _playAdIfRequiredAsync_complete(canPlayContent) {
                                if (canPlayContent) {
                                    var marketplaceLogic = new MS.Entertainment.UI.Components.Shell.MarketplaceFeaturesLogic;
                                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                    var playAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playMedia);
                                    playAction.automationId = MS.Entertainment.UI.AutomationIds.deepLinkPlay;
                                    playAction.parameter = {
                                        mediaItem: media, autoPlay: true, showImmersive: true, showDetails: false, showAppBar: true, startPositionMsec: params.startPositionMsec
                                    };
                                    marketplaceLogic.processDeepLinkAction(playAction);
                                    playAction.execute()
                                }
                                return WinJS.Promise.wrap()
                            })
                    }, _playAdIfRequiredAsync: function _playAdIfRequiredAsync(media, params) {
                        var checkIfAdRequired = (media.mediaType === Microsoft.Entertainment.Queries.ObjectType.track || media.mediaType === Microsoft.Entertainment.Queries.ObjectType.album);
                        if (checkIfAdRequired) {
                            var adService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.adService);
                            var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            if (adService && signInService.isSignedIn && !signedInUserService.isSubscription)
                                return adService.playVideoAdIfRequired(media)
                        }
                        return WinJS.Promise.wrap(true)
                    }, _getMediaItemAsync: function _getMediaItemAsync(params) {
                        if (!params.idType)
                            return MS.Entertainment.Utilities.createMediaItemByLibraryInfo(params.id, params.mediaType);
                        else {
                            var media;
                            return MS.Entertainment.Platform.PlaybackHelpers.getMediaByServiceId(params.id, params.idType).then(function getMediaByServiceId_success(mediaItem) {
                                    media = mediaItem;
                                    MS.Entertainment.ViewModels.MediaItemModel.augment(media);
                                    return media.hydrate()
                                }).then(function _getMediaItemAsync_complete() {
                                    return WinJS.Promise.wrap(media)
                                }, function _getMediaItemAsync_error(error) {
                                    return MS.Entertainment.ViewModels.MediaItemModel.getLibraryIdAsync({
                                            zuneId: params.id, seriesZuneId: params.seriesZuneId, seasonNumber: params.seasonNumber, mediaType: params.mediaType, libraryId: -1
                                        }).then(function getLibraryIdAsync_complete(libraryId) {
                                            return MS.Entertainment.Utilities.createMediaItemByLibraryInfo(libraryId, params.mediaType)
                                        }.bind(this))
                                }.bind(this))
                        }
                    }, _waitForSigningInCompleteAsync: function _waitForSigningInComplete() {
                        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (!signInService.isSigningIn)
                            return WinJS.Promise.wrap(signInService);
                        return new WinJS.Promise(function(complete, error, progress) {
                                if (signInService.isSigningIn)
                                    var signingInBindings = WinJS.Binding.bind(signInService, {isSigningIn: function onIsSigningInChanged(isSigningIn, isSigningInOld) {
                                                if (isSigningInOld !== undefined && !isSigningIn) {
                                                    complete();
                                                    signingInBindings.cancel()
                                                }
                                            }});
                                else
                                    complete()
                            })
                    }
            }), DeepLinkSearchAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Components.Shell.DeepLinkMarketplaceRequiredAction", function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.query, "DeepLinkSearchAction: params.query not defined");
                    MS.Entertainment.ViewModels.SearchContractViewModel._navigateToSearchPage({keyword: params.query})
                }}), DeepLinkLaunchTitleAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {executed: function executed(params) {
                    MS.Entertainment.UI.Components.Shell.assert(params.titleId, "DeepLinkLaunchTitleAction: params.titleId not defined");
                    MS.Entertainment.UI.Components.Shell.assert(params.mediaType, "DeepLinkLaunchTitleAction: params.mediaType not defined");
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var session = sessionMgr.lrcSession;
                    var titleId = params.titleId;
                    var serviceId = params.serviceId;
                    var serviceIdType = params.serviceIdType || MS.Entertainment.Data.Query.edsIdType.zuneCatalog;
                    var mediaType = params.mediaType;
                    var startPositionMsec = params.startPositionMsec;
                    var deepLinkInfo = params.deepLinkInfo;
                    var getMediaItem = null;
                    if (deepLinkInfo)
                        deepLinkInfo = decodeURIComponent(deepLinkInfo);
                    switch (mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.game:
                            getMediaItem = MS.Entertainment.Platform.PlaybackHelpers.getGameMediaByTitleId(titleId);
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.person:
                            getMediaItem = MS.Entertainment.Platform.PlaybackHelpers.getMusicMediaByServiceId(serviceId, serviceIdType, MS.Entertainment.Data.Query.edsMediaType.musicArtist);
                            break;
                        default:
                            if (serviceId)
                                getMediaItem = MS.Entertainment.Platform.PlaybackHelpers.getMediaByServiceId(serviceId);
                            else if (titleId)
                                getMediaItem = MS.Entertainment.Platform.PlaybackHelpers.getGameMediaByTitleId(titleId);
                            break
                    }
                    getMediaItem.then(function getMediaItemSuccess(media) {
                        MS.Entertainment.Platform.PlaybackHelpers.playMediaOnXbox(media, titleId, deepLinkInfo, startPositionMsec)
                    }, function getMediaItemFailed(errorCode) {
                        if (mediaType === Microsoft.Entertainment.Queries.ObjectType.video && titleId && deepLinkInfo) {
                            var fakeMedia = new MS.Entertainment.Data.Augmenter.Marketplace.VideoBase;
                            MS.Entertainment.Platform.PlaybackHelpers.playMediaOnXbox(fakeMedia, titleId, deepLinkInfo, startPositionMsec)
                        }
                        else {
                            if (errorCode)
                                MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_MEDIA_ERROR_CAPTION), errorCode);
                            MS.Entertainment.UI.Components.Shell._navigateToDefaultPage()
                        }
                    })
                }}), DeepLinkShowPerfTrackLog: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {
                automationId: "deepLinkShowPerfTrackLog", executed: function executed(params) {
                        MS.Entertainment.UI.Components.Shell.assert(params.enable !== undefined, "DeepLinkShowPerfTrackLog: params.enable not defined");
                        var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        config.generalSettings.showPerfTrackLog = params.enable
                    }
            }), DeepLinkConfigureMemoryLeakTracking: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {
                automationId: "deepLinkConfigureMemoryLeakTracking", executed: function executed(params) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        configurationManager.shell.attachCookieToRemovedDomElements = params.enable;
                        configurationManager.shell.attachLargeObjectToUnloadedControl = params.enable
                    }
            }), DeepLinkVideoProtocolConverter: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {executed: function executed(params) {
                    var action = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails);
                    var actionParams = {
                            id: params.ContentID, idType: MS.Entertainment.Data.Query.edsIdType.canonical, desiredMediaItemType: params.ContentType
                        };
                    if (this.command === "media-playback") {
                        var playState = params.PlayState && params.PlayState.toLocaleLowerCase();
                        var startPaused = playState === MS.Entertainment.UI.DeepLink.PlayStateType.pause;
                        actionParams.startPaused = startPaused;
                        actionParams.autoPlay = !startPaused
                    }
                    {};
                    if (params.Time) {
                        var matches = /^([0-9][0-9]):([0-9][0-9]):([0-9][0-9])$/g.exec(params.Time);
                        if (matches && matches.length === 4) {
                            var hours = parseInt(matches[1]) || 0;
                            var minutes = parseInt(matches[2]) || 0;
                            var seconds = parseInt(matches[3]) || 0;
                            var startPositionMsec = 0;
                            startPositionMsec += (hours * 3600000);
                            startPositionMsec += (minutes * 60000);
                            startPositionMsec += (seconds * 1000);
                            actionParams.startPositionMsec = startPositionMsec
                        }
                    }
                    action.automationId = MS.Entertainment.UI.AutomationIds.deepLink;
                    action.parameter = actionParams;
                    action.execute()
                }}), DeepLinkXBLDefaultAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {
                automationId: "deepLinkXBLDefaultAction", executed: function executed(params) {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        if (!navigationService.currentPage)
                            navigationService.navigateToDefaultPage();
                        if (String.isString(params.PlayState)) {
                            var playbackSession;
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                                playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).primarySession;
                            if (playbackSession)
                                switch (params.PlayState.toLowerCase()) {
                                    case MS.Entertainment.UI.DeepLink.PlayStateType.play:
                                        if (playbackSession.currentMedia)
                                            switch (playbackSession.currentTransportState) {
                                                case MS.Entertainment.Platform.Playback.TransportState.paused:
                                                    playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                                                    break;
                                                case MS.Entertainment.Platform.Playback.TransportState.stopped:
                                                    if (playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error)
                                                        MS.Entertainment.Platform.PlaybackHelpers.showPlaybackError(playbackSession.errorDescriptor);
                                                    else if (playbackSession.pendingOrdinal >= 0)
                                                        playbackSession.playAt(playbackSession.pendingOrdinal);
                                                    break
                                            }
                                        else if (playbackSession.pendingOrdinal >= 0)
                                            playbackSession.playAt(playbackSession.pendingOrdinal);
                                        break;
                                    case MS.Entertainment.UI.DeepLink.PlayStateType.pause:
                                        if (playbackSession.currentMedia && playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing)
                                            playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                                        break
                                }
                        }
                    }
            }), DeepLinkXBLDetailsAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {
                automationId: "deepLinkXBLDetailsAction", executed: function executed(params) {
                        var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails);
                        if (!action.automationId)
                            action.automationId = MS.Entertainment.UI.AutomationIds.deepLink;
                        var isArtist = params.ContentType && params.ContentType.toLocaleLowerCase() === MS.Entertainment.Data.Query.edsMediaType.musicArtist.toLocaleLowerCase();
                        action.parameter = {
                            id: params.ContentID, desiredMediaItemType: params.ContentType, idType: MS.Entertainment.Data.Query.edsIdType.canonical, dialogOnly: !isArtist, navigationDelay: params.navigationDelay
                        };
                        action.execute()
                    }
            }), DeepLinkXBLPlaybackAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {
                automationId: "deepLinkXBLPlaybackAction", executed: function executed(params) {
                        if (MS.Entertainment.Utilities.isMusicApp2 && !MS.Entertainment.Utilities.appRegionMatchesMachineRegion()) {
                            var navigationTimeout = WinJS.Promise.timeout(params.navigationDelay || 0);
                            return navigationTimeout.then(function navigationTimeoutComplete() {
                                    return MS.Entertainment.UI.Shell.showRegionMismatchDialog(String.load(String.id.IDS_MUSIC2_REGION_MISMATCH_CANT_DEEPLINK_HEADER), String.load(String.id.IDS_MUSIC2_REGION_MISMATCH_CANT_DEEPLINK_BODY))
                                }).then(function messageBoxDismissed(regionData) {
                                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateToDefaultPage();
                                    return WinJS.Promise.wrapError(new Error("DeepLinkActions::_deepLinkXBLPlaybackAction: App region doesn't match console region. App Region: {0} Console Region: {1}".format(regionData.appRegionCode, regionData.machineRegionCode)))
                                })
                        }
                        var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlay);
                        if (!action.automationId)
                            action.automationId = MS.Entertainment.UI.AutomationIds.deepLink;
                        action.parameter = {
                            id: params.ContentID, desiredMediaItemType: params.ContentType, idType: MS.Entertainment.Data.Query.edsIdType.canonical, playSmartDJ: params.PlaySmartDJ
                        };
                        action.execute()
                    }
            }), DeepLinkTunerConfigAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function() {
                this.base()
            }, {
                automationId: MS.Entertainment.UI.AutomationIds.deepLinkTunerConfig, executed: function executed(params) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        if (configurationManager.flighting.deeplinkTunerConfigEnabled)
                            if (configurationManager[params.namespace])
                                configurationManager[params.namespace][params.key] = params.value;
                        MS.Entertainment.UI.Components.Shell._navigateToDefaultPage(true)
                    }
            }), _navigateToDefaultPage: function _navigateToDefaultPage(initService) {
                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    if (initService && !navigationService.currentPage) {
                        var iaService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
                        if (iaService && !iaService.isInitialized)
                            iaService.initialize();
                        navigationService.init()
                    }
                    navigationService.navigateToDefaultPage()
                }
                else if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.winJSNavigation)) {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.winJSNavigation);
                    navigationService.navigateToDefault()
                }
            }
    });
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkLocationAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlay, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkPlayAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlayTo, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkPlayToAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlayPin, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkPlayPinAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkDetailsAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkSearch, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkSearchAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLaunchTitle, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkLaunchTitleAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkShowPerfTrackLog, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkShowPerfTrackLog
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkConfigureMemoryLeakTracking, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkConfigureMemoryLeakTracking
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkVideoProtocolConverter, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkVideoProtocolConverter
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkXBLDefault, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkXBLDefaultAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkXBLDetails, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkXBLDetailsAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkXBLPlayback, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkXBLPlaybackAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.deeplinkTunerConfig, function() {
        return new MS.Entertainment.UI.Components.Shell.DeepLinkTunerConfigAction
    })
})()
