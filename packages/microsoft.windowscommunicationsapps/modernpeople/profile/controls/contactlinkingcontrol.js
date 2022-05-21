
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/jx/core/jx.js"/>
/// <reference path="../../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../../../Shared/jx/core/res.js"/>
/// <reference path="ContactLinkingControl.ref.js"/>

Jx.delayDefine(People, "ContactLinkingControl", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var C = P.Controls;
    var N = P.Nav;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var type = { // Types of items in the listview
        existingContact: 1,
        newPerson: 2,
        progress: 3,
        pickerLink: 4
    };
    Object.freeze(type);
    var group = { // Listview groups
        links: 1,
        suggestions: 2
    };
    Object.freeze(group);

    // ================================================================================================
    // Perf Helper.
    //// <event value="2518" task="profileLinkingAction_start" opcode="win:Start" symbol="profileLinkingAction_start_start" template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    //// <event value="2519" task="profileLinkingAction_start" opcode="win:Stop"  symbol="profileLinkingAction_start_end"   template="profileActionTemplate" keywords="profile" level="win:Informational"/>
    function perfContactLinkingAction(actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("profileLinkingAction_start", { action: actionOp });

                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("profileLinkingAction_end", { action: actionOp });
            }
        };
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var ContactLinkingControl = P.ContactLinkingControl = /*@constructor*/function (host) {
        /// <param name="host" type="P.CpMain"/>
        Jx.ptStart("People-Linking", "Windows-Live-People-Linking");
        Debug.assert(Jx.isObject(host));
        this._host = host;
        this._suggestionReadyInLoad = false;
        this._suggestionCount = 0;
        this._ptStopLogged = false;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>
    var prototype = ContactLinkingControl.prototype;
    prototype._completeListener = null;
    prototype._timeout = null;
    prototype._suggestions = /*@static_cast(LinkingSuggestions)*/null;

    prototype.load = perfContactLinkingAction("load", _loadAction);
    /*@bind(ContactLinkingControl)*/function _loadAction(/*@dynamic*/params) {
        ///<summary>Loads the page into view.</summary>
        Debug.assert(Jx.isObject(params), "invalid argument: params");
        $include("$(cssResources)/controls-people.css");  

        var host = this._host;
        var person = this._person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/params.data;
        Debug.assert(Jx.isObject(person));
        var element = this._element = /*@static_cast(HTMLElement)*/params.element;
        Debug.assert(Jx.isHTMLElement(element));
        this._platform = host.getPlatform();

        // Add commands to the frame commands
        var frameCommands = host.getFrameCommands();
        frameCommands.addCommand(new P.Command("cmdid_profile_save", null, "/strings/profileFrameButtonSave_tooltip", "\uE105", true, true, this, this._onSave));
        frameCommands.addCommand(new P.Command("cmdid_profile_cancel", null, "/strings/profileFrameButtonCancel_tooltip", "\uE10A", true, true, this, this._onCancel));

        // Create the data source
        var list = /*@static_cast(WinJSBindingListDescriptor)*/new WinJS.Binding.List();
        var groupedItems = this._groupedItems = list.createGrouped(groupKeySelector, groupDataSelector);

        // Grab hydration data
        var suspension;
        try {
            suspension = JSON.parse(params.context);
        } catch (ex) {
            Jx.log.exception("Error parsing hydration data: " + params.context, ex);
        }
        var contactIdsToUnlink = /*@static_cast(Array)*/P.Hydration.get(suspension, "contactIdsToUnlink", []);
        var personIdsToLink = /*@static_cast(Array)*/P.Hydration.get(suspension, "personIdsToLink", []);

        // Populate the existing linked contacts
        var unlinkedContacts = [];
        var linkedContacts = person.linkedContacts;

        for (var i = 0, len = linkedContacts.count; i < len; i++) {
            try {
                var linkedContact = /*@static_cast(Microsoft.WindowsLive.Platform.IBaseContact)*/linkedContacts.item(i);
                if (!linkedContact.isGal) {
                    if (contactIdsToUnlink.indexOf(linkedContact.objectId) !== -1) {
                        unlinkedContacts.push(linkedContact);
                    } else {
                        groupedItems.push({ type: type.existingContact, group: group.links, contact: linkedContact });
                    }
                }
            } catch (ex) {
                Jx.log.exception("Error adding linked contact", ex);
            }
        }
        personIdsToLink.forEach(/*@bind(ContactLinkingControl)*/function (id) {
            var personToLink = this._platform.peopleManager.tryLoadPerson(id);
            if (personToLink) {
                groupedItems.push({ type: type.newPerson, group: group.links, person: personToLink });
            }
        }, this);

        // Suggestions will go in a separate group 
        unlinkedContacts.forEach(function (unlinkedContact) {
            groupedItems.push({ type: type.existingContact, group: group.suggestions, contact: unlinkedContact });
        });
        groupedItems.push({ type: type.progress, group: group.suggestions });
        groupedItems.push({ type: type.pickerLink, group: group.suggestions });

        // Prepare the suggestions collection
        this._jobSet = host.getJobSet().createChild();
        var suggestions = this._suggestions = ContactLinkingControl.getSuggestions(person);
        if (suggestions.isReady()) {
            this._suggestionReadyInLoad = true;
            this._addSuggestions();
        } else {
            suggestions.addListener("ready", this._addSuggestions, this);
        }

        // Create the IC factory
        var baseElementOptions = {
            statusIndicator: null,
            secondaryContent: P.IdentityElements.Networks
        };
        var baseControlOptions = {
            interactive: false,
            createJobSet: true
        };
        this._linkedFactory = new P.IdentityControlNodeFactory(
            P.IdentityElements.BillboardLayout,
            Jx.mix({ className: "profileLink-linked" }, baseElementOptions),
            Jx.mix({ getLabel: function (dataObject, label) { return label + "\n" + Jx.res.getString("/strings/linking_ariaLabelLinked"); } }, baseControlOptions)
        );
        this._unlinkedFactory = new P.IdentityControlNodeFactory(
            P.IdentityElements.BillboardLayout, 
            Jx.mix({ className: "profileLink-unlinked" }, baseElementOptions),
            Jx.mix({ getLabel: function (dataObject, label) { return label + "\n" + Jx.res.getString("/strings/linking_ariaLabelUnlinked"); } }, baseControlOptions)
        );
        this._identityControls = {};

        var layout = this._layout = host.getLayout();
        this._layoutChangedHandler = this._updateLayout;
        layout.addLayoutChangedEventListener(this._updateLayout, this);

        // Create the list view
        element.innerHTML = "<div id='linkingListView'></div>";
        new WinJS.UI.ListView(element.firstChild, {
            layout: {
                type: (layout.getLayoutState() === P.Layout.layoutState.snapped) ? WinJS.UI.ListLayout : WinJS.UI.GridLayout,
                groupHeaderPosition: WinJS.UI.HeaderPosition.top
            },
            selectionMode: WinJS.UI.SelectionMode.none,
            swipeBehavior: WinJS.UI.SwipeBehavior.none,
            itemDataSource: groupedItems.dataSource,
            groupDataSource: groupedItems.groups.dataSource,
            itemTemplate: makeTemplate(this._renderItem, this),
            resetItem: this._disposeElement.bind(this),
            groupHeaderTemplate: makeTemplate(renderGroup),
            oniteminvoked: this._itemInvoked.bind(this)
        });

        if (this._suggestionReadyInLoad) {
            this._markPtStopLoad();
        }
    };
    
    prototype._updateLayout = function () {
        this._element.firstChild.winControl.layout = {
            type: (this._layout.getLayoutState() === P.Layout.layoutState.snapped) ? WinJS.UI.ListLayout : WinJS.UI.GridLayout,
            groupHeaderPosition: WinJS.UI.HeaderPosition.top
        };
    };

    prototype._markPtStopLoad = function () {
        Debug.assert(!this._ptStopLogged);
        Jx.ptStopData("People-Linking", "Windows-Live-People-Linking", this._suggestionCount, 0, 0, 0, 0, "", "");
        this._ptStopLogged = true;
    };

    prototype.activate = function () {
        ///<summary>Called when the page is activated - unused</summary>
    };

    prototype.deactivate = function () {
        /// <summary>Called when the page is deactivated.</summary>
        /// <returns type="Boolean">Indicates whether it is okay to proceed with navigation</returns>
        if (this._layoutChangedHandler) {
            this._layout.removeLayoutChangedEventListener(this._updateLayout, this);
            this._layoutChangedHandler = null;
        }

        // If we were waiting for a save to finish, stop waiting.
        if (this._completeListener) {
            this._person.removeEventListener("changed", this._completeListener);
            this._completeListener = null;
        }
        clearTimeout(this._timeout);
        this._timeout = 0;

        return true;
    };

    prototype.unload = function () {
        ///<summary>Called when the page is unloaded</summary>
        if (!this._ptStopLogged) {
            // Make sure to log the stop point for the pt if the page gets unloaded before suggestions are ready.
            this._markPtStopLoad();
        }
        
        Jx.dispose(this._suggestions);
        this._suggestions = null;

        Jx.dispose(this._groupedItems);

        for (var id in this._identityControls) {
            Jx.dispose(this._identityControls[id]);
        }
        this._identityControls = null;

        Jx.dispose(this._jobSet);
        this._jobSet = null;
    };

    prototype._addSuggestions = function () {
        // find the progress element
        var index;
        for (index = 0; index < this._groupedItems.length; index++) {
            if (this._groupedItems.getAt(index).type === type.progress) {
                break;
            }
        }

        // remove it
        this._groupedItems.splice(index, 1);

        // and add the suggestions
        var suggestions = this._suggestions;
        var suggestedPeople = suggestions.getResults();
        var count = suggestedPeople.count;
        for (var iPerson = 0; iPerson < count; iPerson++) {
            try {
                var suggestedPerson = suggestedPeople.item(iPerson);
                // A suggestion may already be in the UI, either via picker (suggestions would have to have been really slow) or hydration.  Don't readd them.
                if (!this._groupedItems.some(function (/*@type(GroupItemDescriptor)*/item) { return item.type === type.newPerson && item.person.objectId === suggestedPerson.objectId; })) {
                    this._groupedItems.splice(index, 0, { type: type.newPerson, group: group.suggestions, person: suggestedPerson });
                    index++;
                }
            } catch (ex) {
                Jx.log.exception("Error adding suggestion", ex);
            }
        }

        this._suggestionCount = count;
        Jx.dispose(suggestions);
        this._suggestions = null;

        if (!this._suggestionReadyInLoad) {
            this._markPtStopLoad();
        }
    };

    function groupKeySelector(item) {
        /// <param name="item" type="GroupItemDescriptor"/>
        return item.group;
    }

    function groupDataSelector(item) {
        /// <param name="item" type="GroupItemDescriptor"/>
        /// <returns type="GroupDataDescriptor"/>
        return {
            title: item.group === group.links ? Jx.res.getString("/strings/linking_linkedProfiles") : Jx.res.getString("/strings/linking_suggestions")
        };
    }

    prototype._itemInvoked = function (e) {
        /// <param name="e" type="Event"/>
        Debug.assert(Jx.isObject(e), "Invalid parameter: e");
        var that = this;
        var index = e.detail.itemIndex;
        var item = /*@static_cast(GroupItemDescriptor)*/this._groupedItems.getAt(index);
        if (item.type === type.pickerLink) {
            var Contacts = Windows.ApplicationModel.Contacts;
            var picker = new Contacts.ContactPicker();
            picker.commitButtonText = Jx.res.getString("/strings/linking_peoplepickertext");
            // here we are overloading the use of the desiredFieldWithContactType collection to tell the provider that we 
            // want network attribution and hide favorites when displaying the contacts. this is the only way to send data 
            // to the picker provider to define customization of the contacts list. if a 3rd party uses the same custom 
            // enum they will see the same level of customization.
            picker.desiredFieldsWithContactFieldType.append(Windows.ApplicationModel.Contacts.ContactFieldType.custom);
            picker.selectionMode = Contacts.ContactSelectionMode.contacts;
            picker.pickContactsAsync().done(function (contacts) {
                if (contacts) {
                    contacts.forEach(function (contact) {
                        that._addLinkedContact(contact.id);
                    });
                }
            }, Jx.fnEmpty);
        } else if (item.type === type.existingContact || item.type === type.newPerson) {
            if (item.group === group.links) {
                if (this._getLinkCount() > 1) { // Prevent unlinking the only contact in the set
                    this._changeGroup(item, index, group.suggestions);
                }
            } else {
                Debug.assert(item.group === group.suggestions, "Unknown group: " + String(item.group));
                var object = /*@static_cast(Object)*/item.person || /*@static_cast(Object)*/item.contact;
                if (this._canLink(object)) {
                    this._changeGroup(item, index, group.links);
                } else {
                    this._reportRejectedLinks([object]);
                }
            }
        }
    };

    prototype._getLinkCount = function () {
        /// <returns type="Number">The number of items in the links group</returns>
        return this._groupedItems.reduce(function (count, /*@type(GroupItemDescriptor)*/item) {
            return count + ((item.group === group.links) ? 1 : 0);
        }, 0);
    };

    function isMessenger(/*@dynamic*/object) {
        /// <param name="object">A person or contact object</param>
        /// <returns type="Boolean"/>
        if (object.objectType === "Person") {
            var linkedContacts = /*@static_cast(Microsoft.WindowsLive.Platform.Collection)*/object.linkedContacts;
            for (var i = 0; i < linkedContacts.count; i++) {
                if (isMessenger(linkedContacts.item(i))) {
                    return true;
                }
            }
            return false;
        } else {
            Debug.assert(object.objectType === "Contact");
            return object.linkType === Microsoft.WindowsLive.Platform.ContactLinkingType.windowsLive;
        }
    }

    prototype._canLink = function (/*@dynamic*/object) {
        /// <summary>Determines if the given person/contact can be added to the link set</summary>
        /// <param name="object">A person or contact object</param>

        // The only restriction is linking two Messenger contacts (from the primary account)
        if (isMessenger(object)) {
            var groupedItems = this._groupedItems;
            for (var i = 0; i < groupedItems.length; i++) {
                var item = /*@static_cast(GroupItemDescriptor)*/groupedItems.getAt(i);
                if (item.group === group.links) {
                    if (isMessenger(/*@static_cast(Object)*/item.person || /*@static_cast(Object)*/item.contact)) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    prototype._reportRejectedLinks = function (rejections) {
        /// <summary>Generates an error message when a contact cannot be linked</summary>
        /// <param name="rejections" type="Array">A set of rejected person/contact objects</param>
        if (rejections.length > 0) {
            var errorMessage = Jx.res.getString("/strings/linking_linkRejectedMultiple");
            if (rejections.length === 1) {
                var displayName = rejections[0].calculatedUIName;
                if (displayName) {
                    errorMessage = Jx.res.loadCompoundString("/strings/linking_linkRejected", displayName);
                }
            }

            var messageBar = this._host.getMessageBar();
            messageBar.addErrorMessage("linkRejection", 10 /* priority */, {
                messageText: errorMessage,
                button2: {
                    text: Jx.res.getString("/strings/linking_linkRejected_button"),
                    tooltip: Jx.res.getString("/strings/linking_linkRejected_button"),
                    callback: function () {
                        messageBar.removeMessage("linkRejection");
                    }
                }
            });
        }

    };

    prototype._changeGroup = function (item, index, newGroup) {
        /// <summary>Moves an item to a different group (e.g. links->suggestions)</summary>
        /// <param name="item">The item to move</param>
        /// <param name="index" type="Number">The current index of that item within groupedItems</param>
        /// <param name="newGroup" type="Number">The group to move the item to</param>
        Debug.assert(Jx.isObject(item), "Invalid parameter: item");
        Debug.assert(Jx.isNumber(index), "Invalid parameter: index");
        Debug.assert(Jx.isNumber(newGroup), "Invalid parameneter: newGroup");
        Debug.assert(this._groupedItems.getAt(index) === item, "Item/index mismatch");
        Debug.assert(item.group !== newGroup, "Attempting to move an item to the group it is already in");
        
        // Newly linked items show up at the bottom of the list.  Newly unlinked items show up at the top of the list.
        // That's the same position: after the last link and before the first suggestion.  Move the item there.  
        var middle = this._getLinkCount(); 
        if (middle > index) { 
            // The ListDataSource needs indices pre-adjusted for shifting
            Debug.assert(item.group === group.links);
            middle--; 
        }
        this._groupedItems.move(index, middle);
        Debug.assert(this._groupedItems.getAt(middle) === item, "Item didn't move as expected");

        // Now switch groups and notify the listview.
        item.group = newGroup;
        this._groupedItems.notifyMutated(middle);
        Debug.assert(this._groupedItems.getAt(middle) === item, "Item moved unexpectedly due to regrouping");
    };

    function makeTemplate(renderFunction, /*@dynamic,@optional*/context) {
        ///<summary>Wraps a function that renders an item into the templating function the ListView requires</summary>
        return function (/*@type(WinJS.Promise)*/itemPromise) {
            return itemPromise.then(function (/*@type(GroupItemRenderInfoDescriptor)*/renderInfo) {
                return renderFunction.call(context, renderInfo.data);
            });
        };
    };

    prototype._renderItem = function (item) {
        /// <summary>Renders a listView item</summary>
        /// <param name="item" type="GroupItemDescriptor"/>
        /// <returns type="HTMLElement"/>
        var element;
        if (item.type === type.pickerLink) {
            element = document.createElement("div");
            element.innerHTML =
                "<div class='profileLink-pickerLink'>" +
                    "<div class='profileLink-pickerGlyph'>\uE109</div>" +
                    "<span class='profileLink-pickerText'>" + Jx.escapeHtml(Jx.res.getString("/strings/linking_choosecontact")) + "</span>" +
                "</div>";
        } else if (item.type === type.progress) {
            element = document.createElement("div");
            element.className = "profileLink-progress";
            element.innerHTML = "<progress class='profileLink-progressSpinner'></progress>";
        } else {
            var factory = (item.group === group.links) ? this._linkedFactory : this._unlinkedFactory;
            var ic = factory.create(this._jobSet);
            ic.setDataContext(/*@static_cast(Object)*/item.contact || /*@static_cast(Object)*/item.person);
            this._identityControls[ic.id] = ic;
            element = ic.getElement();
        }
        return element;
    };

    prototype._disposeElement = function (renderInfo, element) {
        /// <summary>Called when the Listview discards an element (which happens when an item moves between groups).</summary>
        /// <param name="renderInfo"/>
        /// <param name="element" type="HTMLElement"/>
        var id = element.id;
        var ic = this._identityControls[id];
        if (ic) {
            delete this._identityControls[id];
            Jx.dispose(ic);
        }
    };

    function renderGroup(item) {
        /// <summary>Renders a group header</summary>
        /// <param name="item" type="GroupDataDescriptor"/>
        var element = document.createElement("div");
        element.innerText = item.title;
        return element;
    }

    prototype._addLinkedContact = function (contactId) {
        /// <param name="contacts" type="Array"/>
        var rejections = [];
        if (contactId !== this._person.objectId) { // If the user tries to link a person to themselves, ignore it

            // Check whether this person is already in the UI (maybe a suggestion, maybe selected twice from the picker)
            var alreadyPresent = false;
            for (var i = 0; i < this._groupedItems.length; i++) {
                var item = /*@static_cast(GroupItemDescriptor)*/this._groupedItems.getAt(i); 
                var existingPerson = item.person;
                if (Jx.isObject(existingPerson) && existingPerson.objectId === contactId) {
                    alreadyPresent = true;
                    if (item.group !== group.links) {
                        // The person was present, but not linked. Move them to the links group
                        if (this._canLink(existingPerson)) {
                            this._changeGroup(item, i, group.links);
                        } else {
                            rejections.push(existingPerson);
                        }
                    }
                    break;
                }
            }

            if (!alreadyPresent) { 
                // The person wasn't present in the UI. Add them to the top of the links group
                var person = this._platform.peopleManager.tryLoadPerson(contactId);
                if (person) {
                    if (this._canLink(person)) {
                        var middle = this._getLinkCount();
                        this._groupedItems.splice(middle, 0, { type: type.newPerson, group: group.links, person: person });
                    } else {
                        rejections.push(person);
                    }
                }
            }
        }

        this._reportRejectedLinks(rejections);
    };

    prototype._getPersonIdsToLink = function () {
        /// <returns type="Array">The set of person ids that should be linked to this person</returns>
        return this._groupedItems.filter(function (/*@type(GroupItemDescriptor)*/item) {
            return item.group === group.links && item.type === type.newPerson;
        }).map(function (/*@type(GroupItemDescriptor)*/item) {
            return item.person.objectId;
        });
    };

    prototype._getContactIdsToUnlink = function () {
        /// <returns type="Array">The set of contact ids that should be unlinked from this person</returns>
        return this._groupedItems.filter(function (/*@type(GroupItemDescriptor)*/item) {
            return item.group === group.suggestions && item.type === type.existingContact;
        }).map(function (/*@type(GroupItemDescriptor)*/item) { 
            return item.contact.objectId;
        });
    };

    prototype.prepareSuspension = perfContactLinkingAction("prepareSuspension", _prepareSuspensionAction);
    /*@bind(ContactLinkingControl)*/function _prepareSuspensionAction() {
        /// <returns type="Object">The value to pass as the context parameter in the next call to load if the app is terminated</returns>
        return JSON.stringify({
            personIdsToLink: this._getPersonIdsToLink(),
            contactIdsToUnlink: this._getContactIdsToUnlink()
        });
    };

    prototype._onSave = perfContactLinkingAction("onSave", _onSaveAction);
    /*@bind(ContactLinkingControl)*/function _onSaveAction(cmdId, button) {
        if (!this._completeListener) { // We are already saving, don't let the user try again.

            var person = this._person;

            var peopleToLink = this._getPersonIdsToLink();
            var contactsToUnlink = this._getContactIdsToUnlink();
            if (peopleToLink.length === 0 && contactsToUnlink.length === 0) {
                Jx.log.info("No linking requested");
                this._host.back();
            } else {
                Jx.log.info("Managing links for person: " + person.objectId);
                Jx.log.info("Adding links: " + peopleToLink.join(", "));
                Jx.log.info("Removing links: " + contactsToUnlink.join(", "));

                person.addEventListener("changed", this._completeListener = this._onChange.bind(this));
                this._timeout = setTimeout(this._onTimeout.bind(this), 1000);  // We won't wait more than 1 second for contacts to finish linking.

                try {
                    person.manageLinks(peopleToLink, contactsToUnlink);
                } catch (ex) {
                    Jx.log.exception("Linking failed", ex);
                    this._host.back();
                }
            }
        }
    };

    prototype._onChange = function (ev) {
        /// <summary>We wait for the manualLinkCompleted notification before navigating back to the profile page, to avoid 
        /// loading the wrong data and then updating.</summary>
        /// <param name="ev" type="Event"/>
        if (Array.prototype.indexOf.call(ev, "manualLinkCompleted") !== -1) {
            Jx.log.info("Link complete event received, leaving page");
            this._host.back();
        }
    };

    prototype._onTimeout = function () {
        /// <summary>We don't want to wait indefinitely for the manualLinkCompleted event if something goes wrong.</summary>
        Jx.log.warning("Timed out waiting for link complete event, leaving page");
        this._host.back();
    };

    prototype._onCancel = function (cmdId, button) {
        this._host.back();
    };

    ContactLinkingControl.prepareSuggestions = /*@bind(ContactLinkingControl)*/function (person) {
        ///<summary>Primes the suggested links query for later use</summary>
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        Jx.dispose(this._suggestions);
        this._suggestions = new LinkingSuggestions(person);
    };

    ContactLinkingControl.getSuggestions = /*@bind(ContactLinkingControl)*/function (person) {
        ///<summary>Aquires a LinkingSuggestions object for the specified person, taking ownership of the
        /// one created by prepareSuggestions if applicable.</summary>
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        ///<returns type="LinkingSuggestions"/>
        var suggestions = this._suggestions;
        this._suggestions = null;
        if (!suggestions || suggestions.getPersonId() !== person.objectId) {
            Jx.dispose(suggestions);
            suggestions = new LinkingSuggestions(person);
        }
        return suggestions;
    };

    /*@constructor*/function LinkingSuggestions(person) { 
        ///<param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        this._id = person.objectId;
        this._isReady = false;
        this._collection = person.suggestedPeople;
        this._listener = this._onChange.bind(this);
        this._collection.addEventListener("collectionchanged", this._listener);
        this._collection.unlock();
    };
    Jx.augment(LinkingSuggestions, Jx.Events);
    Debug.Events.define(LinkingSuggestions.prototype, "ready");
    LinkingSuggestions.prototype.dispose = function () {
        this._collection.removeEventListener("collectionchanged", this._listener);
        this._collection.dispose();
    };
    LinkingSuggestions.prototype.getPersonId = function () {
        /// <returns type="String"/>
        return this._id;
    };
    LinkingSuggestions.prototype.getResults = function () {
        /// <returns type="Microsoft.WindowsLive.Platform.Collection"/>
        return this._collection; 
    };
    LinkingSuggestions.prototype.isReady = function () {
        /// <returns type="Boolean"/>
        return this._isReady;
    };
    LinkingSuggestions.prototype._onChange = function (ev) {
        /// <param name="ev" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs"/>
        if (ev.eType === Microsoft.WindowsLive.Platform.CollectionChangeType.localSearchComplete) {
            this._isReady = true;
            this.raiseEvent("ready");
        }
    };

});
