
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="ContactGridSection.js"/>
/// <reference path="../Controls/Collections/IndexedSearchCollection.js"/>
/// <reference path="../Controls/Collections/GALSearchCollection.js"/>
/// <reference path="../../AppFrame/Header.js"/>
/// <reference path="../../Shared/Platform/PlatformObjectBinder.ref.js"/>
/// <reference path="../../Shared/ContactForm/ContactForm.js"/>
/// <reference path="../../Shared/IdentityControl/IdentityControl.ref.js"/>

Jx.delayDefine(People, ["Highlighter", "SearchResultsSection"], function () {
    
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var E = P.IdentityElements;
    var Plat = Microsoft.WindowsLive.Platform;

    P.SearchResultsSection = /* @constructor*/function (platform, query, data, header, isGAL) {
        ///<summary>Creates the results section</summary>
        ///<param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager">The object to execute the search against</param>
        ///<param name="query" type="String">The search query</param>
        ///<param name="locale" type="String"/>
        ///<param name="header" type="P.CpHeader"/>
        P.ContactGridSection.call(this, "searchSection", null, platform.peopleManager);
        this._query = query;
        this._data = data; // If this is an All Contacts search then _data is a locale, if this is a GAL search then _data is an accountEmail
        this._header = header;
        this._platform = platform;
        this._isGAL = isGAL;
        this._searching = false;
    };
    Jx.inherit(P.SearchResultsSection, P.ContactGridSection);
    var base = P.ContactGridSection.prototype;

    P.SearchResultsSection.prototype.hydrateExtent = function (data) {
        ///<summary>Hydrate the previous query string if not given a new one</summary>
        ///<param name="data" type="Object">The last value returned from dehydrate</param>
        if (!Jx.isNonEmptyString(this._query)) {
            this._query = P.Hydration.get(data, "query", "");
            this._data = P.Hydration.get(data, "data", "");
            this._isGAL = P.Hydration.get(data, "isGAL", false);
        }

        base.hydrateExtent.call(this, data);
    };

    P.SearchResultsSection.prototype.dehydrate = function (shouldDehydratePosition) {
        ///<summary>Dehydrates data for use in subsequent hydration calls</summary>
        ///<param name="shouldDehydratePosition" type="Boolean"/>
        ///<returns type="Object">Data to be passed to future hydrate calls</returns>
        var data = base.dehydrate.call(this, shouldDehydratePosition);
        P.Hydration.set(data, "query", this._query);
        P.Hydration.set(data, "data", this._data);
        P.Hydration.set(data, "isGAL", this._isGAL);
        return data;
    };

    P.SearchResultsSection.prototype.shutdownComponent = function () {
        if (this._searching) {
            People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
        }
        Jx.dispose(this._collection);
        base.shutdownComponent.call(this);
    };

    P.SearchResultsSection.prototype._getSearchResultsCollection = function () {
        ///<summary>Get a collection representing the result set for the current search query</summary>
        ///<returns type="P.Collection">The collection used to populate the search results in the view</returns>
        var mgr = this._peopleManager;

        var results;
        if (this._isGAL) {
            results = new P.GALSearchCollection(this._platform, this._query, this._data);
        } else {
            results = new P.IndexedSearchCollection(this._peopleManager, this._query, this._data);
        }

        if (this._header) {
            if (!this._isGAL) {
                results.addListener("load", this._updateHeader, this);
            } else {
                results.addListener("updateHeader", this._updateHeader, this);
            }
        }

        var collection = new P.ArrayCollection("search:" + this._query);
        collection.appendItem({ collection: results });

        return collection;
    }

    P.SearchResultsSection.prototype._getGALCollection = function () {
        ///<summary>If there are any GAL connected accounts then get a collection with a link representation for each GAL 
        ///account which will be used to search against</summary>
        ///<returns type="P.Collection">The collection used to populate GAL search links in the view</returns>
        var collection = null;
        var accounts = this._platform.accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.peopleSearch,
                                                                                    Plat.ConnectedFilter.normal,
                                                                                    Plat.AccountSort.name);
        if (accounts.count > 0) {
            var GALArray = [];
            for (var i = 0; i < accounts.count; i++) {
                GALArray[i] = { data: { title: "GAL Search", text: accounts.item(i).displayName, account: accounts.item(i) }, type: "GALSearchButton" };
            }

            collection = new P.StaticCollection(GALArray, "GALSearchButtons");
            collection.loadComplete();
        }

        return collection;
    }

    P.SearchResultsSection.prototype._getCollection = function () {
        ///<returns type="P.Collection">The collection used to populate the search view</returns>
        var collection = this._getSearchResultsCollection();

        if (!this._isGAL) {
            var GALCollection = this._getGALCollection();
            if (GALCollection != null) {
                collection.appendItem({
                    header: null,
                    collection: GALCollection
                });
            }
        }
        collection.loadComplete();

        return collection;
    };

    P.SearchResultsSection.prototype._getFactories = function () {
        ///<returns type="Object">The factory that will be used to populate results</returns>
        var factory = new P.IdentityControlNodeFactory(
            E.BillboardLayout,
            { // element options
                className: "ic-listItem ic-hoverListItem",
                fontSize: (this.getOrientation() === P.Orientation.horizontal) ? "medium" : "normal",
                primaryContent: { element: Highlighter, query: this._query, primary: true },
                secondaryContent: { element: Highlighter, query: this._query, primary: false },
                tilePriority: P.Priority.userTileRender
            }
        );
        
        var addGALButtonClickedCallback = new P.Callback(this.addGALButtonClicked, this);

        return {
            person: new P.Callback(factory.create, factory),
            GALSearchButton: new P.Callback(function () { return new P.GALSearchButton(addGALButtonClickedCallback); })
        };
            
    };

    P.SearchResultsSection.prototype.addGALButtonClicked = function (dataContext) {
        var uri = People.Nav.getGALSearchUri(this._query, dataContext.account.emailAddress);
        People.Nav.navigate(uri);
    };

    P.SearchResultsSection.prototype._updateHeader = function (/*@dynamic*/ev) {
        ///<summary>Update the secondary title</summary>
        ///<param name="ev" type="Event">Contains the corresponding collection and other supplemental information
        ///needed to update the secondary title</param>
        var title = "";
        if (this._isGAL) {
            if (ev.error) {
                title = Jx.res.getString("/strings/galSearchServerError");
                if (this._searching) {
                    People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
                    this._searching = false;
                }
            } else if (ev.searching) {
                People.RecentActivity.UI.Core.GlobalProgressControl.add(this);
                this._searching = true;
            } else {
                var count = ev.target.totalCount;
                title = Jx.res.loadCompoundString(count > 0 ? "/strings/searchResultTitle" : "/strings/searchResultEmptyTitle", this._query, count);
                if (this._searching) {
                    People.RecentActivity.UI.Core.GlobalProgressControl.remove(this);
                    this._searching = false;
                }
            }
        } else {
            var count = ev.target.totalCount;
            title = Jx.res.loadCompoundString(count > 0 ? "/strings/searchResultTitle" : "/strings/searchResultEmptyTitle", this._query, count);
        }

        if (this._header) {
            this._header.updateSecondaryTitle(title);
        }
    };

    var Highlighter = P.Highlighter = /*@constructor*/function () {
        ///<summary>Custom IC element that will highlight the matched text, e.g. email or name</summary>
        this._query = "";
        this._primary = "";
    };
    Jx.inherit(Highlighter, E.BaseElement);

    Highlighter.prototype.clone = function (host) {
        ///<summary>Implement clone so the query and primary members aren't lost since those are set during getUI</summary>
        ///<param name="host" type="IdentityControlElementHost"/>
        var cloned = new Highlighter();
        cloned._query = this._query;
        cloned._primary = this._primary;
        return cloned;
    };

    Highlighter.prototype.getUI = function (host, locator, /*@dynamic*/options) {
        ///<summary>The UI is three spans with the middle containing the highlighted portion</summary>
        ///<param name="host" type="IdentityControlElementHost"/>
        ///<param name="locator" type="String"/>
        this._query = options.query;
        this._primary = options.primary;
        return E.makeElement("span", locator, "ic-name", options,
            "<span></span>" +
            "<span class='ic-searchHighlight'></span>" +
            "<span></span>"
        );
    };

    Highlighter.prototype.activateUI = function (host, node) {
        ///<summary>Store off the elements</summary>
        ///<param name="host" type="IdentityControlElementHost"/>
        ///<param name="node" type="HTMLElement"/>
        var children = node.children;
        this._prefix = children[0];
        this._highlight = children[1];
        this._suffix = children[2];
        host.bind(this._update, this, P.Priority.synchronous);
    };

    Highlighter.prototype._update = function (person) {
        ///<summary>Applies the highlight after splitting the data</summary>
        ///<param name="person" type="People.PersonAccessor"/>
        var parts = this._split(person);
        var data = this._primary ? parts.primary : parts.secondary;

        this._prefix.innerText = data.prefix;
        this._highlight.innerText = data.highlight;
        this._suffix.innerText = data.suffix;
    };

    Highlighter.prototype._split = function (person) {
        ///<summary>Determines which property on the person caused it match the search query. The value of the property is then
        ///split on the query string to determine the highlighted portion and is returned along with the unmatcing prefix and
        ///suffix. The highlighted string goes into primary content area of the IC if it was the name, otherwise the highlight
        ///is in secondary content with the name in primary.</summary>
        ///<param name="person" type="People.PersonAccessor"/>
        var query = this._query;
        var len = query.length;
        var uiName = person.calculatedUIName;
        var first = person.firstName;
        var last = person.lastName;

        var parts = {
            primary: { prefix: uiName, highlight: "", suffix: "" },
            secondary: { prefix: "", highlight: "", suffix: "" }
        };
        var match = parts.primary;

        var prefix, highlight, suffix;
        if (prefixCompare(uiName, query)) {
            // Matched the calculated name
            highlight = uiName.substr(0, len);
            suffix = uiName.substr(len);
        } else if (prefixCompare(last, query)) {
            // Matched the last name
            highlight = last.substr(0, len);
            suffix = last.substr(len);

            // It's possible that the last name isn't a substring of the calculated name, e.g. nickname. When that's
            // the case the last name match is displayed as secondary content.
            if (prefixCompare(uiName.substr(-last.length), last)) {
                prefix = uiName.substr(0, uiName.length - last.length);
            } else {
                match = parts.secondary;
            }
        } else if (prefixCompare(first, query)) {
            // Matched the first name
            highlight = first.substr(0, len);
            suffix = first.substr(len);

            // Like last name, it's possible that the first name isn't a substring of calculated name. If so, we only need to
            // check that the calculated name ends with first to cover the last, first case. Normal first-last would already have
            // have matched our initial check against calculated name.
            if (prefixCompare(uiName.substr(-first.length), first)) {
                prefix = uiName.substr(0, uiName.length - first.length);
            } else {
                match = parts.secondary;
            }
        } else {
            match = parts.secondary;

            // The only other field we match on is email so check for a match on that
            var fields = P.Contact.createUniqueFields(person.linkedContacts, "email");
            var email = "";
            for (var i = 0; i < fields.length && !email; i++) {
                var fieldValue = fields[i].fieldValue;
                if (prefixCompare(fieldValue, query)) {
                    email = fieldValue;
                }
            }

            if (Jx.isNonEmptyString(email)) {
                highlight = email.substr(0, len);
                suffix = email.substr(len);
            } else {
                Jx.log.warning("Highlighter didn't find a match for " + name);
            }
        }

        match.prefix = prefix || "";
        match.highlight = highlight || "";
        match.suffix = suffix || "";
        return parts;
    };

    function prefixCompare(str, prefix) {
        ///<param name="str" type="String"/>
        ///<param name="prefix" type="String"/>
        return str.toLocaleUpperCase().substr(0, prefix.length).localeCompare(prefix.toLocaleUpperCase()) === 0;
    };

});

