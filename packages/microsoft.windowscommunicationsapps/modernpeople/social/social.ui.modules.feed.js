
//! Copyright (c) Microsoft Corporation. All rights reserved.

Jx.delayDefine(People.RecentActivity.UI.Modules.Feed, ["FeedModule", "LatestNotification"], function () {

    $include("$(cssResources)/Social.css");

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    /// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
    /// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

    /// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
    /// <reference path="..\..\..\Imports\IdentityControl\IdentityControlOptions.js" />
    /// <reference path="..\..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
    /// <reference path="..\..\..\Model\Events\ActionCompletedEventArgs.js" />
    /// <reference path="..\..\..\Model\Feed.js" />
    /// <reference path="..\..\..\Model\FeedEntry.js" />
    /// <reference path="..\..\..\Model\Identity.js" />
    /// <reference path="..\..\..\Platform\SocialCapabilities.js" />
    /// <reference path="FeedModuleLoader.js" />
    /// <reference path="FeedModuleScheduler.js" />
    /// <reference path="FeedModuleState.js" />

    var moduleTileCount = 4;
    var moduleStateKey = 'whatsNewModuleState';

    People.RecentActivity.UI.Modules.Feed.FeedModule = function (jobSet) {
        /// <summary>
        ///     Provides the main entry point for the feed module.
        /// </summary>
        /// <param name="jobSet" type="People.JobSet">The address book scheduler</param>
        /// <field name="_moduleTileCount" type="Number" integer="true" static="true">The number of tiles to show.</field>
        /// <field name="_moduleStateKey" type="String" static="true">The key we use to get/set the state of the module.</field>
        /// <field name="_moduleMarkup" type="String" static="true">The module markup.</field>
        /// <field name="_element" type="HTMLElement">The element.</field>
        /// <field name="_elementInner" type="HTMLElement">The inner element.</field>
        /// <field name="_elementTiles" type="HTMLElement">The tiles.</field>
        /// <field name="_elementTitle" type="HTMLElement">The title.</field>
        /// <field name="_elementMessage" type="HTMLElement">The message (e.g. connected networks, upsell, etc.)</field>
        /// <field name="_loader" type="People.RecentActivity.UI.Modules.Feed.FeedModuleLoader">The loader.</field>
        /// <field name="_state" type="People.RecentActivity.UI.Modules.Feed.feedModuleState">The state.</field>
        /// <field name="_scheduler" type="People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler">The scheduler.</field>
        /// <field name="_jobSet" type="People.JobSet">The address book scheduler.</field>
        /// <field name="_isDisposed" type="Boolean">Whether the instance has been disposed.</field>
        /// <field name="_isMessageSet" type="Boolean">Whether the message has been set.</field>
        /// <field name="_isMessageUpdateScheduled" type="Boolean">Whether a message update has been scheduled.</field>
        /// <field name="_areUxUpdatesSuppressed" type="Boolean">Whether we are supposed to leave the UX alone.</field>
        /// <field name="_hasPendingUpdates" type="Boolean">Whether we have pending UX Updates (caused by suppression).</field>
        /// <field name="_identity" type="People.RecentActivity.Identity">The identity.</field>
        /// <field name="_identityControls" type="Object">The identity controls.</field>
        /// <field name="_identityControlIds" type="Array">The IDs.</field>
        /// <field name="_feed" type="People.RecentActivity.Feed">The current feed.</field>
        /// <field name="_clickHandler" type="Function">The click handler.</field>
        /// <field name="_keyPressHandler" type="Function">The key press handler.</field>
        /// <field name="_listeningCapabilities" type="Boolean">Whether we are listening capabilities changes.</field>
        this._jobSet = jobSet;
    };

    Object.defineProperty(People.RecentActivity.UI.Modules.Feed.FeedModule, "_capabilities", {
        get: function () {
            /// <summary>
            ///     Gets the capabilities.
            /// </summary>
            /// <value type="People.RecentActivity.Platform.SocialCapabilities"></value>
            return People.RecentActivity.Platform.SocialCapabilities.whatsNewCapabilities;
        }
    });

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._element = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._elementInner = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._elementTiles = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._elementTitle = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._elementMessage = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._loader = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._state = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._scheduler = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._jobSet = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._isDisposed = false;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._isMessageSet = false;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._isMessageUpdateScheduled = false;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._areUxUpdatesSuppressed = false;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._hasPendingUpdates = false;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._identity = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._identityControls = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._identityControlIds = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._feed = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._clickHandler = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._keyPressHandler = null;
    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._listeningCapabilities = false;

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype.activateUI = function (element) {
        /// <summary>
        ///     Activates the UI.
        /// </summary>
        /// <param name="element" type="HTMLElement">The element that was created.</param>
        Debug.assert(element != null, 'element != null');

        Jx.log.write(4, 'FeedModule: Activating control');

        this._element = element;

        // fetch the various elements that we need.
        // note that we do not have access to HtmlHelper and all of our magic classes because we do not load
        // the various (heavier) JS files that we would otherwise have access to.
        this._elementInner = element.querySelector('#module-inner');
        this._elementTiles = element.querySelector('#module-tiles');
        this._elementTitle = element.querySelector('#module-title');
        this._elementTitle.id = (this._elementTitle).uniqueID;
        this._elementTitle.innerText = Jx.res.getString('/strings/raModuleFeedTitle');
        this._elementMessage = element.querySelector('#module-message');

        // update ARIA properties, events, animations.
        People.Animation.addTapAnimation(this._element);
        People.Animation.addPressStyling(this._element);

        this._clickHandler = this._onClicked.bind(this);
        this._keyPressHandler = this._onKeyPress.bind(this);
        this._element.addEventListener('click', this._clickHandler, false);
        this._element.addEventListener('keypress', this._keyPressHandler, false);
        this._element.setAttribute('aria-labelledby', this._elementTitle.id);

        var layout = this._layout = Jx.root.getLayout();
        this._tallChangedHandler = this._onIsTallChanged;
        layout.addTallChangedEventListener(this._onIsTallChanged, this);

        // initialize the loader and scheduler.
        this._scheduler = new People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler(this._jobSet);
        this._loader = new People.RecentActivity.UI.Modules.Feed.FeedModuleLoader(this._scheduler);

        // figure out if we stored the state of the module.
        this._state = this._getState();

        if (this._state != null) {
            Jx.log.write(4, 'FeedModule: Re-using state, state=' + JSON.stringify(this._state));

            // we have cached state, which means we can initialize from that -- HOWEVER,
            // we should still load the platform async so we can determine whether the state
            // needs to be updated.
            this._updateUX();

            this._loader.loadPlatform(true, this._onPlatformLoaded.bind(this));
            this._loader.loadModel(true, this._onModelLoaded.bind(this));
        } else {
            Jx.log.write(4, 'FeedModule: No state available, loading platform');

            // we need to figure out the state the hard way.
            this._loader.loadPlatform(false, this._onPlatformLoaded.bind(this));
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype.deactivateUI = function () {
        /// <summary>
        ///     Deactivates the UI.
        /// </summary>
        if (!this._isDisposed) {
            this._isDisposed = true;
            if (this._loader != null) {
                this._loader.dispose();
                this._loader = null;
            }

            if (this._scheduler != null) {
                this._scheduler.dispose();
                this._scheduler = null;
            }

            this._disposeCapabilities();
            this._disposeFeed();
            this._disposeIdentityControls();
            this._disposeElements();
            this._identityControls = null;
            this._identityControlIds = null;
            this._elementTiles = null;
            if (this._tallChangedHandler) {
                this._layout.removeTallChangedEventListener(this._onIsTallChanged, this);
                this._tallChangedHandler = null;
            }
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype.getUI = function () {
        /// <summary>
        ///     Gets the UI that needs to be instantiated.
        /// </summary>
        /// <returns type="String"></returns>
        var chevron = Jx.isRtl() ? "\uE096" : "\uE097";
        return '<div class="ra-module ra-feedModule" role="button" tabindex="0">' +
                 '<div class="ra-feedModuleInner" id="module-inner" aria-hidden="true">' +
                   '<div class="ra-feedModuleTitleContainer" aria-hidden="true">' +
                     '<a class="ra-feedModuleTitle" id="module-title" aria-hidden="true"></a>' +
                     '<a class="ra-feedModuleChevron" aria-hidden="true">' + chevron + '</a>' +
                   '</div>' +
                   '<div class="ra-feedModuleMessage" id="module-message" aria-hidden="true"></div>' +
                   '<div class="ra-feedModuleTiles" id="module-tiles" aria-hidden="true"></div>' +
                 '</div>' +
               '</div>';
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype.suppressUxUpdates = function () {
        /// <summary>
        ///     Suppresses UX Updates
        /// </summary>
        this._areUxUpdatesSuppressed = true;
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype.enableUxUpdates = function () {
        /// <summary>
        ///     Enables UX Updates
        /// </summary>
        this._areUxUpdatesSuppressed = false;

        if (this._hasPendingUpdates) {
            this._updateUX();
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onIsTallChanged = function () {
        if (this._feed && this._feed.initialized && (this._feed.entries.count > 0)) {
            this._updateTiles();
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._disposeFeed = function () {
        if (this._feed != null) {
            this._feed.removeListenerSafe("initializecompleted", this._onFeedInitializeCompleted, this);
            this._feed.removeListenerSafe("refreshcompleted", this._onFeedRefreshCompleted, this);
            this._feed = null;
        }

        if (this._identity != null) {
            this._identity.dispose();
            this._identity = null;
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._disposeCapabilities = function () {
        if (this._listeningCapabilities) {
            People.RecentActivity.UI.Modules.Feed.FeedModule._capabilities.removeListenerSafe("propertychanged", this._onCapabilitiesPropertyChanged, this);

            this._listeningCapabilities = false;
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._disposeIdentityControls = function () {
        if (this._identityControls != null) {
            for (var k in this._identityControls) {
                var control = { key: k, value: this._identityControls[k] };
                // shut down the UI (i.e. "dispose" the instance.)
                control.value.shutdownUI();
            }

            People.Social.clearKeys(this._identityControls);

            this._identityControlIds.length = 0;

            // clear out the tiles HTML.
            this._elementTiles.innerHTML = '';
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._disposeElements = function () {
        if (this._element != null) {
            this._element.removeEventListener('click', this._clickHandler, false);
            this._element.removeEventListener('keypress', this._keyPressHandler, false);
            this._element.innerHTML = '';
            this._elementTitle = null;
            this._elementMessage = null;
            this._elementInner = null;
            this._element = null;
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._getState = function () {
        /// <returns type="People.RecentActivity.UI.Modules.Feed.feedModuleState"></returns>
        var state = Jx.appData.localSettings().get(moduleStateKey);
        if (!Jx.isNullOrUndefined(state)) {
            try {
                // we've got state, so try to deserialize it. ignore exceptions.
                var obj = JSON.parse(state);
                if (obj.networkNames != null) {
                    // we have a state that is valid (or at least not corrupt), return it.
                    return obj;
                }

            }
            catch (e) {
            }
        }

        return null;
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._updateState = function () {
        var names = [];
        var capabilities = People.RecentActivity.UI.Modules.Feed.FeedModule._capabilities;
        if (capabilities.canShowWhatsNew) {
            // get the network names, update the state
            var networks = capabilities.whatsNewNetworks;
            for (var i = 0, len = networks.length; i < len; i++) {
                // skip the aggregated network, it shouldn't be in the list of displayed networks.
                if (!networks[i].isAggregatedNetwork) {
                    names.push(networks[i].name);
                }
            }
        }

        var state = People.RecentActivity.UI.Modules.Feed.create_feedModuleState(names);
        if (!this._isStateEqual(this._state, state)) {
            Jx.log.write(4, 'FeedModule: State updated, state=' + JSON.stringify(state));

            // update the message now that we have network names, etc.
            Jx.appData.localSettings().set(moduleStateKey, JSON.stringify(state));

            this._state = state;
            this._updateUX();
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._updateUX = function () {
        var that = this;

        if (this._areUxUpdatesSuppressed) {
            // Don't update the UX if we've been instructed to wait.
            this._hasPendingUpdates = true;
            return;
        }

        this._hasPendingUpdates = false;

        if (!this._isMessageSet) {
            // no state yet, we can update our UX without an animation.
            this._updateUXInternal();
            this._isMessageSet = true;
            return;
        }

        if (this._isMessageUpdateScheduled) {
            // we've already scheduled an update.
            return;
        }

        this._isMessageUpdateScheduled = true;

        // if the message has already been set before, we need to do a cross-fade between the two states.
        this._scheduler.schedule(function () {
            if (that._isDisposed) {
                // the module was disposed.
                return;
            }

            that._crossFade(that._elementInner, function () {
                // quickly update the state and then fade in the element again.
                that._updateUXInternal();
            }, function () {
                // we're done doing all of our animations.
                that._isMessageSet = true;
                that._isMessageUpdateScheduled = false;
                that._scheduler.complete();
            });
        });
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._updateUXInternal = function () {
        var names = this._state.networkNames;
        if (names.length > 0) {
            Jx.removeClass(this._element, 'ra-feedModuleNoNetworks');
            // show the names of the networks.
            this._elementMessage.innerText = names.join(Jx.res.getString('/strings/raModuleFeedNetworkSeparator'));
            this._elementTiles.style.display = '';
        }
        else {
            Jx.addClass(this._element, 'ra-feedModuleNoNetworks');
            // show the upsell message.
            this._elementMessage.innerText = Jx.res.getString('/strings/raModuleFeedUpsell');
            this._elementTiles.style.display = 'none';
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._updateFeed = function () {
        if (!People.RecentActivity.UI.Modules.Feed.FeedModule._capabilities.canShowWhatsNew) {
            this._disposeIdentityControls();
            return;
        }

        if (!this._loader.isModelLoaded) {
            // the model has not yet been loaded, so we cannot update the tiles yet. when the model does
            // finally get loaded it will invoke _updateFeed again.
            return;
        }

        // the model is now available, so initialize the feed.
        this._identity = People.RecentActivity.Identity.createWhatsNewIdentity();
        this._feed = this._identity.networks.aggregatedNetwork.feed;
        if (!this._feed.initialized) {
            this._feed.addListener("initializecompleted", this._onFeedInitializeCompleted, this);
            this._feed.initialize();
        } else {
            // We initialized the feed before, now refresh.
            this._feed.addListener("refreshcompleted", this._onFeedRefreshCompleted, this);
            this._feed.refresh();
        }

        if (this._feed.entries.count > 0) {
            Jx.log.write(4, 'FeedModule: Loading initial set of tiles.');

            // there are entries already (from cache), so we can render those tiles.
            this._updateTiles();
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._updateTiles = function () {
        var that = this;

        this._scheduler.schedule(function () {
            if (that._isDisposed) {
                // the module was disposed.
                return;
            }

            if (that._identityControls == null) {
                Jx.log.write(4, 'FeedModule: Initializing tiles for the first time.');

                // this is the first time, initialize a new list.
                that._identityControls = {};
                that._identityControlIds = [];
                that._updateTilesInternal();
            } else {
                if (that._isListOfPublishersEqual()) {
                    // the list hasn't actually changed, so whatever.
                    that._scheduler.complete();
                    return;
                }

                Jx.log.write(4, 'FeedModule: Updating tiles, fading out first.');

                // fade out the existing tiles first.
                People.Animation.fadeOut(that._elementTiles).done(function () {
                    if (!that._isDisposed) {
                        // dispose the current identity controls, le sigh.
                        that._disposeIdentityControls();
                        that._updateTilesInternal();
                    }

                    return null;
                });
            }

        });
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._updateTilesInternal = function () {
        var that = this;

        // go through the entries in the feed until we've found enough tiles.
        var collection = this._feed.entries;

        // initialize a single options instance so we don't have to do this over and over and over.
        var optionsControl = People.RecentActivity.Imports.create_identityControlOptions(false, null, null, null);
        var tileSize = (this._layout.getIsTall() && (this._layout.getLayoutState() !== "snapped")) ? 60 : 40;
        var optionsElement = People.RecentActivity.Imports.create_identityElementTileOptions(tileSize, null);

        for (var i = 0, len = collection.count; i < len; i++) {
            // initialize a new identity control for this person, if they haven't been represented yet.
            var key = this._getPublisherKey(collection.item(i));

            if (!!Jx.isUndefined(this._identityControls[key])) {
                // whoo! initialize a new instance.
                var control = new People.IdentityControl(collection.item(i).publisher.getDataContext(), this._jobSet, optionsControl);
                var element = document.createElement('div');
                element.innerHTML = control.getUI(People.IdentityElements.Tile, optionsElement);
                control.activateUI(element);

                // insert the element into the DOM.
                this._elementTiles.appendChild(element.firstChild);

                // make sure we stash the control.
                this._identityControls[key] = control;
                this._identityControlIds.push(key);

                if (Object.keys(this._identityControls).length === moduleTileCount) {
                    // we're done here, coolio.
                    break;
                }
            }
        }

        // once we're done, fade in the tiles.
        this._elementTiles.style.opacity = '0';

        People.Animation.fadeIn(this._elementTiles).done(function () {
            if (!that._isDisposed) {
                // we're done with the scheduler.
                that._scheduler.complete();
            }

            return null;
        });
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._getPublisherKey = function (entry) {
        /// <param name="entry" type="People.RecentActivity.FeedEntry"></param>
        /// <returns type="String"></returns>
        Debug.assert(entry != null, 'entry != null');

        var publisher = entry.publisher;
        var key = publisher.personId;

        if (!Jx.isNonEmptyString(key)) {
            // no person ID is available (might be a temporary contact), so create our own "person ID".
            key = publisher.sourceId + ';' + publisher.id;
        }

        return key;
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._crossFade = function (element, fadeOut, fadeIn) {
        /// <param name="element" type="HTMLElement"></param>
        /// <param name="fadeOut" type="Function"></param>
        /// <param name="fadeIn" type="Function"></param>
        var that = this;

        Debug.assert(element != null, 'element != null');
        Debug.assert(fadeOut != null, 'fadeOut != null');
        Debug.assert(fadeIn != null, 'fadeIn != null');

        People.Animation.fadeOut(element).done(function () {
            if (that._isDisposed) {
                return null;
            }

            // invoke the fade-out callback.
            fadeOut();

            People.Animation.fadeIn(element).done(function () {
                if (that._isDisposed) {
                    return null;
                }

                fadeIn();
                return null;
            });

            return null;
        });
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._isListOfPublishersEqual = function () {
        /// <returns type="Boolean"></returns>
        var collection = this._feed.entries;
        var countFeed = collection.count;

        var countIds = this._identityControlIds.length;
        if (countIds > countFeed) {
            // there's fewer entries in the feed, so clearly stuff changed.
            return false;
        }

        // keep track of duplicates, of course.
        var map = {};

        for (var i = countFeed - 1, j = 0; (i >= 0) && (j < countIds) ; i--) {
            // fetch the key of the publisher, so we can check.
            var key = this._getPublisherKey(collection.item(i));
            if (!!Jx.isUndefined(map[key])) {
                if (this._identityControlIds[j] !== key) {
                    return false;
                }

                j++;
            }

            map[key] = true;
        }

        return true;
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._isStateEqual = function (a, b) {
        /// <param name="a" type="People.RecentActivity.UI.Modules.Feed.feedModuleState"></param>
        /// <param name="b" type="People.RecentActivity.UI.Modules.Feed.feedModuleState"></param>
        /// <returns type="Boolean"></returns>
        if ((a != null) !== (b != null)) {
            // they're not equal by the fact that one is null, but the other isn't.
            return false;
        }

        if ((a == null) && (b == null)) {
            // both are null.
            return true;
        }

        // check the networks in the list.
        var networks = {};
        for (var i = 0, len = a.networkNames.length; i < len; i++) {
            networks[a.networkNames[i]] = true;
        }

        for (var i = 0, len = b.networkNames.length; i < len; i++) {
            if (!!Jx.isUndefined(networks[b.networkNames[i]])) {
                // if the network isn't in the list, then they're not equal.
                return false;
            }

            delete networks[b.networkNames[i]];
        }

        // if the count is zero it means the same networks were in the list.
        return !Object.keys(networks).length;
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onModelLoaded = function (async) {
        /// <param name="async" type="Boolean"></param>
        Jx.log.write(4, 'FeedModule: Model loaded, async=' + async);

        // okay, check whether we can show What's New and all that.
        var capabilities = People.RecentActivity.UI.Modules.Feed.FeedModule._capabilities;

        if (!this._listeningCapabilities) {
            this._listeningCapabilities = true;
            capabilities.addListener("propertychanged", this._onCapabilitiesPropertyChanged, this);
        }

        this._updateFeed();
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onPlatformLoaded = function (async) {
        /// <param name="async" type="Boolean"></param>
        Jx.log.write(4, 'FeedModule: Platform loaded, async=' + async);

        // okay, check whether we can show What's New and all that.
        var capabilities = People.RecentActivity.UI.Modules.Feed.FeedModule._capabilities;

        if (!this._listeningCapabilities) {
            this._listeningCapabilities = true;
            capabilities.addListener("propertychanged", this._onCapabilitiesPropertyChanged, this);
        }

        this._updateState();

        if (!async) {
            // if the platform was loaded sync, it means we're in the 'first run' mode. 
            // load the model async now, so we can start pulling down entries and populate the control further.
            this._loader.loadModel(true, this._onModelLoaded.bind(this));
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onCapabilitiesPropertyChanged = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        switch (e.propertyName) {
            case 'CanShowWhatsNew':
                // apparently the value of "can show what's new" has changed, so update our state.
                this._updateState();
                this._updateFeed();
                break;
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onFeedInitializeCompleted = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        this._feed.removeListenerSafe("initializecompleted", this._onFeedInitializeCompleted, this);

        if (e.result.isSuccessOrPartialFailure) {
            // initialize has been completed, update the tiles.
            Jx.log.write(4, 'FeedModule: Initialized feed, updating tiles.');

            this._updateTiles();
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onFeedRefreshCompleted = function (e) {
        /// <param name="e" type="People.RecentActivity.ActionCompletedEventArgs"></param>
        Debug.assert(e != null, 'e != null');

        this._feed.removeListenerSafe("refreshcompleted", this._onFeedRefreshCompleted, this);

        if (e.result.isSuccessOrPartialFailure) {
            // initialize has been completed, update the tiles.
            Jx.log.write(4, 'FeedModule: Refreshed feed, updating tiles.');
            this._updateTiles();
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onKeyPress = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        switch (ev.keyCode) {
            case WinJS.Utilities.Key.enter:
            case WinJS.Utilities.Key.space:
                People.Nav.navigate(People.Nav.getWhatsNewUri(null));
                break;
        }
    };

    People.RecentActivity.UI.Modules.Feed.FeedModule.prototype._onClicked = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');

        People.Nav.navigate(People.Nav.getWhatsNewUri(null));
    };

})();


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    /// <reference path="..\..\..\..\..\shared\WinJS\WinJS.ref.js" />
    /// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

    /// <reference path="..\..\..\Core\Events\NotifyPropertyChangedEventArgs.js" />
    /// <reference path="..\..\..\Imports\IdentityControl\IdentityControlOptions.js" />
    /// <reference path="..\..\..\Imports\IdentityControl\IdentityElementTileOptions.js" />
    /// <reference path="..\..\..\Model\Events\ActionCompletedEventArgs.js" />
    /// <reference path="..\..\..\Model\Feed.js" />
    /// <reference path="..\..\..\Model\FeedEntry.js" />
    /// <reference path="..\..\..\Model\Identity.js" />
    /// <reference path="..\..\..\Platform\SocialCapabilities.js" />
    /// <reference path="FeedModuleLoader.js" />
    /// <reference path="FeedModuleScheduler.js" />
    /// <reference path="FeedModuleState.js" />
    ///
    /// People.RecentActivity.UI.Modules.Feed.LatestNotification 
    ///

    People.RecentActivity.UI.Modules.Feed.LatestNotification = function (jobSet, platformCache) {
        /// This module is to show the latest social update on the main hub page.
        this._jobSet = jobSet;
        this._platformCache = platformCache;
        this._notificationPreviewControls = [];
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype.getUI = function (element) {
        return "<div class='notificationList'></div>";
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype.activateUI = function (element) {
        // initialize the loader and scheduler.
        this._scheduler = new People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler(this._jobSet);
        this._loader = new People.RecentActivity.UI.Modules.Feed.FeedModuleLoader(this._scheduler);
        this._notificationListElement = element;
        this._loader.loadPlatform(false, this._onPlatformLoaded.bind(this));

        this._layout = Jx.root.getLayout();
        People.RecentActivity.UI.Core.EventManager.events.addListener("windowresized", this._onWindowResized, this);
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._onWindowResized = function () {
        if (this._notifications && this._notifications.initialized && (this._notifications._notifications.count > 0)) {
            this._updateUX();
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._showBoilerText = function () {
        var boilerText = Jx.res.getString('/strings/abLatestNotificationBoilerText');
        var boilerDiv = "<div class='notificationBoilerText'>" +
                            Jx.escapeHtml(boilerText) +
                        "</div>";

        this._cleanupNotifications();
        this._notificationListElement.innerHTML = boilerDiv;
    }

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._cleanupNotifications = function () {
        while (this._notificationPreviewControls.length > 0) {
            var notificationPreviewControl = this._notificationPreviewControls.pop();
            notificationPreviewControl.dispose();
        }
    }

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._updateUX = function () {
        if (this._capabilities.canShowNotifications) {
            this._updateUXInternal();
        } else {
            this._showBoilerText();
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype.deactivateUI = function () {
        /// <summary>
        ///     Deactivates the UI.
        /// </summary>
        if (!this._isDisposed) {
            this._isDisposed = true;
            if (this._loader != null) {
                this._loader.dispose();
                this._loader = null;
            }

            if (this._scheduler != null) {
                this._scheduler.dispose();
                this._scheduler = null;
            }

            if (this._propertychangedListenerAdded) {
                this._capabilities.removeListenerSafe("propertychanged", this._onCapabilitiesPropertyChanged, this);
                this._propertychangedListenerAdded = false;
            }

            if (this._notifications) {
                if (this._initializecompletedListenerAdded) {
                    this._notifications.removeListenerSafe("initializecompleted", this._onInitializeCompleted, this);
                }

                if (this._refreshcompletedListenerAdded) {
                    this._notifications.removeListenerSafe("refreshcompleted", this._onRefreshCompleted, this);
                }
                this._notifications = null;
            }

            if (this._meIdentity != null) {
                this._meIdentity.dispose();
                this._meIdentity = null;
            }

            People.RecentActivity.UI.Core.EventManager.events.removeListenerSafe("windowresized", this._onWindowResized, this);
            this._cleanupNotifications();
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._updateUXInternal = function () {
        var notifications = this._meIdentity.networks.aggregatedNetwork.notifications._notifications;
        this._notificationListElement.innerHTML = "";
        var notificationsPerHeight = (this._layout.getIsTall() && (this._layout.getLayoutState() !== "snapped")) ? (this._notificationListElement.offsetHeight / 292) - 1 : 1;
        var notificationsToShow = Math.min(notifications.count, notificationsPerHeight, 3);
        for (var i = 0; i < notificationsToShow; i++) {
            var notificationPreviewControl = new NotificationPreviewControl(notifications._items[i], notifications._network$1, this._layout);
            this._notificationPreviewControls.push(notificationPreviewControl);
            this._notificationListElement.appendChild(notificationPreviewControl.notificationContainer);
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._updateNotifications = function () {
        if (!this._loader.isModelLoaded) {
            // the model has not yet been loaded, so we cannot proceed yet. when the model does
            // finally get loaded it will invoke _updateNotifications again.
            return;
        }
        if (!this._capabilities.canShowNotifications) {
            // if the required capability is not there we need to skip further processing 
            // and make sure the UI reflects the current capability
            this._updateUX();
            return;
        }
        this._notifications = this._meIdentity.networks.aggregatedNetwork.notifications;
        if (!this._notifications.initialized) {
            this._notifications.addListener("initializecompleted", this._onInitializeCompleted, this);
            this._initializecompletedListenerAdded = true;
            this._notifications.initialize();
        } else {
            // We initialized the notifications before, now refresh.
            this._notifications.addListener("refreshcompleted", this._onRefreshCompleted, this);
            this._refreshcompletedListenerAdded = true;
            this._notifications.refresh();
        }
        if (this._notifications._notifications.count > 0) {
            Jx.log.write(4, 'LatestNotification Module: we got notifications');
            this._updateUX();
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._onModelLoaded = function (async) {
        /// <param name="async" type="Boolean"></param>
        Jx.log.write(4, 'LatestNotification Module: Model loaded, async=' + async);
        // the model is now available, so initialize the feed.
        if (!this._meIdentity) {
            this._meIdentity = People.RecentActivity.Identity.createMeIdentity();
            this._capabilities = this._meIdentity.capabilities;
        }
        if (!this._propertychangedListenerAdded) {
            this._capabilities.addListener("propertychanged", this._onCapabilitiesPropertyChanged, this);
            this._propertychangedListenerAdded = true;
        }
        this._updateNotifications();
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._onPlatformLoaded = function (async) {
        /// <param name="async" type="Boolean"></param>
        Jx.log.write(4, 'LatestNotification Module: Platform loaded, async=' + async);
        // the model is now available, so initialize the feed.
        if (!this._meIdentity) {
            this._meIdentity = People.RecentActivity.Identity.createMeIdentity();
            this._capabilities = this._meIdentity.capabilities;
        }
        if (!this._propertychangedListenerAdded) {
            this._capabilities.addListener("propertychanged", this._onCapabilitiesPropertyChanged, this);
            this._propertychangedListenerAdded = true;
        }
        if (!async) {
            // if the platform was loaded sync, it means we're in the 'first run' mode. 
            // load the model async now, so we can start pulling down entries and populate the control further.
            this._loader.loadModel(true, this._onModelLoaded.bind(this));
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._onCapabilitiesPropertyChanged = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');
        switch (e.propertyName) {
            case 'CanShowNotifications':
                // apparently the value of "CanShowNotifications" has changed, so update ourselves
                this._updateNotifications();
                break;
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._onInitializeCompleted = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');
        if (e.result.isSuccessOrPartialFailure) {
            // initialize has been completed, update the UX
            Jx.log.write(4, 'LatestNotification: Initialized feed, update UX.');
            this._updateUX();
        }
    };

    People.RecentActivity.UI.Modules.Feed.LatestNotification.prototype._onRefreshCompleted = function (e) {
        /// <param name="e" type="People.RecentActivity.NotifyPropertyChangedEventArgs"></param>
        Debug.assert(e != null, 'e != null');
        if (e.result.isSuccessOrPartialFailure) {
            // refresh has been completed, update the UX
            Jx.log.write(4, 'LatestNotification: Initialized feed, update UX.');
            this._updateUX();
        }
    };

    var NotificationPreviewControl = function (notificationItem, network, layout) {
        this._notificationItem = notificationItem;
        this._network = network;
        // Create the identity control tile
        this._identityControl = new People.IdentityControl();
        var notificationPublisherTileHTML = this._identityControl.getUI(People.IdentityElements.Tile, {
            className: "notificationTile",
            size: (layout.getIsTall() && (layout.getLayoutState() !== "snapped")) ? 60 : 40
        });

        // Create the container
        this.notificationContainer = document.createElement("div");
        this.notificationContainer.tabIndex = 0;
        this.notificationContainer.role = "button";
        Jx.addClass(this.notificationContainer, "notificationContainer");
        A.addTapAnimation(this.notificationContainer);
        this._keyPressHandler = this._onKeyPress.bind(this);
        this.notificationContainer.addEventListener('keypress', this._keyPressHandler, false);
        this._textClickedHandler = this._onNotificationTextClicked.bind(this);
        this.notificationContainer.addEventListener('click', this._textClickedHandler, false);
        // Wrap @ in special characters to make sure it stays next to the handle it belongs to.
        var escapedMessage = Jx.escapeHtml(notificationItem.info.message.replace("@", "\u202a@\u202c"));
        this.notificationContainer.innerHTML =
            "<a class='notificationText' title='" + escapedMessage + "'>" +
                escapedMessage +
            "</a>" +
            notificationPublisherTileHTML +
            "<div class='notificationDetail'>" +
                "<div class='notificationDate'>" +
                    Jx.escapeHtml(People.RecentActivity.UI.Core.LocalizationHelper.getTimeString(notificationItem._timestamp)) +
                "</div>" +
                "<div class='notificationVia'>" +
                    Jx.escapeHtml(Jx.res.loadCompoundString("/strings/socialSectionViaText", notificationItem.info.via)) +
                "</div>" +
            "</div>";

        // Activate the identity control tile
        var identityElement = this.notificationContainer.querySelector(".notificationTile");
        this._identityControl.activateUI(identityElement);
        var publisherDataContext = People.RecentActivity.ContactCache.findOrCreateContact(notificationItem.info.publisher).getDataContext();
        this._identityControl.updateDataSource(publisherDataContext);
    };

    NotificationPreviewControl.prototype.dispose = function () {
        if (this._keyPressHandler) {
            this.notificationContainer.removeEventListener("keypress", this._keyPressHandler, false);
            this._keyPressHandler = null;
        }

        if (this._textClickedHandler) {
            this.notificationContainer.removeEventListener("click", this._textClickedHandler, false);
            this._textClickedHandler = null;
        }

        if (this._identityControl) {
            this._identityControl.shutdownUI();
            this._identityControl = null;
        }

        this._notificationItem = null;
    };

    NotificationPreviewControl.prototype._onNotificationTextClicked = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');
        this._navigate();
    };

    NotificationPreviewControl.prototype._onKeyPress = function (ev) {
        /// <param name="ev" type="Event"></param>
        Debug.assert(ev != null, 'ev != null');
        if (ev.keyCode === WinJS.Utilities.Key.enter ||
            ev.keyCode === WinJS.Utilities.Key.space) {
            this._navigate();
        }
    };

    NotificationPreviewControl._convertType = function (type) {
        /// <param name="type" type="People.RecentActivity.NotificationType"></param>
        /// <returns type="String"></returns>
        var convertedType = People.RecentActivity.FeedObjectType.none;
        switch (type) {
            case People.RecentActivity.NotificationType.entry:
            case People.RecentActivity.NotificationType.video:
                convertedType = People.RecentActivity.FeedObjectType.entry;
                break;
            case People.RecentActivity.NotificationType.photo:
                convertedType = People.RecentActivity.FeedObjectType.photo;
                break;
            case People.RecentActivity.NotificationType.photoAlbum:
                convertedType = People.RecentActivity.FeedObjectType.photoAlbum;
                break;
        }

        return (convertedType).toString();
    };

    NotificationPreviewControl.prototype._navigate = function () {
        switch (this._notificationItem.objectType) {
            case People.RecentActivity.NotificationType.entry:
            case People.RecentActivity.NotificationType.photo:
            case People.RecentActivity.NotificationType.photoAlbum:
                this._navigateToSelfPage();
                break;
            case People.RecentActivity.NotificationType.person:
                this._navigateToPerson();
                break;
            default:
                this._navigateToUrl();
                break;
        }
    };

    NotificationPreviewControl.prototype._navigateToSelfPage = function () {
        var data = People.RecentActivity.UI.Core.create_selfPageNavigationData(this._notificationItem.sourceId, this._notificationItem.objectId, NotificationPreviewControl._convertType(this._notificationItem.objectType));
        data.fallbackUrl = this._notificationItem.link;
        People.RecentActivity.UI.Core.SelfPageNavigationHelper.navigate(this._network.identity.id, data);
    };

    NotificationPreviewControl.prototype._navigateToPerson = function () {
        var contact = this._notificationItem.publisher;
        // We need to make sure that we have a person ID before we navigate.
        var personId = contact.personId;
        if (Jx.isNonEmptyString(personId)) {
            // navigate straight to the person we know and love.
            People.Nav.navigate(People.Nav.getViewPersonUri(personId, null));
        } else {
            // if we don't know the person, we can still use the temporary person infrastructure
            // to navigate to their profile and what's new.
            var info = contact.getDataContext();
            People.Nav.navigate(People.Nav.getViewPersonUri(null, info));
        }
    };

    NotificationPreviewControl.prototype._navigateToUrl = function () {
        var link = this._notificationItem.link;
        if (Jx.isNonEmptyString(link)) {
            // log the clickthrough action, then launch the URI.
            People.RecentActivity.Core.BiciHelper.createClickThroughDatapoint(this._notificationItem.sourceId, People.RecentActivity.Core.BiciClickthroughAction.unsupportedNotification);
            People.RecentActivity.UI.Core.UriHelper.launchUri(link);
        }
    };

})();

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="FeedModuleScheduler.js" />

People.RecentActivity.UI.Modules.Feed.FeedModuleLoader = function(scheduler) {
    /// <summary>
    ///     Provides a simple loader that takes care of importing the platform, determining the state
    ///     of the feed module, etc.
    /// </summary>
    /// <param name="scheduler" type="People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler">The scheduler.</param>
    /// <field name="_socialPlatformPath" type="String" static="true">The path to the platform.</field>
    /// <field name="_socialModelPath" type="String" static="true">The path to the model.</field>
    /// <field name="_socialImportsPath" type="String" static="true">The path to the imports.</field>
    /// <field name="_socialCorePath" type="String" static="true">The path to the social core.</field>
    /// <field name="_socialProvidersPath" type="String" static="true">The path to the providers.</field>
    /// <field name="_scheduler" type="People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler">The scheduler.</field>
    /// <field name="_disposed" type="Boolean">Whether the instance has been disposed.</field>
    Debug.assert(scheduler != null, 'scheduler != null');

    this._scheduler = scheduler;
};

People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype._scheduler = null;
People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype._disposed = false;
People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype._isModelLoaded = false;
People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype._isPlatformLoaded = false;

Object.defineProperty(People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype, "isModelLoaded", {
    get: function () {
        /// <summary>
        ///     Gets a value indicating whether the model has been loaded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isModelLoaded;
    }
});

Object.defineProperty(People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype, "isPlatformLoaded", {
    get: function () {
        /// <summary>
        ///     Gets a value indicating whether the platform has been loaded.
        /// </summary>
        /// <value type="Boolean"></value>
        return this._isPlatformLoaded;
    }
});

People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (!this._disposed) {
        if (this._scheduler != null) {
            this._scheduler.dispose();
        }

        this._disposed = true;
    }
};

People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype.loadPlatform = function(async, callback) {
    /// <param name="async" type="Boolean"></param>
    /// <param name="callback" type="System.Action`1"></param>
    Debug.assert(callback != null, 'callback != null');

    var that = this;

    this._scheduleSequence([ function() {
        People.loadSocialCore();
    }, function() {
        People.loadSocialImports();
    }, function() {
        People.loadSocialPlatform();
    }, function () {
        that._isPlatformLoaded = true;
        callback(async);
    } ], async);
};

People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype.loadModel = function(async, callback) {
    /// <param name="async" type="Boolean"></param>
    /// <param name="callback" type="System.Action`1"></param>
    Debug.assert(callback != null, 'callback != null');

    var that = this;

    this._scheduleSequence([ function() {

        try {
            // Initialize localStorage: this takes 80-100ms on ARM the first time it is accessed,
            // and will otherwise be loaded by Social.Providers.js alongside other work.
            var storage = window.localStorage;
        }
        catch (e) {
        }

    }, function() {
        People.loadSocialProviders();
    }, function() {
        People.loadSocialModel();
    }, function () {
        that._isModelLoaded = true;
        callback(async);
    } ], async);
};

People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype._scheduleSequence = function(actions, async) {
    /// <param name="actions" type="Array" elementType="Function"></param>
    /// <param name="async" type="Boolean"></param>
    for (var n = 0; n < actions.length; n++) {
        var action = actions[n];
        this._scheduleSingleAction(action, async);
    }
};

People.RecentActivity.UI.Modules.Feed.FeedModuleLoader.prototype._scheduleSingleAction = function(action, async) {
    /// <param name="action" type="Function"></param>
    /// <param name="async" type="Boolean"></param>
    var that = this;
    
    if (async) {
        this._scheduler.schedule(function() {
            if (!that._disposed) {
                action();
            }

            that._scheduler.complete();
        });
    }
    else {
        action();
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler = function(jobSet) {
    /// <summary>
    ///     Provides a very simple scheduler.
    /// </summary>
    /// <param name="jobSet" type="People.JobSet"></param>
    /// <field name="_tasks" type="Array">The tasks.</field>
    /// <field name="_current" type="Function">The current task.</field>
    /// <field name="_disposed" type="Boolean">Whether the instance was disposed.</field>
    /// <field name="_jobSet" type="People.JobSet">The jobSet that will execute the tasks.</field>
    /// <field name="_pending" type="Boolean">Whether async work is pending execution.</field>
    this._jobSet = jobSet;
    this._tasks = [];
};


People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype._tasks = null;
People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype._current = null;
People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype._disposed = false;
People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype._jobSet = null;
People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype._pending = false;

People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype.dispose = function() {
    /// <summary>
    ///     Disposes the instance.
    /// </summary>
    if (!this._disposed) {
        this._disposed = true;
        this._current = null;
        this._tasks.length = 0;
    }
};

People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype.schedule = function(task) {
    /// <summary>
    ///     Schedules a task.
    /// </summary>
    /// <param name="task" type="Function">The task.</param>
    Debug.assert(task != null, 'task != null');
    Debug.assert(!this._disposed, '!this.disposed');
    if (!this._disposed) {
        this._tasks.push(task);
        this._run();
    }
};

People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype.complete = function() {
    /// <summary>
    ///     Completes the current task.
    /// </summary>
    if (!this._disposed) {
        this._current = null;
        this._run();
    }
};

People.RecentActivity.UI.Modules.Feed.FeedModuleScheduler.prototype._run = function() {
    var that = this;
    
    if (!this._pending) {
        this._pending = true;
        this._jobSet.addUIJob(null, function() {
            that._pending = false;
            if (!that._disposed && (that._current == null) && (that._tasks.length > 0)) {
                that._current = that._tasks.shift();
                that._current();
            }

        }, null, People.Priority.feedModule);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\..\..\Shared\JSUtil\Namespace.js" />

People.RecentActivity.UI.Modules.Feed.create_feedModuleState = function(networkNames) {
    var o = { };
    Debug.assert(networkNames != null, 'networkNames != null');
    o.networkNames = networkNames;
    return o;
};
});