(function (PlayerFramework, undefined) {
    "use strict";

    // AdHandlerPlugin Errors
    var invalidConstruction = "Invalid construction: AdHandlerPlugin constructor must be called using the \"new\" operator.",
        allCompanionAdsFailed = "All companion ads failed.",
        companionAdFailed = "Companion ad failed.";

    // AdHandlerPlugin Events
    var events = [
        "activeadplayerchanged",
        "adstatechanged",
        "adfailure",
        "activateadunit",
        "deactivateadunit"
    ];

    // AdHandlerPlugin Class
    var AdHandlerPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.AdHandlerPlugin)) {
            throw invalidConstruction;
        }

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        startTimeout: {
            get: function () {
                return this._startTimeout;
            },
            set: function (value) {
                this._startTimeout = value;
                if (this._controller) {
                    this._controller.startTimeout = value * 1000;
                }
            }
        },

        preferredBitrate: {
            get: function () {
                return this._preferredBitrate;
            },
            set: function (value) {
                this._preferredBitrate = value;
                if (this._mediaPlayerAdapter) {
                    this._mediaPlayerAdapter.currentBitrate = value;
                }
            }
        },

        adHandlerController: {
            get: function () {
                return this._controller;
            }
        },
        
        adPayloadHandlers: {
            get: function () {
                if (this._controller) {
                    return this._controller.adPayloadHandlers;
                } else {
                    return null;
                }
            }
        },

        activeAdPlayer: {
            get: function () {
                if (this._controller && this._controller.activeAdPlayer) {
                    return this._getVpaidAdapter(this._controller.activeAdPlayer).adPlayer;
                } else {
                    return null;
                }
            }
        },

        // Public Methods
        show: function () {
            this.mediaPlayer.addClass("pf-show-ad-container");
        },

        hide: function () {
            this.mediaPlayer.removeClass("pf-show-ad-container");
        },

        preloadAd: function (source) {
            return this._controller.preloadAdAsync(source);
        },

        playAd: function (source) {
            return this._controller.playAdAsync(source);
        },

        cancelActiveAds: function () {
            return this._controller.cancelActiveAds();
        },

        loadCompanions: function (companions, suggestedCompanionRules) {
            this._loadCompanions(null, companions, suggestedCompanionRules, null, null, null);
        },

        unloadCompanions: function (companions) {
            this._unloadCompanions(null, companions);
        },

        // Private Methods
        _setElement: function () {
            this._adContainerElement = PlayerFramework.Utilities.createElement(this.mediaPlayer.element, ["div", { "class": "pf-ad-container" }]);
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                isEnabled: true,
                startTimeout: 8,
                preferredBitrate: 0
            });
        },

        _getVpaidAdapter: function (adPlayer) {
            return PlayerFramework.Utilities.first(this._vpaidAdapters, function (item) {
                return item.nativeInstance === adPlayer;
            });
        },

        _getActiveIcons: function (adPlayer) {
            return PlayerFramework.Utilities.first(this._activeIcons, function (item) {
                return item.adPlayer === adPlayer;
            });
        },

        _getActiveCompanion: function (companion) {
            return PlayerFramework.Utilities.first(this._activeCompanions, function (item) {
                return item.companion === companion;
            });
        },

        _getAdPlayer: function (creativeSource) {
            // search plugins for ad player factories
            for (var i = 0; i < this.mediaPlayer.plugins.length; i++) {
                var plugin = this.mediaPlayer.plugins[i];
                if (plugin instanceof PlayerFramework.Advertising.AdPlayerFactoryPluginBase && plugin.isEnabled) {
                    var adPlayer = plugin.getPlayer(creativeSource);
                    if (adPlayer) {
                        var vpaidAdapter = new PlayerFramework.Advertising.VpaidAdapter(adPlayer);
                        this._vpaidAdapters.push(vpaidAdapter);
                        return vpaidAdapter.nativeInstance;
                    }
                }
            }
        },

        _setAdState: function (adState) {
            var newState = adState;
            var oldState = this.mediaPlayer.advertisingState;

            if (newState !== oldState) {
                // pause the media player if we're loading an ad or playing a linear ad
                if (this.mediaPlayer.playerState === PlayerFramework.PlayerState.started) {
                    if ((newState === Microsoft.Media.Advertising.AdState.loading || newState === Microsoft.Media.Advertising.AdState.linear) && (oldState === Microsoft.Media.Advertising.AdState.none || oldState === Microsoft.Media.Advertising.AdState.nonLinear)) {
                        this.mediaPlayer.pause();
                    } else if ((oldState === Microsoft.Media.Advertising.AdState.loading || oldState === Microsoft.Media.Advertising.AdState.linear) && (newState === Microsoft.Media.Advertising.AdState.none || newState === Microsoft.Media.Advertising.AdState.nonLinear)) {
                        this.mediaPlayer.play();
                    }
                }

                // update the media player's ad state
                this.mediaPlayer.advertisingState = newState;
            }

            // swap out the media player's view model depending on the ad state
            switch (newState) {
                case Microsoft.Media.Advertising.AdState.linear:
                    this.mediaPlayer.interactiveViewModel = new PlayerFramework.Advertising.VpaidLinearAdViewModel(this.activeAdPlayer, this.mediaPlayer);
                    break;
                case Microsoft.Media.Advertising.AdState.nonLinear:
                    this.mediaPlayer.interactiveViewModel = new PlayerFramework.Advertising.VpaidNonLinearAdViewModel(this.activeAdPlayer, this.mediaPlayer);
                    break;
                default:
                    this.mediaPlayer.interactiveViewModel = this.mediaPlayer.defaultInteractiveViewModel;
                    break;
            }
        },

        _loadPlayer: function (adPlayer) {
            var vpaidAdapter = this._getVpaidAdapter(adPlayer);
            this._adContainerElement.appendChild(vpaidAdapter.adPlayer.adElement);
        },

        _unloadPlayer: function (adPlayer) {
            var vpaidAdapter = this._getVpaidAdapter(adPlayer);
            if (this._adContainerElement.contains(vpaidAdapter.adPlayer.adElement)) {
                this._adContainerElement.removeChild(vpaidAdapter.adPlayer.adElement);
            }
            vpaidAdapter.dispose();

            var vpaidAdapterIndex = this._vpaidAdapters.indexOf(vpaidAdapter);
            this._vpaidAdapters.splice(vpaidAdapterIndex, 1);
        },

        _loadCompanions: function (adPlayer, companions, suggestedCompanionRules, creativeSource, creativeConcept, adSource) {
            if (this._previousCompanionCreativeConcept && this._previousCompanionCreativeConcept !== creativeConcept) {
                this._unloadCompanions(adPlayer);
            }

            try {
                if (companions) {
                    var totalCount = 0;
                    var failureCount = 0;

                    for (var i = 0; i < companions.length; i++) {
                        var companion = companions[i];
                        var container = null;

                        if (companion.type === Microsoft.Media.Advertising.CompanionType["static"]) {
                            if (companion.adSlotId) {
                                container = document.getElementById(companion.adSlotId);
                            }

                            if (!container && companion.width && companion.height) {
                                container = PlayerFramework.Utilities.first(document.querySelectorAll(".pf-companion-ad"), function (element) {
                                    return element.scrollWidth === companion.width && element.scrollHeight === companion.height;
                                });
                            }

                            if (container) {
                                var image = document.createElement("img");

                                this._bindEvent("load", image, this._onCompanionLoad, companion);
                                this._bindEvent("click", image, this._onCompanionClick, companion);

                                image.alt = companion.altText;
                                image.src = companion.content;

                                container.appendChild(image);
                            }
                        }

                        if (container) {
                            this._activeCompanions.push({
                                "companion": companion,
                                "container": container
                            });
                        } else {
                            failureCount++;
                        }

                        totalCount++;
                    }

                    if (suggestedCompanionRules === Microsoft.Media.Advertising.CompanionAdsRequired.any && failureCount === totalCount && totalCount > 0) {
                        throw allCompanionAdsFailed;
                    }

                    if (suggestedCompanionRules === Microsoft.Media.Advertising.CompanionAdsRequired.all && failureCount > 0) {
                        throw companionAdFailed;
                    }
                }

                this._previousCompanionCreativeConcept = creativeConcept;
            } catch (error) {
                this._unloadCompanions(adPlayer);
                throw error;
            }
        },

        _unloadCompanions: function (adPlayer, companions) {
            if (companions) {
                for (var i = 0; i < companions.length; i++) {
                    var companion = companions[i];
                    var activeCompanion = this._getActiveCompanion(companion);
                    activeCompanion.container.innerHTML = "";
                    PlayerFramework.Utilities.remove(this._activeCompanions, activeCompanion);
                }
            } else {
                for (var i = 0; i < this._activeCompanions.length; i++) {
                    var activeCompanion = this._activeCompanions[i];
                    activeCompanion.container.innerHTML = "";
                }

                this._activeCompanions = [];
                this._previousCompanionCreativeConcept = null;
            }
        },

        _showIcons: function (adPlayer, creativeSource) {
            if (!adPlayer.adIcons && creativeSource.icons && creativeSource.icons.length > 0) {
                var container = PlayerFramework.Utilities.createElement(this._adContainerElement, [
                    "div", {
                        "class": "pf-ad-icon-container"
                    }
                ]);

                var timeoutIds = [];

                // saved for later deactivation
                this._activeIcons.push({
                    "adPlayer": adPlayer,
                    "container": container,
                    "timeoutIds": timeoutIds
                });

                creativeSource.icons.forEach(function (icon) {
                    var staticResource = icon.item;
                    if (staticResource) {
                        // icon element
                        var image = document.createElement("img");

                        // icon events
                        this._bindEvent("load", image, this._onIconLoad, icon);
                        this._bindEvent("click", image, this._onIconClick, icon);

                        // icon size
                        if (icon.width) {
                            image.width = icon.width;
                        }

                        if (icon.height) {
                            image.height = icon.height;
                        }

                        // icon position
                        switch (icon.xposition) {
                            case "left":
                                image.style.left = "0px";
                                break;
                            case "right":
                                image.style.right = "0px";
                                break;
                            default:
                                var x = parseFloat(icon.xposition) || 0;
                                image.style.left = x + "px";
                                break;
                        }

                        switch (icon.yposition) {
                            case "top":
                                image.style.top = "0px";
                                break;
                            case "bottom":
                                image.style.bottom = "0px";
                                break;
                            default:
                                var y = parseFloat(icon.yposition) || 0;
                                image.style.top = y + "px";
                                break;
                        }

                        // icon offset
                        // NOTE: this does not account for pause time
                        if (icon.offset) {
                            var offsetTimeout = icon.offset;
                            var offsetTimeoutId = window.setTimeout(function () {
                                image.src = staticResource.value.rawUri;
                                container.appendChild(image);
                            }, offsetTimeout);

                            timeoutIds.push(offsetTimeoutId);
                        } else {
                            image.src = staticResource.value.rawUri;
                            container.appendChild(image);
                        }

                        // icon duration
                        // NOTE: this does not account for pause time
                        if (icon.duration) {
                            var durationTimeout = icon.duration + (icon.offset || 0);
                            var durationTimeoutId = window.setTimeout(function () {
                                container.removeChild(image);
                            }, durationTimeout);

                            timeoutIds.push(durationTimeoutId);
                        }
                    }
                }, this);
            }
        },

        _hideIcons: function (adPlayer) {
            // get active icons for this ad player
            var activeIcons = this._getActiveIcons(adPlayer);

            if (activeIcons) {
                // clear icon timeouts
                for (var i = 0; i < activeIcons.timeoutIds.length; i++) {
                    var timeoutId = activeIcons.timeoutIds[i];
                    window.clearTimeout(timeoutId);
                }

                // remove icon container and array item
                PlayerFramework.Utilities.removeElement(activeIcons.container);
                PlayerFramework.Utilities.remove(this._activeIcons, activeIcons);
            }
        },

        _onLoad: function () {
            this._vpaidAdapters = [];
            this._activeIcons = [];
            this._activeCompanions = [];
            this._previousCompanionCreativeConcept = null;

            // initialize media player adapter
            this._mediaPlayerAdapter = new PlayerFramework.Advertising.MediaPlayerAdapter(this.mediaPlayer);
            this._mediaPlayerAdapter.currentBitrate = this.preferredBitrate;

            // initialize controller
            this._controller = new Microsoft.Media.Advertising.AdHandlerController();
            this._controller.startTimeout = this.startTimeout * 1000;
            this._controller.player = this._mediaPlayerAdapter.nativeInstance;

            // search plugins for ad payload handlers
            for (var i = 0; i < this.mediaPlayer.plugins.length; i++) {
                var plugin = this.mediaPlayer.plugins[i];
                if (plugin instanceof PlayerFramework.Advertising.AdPayloadHandlerPluginBase && plugin.isEnabled) {
                    this.adPayloadHandlers.append(plugin.nativeInstance);
                }
            }
        },

        _onUnload: function () {
            // clear ad payload handlers
            this.adPayloadHandlers.clear();

            // dispose media player adapter
            this._mediaPlayerAdapter.dispose();
            this._mediaPlayerAdapter = null;

            // dispose vpaid adapters
            for (var i = 0; i < this._vpaidAdapters.length; i++) {
                this._vpaidAdapters[i].dispose();
            }

            this._vpaidAdapters = null;
            this._activeIcons = null;
            this._activeCompanions = null;
            this._previousCompanionCreativeConcept = null;
            this._controller.player = null;
            this._controller.startTimeout = null;
            this._controller = null;
        },

        _onActivate: function () {
            this._setElement();

            this._bindEvent("advertisingstatechange", this.mediaPlayer, this._onMediaPlayerAdvertisingStateChange);
            this._bindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._bindEvent("navigationrequest", this._controller, this._onControllerNavigationRequest);
            this._bindEvent("loadplayer", this._controller, this._onControllerLoadPlayer);
            this._bindEvent("unloadplayer", this._controller, this._onControllerUnloadPlayer);
            this._bindEvent("activeadplayerchanged", this._controller, this._onControllerActiveAdPlayerChanged);
            this._bindEvent("adstatechanged", this._controller, this._onControllerAdStateChanged);
            this._bindEvent("adfailure", this._controller, this._onControllerAdFailure);
            this._bindEvent("activateadunit", this._controller, this._onControllerActivateAdUnit);
            this._bindEvent("deactivateadunit", this._controller, this._onControllerDeactivateAdUnit);

            return true;
        },

        _onDeactivate: function () {
            this.cancelActiveAds();
            this.unloadCompanions();

            this._unbindEvent("advertisingstatechange", this.mediaPlayer, this._onMediaPlayerAdvertisingStateChange);
            this._unbindEvent("playerstatechange", this.mediaPlayer, this._onMediaPlayerPlayerStateChange);
            this._unbindEvent("navigationrequest", this._controller, this._onControllerNavigationRequest);
            this._unbindEvent("loadplayer", this._controller, this._onControllerLoadPlayer);
            this._unbindEvent("unloadplayer", this._controller, this._onControllerUnloadPlayer);
            this._unbindEvent("activeadplayerchanged", this._controller, this._onControllerActiveAdPlayerChanged);
            this._unbindEvent("adstatechanged", this._controller, this._onControllerAdStateChanged);
            this._unbindEvent("adfailure", this._controller, this._onControllerAdFailure);
            this._unbindEvent("activateadunit", this._controller, this._onControllerActivateAdUnit);
            this._unbindEvent("deactivateadunit", this._controller, this._onControllerDeactivateAdUnit);

            PlayerFramework.Utilities.removeElement(this._adContainerElement);

            this._adContainerElement = null;
        },

        _onUpdate: function () {
            this.cancelActiveAds();
            this.unloadCompanions();
        },

        _onMediaPlayerAdvertisingStateChange: function (e) {
            if (this.mediaPlayer.advertisingState !== PlayerFramework.AdvertisingState.none) {
                this.show();
            } else {
                this.hide();
            }
        },

        _onMediaPlayerPlayerStateChange: function (e) {
            // hide media element for preroll ads
            if (this.mediaPlayer.playerState === PlayerFramework.PlayerState.opened && this.mediaPlayer.autoplay && !this.mediaPlayer.startupTime) {
                this.mediaPlayer.mediaElement.style.visibility = "hidden";
            } else if (this.mediaPlayer.playerState !== PlayerFramework.PlayerState.starting) {
                this.mediaPlayer.mediaElement.style.visibility = "visible";
            }
        },

        _onControllerNavigationRequest: function (e) {
            PlayerFramework.Utilities.launch(e.url);
        },

        _onControllerLoadPlayer: function (e) {
            e.player = this._getAdPlayer(e.creativeSource);
            if (e.player) {
                this._loadPlayer(e.player);
            }
        },

        _onControllerUnloadPlayer: function (e) {
            this._unloadPlayer(e.player);
        },

        _onControllerActiveAdPlayerChanged: function (e) {
            this.dispatchEvent("activeadplayerchanged", e);
        },

        _onControllerAdStateChanged: function (e) {
            var adState = this._controller.adState;
            this._setAdState(adState);
            this.dispatchEvent("adstatechanged", { "adState": adState });
        },

        _onControllerAdFailure: function (e) {
            this.dispatchEvent("adfailure", e);
        },

        _onControllerActivateAdUnit: function (e) {
            this.dispatchEvent("activateadunit", e);
            this._showIcons(e.player, e.creativeSource);
            this._loadCompanions(e.player, e.companions, e.suggestedCompanionRules, e.creativeSource, e.creativeConcept, e.adSource);
        },

        _onControllerDeactivateAdUnit: function (e) {
            this.dispatchEvent("deactivateadunit", e);
            this._hideIcons(e.player);

            if (e.error) {
                this._unloadCompanions(e.player);
            }
        },

        _onIconLoad: function (icon, e) {
            if (icon.viewTracking) {
                for (var i = 0; i < icon.viewTracking.length; i++) {
                    var url = icon.viewTracking[i];
                    Microsoft.Media.Advertising.VastHelpers.fireTracking(url);
                }
            }
        },

        _onIconClick: function (icon, e) {
            if (icon.clickThrough) {
                PlayerFramework.Utilities.launch(icon.clickThrough.rawUri);
            }

            if (icon.clickTracking) {
                for (var i = 0; i < icon.clickTracking.length; i++) {
                    var url = icon.clickTracking[i];
                    Microsoft.Media.Advertising.VastHelpers.fireTracking(url);
                }
            }
        },

        _onCompanionLoad: function (companion, e) {
            if (companion.viewTracking) {
                for (var i = 0; i < companion.viewTracking.length; i++) {
                    var url = companion.viewTracking[i];
                    Microsoft.Media.Advertising.VastHelpers.fireTracking(url);
                }
            }
        },

        _onCompanionClick: function (companion, e) {
            if (companion.clickThrough) {
                PlayerFramework.Utilities.launch(companion.clickThrough.rawUri);
            }

            if (companion.clickTracking) {
                for (var i = 0; i < companion.clickTracking.length; i++) {
                    var url = companion.clickTracking[i];
                    Microsoft.Media.Advertising.VastHelpers.fireTracking(url);
                }
            }
        }
    });

    // AdHandlerPlugin Mixins
    WinJS.Class.mix(AdHandlerPlugin, PlayerFramework.Utilities.createEventProperties(events));

    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        adHandlerPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // AdHandlerPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        AdHandlerPlugin: AdHandlerPlugin
    });
    
})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // AdPayloadHandlerPluginBase Errors
    var invalidConstruction = "Invalid construction: AdPayloadHandlerPluginBase is an abstract class.";

    // AdPayloadHandlerPluginBase Class
    var AdPayloadHandlerPluginBase = WinJS.Class.derive(PlayerFramework.PluginBase, function () {
        throw invalidConstruction;
    }, {
        // Public Properties
        nativeInstance: {
            get: function () {
                return null;
            }
        }
    })

    // AdPayloadHandlerPluginBase Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        AdPayloadHandlerPluginBase: AdPayloadHandlerPluginBase
    });
    
})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // AdPlayerFactoryPluginBase Errors
    var invalidConstruction = "Invalid construction: AdPlayerFactoryPluginBase is an abstract class.";

    // AdPlayerFactoryPluginBase Class
    var AdPlayerFactoryPluginBase = WinJS.Class.derive(PlayerFramework.PluginBase, function () {
        throw invalidConstruction;
    }, {
        // Public Methods
        getPlayer: function (creativeSource) {
            return null;
        }
    })

    // AdPlayerFactoryPluginBase Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        AdPlayerFactoryPluginBase: AdPlayerFactoryPluginBase
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // AdPlayerFactoryPlugin Errors
    var invalidConstruction = "Invalid construction: AdPlayerFactoryPlugin constructor must be called using the \"new\" operator.";

    // AdPlayerFactoryPlugin Class
    var AdPlayerFactoryPlugin = WinJS.Class.derive(PlayerFramework.Advertising.AdPlayerFactoryPluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.AdPlayerFactoryPlugin)) {
            throw invalidConstruction;
        }

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        supportedVideoMimeTypes: {
            get: function () {
                return this._supportedVideoMimeTypes;
            },
            set: function (value) {
                this._supportedVideoMimeTypes = value;
            }
        },

        skippableOffset: {
            get: function () {
                return this._skippableOffset;
            },
            set: function (value) {
                this._skippableOffset = value;
            }
        },

        clickThruLinearText: {
            get: function () {
                return this._clickThruLinearText;
            },
            set: function (value) {
                this._clickThruLinearText = value;
            }
        },

        clickThruNonLinearText: {
            get: function () {
                return this._clickThruNonLinearText;
            },
            set: function (value) {
                this._clickThruNonLinearText = value;
            }
        },

        // Public Methods
        getPlayer: function (creativeSource) {
            if (creativeSource.type === Microsoft.Media.Advertising.CreativeSourceType.linear){
                if (creativeSource.apiFramework == "VPAID") {
                    // TODO: support application/x-javascript
                }
                else{
                    if (this._supportsMimeType(creativeSource.mimeType, this.supportedVideoMimeTypes) || this._canPlayType(creativeSource.codec)) {
                        var result = new PlayerFramework.Advertising.VpaidVideoAdPlayer(creativeSource.skippableOffset || Microsoft.Media.Advertising.FlexibleOffset.parse(this.skippableOffset), creativeSource.duration, creativeSource.clickUrl, this.clickThruLinearText);
                        result.msAudioCategory = this.mediaPlayer.msAudioCategory;
                        return result;
                    }
                }
            }
            else if (creativeSource.type === Microsoft.Media.Advertising.CreativeSourceType.nonLinear) {
                switch (creativeSource.mediaSourceType) {
                    case Microsoft.Media.Advertising.MediaSourceEnum.static:
                        if (this._supportsMimeType(creativeSource.mimeType, PlayerFramework.Utilities.getImageMimeTypes())) {
                            return new PlayerFramework.Advertising.VpaidImageAdPlayer(creativeSource.skippableOffset || Microsoft.Media.Advertising.FlexibleOffset.parse(this.skippableOffset), creativeSource.duration, creativeSource.clickUrl, this.clickThruNonLinearText, creativeSource.dimensions);
                        }
                    case Microsoft.Media.Advertising.MediaSourceEnum.iframe:
                        return new PlayerFramework.Advertising.VpaidIFrameAdPlayer(creativeSource.skippableOffset || Microsoft.Media.Advertising.FlexibleOffset.parse(this.skippableOffset), creativeSource.duration, creativeSource.clickUrl, this.clickThruNonLinearText, creativeSource.dimensions);
                    case Microsoft.Media.Advertising.MediaSourceEnum.html:
                        return new PlayerFramework.Advertising.VpaidHtmlAdPlayer(creativeSource.skippableOffset || Microsoft.Media.Advertising.FlexibleOffset.parse(this.skippableOffset), creativeSource.duration, creativeSource.clickUrl, this.clickThruNonLinearText, creativeSource.dimensions);
                }

            }
            return null;
        },

        // Private Methods
        _canPlayType: function(codec) {
            try {
                return this.mediaPlayer.canPlayType(codec);
            } catch (e) {
                // HACK: this will crash on some types due to bug in IE
                return false;
            }
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                isEnabled: true,
                skippableOffset: null,
                clickThruLinearText: PlayerFramework.Utilities.getResourceString("AdLinkLabel"),
                clickThruNonLinearText: "",
                supportedVideoMimeTypes: [
                    "video/mp4",
                    "video/x-ms-wmv"
                ]
            });
        },

        _supportsMimeType: function (mimeType, supportedMimeTypes) {
            return !!PlayerFramework.Utilities.first(supportedMimeTypes, function (supportedMimeType) {
                return supportedMimeType.toLowerCase() === mimeType.toLowerCase();
            });
        }
    });

    // AdPlayerFactoryPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        adPlayerFactoryPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // AdPlayerFactoryPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        AdPlayerFactoryPlugin: AdPlayerFactoryPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // AdSchedulerPlugin Errors
    var invalidConstruction = "Invalid construction: AdSchedulerPlugin constructor must be called using the \"new\" operator.";

    // AdSchedulerPlugin Class
    var AdSchedulerPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.AdSchedulerPlugin)) {
            throw invalidConstruction;
        }

        this._handledAds = null;
        this._preloadedAds = null;
        this._preloadableAds = null;
        this._advertisements = null;

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        advertisements: {
            get: function () {
                return this._advertisements;
            },
            set: function (value) {
                this._advertisements = value;
            }
        },

        preloadTime: {
            get: function () {
                return this._preloadTime;
            },
            set: function (value) {
                this._preloadTime = value;
            }
        },

        evaluateOnForwardOnly: {
            get: function () {
                return this._evaluateOnForwardOnly;
            },
            set: function (value) {
                this._evaluateOnForwardOnly = value;
            }
        },

        interruptScrub: {
            get: function () {
                return this._interruptScrub;
            },
            set: function (value) {
                this._interruptScrub = value;
            }
        },

        // Public Methods
        evaluate: function (previousTime, currentTime, syncTime, preload) {
            if (this.advertisements) {
                for (var i = 0; i < this.advertisements.length; i++) {
                    var ad = this.advertisements[i];
                    if (ad instanceof PlayerFramework.Advertising.MidrollAdvertisement) {
                        var time = this._getAdTime(ad);
                        if ((!this.evaluateOnForwardOnly || currentTime > previousTime) && time <= currentTime && time > previousTime) {
                            if (this._handledAds.indexOf(ad) === -1) {
                                this._handledAds.push(ad);
                                this._playAd(ad);
                                if (syncTime) {
                                    this.mediaPlayer.currentTime = time;
                                }
                                return true;
                            }
                        } else if (preload && this.preloadTime && Math.max(0, time - this.preloadTime) <= currentTime) {
                            if (this._handledAds.indexOf(ad) === -1 && this._preloadedAds.indexOf(ad) === -1 && this._preloadableAds.indexOf(ad) !== -1) {
                                this._preloadedAds.push(ad);
                                this._preloadAd(ad);
                            }
                        }
                    } else if (ad instanceof PlayerFramework.Advertising.PostrollAdvertisement) {
                        if (preload && this.preloadTime && Math.max(0, this.mediaPlayer.duration - this.preloadTime) <= currentTime) {
                            if (this._handledAds.indexOf(ad) === -1 && this._preloadedAds.indexOf(ad) === -1 && this._preloadableAds.indexOf(ad) !== -1) {
                                this._preloadedAds.push(ad);
                                this._preloadAd(ad);
                            }
                        }
                    }
                }
            }

            return false;
        },

        // Private Methods
        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                isEnabled: true,
                advertisements: [],
                preloadTime: 5,
                evaluateOnForwardOnly: true,
                interruptScrub: true
            });
        },

        _initializeAds: function () {
            this._handledAds = [];
            this._preloadedAds = [];
            this._preloadableAds = [];

            if (this.advertisements) {
                var seenPrerollAd = false;
                for (var i = 0; i < this.advertisements.length; i++) {
                    var ad = this.advertisements[i];
                    if (ad instanceof PlayerFramework.Advertising.PrerollAdvertisement) {
                        // don't play preroll ads if there's an initial startup time
                        if (this.mediaPlayer.startupTime) {
                            this._handledAds.push(ad);
                        }
                    } else if (ad instanceof PlayerFramework.Advertising.MidrollAdvertisement) {
                        // don't play midroll ads scheduled before the initial startup time
                        if (this.mediaPlayer.startupTime && this._getAdTime(ad) <= this.mediaPlayer.startupTime) {
                            this._handledAds.push(ad);
                        } else {
                            this._preloadableAds.push(ad);
                        }
                    } else if (ad instanceof PlayerFramework.Advertising.PostrollAdvertisement) {
                        // only preload the first postroll ad
                        if (!seenPrerollAd) {
                            seenPrerollAd = true;
                            this._preloadableAds.push(ad);
                        }
                    }
                }
            }
        },

        _getAdTime: function (ad) {
            if (ad.timePercentage !== null) {
                return ad.timePercentage * this.mediaPlayer.duration;
            } else if (ad.time !== null) {
                return ad.time;
            } else {
                return -1;
            }
        },

        _playAd: function (ad) {
            return this.mediaPlayer.adHandlerPlugin.playAd(ad.source).then(null, function () { /* swallow */ });
        },

        _playAds: function (ads) {
            var promise = null;

            for (var i = 0; i < ads.length; i++) {
                var ad = ads[i];
                if (!promise) {
                    promise = this._playAd(ad);
                } else {
                    promise = promise.then(function () {
                        return this._playAd(ad);
                    }.bind(this));
                }
            }

            return promise;
        },

        _playAdsOfType: function (type) {
            var ads = [];

            if (this.advertisements) {
                for (var i = 0; i < this.advertisements.length; i++) {
                    var ad = this.advertisements[i];
                    if (ad instanceof type && this._handledAds.indexOf(ad) === -1) {
                        this._handledAds.push(ad);
                        ads.push(ad);
                    }
                }
            }

            return this._playAds(ads);
        },

        _preloadAd: function (ad) {
            this._cancelActivePreload();
            return this._activePreloadPromise = this.mediaPlayer.adHandlerPlugin.preloadAd(ad.source);
        },

        _cancelActivePreload: function () {
            if (this._activePreloadPromise) {
                this._activePreloadPromise.cancel();
                this._activePreloadPromise = null;
            }
        },

        _onLoad: function () {
            this._handledAds = [];
            this._preloadedAds = [];
            this._preloadableAds = [];
        },

        _onUnload: function () {
            this._handledAds = null;
            this._preloadedAds = null;
            this._preloadableAds = null;
            this._advertisements = null;
        },

        _onActivate: function () {
            this._bindEvent("canplay", this.mediaPlayer, this._onMediaPlayerCanPlay);
            this._bindEvent("starting", this.mediaPlayer, this._onMediaPlayerStarting);
            this._bindEvent("ending", this.mediaPlayer, this._onMediaPlayerEnding);
            this._bindEvent("seek", this.mediaPlayer, this._onMediaPlayerSeek);
            this._bindEvent("scrub", this.mediaPlayer, this._onMediaPlayerScrub);
            this._bindEvent("scrubbing", this.mediaPlayer, this._onMediaPlayerScrubbing);
            this._bindEvent("scrubbed", this.mediaPlayer, this._onMediaPlayerScrubbed);
            this._bindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);

            return true;
        },

        _onDeactivate: function () {
            this._cancelActivePreload();
            
            this._unbindEvent("canplay", this.mediaPlayer, this._onMediaPlayerCanPlay);
            this._unbindEvent("starting", this.mediaPlayer, this._onMediaPlayerStarting);
            this._unbindEvent("ending", this.mediaPlayer, this._onMediaPlayerEnding);
            this._unbindEvent("seek", this.mediaPlayer, this._onMediaPlayerSeek);
            this._unbindEvent("scrub", this.mediaPlayer, this._onMediaPlayerScrub);
            this._unbindEvent("scrubbing", this.mediaPlayer, this._onMediaPlayerScrubbing);
            this._unbindEvent("scrubbed", this.mediaPlayer, this._onMediaPlayerScrubbed);
            this._unbindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);
        },

        _onUpdate: function () {
            this._cancelActivePreload();
        },

        _onMediaPlayerCanPlay: function (e) {
            this._initializeAds();
        },

        _onMediaPlayerStarting: function (e) {
            if (this.mediaPlayer.allowStartingDeferrals) {
                var promise = this._playAdsOfType(PlayerFramework.Advertising.PrerollAdvertisement);
                if (promise) {
                    e.detail.setPromise(promise);
                }
            }
        },

        _onMediaPlayerEnding: function (e) {
            var promise = this._playAdsOfType(PlayerFramework.Advertising.PostrollAdvertisement);
            if (promise) {
                e.detail.setPromise(promise);
            }
        },

        _onMediaPlayerSeek: function (e) {
            if (!e.detail.canceled) {
                e.detail.canceled = this.evaluate(e.detail.previousTime, e.detail.time, true, false);
            }
        },

        _onMediaPlayerScrub: function (e) {
            this._cancelActivePreload();
        },

        _onMediaPlayerScrubbing: function (e) {
            if (this.interruptScrub && !e.detail.canceled) {
                e.detail.canceled = this.evaluate(e.detail.startTime, e.detail.time, true, false);
            }
        },

        _onMediaPlayerScrubbed: function (e) {
            if (!e.detail.canceled) {
                e.detail.canceled = this.evaluate(e.detail.startTime, e.detail.time, this.interruptScrub, false);
            }
        },

        _onMediaPlayerTimeUpdate: function (e) {
            if (!this.mediaPlayer.scrubbing) {
                this.evaluate(-1, this.mediaPlayer.currentTime, false, true);
            }
        }
    });

    // AdSchedulerPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        adSchedulerPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // AdSchedulerPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        AdSchedulerPlugin: AdSchedulerPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // Advertisement Errors
    var invalidConstruction = "Invalid construction: AdvertisementBase constructor must be called using the \"new\" operator.",
        invalidMidrollAdvertisementConstruction = "Invalid construction: MidrollAdvertisement constructor must be called using the \"new\" operator.",
        invalidPrerollAdvertisementConstruction = "Invalid construction: PrerollAdvertisement constructor must be called using the \"new\" operator.",
        invalidPostrollAdvertisementConstruction = "Invalid construction: PostrollAdvertisement constructor must be called using the \"new\" operator.";

    // AdvertisementBase Class
    var AdvertisementBase = WinJS.Class.define(function () {
        if (!(this instanceof PlayerFramework.Advertising.AdvertisementBase)) {
            throw invalidConstruction;
        }

        this._source = null;
    } , {
        // Public Properties
        source: {
            get: function () {
                return this._source;
            },
            set: function (value) {
                this._source = value;
            }
        }
    });

    // MidrollAdvertisement Class
    var MidrollAdvertisement = WinJS.Class.derive(AdvertisementBase, function () {
        if (!(this instanceof PlayerFramework.Advertising.MidrollAdvertisement)) {
            throw invalidMidrollAdvertisementConstruction;
        }

        this._time = null;
        this._timePercentage = null;

        PlayerFramework.Advertising.AdvertisementBase.call(this);
    }, {
        // Public Properties
        time: {
            get: function () {
                return this._time;
            },
            set: function (value) {
                this._time = value;
            }
        },

        timePercentage: {
            get: function () {
                return this._timePercentage;
            },
            set: function (value) {
                this._timePercentage = value;
            }
        }
    });

    // PrerollAdvertisement Class
    var PrerollAdvertisement = WinJS.Class.derive(AdvertisementBase, function () {
        if (!(this instanceof PlayerFramework.Advertising.PrerollAdvertisement)) {
            throw invalidPrerollAdvertisementConstruction;
        }

        PlayerFramework.Advertising.AdvertisementBase.call(this);
    });

    // PostrollAdvertisement Class
    var PostrollAdvertisement = WinJS.Class.derive(AdvertisementBase, function () {
        if (!(this instanceof PlayerFramework.Advertising.PostrollAdvertisement)) {
            throw invalidPostrollAdvertisementConstruction;
        }

        PlayerFramework.Advertising.AdvertisementBase.call(this);
    });

    // Advertisement Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        AdvertisementBase: AdvertisementBase,
        MidrollAdvertisement: MidrollAdvertisement,
        PrerollAdvertisement: PrerollAdvertisement,
        PostrollAdvertisement: PostrollAdvertisement
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // FreeWheelPlugin Errors
    var invalidConstruction = "Invalid construction: FreeWheelPlugin constructor must be called using the \"new\" operator.",
        companionAdFailed = "Companion ad failed.";

    var freeWheelTrackingEventArea = "freewheel";

    // FreeWheelPlugin Class
    var FreeWheelPlugin = WinJS.Class.derive(PlayerFramework.Plugins.AdSchedulerPlugin, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.FreeWheelPlugin)) {
            throw invalidConstruction;
        }

        this._lastTrackingTime = null;
        this._trackingEnded = false;

        PlayerFramework.Plugins.AdSchedulerPlugin.call(this, options);
    }, {
        // Public Properties
        source: {
            get: function () {
                return this._source;
            },
            set: function (value) {
                this._source = value;
            }
        },

        // Public Methods
        loadAds: function (source) {
            this._adSlots = [];

            var promise = Microsoft.Media.Advertising.FreeWheelFactory.loadSource(new Windows.Foundation.Uri(source)).then(
                function (result) {
                    var adResponse = result;

                    var videoTracking = PlayerFramework.Utilities.first(adResponse.siteSection.videoPlayer.videoAsset.eventCallbacks, function (eventCallback) {
                        return eventCallback.name === Microsoft.Media.Advertising.FWEventCallback.videoView;
                    });

                    if (videoTracking) {
                        this._lastTrackingTime = null;
                        this._trackingEnded = false;

                        // position tracking
                        this.mediaPlayer.positionTrackingPlugin.trackingEvents.push({ positionPercentage: 1, data: videoTracking, area: freeWheelTrackingEventArea });

                        // play time tracking
                        for (var i = 0; i < 60; i += 15) {
                            this.mediaPlayer.playTimeTrackingPlugin.trackingEvents.push({ playTime: i, data: videoTracking, area: freeWheelTrackingEventArea });
                        }

                        for (var i = 60; i < 60 * 3; i += 30) {
                            this.mediaPlayer.playTimeTrackingPlugin.trackingEvents.push({ playTime: i, data: videoTracking, area: freeWheelTrackingEventArea });
                        }

                        for (var i = 60 * 3; i < 60 * 10; i += 60) {
                            this.mediaPlayer.playTimeTrackingPlugin.trackingEvents.push({ playTime: i, data: videoTracking, area: freeWheelTrackingEventArea });
                        }

                        for (var i = 60 * 10; i < 60 * 30; i += 120) {
                            this.mediaPlayer.playTimeTrackingPlugin.trackingEvents.push({ playTime: i, data: videoTracking, area: freeWheelTrackingEventArea });
                        }

                        for (var i = 60 * 30; i < 60 * 60; i += 300) {
                            this.mediaPlayer.playTimeTrackingPlugin.trackingEvents.push({ playTime: i, data: videoTracking, area: freeWheelTrackingEventArea });
                        }

                        for (var i = 60 * 60; i < 60 * 180; i += 600) {
                            this.mediaPlayer.playTimeTrackingPlugin.trackingEvents.push({ playTime: i, data: videoTracking, area: freeWheelTrackingEventArea });
                        }
                    }

                    var videoAsset = adResponse.siteSection.videoPlayer.videoAsset;

                    var promises = null;
                    if (videoAsset) {
                        promises = [];
                        for (var i = 0; i < videoAsset.adSlots.length; i++) {
                            var adSlot = videoAsset.adSlots[i];
                            (function (adSlot) {
                                promises.push(Microsoft.Media.Advertising.FreeWheelFactory.getAdDocumentPayload(adSlot, adResponse).then(function (payload) {
                                    var ad = null;
                                    switch (adSlot.timePositionClass) {
                                        case "preroll":
                                            ad = new PlayerFramework.Advertising.PrerollAdvertisement();
                                            break;

                                        case "postroll":
                                            ad = new PlayerFramework.Advertising.PostrollAdvertisement();
                                            break;

                                        default:
                                            ad = new PlayerFramework.Advertising.MidrollAdvertisement();
                                            ad.time = adSlot.timePosition / 1000;
                                            break;
                                    }

                                    ad.source = new Microsoft.PlayerFramework.Js.Advertising.AdSource();
                                    ad.source.type = Microsoft.Media.Advertising.DocumentAdPayloadHandler.adType;
                                    ad.source.payload = payload;

                                    this.advertisements.push(ad);
                                    this._adSlots.push({ "ad": ad, "adSlot": adSlot });
                                }.bind(this), function () { /* ignore */ }));
                            }).bind(this)(adSlot);
                        }
                        this._adResponse = adResponse;
                    }

                    this._loadCompanions();
                    if (promises) {
                        return WinJS.Promise.join(promises);
                    }
                }.bind(this)
            );

            promise.done(
                function () {
                    PlayerFramework.Utilities.remove(this._activePromises, promise);
                }.bind(this),
                function (e) {
                    PlayerFramework.Utilities.remove(this._activePromises, promise);
                }.bind(this)
            );

            this._activePromises.push(promise);
            return promise;
        },

        // Private Methods
        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                isEnabled: true,
                advertisements: [],
                preloadTime: 5,
                evaluateOnForwardOnly: true,
                interruptScrub: true,
                source: null
            });
        },

        _getAdSlot: function (ad) {
            var item = PlayerFramework.Utilities.first(this._adSlots, function (item) {
                return item.ad === ad;
            });

            if (item) {
                return item.adSlot;
            }

            return null;
        },

        _playAd: function (ad) {
            var adSlot = this._getAdSlot(ad);

            if (adSlot) {
                var impression = PlayerFramework.Utilities.first(adSlot.eventCallbacks, function (eventCallback) {
                    return eventCallback.type === Microsoft.Media.Advertising.FWCallbackType.impression && eventCallback.name === Microsoft.Media.Advertising.FWEventCallback.slotImpression;
                });

                if (impression) {
                    var urls = PlayerFramework.Utilities.getArray(impression.getUrls());
                    for (var i = 0; i < urls.length; i++) {
                        var url = urls[i];
                        Microsoft.Media.Advertising.AdTracking.current.fireTracking(url);
                    }
                }
            }

            return PlayerFramework.Plugins.AdSchedulerPlugin.prototype._playAd.call(this, ad);
        },

        _loadCompanions: function () {
            if (this._adResponse) {
                var enumerable = Microsoft.Media.Advertising.FreeWheelFactory.getNonTemporalCompanions(this._adResponse);
                this._companions = PlayerFramework.Utilities.getArray(enumerable);
                this.mediaPlayer.adHandlerPlugin.loadCompanions(this._companions, Microsoft.Media.Advertising.CompanionAdsRequired.all)
            }
        },

        _unloadCompanions: function () {
            if (this._companions) {
                this.mediaPlayer.adHandlerPlugin.unloadCompanions(this._companions);
                this._companions = null;
            }
        },

        _getTrackingUrl: function (url, currentPlayTime, start, end) {
            var init = start ? 1 : 0;
            var last = end ? 1 : 0;
            var ct = this._lastTrackingTime !== null ? Math.round(currentPlayTime - this._lastTrackingTime) : 0;

            // save for next time
            this._lastTrackingTime = currentPlayTime;

            if (url.indexOf("?") !== -1) {
                return PlayerFramework.Utilities.formatString("{0}&init={1}&last={2}&ct={3}", url, init, last, ct);
            } else {
                return PlayerFramework.Utilities.formatString("{0}?init={1}&last={2}&ct={3}", url, init, last, ct);
            }
        },

        _onLoad: function () {
            this._adSlots = [];
            this._adResponse = null;
            this._companions = null;

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onLoad.call(this);
        },

        _onUnload: function () {
            this._adSlots = null;
            this._adResponse = null;
            this._companions = null;

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onUnload.call(this);
        },

        _onActivate: function () {
            this._bindEvent("loading", this.mediaPlayer, this._onMediaPlayerLoading);
            this._bindEvent("eventtracked", this.mediaPlayer.playTimeTrackingPlugin, this._onMediaPlayerPlayTimeEventTracked);
            this._bindEvent("eventtracked", this.mediaPlayer.positionTrackingPlugin, this._onMediaPlayerPositionEventTracked);

            this._loadCompanions();

            return PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onActivate.call(this);
        },

        _onDeactivate: function () {
            this._unloadCompanions();

            this._unbindEvent("loading", this.mediaPlayer, this._onMediaPlayerLoading);
            this._unbindEvent("eventtracked", this.mediaPlayer.playTimeTrackingPlugin, this._onMediaPlayerPlayTimeEventTracked);
            this._unbindEvent("eventtracked", this.mediaPlayer.positionTrackingPlugin, this._onMediaPlayerPositionEventTracked);

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onDeactivate.call(this);
        },

        _onUpdate: function () {
            this._unloadCompanions();

            this._adSlots = [];
            this._adResponse = null;
            this._companions = null;

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onUpdate.call(this);
        },

        _onMediaPlayerLoading: function (e) {
            if (this.source) {
                var promise = this.loadAds(this.source);
                e.detail.setPromise(promise);
            }
        },

        _onMediaPlayerPlayTimeEventTracked: function (e) {
            if (!this._trackingEnded) {
                var trackingEvent = e.detail.trackingEvent;
                if (trackingEvent.area === freeWheelTrackingEventArea) {
                    if (trackingEvent.data instanceof Microsoft.Media.Advertising.FWEventCallback) {
                        var urls = PlayerFramework.Utilities.getArray(trackingEvent.data.getUrls());
                        var start = trackingEvent.playTime === 0;
                        for (var i = 0; i < urls.length; i++) {
                            var url = urls[i];
                            var trackingUrl = this._getTrackingUrl(url, trackingEvent.playTime, start, false);
                            Microsoft.Media.Advertising.AdTracking.current.fireTracking(trackingUrl);
                        }
                    }
                }
            }
        },

        _onMediaPlayerPositionEventTracked: function (e) {
            if (!this._trackingEnded) {
                var trackingEvent = e.detail.trackingEvent;
                if (trackingEvent.area === freeWheelTrackingEventArea) {
                    if (trackingEvent.data instanceof Microsoft.Media.Advertising.FWEventCallback) {
                        var urls = PlayerFramework.Utilities.getArray(trackingEvent.data.getUrls());
                        var currentTime = this.mediaPlayer.playTimeTrackingPlugin.playTime;
                        for (var i = 0; i < urls.length; i++) {
                            var url = urls[i];
                            var trackingUrl = this._getTrackingUrl(url, currentTime, false, true);
                            Microsoft.Media.Advertising.AdTracking.current.fireTracking(trackingUrl);
                        }
                        this._trackingEnded = true; // set this flag to prevent further tracking
                    }
                }
            }
        }
    });

    // FreeWheelPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        freeWheelPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // FreeWheelPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        FreeWheelPlugin: FreeWheelPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // MastSchedulerPlugin Errors
    var invalidConstruction = "Invalid construction: MastSchedulerPlugin constructor must be called using the \"new\" operator.";

    // MastSchedulerPlugin Class
    var MastSchedulerPlugin = WinJS.Class.derive(PlayerFramework.PluginBase, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.MastSchedulerPlugin)) {
            throw invalidConstruction;
        }

        this._activeTriggers = [];

        PlayerFramework.PluginBase.call(this, options);
    }, {
        // Public Properties
        source: {
            get: function () {
                return this._source;
            },
            set: function (value) {
                this._source = value;
            }
        },

        activeTriggers: {
            get: function () {
                return this._activeTriggers;
            }
        },

        // Public Methods
        loadAds: function (source) {
            this._mainsail.clear();

            var promise = this._mainsail.loadSource(new Windows.Foundation.Uri(source));

            promise.done(
                function () {
                    PlayerFramework.Utilities.remove(this._activePromises, promise);
                }.bind(this),
                function (e) {
                    PlayerFramework.Utilities.remove(this._activePromises, promise);
                }.bind(this)
            );
            
            this._activePromises.push(promise);
            return promise;
        },

        cancelActiveTriggers: function () {
            for (var i = 0; i < this._activeTriggers.length; i++) {
                var trigger = this._activeTriggers[i];
                trigger.promise.cancel();
            }

            this._activeTriggers = [];
        },

        // Private Methods
        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                isEnabled: true,
                source: null
            });
        },

        _onLoad: function () {
            this._isStarted = false;
            this._mastAdapter = new Microsoft.PlayerFramework.Js.Advertising.MastAdapter();
            this._mainsail = new Microsoft.Media.Advertising.Mainsail(this._mastAdapter);
        },

        _onUnload: function () {
            this._isStarted = false;
            this._mastAdapter = null;
            this._mainsail.MastInterface = null;
            this._mainsail = null;
        },

        _onActivate: function () {
            this._bindEvent("activatetrigger", this._mainsail, this._onMainsailActivateTrigger);
            this._bindEvent("deactivatetrigger", this._mainsail, this._onMainsailDeactivateTrigger);
            this._bindEvent("canplay", this.mediaPlayer, this._onMediaPlayerCanPlay);
            this._bindEvent("play", this.mediaPlayer, this._onMediaPlayerPlay);
            this._bindEvent("pause", this.mediaPlayer, this._onMediaPlayerPause);
            this._bindEvent("stopped", this.mediaPlayer, this._onMediaPlayerStopped);
            this._bindEvent("seeked", this.mediaPlayer, this._onMediaPlayerSeeked);
            this._bindEvent("loading", this.mediaPlayer, this._onMediaPlayerLoading);
            this._bindEvent("starting", this.mediaPlayer, this._onMediaPlayerStarting);
            this._bindEvent("ending", this.mediaPlayer, this._onMediaPlayerEnding);
            this._bindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);
            this._bindEvent("durationchange", this.mediaPlayer, this._onMediaPlayerDurationChange);
            this._bindEvent("volumechange", this.mediaPlayer, this._onMediaPlayerVolumeChange);
            this._bindEvent("mutedchange", this.mediaPlayer, this._onMediaPlayerMutedChange);
            this._bindEvent("fullscreenchange", this.mediaPlayer, this._onMediaPlayerFullScreenChange);
            this._bindEvent("error", this.mediaPlayer, this._onMediaPlayerError);
            if (PlayerFramework.Utilities.isWinJS1) {
                this._bindEvent("resize", this.mediaPlayer.element, this._onMediaPlayerResize);
            }
            else { // IE11 no longer supports resize event for arbitrary elements. The best we can do is listen to the window resize event.
                this._bindEvent("resize", window, this._onMediaPlayerResize);
            }
            if (window.PointerEvent) {
                this._bindEvent("pointerover", this.mediaPlayer.element, this._onMediaPlayerMSPointerOver);
            }
            else {
                this._bindEvent("MSPointerOver", this.mediaPlayer.element, this._onMediaPlayerMSPointerOver);
            }
            
            this._mastAdapter.setContentTitle("");
            this._mastAdapter.setContentUrl(this.mediaPlayer.src);
            this._mastAdapter.setContentBitrate(0);
            this._mastAdapter.setContentWidth(0);
            this._mastAdapter.setContentHeight(0);
            this._mastAdapter.setPosition(0);
            this._mastAdapter.setDuration(0);
            this._mastAdapter.setPlayerWidth(this.mediaPlayer.element.scrollWidth);
            this._mastAdapter.setPlayerHeight(this.mediaPlayer.element.scrollHeight);
            this._mastAdapter.setFullScreen(this.mediaPlayer.isFullScreen);
            this._mastAdapter.setHasAudio(true);
            this._mastAdapter.setHasVideo(true);
            this._mastAdapter.setHasCaptions(this.mediaPlayer.captionTracks && this.mediaPlayer.captionTracks.length > 0);
            this._mastAdapter.setCaptionsActive(!!this.mediaPlayer.currentCaptionTrack);

            return true;
        },

        _onDeactivate: function () {
            this._mastAdapter.invokeEnd();

            this.cancelActiveTriggers();
            this._mainsail.clear();
            
            this._unbindEvent("activatetrigger", this._mainsail, this._onMainsailActivateTrigger);
            this._unbindEvent("deactivatetrigger", this._mainsail, this._onMainsailDeactivateTrigger);
            this._unbindEvent("canplay", this.mediaPlayer, this._onMediaPlayerCanPlay);
            this._unbindEvent("play", this.mediaPlayer, this._onMediaPlayerPlay);
            this._unbindEvent("pause", this.mediaPlayer, this._onMediaPlayerPause);
            this._unbindEvent("stopped", this.mediaPlayer, this._onMediaPlayerStopped);
            this._unbindEvent("seeked", this.mediaPlayer, this._onMediaPlayerSeeked);
            this._unbindEvent("loading", this.mediaPlayer, this._onMediaPlayerLoading);
            this._unbindEvent("starting", this.mediaPlayer, this._onMediaPlayerStarting);
            this._unbindEvent("ending", this.mediaPlayer, this._onMediaPlayerEnding);
            this._unbindEvent("timeupdate", this.mediaPlayer, this._onMediaPlayerTimeUpdate);
            this._unbindEvent("durationchange", this.mediaPlayer, this._onMediaPlayerDurationChange);
            this._unbindEvent("volumechange", this.mediaPlayer, this._onMediaPlayerVolumeChange);
            this._unbindEvent("mutedchange", this.mediaPlayer, this._onMediaPlayerMutedChange);
            this._unbindEvent("fullscreenchange", this.mediaPlayer, this._onMediaPlayerFullScreenChange);
            this._unbindEvent("error", this.mediaPlayer, this._onMediaPlayerError);
            if (PlayerFramework.Utilities.isWinJS1) {
                this._unbindEvent("resize", this.mediaPlayer.element, this._onMediaPlayerResize);
            }
            else { // IE11 no longer supports resize event for arbitrary elements. The best we can do is listen to the window resize event.
                this._unbindEvent("resize", window, this._onMediaPlayerResize);
            }
            if (window.PointerEvent) {
                this._unbindEvent("pointerover", this.mediaPlayer.element, this._onMediaPlayerMSPointerOver);
            }
            else {
                this._unbindEvent("MSPointerOver", this.mediaPlayer.element, this._onMediaPlayerMSPointerOver);
            }
        },

        _onUpdate: function () {
            this.cancelActiveTriggers();
            this._mainsail.clear();

            this._mastAdapter.setContentTitle("");
            this._mastAdapter.setContentUrl(this.mediaPlayer.src);
            this._mastAdapter.setContentBitrate(0);
            this._mastAdapter.setContentWidth(0);
            this._mastAdapter.setContentHeight(0);
            this._mastAdapter.setPosition(0);
            this._mastAdapter.setDuration(0);
            this._mastAdapter.setPlayerWidth(this.mediaPlayer.element.scrollWidth);
            this._mastAdapter.setPlayerHeight(this.mediaPlayer.element.scrollHeight);
            this._mastAdapter.setFullScreen(this.mediaPlayer.isFullScreen);
            this._mastAdapter.setHasAudio(true);
            this._mastAdapter.setHasVideo(true);
            this._mastAdapter.setHasCaptions(this.mediaPlayer.captionTracks && this.mediaPlayer.captionTracks.length > 0);
            this._mastAdapter.setCaptionsActive(!!this.mediaPlayer.currentCaptionTrack);
        },

        _onMainsailActivateTrigger: function (e) {
            if (e.trigger.sources.length) {
                var source = e.trigger.sources[0];
                var sourceUri = new Windows.Foundation.Uri(source.uri);
                var remoteSource = new Microsoft.PlayerFramework.Js.Advertising.RemoteAdSource(sourceUri, source.format);
                var promise = this.mediaPlayer.adHandlerPlugin.playAd(remoteSource).then(null, function () { /* swallow */ });
                var trigger = { trigger: e.trigger, promise: promise };

                promise.done(
                    function () {
                        PlayerFramework.Utilities.remove(this._activeTriggers, trigger);
                    }.bind(this)
                );

                this._activeTriggers.push(trigger);
            }
        },

        _onMainsailDeactivateTrigger: function (e) {
            for (var i = 0; i < this._activeTriggers.length; i++) {
                var trigger = this._activeTriggers[i];
                if (trigger === e.trigger) {
                    trigger.promise.cancel();
                    PlayerFramework.Utilities.remove(this._activeTriggers, trigger);
                    return;
                }
            }
        },

        _onMediaPlayerCanPlay: function (e) {
            this._mastAdapter.setContentWidth(this.mediaPlayer.videoWidth);
            this._mastAdapter.setContentHeight(this.mediaPlayer.videoHeight);
        },

        _onMediaPlayerPlay: function (e) {
            this._mastAdapter.invokePlay();
        },

        _onMediaPlayerPause: function (e) {
            this._mastAdapter.invokePause();
        },

        _onMediaPlayerStopped: function (e) {
            this._mastAdapter.invokeStop();
        },

        _onMediaPlayerSeeked: function (e) {
            this._mastAdapter.invokeSeek();
        },

        _onMediaPlayerLoading: function (e) {
            if (this.source) {
                var promise = this.loadAds(this.source);
                e.detail.setPromise(promise);
            }
        },

        _onMediaPlayerStarting: function (e) {
            if (!this._isStarted) {
                this._isStarted = true;
                this._mastAdapter.invokeItemStart();

                if (this.mediaPlayer.allowStartingDeferrals) {
                    var triggerPromises = [];

                    for (var i = 0; i < this._activeTriggers.length; i++) {
                        var trigger = this._activeTriggers[i];
                        triggerPromises.push(trigger.promise);
                    }

                    var promise = WinJS.Promise.join(triggerPromises);

                    promise.done(
                        function () {
                            PlayerFramework.Utilities.remove(this._activePromises, promise);
                        }.bind(this),
                        function (e) {
                            PlayerFramework.Utilities.remove(this._activePromises, promise);
                        }.bind(this)
                    );

                    this._activePromises.push(promise);
                    e.detail.setPromise(promise);
                }
            }
        },

        _onMediaPlayerEnding: function (e) {
            var activeTriggersBeforeEnd = [];
            var activeTriggerPromises = [];

            for (var i = 0; i < this._activeTriggers.length; i++) {
                var trigger = this._activeTriggers[i];
                activeTriggersBeforeEnd.push(trigger);
            }
            
            this._mastAdapter.invokeItemEnd();

            for (var i = 0; i < this._activeTriggers.length; i++) {
                var trigger = this._activeTriggers[i];
                if (activeTriggersBeforeEnd.indexOf(trigger) === -1) {
                    activeTriggerPromises.push(trigger.promise);
                }
            }
            
            if (activeTriggerPromises.length) {
                var promise = WinJS.Promise.join(activeTriggerPromises);
                
                promise.done(
                    function () {
                        PlayerFramework.Utilities.remove(this._activePromises, promise);
                    }.bind(this),
                    function (e) {
                        PlayerFramework.Utilities.remove(this._activePromises, promise);
                    }.bind(this)
                );

                this._activePromises.push(promise);
                e.detail.setPromise(promise);
            }
        },

        _onMediaPlayerTimeUpdate: function (e) {
            if (this._mastAdapter.isPlaying && !this.mediaPlayer.scrubbing) {
                this._mastAdapter.setPosition(this.mediaPlayer.currentTime * 1000);
                this._mainsail.evaluateTriggers();
            }
        },

        _onMediaPlayerDurationChange: function (e) {
            this._mastAdapter.setDuration(this.mediaPlayer.duration * 1000);
        },

        _onMediaPlayerVolumeChange: function (e) {
            this._mastAdapter.invokeVolumeChange();
        },

        _onMediaPlayerMutedChange: function (e) {
            if (this.mediaPlayer.muted) {
                this._mastAdapter.invokeMute();
            }
        },

        _onMediaPlayerFullScreenChange: function (e) {
            this._mastAdapter.invokeFullScreenChange();
        },

        _onMediaPlayerError: function (e) {
            this._mastAdapter.invokeError();
        },

        _onMediaPlayerResize: function (e) {
            this._mastAdapter.invokePlayerSizeChanged();
            this._mastAdapter.setPlayerWidth(this.mediaPlayer.element.scrollWidth);
            this._mastAdapter.setPlayerHeight(this.mediaPlayer.element.scrollHeight);
        },

        _onMediaPlayerMSPointerOver: function (e) {
            this._mastAdapter.invokeMouseOver();
        }
    });

    // MastSchedulerPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        mastSchedulerPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // MastSchedulerPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        MastSchedulerPlugin: MastSchedulerPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // MediaPlayerAdapter Errors
    var invalidConstruction = "Invalid construction: MediaPlayerAdapter constructor must be called using the \"new\" operator.",
        invalidMediaPlayer = "Invalid argument: MediaPlayerAdapter expects a MediaPlayer as the first argument.";

    // MediaPlayerAdapter Class
    var MediaPlayerAdapter = WinJS.Class.define(function (mediaPlayer) {
        if (!(this instanceof PlayerFramework.Advertising.MediaPlayerAdapter)) {
            throw invalidConstruction;
        }

        if (!(mediaPlayer instanceof PlayerFramework.MediaPlayer)) {
            throw invalidMediaPlayer;
        }

        this._mediaPlayer = mediaPlayer;
        
        this._nativeInstance = new Microsoft.PlayerFramework.Js.Advertising.MediaPlayerAdapterBridge();
        this._nativeInstance.volume = this._mediaPlayer.volume;
        this._nativeInstance.isMuted = this._mediaPlayer.muted;
        this._nativeInstance.isFullScreen = this._mediaPlayer.isFullScreen;
        this._nativeInstance.dimensions = PlayerFramework.Utilities.measureElement(this._mediaPlayer.element);

        this._currentBitrate = 0;

        this._bindEvent("volumechange", this._mediaPlayer, this._onMediaPlayerVolumeChange);
        this._bindEvent("mutedchange", this._mediaPlayer, this._onMediaPlayerMutedChange);
        this._bindEvent("fullscreenchange", this._mediaPlayer, this._onMediaPlayerFullScreenChange);
        this._bindEvent("currentbitraterequested", this._nativeInstance, this._onCurrentBitrateRequested);
        this._bindEvent("currentpositionrequested", this._nativeInstance, this._onCurrentPositionRequested);
        if (PlayerFramework.Utilities.isWinJS1) {
            this._bindEvent("resize", this._mediaPlayer.element, this._onMediaPlayerResize);
        }
        else { // IE11 no longer supports resize event for arbitrary elements. The best we can do is listen to the window resize event.
            this._bindEvent("resize", window, this._onMediaPlayerResize);
        }
    }, {
        // Public Properties
        nativeInstance: {
            get: function () {
                return this._nativeInstance;
            }
        },

        currentBitrate: {
            get: function () {
                return this._currentBitrate;
            },
            set: function (value) {
                this._currentBitrate = value;
            }
        },

        // Public Methods
        dispose: function () {
            this._unbindEvents();
            this._mediaPlayer = null;
            this._nativeInstance = null;
        },

        // Private Methods
        _onMediaPlayerVolumeChange: function (e) {
            this._nativeInstance.volume = this._mediaPlayer.volume;
        },

        _onMediaPlayerMutedChange: function (e) {
            this._nativeInstance.isMuted = this._mediaPlayer.muted;
        },

        _onMediaPlayerFullScreenChange: function (e) {
            this._nativeInstance.isFullScreen = this._mediaPlayer.isFullScreen;
        },

        _onMediaPlayerResize: function (e) {
            this._nativeInstance.dimensions = PlayerFramework.Utilities.measureElement(this._mediaPlayer.element);
        },

        _onCurrentBitrateRequested: function (e) {
            e.result = this._currentBitrate;
        },

        _onCurrentPositionRequested: function (e) {
            e.result = this._mediaPlayer.currentTime;
        }
    });

    // MediaPlayerAdapter Mixins
    WinJS.Class.mix(MediaPlayerAdapter, PlayerFramework.Utilities.eventBindingMixin);

    // MediaPlayerAdapter Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        MediaPlayerAdapter: MediaPlayerAdapter
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // VmapSchedulerPlugin Errors
    var invalidConstruction = "Invalid construction: VmapSchedulerPlugin constructor must be called using the \"new\" operator.";

    // VmapSchedulerPlugin Class
    var VmapSchedulerPlugin = WinJS.Class.derive(PlayerFramework.Plugins.AdSchedulerPlugin, function (options) {
        if (!(this instanceof PlayerFramework.Plugins.VmapSchedulerPlugin)) {
            throw invalidConstruction;
        }

        PlayerFramework.Plugins.AdSchedulerPlugin.call(this, options);
    }, {
        // Public Properties
        source: {
            get: function () {
                return this._source;
            },
            set: function (value) {
                this._source = value;
            }
        },

        // Public Methods
        loadAds: function (source) {
            this._adBreaks = [];

            var promise = Microsoft.Media.Advertising.VmapFactory.loadSource(new Windows.Foundation.Uri(source)).then(
                function (result) {
                    for (var i = 0; i < result.adBreaks.length; i++) {
                        var adBreak = result.adBreaks[i];
                        var ad = null;

                        switch (adBreak.timeOffset) {
                            case "start":
                                ad = new PlayerFramework.Advertising.PrerollAdvertisement();
                                break;

                            case "end":
                                ad = new PlayerFramework.Advertising.PostrollAdvertisement();
                                break;

                            default:
                                var offset = Microsoft.Media.Advertising.FlexibleOffset.parse(adBreak.timeOffset);

                                if (offset) {
                                    ad = new PlayerFramework.Advertising.MidrollAdvertisement();
                                    if (offset.isAbsolute) {
                                        ad.time = offset.absoluteOffset / 1000;
                                    } else {
                                        ad.timePercentage = offset.relativeOffset;
                                    }
                                }

                                break;
                        }

                        if (ad) {
                            ad.source = this._getAdSource(adBreak.adSource);
                            if (ad.source) {
                                this.advertisements.push(ad);
                                this._adBreaks.push({ "ad": ad, "adBreak": adBreak });
                            }
                        }
                    }
                }.bind(this)
            );

            promise.done(
                function () {
                    PlayerFramework.Utilities.remove(this._activePromises, promise);
                }.bind(this),
                function (e) {
                    PlayerFramework.Utilities.remove(this._activePromises, promise);
                }.bind(this)
            );

            this._activePromises.push(promise);
            return promise;
        },

        // Private Methods
        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                isEnabled: true,
                advertisements: [],
                preloadTime: 5,
                evaluateOnForwardOnly: true,
                interruptScrub: true,
                source: null
            });
        },

        _getAdSource: function (source) {
            var adSource = null;

            if (source.vastData) {
                adSource = new Microsoft.PlayerFramework.Js.Advertising.AdSource();
                adSource.type = Microsoft.Media.Advertising.VastAdPayloadHandler.adType;
                adSource.payload = source.vastData;
            } else if (source.customAdData) {
                adSource = new Microsoft.PlayerFramework.Js.Advertising.AdSource();
                adSource.type = source.customAdDataTemplateType;
                adSource.payload = source.customAdData;
            } else if (source.adTag) {
                adSource = new Microsoft.PlayerFramework.Js.Advertising.RemoteAdSource();
                adSource.type = source.adTagTemplateType;
                adSource.uri = source.adTag;
            }

            if (adSource) {
                adSource.allowMultipleAds = source.allowMultipleAds;
                adSource.maxRedirectDepth = source.followsRedirect ? null : 0;
            }

            return adSource;
        },

        _getAdBreak: function (ad) {
            var item = PlayerFramework.Utilities.first(this._adBreaks, function (item) {
                return item.ad === ad;
            });

            if (item) {
                return item.adBreak;
            }

            return null;
        },

        _playAd: function (ad) {
            var adBreak = this._getAdBreak(ad);

            if (adBreak) {
                this._trackEvents(adBreak, Microsoft.Media.Advertising.VmapTrackingEventType.breakStart);

                return this.mediaPlayer.adHandlerPlugin.playAd(ad.source).then(
                    function () {
                        this._trackEvents(adBreak, Microsoft.Media.Advertising.VmapTrackingEventType.breakEnd);
                    }.bind(this),
                    function () {
                        this._trackEvents(adBreak, Microsoft.Media.Advertising.VmapTrackingEventType.error);
                    }.bind(this)
                );
            }
            
            return PlayerFramework.Plugins.AdSchedulerPlugin.prototype._playAd.call(this, ad);
        },

        _trackEvents: function (adBreak, eventType) {
            for (var i = 0; i < adBreak.trackingEvents.length; i++) {
                var event = adBreak.trackingEvents[i];
                if (event.eventType === eventType) {
                    Microsoft.Media.Advertising.AdTracking.current.fireTrackingUri(event.trackingUri);
                }
            }
        },

        _onLoad: function () {
            this._adBreaks = [];

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onLoad.call(this);
        },

        _onUnload: function () {
            this._adBreaks = null;

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onUnload.call(this);
        },

        _onActivate: function () {
            this._bindEvent("loading", this.mediaPlayer, this._onMediaPlayerLoading);

            return PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onActivate.call(this);
        },

        _onDeactivate: function () {
            this._unbindEvent("loading", this.mediaPlayer, this._onMediaPlayerLoading);

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onDeactivate.call(this);
        },

        _onUpdate: function () {
            this._adBreaks = [];

            PlayerFramework.Plugins.AdSchedulerPlugin.prototype._onUpdate.call(this);
        },

        _onMediaPlayerLoading: function (e) {
            if (this.source) {
                var promise = this.loadAds(this.source);
                e.detail.setPromise(promise);
            }
        }
    });

    // VmapSchedulerPlugin Mixins
    WinJS.Class.mix(PlayerFramework.MediaPlayer, {
        vmapSchedulerPlugin: {
            value: null,
            writable: true,
            configurable: true
        }
    });

    // VmapSchedulerPlugin Exports
    WinJS.Namespace.define("PlayerFramework.Plugins", {
        VmapSchedulerPlugin: VmapSchedulerPlugin
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // VpaidAdPlayerBase Errors
    var invalidConstruction = "Invalid construction: VpaidAdPlayerBase is an abstract class.";

    // VpaidAdPlayerBase Events
    var events = [
        "adloaded",
        "adstarted",
        "adstopped",
        "adplaying",
        "adpaused",
        "adexpandedchanged",
        "adlinearchanged",
        "advolumechanged",
        "advideostart",
        "advideofirstquartile",
        "advideomidpoint",
        "advideothirdquartile",
        "advideocomplete",
        "aduseracceptinvitation",
        "aduserclose",
        "aduserminimize",
        "adremainingtimechange",
        "adimpression",
        "adclickthru",
        "aderror",
        "adlog",
        "adskipped",
        "adsizechanged",
        "adskippablestatechange",
        "addurationchange",
        "adinteraction"
    ];

    // VpaidAdPlayerBase Class
    var VpaidAdPlayerBase = WinJS.Class.define(function () {
        throw invalidConstruction;
    }, {
        // Public Properties
        adElement: {
            get: function () {
                return null;
            }
        },

        adState: {
            get: function () {
                return PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_NONE;
            }
        },

        adSkippableState: {
            get: function () {
                return false;
            }
        },

        skippableOffset: {
            get: function () {
                return null;
            }
        },

        clickThru: {
            get: function () {
                return null;
            }
        },

        adLinear: {
            get: function () {
                return false;
            }
        },

        adExpanded: {
            get: function () {
                return true;
            }
        },

        adVolume: {
            get: function () {
                return 0;
            },
            set: function (value) {
            }
        },

        adWidth: {
            get: function () {
                return 0;
            }
        },

        adHeight: {
            get: function () {
                return 0;
            }
        },

        adDuration: {
            get: function () {
                return 0;
            }
        },

        adRemainingTime: {
            get: function () {
                return 0;
            }
        },

        adCompanions: {
            get: function () {
                return "";
            }
        },

        adIcons: {
            get: function () {
                return false;
            }
        },

        // Public Methods
        handshakeVersion: function (version) {
            if (version.indexOf("1.") === 0) {
                return version;
            } else {
                return "2.0"; // return the highest version of VPAID that we support
            }
        },

        initAd: function (width, height, viewMode, desiredBitrate, creativeData, environmentVariables) {
        },

        startAd: function () {
        },

        stopAd: function () {
        },

        pauseAd: function () {
        },

        resumeAd: function () {
        },

        resizeAd: function (width, height, viewMode) {
        },

        expandAd: function () {
        },

        collapseAd: function () {
        },

        skipAd: function () {
        }
    }, {
        // Constants
        AD_STATE_NONE: 0,
        AD_STATE_LOADING: 1,
        AD_STATE_LOADED: 2,
        AD_STATE_STARTING: 3,
        AD_STATE_PLAYING: 4,
        AD_STATE_PAUSED: 5,
        AD_STATE_COMPLETE: 6,
        AD_STATE_FAILED: 7
    });

    // VpaidAdPlayerBase Mixins
    WinJS.Class.mix(VpaidAdPlayerBase, WinJS.Utilities.eventMixin);
    WinJS.Class.mix(VpaidAdPlayerBase, PlayerFramework.Utilities.createEventProperties(events));
    WinJS.Class.mix(VpaidAdPlayerBase, PlayerFramework.Utilities.eventBindingMixin);
    
    // VpaidAdPlayerBase Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        VpaidAdPlayerBase: VpaidAdPlayerBase
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // VpaidNonLinearAdPlayer Errors
    var invalidConstruction = "Invalid construction: VpaidNonLinearAdPlayer constructor must be called using the \"new\" operator.",
        notImplemented = "Not implemented.";

    // VpaidNonLinearAdPlayer Class
    var VpaidNonLinearAdPlayer = WinJS.Class.derive(PlayerFramework.Advertising.VpaidAdPlayerBase, function (skippableOffset, suggestedDuration, clickThru, clickThruText, dimensions) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidNonLinearAdPlayer)) {
            throw invalidConstruction;
        }

        this._dimensions = dimensions;
        this._skippableOffset = skippableOffset;
        this._suggestedDuration = suggestedDuration;
        this._clickThru = clickThru;
        this._clickThruText = clickThruText;

        this._itemElement = null;
        this._adElement = null;
        this._linkElement = null;

        this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_NONE;
        this._adSkippableState = false;
        this._adVolume = null;
        this._timer = null;
        this._timerStartTime = null;
        this._timerPauseTime = null;
        this._skippableTime = null;
        this._skippableReached = false;
        this._firstQuartileTime = null;
        this._firstQuartileReached = false;
        this._midpointTime = null;
        this._midpointReached = false;
        this._thirdQuartileTime = null;
        this._thirdQuartileReached = false;
        this._endpointTime = null;
        this._endpointReached = false;

        this._setElement();
    }, {
        // Public Properties
        adElement: {
            get: function () {
                return this._adElement;
            }
        },

        adState: {
            get: function () {
                return this._adState;
            }
        },

        adSkippableState: {
            get: function () {
                return this._adSkippableState;
            }
        },

        skippableOffset: {
            get: function () {
                return this._skippableOffset;
            }
        },

        suggestedDuration: {
            get: function () {
                return this._suggestedDuration;
            }
        },

        clickThru: {
            get: function () {
                return this._clickThru;
            }
        },

        adLinear: {
            get: function () {
                return false;
            }
        },

        adVolume: {
            get: function () {
                return this._adVolume;
            },
            set: function (value) {
                this._adVolume = value;
                this.dispatchEvent("advolumechanged");
            }
        },

        adWidth: {
            get: function () {
                return this._itemElement.scrollWidth;
            }
        },

        adHeight: {
            get: function () {
                return this._itemElement.scrollHeight;
            }
        },

        adDuration: {
            get: function () {
                return this._suggestedDuration !== null ? this._suggestedDuration : 0;
            }
        },

        adRemainingTime: {
            get: function () {
                return this.adDuration > 0 ? this.adDuration - this._getCurrentTime() : 0;
            }
        },

        // Public Methods
        initAd: function (width, height, viewMode, desiredBitrate, creativeData, environmentVariables) {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_LOADING;
            this._adSkippableState = false;
        },

        startAd: function () {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_STARTING;
            this._onAdStarted();
        },

        stopAd: function () {
            this._onAdStopped();
        },

        pauseAd: function () {
            // TODO: test once this is properly wired up to view model
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED;
            this._pauseTimer();
            this.dispatchEvent("adpaused");
        },

        resumeAd: function () {
            // TODO: test once this is properly wired up to view model
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PLAYING;
            this._resumeTimer();
            this.dispatchEvent("adplaying");
        },

        resizeAd: function (width, height, viewMode) {
            // normally we don't have to do anything since we rely on CSS to resize us automatically
        },

        expandAd: function () {
            throw notImplemented;
        },

        collapseAd: function () {
            throw notImplemented;
        },

        skipAd: function () {
            if (this._adSkippableState) {
                this.dispatchEvent("adskipped");
                this._onAdStopped();
            }
        },
        
        // Private Methods
        _getElement: function () {
            return PlayerFramework.Utilities.createElement(null, [
                "div", {
                    "class": "pf-nonlinear-ad"
                }, [
                    "div", {
                        "style": "display: none;"
                    }, [
                        "a", {
                            "class": "pf-link",
                            "href": "javascript: void 0;"
                        }
                    ]
                ]
            ]);
        },

        _setElement: function () {
            this._adElement = this._getElement();

            this._itemElement = this._adElement.querySelector("#item");
            this._linkElement = this._adElement.querySelector("a");

            if (this._itemElement && this._dimensions)
            {
                this._itemElement.width = this._dimensions.width;
                this._itemElement.height = this._dimensions.height;
            }

            if (this._clickThru) {
                if (this._clickThruText) {
                    this._linkElement.textContent = this._clickThruText;
                    this._linkElement.parentElement.style.display = "";

                    WinJS.Utilities.addClass(this._linkElement, "pf-functional");
                    this._bindEvent("click", this._linkElement, this._onLinkClick);
                } else {
                    WinJS.Utilities.addClass(this._itemElement, "pf-functional");
                    this._bindEvent("click", this._itemElement, this._onItemClick);
                }
            }
        },

        _setAdSkippableState: function (value) {
            if (this._adSkippableState !== value) {
                this._adSkippableState = value;
                this.dispatchEvent("adskippablestatechange");
            }
        },

        _getCurrentTime: function () {
            if (this._timerPauseTime !== null) {
                return this._timerPauseTime - this._timerStartTime;
            } else if (this._timerStartTime !== null) {
                return Date.now() - this._timerStartTime;
            } else {
                return null;
            }
        },

        _startTimer: function () {
            this._timer = window.setInterval(this._onTimerTick.bind(this), 1000);
            this._timerStartTime = Date.now();
            this._timerPauseTime = null;
        },

        _stopTimer: function () {
            window.clearInterval(this._timer);
            this._timer = null;
            this._timerStartTime = null;
            this._timerPauseTime = null;
        },

        _pauseTimer: function () {
            window.clearInterval(this._timer);
            this._timer = null;
            this._timerPauseTime = Date.now();
        },

        _resumeTimer: function () {
            this._timer = window.setInterval(this._onTimerTick.bind(this), 1000);
            this._timerStartTime = Date.now() - this._getCurrentTime();
            this._timerPauseTime = null;
        },

        _onTimerTick: function () {
            this.dispatchEvent("adremainingtimechange");

            var currentTime = this._getCurrentTime();

            if (!this._skippableReached && this._skippableTime !== null && currentTime >= this._skippableTime) {
                this._skippableReached = true;
                this._setAdSkippableState(true);
            }

            if (!this._firstQuartileReached && this._firstQuartileTime !== null && currentTime >= this._firstQuartileTime) {
                this._firstQuartileReached = true;
                this.dispatchEvent("advideofirstquartile");
            }

            if (!this._midpointReached && this._midpointTime !== null && currentTime >= this._midpointTime) {
                this._midpointReached = true;
                this.dispatchEvent("advideomidpoint");
            }

            if (!this._thirdQuartileReached && this._thirdQuartileTime !== null && currentTime >= this._thirdQuartileTime) {
                this._thirdQuartileReached = true;
                this.dispatchEvent("advideothirdquartile");
            }

            if (!this._endpointReached && this._endpointTime !== null && currentTime >= this._endpointTime) {
                this._endpointReached = true;
                this.dispatchEvent("advideocomplete");
                this.stopAd();
            }
        },

        _onItemClick: function (e) {
            this._onAdClicked();
        },
        
        _onLinkClick: function (e) {
            this._onAdClicked();
        },

        _onAdClicked: function () {
            if (this._clickThru) {
                // TODO: provide id event argument
                this.dispatchEvent("adclickthru", { url: this._clickThru.rawUri, playerHandles: true });
            }
        },

        _onItemResize: function (e) {
            this.dispatchEvent("adsizechanged");
        },

        _onAdStarted: function () {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PLAYING;
            this._adElement.style.visibility = "visible";

            if (PlayerFramework.Utilities.isWinJS1) {
                this._bindEvent("resize", this._itemElement, this._onItemResize);
            }
            else { // IE11 no longer supports resize event for arbitrary elements. The best we can do is listen to the window resize event.
                this._bindEvent("resize", window, this._onItemResize);
            }

            this.dispatchEvent("adstarted");
            this.dispatchEvent("adimpression");

            if (this._suggestedDuration !== null) {
                this._startTimer();
                this.dispatchEvent("advideostart");
            }
        },

        _onAdLoaded: function() {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_LOADED;
            this.dispatchEvent("adloaded");

            if (this._skippableOffset) {
                if (!this._skippableOffset.isAbsolute) {
                    this._skippableTime = this.adDuration * this._skippableOffset.relativeOffset;
                } else {
                    this._skippableTime = this._skippableOffset.absoluteOffset;
                }
            }

            if (this._suggestedDuration !== null) {
                this._firstQuartileTime = this.adDuration * 0.25;
                this._midpointTime = this.adDuration * 0.5;
                this._thirdQuartileTime = this.adDuration * 0.75;
                this._endpointTime = this.adDuration;
            }
        },

        _onAdStopped: function () {
            if (this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_COMPLETE && this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_FAILED) {
                this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_COMPLETE;
                this._teardownAd();
                this.dispatchEvent("adstopped");
            }
        },

        _onAdFailed: function (message) {
            if (this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_COMPLETE && this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_FAILED) {
                this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_FAILED;
                this._teardownAd();
                this.dispatchEvent("aderror", { message: message });
            }
        },

        _teardownAd: function () {
            this._stopTimer();
            this._unbindEvents();
            this._adElement.style.visibility = "hidden";
        }
    });

    // VpaidNonLinearAdPlayer Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        VpaidNonLinearAdPlayer: VpaidNonLinearAdPlayer
    });

    // VpaidIFrameAdPlayer Errors
    var invalidIFrameConstruction = "Invalid construction: VpaidIFrameAdPlayer constructor must be called using the \"new\" operator.",
        notImplemented = "Not implemented.";

    // VpaidIFrameAdPlayer Class
    var VpaidIFrameAdPlayer = WinJS.Class.derive(PlayerFramework.Advertising.VpaidNonLinearAdPlayer, function (skippableOffset, suggestedDuration, clickThru, clickThruText, dimensions) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidIFrameAdPlayer)) {
            throw invalidIFrameConstruction;
        }

        PlayerFramework.Advertising.VpaidNonLinearAdPlayer.call(this, skippableOffset, suggestedDuration, clickThru, clickThruText, dimensions);
    }, {
        // overrides
        _getElement: function () {
            return PlayerFramework.Utilities.createElement(null, [
                "div", {
                    "class": "pf-nonlinear-ad"
                }, [
                    "div", [
                        "iframe", {
                            "id": "item",
                            "frameBorder": "no",
                            "scrolling": "no"
                        }
                    ]
                ], [
                    "div", {
                        "style": "display: none;"
                    }, [
                        "a", {
                            "class": "pf-link",
                            "href": "javascript: void 0;"
                        }
                    ]
                ]
            ])
        },

        _onItemReadyStateChange: function (x) {
            if (this._itemElement.readyState == "complete") {
                this._onAdLoaded();
            }
        },

        _onItemLoad: function (e) {
            // do nothing
        },

        _onItemAbort: function (e) {
            this._onAdFailed("IFRAME aborted");
        },

        _onItemError: function (e) {
            this._onAdFailed("IFRAME error");
        },

        initAd: function (width, height, viewMode, desiredBitrate, creativeData, environmentVariables) {
            PlayerFramework.Advertising.VpaidNonLinearAdPlayer.prototype.initAd.call(this, width, height, viewMode, desiredBitrate, creativeData, environmentVariables);

            this._bindEvent("load", this._itemElement, this._onItemLoad);
            this._bindEvent("abort", this._itemElement, this._onItemAbort);
            this._bindEvent("error", this._itemElement, this._onItemError);
            this._bindEvent("readystatechange", this._itemElement, this._onItemReadyStateChange);

            this._itemElement.src = creativeData;
        },

        stopAd: function () {
            this._itemElement.removeAttribute("src");
            PlayerFramework.Advertising.VpaidNonLinearAdPlayer.prototype.stopAd.call(this);
        }
    });

    // VpaidNonLinearAdPlayer Errors
    var invalidHtmlConstruction = "Invalid construction: VpaidHtmlAdPlayer constructor must be called using the \"new\" operator.",
        notImplemented = "Not implemented.";

    // VpaidNonLinearAdPlayer Class
    var VpaidHtmlAdPlayer = WinJS.Class.derive(PlayerFramework.Advertising.VpaidNonLinearAdPlayer, function (skippableOffset, suggestedDuration, clickThru, clickThruText, dimensions) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidHtmlAdPlayer)) {
            throw invalidHtmlConstruction;
        }

        PlayerFramework.Advertising.VpaidNonLinearAdPlayer.call(this, skippableOffset, suggestedDuration, clickThru, clickThruText, dimensions);
    }, {
        // overrides
        _getElement: function () {
            return PlayerFramework.Utilities.createElement(null, [
                "div", {
                    "class": "pf-nonlinear-ad"
                }, [
                    "div", [
                        "div", {
                            "id": "item"
                        }
                    ]
                ], [
                    "div", {
                        "style": "display: none;"
                    }, [
                        "a", {
                            "class": "pf-link",
                            "href": "javascript: void 0;"
                        }
                    ]
                ]
            ])
        },

        initAd: function (width, height, viewMode, desiredBitrate, creativeData, environmentVariables) {
            PlayerFramework.Advertising.VpaidNonLinearAdPlayer.prototype.initAd.call(this, width, height, viewMode, desiredBitrate, creativeData, environmentVariables);

            this._itemElement.innerHTML = creativeData;
            this._onAdLoaded();
        },

        stopAd: function () {
            this._itemElement.innerHTML = "";

            PlayerFramework.Advertising.VpaidNonLinearAdPlayer.prototype.stopAd.call(this);
        }
    });


    // VpaidIFrameAdPlayer Errors
    var invalidImageConstruction = "Invalid construction: VpaidImageAdPlayer constructor must be called using the \"new\" operator.",
        notImplemented = "Not implemented.";

    // VpaidIFrameAdPlayer Class
    var VpaidImageAdPlayer = WinJS.Class.derive(PlayerFramework.Advertising.VpaidNonLinearAdPlayer, function (skippableOffset, suggestedDuration, clickThru, clickThruText, dimensions) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidImageAdPlayer)) {
            throw invalidIFrameConstruction;
        }

        PlayerFramework.Advertising.VpaidNonLinearAdPlayer.call(this, skippableOffset, suggestedDuration, clickThru, clickThruText, dimensions);
    }, {
        // overrides
        _getElement: function () {
            return PlayerFramework.Utilities.createElement(null, [
                "div", {
                    "class": "pf-nonlinear-ad"
                }, [
                    "div", [
                        "img", {
                            "id": "item"
                        }
                    ]
                ], [
                    "div", {
                        "style": "display: none;"
                    }, [
                        "a", {
                            "class": "pf-link",
                            "href": "javascript: void 0;"
                        }
                    ]
                ]
            ])
        },

        _onItemLoad: function (e) {
            this._onAdLoaded();
        },

        _onItemAbort: function (e) {
            var message = PlayerFramework.Utilities.getImageErrorMessageForCode(PlayerFramework.ImageErrorCode.aborted);
            this._onAdFailed(message);
        },

        _onItemError: function (e) {
            var message = PlayerFramework.Utilities.getImageErrorMessageForCode(PlayerFramework.ImageErrorCode.unknown);
            this._onAdFailed(message);
        },

        initAd: function (width, height, viewMode, desiredBitrate, creativeData, environmentVariables) {
            PlayerFramework.Advertising.VpaidNonLinearAdPlayer.prototype.initAd.call(this, width, height, viewMode, desiredBitrate, creativeData, environmentVariables);

            this._bindEvent("load", this._itemElement, this._onItemLoad);
            this._bindEvent("abort", this._itemElement, this._onItemAbort);
            this._bindEvent("error", this._itemElement, this._onItemError);

            this._itemElement.src = creativeData;
        },

        stopAd: function () {
            this._itemElement.removeAttribute("src");
            PlayerFramework.Advertising.VpaidNonLinearAdPlayer.prototype.stopAd.call(this);
        }
    });

    // VpaidNonLinearAdPlayer Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        VpaidIFrameAdPlayer: VpaidIFrameAdPlayer,
        VpaidHtmlAdPlayer: VpaidHtmlAdPlayer,
        VpaidImageAdPlayer: VpaidImageAdPlayer
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // VpaidVideoAdPlayer Errors
    var invalidConstruction = "Invalid construction: VpaidVideoAdPlayer constructor must be called using the \"new\" operator.",
        notImplemented = "Not implemented.";

    // VpaidVideoAdPlayer Class
    var VpaidVideoAdPlayer = WinJS.Class.derive(PlayerFramework.Advertising.VpaidAdPlayerBase, function (skippableOffset, maxDuration, clickThru, clickThruText) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidVideoAdPlayer)) {
            throw invalidConstruction;
        }

        this._skippableOffset = skippableOffset;
        this._maxDuration = maxDuration;
        this._clickThru = clickThru;
        this._clickThruText = clickThruText;

        this._adElement = null;
        this._videoElement = null;
        this._linkElement = null;

        this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_NONE;
        this._adSkippableState = false;
        this._skippableTime = null;
        this._skippableReached = false;
        this._firstQuartileTime = null;
        this._firstQuartileReached = false;
        this._midpointTime = null;
        this._midpointReached = false;
        this._thirdQuartileTime = null;
        this._thirdQuartileReached = false;
        this._endpointTime = null;
        this._endpointReached = false;

        this._setElement();
    }, {
        // Public Properties
        adElement: {
            get: function () {
                return this._adElement;
            }
        },

        msAudioCategory: {
            get: function () {
                return this._videoElement.msAudioCategory;
            },
            set: function (value) {
                this._videoElement.msAudioCategory = value;
            }
        },

        adState: {
            get: function () {
                return this._adState;
            }
        },

        adSkippableState: {
            get: function () {
                return this._adSkippableState;
            }
        },

        skippableOffset: {
            get: function () {
                return this._skippableOffset;
            }
        },

        maxDuration: {
            get: function () {
                return this._maxDuration;
            }
        },

        clickThru: {
            get: function () {
                return this._clickThru;
            }
        },

        adLinear: {
            get: function () {
                return true;
            }
        },

        adVolume: {
            get: function () {
                return this._videoElement.volume;
            },
            set: function (value) {
                if (this._videoElement.volume !== value) {
                    this._videoElement.volume = value;
                    this.dispatchEvent("advolumechanged");
                }
            }
        },

        adWidth: {
            get: function () {
                return this._videoElement.videoWidth;
            }
        },

        adHeight: {
            get: function () {
                return this._videoElement.videoHeight;
            }
        },

        adDuration: {
            get: function () {
                return this._maxDuration !== null ? this._maxDuration : (this._videoElement.duration * 1000) || 0;
            }
        },

        adRemainingTime: {
            get: function () {
                return this.adDuration - this._videoElement.currentTime * 1000;
            }
        },

        // Public Methods
        initAd: function (width, height, viewMode, desiredBitrate, creativeData, environmentVariables) {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_LOADING;
            this._adSkippableState = false;

            this._bindEvent("canplaythrough", this._videoElement, this._onVideoCanPlayThrough);
            this._bindEvent("play", this._videoElement, this._onVideoPlay);
            this._bindEvent("error", this._videoElement, this._onVideoError);

            this._videoElement.autoplay = false;
            this._videoElement.preload = "auto";
            this._videoElement.src = creativeData;
        },

        startAd: function () {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_STARTING;
            this._videoElement.play();
        },

        stopAd: function () {
            this._videoElement.removeAttribute("src");
        },

        pauseAd: function () {
            this._videoElement.pause();
        },

        resumeAd: function () {
            this._videoElement.play();
        },

        resizeAd: function (width, height, viewMode) {
            // normally we don't have to do anything since we rely on CSS to resize us automatically
        },

        expandAd: function () {
            throw notImplemented;
        },

        collapseAd: function () {
            throw notImplemented;
        },

        skipAd: function () {
            if (this._adSkippableState) {
                this.dispatchEvent("adskipped");
                this._onAdStopped();
            }
        },

        // Private Methods
        _setElement: function () {
            this._adElement = PlayerFramework.Utilities.createElement(null, [
                "div", {
                    "class": "pf-linear-ad"
                }, [
                    "div", [
                        "video"
                    ]
                ], [
                    "div", {
                        "style": "display: none;"
                    }, [
                        "a", {
                            "class": "pf-link",
                            "href": "javascript: void 0;"
                        }
                    ]
                ]
            ]);

            this._videoElement = this._adElement.querySelector("video");
            this._linkElement = this._adElement.querySelector("a");

            if (this._clickThru) {
                if (this._clickThruText) {
                    this._linkElement.textContent = this._clickThruText;
                    this._linkElement.parentElement.style.display = "";

                    WinJS.Utilities.addClass(this._linkElement, "pf-functional");
                    this._bindEvent("click", this._linkElement, this._onLinkClick);
                } else {
                    WinJS.Utilities.addClass(this._videoElement, "pf-functional");
                    this._bindEvent("click", this._videoElement, this._onVideoClick);
                }
            }
        },

        _setAdSkippableState: function (value) {
            if (this._adSkippableState !== value) {
                this._adSkippableState = value;
                this.dispatchEvent("adskippablestatechange");
            }
        },

        _onVideoCanPlayThrough: function (e) {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_LOADED;
            this.dispatchEvent("adloaded");

            if (this._skippableOffset) {
                if (!this._skippableOffset.isAbsolute) {
                    this._skippableTime = this.adDuration * this._skippableOffset.relativeOffset;
                } else {
                    this._skippableTime = this._skippableOffset.absoluteOffset;
                }
            }

            this._firstQuartileTime = this.adDuration * 0.25;
            this._midpointTime = this.adDuration * 0.5;
            this._thirdQuartileTime = this.adDuration * 0.75;
            this._endpointTime = this.adDuration;
        },

        _onVideoPlay: function (e) {
            if (this._adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_STARTING) {
                this._onAdStarted();
            }
        },

        _onVideoTimeUpdate: function (e) {
            this.dispatchEvent("adremainingtimechange");

            var currentTime = this._videoElement.currentTime * 1000;

            if (!this._skippableReached && this._skippableTime !== null && currentTime >= this._skippableTime) {
                this._skippableReached = true;
                this._setAdSkippableState(true);
            }

            if (!this._firstQuartileReached && this._firstQuartileTime !== null && currentTime >= this._firstQuartileTime) {
                this._firstQuartileReached = true;
                this.dispatchEvent("advideofirstquartile");
            }

            if (!this._midpointReached && this._midpointTime !== null && currentTime >= this._midpointTime) {
                this._midpointReached = true;
                this.dispatchEvent("advideomidpoint");
            }

            if (!this._thirdQuartileReached && this._thirdQuartileTime !== null && currentTime >= this._thirdQuartileTime) {
                this._thirdQuartileReached = true;
                this.dispatchEvent("advideothirdquartile");
            }

            if (!this._endpointReached && this._endpointTime !== null && currentTime >= this._endpointTime) {
                this._endpointReached = true;
                this.dispatchEvent("advideocomplete");
                this.stopAd();
            }
        },

        _onVideoPlaying: function (e) {
            if (this._adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED) {
                this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PLAYING;
                this.dispatchEvent("adplaying");
            }
        },

        _onVideoPause: function (e) {
            if (this._adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PLAYING) {
                this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED;
                this.dispatchEvent("adpaused");
            }
        },

        _onVideoEnded: function (e) {
            this.dispatchEvent("advideocomplete");
            this._onAdStopped();
        },

        _onVideoEmptied: function (e) {
            this._onAdStopped();
        },

        _onVideoError: function (e) {
            var message = PlayerFramework.Utilities.getMediaErrorMessage(this._videoElement.error);
            this._onAdFailed(message);
        },

        _onVideoResize: function (e) {
            this.dispatchEvent("adsizechanged");
        },

        _onVideoClick: function (e) {
            this._onAdClicked();
        },

        _onLinkClick: function (e) {
            this._onAdClicked();
        },

        _onAdClicked: function () {
            if (this._clickThru) {
                // TODO: provide id event argument
                this.dispatchEvent("adclickthru", { url: this._clickThru.rawUri, playerHandles: true });
            }
        },

        _onAdStarted: function () {
            this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PLAYING;
            this._adElement.style.visibility = "visible";

            this._bindEvent("timeupdate", this._videoElement, this._onVideoTimeUpdate);
            this._bindEvent("playing", this._videoElement, this._onVideoPlaying);
            this._bindEvent("pause", this._videoElement, this._onVideoPause);
            this._bindEvent("ended", this._videoElement, this._onVideoEnded);
            this._bindEvent("emptied", this._videoElement, this._onVideoEmptied);
            if (PlayerFramework.Utilities.isWinJS1) {
                this._bindEvent("resize", this._videoElement, this._onVideoResize);
            }
            else { // IE11 no longer supports resize event for arbitrary elements. The best we can do is listen to the window resize event.
                this._bindEvent("resize", window, this._onVideoResize);
            }

            this.dispatchEvent("adstarted");
            this.dispatchEvent("adimpression");
            this.dispatchEvent("advideostart");
        },

        _onAdStopped: function () {
            if (this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_COMPLETE && this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_FAILED) {
                this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_COMPLETE;
                this._teardownAd();
                this.dispatchEvent("adstopped");
            }
        },

        _onAdFailed: function (message) {
            if (this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_COMPLETE && this._adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_FAILED) {
                this._adState = PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_FAILED;
                this._teardownAd();
                this.dispatchEvent("aderror", { message: message });
            }
        },

        _teardownAd: function () {
            this._unbindEvents();
            this._adElement.style.visibility = "hidden";
        }
    });

    // VpaidVideoAdPlayer Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        VpaidVideoAdPlayer: VpaidVideoAdPlayer
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // VpaidAdapter Errors
    var invalidConstruction = "Invalid construction: VpaidAdapter constructor must be called using the \"new\" operator.",
        invalidAdPlayer = "Invalid argument: VpaidAdapter expects a VpaidAdPlayerBase as the first argument.";

    // VpaidAdapter Class
    var VpaidAdapter = WinJS.Class.define(function (adPlayer) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidAdapter)) {
            throw invalidConstruction;
        }

        if (!(adPlayer instanceof PlayerFramework.Advertising.VpaidAdPlayerBase)) {
            throw invalidAdPlayer;
        }

        this._adPlayer = adPlayer;
        this._nativeInstance = new Microsoft.PlayerFramework.Js.Advertising.VpaidAdapterBridge();

        this._bindEvent("adloaded", this._adPlayer, this._onAdLoaded);
        this._bindEvent("adstarted", this._adPlayer, this._onAdStarted);
        this._bindEvent("adstopped", this._adPlayer, this._onAdStopped);
        this._bindEvent("adplaying", this._adPlayer, this._onAdPlaying);
        this._bindEvent("adpaused", this._adPlayer, this._onAdPaused);
        this._bindEvent("adexpandedchanged", this._adPlayer, this._onAdExpandedChanged);
        this._bindEvent("adlinearchanged", this._adPlayer, this._onAdLinearChanged);
        this._bindEvent("advolumechanged", this._adPlayer, this._onAdVolumeChanged);
        this._bindEvent("advideostart", this._adPlayer, this._onAdVideoStart);
        this._bindEvent("advideofirstquartile", this._adPlayer, this._onAdVideoFirstQuartile);
        this._bindEvent("advideomidpoint", this._adPlayer, this._onAdVideoMidpoint);
        this._bindEvent("advideothirdquartile", this._adPlayer, this._onAdVideoThirdQuartile);
        this._bindEvent("advideocomplete", this._adPlayer, this._onAdVideoComplete);
        this._bindEvent("aduseracceptinvitation", this._adPlayer, this._onAdUserAcceptInvitation);
        this._bindEvent("aduserclose", this._adPlayer, this._onAdUserClose);
        this._bindEvent("aduserminimize", this._adPlayer, this._onAdUserMinimize);
        this._bindEvent("adremainingtimechange", this._adPlayer, this._onAdRemainingTimeChange);
        this._bindEvent("adimpression", this._adPlayer, this._onAdImpression);
        this._bindEvent("adclickthru", this._adPlayer, this._onAdClickThru);
        this._bindEvent("aderror", this._adPlayer, this._onAdError);
        this._bindEvent("adlog", this._adPlayer, this._onAdLog);
        this._bindEvent("adskipped", this._adPlayer, this._onAdSkipped);
        this._bindEvent("adsizechanged", this._adPlayer, this._onAdSizeChanged);
        this._bindEvent("adskippablestatechange", this._adPlayer, this._onAdSkippableStateChange);
        this._bindEvent("addurationchange", this._adPlayer, this._onAdDurationChange);
        this._bindEvent("adinteraction", this._adPlayer, this._onAdInteraction);

        this._bindEvent("handshakeversionrequested", this._nativeInstance, this._onHandshakeVersionRequested);
        this._bindEvent("initadrequested", this._nativeInstance, this._onInitAdRequested);
        this._bindEvent("startadrequested", this._nativeInstance, this._onStartAdRequested);
        this._bindEvent("stopadrequested", this._nativeInstance, this._onStopAdRequested);
        this._bindEvent("pauseadrequested", this._nativeInstance, this._onPauseAdRequested);
        this._bindEvent("resumeadrequested", this._nativeInstance, this._onResumeAdRequested);
        this._bindEvent("resizeadrequested", this._nativeInstance, this._onResizeAdRequested);
        this._bindEvent("expandadrequested", this._nativeInstance, this._onExpandAdRequested);
        this._bindEvent("collapseadrequested", this._nativeInstance, this._onCollapseAdRequested);
        this._bindEvent("skipadrequested", this._nativeInstance, this._onSkipAdRequested);
        this._bindEvent("getadwidthrequested", this._nativeInstance, this._onGetAdWidthRequested);
        this._bindEvent("getadheightrequested", this._nativeInstance, this._onGetAdHeightRequested);
        this._bindEvent("getadskippablestaterequested", this._nativeInstance, this._onGetAdSkippablestateRequested);
        this._bindEvent("getadcompanionsrequested", this._nativeInstance, this._onGetAdCompanionsRequested);
        this._bindEvent("getadiconsrequested", this._nativeInstance, this._onGetAdIconsRequested);
        this._bindEvent("getaddurationrequested", this._nativeInstance, this._onGetAdDurationRequested);
        this._bindEvent("getadlinearrequested", this._nativeInstance, this._onGetAdLinearRequested);
        this._bindEvent("getadexpandedrequested", this._nativeInstance, this._onGetAdExpandedRequested);
        this._bindEvent("getadremainingtimerequested", this._nativeInstance, this._onGetAdRemainingTimeRequested);
        this._bindEvent("getadvolumerequested", this._nativeInstance, this._onGetAdVolumeRequested);
        this._bindEvent("setadvolumerequested", this._nativeInstance, this._onSetAdVolumeRequested);
    }, {
        // Public Properties
        nativeInstance: {
            get: function () {
                return this._nativeInstance;
            }
        },

        adPlayer: {
            get: function () {
                return this._adPlayer;
            }
        },

        // Public Methods
        dispose: function () {
            this._unbindEvents();

            this._adPlayer = null;
            this._nativeInstance = null;
        },

        // Private Methods
        _onAdLoaded: function (e) {
            this._nativeInstance.onAdLoaded();
        },

        _onAdStarted: function (e) {
            this._nativeInstance.onAdStarted();
        },

        _onAdStopped: function (e) {
            this._nativeInstance.onAdStopped();
        },

        _onAdPlaying: function (e) {
            this._nativeInstance.onAdPlaying();
        },

        _onAdPaused: function (e) {
            this._nativeInstance.onAdPaused();
        },

        _onAdExpandedChanged: function (e) {
            this._nativeInstance.onAdExpandedChanged();
        },

        _onAdLinearChanged: function (e) {
            this._nativeInstance.onAdLinearChanged();
        },

        _onAdVolumeChanged: function (e) {
            this._nativeInstance.onAdVolumeChanged();
        },

        _onAdVideoStart: function (e) {
            this._nativeInstance.onAdVideoStart();
        },

        _onAdVideoFirstQuartile: function (e) {
            this._nativeInstance.onAdVideoFirstQuartile();
        },

        _onAdVideoMidpoint: function (e) {
            this._nativeInstance.onAdVideoMidpoint();
        },

        _onAdVideoThirdQuartile: function (e) {
            this._nativeInstance.onAdVideoThirdQuartile();
        },

        _onAdVideoComplete: function (e) {
            this._nativeInstance.onAdVideoComplete();
        },

        _onAdUserAcceptInvitation: function (e) {
            this._nativeInstance.onAdUserAcceptInvitation();
        },

        _onAdUserClose: function (e) {
            this._nativeInstance.onAdUserClose();
        },

        _onAdUserMinimize: function (e) {
            this._nativeInstance.onAdUserMinimize();
        },

        _onAdRemainingTimeChange: function (e) {
            this._nativeInstance.onAdRemainingTimeChange();
        },

        _onAdImpression: function (e) {
            this._nativeInstance.onAdImpression();
        },

        _onAdClickThru: function (e) {
            this._nativeInstance.onAdClickThru(e.detail.url, e.detail.id, e.detail.playerHandles);
        },

        _onAdError: function (e) {
            this._nativeInstance.onAdError(e.detail.message);
        },

        _onAdLog: function (e) {
            this._nativeInstance.onAdLog(e.detail.message);
        },

        _onAdSkipped: function (e) {
            this._nativeInstance.onAdSkipped();
        },

        _onAdSizeChanged: function (e) {
            this._nativeInstance.onAdSizeChanged();
        },

        _onAdSkippableStateChange: function (e) {
            this._nativeInstance.onAdSkippableStateChange();
        },

        _onAdDurationChange: function (e) {
            this._nativeInstance.onAdDurationChange();
        },

        _onAdInteraction: function (e) {
            this._nativeInstance.onAdInteraction(e.detail.id);
        },

        _onHandshakeVersionRequested: function (e) {
            e.result = this._adPlayer.handshakeVersion(e.version);
        },

        _onInitAdRequested: function (e) {
            this._adPlayer.initAd(e.width, e.height, e.viewMode, e.desiredBitrate, e.creativeData, e.environmentVariables);
        },

        _onStartAdRequested: function (e) {
            this._adPlayer.startAd();
        },

        _onStopAdRequested: function (e) {
            this._adPlayer.stopAd();
        },

        _onPauseAdRequested: function (e) {
            this._adPlayer.pauseAd();
        },

        _onResumeAdRequested: function (e) {
            this._adPlayer.resumeAd();
        },

        _onResizeAdRequested: function (e) {
            this._adPlayer.resizeAd(e.width, e.height, e.viewMode);
        },

        _onExpandAdRequested: function (e) {
            this._adPlayer.expandAd();
        },

        _onCollapseAdRequested: function (e) {
            this._adPlayer.collapseAd();
        },

        _onSkipAdRequested: function (e) {
            this._adPlayer.skipAd();
        },

        _onGetAdWidthRequested: function (e) {
            e.result = this._adPlayer.adWidth;
        },

        _onGetAdHeightRequested: function (e) {
            e.result = this._adPlayer.adHeight;
        },

        _onGetAdSkippablestateRequested: function (e) {
            e.result = this._adPlayer.adSkippablestate;
        },

        _onGetAdCompanionsRequested: function (e) {
            e.result = this._adPlayer.adCompanions;
        },

        _onGetAdIconsRequested: function (e) {
            e.result = this._adPlayer.adIcons;
        },

        _onGetAdDurationRequested: function (e) {
            e.result = this._adPlayer.adDuration;
        },

        _onGetAdLinearRequested: function (e) {
            e.result = this._adPlayer.adLinear;
        },

        _onGetAdExpandedRequested: function (e) {
            e.result = this._adPlayer.adExpanded;
        },

        _onGetAdRemainingTimeRequested: function (e) {
            e.result = this._adPlayer.adRemainingTime;
        },

        _onGetAdVolumeRequested: function (e) {
            e.result = this._adPlayer.adVolume;
        },

        _onSetAdVolumeRequested: function (e) {
            this._adPlayer.adVolume = e.value;
        }
    });

    // VpaidAdapter Mixins
    WinJS.Class.mix(VpaidAdapter, PlayerFramework.Utilities.eventBindingMixin);

    // VpaidAdapter Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        VpaidAdapter: VpaidAdapter
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // VpaidLinearAdViewModel Errors
    var invalidConstruction = "Invalid construction: VpaidLinearAdViewModel constructor must be called using the \"new\" operator.",
        invalidAdPlayer = "Invalid argument: VpaidLinearAdViewModel expects a VpaidAdPlayerBase as the first argument.";

    // VpaidLinearAdViewModel Class
    var VpaidLinearAdViewModel = WinJS.Class.derive(PlayerFramework.InteractiveViewModel, function (adPlayer, mediaPlayer) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidLinearAdViewModel)) {
            throw invalidConstruction;
        }

        if (!(adPlayer instanceof PlayerFramework.Advertising.VpaidAdPlayerBase)) {
            throw invalidAdPlayer;
        }

        this._adPlayer = adPlayer;

        PlayerFramework.InteractiveViewModel.call(this, mediaPlayer);

        this._state = PlayerFramework.ViewModelState.loading;
    }, {
        // Public Properties
        startTime: {
            get: function () {
                return 0;
            }
        },

        endTime: {
            get: function () {
                return PlayerFramework.Utilities.convertMillisecondsToTicks(this._adPlayer.adDuration);
            }
        },

        currentTime: {
            get: function () {
                return PlayerFramework.Utilities.convertMillisecondsToTicks(this._adPlayer.adDuration - this._adPlayer.adRemainingTime);
            }
        },

        bufferedPercentage: {
            get: function () {
                return 1;
            }
        },

        playPauseIcon: {
            get: function () {
                return this._adPlayer.adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED ? PlayerFramework.Utilities.getResourceString("PlayIcon") : PlayerFramework.Utilities.getResourceString("PauseIcon");
            }
        },

        playPauseLabel: {
            get: function () {
                return this._adPlayer.adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED ? PlayerFramework.Utilities.getResourceString("PlayLabel") : PlayerFramework.Utilities.getResourceString("PauseLabel");
            }
        },

        playPauseTooltip: {
            get: function () {
                return this._adPlayer.adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED ? PlayerFramework.Utilities.getResourceString("PlayTooltip") : PlayerFramework.Utilities.getResourceString("PauseTooltip");
            }
        },

        isPlayPauseDisabled: {
            get: function () {
                return this._adPlayer.adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED && this._adPlayer.adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PLAYING;
            }
        },

        isPlayResumeDisabled: {
            get: function () {
                return this._adPlayer.adState !== PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED;
            }
        },

        isPauseDisabled: {
            get: function () {
                return this._adPlayer.adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED;
            }
        },

        isSkipNextDisabled: {
            get: function () {
                return !this._adPlayer.adSkippableState;
            }
        },

        // Public Methods
        initialize: function () {
            // ad player events
            this._bindEvent("adloaded", this._adPlayer, this._notifyProperties, ["playPauseIcon", "playPauseLabel", "playPauseTooltip", "isPlayPauseDisabled", "isPlayResumeDisabled", "isPauseDisabled"]);
            this._bindEvent("adstarted", this._adPlayer, this._notifyProperties, ["playPauseIcon", "playPauseLabel", "playPauseTooltip", "isPlayPauseDisabled", "isPlayResumeDisabled", "isPauseDisabled"]);
            this._bindEvent("adstopped", this._adPlayer, this._notifyProperties, ["playPauseIcon", "playPauseLabel", "playPauseTooltip", "isPlayPauseDisabled", "isPlayResumeDisabled", "isPauseDisabled"]);
            this._bindEvent("adplaying", this._adPlayer, this._notifyProperties, ["playPauseIcon", "playPauseLabel", "playPauseTooltip", "isPlayPauseDisabled", "isPlayResumeDisabled", "isPauseDisabled"]);
            this._bindEvent("adpaused", this._adPlayer, this._notifyProperties, ["playPauseIcon", "playPauseLabel", "playPauseTooltip", "isPlayPauseDisabled", "isPlayResumeDisabled", "isPauseDisabled"]);
            this._bindEvent("aderror", this._adPlayer, this._notifyProperties, ["playPauseIcon", "playPauseLabel", "playPauseTooltip", "isPlayPauseDisabled", "isPlayResumeDisabled", "isPauseDisabled"]);
            this._bindEvent("addurationchange", this._adPlayer, this._notifyProperties, ["endTime", "currentTime", "elapsedTime", "remainingTime"]);
            this._bindEvent("adremainingtimechange", this._adPlayer, this._notifyProperties, ["currentTime", "elapsedTime", "remainingTime"]);
            this._bindEvent("adskippablestatechange", this._adPlayer, this._notifyProperties, ["isSkipNextDisabled"]);

            this._bindEvent("adpaused", this._adPlayer, this._onAdPlayerPaused);
            this._bindEvent("adplaying", this._adPlayer, this._onAdPlayerPlaying);
            this._bindEvent("adstopped", this._adPlayer, this._onAdPlayerStopped);
            this._bindEvent("adloaded", this._adPlayer, this._onAdPlayerLoaded);
            this._bindEvent("adstarted", this._adPlayer, this._onAdPlayerStarted);

            // media player value properties
            this._bindProperty("volume", this._observableMediaPlayer, this._notifyProperties, ["volume"]);
            this._bindProperty("muted", this._observableMediaPlayer, this._notifyProperties, ["volumeMuteIcon", "volumeMuteLabel", "volumeMuteTooltip", "volumeIcon", "muteIcon", "muteLabel", "muteTooltip"]);
            this._bindProperty("isFullScreen", this._observableMediaPlayer, this._notifyProperties, ["fullScreenIcon", "fullScreenLabel", "fullScreenTooltip"]);

            // media player interaction properties
            this._bindProperty("isPlayPauseVisible", this._observableMediaPlayer, this._notifyProperties, ["isPlayPauseHidden"]);
            this._bindProperty("isPlayResumeVisible", this._observableMediaPlayer, this._notifyProperties, ["isPlayResumeHidden"]);
            this._bindProperty("isPauseVisible", this._observableMediaPlayer, this._notifyProperties, ["isPauseHidden"]);
            this._bindProperty("isReplayVisible", this._observableMediaPlayer, this._notifyProperties, ["isReplayHidden"]);
            this._bindProperty("isRewindVisible", this._observableMediaPlayer, this._notifyProperties, ["isRewindHidden"]);
            this._bindProperty("isFastForwardVisible", this._observableMediaPlayer, this._notifyProperties, ["isFastForwardHidden"]);
            this._bindProperty("isSlowMotionVisible", this._observableMediaPlayer, this._notifyProperties, ["isSlowMotionHidden"]);
            this._bindProperty("isSkipPreviousVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipPreviousHidden"]);
            this._bindProperty("isSkipNextVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipNextHidden"]);
            this._bindProperty("isSkipBackVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipBackHidden"]);
            this._bindProperty("isSkipAheadVisible", this._observableMediaPlayer, this._notifyProperties, ["isSkipAheadHidden"]);
            this._bindProperty("isElapsedTimeVisible", this._observableMediaPlayer, this._notifyProperties, ["isElapsedTimeHidden"]);
            this._bindProperty("isRemainingTimeVisible", this._observableMediaPlayer, this._notifyProperties, ["isRemainingTimeHidden"]);
            this._bindProperty("isTimelineVisible", this._observableMediaPlayer, this._notifyProperties, ["isTimelineHidden"]);
            this._bindProperty("isGoLiveVisible", this._observableMediaPlayer, this._notifyProperties, ["isGoLiveHidden"]);
            this._bindProperty("isCaptionsVisible", this._observableMediaPlayer, this._notifyProperties, ["isCaptionsHidden"]);
            this._bindProperty("isAudioVisible", this._observableMediaPlayer, this._notifyProperties, ["isAudioHidden"]);
            this._bindProperty("isVolumeMuteVisible", this._observableMediaPlayer, this._notifyProperties, ["isVolumeMuteHidden"]);
            this._bindProperty("isVolumeVisible", this._observableMediaPlayer, this._notifyProperties, ["isVolumeHidden"]);
            this._bindProperty("isMuteVisible", this._observableMediaPlayer, this._notifyProperties, ["isMuteHidden"]);
            this._bindProperty("isFullScreenVisible", this._observableMediaPlayer, this._notifyProperties, ["isFullScreenHidden"]);
            this._bindProperty("isSignalStrengthVisible", this._observableMediaPlayer, this._notifyProperties, ["isSignalStrengthHidden"]);
            this._bindProperty("isMediaQualityVisible", this._observableMediaPlayer, this._notifyProperties, ["isMediaQualityHidden"]);
        },

        playPause: function (e) {
            if (this._adPlayer.adState === PlayerFramework.Advertising.VpaidAdPlayerBase.AD_STATE_PAUSED) {
                this._adPlayer.resumeAd();
            } else {
                this._adPlayer.pauseAd();
            }
        },

        playResume: function () {
            this._adPlayer.resumeAd();
        },

        pause: function () {
            this._adPlayer.pauseAd();
        },

        skipNext: function () {
            if (!this.dispatchEvent("skipnext")) {
                this._adPlayer.skipAd();
            }
        },

        _onAdPlayerStarted: function (e) {
            this.state = PlayerFramework.ViewModelState.playing;
        },

        _onAdPlayerPaused: function (e) {
            this.state = PlayerFramework.ViewModelState.paused;
        },

        _onAdPlayerPlaying: function (e) {
            this.state = PlayerFramework.ViewModelState.playing;
        },

        _onAdPlayerStopped: function (e) {
            this.state = PlayerFramework.ViewModelState.unloaded;
        },

        _onAdPlayerLoaded: function (e) {
            this.state = PlayerFramework.ViewModelState.loading;
        }
    });
    
    // VpaidLinearAdViewModel Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        VpaidLinearAdViewModel: VpaidLinearAdViewModel
    });

})(PlayerFramework);

(function (PlayerFramework, undefined) {
    "use strict";

    // VpaidNonLinearAdViewModel Errors
    var invalidConstruction = "Invalid construction: VpaidNonLinearAdViewModel constructor must be called using the \"new\" operator.",
        invalidAdPlayer = "Invalid argument: VpaidNonLinearAdViewModel expects a VpaidAdPlayerBase as the first argument.";

    // VpaidNonLinearAdViewModel Class
    var VpaidNonLinearAdViewModel = WinJS.Class.derive(PlayerFramework.InteractiveViewModel, function (adPlayer, mediaPlayer) {
        if (!(this instanceof PlayerFramework.Advertising.VpaidNonLinearAdViewModel)) {
            throw invalidConstruction;
        }

        if (!(adPlayer instanceof PlayerFramework.Advertising.VpaidAdPlayerBase)) {
            throw invalidAdPlayer;
        }

        this._adPlayer = adPlayer;

        PlayerFramework.InteractiveViewModel.call(this, mediaPlayer);

        if (mediaPlayer.paused) {
            this._state = PlayerFramework.ViewModelState.paused;
        } else {
            this._state = PlayerFramework.ViewModelState.playing;
        }
    }, {
        // Public Methods
        playPause: function (e) {
            if (this._mediaPlayer.isPlayResumeAllowed) {
                this._mediaPlayer.playResume();
                this._adPlayer.resumeAd();
            } else {
                this._mediaPlayer.pause();
                this._adPlayer.pauseAd();
            }
        },

        playResume: function () {
            this._mediaPlayer.playResume();
            this._adPlayer.resumeAd();
        },

        pause: function () {
            this._mediaPlayer.pause();
            this._adPlayer.pauseAd();
        }
    });

    // VpaidNonLinearAdViewModel Exports
    WinJS.Namespace.define("PlayerFramework.Advertising", {
        VpaidNonLinearAdViewModel: VpaidNonLinearAdViewModel
    });

})(PlayerFramework);

