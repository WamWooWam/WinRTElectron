
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../Controls/Collections/AddressBookCollections.js"/>
/// <reference path="ContactGridSection.js"/>
/// <reference path="ContactGridHeaders.js"/>
/// <reference path="HeaderKeyboardJump.js"/>

Jx.delayDefine(People, "AllContactsSection", function () {

    var P = window.People;

    P.AllContactsSection = /* @constructor*/function (platformCache, keyboardListenerElement, appBar, alphabetIndex) {
        ///<summary>The All section provides an A-Z list of contacts</summary>
        ///<param name="platformCache" type="P.PlatformCache"/>
        ///<param name="keyboardListenerElement" type="HTMLElement"/>
        ///<param name="appBar" type="P.CpAppBar"/>
        this._platformCache = platformCache;
        this._filterOnline = false;
        P.ContactGridSection.call(this, "allSection", this._getTitle(), platformCache.getPlatform().peopleManager);
        this._appBar = appBar;
        this._allContacts = /*@static_cast(AllContactsCollection)*/null;
        this._totalCounter = /*@static_cast(P.TotalCounter)*/null;
        this._keyboardListenerElement = keyboardListenerElement;
        this._keyboardJump = /*@static_cast(P.HeaderKeyboardJump)*/null;
        this._alphabetIndex = alphabetIndex;
    };
    Jx.inherit(P.AllContactsSection, P.ContactGridSection);
    var base = P.ContactGridSection.prototype;
    P.AllContactsSection.prototype.shutdownComponent = function () {
        var allContacts = this._allContacts;
        if (allContacts) {
            allContacts.removeListener("queriesChanged", this._queriesChanged, this);
        }   
        Jx.dispose(this._totalCounter);
        Jx.dispose(this._keyboardJump);
        base.shutdownComponent.apply(this, arguments);
        if (this._immediateHandle) {
            clearImmediate(this._immediateHandle);
        }
    };

    P.AllContactsSection.prototype.onPrepareSaveBackState = function () {
        // Save the scroll position for it to be used later during a back navigation
        // the user might have moved away from the original location which we jumped to when coming from the Alphabet Control
        P.Nav.setPageLastScrollPosition("AllContactsScrollPosition", this.getScrollPosition());
    };

    P.AllContactsSection.prototype.activateUI = function () {
        P.ContactGridSection.prototype.activateUI.call(this);
    };

    P.AllContactsSection.prototype._scrollToAlphabetHeader = function () {
        // Check if there is a previous scroll position saved by the page 
        // if there then we need to go there if not then use the alphabetIndex to calculate the new position
        var newScrollPosition = P.Nav.getPageLastScrollPosition("AllContactsScrollPosition");
        if (!newScrollPosition) {
            var headerGridIndex = this._grid._groupGridIndices[this._alphabetIndex];
            var position = this._grid._layout.getPositionFromGridIndex(headerGridIndex);
            newScrollPosition = position.scrollPos - this._gridScrollableOffset;
        }
        this.setScrollPosition(newScrollPosition);
    };

    P.AllContactsSection.prototype.extentReady = function (section) {
        var button = this._placeholder.querySelector("#btnClearFilter");
        button.addEventListener("click", this._toggleOnlineFilter.bind(this), false);

        this._totalCounter = new P.TotalCounter(this._collection, this);
        this.totalCountChanged(this._totalCounter.count);

        base.extentReady.apply(this, arguments);

        // During first load let the grid finish loading before scrolling to the right position
        var that = this;
        this._immediateHandle = setImmediate(function () { that._scrollToAlphabetHeader(); });
    };

    P.AllContactsSection.prototype.hydratePosition = function (data) {
        this._scrollToAlphabetHeader();
    };

    P.AllContactsSection.prototype._toggleOnlineFilter = function () {
        ///<summary>Walk each of the groupings to update the filter state of the existing queries</summary>
        var filterOnline = !this._filterOnline;
        this._allContacts.setFilterOnline(filterOnline);

        // Make sure we are showing the correct placeholder
        Jx.setClass(this._placeholder, "filterOnline", filterOnline);

        // Update the setting and command bar
        Jx.appData.localSettings().container("People").set("abFilterOnline", filterOnline);
        this._appBar.updateCommand({ commandId: "onlineFilter", selected: filterOnline,
            tooltip: filterOnline ? "/strings/abOnlineFilterEnabledTooltip" : "/strings/abOnlineFilterDisabledTooltip"
        });

        this._filterOnline = filterOnline;
        this.setTitle(this._getTitle());
    };
    P.AllContactsSection.prototype._getTitle = function () { 
        /// <summary>Gets the title for this section based on the filter state</summary>
        /// <returns type="String">A resource id</returns>
        return this._filterOnline ? "/strings/abAllSectionTitleOnline" : "/strings/abAllSectionTitle";
    };
    P.AllContactsSection.prototype.totalCountChanged = function (count) {
        ///<summary>When filtering we may need to show/hide the placeholder text if all groupings are empty</summary>
        var formerlyHidden = Jx.hasClass(this._contentElement, "zeroContacts");
        Jx.setClass(this._contentElement, "zeroContacts", count === 0);
        if (count > 0 && formerlyHidden) {
            this._grid.onResize();
        }
    };
    P.AllContactsSection.prototype.hide = function () {
        ///<summary>Prevent the contact grid section from hiding us when the grid is empty. Instead we need to display
        ///the placehloder text.</summary>
    };
    P.AllContactsSection.prototype._getPlaceholderUI = function () {
        return  "<div class='barricade' >" +
                    "<div class='unfilteredBarricade' >" + Jx.res.getString("/strings/abEmptyTitle") + "</div>" +
                    "<div class='onlineFilterBarricade' >" +
                        "<div>" + Jx.res.getString("/strings/abOnlineFilterEmptyTitle") + "</div>" +
                        "<button id='btnClearFilter' type='button'>" + Jx.res.getString("/strings/abOnlineFilterEmptyMessage") + "</button>" +
                    "</div>" +
                "</div>";
    };
    P.AllContactsSection.prototype._getCollection = function () {
        /// <returns type="P.Collection">The collection used to populate the All view</returns>
        var allContacts = this._allContacts = /*@static_cast(AllContactsCollection)*/this._platformCache.getCollection(this.name, /*@bind(P.AllContactsSection)*/function (platform, jobSet) {
            return new AllContactsCollection(platform, jobSet, this._filterOnline); 
        }, this);
        allContacts.setFilterOnline(this._filterOnline);
        allContacts.addListener("queriesChanged", this._queriesChanged, this);
        return allContacts.getCollection();
    };
    P.AllContactsSection.prototype._getFactories = function () {
        ///<returns type="Object">The map of factories that will be used to populate the All view</returns>
        var factory = new P.IdentityControlNodeFactory(
            P.IdentityElements.BillboardLayout,
            { // element options
                className: "ic-listItem ic-hoverListItem",
                fontSize: (this.getOrientation() === P.Orientation.horizontal) ? "medium" : "normal",
                tilePriority: P.Priority.userTileRender
            }
        );

        return {
            person: new P.Callback(factory.create, factory),
            nameGrouping: new P.Callback(function () { return new P.AlphabeticHeader(); }),
            otherGrouping: new P.Callback(function () { return new P.OtherHeader(); })
        };
    };
    P.AllContactsSection.prototype._queriesChanged = function () {
        this._grid.resetAnimationTimeout();
    };
    P.AllContactsSection.prototype.appendSemanticZoomCollection = function (collection) {
        ///<param name="collection" type="P.ArrayCollection"/>
        var allCollection = new P.ArrayCollection("AllSection");
        for (var i = 0; i < this._collection.length; i++) {
            var item = this._collection.getItem(i);
            allCollection.appendItem({
                type: "zoomedOutAlphabeticHeader",
                data: item,
                collection: null
            });
        }
        allCollection.loadComplete();
        collection.appendItem({
            collection: allCollection
        });
    };


    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var AllContactsCollection = P.AllContactsCollection = /*@constructor*/function (platform, jobSet, filterOnline) {
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        /// <param name="jobSet" type="P.JobSet"/>
        /// <param name="filterOnline" type="Boolean"/>
        this._platform = platform;
        this._jobSet = jobSet;
        this._filterOnline = filterOnline;
        this._getQuery = getQuery.bind(this);

        var groupings = this._groupings = new P.ArrayCollection("alphabet");
        P.AddressBookCollections.appendAlphabeticCollection(platform.peopleManager, groupings, this._getQuery);
        groupings.loadComplete();
        
        Jx.EventManager.addListener(Jx.root, "personSortChanged", this._sortChanged, this);
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>
    Jx.augment(AllContactsCollection, Jx.Events);
    Debug.Events.define(AllContactsCollection.prototype, "queriesChanged");
    AllContactsCollection.prototype.dispose = function () {
        Jx.EventManager.removeListener(Jx.root, "personSortChanged", this._sortChanged, this);
        this._groupings.dispose();
        this._groupings = null;
    };
    AllContactsCollection.prototype.hydrate = function (data) {
        this._groupings.hydrate(data);
    };
    AllContactsCollection.prototype.dehydrate = function () {
        return this._groupings.dehydrate();
    };
    AllContactsCollection.prototype.getCollection = function () {
        return this._groupings;
    };
    AllContactsCollection.prototype.setFilterOnline = function (filterOnline) {
        if (this._filterOnline !== filterOnline) {
            this._filterOnline = filterOnline;
            this._requery();
        }
    };
    AllContactsCollection.prototype._sortChanged = function () {
        this._requery();
    };
    AllContactsCollection.prototype._requery = function () {
        P.AddressBookCollections.replaceAlphabeticCollection(this._platform.peopleManager, this._groupings, this._getQuery, this._jobSet)
        .done(/*@bind(AllContactsCollection)*/function () {
            this.raiseEvent("queriesChanged");
        }.bind(this));
    };
    /*@bind(AllContactsCollection)*/function getQuery(peopleManager, start, end) {
        /// <param name="peopleManager" type="Microsoft.WindowsLive.Platform.PeopleManager"/>
        /// <param name="start" type="String"/>
        /// <param name="end" type="String"/>
        var OnlineStatusFilter = Microsoft.WindowsLive.Platform.OnlineStatusFilter;
        var filterOnline = this._filterOnline ? OnlineStatusFilter.notOffline : OnlineStatusFilter.all;
        return new P.Callback(peopleManager.getPeopleNameBetween, peopleManager, [filterOnline, start, true, end, false]);
    };
});
