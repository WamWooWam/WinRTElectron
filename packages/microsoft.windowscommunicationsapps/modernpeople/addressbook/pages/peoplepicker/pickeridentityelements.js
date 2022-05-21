
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/Platform/PlatformObjectBinder.ref.js"/>
/// <reference path="../../../Shared/ContactForm/Location.js"/>

Jx.delayDefine(People, "PickerIdentityElements", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People; 
    var Elements = P.PickerIdentityElements = {};

    var DisambiguatedProperty = Elements.DisambiguatedProperty = /* @constructor*/function () {
        /// <summary>Constructor</summary>
        this._textNode = null;
        this._selectionManager = /*@static_cast(P.PeopleProvider)*/null;
        this._person = /*@static_cast(P.PersonAccessor)*/null;
        this._types = [];
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    Jx.inherit(DisambiguatedProperty, People.IdentityElements.BaseElement);

    DisambiguatedProperty.prototype.getUI = function (host, locator, /*@dynamic*/options) {
        Debug.assert(Jx.isObject(options));
        Debug.assert(Jx.isArray(options.types));
        Debug.assert(options.types.length > 0);
        this._types = options.types;

        return People.IdentityElements.makeElement(
                "span",
                locator,
                "", // We don't need to add our own CSS style class to this element.
                options,
                " " // Make this a whitespace string, so that Trident generates a TextNode for us. Note: can't be empty.
            );
    };
    DisambiguatedProperty.prototype.clone = function () {
        var clone = new DisambiguatedProperty();
        clone._types = this._types;
        return clone;
    };
    DisambiguatedProperty.prototype.activateUI = function (host, node) {
        ///<param name="host" type="IdentityControlElementHost"/>
        ///<param name="node" type="HTMLElement"/>
        Debug.assert(Jx.isObject(node.firstChild));
        this._textNode = node.firstChild;
        var selectionManager = this._selectionManager = /*@static_cast(SelectionManager)*/host.getSelectionManager();
        selectionManager.addListener("selectionchange", this._updateSelectedProperty, this);
        host.bind(this._reset, this, P.Priority.synchronous);
        host.bind(this._update, this, P.Priority.slowData);
    };
    DisambiguatedProperty.prototype.shutdownUI = function (host) {
        var selectionManager = this._selectionManager;
        if (selectionManager) {
            this._selectionManager = null;
            selectionManager.removeListener("selectionchange", this._updateSelectedProperty, this);
        }
        this._person = null;
    };
    DisambiguatedProperty.prototype._updateSelectedProperty = function (/*@dynamic*/ev) {
        /// <summary>Called when the selection changes, which may mean a change from getSelectedPropertyValue</summary>
        var person = this._person;
        // Ignore selection events when we have no person (recycled) and this wasn't the targeted person
        if (!Jx.isNullOrUndefined(person) && !Jx.isNullOrUndefined(person.getPlatformObject()) && person.objectId === ev.id) {
            this._update(person);
        }
    };
    DisambiguatedProperty.prototype._update = function (person) {
        /// <summary>Called when the person changes or the default value is updated or the selection is changed</summary>
        /// <param name="person" type="P.PersonAccessor"/>
        this._person = person;

        var value = this._selectionManager.getSelectedPropertyValue(person.getPlatformObject());

        var types = this._types;
        for (var i = 0, len = types.length; i < len && !Jx.isNonEmptyString(value); i++) {
            switch (types[i]) {
                case P.PeopleProvider.SupportedPropertyType.email:
                    value = person.mostRelevantEmail;
                    break;
                case P.PeopleProvider.SupportedPropertyType.location:
                    value = getDefaultLocation(person);
                    break;
                case P.PeopleProvider.SupportedPropertyType.phone:
                    value = person.mostRelevantPhone;
                    break;
                default:
                    Debug.assert(false, "Type property '" + types[i] + "' is unknown.");
                    break;
            }
        }

        this._textNode.nodeValue = value || "";
    };
    DisambiguatedProperty.prototype._reset = function (person) {
        this._textNode.nodeValue = "";
    };
    DisambiguatedProperty.prototype.getTooltip = function () {
        return this._textNode.nodeValue;
    };

    function getDefaultLocation(person) {
        /// <summary>Selects the best available location from the person based on P.Location.getBestLocation</summary>
        /// <param name="person" type="P.PersonAccessor"/>
        var fields = P.Contact.createUniqueFields(person.linkedContacts, "mapLocation");
        var locations = fields.map(function (/*@dynamic*/field) { return { value: field.fieldValue }; });
        if (locations.length > 0) {
            var bestLocationEntity = P.Location.getBestLocation(locations);
            var bestLocation = bestLocationEntity ? bestLocationEntity.value : null;
            return P.Location.chooseBestDisplayField(bestLocation);
        }
        return null;
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var Disambiguator = Elements.Disambiguator = /* @constructor*/function (fieldType) {
        /// <summary>Constructor</summary>
        this._selectionManager = null;
        this._disambiguatorNode = null;
        this._fieldType = fieldType;
        this._visible = false;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>
    Disambiguator.prototype._fieldNames = [];

    Jx.inherit(Disambiguator, People.IdentityElements.BaseElement);

    Disambiguator.prototype.getUI = function (host, locator, options) {
        return People.IdentityElements.makeElement(
                    "div",
                    locator,
                    "pp-disambiguatorContainer pp-hidden",
                    options,
                    "<div class='pp-disambiguator'>\uE015</div>" // A down arrow
                );
    };
    Disambiguator.prototype.activateUI = function (host, node) {
        ///<param name="host" type="IdentityControlElementHost"/>
        ///<param name="node" type="HTMLElement"/>
        this._selectionManager = host.getSelectionManager();
        this._disambiguatorNode = node;

        host.bind(this._reset, this, P.Priority.synchronous);
        host.bind(this._onPropertyListChanged, this, P.Priority.slowData);

        node.addEventListener("click", this._onClick.bind(this), false);
    };
    Disambiguator.prototype.shutdownUI = function (host) {
        this._selectionManager = null;
    };
    Disambiguator.prototype._reset = function () {
        if (this._visible) {
            Jx.addClass(this._disambiguatorNode, "pp-hidden");
            this._visible = false;
        }
    };
    Disambiguator.prototype._onPropertyListChanged = function (person) {
        /// <summary>Listener for any of our person's properties this._type changing.</summary>
        /// <param name="person" type="P.PersonAccessor"/>

        // Ensure that if there is only one available property for our
        // current type that we don't display the disambiguator drop-down.
        this._person = person;

        var fields = P.Contact.createUniqueFields(person.linkedContacts, this._fieldType);
        var visible = (fields.length > 1);
        if (visible !== this._visible) {
            this._visible = visible;
            Jx.setClass(this._disambiguatorNode, "pp-hidden", !visible);
        }
    };
    Disambiguator.prototype._createMenuItem = function (property, person) {
        /// <summary>Called to create a new menu item represent a selectable property</summary>
        /// <param name="property" type="String"/>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        /// <returns type="Windows.UI.Popups.UICommand"/>
        var selectionManager = /*@static_cast(SelectionManager)*/this._selectionManager;
        return new Windows.UI.Popups.UICommand(
                    property,
                    function () {
                        selectionManager.setSelectedProperty(property/*property object*/, property/*display value*/, person);
                    });
    };
    Disambiguator.prototype._onClick = function (ev) {
        /// <summary>DOM click-event handler</summary>
        /// <param name="ev" type="Event"/>
        ev.stopPropagation();

        var person = this._person;
        if (person) {
            var fields = P.Contact.createUniqueFields(person.linkedContacts, this._fieldType);
            var properties = fields.map(function (/*@type(_ContactUniqueField)*/field) { return field.fieldValue; });

            var menu = new Windows.UI.Popups.PopupMenu();
            properties.forEach(/*@bind(Disambiguator)*/function (/*@dynamic*/property) {
                var menuItem = this._createMenuItem(property, person.getPlatformObject());
                try {
                    menu.commands.append(menuItem);
                } catch (ex) {
                    // PopupMenu throws when more than 6 items are added.  Don't let that stop the menu
                    // from popping.
                    Jx.log.exception("Error adding menu item", ex);
                }
            }, this);

            if (menu.commands.size > 0) {
                var disambiguatorNode = this._disambiguatorNode;
                var clientBounds = disambiguatorNode.getBoundingClientRect();
                var parentNode = disambiguatorNode.parentNode;

                try {
                    Jx.addClass(parentNode, "menuOpened");
                    menu.showForSelectionAsync({
                        x: clientBounds.left + clientBounds.width,
                        y: clientBounds.top,
                        width: clientBounds.width,
                        height: clientBounds.height
                    }, Windows.UI.Popups.Placement.below).done(function () {
                        Jx.removeClass(parentNode, "menuOpened");
                    }, Jx.fnEmpty);
                } catch (ex) { // The WinRT popup menu isn't the most reliable API ...
                    Jx.log.exception("Failed to show menu", ex);
                }
            }
        }
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var LocationDisambiguator = Elements.LocationDisambiguator = /* @constructor*/function () {
        /// <summary>Constructor</summary>
        Disambiguator.call(this, "mapLocation");
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    Jx.inherit(LocationDisambiguator, Disambiguator);

    LocationDisambiguator.prototype._createMenuItem = function (property, person) {
        /// <summary>Called to create a new menu item represent a selectable property</summary>
        /// <param name="property" type="Microsoft.WindowsLive.Platform.Location"/>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person"/>
        /// <returns type="Windows.UI.Popups.UICommand"/>
        var selectionManager = /*@static_cast(P.PeopleProvider)*/this._selectionManager;
        var bestLocation = P.Location.chooseBestDisplayField(property);
        return new Windows.UI.Popups.UICommand(
                    bestLocation,
                    function () {
                        selectionManager.setSelectedProperty(/*@static_cast(String)*/property, bestLocation, person);
                    });
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var EmailDisambiguator = Elements.EmailDisambiguator = /* @constructor*/function () {
        /// <summary>Constructor</summary>
        Disambiguator.call(this, "email");
    };

    Jx.inherit(EmailDisambiguator, Disambiguator);

    var PhoneNumberDisambiguator = Elements.PhoneNumberDisambiguator = /* @constructor*/function () {
        /// <summary>Constructor</summary>
        Disambiguator.call(this, "tel");
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    Jx.inherit(PhoneNumberDisambiguator, Disambiguator);
});
