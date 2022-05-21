
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../Controls/Collections/AddressBookCollections.js"/>
/// <reference path="ContactGridSection.js"/>
/// <reference path="../../Shared/IdentityControl/IdentityElements.js"/>
/// <reference path="../../Shared/IdentityControl/IdentityControlNode.js"/>

Jx.delayDefine(People, "FavoriteContactsSection", function () {

    var P = window.People;
    var WAC = Windows.ApplicationModel.Contacts;
    var InstruID = Microsoft.WindowsLive.Instrumentation.Ids;

    P.FavoriteContactsSection = /*@constructor*/function (platformCache) {
        ///<summary>The Favorites section provides a large display of a few favorite contacts</summary>
        ///<param name="platformCache" type="P.PlatformCache"/>
        P.ContactGridSection.call(this, "favoritesSection", "/strings/abFavoritesSectionTitle", platformCache.getPlatform().peopleManager);
        this._totalCounter = /*@static_cast(P.TotalCounter)*/null;
        this._platformCache = platformCache;
        this._accountSync = /*@static_cast(P.Accounts.AccountSynchronization)*/null;
        this._whatsNew = /*@static_cast(P.RecentActivity.UI.Modules.Feed.FeedModule)*/null;
        this._isActive = false;
    };
    Jx.inherit(P.FavoriteContactsSection, P.ContactGridSection);
    var base = P.ContactGridSection.prototype;

    P.FavoriteContactsSection.prototype.getContent = function () {
        // Only show "What's new" if the list of connected accounts is synchronized
        var jobSet = this.getJobSet();
        this._accountSync = new P.Accounts.AccountSynchronization(this._platformCache.getPlatform());
        var showWhatsNew = this._accountSync.areAccountsAvailable();

        if (showWhatsNew) {
            this._whatsNew = new P.RecentActivity.UI.Modules.Feed.FeedModule(jobSet);
        }
        return  "<div class='favoritesSectionGrid'>" +
                    "<div class='favoritesSectionBackground'></div>" +
                    base.getContent.apply(this, arguments) +
                    "<div class='ab-whatsNew'>" +
                        (showWhatsNew ? this._whatsNew.getUI() : "") +
                    "</div>" +
                "</div>";
    }

    P.FavoriteContactsSection.prototype._getPlaceholderUI = function () {
        return "<div class='placeholder'>" +
                    Jx.res.getString("/strings/abFavoritesPlaceholder") +
               "</div>";
    };

    P.FavoriteContactsSection.prototype.totalCountChanged = function (newCount) {
        var formerlyHidden = Jx.hasClass(this._contentElement, "zeroContacts");
        // We always have the Add button in the grid, so if there are no contacts newCount should be 1
        Jx.setClass(this._contentElement, "zeroContacts", newCount <= 1);
        if (newCount > 1 && formerlyHidden) {
            this._grid.onResize();
        }
    };

    P.FavoriteContactsSection.prototype.extentReady = function (section) {
        this._isActive = true;
        this._totalCounter = new P.TotalCounter(this._collection, this);
        this.totalCountChanged(this._totalCounter.count);
        base.extentReady.apply(this, arguments);
    };

    P.FavoriteContactsSection.prototype.hide = function () {
        ///<summary>Prevent the contact grid section from hiding us when the grid is empty. Instead we need to display
        ///the placehloder text.</summary>
    };

    P.FavoriteContactsSection.prototype.render = function () {
        P.ContactGridSection.prototype.render.call(this);
        if (this._whatsNew) {
            this._whatsNew.activateUI(this._contentElement.querySelector(".ab-whatsNew"));
        }
    }

    P.FavoriteContactsSection.prototype.contentReadyAsync = function () {
        if (this._whatsNew) {
            this._whatsNew.suppressUxUpdates();
        }
        if (this.isInView()) {
            var animatingElements = [this._contentElement.querySelector(".gridContainer")];
            if (this._whatsNew) {
                animatingElements.push(this._contentElement.querySelector(".ab-whatsNew"));
            }

            if (this._placeholder && this._placeholder.display !== "none") {
                animatingElements.push(this._placeholder);
            }

            return animatingElements;
        }
        return [];
    }

    P.FavoriteContactsSection.prototype.onEnterComplete = function () {
        P.ContactGridSection.prototype.onEnterComplete.call(this);
        if (this._whatsNew) {
            this._whatsNew.enableUxUpdates();
        } else {
            if (this._accountSync.areAccountsAvailable(this._showWhatsNew, this)) {
                this._showWhatsNew();
            }
        }
    }

    P.FavoriteContactsSection.prototype._showWhatsNew = function () {
        /// <summary>Called when the connected accounts are synchronized, which will cause us to show the What's New
        /// control.  Before that, we'd be showing it in the wrong state</summary>
        Debug.assert(!this._whatsNew);
        Debug.assert(!this._isEntering);

        var whatsNew = this._whatsNew = new P.RecentActivity.UI.Modules.Feed.FeedModule(this.getJobSet());
        var element = this._contentElement.querySelector(".ab-whatsNew");
        element.innerHTML = whatsNew.getUI();
        whatsNew.activateUI(element);

        Jx.removeClass(element, "ab-whatsNewHidden");
        var that = this;
        WinJS.UI.Animation.fadeIn(element);
    };

    P.FavoriteContactsSection.prototype._getCollection = function () {
        ///<returns type="P.Collection">The collection used to populate the favorites view</returns>
        var that = this;
        return this._platformCache.getCollection(this.name, function (platform) {
            /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
            return P.AddressBookCollections.makeFavoritesCollection(platform.peopleManager, that.getJobSet());
        });
    };

    P.FavoriteContactsSection.prototype._getFactories = function () {
        ///<returns type="Object">The map of factories that will be used to populate the favorites view</returns>

        var type, options;
        if (this.getOrientation() === P.Orientation.horizontal) {
            type = P.IdentityElements.TileLayout;
            options = {
                className: "ic-favorite",
                size: 180,
                useInnerHighlight: true,
                primaryContent: { element: P.IdentityElements.Name, className: "ic-favoriteName" },
                tilePriority: P.Priority.userTileRender
            };
        } else {
            type = P.IdentityElements.TileLayout;
            options = {
                className: "ic-favorite",
                size: 140,
                useInnerHighlight: true,
                primaryContent: { element: P.IdentityElements.Name, className: "ic-favoriteName" },
                tilePriority: P.Priority.userTileRender
            };
        }

        var factory = new P.IdentityControlNodeFactory(
            type,
            options,
            {
                getLabel: function (dataObject, label) {
                    return label + "\n" + Jx.res.getString("/strings/abFavoritesGroupingHeader");
                }
            }
        );

        var addFavoritesClickedCallback = new P.Callback(this.addFavoritesButtonClicked, this);

        return {
            favoritesGrouping: new P.Callback(function () { return new P.FavoritesHeader(); }),
            person: new P.Callback(factory.create, factory),
            addFavoritesButton: new P.Callback(function () { return new P.AddFavoritesButton(addFavoritesClickedCallback); })
        };
    };

    P.FavoriteContactsSection.prototype.addFavoritesButtonClicked = function () {
        var picker = new WAC.ContactPicker();
        picker.commitButtonText = Jx.res.getString("/strings/abAddFavoritesPeoplePickerText");;
        picker.selectionMode = WAC.ContactSelectionMode.contacts;
        var that = this;
        picker.pickContactsAsync().then(function (newFavorites) {
            for (var i = 0; i < newFavorites.size; i++) {
                var id = newFavorites[i].id;
                var person = that._platformCache.getPlatform().peopleManager.tryLoadPerson(id);
                if (!person.isFavorite) {
                    person.insertFavorite(Microsoft.WindowsLive.Platform.FavoriteInsertPosition.insertLast, null);
                    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                    Jx.bici.addToStream(InstruID.People.socialReactionUpdated, "", P.Bici.landingPage, 0, P.Bici.ReactionType.favorite);
                    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                }
            }
            P.AppTile.pushTiles(that._platformCache.getPlatform());
        }, function (error) {
            Debug.log("Error picking contacts to add to favorites: " + error);
        });
    };

    P.FavoriteContactsSection.prototype.appendSemanticZoomCollection = function (/* @dynamic*/collection) {
        Debug.assert(this._collection.length === 2);

        var favoritesCollection = new P.ArrayCollection("FavoritesSection");
        favoritesCollection.appendItem({
            type: "zoomedOutFavoritesHeader",
            data: this._collection.getItem(0),
            collection: null
        });
        favoritesCollection.loadComplete();
        collection.appendItem({
            collection: favoritesCollection
        });
    };

    P.FavoriteContactsSection.prototype.shutdownComponent = function () {
        P.ContactGridSection.prototype.shutdownComponent.call(this);
        this._isActive = false;

        if (this._accountSync) {
            this._accountSync.dispose();
        }

        if (this._whatsNew) {
            this._whatsNew.deactivateUI();
        }
    };

});
