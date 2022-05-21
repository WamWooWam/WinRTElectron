
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Windows.Storage.js" />
/// <reference path="Windows.Storage.Streams.js" />
/// <reference path="Windows.ApplicationModel.Contacts.js" />
/// <reference path="Windows.ApplicationModel.Contacts.Provider.js" />
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Controls/Viewport/Viewport.js"/>
/// <reference path="../../Controls/Viewport/ScrollingViewport.js"/>
/// <reference path="../../Sections/PickerAlphabeticSection.js"/>

Jx.delayDefine(People, "PeopleProvider", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var S = P.Sequence;
    var C = Windows.ApplicationModel.Contacts;
    var Plat = Microsoft.WindowsLive.Platform;

    var PeopleProvider = P.PeopleProvider = /* @constructor*/function (ev, platform, scheduler) {
        /// <summary>Constructor</summary>
        /// <param name="ev" type="Windows.ApplicationModel.Activation.ContactPickerActivatedEventArgs"/>
        /// <param name="platform" type="Plat.Client"/>
        /// <param name="scheduler" type="P.Scheduler" />

        $include("$(cssResources)/AddressBook.css");
        $include("$(cssResources)/PeoplePicker.css");

        this.name = "PeopleProvider";
        this._root = null;
        this._rootElem = null;
        this._platform = platform;
        this._scheduler = scheduler;
        this._jobSet = scheduler.getJobSet().createChild();
        this._jobSet.setOrder(0);
        this._zoomedOutJobSet = scheduler.getJobSet().createChild();
        this._zoomedOutJobSet.setOrder(1);
        this._basket = ev.contactPickerUI;
        this._selectedPersons = [];
        this._selectedProperties = {};
        this._div = /* @static_cast(HTMLElement)*/null;

        this._header = new P.PickerHeader(this._basket, platform, this._jobSet);
        this._footer = new P.PickerFooter(this._basket, platform, this._jobSet);
        this.appendChild(this._header);
        this.appendChild(this._footer);

        this._resizeListener = /* @static_cast(Function)*/null;
        this._orientation = null;
        this._windowedMaxWidth = 500;

        this.initComponent();        
        this._id = "idPeoplePickerControl"; // This must be set after initComponent(), otherwise the auto-generated id will be used.        

        // Build a map which retrieves the Windows ContactFieldType value based on a known desired field.
        this._mapKnownFieldToContactType =
                  [{ knownField: C.KnownContactField.email, contactType: C.ContactFieldType.email },
                   { knownField: C.KnownContactField.phoneNumber, contactType: C.ContactFieldType.phoneNumber },
                   { knownField: C.KnownContactField.location, contactType: C.ContactFieldType.location },
                   { knownField: PeopleProvider.CustomDesiredFields.chat, contactType: C.ContactFieldType.custom },
                   { knownField: PeopleProvider.CustomDesiredFields.link, contactType: C.ContactFieldType.custom}].reduce(function (map, /*@dynamic*/pair) {
                       map[pair.knownField] = pair.contactType;
                       return map;
                   }, {});

        // Map the new Blue Address categories to the old contact field categories.
        this._addressKindCategoryMap =
            [{ kind: C.ContactAddressKind.home, category: C.ContactFieldCategory.home },
             { kind: C.ContactAddressKind.work, category: C.ContactFieldCategory.work },
             { kind: C.ContactAddressKind.other, category: C.ContactFieldCategory.other }].reduce(function (map, pair) {
                 map[pair.kind] = pair.category;
                 return map;
             }, {});

        // Map the new Blue Email categories to the old contact field categories.
        this._emailKindCategoryMap =
            [{ kind: C.ContactEmailKind.personal, category: C.ContactFieldCategory.home },
             { kind: C.ContactEmailKind.work, category: C.ContactFieldCategory.work },
             { kind: C.ContactEmailKind.other, category: C.ContactFieldCategory.other }].reduce(function (map, pair) {
                 map[pair.kind] = pair.category;
                 return map;
             }, {});

        // Map the new Blue Phone categories to the old contact field categories.
        this._phoneKindCategoryMap =
            [{ kind: C.ContactPhoneKind.home, category: C.ContactFieldCategory.home },
             { kind: C.ContactPhoneKind.work, category: C.ContactFieldCategory.work },
             { kind: C.ContactPhoneKind.mobile, category: C.ContactFieldCategory.mobile },
             { kind: C.ContactPhoneKind.other, category: C.ContactFieldCategory.other }].reduce(function (map, pair) {
                 map[pair.kind] = pair.category;
                 return map;
             }, {});
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    Jx.augment(PeopleProvider, Jx.Component);
    Jx.augment(PeopleProvider, Jx.Events);
    Debug.Events.define(PeopleProvider.prototype, "selectionchange");

    PeopleProvider.CustomDesiredFields = {
        chat: "Windows.Live.Chat",
        link: "Windows.Live.Link"
    };
    Object.freeze(PeopleProvider.CustomDesiredFields);

    PeopleProvider.SupportedPropertyType = {
        email: "email",
        phone: "phone",
        location: "location"
    };
    Object.freeze(PeopleProvider.SupportedPropertyType);

    // Jx.Component
    PeopleProvider.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        Debug.assert(this._platform !== null);
        ui.html = "<div id='idPeoplePickerControl' class='peoplePickerControl' >" +
                    "<div class='peoplePickerHeader'>" + Jx.getUI(this._header).html + "</div>" +
                    "<div class='peoplePickerContent' id='idContacts' ></div>" +
                    "<div class='peoplePickerFooter'>" + Jx.getUI(this._footer).html + "</div>" +
                  "</div>";
    };

    PeopleProvider.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        NoShip.People.etw("ppBuildHtml_start");
        Jx.Component.prototype.activateUI.call(this);

        // always assume that we will start in full screen. This way we can never be null
        this._orientation = P.Orientation.horizontal;
        
        if (document.documentElement.offsetWidth < this._windowedMaxWidth) {
            this._orientation = P.Orientation.vertical;
        }

        try {
            this._loadContactsViewport();
            this._basket.addEventListener("contactremoved", this._onContactRemovedFromBasket.bind(this));                        
    
        } catch (ex) {
            Jx.log.exception("Exception: ", ex); // This likely means the user cancelled the picker during app activation.
        }

        var div = this._div = document.getElementById(this._id);
        this._div.addEventListener("mselementresize", this._resizeListener = this._onResize.bind(this), false);

        NoShip.People.etw("ppBuildHtml_end");
    };

    PeopleProvider.prototype._onResize = function (rootElem) {

        var currentOrientation = this._viewport.getOrientation();
        var desiredOrientation = currentOrientation;

        if (document.documentElement.offsetWidth < this._windowedMaxWidth) {
            // don't change to vertical if we are still in the correct view
            if (currentOrientation === P.Orientation.horizontal) {
                desiredOrientation = P.Orientation.vertical;
            }
        }
        else {
            // don't change to horizontal if we are still in the correct view
            if (currentOrientation === P.Orientation.vertical) {
                desiredOrientation = P.Orientation.horizontal;
            }
        }

        if (currentOrientation != desiredOrientation)
        {
            if (this._zoomHost) {
                this._zoomHost.shutdownComponent();
                this.removeChild(this._zoomHost);
                this._zoomHost = null;
                this._viewport = null;
            } else if (this._viewport) {
                this._viewport.shutdownComponent();
                this.removeChild(this._viewport);
                this._viewport = null;
            }

            this._orientation = desiredOrientation;
            this._loadContactsViewport();
        }
    }
    
    PeopleProvider.prototype._loadContactsViewport = function () {

        Debug.assert(!this._root, "We should not be keeping the viewport object alive.");

        var platform = this._platform;
        var elementRoot = this._rootElem = document.getElementById(this._id);

        // Build the component tree:  a viewport over containing our section
        var section = section = new P.PickerAlphabeticSection(platform,
                                                              this._onPersonClicked.bind(this),
                                                              this /*selectionManager*/,
                                                              this._basket,
                                                              elementRoot,
                                                              this._header.getFilterToggle());

        var viewport = this._viewport = /*@static_cast(P.ScrollingViewport)*/new P.ScrollingViewport(this._jobSet, /*@static_cast(P.ViewportChild)*/section, this._orientation, true /*supports selection*/);
        this.appendChild(viewport);

        var container = this._container = elementRoot.querySelector("#idContacts");
        container.innerHTML = Jx.getUI(viewport).html;

        var viewportElement = document.getElementById(viewport.id);
        viewportElement.setAttribute("aria-multiselectable", "true");
        viewportElement.setAttribute("aria-label", Jx.res.getString("/strings/peopleAppName"));

        viewport.activateUI();
        viewport.hydrate(null);

        this._jobSet.addUIJob(this, this._initializeSemanticZoom, null, P.Priority.semanticZoom);
    };

    PeopleProvider.prototype.getMessageBar = function () {
        return this._header.getMessageBar();
    };

    PeopleProvider.prototype.zoomChanged = function (isZoomedOut) {
        /// <summary>Shows and hides according to the updated semantic zoom state.</summary>
        var messageBar = this.getMessageBar();
        Jx.setClass(this._rootElem, "inZoomedOutView", isZoomedOut);
        if (isZoomedOut) {
            messageBar.hide();
        } else {
            messageBar.unhide();
        }
    };

    PeopleProvider.prototype._initializeSemanticZoom = function () {
        this.removeChild(this._viewport);
        var options = { disableEnterKey: true };
        this._zoomHost = P.ZoomHost.create(this._viewport, this._jobSet, this._zoomedOutJobSet, this._orientation, this, options, this._container);
        this.appendChild(this._zoomHost);
    };

    PeopleProvider.prototype.trackStartup = function () { };

    PeopleProvider.prototype.shutdownComponent = function () {
        /// <summary>Called when our control being destroyed</summary>
        if (this._basket) {
            this._basket.removeEventListener("contactremoved", this._onContactRemovedFromBasket.bind(this));
        }

        this._platform = null;
        this._basket = null;

        Jx.dispose(this._jobSet);
        Jx.dispose(this._zoomedOutJobSet);

        Jx.Component.prototype.shutdownComponent.call(this);
    };

    PeopleProvider.prototype.setSelectedProperty = function (property, displayValue, person) {
        /// <summary>Notifies the selection-manager-specific interface of our provider that the 
        /// selected/disambiguated property has changed</summary>
        /// <param name="property" type="dynamic"/>
        /// <param name="displayValue" type="String"/>
        /// <param name="person" type="Plat.Person">The associated person.</param>
        if (this.getSelectedPropertyValue(person) !== displayValue) {
            this._selectedProperties[person.objectId] = { property: property, displayValue: displayValue };

            // If the associated person is already in the basket, we'll need to remove him
            // and re-add him to ensure the disambiguated property is properly set.
            if (this.isSelected(person)) {
                this._removePersonFromBasket(person);
                this._addPersonToBasket(person);
            } else {
                this._addPersonToBasket(person);
                this._selectedPersons.push(person.objectId);
            }

            this.raiseEvent("selectionchange", { id: person.objectId });
        }
    };

    PeopleProvider.prototype.getSelectedPropertyValue = function (person) {
        /// <summary>Returns the selected/disambiguated property for the given person</summary>
        /// <param name="person" type="Plat.Person">The associated person.</param>
        /// <returns type="String"/>
        var /*@dynamic*/propertyInfo = this._selectedProperties[person.objectId];
        return !Jx.isNullOrUndefined(propertyInfo) ? propertyInfo.displayValue : null;
    };

    PeopleProvider.prototype.isSelected = function (person) {
        /// <summary>An exposed method which the IC uses to manage selection</summary>
        /// <param name="person" type="Plat.Person"/>
        /// <returns type="Boolean"/>
        return (this._selectedPersons.indexOf(person.objectId) !== -1);
    };

    PeopleProvider.prototype._removeFromSelectedList = function (personId) {
        /// <summary>Removes the given person from our list of selected persons</summary>
        /// <param name="personId" type="String"/>
        var index = this._selectedPersons.indexOf(personId);
        Debug.assert(index !== -1, "We should not be trying to deselect something that's not selected.");
        this._selectedPersons.splice(index, 1);
    };

    PeopleProvider.prototype._onPersonClicked = function (person, node, evt) {
        /// <summary>Handler for the IC primary actions</summary>
        /// <param name="person" type="Plat.Person"/>
        /// <param name="node" type="HTMLElement"/>
        /// <param name="evt" type="Event"/>
        Debug.assert(person !== null, "We should never get a null person.");

        if (person !== null) {
            var isSelected = this.isSelected(person);

            if (!Jx.isNullOrUndefined(node) && !Jx.isNullOrUndefined(evt) && evt.type === "keydown") {
                // Open context menu if there is a secondary hit target (disambiguated button)
                // and the person hasn't been selected. 
                var secondaryHitTarget = node.querySelector(".ic-pickerLayout-secondaryHitTarget");
                var hasSecondaryHitTarget = !Jx.isNullOrUndefined(secondaryHitTarget) && getComputedStyle(secondaryHitTarget).visibility !== "hidden";

                if (!isSelected && hasSecondaryHitTarget) {
                    secondaryHitTarget.click();
                    return;
                }
            }

            // Calling this._basket here in event listener results in ICs staying in active hover state
            // if selected/deselected by tapping. Calling it async avoids the issue. 
            msSetImmediate(/*@bind(PeopleProvider)*/function () {
                if (isSelected) {
                    // Remove the person from the basket
                    this._removePersonFromBasket(person);
                    this._removeFromSelectedList(person.objectId);
                } else {
                    // Add the person to the basket
                    this._addPersonToBasket(person);
                    this._selectedPersons.push(person.objectId);
                }

                this.raiseEvent("selectionchange", { id: person.objectId });
            } .bind(this));
        }
    };

    PeopleProvider.prototype._onContactRemovedFromBasket = function (contact) {
        /// <summary>Callback from the Contact Picker Basket indicated a contact has been removed.</summary>
        /// <param name="contact" type="Windows.ApplicationModel.Contacts.Provider.ContactRemovedEventArgs"/>
        this._removeFromSelectedList(contact.id);
        this.raiseEvent("selectionchange", { id: contact.id });
    };

    PeopleProvider.prototype._addPersonToBasket = function (person) {
        /// <summary>Creates a Windows Contact from a person and adds it to the basket.</summary>
        /// <param name="person" type="Plat.Person"/>

        var contact = person.getWindowsContact();
        var basket = this._basket;

        try {
            var userTile = person.getUserTile(Plat.UserTileSize.small, false);
            if (Jx.isObject(userTile)) {
                var stream = /*@static_cast(Windows.Storage.Streams.IRandomAccessStream)*/userTile.stream;
                if (!Jx.isNullOrUndefined(stream) && stream.size > 0) {
                    contact.thumbnail = Windows.Storage.Streams.RandomAccessStreamReference.createFromStream(stream);
                }
            }
        } catch (ex) {
            Jx.log.exception("Error retrieving/processing usertile", ex);
        }
        
        // For Blue the contact payload is different. There is no filtering and all of the contact objects properties
        // are in the payload (previously 'contact' selection mode was all data and 'fields' selection mode was limited 
        // to what was selected during disabiguation). The picker needs the first item in the collection to be the one 
        // that will be added to the basket. This is now purely for display purposes. Therefore because the order of 
        // the contact's collections' is unknown we should always sort it based off of what the data is in the tile.
        this._addDesiredProperties(person, contact);
        basket.addContact(contact);
    };

    PeopleProvider.prototype._removePersonFromBasket = function (person) {
        /// <summary>Removes the given person from the Windows Contact Basket</summary>
        /// <param name="person" type="Plat.Person"/>
        this._basket.removeContact(person.objectId);
    };

    PeopleProvider.prototype._applyPropertySetToContact = function (propertySets, contact) {
        /// <summary>Applies a set of properties to a Windows Contact</summary>
        /// <param name="propertySets" type="Object">An associated array (i.e. object literal), that maps known-fields, 
        /// to an array of properties that belong to that field-type.</param>
        /// <param name="contact" type="Windows.ApplicationModel.Contacts.Contact"/>
        var that = this;
        for (var knownField in propertySets) {
            var properties = /*@static_cast(Array)*/propertySets[knownField];
            properties.forEach(function (/*@dynamic*/property) {
                if (knownField === C.KnownContactField.email) {
                    for (var i = 0; i < contact.emails.length; i++) {
                        var current = contact.emails[i];
                        if ((current.address === property.value) && (that._emailKindCategoryMap[current.kind] === property.category)) {
                            // because the collection is a get only, we have to manipulate in place. we move the selected item 
                            // to the front of the list and then remove from where it was. it will always be current + 1 because of the insert.
                            contact.emails.insertAt(0, current);
                            contact.emails.removeAt(i + 1);
                            break;
                        }
                    }
                } else if (knownField === C.KnownContactField.phoneNumber) {
                    for (var i = 0; i < contact.phones.length; i++) {
                        var current = contact.phones[i];
                        if ((current.number === property.value) && (that._phoneKindCategoryMap[current.kind] === property.category)) {
                            // because the collection is a get only, we have to manipulate in place. we move the selected item 
                            // to the front of the list and then remove from where it was. it will always be current + 1 because of the insert.
                            contact.phones.insertAt(0, current);
                            contact.phones.removeAt(i + 1);
                            break;
                        }
                    }
                } else if (knownField === C.KnownContactField.location) {
                    for (var i = 0; i < contact.addresses.length; i++) {
                        // we have to construct the location because if we get here, property has a structure
                        // and not a single value. we then have to select the best location field because we 
                        // may be disambiguating different types of address data for each of the contacts 
                        // in the list i.e. street address vs city vs region.
                        var current = contact.addresses[i];
                        var currentLocationBestField = P.Location.chooseBestDisplayField({
                            street: current.streetAddress,
                            city: current.locality,
                            region: current.region,
                            zipCode: current.postalCode,
                            country: current.country
                        })
                        if ((P.Location.chooseBestDisplayField(property.value) === currentLocationBestField) && (that._addressKindCategoryMap[current.kind] === property.category)) {
                            // because the collection is a get only, we have to manipulate in place. we move the selected item 
                            // to the front of the list and then remove from where it was. it will always be current + 1 because of the insert.
                            contact.addresses.insertAt(0, current);
                            contact.addresses.removeAt(i + 1);
                            break;
                        }
                    }             
                } else {
                    Debug.assert(false, "Attempting to process unexpected knownField");
                }
            });
        }
    };

    PeopleProvider.prototype._addDesiredProperties = function (person, contact) {
        /// <summary>Adds only the desired properties from a person to a Windows contact, as specified by 'desiredFields'</summary>
        /// <param name="person" type="Plat.Person"/>
        /// <param name="contact" type="Windows.ApplicationModel.Contacts.Contact"/>
        var propertySetRequests = [];
        var knownDesiredFields = [];
        var desiredFields = this._basket.desiredFields;

        // Pare down our desiredFields list to just the one we support.
        for (var i = 0; i < desiredFields.size; i++) {
            var field = desiredFields[i];
            if (this._mapKnownFieldToContactType[field] !== undefined) {
                propertySetRequests.push(this._createPropertySetRequest(field));
                knownDesiredFields.push(field);
            }
        }

        if (propertySetRequests.length > 0) {
            var propertySets = this._retrievePropertySets(person, propertySetRequests);

            // If there is only one field was requested (e.g. email), then this is the
            // disambiguation scenario. In which case we need to return only the disambiguated
            // value. All the proceeding logic serves merely to determine what category
            // the disambiguated property belongs to. The the other scenarios, we just return
            // all the properties and we can easy map those to the correct categories. Here,
            // however, the default email might be perons.mostRevelantEmail. So, we have to
            // lookup to see where that property came from.
            if (propertySetRequests.length === 1) {
                // Retrieve the selected/disambiguated value.
                var /*@dynamic*/propertyInfo = this._selectedProperties[person.objectId] || null;
                var primaryValue = propertyInfo ? propertyInfo.property : null;
                if (primaryValue === null) {
                    // The user did not explicitly selected a value. Use the default.
                    // Note: the first desired-field will always be the one we select/disambiguate on.
                    primaryValue = this._getDefaultField(person, knownDesiredFields[0]);
                }

                var primaryDesiredFieldProperties = /*@static_cast(Array)*/propertySets[knownDesiredFields[0]];
                if (primaryDesiredFieldProperties.length > 1) {
                    // Reduce our properties for the first desired field to an array of values.
                    var allValues = primaryDesiredFieldProperties.map(function (/*@dynamic*/property) {
                        return property.value;
                    });

                    var index = -1;
                    // Hunt through propertySets and find the selected/disambiguated value.
                    if (Jx.isObject(primaryValue)) {
                        // We assume this is an address, because our other supported properties should be strings.
                        Debug.assert(P.Location.isValid(/*@static_cast(Microsoft.WindowsLive.Platform.Location)*/primaryValue));
                        index = S.findIndex(allValues, P.Location.isIdentical, primaryValue);
                    } else if (!Jx.isNullOrUndefined(primaryValue)) {
                        index = allValues.indexOf(primaryValue);
                    }

                    if (index >= 0) {
                        // Replace the entire property-set with the disambiguated property
                        propertySets[knownDesiredFields[0]] = primaryDesiredFieldProperties.splice(index, 1);
                    }
                }
            }

            this._applyPropertySetToContact(propertySets, contact);
        }
    };

    PeopleProvider.prototype._createPropertySetRequest = function (desiredField) {
        /// <summary>Given a desired field, return a list of linked-contact properties to retrieve
        /// from a person which satisfy the desired field.</summary>
        /// <param name="desiredField" type="String">This  must be either a C.KnownContactField or PeopleProvider.CustomDesiredFields</param>
        /// <returns type="Object">An object literal with the properties:
        ///     'knownField' -- the field-type that the request represents.
        ///     'validator' -- the function to use to validate any properties retrieved for the request
        ///     'properties' -- an array of object literals that provides the acessor for the desired linked-contact property
        ///                     and the C.ContactFieldCategory value that the property represent.</returns>
        var simplePropertyValidator = function (value) { return Jx.isNonEmptyString(value); };
        var simpleEqualityCheck = function (/*@dynamic*/propInfo) { return (String.prototype.toLowerCase.apply(propInfo.value) === String.prototype.toLowerCase.apply(this)); };
        var get = function (propName) {
            return function (contact) { return contact[propName]; };
        };

        var request = { validator: simplePropertyValidator, equalityCheck: simpleEqualityCheck };
        if (desiredField === C.KnownContactField.email) {
            request.properties = [{ name: "personalEmailAddress", accessor: get("personalEmailAddress"), category: C.ContactFieldCategory.home },
                                  { name: "windowsLiveEmailAddress", accessor: get("windowsLiveEmailAddress"), category: C.ContactFieldCategory.other },
                                  { name: "yahooEmailAddress", accessor: get("yahooEmailAddress"), category: C.ContactFieldCategory.other },
                                  { name: "businessEmailAddress", accessor: get("businessEmailAddress"), category: C.ContactFieldCategory.work },
                                  { name: "otherEmailAddress", accessor: get("otherEmailAddress"), category: C.ContactFieldCategory.other },
                                  { name: "federatedEmailAddress", accessor: get("federatedEmailAddress"), category: C.ContactFieldCategory.other}];
        } else if (desiredField === C.KnownContactField.phoneNumber) {
            request.properties = [{ name: "homePhoneNumber", accessor: get("homePhoneNumber"), category: C.ContactFieldCategory.home },
                                  { name: "home2PhoneNumber", accessor: get("home2PhoneNumber"), category: C.ContactFieldCategory.home },
                                  { name: "businessPhoneNumber", accessor: get("businessPhoneNumber"), category: C.ContactFieldCategory.work },
                                  { name: "business2PhoneNumber", accessor: get("business2PhoneNumber"), category: C.ContactFieldCategory.work },
                                  { name: "mobilePhoneNumber", accessor: get("mobilePhoneNumber"), category: C.ContactFieldCategory.mobile },
                                  { name: "mobile2PhoneNumber", accessor: get("mobile2PhoneNumber"), category: C.ContactFieldCategory.mobile}];
        } else if (desiredField === C.KnownContactField.location) {
            request.validator = P.Location.isValid;
            request.equalityCheck = P.Location.isIdentical;
            request.properties = [{ name: "homeLocation", accessor: get("homeLocation"), category: C.ContactFieldCategory.home },
                                  { name: "businessLocation", accessor: get("businessLocation"), category: C.ContactFieldCategory.work },
                                  { name: "otherLocation", accessor: get("otherLocation"), category: C.ContactFieldCategory.other}];
        } else if (desiredField === PeopleProvider.CustomDesiredFields.chat || desiredField === PeopleProvider.CustomDesiredFields.link) {
            request.properties = [{ name: "personId", accessor: function (/*@type(Plat.Contact)*/contact) { return contact.person.objectId; }, category: C.ContactFieldCategory.none}];
        } else {
            Debug.assert(false, "Unexpected desiredField requested");
        }
        request.knownField = desiredField;
        return request;
    };

    PeopleProvider.prototype._getDefaultField = function (person, field) {
        /// <summary>Gets the default-selected property for a given desired-field</summary>
        /// <param name="person" type="Plat.Person"/>
        /// <param name="field" type="String">Windows.ApplicationModel.Contacts.KnownContactField</param>
        /// <returns type="Object"/>
        if (field === C.KnownContactField.email) {
            return person.mostRelevantEmail;
        } else if (field === C.KnownContactField.phoneNumber) {
            return person.mostRelevantPhone;
        } else if (field === C.KnownContactField.location) {
            // Unfortunately, the platform does not have a mostRelevantLocation value. We'll have to
            // pick one ourselves from the list of location-type properties on the person's linked contacts.
            var propertySetRequests = [(this._createPropertySetRequest(C.KnownContactField.location))];
            var propertySets = this._retrievePropertySets(person, propertySetRequests);
            var locationProperties = /*@static_cast(Array)*/propertySets[C.KnownContactField.location];
            // Construct an array of location objects
            var locations = locationProperties.map(function (/*@dynamic*/property) { return { value: property.value }; });
            var mostRelevantLocationEntity = P.Location.getBestLocation(locations);
            return mostRelevantLocationEntity ? mostRelevantLocationEntity.value : null;
        }
        return null;
    };

    PeopleProvider.prototype._retrievePropertySets = function (person, requests) {
        /// <summary>Given a person, retrieve all properties which satify the 'properties' request from the given list</summary>
        /// <param name="person" type="Plat.Person"/>
        /// <param name="requests" type="Array">A propertSetRequest, described in comments for _createPropertySetRequest()</param>
        /// <returns type="Object">A property-set, described in comments for _applyPropertySetToContact()</returns>
        var linkedContacts = person.linkedContacts;

        var returnedProps = {};
        requests.forEach(function (/*@dynamic*/request) {
            Debug.assert(returnedProps[request.knownField] === undefined, "Duplicate request types found. Data will be lost.");
            returnedProps[request.knownField] = [];
        });

        var count = linkedContacts.count;
        for (var i = 0; i < count; i++) {
            var contact = linkedContacts.item(i);
            if (contact) {
                requests.forEach(function (/*@dynamic*/request) {
                    request.properties.forEach(function (/*@dynamic*/property) {
                        var value = property.accessor(contact);
                        var propertyInfo = { name: property.name, value: value, category: property.category };
                        if (request.validator(value) && S.findIndex(returnedProps[request.knownField], request.equalityCheck, propertyInfo.value) === -1) {
                            returnedProps[request.knownField].push(propertyInfo);
                        }
                    });
                });
            }
        }
        return returnedProps;
    };

    PeopleProvider.prototype._createLocationField = function (loc, category) {
        /// <summary>Given a linked-contact's location object, attempt to create a Windows location object</summary>
        /// <param name="loc" type="Plat.Location"/>
        /// <param name="category" type="Windows.ApplicationModel.Contacts.ContactFieldCategory"/>
        /// <returns type="Number">Windows.ApplicationModel.Contacts.ContactLocationField enum value</returns>
        Debug.assert(P.Location.isValid(loc), "The location should have been validated before it was selected");

        return new C.ContactLocationField("", // We don't have the unstructured address/
                                                   category,
                                                   loc.street,
                                                   loc.city,
                                                   loc.state,
                                                   loc.country,
                                                   loc.zipCode);
    };
});

