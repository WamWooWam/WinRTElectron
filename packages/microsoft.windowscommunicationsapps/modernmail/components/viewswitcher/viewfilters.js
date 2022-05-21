
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "ViewFilters", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        MailViewType = Plat.MailViewType;

    var topLevelItems = [
        { objectType: "MailView", viewType: MailViewType.inbox },
        { objectType: "MailView", viewType: MailViewType.newsletter },
        { objectType: "MailView", viewType: MailViewType.social },
        { objectType: "FoldersIcon" },
        { objectType: "MailView", viewType: MailViewType.allPinnedPeople },
        { objectType: "MailView", viewType: MailViewType.flagged },
    ];

    var ViewFilters = Mail.ViewFilters = {

        // Views shown at the top level of the nav pane
        topLevel: topLevelItems.filter(function (item) {
            return item.objectType === "MailView";
        }).map(function (item) {
            return item.viewType;
        }),

        // People-based views
        people: [
            MailViewType.allPinnedPeople,
            MailViewType.person
        ],

        // Category-based views
        categories: [
            MailViewType.newsletter,
            MailViewType.social
        ],

        // Folder-based views
        folders: [
            MailViewType.inbox,
            MailViewType.draft,
            MailViewType.sentItems,
            MailViewType.outbox,
            MailViewType.junkMail,
            MailViewType.deletedItems,
            MailViewType.userGeneratedFolder
        ],

        filterByType: function (collection, includedTypes, excludedTypes) {
            return new Mail.FilteredCollection(new FilterByType(includedTypes, excludedTypes), collection);
        },

        filterPinned: function (collection) {
            return new Mail.FilteredCollection(new FilterPinned(), collection);
        },

        filterEnabled: function (collection) {
            return new Mail.FilteredCollection(new FilterEnabled(), collection);
        },

        topLevelSort: function (collection) {
            return new Mail.SortedCollection(new TopLevelSort(), collection);
        },

        sortFolders: function (collection) {
            return new Mail.SortedCollection(new SortFolders(), collection);
        },

        sortPeople: function (collection, platform) {
            return new Mail.SortedCollection(new SortPeople(platform), collection);
        },

    };

    function FilterByType(includedTypes, excludedTypes) {
        Debug.assert(Jx.isArray(includedTypes));
        Debug.assert(Jx.isNullOrUndefined(excludedTypes) || Jx.isArray(excludedTypes));
        this._includedTypes = includedTypes;
        this._excludedTypes = excludedTypes;
        Debug.only(Object.seal(this));
    }
    FilterByType.prototype = {
        matches: function (item) {
            var result = false;
            if (item) {
                var type = item.type;
                var excludedTypes = this._excludedTypes;
                result = (this._includedTypes.indexOf(type) !== -1) &&
                         (!excludedTypes || excludedTypes.indexOf(type) === -1);
            }
            return result;
        },
        setCallback: Jx.fnEmpty,
        hook: Jx.fnEmpty,
        unhook: Jx.fnEmpty
    };

    function getTopLevelIndex(item) {
        var objectType = item.objectType;
        var viewType = item.type;
        for (var i = 0, len = topLevelItems.length; i < len; ++i) {
            var topLevelItem = topLevelItems[i];
            if (objectType === topLevelItem.objectType && (objectType !== "MailView" || viewType === topLevelItem.viewType)) {
                return i;
            }
        }
    }
    function TopLevelSort() {
        Debug.only(Object.seal(this));
    }
    TopLevelSort.prototype = {
        compare: function (itemA, itemB) {
            return getTopLevelIndex(itemA) - getTopLevelIndex(itemB);
        },
        setCallback: Jx.fnEmpty,
        hook: Jx.fnEmpty,
        unhook: Jx.fnEmpty
    };


    function LiveFilter(properties) {
        this._callback = null;
        this._context = null;
        this._properties = properties;
        Debug.only(Object.seal(this));
    }
    LiveFilter.prototype = {
        setCallback: function (callback, context) {
            this._callback = callback;
            this._context = context;
        },
        hook: function (item) {
            item.addListener("changed", this._changed, this);
        },
        unhook: function (item) {
            item.removeListener("changed", this._changed, this);
        },
        _changed: function (ev) {
            if (Mail.Validators.havePropertiesChanged(ev, this._properties)) {
                this._callback.call(this._context, ev.target);
            }
        }
    };

    function FilterPinned() {
        LiveFilter.call(this, [ "isPinnedToNavPane", "canChangePinState" ]);
    }
    Jx.inherit(FilterPinned, LiveFilter);
    FilterPinned.prototype.matches = function (item) {
        return item.isPinnedToNavPane && item.canChangePinState;
    };

    function FilterEnabled() {
        LiveFilter.call(this, [ "isEnabled" ]);
    }
    Jx.inherit(FilterEnabled, LiveFilter);
    FilterEnabled.prototype.matches = function (item) {
        return item.isEnabled;
    };

    var folders = ViewFilters.folders;
    function SortFolders() {
        LiveFilter.call(this, [ "type", "name" ]);
    }
    Jx.inherit(SortFolders, LiveFilter);
    SortFolders.prototype.compare = function (itemA, itemB) {
        return (folders.indexOf(itemA.type) - folders.indexOf(itemB.type)) ||
                itemA.name.localeCompare(itemB.name);
    };

    function SortPeople(platform) {
        this._lastFirst = platform.peopleManager.nameSortOrder;
        LiveFilter.call(this, [ "sortName" ]);
    }
    Jx.inherit(SortPeople, LiveFilter);

    SortPeople.prototype.compare = function (itemA, itemB) {
        var lastFirst = this._lastFirst;
        var aName = itemA.getSortName(lastFirst);
        var bName = itemB.getSortName(lastFirst);
        return aName.localeCompare(bName);
    };

});

