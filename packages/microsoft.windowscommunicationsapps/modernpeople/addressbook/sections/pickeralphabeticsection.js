
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="Windows.ApplicationModel.Contacts.js" />
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/IdentityControl/IdentityControl.js" />
/// <reference path="../Controls/Collections/AddressBookCollections.js"/>
/// <reference path="ContactGridSection.js"/>
/// <reference path="HeaderKeyboardJump.js"/>

Jx.delayDefine(People, "PickerAlphabeticSection", function () {
    
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = Windows.ApplicationModel.Contacts;
    var Plat = Microsoft.WindowsLive.Platform;
    var PickerFilter = Plat.PeoplePickerFilter;
    var CustomFields = P.PeopleProvider.CustomDesiredFields;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.PickerAlphabeticSection = /* @constructor*/function (platform, personClickedHandler, selectionManager, basket, keyboardListenerElement, filterToggle) {
        ///<summary>The A-Z list of contacts, with prepended Favorites, for the WL People Picker</summary>
        ///<param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        ///<param name="personClickedHandler" type="Function"/>
        ///<param name="selectionManager" type="SelectionManager"/>
        ///<param name="basket" type="Windows.ApplicationModel.Contacts.Provider.ContactPicker"/>
        P.ContactGridSection.call(this, "pickerAlphabeticSection", null, platform.peopleManager);
        this._platform = platform;
        this._personClickedHandler = personClickedHandler;
        this._selectionManager = selectionManager;
        this._desiredFields = this._resolveDesiredFields(basket);
        this._selectionMode = basket.selectionMode;
        this._totalCounter = null;
        this._showFavorites = !this._isDesiredFieldSet(CustomFields.link);
        this._filterToggle = filterToggle;
        this._filterOnline = filterToggle ? Jx.appData.localSettings().container("People").get("ppFilterOnline") : false;
        this._keyboardListenerElement = keyboardListenerElement;
        this._keyboardJump = /*@static_cast(P.HeaderKeyboardJump)*/null;
        this._pickerFilter = null;

        this._mapKnownFieldToSecondaryContentType =
                  [{ knownField: C.KnownContactField.email, contactType: P.PeopleProvider.SupportedPropertyType.email },
                   { knownField: C.KnownContactField.phoneNumber, contactType: P.PeopleProvider.SupportedPropertyType.phone },
                   { knownField: C.KnownContactField.location, contactType: P.PeopleProvider.SupportedPropertyType.location}].reduce(function (map, /*@dynamic*/pair) {
                       map[pair.knownField] = pair.contactType;
                       return map;
                   }, {});
    };
    Jx.inherit(P.PickerAlphabeticSection, P.ContactGridSection);
    var base = P.ContactGridSection.prototype;

    P.PickerAlphabeticSection.prototype._resolveDesiredFields = function (basket) {
        Jx.mark("People.PickerAlphabeticSection._resolveDesiredFields,StartTA,People,PickerAlphabeticSection")
        var desiredFields = [];
        // these are the original desired fields values. they are converted from the blue call to the windows 8 collection 
        // during the picker launch we have to remap the array because the basket.desiredFields is a windows collection 
        // and we just need a simple string array so we can add the overloaded values from the blue collection.
        for (var i = 0; i < basket.desiredFields.length; i++) {
            desiredFields.push(basket.desiredFields[i]);
        }

        // here we are looking for the overloaded customization.
        for (var i = 0; i < basket.desiredFieldsWithContactFieldType.length; i++) {
            // if custom is found in the Blue collection we want to indicate that we want network attribution and hide favorites. 
            // this will be the same behaviour as the Windows.Live.Link mail activation as Windows 8.  The custom contact field 
            // type is deprecated for Blue but will not break compile
            if (basket.desiredFieldsWithContactFieldType[i] == Windows.ApplicationModel.Contacts.ContactFieldType.custom) {
                // we use the same legacy string so that regression is kept to a min.
                desiredFields.push(CustomFields.link);
            }
        }
        
        Jx.mark("People.PickerAlphabeticSection._resolveDesiredFields,StopTA,People,PickerAlphabeticSection")
        return desiredFields;
    }

    P.PickerAlphabeticSection.prototype.activateUI = function () {
        base.activateUI.apply(this, arguments);
        var filterToggle = this._filterToggle;
        if (this._filterToggle) {
            filterToggle.selectTab(this._filterOnline ? "Online" : "All");
            filterToggle.addListener("selectionChanged", this._toggleOnlineFilter, this);
            filterToggle.show();
        }
    };

    P.PickerAlphabeticSection.prototype.deactivateUI = function () {
        if (this._filterToggle) {
            this._filterToggle.removeListener("selectionChanged", this._toggleOnlineFilter, this);
        }
        base.deactivateUI.apply(this, arguments);
    };

    P.PickerAlphabeticSection.prototype.extentReady = function (section) {
        ///<summary>Called when the content has determined its initial size from hydration or querying the database</summary>
        ///<param name="section" type="P.Section">Passthrough to base class</param>
        this._totalCounter = new P.TotalCounter(this._collection, this);
        Jx.setClass(this._sectionElement, "zeroContacts", this._totalCounter.count === 0);
        this._keyboardJump = new P.HeaderKeyboardJump(this._keyboardListenerElement, this._grid, this._collection);
        base.extentReady.apply(this, arguments);
    };
    P.PickerAlphabeticSection.prototype.hide = function () {
        ///<summary>Override hide and instead show the placeholder text</summary>
        var placeholder = this._placeholder,
            title = placeholder.firstElementChild,
            button = title.nextElementSibling,
            filterToggle = this._filterToggle;
        if (this._collection.length === 0 || !this._filterOnline) {
            // Nothing matched the desired fields, so show a no contacts error message
            if (this._desiredFields[0] === P.PeopleProvider.CustomDesiredFields.chat) {
                //Chat is special and does not tell you to go to "People" so it doesn't use a compound string 
                title.innerText = Jx.res.getString("/strings/ppNoContactsChat");
            } else {
                //Create a mapping of scenarios to error messages
                var errorMap = {};
                errorMap[C.KnownContactField.email] = "/strings/ppNoContactsEmail";
                errorMap[C.KnownContactField.phoneNumber] = "/strings/ppNoContactsPhone";
                errorMap[C.KnownContactField.location] = "/strings/ppNoContactsLocation";
                var errorString = errorMap[this._desiredFields[0]];
                if (!Jx.isNonEmptyString(errorString)) {
                    //Use generic error
                    errorString = "/strings/ppNoContacts";
                }
                title.innerText = Jx.res.getString(errorString);
            }
            button.style.display = "none";
        } else {
            // Filtered away all the contacts
            title.innerText = Jx.res.getString("/strings/abOnlineFilterEmptyTitle");
            button.style.display = "";
            button.addEventListener("click", function onClick () {
                button.removeEventListener("click", onClick, false);
                filterToggle.selectTab("All");
            }, false);
        }
        placeholder.style.display = "";
    };
    P.PickerAlphabeticSection.prototype._getPlaceholderUI = function () {
        /// <summary>Barricade page for when there are no picker contacts</summary>
        return  "<div class='pp-noContacts' style='display:none'>" +
                    "<div></div>" +
                    "<button id='btnClearFilter'>" + Jx.res.getString("/strings/abOnlineFilterEmptyMessage") + "</button>" +
                "</div>";
    };
    P.PickerAlphabeticSection.prototype.totalCountChanged = function (count) {
        Jx.setClass(this._sectionElement, "zeroContacts", count === 0);
        if (count > 0 && this._placeholder.style.display === "") {
            if (this._filterToggle) {
                this._filterToggle.show();
            }
            this._placeholder.style.display = "none";
        }
    };
    P.PickerAlphabeticSection.prototype.shutdownComponent = function () {
        Jx.dispose(this._collection);
        Jx.dispose(this._totalCounter);
        Jx.dispose(this._keyboardJump);
        base.shutdownComponent.call(this);
    };

    P.PickerAlphabeticSection.prototype._toggleOnlineFilter = function (id) {
        var filterOnline = (id === "Online");
        if (filterOnline !== this._filterOnline) {
            var pickerFilter = this._pickerFilter;
            var collection = this._collection;
            var peopleMgr = this._platform.peopleManager;
            var jobSet = this.getJobSet();

            if (this._showFavorites && collection.length > 0) {
                var favorites = collection.getItem(0);
                var favCollection = /* @static_cast(P.Collection)*/favorites.collection;
                Debug.assert(favorites.header.type === "favoritesGrouping");
                favCollection.replace(new P.Callback(
                    peopleMgr.getPeopleByPickerQuery,
                    peopleMgr,
                    [pickerFilter, Plat.FavoritesFilter.favorites, filterOnline, "", true, "", false]),
                    jobSet);
            }
            var grid = this._grid;
            P.AddressBookCollections.replaceAlphabeticCollection(peopleMgr, collection, function (peopleManager, start, end) {
                /// <param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager"/>
                return new P.Callback(
                    peopleManager.getPeopleByPickerQuery,
                    peopleManager,
                    [pickerFilter, Plat.FavoritesFilter.all, filterOnline, start, true, end, false]);
            }, jobSet).done(function () { grid.resetAnimationTimeout(); });

            // Update the setting and command bar
            Jx.appData.localSettings().container("People").set("ppFilterOnline", filterOnline);
            this._filterOnline = filterOnline;
        }
    };
    P.PickerAlphabeticSection.prototype._getCollection = function () {
        ///<returns type="P.Collection">The collection used to populate the All view</returns>
        // build the filter from our list of desired fields;
        var collection = this._collection = new P.ArrayCollection("picker");
        var pickerFilter = this._pickerFilter = /*@static_cast(Number)*/this._desiredFields.reduce(function (filter, desiredField) {
            switch (desiredField) {
                case CustomFields.chat:                 filter |= PickerFilter.canChat; break;
                case C.KnownContactField.email:         filter |= PickerFilter.hasEmail; break;
                case C.KnownContactField.location:      filter |= PickerFilter.hasLocation; break;
                case C.KnownContactField.phoneNumber:   filter |= PickerFilter.hasPhone; break;
                case CustomFields.link:                 filter |= PickerFilter.none; break;
                default: Jx.log.info("PeopleProvider: Ignoring unknown custom field: " + desiredField); break;
            }
            return filter;
        }, null);

        // If all the desired-fields requested are unknown to us, display a barricade page indicating that the request is unsupported.
        if (pickerFilter !== null || this._desiredFields.length === 0) {
            pickerFilter = pickerFilter || Plat.PeoplePickerFilter.none;
            var filterOnline = this._filterOnline;
            var peopleMgr = this._platform.peopleManager;

            // Add the favorites group for everything but contact linking
            if (this._showFavorites) {
                collection.appendItem({
                    header: {
                        type: "favoritesGrouping",
                        data: null
                    },
                    collection: new P.QueryCollection(
                        "person",
                        new P.Callback(
                            peopleMgr.getPeopleByPickerQuery,
                            peopleMgr,
                            [pickerFilter, Plat.FavoritesFilter.favorites, filterOnline, "", true, "", false]),
                        "favorites")
                });
            }

            // Show the alphabetic collections
            P.AddressBookCollections.appendAlphabeticCollection(peopleMgr, collection, function (peopleManager, start, end) {
                /// <param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager"/>
                return new P.Callback(
                    peopleManager.getPeopleByPickerQuery,
                    peopleManager,
                    [pickerFilter, Plat.FavoritesFilter.all, filterOnline, start, true, end, false]);
            });
        }

        collection.loadComplete();
        collection.hydrate(null);
        return collection;
    };
    P.PickerAlphabeticSection.prototype._getFactories = function () {
        ///<returns type="Object">The map of factories that will be used to populate the All view</returns>
        var elementOptions = {
            className: "ic-listItem",
            tilePriority: P.Priority.userTileRender,
            secondaryContent: /*@static_cast(Object)*/null
        };
        var controlOptions = {
            selectionManager: this._selectionManager,
            onClick: this._personClickedHandler,
            onRightClick: this._personClickedHandler
        };
        var layout = P.IdentityElements.BillboardLayout;

        if (!this._isDesiredFieldSet(P.PeopleProvider.CustomDesiredFields.chat)) {
            // Presence is on be default in the IC. Turn it off unless the chat field is set
            elementOptions.statusIndicator = null;
        }

        // Check to see what content to display as the secondary content.
        var firstDesiredField = this._getFirstNonCustomDesiredField();
        if (firstDesiredField === C.KnownContactField.email) {
            elementOptions.secondaryContent = { element: P.PickerIdentityElements.DisambiguatedProperty, types: this._getSupportedTypes() };
            elementOptions.secondaryHitTarget = P.PickerIdentityElements.EmailDisambiguator;
        } else if (firstDesiredField === C.KnownContactField.location) {
            elementOptions.secondaryContent = { element: P.PickerIdentityElements.DisambiguatedProperty, types: this._getSupportedTypes() };
            elementOptions.secondaryHitTarget = P.PickerIdentityElements.LocationDisambiguator;
        } else if (firstDesiredField === C.KnownContactField.phoneNumber) {
            elementOptions.secondaryContent = { element: P.PickerIdentityElements.DisambiguatedProperty, types: this._getSupportedTypes() };
            elementOptions.secondaryHitTarget = P.PickerIdentityElements.PhoneNumberDisambiguator;
        }

        // If the 'link' custom properties is set, override the secondary content in favor of the network-attribution element.
        if (this._isDesiredFieldSet(P.PeopleProvider.CustomDesiredFields.link)) {
            elementOptions.secondaryContent = P.IdentityElements.Networks;
            elementOptions.secondaryHitTarget = null;
        }

        if (this._selectionMode === /*@static_cast(C.ContactSelectionMode)*/C.ContactSelectionMode.fields && !Jx.isNullOrUndefined(elementOptions.secondaryHitTarget) && this._desiredFields.length === 1) {
            layout = People.IdentityElements.PickerLayout; // If we don't set this, the secondaryHitTarget options will be ignored.
            Jx.addClass(this._contentElement, "pp-hasDisambiguators");
        } else {
            elementOptions.className += " pp-hoverListItem";
        }

        var personFactory = new P.IdentityControlNodeFactory(layout, elementOptions, controlOptions);
        return {
            person: new P.Callback(personFactory.create, personFactory),
            favoritesGrouping: new P.Callback(function (jobSet) { return new P.FavoritesHeader(); }),
            nameGrouping: new P.Callback(function (jobSet) { return new P.AlphabeticHeader(); }),
            otherGrouping: new P.Callback(function (jobSet) { return new P.OtherHeader(); })
        };
    };
    P.PickerAlphabeticSection.prototype._getSupportedTypes = function () {
        /// <summary>Based on the desired-fields request, build an ordered array of types we can suport.
        /// This information will be given to the secondaryContact element so that it knowns what content to display.</summary>
        var supportedTypes = [];
        var desiredFields = this._desiredFields;
        for (var i = 0; i < desiredFields.length; i++) {
            var type = this._mapKnownFieldToSecondaryContentType[desiredFields[i]];
            if (type) {
                supportedTypes.push(type);
            }
        }
        Debug.assert(supportedTypes.length > 0);
        return supportedTypes;
    };
    P.PickerAlphabeticSection.prototype._isDesiredFieldSet = function (field) {
        /// <summary>Checks our cached list of desired fields for presence of the given field</summary>
        /// <param name="field" type="String"/>
        /// <returns type="Boolean"/>
        // Because we are not using the windows vector anymore, we have to change the behaviour of this check.
        return this._desiredFields.indexOf(field) >= 0;
    };
    P.PickerAlphabeticSection.prototype._getFirstNonCustomDesiredField = function () {
        /// <summary>Searches our caches list of desired fields for the first, if any, non-custom desired field</summary>
        /// <returns type="String">Returns null of no field is found</returns>
        var desiredFields = this._desiredFields;
        var size = desiredFields.length;
        for (var i = 0; i < size; i++) {
            if (this._isNonCustomDesiredField(desiredFields[i])) {
                return desiredFields[i];
            }
        }
        return null;
    };
    P.PickerAlphabeticSection.prototype._isNonCustomDesiredField = function (field) {
        /// <summary>Checks if the given field is a known, non-custom field</summary>
        /// <returns type="Boolean"/>
        return (field === C.KnownContactField.email ||
                field === C.KnownContactField.phoneNumber ||
                field === C.KnownContactField.location);
    };
    P.PickerAlphabeticSection.prototype._platform = /* @static_cast(Microsoft.WindowsLive.Platform.Client)*/null;
    P.PickerAlphabeticSection.prototype.appendSemanticZoomCollection = function (collection) {
        /// <param name="collection" type="P.ArrayCollection"/>
        var allCollection = new P.ArrayCollection("AllSection");
        for (var i = 0; i < this._collection.length; i++) {
            var item = this._collection.getItem(i);
            allCollection.appendItem({
                type: (item.header.type === "favoritesGrouping") ? "zoomedOutFavoritesHeader" : "zoomedOutAlphabeticHeader",
                data: item,
                collection: null
            });
        }
        allCollection.loadComplete();
        collection.appendItem({
            collection: allCollection
        });
    };
});

