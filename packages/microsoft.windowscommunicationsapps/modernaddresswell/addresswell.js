
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(window, "AddressWell", function () {

;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

/// <summary>
/// Defines AddressWell object with constants
/// </summary>
window.AddressWell = {
    badDomains: ";home.com;attbi.com;example.com;hotmail.co;yaho.com;hotmai.com;yahoo.co;yahoomail.com;direcway.com;homail.com;ims-ms-daemon;local.transport;ethome.net.tw;ethome.net.tw;hotmil.com;hotmial.com;yhoo.com;collegeclub.com;sbcglobal.com;hotamil.com;yaoo.com;yahoo.net;yhaoo.com;mail.hotmail.com;passport.com;kimo.com.tw;yahooo.com;yahho.com;ol.com;gateway.net;hotmail.com.mx;otmail.com;htomail.com;aol.co;altavista.com;hotmaill.com;taiwan.com;hotmail.con;ahoo.com;hotmail.om;hotmail.net;hormail.com;hotail.com;hotamail.com;yahoo.om;homtail.com;msn.net;sprint.ca;angelfire.com;cm1.ethome.net.tw;yohoo.com;a0l.com;alo.com;msn.de;gmail.co;",
    dropDownSearchLinkPrefix: "sl",
    dropDownVisibleAttr: "dropDownVisible",
    firstDropDownItemId: "firstDropDownItemId",
    // The following regular expression is derived from Hotmail's implementation and RFC 2822 standard - http://www.ietf.org/rfc/rfc2822.txt and http://www.regular-expressions.info/email.html
    // This regex has two parts:
    // The part before the @ - it can either consists of a series of letters, digits and certain symbols.  The only tweak in our implementation is to allow double quotation marks as a valid symbol.
    // The part after the @ - there are two alternatives.  It can either be a fully qualified domain name, or it can be a literal address between square brackets.  Our implementation is much lenient on what's inside the bracket to accomodate legacy mail clients that might have weird formats.
    emailPattern: /[a-z0-9!#$%&'*+/=?^_`"{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`"{|}~-]+)*@((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[.+\])/i,
    highlightAreaAttr: "highlightArea",
    highlightIdAttr: "highlightId",
    imeInUseKeyCode: 229,
    maxSearchCounter: 1000, // The maximum number for counting search ID
    maxSearchDuration: 60000, // The maximum time to perform search in milliseconds
    maxChildrenLayer: 6, // The maximum number of layers of children under either the input component tree or the drop down component tree.  This number is subject to change if UI changes
    maxConnectedAccountSearchResults: 100,
    maxInputLength: 512,
    maxInputPaneShowing: 800, // The maximum duration in milliseconds we would wait for the touch keyboard to be fully shown
    maxStringLength: 32768,
    maxWordWheelContacts: 10,
    maxSuggestions: 5,
    minProgressDuration: 500, // Minimum time to display the search progress in milliseconds
    pagingHeightForRecipients: 160, // The number of pixels to page up/down inside the container of recipients
    stringsPrefix: "/addresswellstrings/",
    // Valid separators between recipient entries are semicolon, comma, feedline, carriage return, or inverted semicolon for Arabic markets
    separatorRegExp: /[;,\n\r\u061b]+/,
    // The following delimiters are used to determine how to break the string entry into a list of recipients.
    // - Semicolon (;) comma (,), new line (\n), and carriage return (\r) are separators
    // - Quotation mark (") is a name field indicator
    // - Angle brackets (< and >) are email field indicators
    delimiterRegExp: /["<>;,\n\r\u061b]+/,
    colorCssId: "awColorCss",
    dropDownBorderWidthOffset: -2,
    dropdownToContainerWidthPercentage: 0.85
};

// Delay-loaded properties
Object.defineProperties(AddressWell, {
    selectionBiciId: {
        get: function () {
            var value = Microsoft.WindowsLive.Instrumentation.Ids.Mail.addressWellSelectionMade;
            Object.defineProperty(AddressWell, "selectionBiciId", { get: function () { return value; } });
            return value;
        },
        enumerable: true,
        configurable: true
    }
});

Object.defineProperties(AddressWell, {
    addressWellSuggestionRank: {
        get: function () {
            var value = Microsoft.WindowsLive.Instrumentation.Ids.Mail.addressWellSuggestionRank;
            Object.defineProperty(AddressWell, "addressWellSuggestionRank", { get: function () { return value; } });
            return value;
        },
        enumerable: true,
        configurable: true
    }
});

/// <summary>
/// Constants for DOM events and Jx events
/// </summary>
AddressWell.Events = {
    // DOM events
    blur: "blur",
    compositionstart: "compositionstart",  // IME composition events
    compositionend: "compositionend",
    contextmenu: "contextmenu",
    focus: "focus",
    input: "input",
    keydown: "keydown",
    keyup: "keyup",
    msGestureTap: "click", // Please see modern cookbook - MouseInPointer - Current guidance from the HIP team is to use the click event over MSGestureTap.
    msPointerDown: "MSPointerDown",
    msPointerUp: "MSPointerUp",
    msPointerOut: "MSPointerOut",
    msPointerCancel: "MSPointerCancel",
    paste: "paste",
    resize: "resize",
    // Jx events
    addPeopleFromPicker: "addPeopleFromPicker",
    addressWellBlur: "addressWellBlur",
    addressWellCompleteKey: "addressWellCompleteKey",
    addressWellEscapeKey: "addressWellEscapeKey",
    addressWellInitialize: "addressWellInitialize",
    addressWellTabKey: "addressWellTabKey",
    addPerson: "addPerson",
    arrowKey: "arrowKey",
    recipientsSelected: "recipientsSelected",
    dropDownKeyDown: "dropDownKeyDown",
    hasRecipientsChanged: "hasRecipientsChanged",
    pageKey: "pageKey",
    removePerson: "removePerson",
    scrollIntoView: "scrollIntoView",
    searchFirstConnectedAccount: "searchFirstConnectedAccount",
    searchLinkSelected: "searchLinkSelected",
    userInputChanged: "userInputChanged",
    beforeRecipientsAdded: "beforeRecipientsAdded", // Fired to notify the host when recipients are about to be added
    recipientsAdded: "recipientsAdded",        // Fired to notify the host when recipients are added
    recipientRemoved: "recipientRemoved",     // Fired to notify the host when a recipient is deleted
    viewProfile: "viewProfile",
    autoResolve: "autoResolve",
    autoResolveSuccessful: "autoResolveSuccessful",
    showingContextMenu: "showingContextMenu",
    dropDownButtonClick: "dropDownButtonClick",
    selectAllItems: "selectAllItems",
    dropDownReady: "dropDownReady",
    inputOffsetAdjusted: "inputOffsetAdjusted",
    imeWindowHeightUpdated: "imeWindowHeightUpdated"
};

/// <summary>
/// Constants for Recipient events
/// </summary>
AddressWell.RecipientEvents = {
    // DOM events
    deleted: "deleted",
    stateChanged: "stateChanged"
};

/// <summary>
/// Constants for key
/// </summary>
AddressWell.Key = {
    arrowLeft: "Left",
    arrowRight: "Right",
    arrowUp: "Up",
    arrowDown: "Down",
    backspace: "Backspace",
    deleteKey: "Del", /* delete is a reserved word */
    end: "End",
    enter: "Enter",
    escape: "Esc",
    f10: "F10", 
    home: "Home",
    pageUp: "PageUp",
    pageDown: "PageDown",
    selection: "Apps",
    tab: "Tab",
    control: "Control",
    spacebar: "Spacebar",
    x: 'x', 
    c: 'c',
    k: 'k',
    y: 'y',
    z: 'z'
};


// AddressWell public enums

/// <summary>
/// The area currently hosting the highlighted element
/// </summary>
AddressWell.HighlightArea = {
    input: "input",
    dropDown: "dropDown"
};

/// <summary>
/// The view being rendered in drop down
/// </summary>
AddressWell.DropDownView = {
    none: 0,
    peopleSearchList: 1,
    connectedAccountList: 2,
    suggestionsList: 3,
    text: 4,
    progress: 5
};

/// <summary>
/// The recipient adding methods collected for bici
/// </summary>
AddressWell.RecipientAddMethod = {
    tilesView : 0, /* Deprecated */
    wordWheel : 1,
    typing : 2,
    paste : 3,
    contextMenu : 4,
    preFilled: 5,
    peoplePicker: 6,
    galSearch: 7,
    suggestions: 8
};

/// <summary>
/// The type of search for the list view drop down
/// </summary>
AddressWell.ListViewSearchType = {
    people: 0,
    connectedAccount: 1
};

/// <summary>
/// The type of errors from searching contacts on a connected account
/// </summary>
AddressWell.SearchErrorType = {
    none: 0,
    noResults: 1,
    connectionError: 2,
    serverError: 3,
    cancelled: 4
};

/// <summary>
/// Indicates the type of contacts to can be displayed in the well
/// </summary>
AddressWell.ContactSelectionMode = {
    emailContacts: "emailContacts",
    chatContacts: "chatContacts",
    roomContacts: "roomContacts"
};

/// <summary>
/// Possible states of the Recipient object.
/// </summary>
AddressWell.RecipientState = {
    unresolved: 0,
    pendingResolution: 1,
    unresolvable: 2,
    invalid: 3,
    resolved: 4,
    deleted: 5,
};

/// <summary>
/// Types of bottom buttons supported by the DropDown control
/// </summary>
AddressWell.DropDownButtonType = {
    none: 0,
    roomsSelector: 2
};

/// <summary>
/// Types for communicating to the code what sort of suggestion-show requested.
/// </summary>
AddressWell.SuggestionInvocationType = {
    implicit: 0,
    explicit: 1
};

/// <summary>
/// Enum for tracking the user input method used for any given action, e.g. 
/// adding a drop-down recipient.
/// </summary>
AddressWell.InputMethod = {
    unknown: 0,
    keyboard: 1,
    mouseOrTouch: 2
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// This file contains public helper functions that can be consumed by partners,
// as well as internal helper functions that are used by the various components of the control.

AddressWell.getUserTile = function (person, size) {
    /// <summary>
    /// This is a public function that retrieves the IUserTile object to the requested person�s user tile given the size.
    /// Returns null if the tile is not retrievable or does not exist yet.
    /// </summary>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson"> The contacts platform person object to retrieve user tile from</param>
    /// <param name="size" type=" Microsoft.WindowsLive.Platform.UserTileSize"> The size of the desired user tile.  The control will use extraSmall for 40x40, and large for 100 x 100.</param>
    /// <returns type="Microsoft.WindowsLive.Platform.IUserTile">The IUserTile object.  Null if the tile is not retrievable or does not exist yet.</returns>

    if (!Jx.isNullOrUndefined(person)) {
        try {
            return person.getUserTile(size, false /* If true, prevents the platform from doing downloading/scaling for fast retrieval */);
        } catch (e) {
            Jx.fault("AddressWell.AddressWellUtilities.js", "getUserTile", e);
            return null;
        }
    } else {
        return null;
    }
};

AddressWell.getUserTileStream = function (person, size) {
    /// <summary>
    /// This is a public function that retrieves the stream to the requested person�s user tile given the size.
    /// Returns null if the tile is not retrievable or does not exist yet.
    /// This function is needed by partners who generate Quicklinks.
    /// </summary>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson"> The contacts platform person object to retrieve user tile from</param>
    /// <param name="size" type=" Microsoft.WindowsLive.Platform.UserTileSize"> The size of the desired user tile.  The control will use extraSmall for 40x40, and large for 100 x 100.</param>
    /// <returns type="Windows.Storage.Streams.IRandomAccessStream">The random access stream to the tile's file.  Null if the tile is not retrievable or does not exist yet.</returns>

    var userTile = AddressWell.getUserTile(person, size);
    if (!Jx.isNullOrUndefined(userTile)) {
        try {
            return userTile.stream;
        } catch (ex) {
            Jx.log.exception("Failed to execute 'userTile.stream'", ex);
        }
    }

    return null;
};

AddressWell.scrollIntoContainer = function (container, element) {
    /// <summary>
    /// This is an internal function.
    /// Given a scrollable container, and an element that is a child inside the container,
    /// this function auto scrolls the container in order to bring the child element into view.
    /// This function is less invasive than a traditional HTMLElement.scrollIntoView logic 
    /// because it does not scroll the entire page, but scrolls only the container element.
    /// </summary>
    /// <param name="container" type="HTMLElement">The scrollable container that the function would scroll.</param>
    /// <param name="element" type="HTMLElement">The element, which is a child inside the container that wishes to be scrolled into view.</param>

    // Please refer to http://msdn.microsoft.com/en-us/library/ms530302(VS.85).aspx for an overview of a DOM element's dimension properties

    var scrollTop = container.scrollTop;
    var height = container.offsetHeight;
    var elementTop = element.offsetTop;
    var elementBottom = elementTop + element.offsetHeight;

    // Check if the element's top and bottom are both in view
    var isInView = (elementTop >= scrollTop && elementTop <= (scrollTop + height)) &&
                (elementBottom >= scrollTop && elementBottom <= (scrollTop + height));
    if (!isInView) {
        // If either top or bottom is not in view, scroll the container by setting its scrollTop property such that the element's top is in view
        container.scrollTop = element.offsetTop;
    }
};

AddressWell.performPointerAnimation = function (element) {
    /// <summary>
    /// This is an internal function that performs pointer down animation for a given element.
    /// It also attaches listeners to reset the pointer animation when appropriate.
    /// Please see remarks on AddressWell.currentPointerDownElement for more information.
    /// </summary>
    /// <param name="element" type="HTMLElement">The element to receive pointer down animation</param>

    if (!Jx.isNullOrUndefined(element)) {
        WinJS.UI.Animation.pointerDown(element);
        // Saves the element currently receiving pointer down event in order to remove the "pressed" effect later
        AddressWell.currentPointerDownElement = element;

        // Attach pointer up handler on the element to reset the pointer down effect when pointer is released.
        // In addition, attach a pointer out handler to the current element receiving pointer down such that when the pointer
        // moves outside of the element it would reset the pointer down effect.
        // This is necessary in case of panning where a pointer up event is never raised and we can only rely on pointer out event.
        element.addEventListener(AddressWell.Events.msPointerUp, AddressWell.resetPointerElement, false);
        element.addEventListener(AddressWell.Events.msPointerOut, AddressWell.resetPointerElement, false);
    }
};

AddressWell.resetPointerElement = function () {
    /// <summary>
    /// This is an internal function that restores the state of the last saved element 
    /// that is currently receiving pointer down animation by performing a pointer up animation on the element.
    /// Please see remarks on AddressWell.currentPointerDownElement for more information.
    /// </summary>

    if (!Jx.isNullOrUndefined(AddressWell.currentPointerDownElement)) {
        // If there is an element that is getting a pointer down effect, we need to revert that effect manually from the element
        WinJS.UI.Animation.pointerUp(AddressWell.currentPointerDownElement);

        // Remove listeners associated with the element
        AddressWell.currentPointerDownElement.removeEventListener(AddressWell.Events.msPointerUp, AddressWell.resetPointerElement, false);
        AddressWell.currentPointerDownElement.removeEventListener(AddressWell.Events.msPointerOut, AddressWell.resetPointerElement, false);

        // Reset the global variable that is saving the element receiving pointer down effect
        AddressWell.currentPointerDownElement = null;
    }
};

AddressWell.convertSearchErrorToString = function (errorType, accountName) {
    /// <summary>
    /// This is an internal function that converts a given search error type into a string that can be displayed on the drop down.
    /// </summary>
    /// <param name="errorType" type="Number">An AddressWell.ListViewSearchErrorType enum.</param>
    /// <param name="accountName" type="String">The display name for the account being searched on.</param>
    /// <returns type="String">The error string that corresponds to the error type.</returns>

    if (errorType === AddressWell.SearchErrorType.noResults) {
        return Jx.res.getString(AddressWell.stringsPrefix + "awSearchNoResults");
    } else if (errorType === AddressWell.SearchErrorType.connectionError) {
        return Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awSearchConnectionError", accountName);
    } else if (errorType === AddressWell.SearchErrorType.serverError) {
        return Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awSearchServerError", accountName);
    } else {
        Debug.assert(false, "Unexpected call to AddressWell.convertSearchErrorToString with errorType: " + /*@static_cast(String)*/errorType);
        return "";
    }
};

AddressWell.getUserTileUrl = function (person, size) {
    /// <summary>
    /// This is an internal function that retrieves the URL to the requested person�s user tile given the size.
    /// Returns null if the tile is not retrievable or does not exist yet.
    /// </summary>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson"> The contacts platform person object to retrieve user tile from</param>
    /// <param name="size" type=" Microsoft.WindowsLive.Platform.UserTileSize"> The size of the desired user tile.  The control will use extraSmall for 40x40, and large for 100 x 100.</param>
    /// <returns type="String">The string to the URL of the user tile file.  Empty if the tile is not retrievable or does not exist yet.</returns>

    var tileURI = "";
    var userTile = AddressWell.getUserTile(person, size);
    try {
        // Only proceed if the tile has valid properties
        if (!Jx.isNullOrUndefined(userTile) && !Jx.isNullOrUndefined(userTile.appdataURI)) {
            // Using the path as the key to the cache table, check to see if there's a corresponding URL being stored
            tileURI = userTile.appdataURI;
        }
    } catch (e) {
        Jx.fault("AddressWell.AddressWellUtilities.js", "getUserTileUrlFromCache", e);
    }
    return tileURI;
};

// An internal global variable to save the element that is currently receiving pointer down animation.
// This variable is used to determine if the element having pointer down should be reset with a point up effect in these scenarios:
//      1. If the initial pointer down occured inside the UI element and the resulting pointer up ocurred inside the UI element.
//      2. If the initial contact point occured inside the UI element and the terminating contact point ocurred outside the UI element.
//      3. If user starts panning and the DManip component responsible for panning the page will take ownership of the pointer messages and a pointer up event is never raised.
AddressWell.currentPointerDownElement = /* HTMLElement */null;

AddressWell.Color = function (r, g, b) {
    /// <summary>
    /// Creates an instance of AddressWell.color either using a single long value or the individual rgb values.
    /// </summary>
    /// <param name="r" type="Number">numeric red value, 0-255.  Or if this is the only parameter passed in, it is the numeric equivalent of the hex color string.</param>
    /// <param name="g" type="Number" optional="true">numeric green value, 0-255</param>
    /// <param name="b" type="Number" optional="true">numeric blue value, 0-255</param>

    
    if (Jx.isNumber(g) && Jx.isNumber(b)) {
        this._r = r;
        this._g = g;
        this._b = b;
    } else {
        // Convert the numeric value to rgb values
        var numericColor = r;
        this._r = (numericColor >> 16) % 256;
        this._g = (numericColor >> 8) % 256;
        this._b = numericColor % 256;
    }

    // Calculate the hexString version of the color
    var hexR = ("0" + this._r.toString(16)).substr(-2);
    var hexG = ("0" + this._g.toString(16)).substr(-2);
    var hexB = ("0" + this._b.toString(16)).substr(-2);

    this.stringValue = "#" + hexR + hexG + hexB;
};

AddressWell.Color.prototype._r = 0;
AddressWell.Color.prototype._g = 0;
AddressWell.Color.prototype._b = 0;
AddressWell.Color.prototype.stringValue = /*@static_cast(String)*/ null;

AddressWell.Color.combine = function (color1, multiplier1, color2, multiplier2) {
    /// <summary>
    /// Combines two colors using the given multipliers. color2 is optional.
    /// </summary>
    /// <param name="color1" type="AddressWell.Color">The first color to include</param>
    /// <param name="multiplier1" type="Number">Multiplier for the first color</param>
    /// <param name="color2" type="AddressWell.Color" optional="true">The first color to include</param>
    /// <param name="multiplier2" type="Number" optional="true">Multiplier for the first color</param>
    /// <returns type="AddressWell.Color">new color (color param is not modified)</returns>

    var newR = color1._r * multiplier1;
    var newG = color1._g * multiplier1;
    var newB = color1._b * multiplier1;

    // Normally one shouldn't use Boolean with numbers, but for this case we may as well skip the if statement if anything is zero
    if (Boolean(color2) && Boolean(multiplier2)) {
        newR += color2._r * multiplier2;
        newG += color2._g * multiplier2;
        newB += color2._b * multiplier2;
    }

    return new AddressWell.Color(Math.floor(newR), Math.floor(newG), Math.floor(newB));
};

AddressWell.updateColor = function (color) {
    /// <summary>
    /// Sets the color for all AddressWell components on the current page
    /// </summary>
    /// <param name="color" type="Number">numeric color to set (corresponds to hex color string)</param>

    // Any changes to the CSS in this file also need to be propagated to AddressWellColor.css and AddressWellHighContrastColor.css
    // Not everything is duplicated from AddressWellColor; only the things which rely on the appColor.

    var right = Jx.isRtl() ? "left" : "right";

    var appColor = new AddressWell.Color(color);
    var restColor = AddressWell.Color.combine(appColor, 0.20, new AddressWell.Color(255, 255, 255), 0.8); // 80% white overlay on the app color
    var restColorWithHover = AddressWell.Color.combine(restColor, 0.87); // 13% black overlay over rest color
    var selectedColorWithHover = AddressWell.Color.combine(appColor, 0.87); // 13% black overlay over appColor

    var appColorString = appColor.stringValue;
    var restColorString = restColor.stringValue;
    var restColorWithHoverString = restColorWithHover.stringValue;
    var selectedColorWithHoverString = selectedColorWithHover.stringValue;


    // CSS is wrapped in a media type declaration that excludes high-contrast, rather than trying to detect that here.
    var addressWellCss = '@media screen and (-ms-high-contrast: none) {' +

        // The style for the outer container when the entire control is reciving focus such that the user is intereacting with it
        '.aw-inputOuterContainer.aw-focus { border: 2px solid ' + appColorString + '; }' +

        // The style for a recipient element (also hover state while disabled)
        '.aw-inputContainer .aw-recipientInner, .aw-root[aria-disabled="true"] .aw-inputContainer .aw-recipientInner:hover {' +
            'background-color: ' + restColorString + ';' +
        '}' +

        // The style for a recipient in hover state
        '.aw-inputContainer .aw-recipientInner:hover {' +
            'background-color: ' + restColorWithHoverString + ';' +
        '}' +

        // The style for a highlighted, resolved recipient in rest state
        '.aw-inputContainer .aw-resolved.aw-inputHL .aw-recipientInner {' +
            'background-color: ' + appColorString + ';' +
        '}' +

        // The style for a highlighted, resolved recipient in hover state
        '.aw-inputContainer .aw-resolved.aw-inputHL .aw-recipientInner:hover {' +
            'background-color: ' + selectedColorWithHoverString + ';' +
        '}' +

        // The style for a highlighted, unresolved recipient in rest state
        '.aw-inputContainer .aw-unresolved.aw-inputHL .aw-recipientInner:hover {' +
            'background-color: ' + selectedColorWithHoverString + ';' +
            'border: 1px solid ' + selectedColorWithHoverString + ';' +
        '}' +

        // The style for a highlighted, unresolved recipient in hover state
        '.aw-inputContainer .aw-unresolved.aw-inputHL .aw-recipientInner {' +
            'background-color: ' + appColorString + ';' +
            'border: 1px solid ' + appColorString + ';' +
        '}' +

        // The following styles are hover and selected state for word-wheel list view items
        'ul.aw-ddl li:hover {' +
            'background-color: ' + restColorWithHoverString + ';' +
        '}' +

        'ul.aw-ddl li[aria-selected="true"] {' +
            'background-color: ' + appColorString + ';' +
        '}' +

        // The progress control
        'ul.aw-ddp progress {' +
            'color: ' + appColorString + ';' +
        '}' +
    
        // Border on tile when it is checked, such that the border color matches the check mark background
        '.aw-ddTileItem[aria-checked="true"] .aw-tileBorder {' +
            'border-color:' + appColorString + ';' +
        '}' +

        // Border on tile when it is checked and is being mouse hovered or navigated to, such that the border color matches the check mark background
        '.aw-ddTileItem[aria-checked="true"]:hover .aw-tileBorder,' +
        '.aw-ddTileItem[aria-checked="true"][aria-selected="true"] .aw-tileBorder {' +
            'border-color: ' + selectedColorWithHoverString + ';' +
        '}' +

        // Border on tile when it is unchecked and is being mouse hovered or navigated to
        '.aw-ddTileItem[aria-checked="false"]:hover .aw-tileBorder,' +
        '.aw-ddTileItem[aria-checked="false"][aria-selected="true"] .aw-tileBorder {' +
            'border-color: ' + restColorWithHoverString + ';' +
        '}' +

        // The check mark's triangle background style.
        // These styles are based off .win-selection-background
        '.aw-checkedBackground {' +
            'border-top-color: ' + appColorString + ';' +
            'border-' + right + '-color: ' + appColorString + ';' +
        '}' +

        // Background for the check mark image when the tile is being mouse hovered or navigated to.
        // These styles are based off .win-listView .win-hover .win-selection-background.
        '.aw-ddTileItem:hover .aw-checkedBackground,' +
        '.aw-ddTileItem[aria-selected="true"] .aw-checkedBackground {' +
            'border-top-color: ' + selectedColorWithHoverString + ';' +
            'border-' + right + '-color: ' + selectedColorWithHoverString + ';' +
        '}' +

        // Style for the drop-down buttons

        // Hover state
        '.aw-inputOuterContainer.aw-focus + .aw-ddContainer .aw-ddbutton:hover {' +
            'background-color: ' + restColorWithHoverString + ';' +
        '}' +

        // Pressed / focus state
        '.aw-inputOuterContainer.aw-focus + .aw-ddContainer .aw-ddbutton:active {' +
            'background-color: ' + selectedColorWithHoverString + ';' +
        '}' +
    '}';

    var styleElement = /*@static_cast(HTMLStyleElement)*/document.getElementById(AddressWell.colorCssId);
    if (!styleElement) {
        styleElement = /*@static_cast(HTMLStyleElement)*/document.createElement("style");
        styleElement.type = "text/css";
        styleElement.id = AddressWell.colorCssId;
        document.head.appendChild(styleElement);
    }

    styleElement.innerHTML = "";
    styleElement.appendChild(document.createTextNode(addressWellCss));
};

AddressWell.markStart = function (eventName) {
    ///<summary>
    /// Records a profiling start point for the given event
    ///</summary>
    ///<param name="eventName" type="String">Name of the event</param>

    Jx.mark("AddressWell." + eventName + ",StartTA,AddressWell");
};

AddressWell.markStop = function (eventName) {
    ///<summary>
    /// Records a profiling stop point for the given event
    ///</summary>
    ///<param name="eventName" type="String">Name of the event</param>

    Jx.mark("AddressWell." + eventName + ",StopTA,AddressWell");
};

AddressWell.scrollIntoViewIfNotInView = function (element, checkTop, scrollableElement) {
    /// <summary>
    /// First determines if a given element is in view where its top or bottom is displayed on screen.
    /// Then scrolls into view if the element is not in view.
    /// </summary>
    /// <param name="element" type="HTMLElement">A given DOM element.</param>
    /// <param name="checkTop" type="Boolean">
    /// True if the function needs to ensure the element's top is in view.
    /// False if the function needs to ensure the element's bottom is in view.
    /// </param>
    /// <param name="scrollableElement" type="HTMLElement">The parent scrollable element.</param>

    AddressWell.markStart("scrollIntoViewIfNotInView");

    // If the caller has set ensuredFocusedElementInView = true we need a more accurate height of the view port by taking the minimum of the following values
    var viewPortHeight = Math.min(window.innerHeight, scrollableElement.offsetHeight);

    // Screen total height = viewPortHeight
    // Note: If there's a window.pageYOffset value, it indicates that the page is shifted by the touch keyboard, which adds to the element's top value.
    //       We need to subtract it from the element's top value in order to get the element's top coordinate from the visible region.
    //       From marakow: We have the concept of two viewports when the keyboard is up or when optically zoomed.  We call these the layout view port and the visual viewport.
    //                     window.* refers to the visual viewport, while document.documentElement.* refers to the layout viewport.
    //                     We need to take both of these into account when calculating DOM values in Trident.
    // Element's distance away from the top of screen (regardless of scrollbar) = element.getBoundingClientRect().top + document.documentElement.scrollTop - window.pageYOffset
    // Element's total height = element.offsetHeight
    // Element's y coordinate on screen = distance away from the top of screen + element's height (which is 0 if we only care about the top of the element being in view)

    var heightForCalculation = checkTop ? 0 : element.offsetHeight;

    // getBoundingClientRect throws Unspecified Error if the DOM has been modified from other sources
    try {
        var elementYCoordinate = (element.getBoundingClientRect().top + document.documentElement.scrollTop - window.pageYOffset) + heightForCalculation;

        // Element is in view only if its y coordinate is on screen
        var isInView = (elementYCoordinate >= 0) && (elementYCoordinate <= viewPortHeight);

        if (!isInView) {
            element.scrollIntoView(checkTop);
        }
    } catch (e) {
        // Log the error and don't do anything
        Jx.log.exception("Error in AddressWell.Controller._scrollIntoViewIfNotInView", e);
    }
    AddressWell.markStop("scrollIntoViewIfNotInView");
};

AddressWell.isEmailValid = function (email) {
    /// <summary>
    /// Verifies whether a given email string is in a valid format.
    /// </summary>
    /// <param name="email" type="String">The email to validate against.</param>
    /// <returns type="Boolean">True if email is valid.</returns>

    // This regex validation is taken from Hotmail's AutoComplete.js
    // Also verify that there's only one occurrence of @ symbol
    return (AddressWell.emailPattern.test(email) && (email.indexOf("@") === email.lastIndexOf("@")));
};

AddressWell.isEmailDomainValid = function (email) {
    /// <summary>
    /// Verifies whether a given email string contains a valid domain.
    /// </summary>
    /// <param name="email" type="String">The email to validate against.</param>
    /// <returns type="Boolean">True if email does not contain any known bad domain.</returns>

    var pass = true;

    // This logic along with the bad domain list are taken from Hotmail's AutoComplete.js
    var posLeft = email.indexOf("@");
    var domain = "";
    if (posLeft > -1) {
        domain = email.substring(posLeft + 1);
        pass = (AddressWell.badDomains.indexOf(";" + domain.toLowerCase() + ";") === -1);
    }
    return pass;
};

AddressWell.isEmailAndDomainValid = function (email) {
    /// <summary>
    /// Verifies whether a given email string is in a valid format and contains a valid domain.
    /// </summary>
    /// <param name="email" type="String">The email to validate against.</param>
    /// <returns type="Boolean">True if email and its domains are valid.</returns>

    return (AddressWell.isEmailValid(email) && AddressWell.isEmailDomainValid(email));
};

AddressWell.isPossibleAlias = function (email) {
    /// <summary>
    /// Check whether a given string looks like it could be a valid email alias.
    /// </summary>
    /// <param name="email" type="String">The alias to check.</param>
    /// <returns type="Boolean"/>
    var regex = /^[^@\s()]+$/i;
    return regex.test(email); 
};


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

AddressWell.Contact = /* @constructor */function (person, recipients, tile) {
    /// <summary>
    /// Constructor for the AddressWell.Contact class.
    /// This object is being used in the tile view and the list view in the drop down.
    /// </summary>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson">The associated person object with the contact.</param>
    /// <param name="recipients" type="Array">An array of IRecipient objects associated with the contact.</param>
    /// <param name="tile" type="String">Tile of the contact, which points to an image path that can be set on the &lt;img&gt; element's src attribute.</param>
    
    this.person = person;
    this.recipients = recipients;
    this.tile = tile;
};

// Public variables
AddressWell.Contact.prototype.person = null;
AddressWell.Contact.prototype.recipients = null;
AddressWell.Contact.prototype.tile = "";
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

/*jshint browser:true*/
/*global msSetImmediate,Windows,WinJS,Debug,NoShip,Jx,AddressWell*/

AddressWell.Input = /* @constructor */function (idPrefix, recipients, contactsPlatform, log, hintText, allowViewProfile) {

    /// <summary>
    /// Constructor for the AddressWellInput class.
    /// </summary>
    /// <param name="idPrefix" type="String">
    /// HTML element id prefix for the control.
    /// </param>
    /// <param name="recipients" type="Array">
    /// An array of AddressWell.Recipient objects.
    /// </param>
    /// <param name="contactsPlatform" type="Microsoft.WindowsLive.Platform.Client">
    /// This is the contacts platform's object of type Microsoft.WindowsLive.Platform.Client.
    /// It is passed in by the hosting app since contacts platform is created only once per instance of WWAHost process, 
    /// and there can be multiple address well controls on the same page.
    /// </param>
    /// <param name="log" type="Jx.Log">
    /// The Jx.Log instance
    /// </param>
    /// <param name="hintText" type="String">
    /// Text to be shown in the address well intially when the control is empty.  Caller is required to passed in localized text.
    /// </param>
    /// <param name="allowViewProfile" type="Boolean">
    /// This determines whether the "view profile" option will be available in the context menu.
    /// </param>

    // Verify that idPrefix is not null or empty string
    Debug.assert(Jx.isArray(recipients));
    if (!Jx.isNonEmptyString(idPrefix)) {
        throw new Error("idPrefix parameter must be not null and non empty");
    }

    this._containerId = idPrefix + "C";
    this._inputFieldId = idPrefix + "IF";
    this._listId = idPrefix + "L";
    this._scrollToId = idPrefix + "IScroll";
    this._recipients = recipients || [];
    this._log = log;
    this._recipientTemplate = /*@static_cast(HTMLElement)*/null;
    this._platform = contactsPlatform;
    this._parser = new AddressWell.RecipientParser(contactsPlatform, log);

    this._hintText = hintText;
    this._allowViewProfile = allowViewProfile;

    this.initComponent();
    this._id = idPrefix + "OC"; // This is needed by Jx to remove UI from DOM.
    this._itemIdBase = idPrefix + "R";

    // Set up the highlighted area attribute
    this.attr(AddressWell.highlightAreaAttr, { changed: this._highlightAreaChanged });
    this.attr(AddressWell.highlightIdAttr, { changed: this._highlightIdChanged });
    // The component is data bound to drop down's visible attribute
    this.attr(AddressWell.dropDownVisibleAttr, { changed: this._dropDownVisibilityChanged });
    this.attr(AddressWell.firstDropDownItemId);

    // Define events that this component can trigger.
    // Events are used for simple direct firing.  This is much faster than routing direct events via EventManager.
    Debug.Events.define(/* @static_cast(Object) */this,
                        AddressWell.Events.addPerson,
                        AddressWell.Events.addressWellEscapeKey,
                        AddressWell.Events.addressWellCompleteKey,
                        AddressWell.Events.addressWellTabKey,
                        AddressWell.Events.arrowKey,
                        AddressWell.Events.autoResolve,
                        AddressWell.Events.hasRecipientsChanged,
                        AddressWell.Events.pageKey,
                        AddressWell.Events.recipientsAdded, 
                        AddressWell.Events.recipientRemoved,
                        AddressWell.Events.scrollIntoView,
                        AddressWell.Events.searchFirstConnectedAccount,
                        AddressWell.Events.userInputChanged,
                        AddressWell.Events.viewProfile,
                        AddressWell.Events.showingContextMenu,
                        AddressWell.Events.focus,
                        AddressWell.Events.msGestureTap,
                        AddressWell.Events.inputOffsetAdjusted,
                        AddressWell.Events.imeWindowHeightUpdated);
};

// Defines this class as a component.
Jx.augment(AddressWell.Input, Jx.Component);
Jx.augment(AddressWell.Input, Jx.Events);

// Member variables
AddressWell.Input.prototype._containerId = "";
AddressWell.Input.prototype._inputFieldId =  "";
AddressWell.Input.prototype._listId = "";
AddressWell.Input.prototype._rootElement = /* @static_cast(HTMLElement) */null;
AddressWell.Input.prototype._containerElement = /* @static_cast(HTMLElement) */null;
AddressWell.Input.prototype._inputElement = /* @static_cast(HTMLElement) */null;
AddressWell.Input.prototype._recipients = /* @static_cast(Array) */null;
AddressWell.Input.prototype._numPrefilled = 0;
AddressWell.Input.prototype._highlightIndex = -1;
AddressWell.Input.prototype._highlightClass = "aw-inputHL";
AddressWell.Input.prototype._focusClass = "aw-focus";
AddressWell.Input.prototype._uiInitialized = false; // Indicates whether the UI is available
AddressWell.Input.prototype._itemIdBase = ""; // Unique ID base used to construct recipient element ID
AddressWell.Input.prototype._log = /* @static_cast(Jx.Log) */null;
AddressWell.Input.prototype._previousInputValue = ""; // A variable to save up the last known input value
AddressWell.Input.prototype._hintText = ""; // Text to be shown in the address well intially when the control is empty
AddressWell.Input.prototype._allowViewProfile = false; // Whether to show the "view profile" option in the context menu
AddressWell.Input.prototype._cachedContainerWidth = 0; // Cached value to store the width of the container
AddressWell.Input.prototype._imeActive = false; // Indicates whether the IME is active. If is is, we shouldn't modify the input value.
AddressWell.Input.prototype._isDisabled = false;
AddressWell.Input.prototype._parser = /* @static_cast(AddressWell.RecipientParser) */null;
AddressWell.Input.prototype._platform = /* @static_cast(Microsoft.WindowsLive.Platform.Client) */null;
AddressWell.Input.prototype._biciRecipientAddMethod = -1;
AddressWell.Input.prototype._searchOnEnter = false;
AddressWell.Input.prototype._cachedInputOffsetLeft = 0;
AddressWell.Input.prototype._isAnimating = false;

// Saved for removeEventListener
AddressWell.Input.prototype._containerClick = /* @static_cast(Function) */null; // Bound method for _containerClickHandler
AddressWell.Input.prototype._inputContextMenu = /* @static_cast(Function) */null; // Bound method for _inputContextMenuHandler
AddressWell.Input.prototype._containerContextMenu = /* @static_cast(Function) */null; // Bound method for _containerContextMenuHandler
AddressWell.Input.prototype._containerPointerDown = /* @static_cast(Function) */null; // Bound method for containerPointerDownHandler
AddressWell.Input.prototype._containerKeyDown = /* @static_cast(Function) */null; // Bound method for containerKeyDownHandler
AddressWell.Input.prototype._inputKeyDown = /* @static_cast(Function) */null; // Bound method for _inputKeyDownHandler
AddressWell.Input.prototype._inputPaste = /* @static_cast(Function) */null; // Bound method for _inputPasteHandler
AddressWell.Input.prototype._inputFocus = /* @static_cast(Function) */null; // Bound method for _inputFocusHandler
AddressWell.Input.prototype._inputChange = /* @static_cast(Function) */null; // Bound method for _inputChangeHandler
AddressWell.Input.prototype._imeStart = /*@static_cast(Function)*/null; // Bound method for _imeStartHandler
AddressWell.Input.prototype._imeEnd = /*@static_cast(Function)*/null; // Bound method for _imeEndHandler
AddressWell.Input.prototype._msCandidateWindowShow = /*@static_cast(Function)*/null; // Bound method for _msCandidateWindowShowHandler
AddressWell.Input.prototype._msCandidateWindowHide = /*@static_cast(Function)*/null; // Bound method for _msCandidateWindowHideHandler

// Public variables
AddressWell.Input.prototype.isDirty = false; // Indicates whether a change has occurred in the address well

AddressWell.Input.prototype.getUI = function (ui) {
    /// <summary>
    /// Constructs the UI object for this component.
    /// </summary>
    /// <param name="ui" type="JxUI">The UI object to set properties on.</param>

    var placeHolderHtml = "";
    if (Jx.isNonEmptyString(this._hintText) && !this._isDisabled) {
        placeHolderHtml = ' placeholder="' + Jx.escapeHtmlToSingleLine(this._hintText) + '" ';
    }

    var disabledAttribute = "";
    var ariaDisabledAttribute = "";

    if (this._isDisabled) {
        disabledAttribute = ' disabled="disabled"';
        ariaDisabledAttribute = ' aria-disabled="true"';
    }

    ui.html =
            '<div class="aw-inputOuterContainer" id="' + this._id + '" tabindex="-1">' +
                /* Note: We set 'aria-controls' of the container with the Id of the input element so that the on-screen keyboard
                   will not dismiss when the container gets focus. */
                '<div id="' + this._containerId + '" class="aw-inputContainer" role="listbox" aria-controls="' + this._inputFieldId + '">' +
                    '<input id="' + this._inputFieldId + '" size="1" type="email" maxlength = "' + AddressWell.maxInputLength.toString() + '" role="textbox" aria-autocomplete="list" aria-controls="' + this._listId + '" aria-required="true"' + placeHolderHtml + disabledAttribute + '/>' +
                '</div>' +
                '<div class="aw-inputScrollTo" id="' +  this._scrollToId + '"></div>' +
            '</div>';
};

AddressWell.Input.prototype.activateUI = function () {
    /// <summary>
    /// Logic after UI has been initialized
    /// </summary>
    var me = this;

    Jx.Component.prototype.activateUI.call(me);

    if (!this._uiInitialized) {
        me._rootElement = document.getElementById(me._id);
        me._containerElement = document.getElementById(me._containerId);
        me._inputElement = document.getElementById(me._inputFieldId);

        // Bind event handlers (I would like to switch the other handlers as well but that refactor can happen later)
        this.focus = AddressWell.Input.prototype.focus.bind(this);

        // Attach listeners to the entire container
        me._containerClick = me._containerClickHandler.bind(me);
        me._rootElement.addEventListener(AddressWell.Events.msGestureTap, me._containerClick, false);

        me._containerContextMenu = me._containerContextMenuHandler.bind(me);
        me._rootElement.addEventListener(AddressWell.Events.contextmenu, me._containerContextMenu, true);

        me._containerPointerDown = me._containerPointerDownHandler.bind(me);
        me._rootElement.addEventListener(AddressWell.Events.msPointerDown, me._containerPointerDown, false);

        me._containerKeyDown = me.containerKeyDownHandler.bind(me);
        me._rootElement.addEventListener(AddressWell.Events.keydown, me._containerKeyDown, false);

        // Attach listeners to the input field element

        // Listens for keydown event
        me._inputKeyDown = me._inputKeyDownHandler.bind(me);
        me._inputElement.addEventListener(AddressWell.Events.keydown, me._inputKeyDown, false);

        // Listens for input event, which occurs when the text content is changed
        me._inputChange = me._inputChangeHandler.bind(me);
        me._inputElement.addEventListener(AddressWell.Events.input, me._inputChange, false);

        // Listens for paste event.
        me._inputPaste = me._inputPasteHandler.bind(me);
        me._inputElement.addEventListener(AddressWell.Events.paste, me._inputPaste, false);

        // Listens for focus event.
        me._inputFocus = me._inputFocusHandler.bind(me);
        me._inputElement.addEventListener(AddressWell.Events.focus, me._inputFocus, false);

        // Listens for the IME composition events, which will allow us to keep track of whether the IME is active.
        me._imeStart = me._imeStartHandler.bind(me);
        me._imeEnd = me._imeEndHandler.bind(me);
        me._inputElement.addEventListener(AddressWell.Events.compositionstart, me._imeStart, false);
        me._inputElement.addEventListener(AddressWell.Events.compositionend, me._imeEnd, false);

        // Listens for the IME window show/hide events, which will allow us to position dropdown list accordingly.
        if (me._inputElement.msGetInputContext && me._inputElement.msGetInputContext()) {
            var context = me._inputElement.msGetInputContext();
            me._msCandidateWindowShow = me._msCandidateWindowShowHandler.bind(me);
            me._msCandidateWindowHide = me._msCandidateWindowHideHandler.bind(me);
            context.addEventListener("MSCandidateWindowShow", me._msCandidateWindowShow);
            context.addEventListener("MSCandidateWindowHide", me._msCandidateWindowHide);
        }

        me._inputContextMenu = me._inputContextMenuHandler.bind(me);
        me._inputElement.addEventListener(AddressWell.Events.contextmenu, me._inputContextMenu, false);

        // Set initial value for attributes
        me.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        if (this._recipients.length > 0) {
            // Append recipients to the DOM
            me._addRecipientsHtml(this._recipients);
        }

        this._uiInitialized = true;
    }
};

AddressWell.Input.prototype.deactivateUI = function () {
    /// <summary>
    /// Logic to detach component from UI interaction.
    /// </summary>

    Jx.Component.prototype.deactivateUI.call(this);

    if (this._uiInitialized) {
        // Remove event listeners
        this._rootElement.removeEventListener(AddressWell.Events.msGestureTap, this._containerClick, false);
        this._rootElement.removeEventListener(AddressWell.Events.contextmenu, this._containerContextMenu, false);
        this._rootElement.removeEventListener(AddressWell.Events.msPointerDown, this._containerPointerDown, false);
        this._rootElement.removeEventListener(AddressWell.Events.keydown, this._containerKeyDown, false);
        this._inputElement.removeEventListener(AddressWell.Events.keydown, this._inputKeyDown, false);
        this._inputElement.removeEventListener(AddressWell.Events.input, this._inputChange, false);
        this._inputElement.removeEventListener(AddressWell.Events.paste, this._inputPaste, false);
        this._inputElement.removeEventListener(AddressWell.Events.focus, this._inputFocus, false);
        this._inputElement.removeEventListener(AddressWell.Events.compositionstart, this._imeStart, false);
        this._inputElement.removeEventListener(AddressWell.Events.compositionend, this._imeEnd, false);
        if (Jx.isFunction(this._msCandidateWindowShow) && this._inputElement.msGetInputContext) {
            var context = this._inputElement.msGetInputContext();
            if (context) {
              context.removeEventListener("MSCandidateWindowShow",this._msCandidateWindowShow);
              context.removeEventListener("MSCandidateWindowHide", this._msCandidateWindowHide);
            }
        }
        this._inputElement.removeEventListener(AddressWell.Events.contextmenu, this._inputContextMenu, false);

        // Null out bound event handlers
        this.focus = null;
        this._containerClick = null;
        this._inputContextMenu = null;
        this._containerContextMenu = null;
        this._containerPointerDown = null;
        this._containerKeyDown = null;
        this._inputKeyDown = null;
        this._inputPaste = null;
        this._inputFocus = null;
        this._inputChange = null;
        this._imeStart = null;
        this._imeEnd = null;
        this._msCandidateWindowShow = null;
        this._msCandidateWindowHide = null;

        this._uiInitialized = false;
    }
};

AddressWell.Input.prototype.isImeActive = function () {
    /// <summary>
    /// Returns if IME is currently active.
    /// </summary>
    return this._imeActive;
};

AddressWell.Input.prototype.getUserInput = function () {
    /// <summary>
    /// Gets the current value of user input.
    /// </summary>
    /// <returns type="String">The current string value of user input.</returns>

    return this._inputElement.value;
};

AddressWell.Input.prototype.finalizeInput = function () {
    /// <summary>
    /// Finalize the current value of user input when IME is active.
    /// </summary>
    
    // This line of code forces finalizing input and dismiss IME without the user input (such as enter key or making a selection in IME window).
    this._inputElement.value = this._inputElement.value;
};

AddressWell.Input.prototype.getAriaControlledId = function () {
    /// <summary>
    /// Gets the ID of the element that is controlled by the AddressWell.DropDown
    /// </summary>

    return this._inputFieldId;
};

AddressWell.Input.prototype.setAriaControls = function (id) {
    /// <summary>
    /// Given the ID of the appropriate region, sets aria-controls on the element that can change the dropdown.
    /// </summary>
    /// <param name="id" type="String">ID of the region in the dropdown that can be changed by the input</param>

    this._inputElement.setAttribute("aria-controls", id);
};

AddressWell.Input.prototype.setAriaFlow = function(flowFrom, flowTo) {
    /// <summary>
    /// Gives the IDs for the elements, outside the AddressWell that should be used and the aria-flowto and aria-flowfrom 
    /// properties for the first and last navigatable items, respectively.
    /// </summary>
    /// <param name="flowFrom" type="String">The ID of the navigable element immediately before the AddressWell</param>
    /// <param name="flowTo" type="String">The ID of the navigable element immediately after the AddressWell</param>
    Debug.assert(Jx.isNonEmptyString(flowFrom));
    Debug.assert(Jx.isNonEmptyString(flowTo));

    this._ariaFlowFrom_external = flowFrom;
    this._ariaFlowTo_external = flowTo;
}

AddressWell.Input.prototype.getRootElement = function () {
    /// <summary>
    /// Returns the root element for the component.
    /// </summary>
    /// <returns type="HTMLElement">Returns the root element</returns>
    return this._rootElement;
};

AddressWell.Input.prototype.hasFocus = function () {
    /// <summary>
    /// Determines whether the input field has focus
    /// </summary>
    /// <returns type="Boolean">Whether the control has focus</returns>

    return !Jx.isNullOrUndefined(document.activeElement) && document.activeElement.id === this._inputFieldId;
};

AddressWell.Input.prototype.setDisabled = function (disabled) {
    /// <summary>
    /// Disables or enables the control.
    /// </summary>
    /// <param name="disabled" type="Boolean">True-disable, False-enable</param>
    
    if (this.hasUI()) {
        var inputElement = this._inputElement;
        if (disabled) {
            inputElement.setAttribute("disabled", "disabled");
            inputElement.placeholder = "";
        } else {
            inputElement.removeAttribute("disabled");
            if (!this.isDirty && Jx.isNonEmptyString(this._hintText)) {
                inputElement.placeholder = this._hintText;
            }
        }
        this._containerElement.setAttribute("aria-disabled", String(disabled));
        
    }

    this._isDisabled = disabled;
};

AddressWell.Input.prototype.setSearchOnEnter = function (searchOnEnter) {
    /// <summary>
    /// Enable/disable the search-on-enter functionality.
    /// </summary>
    /// <param name="searchOnEnter" type="Boolean"/>
    this._searchOnEnter = searchOnEnter;
};

AddressWell.Input.prototype.getInputElementId = function () {
    /// <summary>
    /// Gets the id to the HTML input element.
    /// </summary>
    /// <returns type="String">The id of the HTML input element</returns>

    return this._inputFieldId;
};

AddressWell.Input.prototype.getRecipients = function (onlyPlatformRecipients) {
    /// <summary>
    /// Returns an array of IRecipient objects.
    /// </summary>
    /// <param name="onlyPlatformRecipients" type="Boolean">True if the caller only wants WinRT-created recipients suitable for passing to the platform.</param>
    /// <returns type="Array">An array of IRecipient objects.</returns>

    // Javascript arrays are not immutable so we are returning a new array set here so the caller would not modify its internal state.
    var recipients = [];
    for (var i = 0; i < this._recipients.length; i++) {
        var recipient = /*@static_cast(AddressWell.Recipient)*/this._recipients[i];
        /// We aren't currently declaring isJsRecipient
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        if (!Jx.isNullOrUndefined(recipient) && (!onlyPlatformRecipients || !recipient.isJsRecipient)) {
            recipients.push(recipient.internalRecipient);
        }
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    }
    return recipients;
};

AddressWell.Input.prototype.getRecipientsStringInNameEmailPairs = function () {
    /// <summary>
    /// Returns the recipients in a string of name/email pairs in the format of <![CDATA["Display Name" <email@email.com>; <noName@email.com>;]]>.
    /// This string is used to interface with Mail API.
    /// </summary>
    /// <returns type="String">
    /// Returns a single string.
    /// </returns>

    var resultString = '';
    var /* @type(Microsoft.WindowsLive.Platform.IRecipient) */recipient = null;
    var recipients = /*AddressWell.Recipient*/this._recipients;
    for (var i = 0, count = recipients.length; i < count; i++) {
        recipient = recipients[i];
        if (recipient) {
            resultString += recipient.toString();
        }
    }
    return resultString;
};

AddressWell.Input.prototype.getError = function () {
    /// <summary>
    /// Gets the error string to display if there is an error to show.
    /// </summary>
    /// <returns type="String">Returns the localized error string if there is an error to show, null otherwise.</returns>
    
    // Ensures that existing user input is completed
    this.completeUserInput(false /* We don't need to display tile view */);

    var recipients = this._recipients.filter(function (item) {
        return (item !== null);
    });

    if (recipients.length === 0) {
        return Jx.res.getString(AddressWell.stringsPrefix + "awErrorEmpty");
    }
    if (this.getRecipientsStringInNameEmailPairs().length >= AddressWell.maxStringLength) {
        return Jx.res.getString(AddressWell.stringsPrefix + "awErrorMaximum"); 
    }
    for (var i = 0; i < recipients.length; i++) {
        var recipient = /*@static_cast(AddressWell.Recipient)*/recipients[i];
        if (recipient.state === AddressWell.RecipientState.invalid) {
            return Jx.res.getString(AddressWell.stringsPrefix + "awErrorInvalid");
        } else if (recipient.state === AddressWell.RecipientState.pendingResolution) {
            return Jx.res.getString(AddressWell.stringsPrefix + "awErrorResolutionsPending");
        } else if (recipient.state === AddressWell.RecipientState.unresolvable ||
                   recipient.state === AddressWell.RecipientState.unresolved) {
            return Jx.res.getString(AddressWell.stringsPrefix + "awErrorUnresolvableRecipients");
        }
    }
    return null;
};

AddressWell.Input.prototype.clear = function () {
    /// <summary>
    /// Removes all the recipients and resets the state of the control.
    /// </summary>

    this.clearHighlight();

    for (var i = 0, len = this._recipients.length; i < len; i++) {
        var recipient = /*@static_cast(AddressWell.Recipient)*/this._recipients[i];
        if (recipient) {
            recipient.item.removeNode(true);
            recipient.setDeleted();
        }
    }

    this._recipients = [];
    this._numPrefilled = 0;
    this._biciRecipientAddMethod = -1;

    // Instead of calling clearInputField, do minimal work to reset the input's value and width, in order to avoid unecessary adjustInputFieldLength calculation.
    // clearInputField is used in the normal case to clear the input field and to correctly adjust the input field's width according to the surrounding recipient elements.
    // In this particular path we will not have any recipient so we do not need to do the additional calculation to render the exact width.
    this._lightClearInputField(false/*shouldSignal*/);
        
    // Reset the hint text
    if (Jx.isNonEmptyString(this._hintText)) {
        this._inputElement.placeholder = this._hintText;
    }
   
};

AddressWell.Input.prototype.clearHighlight = function () {
    /// <summary>
    /// Clears highight in the address well.
    /// </summary>

    if (this._highlightIndex !== -1) {
        var highlightElement = document.getElementById(this._mapRecipientIndexToElementId(this._highlightIndex));

        if (!Jx.isNullOrUndefined(highlightElement)) {
            // Remove visual highlight
            Jx.removeClass(highlightElement, this._highlightClass);
        }

        this._highlightIndex = -1;
    }
};

AddressWell.Input.prototype.removeFocusFromContainer = function () {
    /// <summary>
    /// Removes the class from the container to indicate that the entire element has lost focus.
    /// </summary>

    Jx.removeClass(this._rootElement, this._focusClass);
};

AddressWell.Input.prototype.addFocusToContainer = function () {
    /// <summary>
    /// Add a class to the container to indicate that the entire element has focus.
    /// </summary>

    Jx.addClass(this._rootElement, this._focusClass);
};

AddressWell.Input.prototype.completeUserInput = function (shouldSignal) {
    /// <summary>
    /// Resolves the content in the input field into a recipient object.
    /// </summary>
    /// <param name="shouldSignal" type="Boolean">
    /// Indicates whether this function should raise an event to signal that the field has been cleared.
    /// If true, the event will be used by the controller to render tile view.
    /// If false, the controller will not get an event to render tile view.
    /// </param>

    // Remove white spaces at the start and end of input value
    var inputValue = this._inputElement.value.trim();

    // We only perform this operation if the input value is not empty
    if (Jx.isNonEmptyString(inputValue)) {
        // Ensure that input value is always terminiated before we feed it into the parser
        inputValue += ";";
        this.addRecipientsByString(inputValue, AddressWell.RecipientAddMethod.typing /* Add bici data point for each typed recipient */);

        // Clears input field
        this.clearInputField(shouldSignal);
    }
};

AddressWell.Input.prototype.clearInputField = function (shouldSignal) {
    /// <summary>
    /// Clears the input field while adjusting its width inside the container based on the surrounding recipient elements.
    /// </summary>
    /// <param name="shouldSignal" type="Boolean">
    /// Inidicates whether this function should raise an event to signal that the field has been cleared.
    /// If true, the event will be used by the controller to render tile view.
    /// If false, the controller will not get an event to render tile view.
    /// </param>

    this._inputElement.value = "";
    this._previousInputValue = this._inputElement.value;

    this.adjustInputFieldLength(true /* shouldUseCachedContainerWidth */);

    if (shouldSignal) {
        // Fire an event to signal that the field is clear
        this.raiseEvent(AddressWell.Events.userInputChanged);
    }
};

AddressWell.Input.prototype._lightClearInputField = function (shouldSignal) {
    /// <summary>
    /// Minimal work to reset the input's value and width. 
    /// It differs from clearInputField in that it avoids adjustInputFieldLength calculation.
    /// </summary>

    this._inputElement.value = "";
    this._previousInputValue = this._inputElement.value;

    if (shouldSignal) {
        // Fire an event to signal that the field is clear
        this.raiseEvent(AddressWell.Events.userInputChanged);
    }
};

AddressWell.Input.prototype.addRecipient = function (recipient) {
    /// <summary>
    /// Takes the given recipient and adds it to the Input.
    /// </summary>
    /// <param name="recipient" type="AddressWell.Receipient">The AddressWell.Receipient object.</param>
    this.addRecipients([recipient]);
};

AddressWell.Input.prototype.addRecipients = function (recipients, biciRecipientAddMethod) {
    /// <summary>
    /// Takes the given recipients and adds them to the Input.
    /// </summary>
    /// <param name="recipients" type="Array">The AddressWell.Recipient objects.</param>
    /// <param name="biciRecipientAddMethod" type="Number" optional="true">
    /// This is the bici data point value to indicate the selection method that is being used to add recipients from the caller.
    /// This function is responsible for firing a bici function to collect data points for the number of recipients added.
    /// </param>
    Debug.assert(Jx.isArray(recipients));

    AddressWell.markStart("Input.addRecipients");

    if (recipients.length > 0) {
        // collect bici data point for the given selection method with the number of recipients added
        if (Jx.isNumber(biciRecipientAddMethod)) {
            this._biciRecipientAddMethod = biciRecipientAddMethod;

            Jx.bici.addToStream(AddressWell.selectionBiciId, biciRecipientAddMethod, recipients.length);

            // Also record the total number of prefilled recipients, if they are prefilled.
            // We use this info in the deleteHandler to help with the backspace logic.
            if (biciRecipientAddMethod === AddressWell.RecipientAddMethod.preFilled) {
                this._numPrefilled += recipients.length;
            }
        }

        // Ensure that HTML is added first in order to get an accurate ID assigned based on the current recipients array size
        this._addRecipientsHtml(recipients);

        // Add recipient to collection.
        this._addRecipientsToCollection(recipients);
 
        // If IME was active when the recipient was added, it's possible the input value would remain, which is unwanted behavior. Clear input field to avoid this.
        // By refreshing the input field, it also made sure that the dropdown would be re-rendered with the correct suggestions. 
        if (this._inputElement) {
            this._lightClearInputField(true/*shouldSignal*/);
        }

        this._updateAriaFlowAttributes(recipients[0].item, true /*updateAllSuccessors*/);

        // Mark the isDirty flag since we have updated the recipients collection
        this.isDirty = true;
    }

    AddressWell.markStop("Input.addRecipients");
};

AddressWell.Input.prototype.addRecipientsByString = function (recipientsString, biciRecipientAddMethod) {
    /// <summary>
    /// Loops through a string, breaks it up into entries, and adds entries as AddressWell.Recipient objects to the address well collection.
    /// Please note that this function does not terminate the string with an entry separator (e.g. semicolon), 
    /// as a result the remaining part of the string after the last entry separator will be returned at the end of the function call.
    /// </summary>
    /// <param name="recipientsString" type="String">
    /// A string of email/name entries separated by semicolon or comma according to MIME formats.
    ///     Examples:
    ///     <![CDATA[jiamin@hotmail.com; <jiamin@hotmail.com>, Jiamin Zhu <jiamin@hotmail.com>; "Jiamin Zhu" <jiamin@hotmail.com>]]>
    /// </param>
    /// <param name="biciRecipientAddMethod" type="Number">
    /// This is the bici data point value to indicate the selection method that is being used to add recipients from the caller.
    /// This function is responsible for firing a bici function to collect data points for the number of recipients added.
    /// </param>
    /// <returns type="String">
    /// The remaining part of the string that is not parsed and resolved into a recipient, if there is any.  Empty string if there's no remaining part.
    /// For example, given a string of 'name@email.com; text', only 'name@email.com' is resolved into a recipient because it's terminated by a valid separator.
    /// 'text' is being returned as a remaining part of the string at the end of the function call.
    /// </returns>

    NoShip.log("AddressWellInput.addRecipientsByString input: " + recipientsString);    
    AddressWell.markStart("Input.addRecipientsByString");

    this.addRecipients(this._parser.parse(recipientsString), biciRecipientAddMethod);

    AddressWell.markStop("Input.addRecipientsByString");

    // Return any remains text that couldn't parsed as an email.
    return this._parser.unparsedText;
};

AddressWell.Input.prototype.focus = function (force) {
    /// <summary>
    /// Puts focus on the Input (in the input field)
    /// </summary>
    /// <param name="force" type="Boolean" optional="true">Forces the focus to be reset on the input element
    /// be invoking a blur(), followed by a focus() call. This is meant as a workaround for IE bug #342468</param>

    // Do not call focus unecessarily when the input element is already in focus (see WinLive bug 568845)
    if (force || document.activeElement !== this._inputElement) {
        // The onfocus handler (_inputFocusHandler) will handle the focus event
        if (force) {
            this._inputElement.blur();
        }
        this._inputElement.focus();
    }
};

AddressWell.Input.prototype.adjustInputFieldLength = function (shouldUseCachedContainerWidth) {
    /// <summary>
    /// Dynamically adjusts input element's length according to input content and its surrounding recipient elements.
    /// </summary>
    Debug.assert(Jx.isDefined(shouldUseCachedContainerWidth));

    if (this.isShutdown()) {
        // Control has been shut down, do nothing.
        return;
    }

    AddressWell.markStart("Input.adjustInputFieldLength");

    // Only perform this operation if the UI has been initialized
    if (this._uiInitialized) {

        // Since we don't remove items from the recipients array when they're deleted, checking for recipients basically tracks whether we've ever had recipients.
        // If we haven't ever had recipients, we want to not do anything here.
        if (this._recipients.length > 0) {
            var inputElement = this._inputElement;

            // Allow the element to grow/shrink by matching its size to the length of the value. Note: IE's calculation here is not always accurate--especially for wide characters like 'W'.
            inputElement.size = inputElement.value.length + 1;

            this._updateInputFieldOffset(shouldUseCachedContainerWidth);
        }
    }

    AddressWell.markStop("Input.adjustInputFieldLength");
};

AddressWell.Input.prototype._updateInputFieldOffset = function (shouldUseCachedContainerWidth) {
    /// <summary>
    /// Calculate the input field offset and raise change event so that the dropdown control can adjust its position to align with the input.
    /// <param name="shouldUseCachedContainerWidth" type="Boolean"> When the container width is changed (triggered by window resize), 
    ///   we need to raise change event even if the input offset isn't updated. This is because the container width change could possibly affect
    ///   how the dropdown is aligned to the address well. It could be either left aligned with the input control, or right aligned with the address 
    ///   well control depending on whether there's enough space left in the address well control to accomodate the full width of the drop down.
    /// </param>
    /// </summary>
    Debug.assert(Jx.isDefined(shouldUseCachedContainerWidth));
    
    // Only execute if not animating to avoid elements shifting while animating (especially the dropdown popup which is positioned based on input element)
    // The animation compelete handler calls this function anyway so there's no need to execute this again after animation is done.
    if (!this._isAnimating) {
        var inputElement = this._inputElement;
        // In RTL, the offset value we need is the right position of the input element. This is because the dropdown needs to be right aligned with it.
        var offsetLeft = Jx.isRtl() ? inputElement.offsetLeft + inputElement.offsetWidth : inputElement.offsetLeft;

        // The input may have dropped down to a new line. Check to see if our offsetLeft value has changed.
        if (!shouldUseCachedContainerWidth || this._cachedInputOffsetLeft !== offsetLeft) {
            this.raiseEvent(AddressWell.Events.inputOffsetAdjusted, offsetLeft);
            this._cachedInputOffsetLeft = offsetLeft;
        }
    }
};

AddressWell.Input.prototype.deleteRecipientByIndex = function (index, withAnimation, preserveHighlight) {
    /// <summary>
    /// Deletes the recipient from the DOM and recipients array given an index.
    /// </summary>
    /// <param name="index" type="Number">The given index into the recipients array.</param>
    /// <param name="withAnimation" type="Boolean">True if animation is desired.  False otherwise.</param>
    /// <param name="preserveHighlight" type="Boolean" optional="true">True if the item being deleted is highlighted and the next item in the
    /// list, if any, should gain the highlight.</param>

    // Verify that index is within valid range
    var recipientCount = this._recipients.length;
    if (index > -1 && index < recipientCount) {
        var indexElement = document.getElementById(this._mapRecipientIndexToElementId(index));
        var nextHighlightedElement = /*@static_cast(HTMLElement)*/null;

        // Always clear highlight first.
        this.clearHighlight();

        if (preserveHighlight) {
            var nextRecipient = /*@static_cast(AddressWell.Recipient)*/(this._getNextRecipient(index) || this._getPreviousRecipient(index));
            if (nextRecipient) {
                nextHighlightedElement = nextRecipient.item;
            }
        }

        // Remove recipient from the collection by setting it to null
        this._recipients[index].setDeleted();
        this._recipients[index] = null;

        if (withAnimation) {
            // Performs animation to remove element
            this._deleteRecipientAnimation(indexElement);
        } else {
            // Skips animation and performs removal immediately
            this._deleteRecipientAnimationCallback(indexElement);
        }

        if (nextHighlightedElement) {
            this._highlight(nextHighlightedElement, true /*takeFocus*/);
        }
        
        this.raiseEvent(AddressWell.Events.recipientRemoved, null);
    }
};

AddressWell.Input.prototype.deleteRecipientByEmail = function (email) {
    /// <summary>
    /// Deletes all matching recipients from the DOM and recipients array given an email address.
    /// </summary>
    /// <param name="email" type="String">The given email address of the recipient.</param>

    // Normalize the email address
    email = email.toLowerCase();

    // Iterate backwards through the array, so matches and removals don't affect our index.
    for (var i = this._recipients.length; i--;) {
        var recipient = /*@static_cast(AddressWell.Recipient)*/this._recipients[i];

        if (Boolean(recipient) && recipient.emailAddress.toLowerCase() === email) {
            this.deleteRecipientByIndex(i, false, true);
        }
    }
};

AddressWell.Input.prototype._getNextRecipient = function (index) {
    /// <summary>
    /// Given a starting recipient index, find the next valid recipient in the list.
    /// </summary>
    /// <param name="index" type="Number">The starting index</param>
    /// <return type="AddressWell.Recipient"/>
    Debug.assert(index >= 0 && index < this._recipients.length);
    var recipients = this._recipients;
    for (var i = index + 1, count = recipients.length; i < count; i++) {
        if (recipients[i]) {
            return recipients[i];
        }
    }
    return null;
};

AddressWell.Input.prototype._getPreviousRecipient = function (index) {
    /// <summary>
    /// Given a starting recipient index, find the first valid preceeding recipient in the list.
    /// </summary>
    /// <param name="index" type="Number">The starting index</param>
    /// <return type="AddressWell.Recipient"/>
    Debug.assert(index >= 0 && index < this._recipients.length);
    var recipients = this._recipients;
    for (var i = index - 1; i >= 0; i--) {
        if (recipients[i]) {
            return recipients[i];
        }
    }
    return null;
};

AddressWell.Input.prototype._deleteRecipientAnimation = function (recipientElement) {
    /// <summary>
    /// Performs animation to delete the recipient element from the list of recipients.
    /// </summary>
    /// <param name="recipientElement" type="HTMLElement">The recipient element to be removed</param>

    // Remove element from the DOM tree
    if (!Jx.isNullOrUndefined(recipientElement)) {
        // Prepare for delete from list animation
        var me = this;
        var affectedItems = this._containerElement.querySelectorAll("div.aw-inputContainer li");
        var deleteFromList = WinJS.UI.Animation.createDeleteFromListAnimation(recipientElement, affectedItems);

        // Set deleted item to its final visual state (hidden).
        recipientElement.style.visibility = "hidden";
        // Take deleted item out of the regular document layout flow so remaining list items will change position in response.
        recipientElement.style.position = "fixed";

        var inputFocusWorkaround = function () {
            // During animation, ensure focus is back into the input field so user can continue typing upon deletion
            // Note: Due to WinLive bug 569298 and 595011, the delete animation seems to interfere with input focus working correctly.
            // Even though in theory the input field has focus it is unreliable in terms of receiving keyboard events.
            // As a result we will workaround by doing a blur first, then follow by a focus event, in order to completely reset the focus state on the input field.
            // We need to perform this workaround before and after the animation
            me._inputElement.blur();
            me.focus();
        };

        inputFocusWorkaround();
        deleteFromList.execute().then(
            // After animation is complete, perform cleanup
            function deleteRecipientAnimationSuccess() {
                if (me.hasFocus()) {
                    inputFocusWorkaround();
                }
                me._deleteRecipientAnimationCallback(recipientElement);
            },
            // If the animation has an error, clean up and remove deleted item from the DOM tree
            function deleteRecipientAnimationSuccessError(exception) {
                if (me.hasFocus()) {
                    inputFocusWorkaround();
                }
                me._deleteRecipientAnimationCallback(recipientElement);
                Jx.log.exception("AddressWell.Input.deleteRecipientByIndex has encountered an error during animation promise pattern", exception);
            }
        );
    }
};

AddressWell.Input.prototype._deleteRecipientAnimationCallback = function (recipientElement) {
    /// <summary>
    /// Helper function to remove a given recipient element from the list of recipients after the delete animation is performed.
    /// </summary>
    /// <param name="recipientElement" type="HTMLElement">The recipient element to be removed</param>
    
    // After the element is removed from the DOM, we'll need to restore the broken aria-flowto/flow-from link.
    // Save the next or previous sibling, if available.
    var ariaRestorePointElement = recipientElement.nextSibling || recipientElement.previousSibling;

    // Actually removes the element from the DOM tree
    this._containerElement.removeChild(recipientElement);

    if (this._recipients.length > 0) {
        this._updateAriaFlowAttributes(ariaRestorePointElement, false /*updateAllSuccessors*/);
    }

    // Adjusts the input field after removal of recipients
    this.adjustInputFieldLength(true /* shouldUseCachedContainerWidth */);

    // Mark the isDirty flag since we have updated the recipients collection
    this.isDirty = true;

    if (this._containerElement.children.length === 1) {
        // After we remove the element, if the list of recipients has gone down to zero, we will fire an event to indicate hasRecipients = false
        // (Note: we always have a least one element in the container, the input element.)
        this.raiseEvent(AddressWell.Events.hasRecipientsChanged, false);
    }
};

AddressWell.Input.prototype.containerKeyDownHandler = function (ev) {
    /// <summary>
    /// The handler for handling the keydown event inside the address well container.
    /// </summary>
    /// <param name="ev" type="Event">the keyboard event.</param>
    
    // First check if we have a highlighted recipient element
    if (this._highlightIndex > -1) {
        var highlightRecipient = document.getElementById(this._mapRecipientIndexToElementId(this._highlightIndex));
        if (!Jx.isNullOrUndefined(highlightRecipient)) {
            // We have found a highlight recipient
            this._recipientKeyDownHandler(ev);
        }
    }
};

AddressWell.Input.prototype._getSourceRecipientElement = function (ev) {
    /// <summary>
    /// Helper function for getting the recipient element from where the event (click/contextmenu) happened.
    /// </summary>
    /// <param name="ev" type="Event">DOM event</param>
    /// <returns type="HTMLElement">
    /// The HTML element of the recipient receiving the event.
    /// Null if the given event did not originate from any recipient element.
    /// </returns>
    
    var clickedElement = ev.target;
    var foundElement = false;

    // The click may not have hit exactly on the element with the index; check up the tree a little in case we find it.
    for (var i = 0; i < 3 /* Element has three layers of children */; i++) {
        if (Jx.isNonEmptyString(clickedElement.getAttribute("data-awIndex"))) {
            foundElement = true;
            break;
        }
        clickedElement = clickedElement.parentNode;
    }

    if (foundElement) {
        return clickedElement;
    } else {
        return null;
    }
};

AddressWell.Input.prototype._inputContextMenuHandler = function (ev) {
    /// <summary>
    /// The handler for handling the context menu event inside the input field.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>

    // Block the parent container from handling the event since the input control handles this automatically
    // Otherwise the container will override with its own implementation
    ev.stopPropagation();

    if (this._isDisabled) {
        // We also want to prevent the context menu from coming up at all when it's disabled
        ev.preventDefault();
    }
};

AddressWell.Input.prototype._containerClickHandler = function (ev) {
    /// <summary>
    /// The handler for handling the click event inside the address well container.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>
    var recipientElement = this._getSourceRecipientElement(ev);

    if (this._isDisabled) {
        // Allow the user to tap the recipient to open the profile, but that's it.
        if (recipientElement && this._allowViewProfile) {
            var recipientIndex = this._getRecipientIndex(recipientElement);
            var recipient = this._recipients[recipientIndex];
            
            this._viewProfileHandler(recipient);
        }
    } else {

        // Add "focus" style to container
        this.addFocusToContainer();

        // If user clicks on an element, we will highlight the element.
        if (Jx.isNullOrUndefined(recipientElement)) {
            // If we can't find a recipient element from the click, we will put focus on the input field.

            // Notify any listeners that the container, not a recipient, was clicked.
            this.raiseEvent(AddressWell.Events.msGestureTap);

            // Clear highlight from recipients
            this.clearHighlight();
        } else {
            // We found a recipient element from the click
            this._recipientClickHandler(recipientElement);
        }

        // Signal that the input is stealing highlight area
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
    }

    ev.preventDefault();
};

AddressWell.Input.prototype._containerPointerDownHandler = function (ev) {
    /// <summary>
    /// The handler for handling mouse down event inside the address well container.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>

    if (!this._isDisabled) {
        var sourceElement = this._getSourceRecipientElement(ev);
        if (!Jx.isNullOrUndefined(sourceElement)) {
            AddressWell.performPointerAnimation(sourceElement);

            if (this._inputElement === document.activeElement) {
                // Prevent the recipient from taking focus on the mouse down.
                ev.preventDefault();
            }
        } 
    }
};

AddressWell.Input.prototype._containerContextMenuHandler = function (ev) {
    /// <summary>
    /// The handler for handling the context menu event inside the address well container.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>

    if (!this._isDisabled) {
        // Only show the context menu if the control is not disabled

        // Check for highlighted recipient
        if (this._highlightIndex < 0) {
            // If no recipient is being highlighted then invoke the click handler to highlight the recipient first, if there is one for the event
            this._containerClickHandler(ev);
        } else {
            // If there is already a highlighted recipient then check if it's the same as the one being clicked on, if not the same then manually highlight the recipient being clicked on
            var clickedElement = this._getSourceRecipientElement(ev);
            var clickedIndex = -1;
            if (!Jx.isNullOrUndefined(clickedElement)) {
                clickedIndex = this._getRecipientIndex(clickedElement);
            }

            // If we clicked on a recipient, highlight it.  If we didn't click on a recipient, remove the highlight.
            // Logic further below uses the currently highlighted recipient to choose where to show the context menu.
            if (clickedIndex === -1) {
                this.clearHighlight();
            } else if (this._highlightIndex !== clickedIndex) {
                this._highlight(clickedElement, false /*takeFocus*/);
            }
        }

        // If we have a highlighted recipient at this point, render the menu for that recipient
        if (this._highlightIndex > -1) {
            this._displayContextMenuForRecipient(this._highlightIndex);
        } else {
            // Check for text data before rendering the context menu
            var text = window.clipboardData.getData("Text");

            if (!Jx.isNullOrUndefined(text)) {
                this._displayContextMenuForContainer(ev, text);
            }
        }
    } else {
        // If the well is disabled, allow the _containerClickHandler function to check if the 
        // recipient's context menu is being requested. It's still accessible.
        this._containerClickHandler(ev);
    }

    // Block the parent container from handling the event since it's been handled,
    // Otherwise this calls into the global handler logic and clears the highlight.
    ev.stopPropagation();
    // Block and dimiss the event completely
    // Otherwise this results in the default behavior of app bar being displayed as a response to the event.
    ev.preventDefault();
};

AddressWell.Input.prototype._displayContextMenuForContainer = function (ev, pasteText) {
    /// <summary>
    /// Construct and display the context menu for the container near the invocation point.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>
    /// <param name="pasteText" type="String">The text to be pasted via the paste command in the menu.</param>
    /// <returns type="Windows.UI.Popups.PopupMenu">The Windows context menu object</returns>

    var menu = null;
    var me = this;

    if (Jx.isWWA) {
        // Context menu for the paste command
        menu = new Windows.UI.Popups.PopupMenu();
        var menuItem = new Windows.UI.Popups.UICommand(
                                        Jx.res.getString(AddressWell.stringsPrefix + "awPaste"),
                                        me._containerPasteHandler.bind(me, pasteText),
                                        "paste");
        menu.commands.append(menuItem);
        this._showContextMenuForContainer(menu, ev);
    }
    return menu;
};

AddressWell.Input.prototype._showContextMenuForContainer = function (menu, ev) {
    /// <summary>
    /// A helper function to actually render the context menu for the container.
    /// This function is separated out for unit testing purposes.
    /// </summary>
    /// <param name="menu" type="Windows.UI.Popups.PopupMenu">The Windows context menu object</param>
    /// <param name="ev" type="Event">The DOM event.</param>

    // Show the menu near the invocation point (e.g. the mouse/touch point)
    try {
        // The PopupMenu uses window-relative coordinates--something IE doesn't expose to us.
        // This is the suggested method for obtaining the needed coordinates.
        var x = ev.pageX - window.pageXOffset;
        var y = ev.pageY - window.pageYOffset;

        if (ev.button === 0) {
            // If no mouse button is clicked, assume the contex-menu key was used. Estimate the position based on the location of the input control.
            var boundingRect = this._inputElement.getBoundingClientRect();
            x = boundingRect.left;
            y = boundingRect.top;
        }
        menu.showAsync({ x: x, y: y });

        this.raiseEvent(AddressWell.Events.showingContextMenu);

    } catch (e) {
        // No op on errors
        // A WinRT error can be introduced if multiple code path are trying to invoke the context menu at the same time
        Jx.log.exception("AddressWell.Input._showContextMenuForContainer has encountered an error", e);
    }
};

AddressWell.Input.prototype._displayContextMenuForRecipient = function (recipientIndex) {
    /// <summary>
    /// Construct and display the context menu for the highlighted recipient object.
    /// </summary>
    /// <param name="recipientIndex" type="Number">Index of the Recipient object, not it's DOM element, for which the context menu is associated</param>
    /// <returns type="Windows.UI.Popups.PopupMenu">The Windows context menu object</returns>
    Debug.assert(!this._isDisabled, 'No context menu should be shown for disabled recipients');

    var menu = null;
    var me = this;

    if (Jx.isWWA) {
        // Context Menu only works in WWA mode and only if there is a highlighted recipient
        menu = new Windows.UI.Popups.PopupMenu();
        
        var recipient = /*@static_cast(AddressWell.Recipient)*/this._recipients[recipientIndex];
        Debug.assert(!Jx.isNullOrUndefined(recipient));
        
        var profile = new Windows.UI.Popups.UICommand(
            Jx.res.getString(AddressWell.stringsPrefix + "awViewProfile"),
            me._viewProfileHandler.bind(me, recipient),
            "launchProfile");

        var cut = new Windows.UI.Popups.UICommand(
            Jx.res.getString(AddressWell.stringsPrefix + "awCut"),
            me._inputCutHandler.bind(me),
            "cut");
        
        var copy = new Windows.UI.Popups.UICommand(
            Jx.res.getString(AddressWell.stringsPrefix + "awCopy"),
            me._inputCopyHandler.bind(me),
            "copy");

        var edit = new Windows.UI.Popups.UICommand(
            Jx.res.getString(AddressWell.stringsPrefix + "awEdit"),
            function addressWellInput_contextMenuEdit() { me._inputEditHandler(true /* withAnimation */); },
            "edit");

        var remove = new Windows.UI.Popups.UICommand(
            Jx.res.getString(AddressWell.stringsPrefix + "awRemoveRecipient"),
            me._inputRemoveHandler.bind(me),
            "removeRecipient");

        // Display menu items in the following order
        if (recipient.state === AddressWell.RecipientState.resolved) {
            if (this._allowViewProfile) {
                menu.commands.append(profile);
            }

            menu.commands.append(cut);
            menu.commands.append(copy);
        }

        menu.commands.append(edit);
        menu.commands.append(remove);

        this._showContextMenuForRecipient(menu, recipientIndex);
    }

    return menu;
};

AddressWell.Input.prototype._showContextMenuForRecipient = function (menu, recipientIndex) {
    /// <summary>
    /// A helper function to actually render the context menu for the highlighted recipient.
    /// This function is separated out for unit testing purposes.
    /// </summary>
    /// <param name="menu" type="Windows.UI.Popups.PopupMenu">The Windows context menu object</param>
    /// <param name="recipientIndex" type="Number"/>

    // Take zoom factor into consideration when rendering the context menu with coordinates
    var zoomFactor = document.body.parentNode.msContentZoomFactor;
    var highlightRecipient = document.getElementById(this._mapRecipientIndexToElementId(recipientIndex));
    // Show the menu for the recipient element's specified selection rectangle
    try {
        menu.showForSelectionAsync({
            x: highlightRecipient.getBoundingClientRect().left * zoomFactor,
            y: highlightRecipient.getBoundingClientRect().top * zoomFactor,
            width: highlightRecipient.clientWidth * zoomFactor,
            height: highlightRecipient.clientHeight * zoomFactor
        }).done(function () {
            // In Touch Narrator, if the context-menu is dismissed, focus is essentially
            // lost until the user taps somewhere in the app. Encourage it to go to the
            // somewhere useful.
            if (this._highlightIndex !== -1) {
                var recipient = this._recipients[this._highlightIndex];
                if (Jx.isObject(recipient) && Jx.isHTMLElement(recipient.item)) {
                    msSetImmediate(function () {
                        recipient.item.tabIndex = -1;
                        recipient.item.focus();
                        recipient.item.removeAttribute("tabIndex");
                    });
                }
            }
        }.bind(this));

        this.raiseEvent(AddressWell.Events.showingContextMenu);

    } catch (e) {
        // No op on errors
        // A WinRT error can be introduced if multiple code path are trying to invoke the context menu at the same time
        Jx.log.exception("AddressWell.Input._showContextMenuForRecipient has encountered an error", e);
    }
};

AddressWell.Input.prototype._recipientClickHandler = function (recipientElement) {
    /// <summary>
    /// The click event handler for the recipient element.
    /// </summary>
    /// <param name="recipientElement" type="HTMLElement">The HTML recipient element.</param>

    var index = this._getRecipientIndex(recipientElement);

    if (this._highlightIndex !== index) {
        // Highlight the element
        this._highlight(/* @static_cast(HTMLElement) */recipientElement, false /*takeFocus*/);
    }

    this._displayContextMenuForRecipient(index);
};

AddressWell.Input.prototype._recipientKeyDownHandler = function (ev) {
    /// <summary>
    /// The keydown event handler for the recipient element.
    /// </summary>
    /// <param name="ev" type="Event">the keyboard event.</param>

    // Handle ctrl + <key> cases
    if (ev.ctrlKey) {
        switch (ev.key) {
            case AddressWell.Key.c:
                this._inputCopyHandler();
                break;

            case AddressWell.Key.x:
                this._inputCutHandler();
                break;

            default:
                if (ev.key === AddressWell.Key.enter) {
                    // Put the focus on input field so that it can handle key down event
                    this.focus();
                    this._inputKeyDownHandler(ev);
                }
                break;
        }
    } else {

        switch (ev.key) {
            case AddressWell.Key.tab:
                // User can tab between elements on the hosting page, just make sure we clear the highlight first
                this.clearHighlight();
                break;

            case AddressWell.Key.arrowLeft:
                // FALLTHROUGH
            case AddressWell.Key.arrowRight:
                this._arrowKeyHandler(ev);
                break;

            case AddressWell.Key.pageUp:
                this._rootElement.scrollTop = Math.max(0, (this._rootElement.scrollTop - AddressWell.pagingHeightForRecipients));
                break;

            case AddressWell.Key.pageDown:
                this._rootElement.scrollTop = Math.min(this._rootElement.scrollHeight, (this._rootElement.scrollTop + AddressWell.pagingHeightForRecipients));
                break;

            case AddressWell.Key.enter:
                // FALLTHROUGH
            case AddressWell.Key.spacebar:
                Debug.assert(this._highlightIndex >= 0);
                this._displayContextMenuForRecipient(this._highlightIndex);
                ev.preventDefault();
                break;

            case AddressWell.Key.selection:
                this._inputKeyDownHandler(ev);
                break;
            default:
                // Put the focus on input field so that it can handle key down event
                this.focus();
                this._inputKeyDownHandler(ev);
                break;
        }
    }
};

AddressWell.Input.prototype._inputFocusHandler = function () {
    /// <summary>
    /// The handler for handling onfocus event inside the input field.
    /// </summary>

    // Add "focus" style to container
    this.addFocusToContainer();

    this.raiseEvent(AddressWell.Events.focus);

    this._updateInputFieldOffset(true /* shouldUseCachedContainerWidth */);
};

AddressWell.Input.prototype._imeStartHandler = function () {
    /// <summary>
    /// Event handler for the IME composition start event
    /// Used to keep track of whether the IME is active
    /// </summary>

    this._imeActive = true;
};

AddressWell.Input.prototype._imeEndHandler = function () {
    /// <summary>
    /// Event handler for the IME composition end event
    /// Used to keep track of whether the IME is active
    /// </summary>

    this._imeActive = false;
};

AddressWell.Input.prototype._msCandidateWindowShowHandler = function () {
    /// <summary>
    /// Event handler for the IME window show event
    /// Used to notify dropdown list so it can position below IME window
    /// </summary>
    var context = this._inputElement.msGetInputContext();
    var rect = context.getCandidateWindowClientRect();
    var imeWindowHeight = rect.bottom - rect.top;
    this.raiseEvent(AddressWell.Events.imeWindowHeightUpdated, imeWindowHeight);    
};

AddressWell.Input.prototype._msCandidateWindowHideHandler = function () { 
    /// <summary>
    /// Event handler for the IME window hide event
    /// Used to notify dropdown list so it can position below IME window
    /// </summary>
    this.raiseEvent(AddressWell.Events.imeWindowHeightUpdated, 0);    
};

AddressWell.Input.prototype._inputKeyDownHandler = function (ev) {
    /// <summary>
    /// Handler for the key down event in the input field.
    /// </summary>
    /// <param name="ev" type="Event">The keyboard event.</param>

    // This check is needed for IME support (WinLive 520340)
    // This is the simplest check to determine if IME is in use, and if so we should not perform any of our key filtering logic since IME is handling them
    // There are several alternatives suggested by the IME team but none of them satisfy our scenario 100%:
    // 1. Switch from listening to keydown to keypress since IME swallows keypress events when it's in use - issue is that keypress is not fired in the case of backspace, delete, tab, spacebar, arrow keys, page up/down, selection
    // 2. Listen to compositionstart and compositionend events to detect IME is in use - issue is that compositionstart event is fired after keydown event so the timing is not accurate (although we do use this method in the input event handler)
    if (ev.keyCode !== AddressWell.imeInUseKeyCode) {
        switch (ev.key) {
            case AddressWell.Key.enter:
                // If CTRL + ENTER is pressed, the drop down is visible and a recipient is selected in the drop-down, prevent the event from passing through to the parent container
                if (ev.ctrlKey && this.getAttr(AddressWell.dropDownVisibleAttr) && (this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.dropDown)) {
                    ev.stopPropagation();
                }

                // The enter key has different behavior depending on where the highlight is.
                // If the highlight is somewhere else, fire an event and let the somewhere else handle the added recipient.
                // If the highlight is here, add the recipient here.
                if (this.getAttr(AddressWell.highlightAreaAttr) !== AddressWell.HighlightArea.input) {
                    this.raiseEvent(AddressWell.Events.addressWellCompleteKey);
                } else if (this._searchOnEnter) {
                    this.raiseEvent(AddressWell.Events.searchFirstConnectedAccount);
                } else {
                    this.completeUserInput(true /* Display tile view after completion */);
                }

                // We have handled the event
                ev.preventDefault();
                break;
            case AddressWell.Key.tab:
                // User can tab between elements on the hosting page
                // Let the parent component handle this event
                this.raiseEvent(AddressWell.Events.addressWellTabKey, ev);
                break;
            case AddressWell.Key.deleteKey:
                // FALLTHROUGH
            case AddressWell.Key.backspace:
                this._deleteHandler(ev);
                ev.stopPropagation();
                break;
            case AddressWell.Key.escape:
                // We need to pass ESC event to the caller if the dropdown is not visible (WinLive 440429)
                if (this.getAttr(AddressWell.dropDownVisibleAttr)) {
                    // If drop down is visible, prevent the event from clearing the input field
                    ev.preventDefault();
                    // Block the parent container from handling the keydown event since the input field has already handled it
                    // Otherwise the hosting page might be responding to the ESC event
                    ev.stopPropagation();
                } else {
                    this._inputElement.blur();
                }
                // Performs logic to handle ESC key
                this.raiseEvent(AddressWell.Events.addressWellEscapeKey);
                break;
            case AddressWell.Key.f10:
                if (ev.altKey || !ev.shiftKey) {
                    // Shift-F10 should bring up the context menu.  Just F10 doesn't, alt-shift-F10 doesn't, ctrl-shift-F10 does.
                    break;
                }
                // FALLTHROUGH
            case AddressWell.Key.selection:
                // If the selection key is pressed, depending on where the highlight is, display context menu for the highlighted item
                if (this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.input && this._highlightIndex > -1) {
                    // Render the context menu for the highlighted recipient
                    this._displayContextMenuForRecipient(this._highlightIndex);

                    // Prevent other code from also trying to handle this event, since we're showing a context menu.
                    ev.preventDefault();
                } 
                // We've already handled the key - prevent the container from also trying to handle it (which will call into this function again).
                ev.stopPropagation();
                break;
            case AddressWell.Key.arrowLeft:
                // FALLTHROUGH
            case AddressWell.Key.arrowRight:
                // FALLTHROUGH
            case AddressWell.Key.arrowUp:
                // FALLTHROUGH
            case AddressWell.Key.arrowDown:
                this._arrowKeyHandler(ev);
                // Block the parent container from handling the keydown event since the input field has already handled it
                // Otherwise on arrow keys it would arrow key twice from the container keydown logic
                ev.stopPropagation();
                break;
            case AddressWell.Key.pageUp:
                // FALLTHROUGH
            case AddressWell.Key.pageDown:
                if (this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.dropDown) {
                    this.raiseEvent(AddressWell.Events.pageKey, ev.key);
                }
                break;
            case AddressWell.Key.home:
                if (!Jx.isNonEmptyString(this._inputElement.value) && this._containerElement.children.length > 1) {
                    this._highlight(this._containerElement.children[0], true /*takeFocus*/);
                    // We've handled the key in our context
                    ev.preventDefault();
                }
                break;

            case AddressWell.Key.end:
                var childCount = this._containerElement.children.length;
                if (!Jx.isNonEmptyString(this._inputElement.value) && childCount > 1) {
                    this._highlight(this._containerElement.children[childCount - 2], true /*takeFocus*/);
                    // We've handled the key in our context
                    ev.preventDefault();
                }
                break;
            case AddressWell.Key.k:
                // CTRL + K or ALT + K will trigger the the wordwheel search for the first connected account, if there is any
                if (ev.ctrlKey || ev.altKey) {
                    this.raiseEvent(AddressWell.Events.searchFirstConnectedAccount);
                    // We've handled the key in our context
                    ev.preventDefault();
                }
                break;
            case AddressWell.Key.z:
            case AddressWell.Key.y:
                if (ev.ctrlKey) {
                    ev.preventDefault();
                }
                break;
            default:
                // All other user inputs will be handled by the inputChangeHandler
                // as the key down event is followed immediately by an onInput event if the input value has been changed
                break;
        }
    }
};

AddressWell.Input.prototype._handleInputUpdate = function () {
    /// <summary>
    /// A helper function that handles a change that has occurred inside the input field by performing the following:
    ///     1. Remove highlight from the currently highlighted recipient since user is interacting with the input field
    ///     2. Adjust the width of the input field accordingly in order to fill the width of the container
    ///     3. Raise an event to notify listener when the input value has indeed been updated from its previous value
    /// This function is usually called immediately after the new input.value has been set.
    /// </summary>
    
    Jx.log.verbose("AddressWell.Input.handleInputUpdate");

    this.clearHighlight();
    this.adjustInputFieldLength(true /* shouldUseCachedContainerWidth */);
    this._notifyInputChange();
};

AddressWell.Input.prototype._notifyInputChange = function () {
    /// <summary>
    /// Checks that if input value has indeed been changed and fires an event if that is the case.
    /// </summary>

    NoShip.log("AddressWell.Input._notifyInputChange with previous value of: " + this._previousInputValue + " and current value of: " + this._inputElement.value);
    if (this._previousInputValue !== this._inputElement.value) {
        this._previousInputValue = this._inputElement.value;
        // Update the userInput attribute only if the input value has indeed been updated
        // e.g. We don't want to raise the event in the case of user pressing F1
        this.raiseEvent(AddressWell.Events.userInputChanged);
        // Mark the isDirty flag since input value has been changed
        this.isDirty = true;
    }
};

AddressWell.Input.prototype._containerPasteHandler = function (pasteText) {
    /// <summary>
    /// Handler for the paste event from the container.
    /// </summary>
    /// <param name="pasteText" type="String">The text to be pasted into the input field.</param>

    // Manually put focus onto the input field in case the focus is not set (e.g. paste is invoked from context menu)
    this.focus();
    
    // Check if the user has entered multiple emails separated by semicolon, comma, feedline, or carriage return
    // Resolve those emails into recipients
    // Always use the last entry as our user input
    this._inputElement.value = this.addRecipientsByString(pasteText, AddressWell.RecipientAddMethod.paste /* Add bici data point for each pasted recipient*/);
    this._handleInputUpdate();
};

AddressWell.Input.prototype._inputPasteHandler = function (ev) {
    /// <summary>
    /// Handler for the paste event in the input field.
    /// </summary>
    /// <param name="ev" type="Event"/>

    // Override the input element's default paste-handling. This is done to 
    // circumvent the 512 character limit we impose on it.
    try {
        var content = Windows.ApplicationModel.DataTransfer.Clipboard.getContent();

        if (content.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
            content.getTextAsync().done(/*@bind(AddressWell.Input)*/function (text) {
                this._inputElement.value = this.addRecipientsByString(text, AddressWell.RecipientAddMethod.paste /* Add bici data point for each pasted recipient*/);
                this._handleInputUpdate();
            }.bind(this));
        }

        // Only prevent the default action if the clipboard API's don't throw. If they do, we
        // want to fallback to the default paste functionality.
        ev.preventDefault();

    } catch (e) {
        Jx.log.exception("AddressWell.Input._inputPasteHandler has encountered an error", e);
    }
};

AddressWell.Input.prototype._inputChangeHandler = function () {
    /// <summary>
    /// Handler for the onInput event in the input field.
    /// This function is responsible for handling any modification to the input field via another interface 
    /// such as typing from keyboard, input from pen, or paste from context menu.
    /// </summary>

    // Skip anything that might update the input value if the IME is active (but we do still want to call handleInputUpdate)
    if (!this._imeActive) {

        // If the _biciRecipientAddMethod variable has been set in the case of a paste operation from _inputPasteHandler, use it to collect BICI data.
        // This is the scenario where user pasted some text and then continued to type more.
        // Otherwise we don't expect any entry separator inside the input field from this code path.
        // Any recipient added as a result of this code path is treated as "added via typing" (e.g. pen input, voice recognition)
        var biciRecipientAddMethod = this._biciRecipientAddMethod;
        if (this._biciRecipientAddMethod !== AddressWell.RecipientAddMethod.paste) {
            biciRecipientAddMethod = AddressWell.RecipientAddMethod.typing;
        }
        // Check if the user has entered multiple emails separated by semicolon, comma, feedline, or carriage return
        // Resolve those emails into recipients
        // Always use the last entry as our user input
        var newInputValue = this.addRecipientsByString(this._inputElement.value, biciRecipientAddMethod);
        // We normally would not run the following code unless the input value contains a separator, 
        // such that some text gets resolved into a recipient, and there are some text that remains in the input field.
        if (this._inputElement.value !== newInputValue) {
            // This is a trick to force the cursor to be placed at the end of the text
            // It might introduce interesting problems so only perform this when the value is indeed changed (WinLive 508246)
            this._inputElement.value = newInputValue;
        }
    }
    this._handleInputUpdate();
};

AddressWell.Input.prototype._copyText = function (textToClipboard) {
    /// <summary>
    /// Helper function to copy the given text onto the clipboard
    /// </summary>
    /// <param name="textToClipboard" type="String">The text to be copied onto the clipboard.</param>

    try {
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setText(textToClipboard);
        Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
    } catch (e) {
        Jx.log.exception("AddressWell.Input._copyText has encountered an error", e);
    }
};

AddressWell.Input.prototype._inputCopyHandler = function () {
    /// <summary>
    /// Handler for the Copy event in the input field.
    /// </summary>

    // Translate the recipient object into a string and set it as clipboard text
    var recipient = /*@static_cast(AddressWell.Recipient)*/this._recipients[this._highlightIndex];
    Debug.assert(!Jx.isNullOrUndefined(recipient));
    if (recipient) {
        var recipientString = recipient.toString();
        if (Jx.isNonEmptyString(recipientString)) {
            this._copyText(recipientString);
        }
    }
};

AddressWell.Input.prototype._inputCutHandler = function () {
    /// <summary>
    /// Handler for the Cut event in the input field.
    /// </summary>

    // It's a combination of copy and remove
    this._inputCopyHandler();
    this._inputRemoveHandler();
};

AddressWell.Input.prototype._inputEditHandler = function (withAnimation) {
    /// <summary>
    /// Handler for the edit event from a recipient in the input field.
    /// </summary>
    /// <param name="withAnimation" type="Boolean">True if animation is desired.  False otherwise.</param>

    var recipient = this._recipients[this._highlightIndex];
    Debug.assert(!Jx.isNullOrUndefined(recipient));

    if (recipient) {
        // Copy the recipient's email address 
        var pasteText = this._recipients[this._highlightIndex].emailAddress;

        // Then Delete item from address well
        this._deleteHighlight(withAnimation);

        // Paste the copied text into the input field
        this._containerPasteHandler(pasteText);
    }
};

AddressWell.Input.prototype._inputRemoveHandler = function () {
    /// <summary>
    /// Handler to remove a highlight recipient.
    /// </summary>

    // Delete the highlight recipient
    this._deleteHighlight(true /* withAnimation */);
};

AddressWell.Input.prototype._deleteHandler = function (ev) {
    /// <summary>
    /// Handler for the delete or backspace event in the input field.
    /// </summary>
    /// <param name="ev" type="Event">The keyboard event.</param>

    // We only perform delete or backspace on recipient only if the input field is empty
    if (!Jx.isNonEmptyString(this._inputElement.value)) {
        var isBackspace = (ev.key === AddressWell.Key.backspace);

        var lastRecipientIndex = this._getIndexToLastRecipient();

        // Check if any object is being highlighted
        if (isBackspace && this._highlightIndex === -1) {
            // Simply highlight the recipient. Subsequent backspaces will actually
            // delete it.
            if (lastRecipientIndex >= 0) {
                this._highlight(this._recipients[lastRecipientIndex].item, true /*takeFocus*/);
            }
        } else if (this._highlightIndex !== -1) {
            // No animation if it's the last in the list.
            var withAnimation = (this._highlightIndex !== lastRecipientIndex && lastRecipientIndex !== 0);
            this._deleteHighlight(withAnimation);
        }
    } else {
        // Always adjusts the input field after removal of characters
        this.adjustInputFieldLength(true /* shouldUseCachedContainerWidth */);
    }
};

AddressWell.Input.prototype._arrowKeyHandler = function (ev) {
    /// <summary>
    /// Handler for the arrow key navigations.
    /// </summary>
    /// <param name="ev" type="Event">The keyboard event.</param>

    var arrowKey = ev.key;

    // Retrieves the current highlightArea attribute
    var currentHighlightArea = this.getAttr(AddressWell.highlightAreaAttr);

    // Use arrow key to highlight recipient only if:
    // 1) Input field is empty
    // 2) The entire address well's input area has highlight
    // 3) Arrow key is either left or right
    // Otherwise, fire the arrow key event so that other components can respond to it.
    if (!Jx.isNonEmptyString(this._inputElement.value) &&
        currentHighlightArea === AddressWell.HighlightArea.input &&
        (arrowKey === AddressWell.Key.arrowLeft || arrowKey === AddressWell.Key.arrowRight)) {

        var newIndex = -1;
        // Check if any recipient is being highlighted
        if (this._highlightIndex > -1) {
            // There's an already highlighted recipient

            if (arrowKey === AddressWell.Key.arrowLeft) {
                // Move index to the left of the highlighted recipient.
                // In the case that the highlighted recipient is already the first item of the list, this operation doesn't do anything
                for (var i = this._highlightIndex - 1; i >= 0; i--) {
                    // We will keep looking until we found a recipient object that is not null
                    if (!Jx.isNullOrUndefined(this._recipients[i])) {
                        newIndex = i;
                        break;
                    }
                }
            } else {
                if (this._highlightIndex === this._getIndexToLastRecipient()) {
                    // If user is already at the end of the list, clear highlight and put focus onto input field
                    this.clearHighlight();
                    this.focus();
                } else {
                    // Move index to the right of the highlighted recipient.
                    for (var j = this._highlightIndex + 1; j < this._recipients.length; j++) {
                        // We will keep looking until we found a recipient object that is not null
                        if (!Jx.isNullOrUndefined(this._recipients[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
            }
        } else {
            // No recipient is currently being highlighted
            // We only handle the left arrow in this case
            if (arrowKey === AddressWell.Key.arrowLeft) {
                // Try to highlight the element before input field, which is the element at the end of the recipient list
                newIndex = this._getIndexToLastRecipient();
            }
        }

        // Check if the new index is within range
        if (newIndex > -1 && newIndex < this._recipients.length) {
            // Highlights the element at the new index position
            this._highlight(document.getElementById(this._mapRecipientIndexToElementId(newIndex)), true /*takeFocus*/);
        }
    } else if (arrowKey === AddressWell.Key.arrowUp || arrowKey === AddressWell.Key.arrowDown || currentHighlightArea !== AddressWell.HighlightArea.input) {
        // We get here because:
        // 1) Input field is not empty, OR
        // 2) HighlightArea is not input, OR
        // 3) Arrow key is neither left nor right

        // Only fire the arrowKey event if the arrow key is up or down, or the highlightArea is not in the input field

        // Fires the arrowKey event so that other components listening on this event can respond to it.
        this.raiseEvent(AddressWell.Events.arrowKey, arrowKey);
    }
};

AddressWell.Input.prototype._viewProfileHandler = function (recipient) {
    /// <summary>
    /// Handler view-profile context-menu item.
    /// </summary>
    /// <param name="recipient" type="AddressWell.Recipient">The recipient whose profile will be launched</param>
    this.raiseEvent(AddressWell.Events.viewProfile, recipient);
};

AddressWell.Input.prototype._getIndexToLastRecipient = function () {
    /// <summary>
    /// Gets the index position to the last recipient element
    /// </summary>
    /// <returns type="Number">The index position to the last recipient element.</returns>
    var recipients = this._recipients;
    for (var i = recipients.length - 1; i >= 0; i--) {
        if (recipients[i] !== null) {
            return i;
        }
    }
    return -1;
};

AddressWell.Input.prototype._getRecipientIndex = function (recipientElement) {
    /// <summary>
    /// Extracts the id out of a given recipient HTML element.
    /// </summary>
    /// <param name="recipientElement" type="HTMLElement">The recipient HTML element.</param>
    /// <returns type="Number">The index number to the given recipient element.</returns>

    // Remove prefix string first
    var indexString = recipientElement.id.replace(this._itemIdBase, "");
    return parseInt(indexString, 10 /* radix */);
};

AddressWell.Input.prototype._mapRecipientIndexToElementId = function (recipientIndex) {
    /// <summary>
    /// Maps the recipient array index to the id of it's associated HTML element.
    /// </summary>
    /// <param name="recipientIndex" type="Number">The recipient index</param>
    /// <returns type="String"/>
    Debug.assert(Jx.isNumber(recipientIndex));
    return this._itemIdBase + recipientIndex.toString();
};

AddressWell.Input.prototype._deleteHighlight = function (withAnimation) {
    /// <summary>
    /// Deletes the currently highlighted recipient from DOM and recipients array
    /// </summary>
    /// <param name="withAnimation" type="Boolean">True if animation is desired.  False otherwise.</param>

    if (this._highlightIndex > -1) {
        // Cache the index for removal operations
        var highlightIndex = this._highlightIndex;
        this.deleteRecipientByIndex(highlightIndex, withAnimation, true /*preserveHighlight*/);
    }
};

AddressWell.Input.prototype._highlight = function (recipientElement, takeFocus) {
    /// <summary>
    /// Highlights a given recipient element in the DOM.
    /// Also scrollIntoView the element.
    /// </summary>
    /// <param name="recipientElement" type="HTMLElement">The recipient HTML element.</param>
    /// <param name="takeFocus" type="Boolean">Whether or not the highlighted recipient should take focus.</param>

    // Completes user input upon highlight
    this.completeUserInput(true /* Display tile view after completion */);

    // Remove current highlight effect
    this.clearHighlight();

    // Set highlight index
    this._highlightIndex = this._getRecipientIndex(recipientElement);

    // Add highlight effect visually
    Jx.addClass(recipientElement, this._highlightClass);

    recipientElement.tabIndex = -1;

    if (takeFocus) {
        // Steal the focus in the DOM in order for scrollIntoContainer to work later.
        // Trident doesn't scroll the container if active focus is set on the input element, which sits on the last row inside the container.
        recipientElement.focus();
    }

    recipientElement.removeAttribute("tabIndex");

    // Scroll into view the highlight recipient in case the element is not viewable inside the scrollable container
    AddressWell.scrollIntoContainer(this._rootElement, recipientElement);

    // Set attribute to signal that it's stealing highlight
    this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
};


AddressWell.Input.prototype._addRecipientsHtml = function (recipients) {
    /// <summary>
    /// Adds recipient objects into the DOM.
    /// </summary>
    /// <param name="recipients" type="Array">And array of AddressWell.Recipient objects.</param>
    var items = [];
    var indexOffset = this._recipients.length;
    Debug.assert(recipients.length > 0);

    // Removes placeholder if there's any
    if (this._inputElement.hasAttribute("placeholder")) {
        this._inputElement.removeAttribute("placeholder");
    }

    for (var i = 0; i < recipients.length; i++) {
        var recipient = /* @static_cast(AddressWell.Recipient) */recipients[i];
        var index = (indexOffset + i);
        recipient.setId(this._mapRecipientIndexToElementId(index));
        items.push(/* @type(HTMLElement)*/recipient.generateHTMLElement(index, this._isDisabled));
    }

    this._addRecipientsAnimation(items);
};

AddressWell.Input.prototype._addRecipientsAnimation = function (recipientElements) {
    /// <summary>
    /// Performs animation to add the given recipient elements into the DOM
    /// </summary>
    /// <param name="recipientElement" type="Array">The array of recipient elements to be added</param>

    var me = this;

    if (me._containerElement.children.length === 2) {
        // Before we add, if the list of recipient is originally zero, we will fire an event to indicate hasRecipients = true
        // (Note: we always have one child in the container, the input element.)
        me.raiseEvent(AddressWell.Events.hasRecipientsChanged, true);
    }

    var animationCompletedHandler = me._addRecipientsAnimationCompleted.bind(me);

    // If this._biciRecipientAddMethod is defined as a result of calling addRecipientsByString from the caller,
    // take this variable into account to determine the type of animation to perform
    if (me._biciRecipientAddMethod === AddressWell.RecipientAddMethod.typing) {
        // If the recipient is added as a result of user typing inside the input field, perform a fade in animation.

        // Getting ready to perform a fade in animation by setting the element's opacity to 0
        recipientElements.forEach(function (/*@type(HTMLElement)*/element) {
            element.style.opacity = "0";
            me._containerElement.insertBefore(element, me._inputElement);
        });
        this._isAnimating = true;
        WinJS.UI.Animation.fadeIn(recipientElements).then(
            // After item has been added successfully
            animationCompletedHandler,
            // Error handler
            function addRecipientAnimationError(exception) {
                Jx.log.exception("AddressWell.Input._addRecipientHtml has encountered an error during fade in animation", exception);
                animationCompletedHandler();
            }
        );
    } else if (me._biciRecipientAddMethod === AddressWell.RecipientAddMethod.preFilled) {        

        // If the recipients are added as a result of programatically prefilling the address well, do not perform any animation
        recipientElements.forEach(function (/*@type(HTMLElement)*/element) {
            me._containerElement.insertBefore(element, me._inputElement);
        });
        animationCompletedHandler();
        Jx.log.verbose("AddressWell.Input.addRecipientAnimation on page load - skipping animation.");
    } else {
        // For all other methods of adding a recipient, perform an add to list animation

        // Create addToList animation, affectedItems must be a non-live NodeList of element objects
        var affectedItems = this._containerElement.querySelectorAll("div.aw-inputContainer li");
        var addToListPromise = WinJS.UI.Animation.createAddToSearchListAnimation(recipientElements, affectedItems);

        // Add elements to DOM
        // This causes the affected items to change position
        recipientElements.forEach(function (/*@type(HTMLElement)*/element) {
            me._containerElement.insertBefore(element, me._inputElement);
        });

        this._isAnimating = true;
        // Execute the animation
        addToListPromise.execute().then(
            // After item has been added successfully
            animationCompletedHandler,
            // Error handler
            function addRecipientAnimationError(exception) {
                Jx.log.exception("AddressWell.Input._addRecipientHtml has encountered an error during add to list animation", exception);
                animationCompletedHandler();
            }
        );
    }
};

AddressWell.Input.prototype._addRecipientsAnimationCompleted = function () {
    /// <summary>
    /// Logic that gets called when the add-recipients animation has been successfully completed
    /// </summary>

    Jx.log.verbose("AddressWell.Input.addRecipientAnimationCompleted");
    this._isAnimating = false;

    // Ensure that we adjust the input element's length dynamically
    this.adjustInputFieldLength(true /* shouldUseCachedContainerWidth */);
    // Ensure that the root elements scrolls to the bottom such that input field is always in view
    this._rootElement.scrollTop = this._rootElement.scrollHeight;
};

AddressWell.Input.prototype._addRecipientsToCollection = function (recipients) {
    /// <summary>
    /// Adds recipients object into the recipients array.
    /// </summary>
    /// <param name="recipients" type="Array">The AddressWell.Recipient objects.</param>
    Debug.assert(Jx.isArray(recipients));

    this._recipients = this._recipients.concat(recipients);

    this.raiseEvent(AddressWell.Events.recipientsAdded, null);

    // Scan the list of recipients for any unresolved ones and invoke a auto-resolve request for each.
    msSetImmediate(/*@bind(AddressWell.Input)*/function () {
        recipients.forEach(/*@bind(AddressWell.Input)*/function (/*@dynamic*/recipient, index) {
            if ((recipient !== null) && (recipient.state === AddressWell.RecipientState.unresolved)) {
                this.raiseEvent(AddressWell.Events.autoResolve, { recipient: recipient, index: index });
            }
        }.bind(this));
    }.bind(this));
};

AddressWell.Input.prototype._highlightAreaChanged = function (attributeName, newValue) {
    /// <summary>
    /// Jx attribute changed for highlightArea
    /// </summary>
    /// <param name="attributeName" type="String">The name of the attribute.</param>
    /// <param name="newValue" type="String">The new value for the attribute.</param>
    
    Jx.log.verbose("AddressWell.Input._highlightAreaChanged: " + newValue);

    if (this._uiInitialized) {
        if (newValue !== AddressWell.HighlightArea.input) {
            // Clear all highlights when another component such as Drop Down that would steal the highlight focus
            this.clearHighlight();
        }
    }
};

AddressWell.Input.prototype._highlightIdChanged = function (attributeName, newValue) {
    /// <summary>
    /// Jx attribute changed for highlightId
    /// This means that a new item was highlighted in the dropdown, and the input element's aria values need to be updated.
    /// </summary>
    /// <param name="attributeName" type="String">The name of the attribute.</param>
    /// <param name="newValue" type="String">The new AddressWell.HighlightArea value for the attribute.</param>
    
    if (this._inputElement) {
        this._inputElement.setAttribute("aria-activedescendant", newValue);
    }
};

AddressWell.Input.prototype._dropDownVisibilityChanged = function (attributeName, newValue) {
    /// <summary>
    /// Jx attribute changed for dropDownVisibleAttr
    /// This means that dropdown has either been hidden or shown.
    /// </summary>
    /// <param name="attributeName" type="String">The name of the attribute.</param>
    /// <param name="newValue" type="Boolean">The new AddressWell.dropDownVisibleAttr value for the attribute.</param>

    if (this._inputElement) {
        if (newValue/*visible*/) {
            this._inputElement.setAttribute("aria-flowto", this.getAttr(AddressWell.firstDropDownItemId));
        } else {
            // The drop-down is hidden restore our external flow-to element.
            this._inputElement.setAttribute("aria-flowto", this._ariaFlowTo_external);
        }
    }
};

AddressWell.Input.prototype._updateAriaFlowAttributes = function (startingPoint, updateAllSuccessors) {
    /// <summary>
    /// Iterates over the list of recipients, at the given starting point, and sets the aria-flowto and x-ms-aria-flowfom attributes.
    /// </summary>
    /// <param name="startingPoint" type="HTMLElement">Update the aria properties beginnging with the given element</param>
    /// <param name="updateAllSuccessors" type="Boolean"/>
    Debug.assert(Jx.isHTMLElement(startingPoint));

    var curItem = startingPoint;
    do {
        var previousItem = curItem.previousSibling;
        var nextItem = curItem.nextSibling;

        if (nextItem) {
            curItem.setAttribute("aria-flowto", nextItem.id);
        } else {
            curItem.setAttribute("aria-flowto", this._ariaFlowTo_external);
        }
        if (previousItem) {
            curItem.setAttribute("x-ms-aria-flowfrom", previousItem.id);
            previousItem.setAttribute("aria-flowto", curItem.id);
        } else {
            curItem.setAttribute("x-ms-aria-flowfrom", this._ariaFlowFrom_external);
        }

        curItem = nextItem;
    } while (curItem && updateAllSuccessors)
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />
var _inputPanePadding = 10; //The desired padding between the bottom of the drop-down and the On-screen Keyboard
var _minListHeight = 212; // The minimum height the drop-down list will shrink to in order to accommodate the On-screen Keyboard.
var _minListHeightWithBottomButton = 155; // Same as above, but used when a buttom-button is present.

AddressWell.DropDown = /* @constructor */function (idPrefix, log, buttonType) {
    /// <summary>
    /// Constructor for the AddressWellDropDown class.
    /// </summary>
    /// <param name="idPrefix" type="String">HTML element id prefix for the control.</param>
    /// <param name="log" type="Jx.Log">The Jx.Log instance</param>
    /// <param name="buttonType" type="AddressWell.DropDownButtonType" optional="True"/>

    // Verify that idPrefix is not null or empty string
    if (!Jx.isNonEmptyString(idPrefix)) {
        throw new Error("idPrefix parameter must be a non-empty string");
    }

    this._log = log;

    this.initComponent();
    // Set up the highlighted area attribute
    this.attr(AddressWell.highlightAreaAttr, { changed: this._highlightAreaChanged });
    // Set up the highlighted ID attribute
    this.attr(AddressWell.highlightIdAttr);
    // Set up the dropDownVisible attribute
    this.attr(AddressWell.dropDownVisibleAttr);
    // Setup the firstDropDownItemId attribute
    this.attr(AddressWell.firstDropDownItemId);

    this._id = idPrefix + "DD";

    this._itemIdBase = idPrefix + "DDList";

    this._contacts = [];

    if (Jx.isNumber(buttonType)) {
        switch (buttonType) {
            case AddressWell.DropDownButtonType.roomsSelector:
                this._bottomButton = /* @static_cast(AddressWell.DropDownButton) */ new AddressWell.RoomsSelector(idPrefix);
                this.append(this._bottomButton);
                this._bottomButtonType = buttonType;
                break;
        };
    }

    // Define events for simple direct firing.  This is much faster than routing direct events via EventManager.
    Debug.Events.define(/* @static_cast(Object) */this,
                        AddressWell.Events.recipientsSelected,
                        AddressWell.Events.dropDownKeyDown,
                        AddressWell.Events.removePerson,
                        AddressWell.Events.searchLinkSelected,
                        AddressWell.Events.addressWellEscapeKey,
                        AddressWell.Events.dropDownReady);
};

Jx.augment(AddressWell.DropDown, Jx.Component);
Jx.augment(AddressWell.DropDown, Jx.Events);

// Member variables
AddressWell.DropDown.prototype._itemIdBase = ""; // Unique ID base for elements in the list view
AddressWell.DropDown.prototype._rootElement = /* @static_cast(HTMLElement) */null; // Abs positioned div containing dropdown UI
AddressWell.DropDown.prototype._containerElement = /* @static_cast(HTMLElement) */null; // Container for the dropdown list UI
AddressWell.DropDown.prototype._listElement = /* @static_cast(HTMLElement) */null; // Container for the list of elements in the drop down for the list view
AddressWell.DropDown.prototype._bottomElement = /* @static_cast(HTMLElement) */null; // The bottom element inside the container for scrolling into view
AddressWell.DropDown.prototype._uiInitialized = false; // Indicates whether the UI is available
AddressWell.DropDown.prototype._unbindListeners = /* @static_cast(Function) */null; // This function will unbind all the DOM event listeners on the dropdown
AddressWell.DropDown.prototype._contacts = /* @static_cast(Array) */ null; // This is the current array of contacts.  It is an array of AddressWell.Contact objects.
AddressWell.DropDown.prototype._currentView = AddressWell.DropDownView.none; // The last rendered view
AddressWell.DropDown.prototype._highlightIndex = -1; // Index of the current highlight
AddressWell.DropDown.prototype._log = /* @static_cast(Jx.Log) */null;
AddressWell.DropDown.prototype._bottomButton = /* @static_cast(AddressWell.DropDownButton) */null;
AddressWell.DropDown.prototype._bottomButtonType = AddressWell.DropDownButtonType.none;
AddressWell.DropDown.prototype._inputPaneTop = 0;
AddressWell.DropDown.prototype._inputPaneShowing = false;
AddressWell.DropDown.prototype._disabled = false;
AddressWell.DropDown.prototype._offsetLeft = 0;
AddressWell.DropDown.prototype._offsetTop = AddressWell.DropDown.borderWidthOffset; // 2px to compensate for border width
AddressWell.DropDown.prototype._isDropDownPointerDown = false;

Object.defineProperty(AddressWell.DropDown.prototype, "bottomButtonEnabled", { get: function () { return (this._bottomButton !== null); } });
Object.defineProperty(AddressWell.DropDown.prototype, "bottomButtonId", { get: function () { Debug.assert(this.bottomButtonEnabled); return this._bottomButton.id; } });
Object.defineProperty(AddressWell.DropDown.prototype, "currentView", { get: function () { return this._currentView; } });

var biciAddMethod = {};
biciAddMethod[AddressWell.DropDownView.peopleSearchList] = AddressWell.RecipientAddMethod.wordWheel;
biciAddMethod[AddressWell.DropDownView.connectedAccountList] = AddressWell.RecipientAddMethod.galSearch;
biciAddMethod[AddressWell.DropDownView.suggestionsList] = AddressWell.RecipientAddMethod.suggestions;

AddressWell.DropDown.prototype.activateUI = function () {
    /// <summary>
    /// Logic after UI has been initialized
    /// </summary>

    Jx.Component.prototype.activateUI.call(this);

    if (!this._uiInitialized) {
        // When this initially becomes available, highlight should be in the input.
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
        this._highlightIndex = -1;

        // Elements corresponds to HTML created in getUI
        this._rootElement = document.getElementById(this._id);
        this._containerElement = document.getElementById(this._id + "DDArea");
        this._bottomElement = document.getElementById(this._id + "DDBottom");
        this._listElement = document.getElementById(this._id + "DDList");

        // Bind click to the container.
        var clickHandler = this._itemClick.bind(this);
        var pointerDownHandler = this._itemPointerDown.bind(this);
        var pointerReleasedHandler = this._itemPointerReleased.bind(this);
        var containerKeyDownHandler = this._containerKeyDown.bind(this);

        this._containerElement.addEventListener(AddressWell.Events.msGestureTap, clickHandler, false);
        this._containerElement.addEventListener(AddressWell.Events.msPointerDown, pointerDownHandler, false);
        this._containerElement.addEventListener(AddressWell.Events.msPointerUp, pointerReleasedHandler, false);
        this._containerElement.addEventListener(AddressWell.Events.msPointerCancel, pointerReleasedHandler, false);
        this._containerElement.addEventListener(AddressWell.Events.msPointerOut, pointerReleasedHandler, false);
        this._containerElement.addEventListener(AddressWell.Events.keydown, containerKeyDownHandler, false);

        var escapeKeyHandler = /*@bind(AddressWell.DropDown)*/function () { this.raiseEvent(AddressWell.Events.addressWellEscapeKey); }.bind(this);

        var selectAllItemsHandler = this._selectAllItems.bind(this);
        if (this._bottomButton) {
            this._bottomButton.addListener(AddressWell.Events.addressWellEscapeKey, escapeKeyHandler, this);
            this._bottomButton.addListener(AddressWell.Events.selectAllItems, selectAllItemsHandler, this);
        }

        // Set up a function to unbind this later.
        this._unbindListeners = function () {
            this._containerElement.removeEventListener(AddressWell.Events.msGestureTap, clickHandler, false);
            this._containerElement.removeEventListener(AddressWell.Events.msPointerDown, pointerDownHandler, false);
            this._containerElement.removeEventListener(AddressWell.Events.msPointerUp, pointerReleasedHandler, false);
            this._containerElement.removeEventListener(AddressWell.Events.msPointerCancel, pointerReleasedHandler, false);
            this._containerElement.removeEventListener(AddressWell.Events.msPointerOut, pointerReleasedHandler, false);
            this._containerElement.removeEventListener(AddressWell.Events.keydown, containerKeyDownHandler, false);

            if (this._bottomButton) {
                this._bottomButton.removeListener(AddressWell.Events.addressWellEscapeKey, escapeKeyHandler, this);
                this._bottomButton.removeListener(AddressWell.Events.selectAllItems, selectAllItemsHandler, this);
            }
        };

        this._uiInitialized = true;
    }
};

AddressWell.DropDown.prototype.deactivateUI = function () {
    /// <summary>
    /// Logic to detach component from UI interaction.
    /// </summary>

    Jx.Component.prototype.deactivateUI.call(this);

    if (this._uiInitialized) {

        // Cancel any pending animations.
        this._cancelShowAnimation();
        this._cancelHideAnimation();

        this._reset();

        Debug.assert(this._unbindListeners, "Internal AddressWell error: unable to unbind the DOM event listeners on the dropdown");

        // Unbind the click handler on the dropdown
        this._unbindListeners();
        this._unbindListeners = null;

        this._containerElement = null;
        this._rootElement = null;
        this._uiInitialized = false;
    }
};

AddressWell.DropDown.prototype.getAriaControlledId = function () {
    /// <summary>
    /// Gets the ID of the element that is controlled by the AddressWell.Input
    /// </summary>
    /// <returns type="String">Returns the DOM element's ID.</returns>

    return this._containerElement.id;
};

AddressWell.DropDown.prototype.getRootElement = function () {
    /// <summary>
    /// Returns the root element for the component.
    /// This is used by the controller to make sure the size of the input and the dropdown are the same.
    /// </summary>
    /// <returns type="HTMLElement">Returns the root element.</returns>

    return this._rootElement;
};

AddressWell.DropDown.prototype.getUI = function (ui) {
    /// <summary>
    /// Constructs the UI object for this component.
    /// </summary>
    /// <param name="ui" type="JxUI">The UI object to set properties on.</param>

    var dropDownLabelAttribute = 'aria-label="' + Jx.escapeHtmlToSingleLine(Jx.res.getString(AddressWell.stringsPrefix + "awDropDownLabel")) + '"';

    var bottomButtonUI = "";
    var bottomButtonClass = "";
    var button = /*@static_cast(Jx.Component)*/this._bottomButton;
    if (button) {
        bottomButtonUI = Jx.getUI(button).html;
        bottomButtonClass = "aw-ddWithBottomButton";
    }

    ui.html = '<div id="' + this._id + '" class="aw-ddContainer ' + bottomButtonClass + '">' +
                    '<div id="' + this._id + 'DDArea" class="aw-ddArea" tabindex="-1" role="group" ' + dropDownLabelAttribute + '>' +
                        '<ul role="listbox" id="' + this._id + 'DDList" ' + dropDownLabelAttribute + '>' +
                        '</ul>' +
                    '</div>' + bottomButtonUI +
                    '<div id="' + this._id + 'DDBottom" class="aw-ddBottom"></div>' +
                '</div>';
};

AddressWell.DropDown.prototype.setInputPaneTop = function (inputPaneTop) {
    /// <summary>
    /// Invoked when the on-screen keyboard begins animating in, but is not ready for user interaction.
    /// </summary>
    this._inputPaneTop = inputPaneTop;
    this._inputPaneShowing = true;
    if (this.isVisible()) {
        this._adjustHeightForInputPane();
    }
};

AddressWell.DropDown.prototype.clearInputPaneTop = function () {
    /// <summary>
    /// Invoked when the on-screen keyboard begins hidding.
    /// </summary>
    this._containerElement.style.maxHeight = "";
    this._inputPaneTop = null;
    this._inputPaneShowing = false;
};

AddressWell.DropDown.prototype._adjustHeightForInputPane = function () {
    /// <summary>
    /// Adjusts the height of the drop-down area when the On-screen keyboar is present and would
    /// occlude a portion of the drop-down contents.
    /// </summary>
    if (this._inputPaneShowing) {
        var listBoundingRect = this._containerElement.getBoundingClientRect();
        var bottom = listBoundingRect.bottom;
        var minHeight = _minListHeight;

        // If there's a bottom button, get its bounding rect, otherwise just use the drop-down's list.
        if (this._bottomButton) {
            bottom = document.getElementById(this._bottomButton.id).getBoundingClientRect().bottom;
            minHeight = _minListHeightWithBottomButton;
        }

        // Check if the top of the keyboard is going to occlude the dropdown.
        if ((bottom + _inputPanePadding) > this._inputPaneTop) {
            // If so, see if we can shrink the dropdown's list height at all.
            var height = (listBoundingRect.height - ((bottom + _inputPanePadding) - this._inputPaneTop));
            this._containerElement.style.maxHeight = String(Math.max(height, minHeight)) + "px";
        }
    }
};


AddressWell.DropDown.prototype.handleCompleteKey = function () {
    /// <summary>
    /// Indicates that the currently selected item should be clicked/selected/sent to the input
    /// </summary>

    if (this._uiInitialized && this._highlightIndex > -1) {
        // If we are in list view, the highlight index corresponds to the node position of the DOM element
        this._itemClickOnElement(this._getDropDownElementByNodePosition(this._highlightIndex), AddressWell.InputMethod.keyboard);
    }
};

AddressWell.DropDown.prototype.handleArrowKey = function (key) {
    /// <summary>
    /// Handles the arrow key event
    /// </summary>
    /// <param name="key" type="String">The arrow key code.</param>

    if (this.constructor !== AddressWell.DropDown) {
        // TODO: Determine whether we'll have E2E unit tests from AddressWell.Input, and remove if so.
        throw new Error("Internal AddressWell error: 'this' is incorrect in handleArrowKey: " + this);
    }

    // Text view and progress view do not handle arrow keys
    if (this._currentView === AddressWell.DropDownView.text || this._currentView === AddressWell.DropDownView.progress) {
        return;
    }

    // Key behavior depends on the current highlighted area.
    // If the highlight is in the input, then we only transition to the dropdown on the down key.
    // If the highlight is in the dropdown, then we handle all the keys.
    // If the highlight is in the dropdown and we're in the first row, and the arrow key is up, the highlight goes back to the input.

    var currentHighlight = this.getAttr(AddressWell.highlightAreaAttr);

    if (currentHighlight === AddressWell.HighlightArea.input) {
        if (key === AddressWell.Key.arrowDown && this.isVisible()) {
            // If we just switch from input to drop down area, signal the highlight area change.
            this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown);
            // Automatically highlight the first item
            this._changeHighlight(0);
        } 
    } else if (currentHighlight === AddressWell.HighlightArea.dropDown) {
        this._arrowKeyList(key);
    }
};

AddressWell.DropDown.prototype.handlePageUpDownKey = function (key) {
    /// <summary>
    /// Handles the page up and page down key event only if the highlight is in list view
    /// </summary>
    /// <param name="key" type="String">The page key code.</param>

    if (this.getAttr(AddressWell.highlightAreaAttr) === AddressWell.HighlightArea.dropDown &&
        this._highlightIndex > -1 &&
        isListType(this._currentView)) {
        // The function only handles this event if the highlight is in list view

        var newIndex = -1;
        var interval = 5; // The interval of indices being jumped to
        if (key === AddressWell.Key.pageDown) {
            // Increment by interval until we reach the last item
            newIndex = Math.min(this._listElement.children.length - 1, this._highlightIndex + interval);
        } else if (key === AddressWell.Key.pageUp) {
            // Decrement by interval until we reach the first item
            newIndex = Math.max(0, this._highlightIndex - interval);
        }
        if (newIndex > -1) {
            this._changeHighlight(newIndex);
        }
    }
};

AddressWell.DropDown.prototype.hide = function () {
    /// <summary>
    /// Hides the drop down.
    /// </summary>
    if (this.isShowing()) {
        this._setVisibility(false, true /*animate*/, /*@bind(AddressWell.DropDown)*/function () {
            this._reset();
        }.bind(this));
    }
};

AddressWell.DropDown.prototype.isVisible = function () {
    /// <summary>
    /// Determines whether the dropdown is currently visible
    /// </summary>

    return this._uiInitialized && Jx.hasClass(this._rootElement, "aw-ddVisible") && (this._rootElement.currentStyle.opacity === "1");
};

AddressWell.DropDown.prototype.isShowing = function () {
    /// <summary>
    /// Similar to isVisible, but also checks if the drop-down's show animation is currently active.
    /// </summary>

    return this.isVisible() || (Jx.isObject(this._showAnimation));
};

AddressWell.DropDown.prototype.render = function (view, contacts, /*@dynamic*/connectedAccount, isImeActive) {
    /// <summary>
    /// Renders drop down component given a view and data
    /// </summary>
    /// <param name="view" type="Number">The AddressWell.DropDownView type for the drop down.</param>
    /// <param name="contacts" type="Array">A collection of contacts</param>
    /// <param name="connectedAccount" type="Object">The connected accounts. Caller can pass in null.</param>
    /// <param name="isImeActive" type="Boolean">Is IME active in the input control?</param>

    if (this._uiInitialized) {
        if (isListType(view)) {
            NoShip.only(this._log.perf("DropDown_RenderList_begin"));
            this._renderList(view, contacts, connectedAccount, isImeActive);
            NoShip.only(this._log.perf("DropDown_RenderList_end"));
        } else {
            Debug.assert(false, "AddressWell.DropDown.render does not support this view: " + /*@static_cast(String)*/view);
        }

        this._currentView = view;
    }
};

AddressWell.DropDown.prototype.renderProgress = function () {
    /// <summary>
    /// Renders the progress UI for search.
    /// </summary>

    this._reset();
    this._listElement.className = "aw-ddp";
    var labelHtml = Jx.escapeHtml(Jx.res.getString(AddressWell.stringsPrefix + "awSearching"));
    this._listElement.innerHTML = '<li aria-label="' + labelHtml + '">' +
                                        '<div aria-hidden="true">' +
                                            '<progress class="win-ring"></progress>' +
                                            '<span>' + labelHtml + '</span>' +
                                        '</div>' +
                                    '</li>';
    this._currentView = AddressWell.DropDownView.progress;
    this._setVisibility(true);
};

AddressWell.DropDown.prototype.renderText = function (text) {
    /// <summary>
    /// Renders the UI when given a text string.
    /// </summary>
    /// <param name="text" type="String">The text to display.</param>

    Debug.assert((Jx.isNonEmptyString(text)), "Text should not have been empty string in this code path");
    this._reset();
    this._listElement.className = "aw-ddt";
    var labelHtml = Jx.escapeHtml(text);
    this._listElement.innerHTML = '<li aria-label="' + labelHtml + '">' +
                                        '<div aria-hidden="true">' + labelHtml + '</div>' +
                                    '</li>';
    this._currentView = AddressWell.DropDownView.text;
    this._setVisibility(true);
};

AddressWell.DropDown.prototype.addAriaLive = function () {
    /// <summary>
    /// Sets the aria-live attribute on the list element if it's not set.
    /// This is not a general helper function to set aria-live attribute since it's only applicable to the specific drop down element.
    /// Setting this attribute allows Narrator to speak the progress text and the results text when they are rendered.
    /// Note: This attribute should be set as long as the user is interacting with the address well control.
    ///       If it's set later in the rendering process Narrator may not pick up the attribute right away.
    /// </summary>

    if (!this._listElement.hasAttribute("aria-live")) {
        this._listElement.setAttribute("aria-live", "polite");
    }
};

AddressWell.DropDown.prototype.removeAriaLive = function () {
    /// <summary>
    /// Removes the aria-live attribute on the list element if there is one
    /// </summary>

    if (this._listElement.hasAttribute("aria-live")) {
        this._listElement.removeAttribute("aria-live");
    }
};

AddressWell.DropDown.prototype.setAriaControls = function (id) {
    /// <summary>
    /// Given the ID of the appropriate input area, sets aria-controls on the elements that can change the input area.
    /// </summary>
    /// <param name="id" type="String">ID of the input area that can be changed by the dropdown</param>

    this._listElement.setAttribute("aria-controls", id);
    if (this._bottomButton) {
        this._bottomButton.setAriaControls(id);
    }
};

AddressWell.DropDown.prototype._getDropDownElementById = function (index) {
    /// <summary>
    /// Returns the DOM element corresponding to a given index that corresponds to the child element's ID in the drop down.
    /// </summary>
    /// <param name="index" type="Number">Index that corresponds to the child element's ID.</param>
    /// <returns type="HTMLElement">The DOM element corresponding to the given index.  Null if element cannot be located.</returns>

    return document.getElementById(this._itemIdBase + String(index));
};

AddressWell.DropDown.prototype._getDropDownElementByNodePosition = function (index) {
    /// <summary>
    /// Returns the DOM element corresponding to a given index that corresponds to the child element's node position relative to the parent list container.
    /// </summary>
    /// <param name="index" type="Number">Index that corresponds to the child element's node position relative to the parent list container.</param>
    /// <returns type="HTMLElement">The DOM element corresponding to the given index.  Null if element cannot be located.</returns>

    if (index >= 0 && index < this._listElement.children.length) {
        return this._listElement.children[index];
    } else {
        return null;
    }
};

AddressWell.DropDown.prototype._arrowKeyList = function (arrowKey) {
    /// <summary>
    /// Handles the arrow key event for list view
    /// </summary>
    /// <param name="arrowKey" type="String">Arrow key, should map to one of AddressWell.Key values for arrow keys.</param>

    // Left/right don't do anything for the list view
    if ((arrowKey === AddressWell.Key.arrowLeft) || (arrowKey === AddressWell.Key.arrowRight)) {
        return;
    }

    var currentHighlight = this._highlightIndex; // this._highlightIndex here corresponds to the index of the child element's node position inside the list element
    var newHighlight = 0;
    var maxHighlight = this._listElement.children.length - 1;

    if (arrowKey === AddressWell.Key.arrowUp) {
        // Go up
        newHighlight = currentHighlight - 1;
    } else { 
        // The only key remaining is down
        Debug.assert(arrowKey === AddressWell.Key.arrowDown, "Unexpected arrow key code in AddressWellDropDown: " + String(arrowKey));

        newHighlight = currentHighlight + 1;
    } 

    // Overflow behavior spec'd is to stay at the bottom when you hit down from the bottom
    newHighlight = Math.min(newHighlight, maxHighlight);

    if (newHighlight < 0) {
        // Transition to the input box
        // Attribute change handler will handle updates to the highlight.
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
    } else {
        this._changeHighlight(newHighlight);
    }
};

AddressWell.DropDown.prototype._changeHighlight = function (newHighlightIndex) {
    /// <summary>
    /// Apply highlight treatment to the element with the given index.
    /// Index corresponds to the position of the DOM element inside the _listElement container.  In the range of [0, listElement.children.length -1]
    /// </summary>
    /// <param name="newHighlightIndex" type="Number">Index of the new element to highlight</param>

    if (newHighlightIndex !== this._highlightIndex) {
        var /* @type(HTMLElement) */newElement = (newHighlightIndex < 0) ? null : this._getDropDownElementByNodePosition(newHighlightIndex);
        var /* @type(HTMLElement) */oldElement = (this._highlightIndex < 0) ? null : this._getDropDownElementByNodePosition(this._highlightIndex);

        this._updateHighlightUI(oldElement, newElement);

        this._highlightIndex = newHighlightIndex;
    }
};

AddressWell.DropDown.prototype._updateHighlightUI = function (oldElement, newElement) {
    /// <summary>
    /// Perform UI update to remove highlight styles from the old element, and apply highlight styles to the new element.
    /// Additionally this function calls scrollIntoContainer on the new element if it's available.
    /// </summary>
    /// <param name="oldElement" type="HTMLElement">The old element to remove highlight styles from.</param>
    /// <param name="newElement" type="HTMLElement">The new element to add highlight styles to.</param>

    // Remove highlight from the old element, add to new element
    if (oldElement) {
        oldElement.setAttribute("aria-selected", "false");
    }

    if (newElement) {
        newElement.setAttribute("aria-selected", "true");
        AddressWell.scrollIntoContainer(this._containerElement, newElement);
        this.setAttr(AddressWell.highlightIdAttr, newElement.id);
    } else {
        this.setAttr(AddressWell.highlightIdAttr, null);
    }
};

AddressWell.DropDown.prototype._highlightAreaChanged = function (attributeName, newValue) {
    /// <summary>
    /// Jx attribute changed for highlightArea.
    /// </summary>
    /// <param name="attributeName" type="String">Name of the changed attribute</param>
    /// <param name="newValue" type="String">New value of the attribute</param>
    
    Jx.log.verbose("AddressWell.DropDown._highlightAreaChanged: " + newValue);

    if (this._uiInitialized) {
        if (newValue !== AddressWell.HighlightArea.dropDown) {
            // Update the UI to handle the fact that we don't have highlight anymore.
            this._changeHighlight(-1);
        }
    }
};

AddressWell.DropDown.prototype._itemClick = function (ev) {
    /// <summary>
    /// Click handler for contacts in all views
    /// Handles events on the container element for the whole set of items
    /// </summary>
    /// <param name="ev" type="Event">DOM event</param>

    if (!this._disabled) {
        // For click, we'll select the element (if there is one), which puts the contact in the input as a completed item.
        var clickedElement = this._getSourceElement(ev);
        this._itemClickOnElement(clickedElement, AddressWell.InputMethod.mouseOrTouch);

        // Signal that the drop down is stealing highlight area
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown);
    }
};

AddressWell.DropDown.prototype._itemClickOnElement = function (clickedElement, inputMethod) {
    /// <summary>
    /// Handles the logic to perform click on a given DOM element
    /// </summary>
    /// <param name="clickedElement" type="HTMLElement">The DOM element receiving the click event.</param>
    /// <param name="inputMethod" type="AddressWell.InputMethod" optional="true">The input method used</param>

    if (!this._disabled) {
        if (!Jx.isNullOrUndefined(clickedElement)) {
            var dataIndexAttribute = clickedElement.getAttribute("data-awIndex");
            if (dataIndexAttribute.indexOf(AddressWell.dropDownSearchLinkPrefix) === 0) {
                this._selectSearchLink(clickedElement);
            } else {
                var clickedIndex = parseInt(dataIndexAttribute, 10 /* radix */);
                if (clickedIndex !== NaN) {
                    this._selectItem(clickedIndex, inputMethod);
                } // It's not an error if the clickedIndex is not a number (e.g. user clicks on the progress UI, or the text element inside the drop down), which is an no-op case
            }
        }
    }
};

AddressWell.DropDown.prototype._itemPointerDown = function (ev) {
    /// <summary>
    /// PointerDown handler for contacts in all views.
    /// Handles events on the container element for the whole set of items
    /// </summary>
    /// <param name="ev" type="Event">DOM event</param>
    this._isDropDownPointerDown = true;

    var sourceElement = this._getSourceElement(ev);
    if (!Jx.isNullOrUndefined(sourceElement)) {
        AddressWell.performPointerAnimation(sourceElement);

        // Don't allow this user action to taking focus away from the input.
        ev.preventDefault();
    }
};

AddressWell.DropDown.prototype._itemPointerReleased = function () {
    /// <summary>
    /// Pointer release handler for the dropdown list.
    /// </summary>
    this._isDropDownPointerDown = false;
    
    if (this._reflowImeOnPointerRelease) {
        // If an item is being tapped/clicked which causes IME to hide (if it was showing),
        // we need to reflow the dropdown list to move up after the pointer is released.
        this._reflowImeOnPointerRelease = false;
        this.adjustImeOffset(0);
    }
};

AddressWell.DropDown.prototype._getSourceElement = function (ev) {
    /// <summary>
    /// Click handler helper for contacts in all views.
    /// Contains common logic for _itemClick, _itemPointerDown.
    /// Returns the HTML element of the item being clicked on.
    /// </summary>
    /// <param name="ev" type="Event">DOM event</param>
    /// <returns type="HTMLElement">
    /// The source top level element for the contact where the event has occured, 
    /// or null if the user clicked outside of a contact.
    /// </returns>

    var clickedElement = ev.target;
    var foundElement = false;

    // The click may not have hit exactly on the element with the index; check up the tree a little in case we find it.
    for (var i = 0; i < 3 /* The element has three layers of children */; i++) {
        if (Jx.isNonEmptyString(clickedElement.getAttribute("data-awIndex"))) {
            foundElement = true;
            // Stop the loop once we've found the parent node
            break;
        }
        clickedElement = clickedElement.parentNode;
    }

    if (foundElement) {
        return clickedElement;
    } else {
        return null;
    }
};

AddressWell.DropDown.prototype._containerKeyDown = function (ev) {
    /// <summary>
    /// Keydown handler for the container.
    /// </summary>
    /// <param name="ev" type="Event">The keyboard event</param>

    // Fires an event to notify controller.
    this.raiseEvent(AddressWell.Events.dropDownKeyDown, ev);
};

AddressWell.DropDown.prototype._renderList = function (view, contacts, connectedAccount, isImeActive) {
    /// <summary>
    /// Renders the list view with the given contacts and the connected accounts
    /// </summary>
    /// <param name="view" type="Number">The AddressWell.DropDownView type for the drop down.</param>
    /// <param name="contacts" type="Array">Array of AddressWell.Contact to render</param>
    /// <param name="connectedAccount" type="Object">The connected accounts. Caller can pass in null.</param>
    /// <param name="isImeActive" type="Boolean">Is IME active in the input control?</param>

    // If the current view-type is 'none', we assume the dropdown was previously hidden, so
    // we'll want to animate it.
    // Suppress animation when IME is active since we have focus issue in the animation complete handler due to 
    // the work around for IE bug 339044. When focus gets blurred, the input control loses language that was previously set 
    // and revert to English. For details see bug 385281.
    var animate = this._currentView === AddressWell.DropDownView.none && !isImeActive;

    this._reset();

    // Set up list element for list view
    this._listElement.className = "aw-ddl";

    var connectedAccounts = [];
    if (connectedAccount) {
        connectedAccounts.push(connectedAccount);
    }

    var me = this;
    var listOfContactsHtml = this._getListOfContactsHtml(contacts);
    var searchLinksHtml = this._getSearchLinksHtml(connectedAccounts);

    var listElementInnerHtml = "";
    if (Jx.isNonEmptyString(listOfContactsHtml)) {
        // Add listElement to the DOM once it's all built up
        listElementInnerHtml += listOfContactsHtml;
    }
    if (Jx.isNonEmptyString(searchLinksHtml)) {
        // Add listElement to the DOM once it's all built up
        listElementInnerHtml += searchLinksHtml;
    }
    me._listElement.innerHTML = listElementInnerHtml;
    
    var isImeAciveAndNotKorean = isImeActive && (Windows.Globalization.Language.currentInputMethodLanguageTag !== "ko");

    // Also highlight the first contact element, if there's any
    if (!isImeAciveAndNotKorean && Jx.isNonEmptyString(listOfContactsHtml) && view !== AddressWell.DropDownView.suggestionsList) {
        this._changeHighlight(0);
        // Only in this scenario the highlight area attribute goes to the drop down since the first item is selected
        this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown);
    }

    Jx.setClass(this._containerElement, "empty", !Jx.isNonEmptyString(me._listElement.innerHTML));

    if (this._bottomButtonType === AddressWell.DropDownButtonType.roomsSelector) {
        var roomsSelector = /* @static_cast(AddressWell.RoomsSelector)*/ this._bottomButton;
        roomsSelector.setItemCount(contacts.length);
    }

    // Always, at least, show the bottom-button, if desired.
    if (Jx.isNonEmptyString(me._listElement.innerHTML) || !Jx.isNullOrUndefined(this._bottomButton)) {
        this._setVisibility(true, animate);
        this._currentView = view;
    }

    var firstItem = this._getDropDownElementByNodePosition(0);
    if (firstItem) {
        this.setAttr(AddressWell.firstDropDownItemId, firstItem.id);
    }
};

AddressWell.DropDown.prototype._getListOfContactsHtml = function (contacts) {
    /// <summary>
    /// Generates the HTML for a list of contacts
    /// </summary>
    /// <param name="contacts" type="Array">Array of AddressWell.Contact to render.</param>
    /// <returns type="String">HTML string for the list of contacts.</returns>

    var listItemHtml = "";
    if (contacts.length > 0) {
        for (var i = 0; i < contacts.length; i++) {
            var /* @type(AddressWell.Contact) */contact = contacts[i];
            var /* @type(Microsoft.WindowsLive.Platform.IRecipient)*/recipient = contact.recipients[0];

            var listItemNameInnerText;
            var listItemLabelHtml;
            var isEmailAvailable = Jx.isNonEmptyString(recipient.emailAddress);
            var emailEncoded = isEmailAvailable ? Jx.escapeHtmlToSingleLine(recipient.emailAddress) : "";

            if (Jx.isNonEmptyString(contact.person.calculatedUIName)) {
                listItemNameInnerText = contact.person.calculatedUIName;
                if (isEmailAvailable) {
                    listItemLabelHtml = Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awDropDownEntryLabel",
                        Jx.escapeHtmlToSingleLine(contact.person.calculatedUIName),
                        emailEncoded);
                } else {
                    listItemLabelHtml = Jx.escapeHtmlToSingleLine(contact.person.calculatedUIName);                        
                }
            } else {
                listItemNameInnerText = emailEncoded;
                listItemLabelHtml = emailEncoded;
                if (!isEmailAvailable) {
                    Jx.log.error("Error in AddressWell.DropDown._getListOfContactsHtml - First email and calculatedUIName is empty");
                }
            }

            var emailDiv = '<div aria-hidden="true" class="aw-ddlEmail">' + emailEncoded + '</div>';
            if (Jx.isRtl()) {
                // Email addresses should always render in LTR.
                emailDiv = '<div aria-hidden="true" class="aw-ddlEmail singleLineText" dir="ltr">' + emailEncoded + '</div>';
            }

            var listItemImgSrc = Jx.isNonEmptyString(contact.tile) ? contact.tile : "/ModernAddressWell/UserPawn.png";
            var tooltipProperty = isEmailAvailable ? '" title="' + emailEncoded : "";
            listItemHtml += '<li role="option" data-awIndex="' + i.toString() + '" id="' + this._itemIdBase + i.toString() + tooltipProperty + '" aria-label="' + listItemLabelHtml + '">' +
                                    '<img aria-hidden="true" src="' + listItemImgSrc + '" />' +
                                        '<div aria-hidden="true" class="aw-ddlName">' + Jx.escapeHtmlToSingleLine(listItemNameInnerText) + '</div>' +
                                        emailDiv +
                                '</li>';

            // Add the corresponding contact to the contacts list
            this._contacts.push(contact);
        }
    }
    return listItemHtml;
};

AddressWell.DropDown.prototype._getSearchLinksHtml = function (connectedAccounts) {
    /// <summary>
    /// Generates the HTML for search links for each connected account inside the drop down
    /// </summary>
    /// <param name="connectedAccounts" type="Array">An array of connected accounts. Caller can pass in null.</param>
    /// <returns type="String">HTML string for the search links</returns>

    var searchLinksHtml = "";
    if (!Jx.isNullOrUndefined(connectedAccounts)) {
        try {
            var count = connectedAccounts.length;
            var account = null;
            var listItemLabelHtml = "";
            for (var i = 0; i < count; i++) {
                account = /* @static_cast(Microsoft.WindowsLive.Platform.IAccount) */ connectedAccounts[i];
                listItemLabelHtml = Jx.escapeHtml(Jx.res.loadCompoundString(AddressWell.stringsPrefix + "awSearchEntryPoint", account.displayName));
                searchLinksHtml += '<li id="' + this._itemIdBase + AddressWell.dropDownSearchLinkPrefix + i.toString() + '"' +
                                        ' data-awIndex="' + AddressWell.dropDownSearchLinkPrefix + account.objectId + '"' + 
                                        ' role="option"' +
                                        ' aria-label="' + listItemLabelHtml + '"' +
                                        ' class="aw-sl">' +
                                            '<div aria-hidden="true">' + listItemLabelHtml + '</div>' +
                                    '</li>';
            }
        } catch (e) {
            Jx.log.exception("An error has occurred in AddressWell.DropDown._getSearchLinksHtml", e);
        }
    }
    return searchLinksHtml;
};

AddressWell.DropDown.prototype._reset = function () {
    /// <summary>
    /// Resets internal state associated with currently rendered contacts, including:
    /// - _contacts array
    /// - currently highlighted item + highlightArea
    /// </summary>

    this._disabled = false;
    this._contacts = [];
    this._listElement.innerHTML = "";
    this._currentView = AddressWell.DropDownView.none;
    this.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input); // Also changes _highlightIndex
};

AddressWell.DropDown.prototype._selectItem = function (index, inputMethod) {
    /// <summary>
    /// Shared logic between handleCompleteKey and _itemClick 
    /// Takes the given item and selects it, sending it to the input, and fixing up the UI.
    /// </summary>
    /// <param name="index" type="Number">Item index to be selected</param>
    /// <param name="inputMethod" type="AddressWell.InputMethod" optional="true">The input method used to select the item</param>

    var addContact = true;

    // Add bici value for clicking from list view, or wordwheel
    var recipientAddMethod = biciAddMethod[this._currentView];
    Jx.bici.addToStream(AddressWell.selectionBiciId, recipientAddMethod, 1 /* number of recipients */);

    if (this._currentView === AddressWell.DropDownView.suggestionsList) {
        Jx.bici.addToStream(AddressWell.addressWellSuggestionRank, index/*suggestionRank*/, this._contacts.length/*suggestionCount*/);
    }
    
    var contact = /* @static_cast(AddressWell.Contact) */this._contacts[index];
    // Raise an event to send the added contact to the caller
    var recipient = contact.recipients[0];
    this.raiseEvent(AddressWell.Events.recipientsSelected, { recipients: [recipient], inputMethod: inputMethod || AddressWell.InputMethod.unknown } );
};

AddressWell.DropDown.prototype._selectAllItems = function () {
    /// <summary>
    /// Handler for the AddressWell.Events.selectAllItems event, raised by the RoomsSelector button.
    /// </summary>
    var recipients = this._contacts.map(function (/*@dynamic*/contact) {
        return contact.recipients[0];
    });
    // Raise an event to send the added recipients to the controller
    this.raiseEvent(AddressWell.Events.recipientsSelected, { recipients: [recipient] });
};

AddressWell.DropDown.prototype._selectSearchLink = function (clickedElement) {
    /// <summary>
    /// Given a search link element, this function kicks off the search process by invoking the search link.
    /// </summary>
    /// <param name="clickedElement" type="HTMLElement">The search link element.</param>
    
    var dataIndexAttribute = clickedElement.getAttribute("data-awIndex");
    if (Jx.isNonEmptyString(dataIndexAttribute) && dataIndexAttribute.indexOf(AddressWell.dropDownSearchLinkPrefix) === 0) {
        // The data attribute value is consisted of AddressWell.dropDownSearchLinkPrefix + search link account ObjectId.
        // We will remove the AddressWell.dropDownSearchLinkPrefix part and obtain the ObjectId part.
        // Raise an event to notify that the user has selected a search link from the drop down, passing in the object Id as parameter.
        var objectIdString = dataIndexAttribute.substr(AddressWell.dropDownSearchLinkPrefix.length);
        this.raiseEvent(AddressWell.Events.searchLinkSelected, objectIdString);
    }
};

AddressWell.DropDown.prototype._reserveHeight = function () {
    /// <summary>
    /// Calculates and sets the height of the drop-down just prior to it being shown.
    /// </summary>
    this._rootElement.style.opacity = "0";  // We don't want it to show just yet.
    this._rootElement.ariaHidden = false;
    Jx.addClass(this._rootElement, "aw-ddVisible");

    this._adjustHeightForInputPane();
};

AddressWell.DropDown.prototype._onShowComplete = function (onComplete, notify) {
    Jx.log.info("DropDown._onShowComplete");

    this._disabled = false;

    // Update the attribute to be visible
    this.setAttr(AddressWell.dropDownVisibleAttr, true);

    this._showAnimation = null;

    if (notify) {
        this.raiseEvent(AddressWell.Events.dropDownReady);
    }

    if (onComplete) {
        onComplete.call();
    }
};

AddressWell.DropDown.prototype._onHideComplete = function (onComplete) {
    Jx.log.info("DropDown._onHideComplete");

    this._disabled = false;

    this._hideAnimation = null;

    Jx.removeClass(this._rootElement, "aw-ddVisible");
    this._rootElement.ariaHidden = true;

    // Update the attribute to not be visible
    this.setAttr(AddressWell.dropDownVisibleAttr, false);

    if (onComplete) {
        onComplete.call();
    }
};

AddressWell.DropDown.prototype._cancelShowAnimation = function () {
    /// <summary>
    /// Cancels the outstanding show-popup animation, if any.
    /// </summary>
    /// <returns type="Boolean">Whether or not there was an operation to cancel.</return>
    if (this._showAnimation) {
        this._disabled = false;
        this._showCompleteHandler = Jx.fnEmpty;
        this._showAnimation.cancel();
        this._showAnimation = null;
        Jx.log.info("DropDown, Cancelling show animation");
        return true;
    }
    return false;
};

AddressWell.DropDown.prototype._cancelHideAnimation = function () {
    /// <summary>
    /// Cancels the outstanding hide-popup animation, if any.
    /// </summary>
    /// <returns type="Boolean">Whether or not there was an operation to cancel.</return>
    if (this._hideAnimation) {
        this._disabled = false;
        this._hideCompleteHandler = Jx.fnEmpty;
        this._hideAnimation.cancel();
        this._hideAnimation = null;
        Jx.log.info("DropDown, Cancelling hide animation");
        return true;
    }
    return false;
};

AddressWell.DropDown.prototype._setVisibility = function (visible, animate, onComplete) {
    /// <summary>
    /// Sets visibility styles on this component.
    /// </summary>
    /// <param name="visible" type="Boolean">True if the drop down needs to be visible.</param>
    /// <param name="animate" type="Boolean" optional="true"/>
    /// <param name="onComplete" type="Function" optional="true"/>

    if (visible) {
        this._disabled = true;

        this._cancelHideAnimation();

        this._reserveHeight();

        this._rootElement.style.opacity = "1";
            
        this._rootElement.style.left = this._offsetLeft + "px";
        this._rootElement.style.marginTop = this._offsetTop  + "px";

        if (animate) {
            this._showCompleteHandler = /*@bind(AddressWell.DropDown)*/this._onShowComplete.bind(this, onComplete, true/*notify*/);

            this._showAnimation = WinJS.UI.Animation.showPopup(this._rootElement, { top: "-30px", left: "0px" });
            this._showAnimation.done(/*@bind(AddressWell.DropDown)*/function () { this._showCompleteHandler.call() }.bind(this));
        } else {
            this._onShowComplete(onComplete, false/*notify*/);
        }

    } else {

        if (this._cancelShowAnimation()) {
            this._onHideComplete(onComplete);
        } else {
            if (animate) {
                this._disabled = true;

                // If we don't set this the drop-down will flicker before disappearing after the animation completes
                this._rootElement.style.opacity = "0";

                this._hideCompleteHandler = /*@bind(AddressWell.DropDown)*/this._onHideComplete.bind(this, onComplete);

                this._hideAnimation = WinJS.UI.Animation.hidePopup(this._rootElement);
                this._hideAnimation.done(/*@bind(AddressWell.DropDown)*/function () { this._hideCompleteHandler.call(); }.bind(this));
            } else {
                this._onHideComplete(onComplete);
            }
        }
    }
};

AddressWell.DropDown.prototype.setDropdownLeftOffset = function (offsetLeft) {
    this._offsetLeft = offsetLeft + AddressWell.dropDownBorderWidthOffset;
    this._rootElement.style.left = this._offsetLeft + "px";
};

AddressWell.DropDown.prototype.adjustImeOffset = function (offsetTop) {
    if (!this._isDropDownPointerDown) {
        this._offsetTop = (offsetTop > 0) ? offsetTop + 2 * AddressWell.dropDownBorderWidthOffset + 4 : AddressWell.dropDownBorderWidthOffset;
        this._rootElement.style.marginTop = this._offsetTop + "px";
    } else {
        this._reflowImeOnPointerRelease = true;
    }
};

function isListType(view) {
    /// <summary>
    /// Given a dropdown view type, determines if it's a list type.
    /// </summary>
    /// <param name="view" type="AddressWell.DropDownView "/>
    return (view === AddressWell.DropDownView.peopleSearchList ||
            view === AddressWell.DropDownView.connectedAccountList ||
            view === AddressWell.DropDownView.suggestionsList);
}



;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

/*jshint browser:true*/
/*global Windows,Debug,Jx,AddressWell*/

AddressWell.PeoplePicker = /* @constructor */function () {
    /// <summary>
    /// Constructor for the AddressWellPeoplePicker class.
    /// </summary>

    // Define events that this component can trigger.
    // Events are used for simple direct firing.  This is much faster than routing direct events via EventManager.
    Debug.Events.define(/* @static_cast(Object) */this,
                        AddressWell.Events.addPeopleFromPicker);
};

// Defines this class as a component.
Jx.augment(AddressWell.PeoplePicker, Jx.Events);

AddressWell.PeoplePicker.prototype.launchPeoplePicker = function () {
    /// <summary>
    /// Launches the people picker and feeds the results to the input.
    /// </summary>
    var Contacts = Windows.ApplicationModel.Contacts;
    var peoplePicker = new Contacts.ContactPicker();
    peoplePicker.selectionMode = Contacts.ContactSelectionMode.fields;
    peoplePicker.desiredFieldsWithContactFieldType.append(Contacts.ContactFieldType.email);
    peoplePicker.commitButtonText = Jx.res.getString(AddressWell.stringsPrefix + "awPeoplePickerAdd");

    try {
        peoplePicker.pickContactsAsync().done(
            /* onComplete */ this._pickerResults.bind(this),
            /* onError */ function errorCallback(ex) {
                Jx.fault("AddressWell.AddressWellPeoplePicker.js", "launchPeoplePickerCallback", ex);
            });
    } catch (e) {
        // Log the error and don't do anything
        Jx.fault("AddressWell.AddressWellPeoplePicker.js", "launchPeoplePicker", e);
    }
};

AddressWell.PeoplePicker.prototype._pickerResults = function (results) {
    /// <summary>
    /// Processes results from People Picker and fires an event if there are emails to add from the results.
    /// </summary>
    /// <param name="results" type="Array">A collection of contact objects.</param>

    if (!Jx.isNullOrUndefined(results) && (results.length > 0)) {
        // Raise an event that with Picker results as a parameter
        this.raiseEvent(AddressWell.Events.addPeopleFromPicker, results);
    }
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

AddressWell.Recipient = /* @constructor */function (recipient, initialState) {
    /// <summary>
    /// Constructor for the Recipient class which wraps and IRecipient object and 
    /// provides some common Entity functionality on that object.
    /// </summary>
    /// <param name="recipient" type="Microsoft.WindowsLive.Platform.IRecipient">
    /// The IRecipient object to wrap
    /// </param>
    /// <param name="initialState" type="AddressWell.RecipientState" optional="true">
    /// The initial state of the recipient
    /// </param>
    Debug.assert(!Jx.isNullOrUndefined(recipient));
    this._recipient = recipient;
    this._state = initialState || AddressWell.RecipientState.unresolved;

    if (Jx.isNullOrUndefined(initialState)) {
        if (!Jx.isNullOrUndefined(recipient.person)) {
            this._state = AddressWell.RecipientState.resolved;
        }
    }

    // Define events that this object can trigger.
    // Events are used for simple direct firing.  This is much faster than routing direct events via EventManager.
    Debug.Events.define(/* @static_cast(Object) */this,
                        AddressWell.RecipientEvents.deleted,
                        AddressWell.RecipientEvents.stateChanged);
};

Jx.augment(AddressWell.Recipient, Jx.Events);

// Member variables
AddressWell.Recipient.prototype._recipient = /* @static_cast(Microsoft.WindowsLive.Platform.IRecipient) */ null;
AddressWell.Recipient.prototype._recipientTemplate = /* @static_cast(HTMLElement) */null;
AddressWell.Recipient.prototype._state = /* @static_cast(AddressWell.RecipientState)*/AddressWell.RecipientState.unresolved;
AddressWell.Recipient.prototype._recipientItem = /* @static_cast(HTMLElement)*/null;
AddressWell.Recipient.prototype._id = /* @static_cast(String)*/null;

Object.defineProperty(AddressWell.Recipient.prototype, "id", { get: function () { return this._id; } });
Object.defineProperty(AddressWell.Recipient.prototype, "calculatedUIName", { get: function () { return this._recipient.calculatedUIName; } });
Object.defineProperty(AddressWell.Recipient.prototype, "emailAddress", { get: function () { return this._recipient.emailAddress; } });
Object.defineProperty(AddressWell.Recipient.prototype, "person", { get: function () { return this._recipient.person; } });
Object.defineProperty(AddressWell.Recipient.prototype, "isJsRecipient", { get: function () { var /*@dynamic*/recipient = this._recipient; return recipient.isJsRecipient; } });
Object.defineProperty(AddressWell.Recipient.prototype, "deleteOnBackspace", { get: function () { return (!Jx.isNullOrUndefined(this._recipient.person) && Jx.isNonEmptyString(this._recipient.person.objectId)); } });
Object.defineProperty(AddressWell.Recipient.prototype, "state", { get: function () { return this._state; } });
Object.defineProperty(AddressWell.Recipient.prototype, "item", { get: function () { return this._recipientItem; } });
Object.defineProperty(AddressWell.Recipient.prototype, "internalRecipient", { get: function () { return this._recipient; } });

/* @constructor*/function StateUiInfo() { }
StateUiInfo.prototype = {
    styleClass: /*@static_cast(String)*/null,
    ariaLabelId: /* @static_cast(String)*/null,
};

var mapStateToUiInfo = [];
mapStateToUiInfo[AddressWell.RecipientState.resolved] = { styleClass: "aw-resolved", ariaLabelId: "awDropDownEntryLabel" };
mapStateToUiInfo[AddressWell.RecipientState.unresolved] = { styleClass: "aw-unresolved", ariaLabelId: "awUnresolvedLabel" };
mapStateToUiInfo[AddressWell.RecipientState.unresolvable] = { styleClass: "aw-unresolved", ariaLabelId: "awUnresolvedLabel" };
mapStateToUiInfo[AddressWell.RecipientState.pendingResolution] = { styleClass: "aw-unresolved", ariaLabelId: "awPendingLabel" };
mapStateToUiInfo[AddressWell.RecipientState.invalid] = { styleClass: "aw-invalid", ariaLabelId: "awInvalidLabel" };

AddressWell.Recipient.fromEmail = function (email, personName, contactsPlatform) {
    /// <summary>
    /// This helper function calls the Contacts Platform to resolve into a recipient object given an email and a person's name.
    /// It returns a dummy recipient structure if it's unable to resolve into a valid recipient.
    /// </summary>
    /// <param name="platform" type=""/>
    /// <param name="email" type="String"/>
    /// <param name="personName" type="String"/>
    /// <param name="contactsPlatform" type="Microsoft.WindowsLive.Platform.Client"/>
    /// <returns type="AddressWell.Recipient">
    /// The resulting IRecipient object wrapped in a Recipient object.
    /// </returns>

    var recipient = /*@static_cast(Microsoft.WindowsLive.Platform.IRecipient)*/null;
    var hasValidEmail = AddressWell.isEmailValid(email);

    try {
        if (Jx.isWWA &&
            contactsPlatform.peopleManager !== null &&
            hasValidEmail /* Contacts platform requires the input being a valid email (WinLive 475756) */) {
            // Calls contact platform's API to construct a recipient object
            recipient = contactsPlatform.peopleManager.loadRecipientByEmail(email, personName);
        }

    } catch (e) {
        Jx.fault("AddressWell.AddressWellRecipient.js", "fromEmail", e);
    }
    // We may get an invalid recipient object due to the following conditions:
    // 1. If we don't have a valid contact's platform
    // 2. If we encounter error from calling contact's platform

    // We will create a dummy recipient object with the expected structure if that happens.
    // However, any object created from JS cannot be passed back to the contacts platform, so we will also mark it as such.

    if (Jx.isNullOrUndefined(recipient)) {
        NoShip.log("AddressWell.Recipient.fromEmail: creating JS recipient for " + email);
        recipient = /*@static_cast(Microsoft.WindowsLive.Platform.IRecipient)*/{
            calculatedUIName: personName,
            emailAddress: email,
            person: null,
            isJsRecipient: true
        };
    }

    var recipientState = AddressWell.RecipientState.resolved;

    if (hasValidEmail) {
        // Verify that the domain is not black-listed.
        if (!AddressWell.isEmailDomainValid(email)) {
            // Untrusted domain, mark state as invalid.
            recipientState = AddressWell.RecipientState.invalid;
        }
    } else if (AddressWell.isPossibleAlias(email)) {
        // The email address looks like it could be an alias. Mark the state as unresolved.
        recipientState = AddressWell.RecipientState.unresolved;
    } else {
        // The email address is incorrectly formatted. Mark the state as invalid.
        recipientState = AddressWell.RecipientState.invalid;
    }

    return new AddressWell.Recipient(recipient, recipientState);
};

AddressWell.Recipient.fromPickerContact = function (contact) {
    /// <summary>
    /// Creates a Recipient object which represents the given Picker contact.
    /// </summary>
    /// <param name="contact" type="String"/>
    /// <returns type="AddressWell.Recipient"/>

};

AddressWell.Recipient.prototype.setDeleted = function () {
    /// <summary>
    /// Called when the recipient is deleted from the UI
    /// </summary>

    this._state = AddressWell.RecipientState.deleted;
    this._recipientItem = null;

    // Let any listeners--like the AutoResolver--know that this recipient is going away.
    this.raiseEvent(AddressWell.RecipientEvents.deleted, { sender: this });
};

AddressWell.Recipient.prototype.updateState = function (state, recipient) {
    /// <summary>
    /// Sets the state of the recipient using the given value and updates the UI as needed.
    /// </summary>
    /// <param name="state" type="AddressWell.RecipientState">The new state of the recipient</param>
    /// <param name="recipient" type="Microsoft.WindowsLive.Platform.IRecipient" optional="true">The (optional) replacement recipient
    /// This parameter is really only valid in the case where the state is switching from unresolved to resolved.</param>
    Debug.assert(this._state !== AddressWell.RecipientState.deleted);
    if (this._state !== state) {
        Debug.only(Jx.log.info("AddressWell.Recipient.updateState: old state = " + String(this._state) + ", new state = " + String(state)));
        var previousState = this._state;
        this._state = state;

        if (!Jx.isNullOrUndefined(recipient)) {
            Debug.assert(state === AddressWell.RecipientState.resolved, "A replacment IRecipient should not be passed to updateState() unless the state is switching to 'resovled'.");
            Debug.assert(!Jx.isNullOrUndefined(recipient.person), "The recplacement IRecipient is expected to be a resolved recipient (i.e. one with a person object).");
            this._recipient = recipient;

            // Update the visuals to reflect the new, resolved recipient data (e.g. display name).
            AddressWell.Recipient._applyRecipient(this._recipientItem, this);
        }

        // Update the visuals to reflect the new state of the recipient.
        AddressWell.Recipient._applyState(this._recipientItem, this, previousState);

        this.raiseEvent(AddressWell.RecipientEvents.stateChanged, { sender: this });
    }
};

AddressWell.Recipient.prototype.toString = function () {
    /// <summary>
    /// Returns the recipient in a string of name/email in the format of <![CDATA["Display Name" <email@email.com>;]]>.
    /// </summary>
    /// <returns type="String">
    /// Returns the string representation of the recipient object.
    /// </returns>
    var entry = '';

    if (Jx.isNonEmptyString(this.calculatedUIName)) {
        // Escape quotes, if there is any
        // Enclose name in quotes
        var displayName = /* @static_cast(String)*/this.calculatedUIName;
        entry += '"' + displayName.replace('"', '\"') + '" ';
    }
    if (Jx.isNonEmptyString(this.emailAddress)) {
        // Enclose email in angle brackets
        entry += '<' + this.emailAddress + '>';
    }
    if (Jx.isNonEmptyString(entry)) {
        entry += ';';
    }

    return entry;
};

AddressWell.Recipient.prototype.setId = function (id) {
    /// <summary>
    /// Sets the string identifier to be associated with this recipient in the UI.
    /// </summary>
    /// <param name="id" type="String"/>
    this._id = id;
};

AddressWell.Recipient.prototype.generateHTMLElement = function (index, disabled) {
    /// <summary>
    /// Generates recipient object's DOM object, to be inserted later.
    /// </summary>
    /// <param name="index" type="Number">The index of the item in the list.</param>
    /// <param name="disabled" type="Boolean">True if the element should be renedered as disabled</param>
    /// <return type="HTMLElement">The HTML Element representing the Recipient</return>

    var recipientTemplate = this._recipientTemplate;
    if (!Jx.isHTMLElement(recipientTemplate)) {
        recipientTemplate = this._recipientTemplate = document.createElement("li");
        recipientTemplate.setAttribute("role", "option");
        recipientTemplate.innerHTML = "<div class='aw-recipientInner' aria-hidden='true'><span id='awRecipientName' class='aw-recipientName'></span></div>";
    }
    var recipientItem = this._recipientItem = recipientTemplate.cloneNode(true);

    Debug.assert(Jx.isNonEmptyString(this._id), "setID() should have been called with a valid Id before generateHTMLElement()");
    recipientItem.id = this._id;

    // Add custom property to the element that will be examined by the click handler
    recipientItem.setAttribute("data-awIndex", index.toString());

    AddressWell.Recipient._applyRecipient(recipientItem, this);
    AddressWell.Recipient._applyState(recipientItem, this);

    return recipientItem;
};

AddressWell.Recipient._applyRecipient = function (recipientItem, recipient) {
    /// <summary>
    /// Updates the UI of the recepient's DOM element with the given recipient data.
    /// </summary>
    /// <param name="recipientItem" type="HTMLElement">The DOM element to update.</param>
    /// <param name="recipient" type="AddressWell.Recipient">The recipient object to use</param>

    // Setting the title property will escape any HTML here
    recipientItem.title = recipient.emailAddress;

    // Set up text
    var textNode = recipientItem.querySelector(".aw-recipientName");
    textNode.innerText = _getRecipientDisplayText(recipient);
};

AddressWell.Recipient._applyState = function (recipientItem, recipient, previousState) {
    /// <summary>
    /// Updates the UI of the recipient's DOM element to reflect the current state of the recipient.
    /// </summary>
    /// <param name="recipientItem" type="HTMLElement">The DOM element to update.</param>
    /// <param name="state" type="AddressWell.Recipient">The recipient whose state will be used.</param>
    /// <param name="previousState" type="AddressWell.RecipientState" optional="true">The previous state of the recipient</param>
    var emailAddress = recipient.emailAddress;
    var displayText = _getRecipientDisplayText(recipient);
    
    if (Jx.isNumber(previousState)) {
        var uiInfoPrevious = /*@static_cast(StateUiInfo)*/mapStateToUiInfo[previousState];
        Jx.removeClass(recipientItem, uiInfoPrevious.styleClass);
    }

    var uiInfo = /*@static_cast(StateUiInfo)*/mapStateToUiInfo[recipient.state];
    Jx.addClass(recipientItem, uiInfo.styleClass);
    var ariaLabel = Jx.res.loadCompoundString(AddressWell.stringsPrefix + uiInfo.ariaLabelId, displayText, emailAddress);

    recipientItem.setAttribute("aria-label", ariaLabel);
};

function _getRecipientDisplayText(recipient) {
    /// <summary>
    /// Given a recipient, returns the UI display string to use for it.
    /// </summary>
    /// <param name="recipient" type="AddressWell.Recipient"/>
    /// <return type="String"/>
    return Jx.isNonEmptyString(recipient.calculatedUIName) ? recipient.calculatedUIName : recipient.emailAddress;
};


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

AddressWell.RecipientParser = /* @constructor */function (contactsPlatform, log) {
    /// <summary>
    /// Constructor for the RecipientParser class which parses a string of emails (e.g. "test@live.com;stevesi@microsoft.com") into IRecipient objects
    /// </summary>
    /// <param name="contactsPlatform" type="Microsoft.WindowsLive.Platform.Client">
    /// This is the contacts platform's object of type Microsoft.WindowsLive.Platform.Client.
    /// It is passed in by the hosting app since contacts platform is created only once per instance of WWAHost process, 
    /// and there can be multiple address well controls on the same page.
    /// </param>
    /// <param name="log" type="Jx.Log">
    /// The Jx.Log instance
    /// </param>
    this._log = log;
    this._platform = contactsPlatform;
};

// Member variables
AddressWell.RecipientParser.prototype._log = /* @static_cast(Jx.Log) */null;
AddressWell.RecipientParser.prototype._platform = null; // Contacts platform's object
AddressWell.RecipientParser.prototype._emailFromParser = "";
AddressWell.RecipientParser.prototype._personNameFromParser = "";
AddressWell.RecipientParser.prototype._parsingName = false;
AddressWell.RecipientParser.prototype._parsingEmail = false;
AddressWell.RecipientParser.prototype._stringBeforeSeparator = "";
AddressWell.RecipientParser.prototype._recipients = [];
AddressWell.RecipientParser.prototype._unparsedText = "";

/// The remaining part of the string that is not parsed and resolved into a recipient, if there is any.  Empty string if there's no remaining part.
/// For example, given a string of 'name@email.com; text', only 'name@email.com' is resolved into a recipient because it's terminated by a valid separator.
/// 'text' is being returned as a remaining part of the string at the end of the function call.
Object.defineProperty(AddressWell.RecipientParser.prototype, "unparsedText", {
    get: function () { return this._unparsedText; }
});

AddressWell.RecipientParser.prototype.parse = function (recipientsString) {
    /// <summary>
    /// Loops through a string, breaks it up into entries, and load or generates the associated IRecipient objects.
    /// Please note that this function does not terminate the string with an entry separator (e.g. semicolon), 
    /// as a result the remaining part of the string after the last entry separator will be returned at the end of the function call.
    /// </summary>
    /// <param name="recipientsString" type="String">
    /// A string of email/name entries separated by semicolon or comma according to MIME formats.
    ///     Examples:
    ///     <![CDATA[jiamin@hotmail.com; <jiamin@hotmail.com>, Jiamin Zhu <jiamin@hotmail.com>; "Jiamin Zhu" <jiamin@hotmail.com>]]>
    /// </param>
    /// <returns type="Array">
    /// The array of IRecipient objects that were parsed and loaded from the given string.
    /// </returns>

    this._resetAddRecipientsByStringProperties();

    // Save into a local variable since we will be modifying the string throughout the function
    var inputString = recipientsString;

    // Initiate the search for the first delimiter
    var delimiterIndex = inputString.search(AddressWell.delimiterRegExp);

    // Use a while loop to look for the next delimiter
    while (delimiterIndex > -1) {
        // Save the string before the delimiter to use throughout the function
        var stringBeforeDelimiter = inputString.substring(0, delimiterIndex);
        var delimiter = inputString.charAt(delimiterIndex);

        // We are not sure if we have hit a separator yet.  Save everything before the delimiter for use later
        this._stringBeforeSeparator += stringBeforeDelimiter;

        // Call the appropriate helper function based on the delimiter encountered
        if (delimiter.search(AddressWell.separatorRegExp) > -1) {
            this._loadRecipientsByStringSeparatorFound(stringBeforeDelimiter, delimiter);
        } else if (delimiter === '"') {
            this._loadRecipientsByStringQuotationFound(inputString, delimiterIndex);
        } else if (delimiter === '<') {
            this._loadRecipientsByStringLeftAngleBracketFound(stringBeforeDelimiter);
        } else if (delimiter === '>') {
            this._loadRecipientsByStringRightAngleBracketFound(stringBeforeDelimiter);
        }

        // Move on to the next delimiter
        if (inputString.length < delimiterIndex + 1) {
            // We are at the end of string, break out of the loop
            break;
        } else {
            // We are done with this portion of the string, remove everything before the delimiter and continue on to the next portion
            inputString = inputString.slice(delimiterIndex + 1);
            // Look for the next delimiter
            delimiterIndex = inputString.search(AddressWell.delimiterRegExp);
        }
    }

    // We are done with the input string.  Check if we have any unresolved text at this point
    if (Jx.isNonEmptyString(this._stringBeforeSeparator)) {
        // Since they are not terminiated by a valid separator and hence not resolved into recipients, put them back into the recipientsString
        inputString = this._stringBeforeSeparator + inputString;
    }

    this._unparsedText = inputString;

    // We run out of delimiters at this point so we will return the remaining part of the string to the caller
    return this._recipients;
};

AddressWell.RecipientParser.prototype._loadRecipientsByStringSeparatorFound = function (stringBeforeDelimiter, delimiter) {
    /// <summary>
    /// Helper function to populate name and email for a recipient in case a separator is found.
    /// It saves the states to be used later by its parent function _loadRecipientsByString.
    /// </summary>
    /// <param name="stringBeforeDelimiter" type="String">The string before the separator</param>
    /// <param name="delimiter" type="String">The separator character (e.g. comma or semicolon)</param>

    var stringBeforeDelimiterTrimmed = stringBeforeDelimiter.trim();

    // Found a separator, check to see if we are done
    if (!this._parsingName && !this._parsingEmail) {
        this._personNameFromParser = this._personNameFromParser.trim();
        this._emailFromParser = this._emailFromParser.trim();
        if (Jx.isNonEmptyString(this._emailFromParser) || Jx.isNonEmptyString(this._personNameFromParser)) {
            // If we have either an this._emailFromParser or a name
            if (Jx.isNonEmptyString(this._emailFromParser) && !Jx.isNonEmptyString(this._personNameFromParser)) {
                // If we don't have a name but we have this._emailFromParser
                if (Jx.isNonEmptyString(stringBeforeDelimiterTrimmed)) {
                    this._personNameFromParser = stringBeforeDelimiterTrimmed;
                } else {
                    this._personNameFromParser = this._emailFromParser;
                }
            } else if (Jx.isNonEmptyString(this._personNameFromParser) && !Jx.isNonEmptyString(this._emailFromParser)) {
                // If we don't have an this._emailFromParser but we have a name
                if (Jx.isNonEmptyString(stringBeforeDelimiterTrimmed)) {
                    this._emailFromParser = stringBeforeDelimiterTrimmed;
                } else {
                    this._emailFromParser = this._personNameFromParser;
                }
            }
        } else {
            // Both name and this._emailFromParser are empty
            if (stringBeforeDelimiterTrimmed.length > 0) {
                // If there are characters before the bracket
                this._personNameFromParser = this._emailFromParser = stringBeforeDelimiterTrimmed;
            }
        }
        if (Jx.isNonEmptyString(this._emailFromParser) && Jx.isNonEmptyString(this._personNameFromParser)) {
            // Only creates recipient object if this._emailFromParser and name are not empty
            // Add recipient to the input
            this._recipients.push(AddressWell.Recipient.fromEmail(this._emailFromParser, this._personNameFromParser, this._platform));
            // We have reached the end of parsing for this entry, reset this._emailFromParser and name values as well as temporary variable
            this._emailFromParser = this._personNameFromParser = this._stringBeforeSeparator = "";
        }
    } else if (this._parsingName) {
        // Name can contain these characters
        this._personNameFromParser += stringBeforeDelimiter + delimiter;
    } else if (this._parsingEmail) {
        // this._emailFromParser cannot contain these characters
        // We are done with parsing out the this._emailFromParser, and we are done with the entry
        this._emailFromParser += stringBeforeDelimiterTrimmed;
        if (!Jx.isNonEmptyString(this._personNameFromParser)) {
            // If name is empty at this point, set it to this._emailFromParser
            this._personNameFromParser = this._emailFromParser;
        }
        if (Jx.isNonEmptyString(this._emailFromParser) && Jx.isNonEmptyString(this._personNameFromParser)) {
            // Only creates recipient object if this._emailFromParser and name are not empty
            // Add recipient to the input
            this._recipients.push(AddressWell.Recipient.fromEmail(this._emailFromParser, this._personNameFromParser, this._platform));
            // We have reached the end of parsing for this entry, reset this._emailFromParser and name values as well as temporary variable
            this._emailFromParser = this._personNameFromParser = this._stringBeforeSeparator = "";
        }
        this._parsingEmail = false;
    }
};

AddressWell.RecipientParser.prototype._loadRecipientsByStringQuotationFound = function (recipientsString, delimiterIndex) {
    /// <summary>
    /// Helper function to populate name and email for a recipient in case a quotation mark is found.
    /// It saves the states to be used later by its parent function _loadRecipientsByString.
    /// </summary>
    /// <param name="recipientsString" type="String">A string of this._emailFromParser/name entries separated by semicolon or comma according to MIME formats</param>
    /// <param name="delimiterIndex" type="Number">The index of the quotation mark delimiter in the string</param>

    // Save the string before the delimiter to use throughout the function
    var stringBeforeDelimiter = recipientsString.substring(0, delimiterIndex);
    var stringBeforeDelimiterTrimmed = stringBeforeDelimiter.trim();
    var delimiter = recipientsString.charAt(delimiterIndex);

    // Save the delimiter into the unresolved string
    this._stringBeforeSeparator += delimiter;
    if (this._parsingName) {
        // If we already have data for name
        if (recipientsString.charAt(delimiterIndex - 1) === '\\') {
            // If last character ends with a backslash, we want to escape this quote and remove the backslash
            this._personNameFromParser += recipientsString.substring(0, delimiterIndex - 1) + delimiter;
        } else {
            // We are in the process of parsing name and we found another quoation mark.  We are done parsing the name.
            this._personNameFromParser += stringBeforeDelimiter;
            this._parsingName = false;
        }
    } else if (this._parsingEmail) {
        // this._emailFromParser must be in brackets, in this case we'll just pass over the string to this._emailFromParser
        this._emailFromParser += stringBeforeDelimiterTrimmed + delimiter;
    } else if (this._personNameFromParser.length === 0) {
        // We must be starting to parse a name at this point
        this._parsingName = true;
    }
};

AddressWell.RecipientParser.prototype._loadRecipientsByStringLeftAngleBracketFound = function (stringBeforeDelimiter) {
    /// <summary>
    /// Helper function to populate name and email for a recipient in case a left angle bracket is found.
    /// It saves the states to be used later by its parent function _loadRecipientsByString.
    /// </summary>
    /// <param name="stringBeforeDelimiterTrimmed" type="String">The string before the left angle bracket that has been trimmed</param>

    var delimiter = "<";
    var stringBeforeDelimiterTrimmed = stringBeforeDelimiter.trim();
    // Save the delimiter into the unresolved string
    this._stringBeforeSeparator += delimiter;
    if (this._parsingEmail && this._emailFromParser.length > 0) {
        // We are already in the state of parsing this._emailFromParser and it's invalid to get bracket again
        // We will treat this as the beginning of the this._emailFromParser by resetting the value of the current this._emailFromParser
        this._emailFromParser = "";
    } else if (this._parsingName) {
        // It's a valid character to be inside the name so we include it
        this._personNameFromParser += stringBeforeDelimiter + delimiter;
    } else if (this._emailFromParser.length === 0) {
        if (stringBeforeDelimiterTrimmed.length > 0) {
            // If there is a string before the bracket it must be the name
            if (this._personNameFromParser.length === 0) {
                // Make sure we don't have a name at this point in order to set the name
                this._personNameFromParser = stringBeforeDelimiterTrimmed;
            }
        }
        // We are in the state of parsing email, set the flag to true
        this._parsingEmail = true;
    }
};

AddressWell.RecipientParser.prototype._loadRecipientsByStringRightAngleBracketFound = function (stringBeforeDelimiter) {
    /// <summary>
    /// Helper function to populate name and email for a recipient in case a right angle bracket is found.
    /// It saves the states to be used later by its parent function _loadRecipientsByString.
    /// </summary>
    /// <param name="stringBeforeDelimiter" type="String">The string before the right angle bracket</param>

    var delimiter = ">";
    // Save the delimiter into the unresolved string
    this._stringBeforeSeparator += delimiter;
    if (this._parsingEmail) {
        // We are done with parsing out the this._emailFromParser
        this._emailFromParser += stringBeforeDelimiter;
        // We are in the process of parsing email and we found the closed angle bracket.  We are done parsing the email.
        this._parsingEmail = false;
    } else if (this._parsingName) {
        // It's a valid character to be inside the name so we include it
        this._personNameFromParser += stringBeforeDelimiter + delimiter;
    } else {
        // We are neither parsing this._emailFromParser nor parsing name
        // At this point it could be the beginning of a name
        if (this._personNameFromParser.length === 0) {
            // We only want to perform this if name is indeed empty
            this._personNameFromParser = stringBeforeDelimiter + delimiter;
            this._parsingName = true;
        }
    }
};

AddressWell.RecipientParser.prototype._resetAddRecipientsByStringProperties = function () {
    /// <summary>
    /// Internal function to reset the variables used by addRecipientsByString function and its helper functions.
    /// </summary>

    // Reset all saved variables for parsing
    this._emailFromParser = "";
    this._personNameFromParser = "";
    this._parsingName = false;
    this._parsingEmail = false;
    this._stringBeforeSeparator = "";
    this._recipients = [];
    this._unparsedText = "";
};
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

AddressWell.ServerSearch = /*@constructor*/function (contactsPlatform, log) {
    this._platform = contactsPlatform;
    this._log = log;
};

// Member variables
AddressWell.ServerSearch.prototype._platform = /* @static_cast(Microsoft.WindowsLive.Platform.Client) */null; // Contacts platform's object
AddressWell.ServerSearch.prototype._peopleManager = /* @static_cast(Microsoft.WindowsLive.Platform.IPeopleManager) */null; // Contacts platform's people manager object
AddressWell.ServerSearch.prototype._accountManager = /* @static_cast(Microsoft.WindowsLive.Platform.IAccountManager) */null; // Contacts platform's account manager object
AddressWell.ServerSearch.prototype._log = /* @static_cast(Jx.Log) */null;
AddressWell.ServerSearch.prototype._onComplete = /* @static_cast(Function) */null; // External listeners
AddressWell.ServerSearch.prototype._onError = /* @static_cast(Function) */null; // External listeners
AddressWell.ServerSearch.prototype._searchPending = false;

// Member variables for listview wordwheel/GAL results
AddressWell.ServerSearch.prototype._lvCollection = /* @static_cast(Microsoft.WindowsLive.Platform.ICollection) */ null;
AddressWell.ServerSearch.prototype._lvCollectionChangedHandler = /* @static_cast(Function) */ null;
AddressWell.ServerSearch.prototype._lvInput = "";
AddressWell.ServerSearch.prototype._lvResults = []; // The resulting array of AddressWell.Contacts object 
AddressWell.ServerSearch.prototype._lvCompleteCallback = /* @static_cast(Function) */null; // The callback function when the async search operation is finished
AddressWell.ServerSearch.prototype._lvSearchId = 0;
AddressWell.ServerSearch.prototype._lvSearchErrorType = AddressWell.SearchErrorType.none;
AddressWell.ServerSearch.prototype._lvConnectedAccount = /* @static_cast(Microsoft.WindowsLive.Platform.IAccount) */null;
AddressWell.ServerSearch.prototype._lvMinProgressTimeout = /*@static_cast(Number)*/null; // The minimum timeout required for the search progress
AddressWell.ServerSearch.prototype._lvMinProgressTimeoutCallback = /* @static_cast(Function) */null; // The callback function to be executed when the minimum progress timeout has expired
AddressWell.ServerSearch.prototype._lvSearchPromise = /* @static_cast(WinJS.Promise) */null;

Object.defineProperty(AddressWell.ServerSearch.prototype, "searchPending", { get: function () { return this._searchPending; } });

AddressWell.ServerSearch.prototype.queryAsync = function (input, connectedAccount, onComplete, onError) {
    /// <summary>
    /// Immediately perform a server-search for the give query. Such queries should be done in response to explicit user request.
    /// </summary>
    /// <param name="input" type="String">The given user input to search.</param>
    /// <param name="connectedAccount" type="Microsoft.WindowsLive.Platform.IAccount">The connected account to search for if there is one.</param>
    /// <param name="onComplete" type="Function"/>
    /// <param name="onError" type="Function"/>
    Debug.assert(Jx.isNonEmptyString(input));
    Debug.assert(!Jx.isNullOrUndefined(connectedAccount));
    Debug.assert(Jx.isFunction(onComplete));
    Debug.assert(Jx.isFunction(onError));

    this._lvInput = input;
    this._lvConnectedAccount = connectedAccount;
    this._onComplete = onComplete;
    this._onError = onError;
    this._searchPending = true;

    var initFunction = this._queryContactsByInputInit.bind(this);
    var cancelFunction = this._queryContactsByInputCancel.bind(this);
    this._lvSearchPromise  = new WinJS.Promise(initFunction/* init */ , cancelFunction/* onCancel */);

    // Set a timeout period for the completion of the search promise, automatically canceling the promise if it is not completed within the timeout period.

    // Note: Wrap the callbacks inside msSetImmediate so that it removes the callback from the promise call stack, allowing errors to propagate up to the global window error handler.
    WinJS.Promise.timeout(AddressWell.maxSearchDuration, this._lvSearchPromise).done(
        /*@bind(AddressWell.ServerSearch)*/function ControllerDisplayListViewConnectedAccountOnComplete(searchId) {
            /// <param name="searchId" type="Number">The current ID to identify the search in progress.</param>
            msSetImmediate(this._queryContactsByInputOnComplete.bind(this), searchId);
        }.bind(this)/* onComplete */,
        /*@bind(AddressWell.ServerSearch)*/function ControllerDisplayListViewConnectedAccountOnError(e) {
            /// <param name="e" type="String">The error string.</param>
            msSetImmediate(this._queryContactsByInputOnError.bind(this), e);
        }.bind(this)/* onError */);
};

AddressWell.ServerSearch.prototype.cancel = function () {
    if (this._lvSearchPromise !== null) {
        this._lvSearchPromise.cancel();
        this._lvSearchPromise = null;
    }
};

AddressWell.ServerSearch.prototype._queryContactsByInputInit = function (complete) {
    /// <summary>
    /// Initialize the process to perform wordwheel search.
    /// </summary>
    ///<param name="complete" type="Function">Completed callback</param>

    // Save the call back functions
    this._lvCompleteCallback = complete;

    // The resulting array of AddressWell.Contacts object
    this._lvResults = [];

    // Reset error type
    this._lvSearchErrorType = AddressWell.SearchErrorType.none;

    // Assign a new value to the search ID in order to keep track of the current search in process
    if (this._lvSearchId > AddressWell.maxSearchCounter) {
        this._lvSearchId = 0; // Restart from 0
    } else {
        this._lvSearchId++;
    }

    // Logging for performance counter on AddressWell's time to return results
    NoShip.only(this._log.perf("Controller_ConnectedAccountSearch_begin"));

    if (Jx.isWWA && this._platform !== null) {
        if (this._peopleManager === null) {
            // Caches the people manager object
            Jx.log.verbose("AddressWell.ServerSearch - setting peopleManager");

            this._peopleManager = this._platform.peopleManager;
        }
        if (this._peopleManager !== null) {

            // Clean up first in case there's already a search in progress
            this._lvCollectionDispose();

            // Initiate search asyn operation
            this._connectedAccountSearch();

        } else {
            Jx.log.error("Error in AddressWell.ServerSearch._queryContactsByInputInit - null peopleManager");
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            this._queryContactsByInputEnd();
        }
    } else {
        Jx.log.error("Error in AddressWell.ServerSearch._queryContactsByInputInit - null contacts platform");
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputEnd();
    }
};

AddressWell.ServerSearch.prototype._queryContactsByInputEnd = function () {
    /// <summary>
    /// End the process to perform wordwheel search, and cleanup all variables.
    /// </summary>

    // We are done with enumerating wordwheel results, signal the callback
    if (Jx.isFunction(this._lvCompleteCallback)) {
        Jx.log.verbose("AddressWell.ServerSearch._queryContactsByInputEnd is calling completeCallback function");

        // Note: msSetImmediate can be fired at a later time frame, as a result, hold on to the _lvCollection and the current search ID until the callback is actually being invoked
        this._lvCompleteCallback(this._lvSearchId);
    }

    // Logging for performance counter on AddressWell's time to return results
    NoShip.only(this._log.perf("Controller_ConnectedAccountSearch_end"));
};

AddressWell.ServerSearch.prototype._queryContactsByInputCancel = function () {
    /// <summary>
    /// Cancels the process to perform list view search, and cleanup all variables.
    /// This is usually called in the case the queryContactsByInput promise is cancelled (e.g. timeout event)
    /// </summary>

    Jx.log.verbose("AddressWell.ServerSearch._queryContactsByInputCancel");
    // Log the error as no results
    this._lvSearchErrorType = AddressWell.SearchErrorType.cancelled;
    this._queryContactsByInputEnd();
};

AddressWell.ServerSearch.prototype._connectedAccountSearch = function () {
    /// <summary>
    /// Initiate the process to search contacts given the user's connected account.
    /// This function sets up _lvCollection and _lvCollectionChangedHandler.
    /// </summary>

    Jx.log.verbose("AddressWell.ServerSearch._connectedAccountSearch");
    // Ensure that account is not null at this point
    if (this._lvConnectedAccount === null) {
        Jx.log.error("Null account detected in AddressWell.ServerSearch._connectedAccountSearch");
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputEnd();
    } else {
        try {
            this._lvCollection = this._peopleManager.searchServer(
                            this._lvInput,
                            AddressWell.maxConnectedAccountSearchResults,
                            /* @static_cast(Microsoft.WindowsLive.Platform.IAccount) */this._lvConnectedAccount,
                            0);  // Do not cache
            this._lvCollectionChangedHandler = this._lvCollectionChanged.bind(this);
            this._lvCollection.addEventListener("collectionchanged", this._lvCollectionChangedHandler);
            this._lvCollection.unlock();
        } catch (e) {
            Jx.fault("AddressWell.AddressWellController.js", "_connectedAccountSearch", e);
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            this._queryContactsByInputEnd();
        }
    }
};

AddressWell.ServerSearch.prototype._lvCollectionDispose = function () {
    /// <summary>
    /// Dispose the listview collection object and its collectionChanged handler if they are not null.
    /// Additionally reset the current promise object.
    /// </summary>

    if (this._lvCollection !== null) {
        Jx.log.verbose("AddressWell.ServerSearch._lvCollectionDispose resetting collection object and its collectionChanged handler");
        try {
            // A new collection object is created as a result of the search query, and it needs to be disposed. 
            // Not disposing collections will cause Microsoft.WindowsLive.Platform.Server.exe not shutting down.
            this._lvCollection.removeEventListener("collectionchanged", this._lvCollectionChangedHandler);
            this._lvCollection.dispose();
        } catch (e) {
            Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionDispose", e);
        } finally {
            this._lvCollection = /* @static_cast(Microsoft.WindowsLive.Platform.ICollection) */null;
            this._lvCollectionChangedHandler = /* @static_cast(Function) */ null;
        }
    }
    if (this._lvSearchPromise !== null) {
        // Cancels and resets the ongoing promise object if there's one
        Jx.log.verbose("AddressWell.ServerSearch._lvCollectionDispose cancelling current _lvSearchPromise");
        this._lvSearchPromise.cancel();
        this._lvSearchPromise = null;
    }
};

AddressWell.ServerSearch.prototype._lvCollectionChanged = function (eventArgs) {
    /// <summary>
    /// Handler for the collectionChanged event being fired on the listview collection.
    /// </summary>
    ///<param name="eventArgs" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs">The arguments that are set on the event when it's fired.</param>

    var collectionChangeType = /* @static_cast(Number) */eventArgs.eType;
    Jx.log.verbose("AddressWell.ServerSearch._lvCollectionChanged invoked with eventArgs.eType: " + collectionChangeType.toString());
    if (collectionChangeType === Microsoft.WindowsLive.Platform.CollectionChangeType.serverSearchComplete) {
        Jx.log.verbose("AddressWell.ServerSearch._lvCollectionChanged invoked with searchComplete");
        this._lvCollectionChangedSearchComplete(eventArgs);
    }
};

AddressWell.ServerSearch.prototype._lvCollectionChangedSearchComplete = function (eventArgs) {
    /// <summary>
    /// Handler for the search complete event.
    /// </summary>
    ///<param name="eventArgs" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs">The arguments that are set on the event when it's fired.</param>

    try {
        NoShip.log("AddressWell.ServerSearch._lvCollectionChangedSearchComplete invoked with totalCount: " + this._lvCollection.totalCount.toString());
        NoShip.log("AddressWell.ServerSearch._lvCollectionChangedSearchComplete invoked with count: " + this._lvCollection.count.toString());

        // Check eventArgs.index and set the corresponding error type
        Jx.log.verbose("AddressWell.ServerSearch._lvCollectionChangedSearchComplete searching connected account with eventArgs.index: " + eventArgs.index.toString());
        if (eventArgs.index === 1 /* Success case */ && this._lvCollection.count > 0) {
            // In an connected account search scenario, we are done at the search complete stage, loop through the results
            this._loopThroughCollection();
        } else {
            if (eventArgs.index === 3 /* Server Error */) {
                this._lvSearchErrorType = AddressWell.SearchErrorType.serverError;
            } else if (eventArgs.index === 7 /* Connection failed */) {
                this._lvSearchErrorType = AddressWell.SearchErrorType.connectionError;
            } else {
                // For status code other than success, as well as other cases that we don't expect here, treat it as no results
                Jx.log.error("AddressWell.ServerSearch._lvCollectionChangedSearchComplete searching connected account with eventArgs.index: " + /*@static_cast(String)*/eventArgs.index + " and _lvCollection.count: " + /*@static_cast(String)*/this._lvCollection.count);
                this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            }
            // Terminate the search for error cases
            this._queryContactsByInputEnd();
        }
    } catch (e) {
        Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionChangedSearchComplete", e);
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputEnd();
    }
};

AddressWell.ServerSearch.prototype._loopThroughCollection = function () {
    /// <summary>
    /// Helper function that loops through the collection of people objects to populate the resulting list of AddressWell.Contact objects.
    /// </summary>

    var maxItems = AddressWell.maxConnectedAccountSearchResults;
    try {
        var /* @type(Number) */peopleCount = this._lvCollection.count;
        NoShip.log("AddressWell.ServerSearch _loopThroughCollection with input '" + this._lvInput + "' - returns " + peopleCount.toString() + " items");
        if (peopleCount > 0) {
            var person = null;
            for (var count = 0; count < peopleCount; count++) {
                person = /* @static_cast(Microsoft.WindowsLive.Platform.IPerson) */this._lvCollection.item(count);
                // Processes query results and puts them into _lvResults array
                if (this._addPersonToSearchResults(this._lvResults, person) >= maxItems) {
                    // If we have reached the maximum number of results, break out of the loop
                    break;
                }
            }
        }
    } catch (e) {
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        Jx.fault("AddressWell.AddressWellController.js", "_loopThroughCollection", e);
    } finally {
        this._queryContactsByInputEnd();
    }
};

AddressWell.ServerSearch.prototype._addPersonToSearchResults = function (contactResults, person) {
    /// <summary>
    /// Populates the given people results array with AddressWell.Contact objects for the person
    /// </summary>
    /// <param name="contactResults" type="Array">
    ///     The contact results array that we would like to populate.  Array of AddressWell.Contact
    ///     This parameter is passed by reference.
    /// </param>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson">The person object from the Contacts Platform.</param>
    /// <returns type="Number">The number of items in the people results array.</returns>

    var email = person.mostRelevantEmail;
    if (contactResults.length < AddressWell.maxConnectedAccountSearchResults && Jx.isNonEmptyString(email)) {
        NoShip.log("AddressWell.ServerSearch - Server-search Result - name: (" + person.calculatedUIName + ") email: (" + email + ")");

        var tileUrl = AddressWell.getUserTileUrl(person, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall);
        contactResults.push(new AddressWell.Contact(person, [person.createRecipient(email)], tileUrl));
    }

    return contactResults.length;
};

AddressWell.ServerSearch.prototype._queryContactsByInputOnComplete = function (searchId) {
    /// <summary>
    /// The onComplete function to render the drop down in list view with data.
    /// </summary>
    /// <param name="searchId" type="Number">The current ID to identify the search in progress.</param>

    this._searchPending = false;

    // The caller calls the callback with msSetImmediate in the promise, and msSetImmediate has a slight delay in calling this callback.
    // Before rendering list view, we need to ensure that:
    // 1. We still have a valid search collection object (e.g. It's not disposed as a result of cleaning up)
    // 2. We are still performing the same search (e.g. The control has not started a different search since the callback)
    // 3. We might have error text to display in the case of a connected account search
    Jx.log.verbose("AddressWell.ServerSearch._queryContactsByInputOnComplete with searchId: " + searchId.toString() + " and this._lvSearchId: " + this._lvSearchId.toString());

    // In order to proceed, the callback's search id must match the id of the current search in progress
    if (searchId === this._lvSearchId) {
        // Check if there is any error to render in the connected account scenario
        if (this._lvSearchErrorType !== AddressWell.SearchErrorType.none) {
            this._onError.call(null, this._lvSearchErrorType);
        } else if (this._lvCollection !== null) {
            this._onComplete(this._lvResults);
        }

        // Disposes the collection object and its handler in case it's not null
        this._lvCollectionDispose();
    }
};

AddressWell.ServerSearch.prototype._queryContactsByInputOnError = function (e) {
    /// <summary>
    /// The onError function to render the drop down with error string.
    /// This is usually called in the case the queryContactsByInput promise is cancelled (e.g. timeout event)
    /// </summary>
    /// <param name="e" type="String">The error string.</param>

    Jx.log.exception("AddressWell.ServerSearch._queryContactsByInputOnError is invoked with exception.", e);

    this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
    // Call onComplete function to render the drop down regardless
    this._queryContactsByInputOnComplete(this._lvSearchId);
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

AddressWell.AutoResolver = /*@constructor*/function (contactsPlatform, log) {
    Debug.assert(!Jx.isNullOrUndefined(contactsPlatform));
    this._platform = contactsPlatform;
    this._log = log;
};

// Member variables
AddressWell.AutoResolver.prototype._platform = /* @static_cast(Microsoft.WindowsLive.Platform.Client) */null;
AddressWell.AutoResolver.prototype._searchAgent = /* @static_cast(AddressWell.ServerSearch) */null;
AddressWell.AutoResolver.prototype._activeQuery = /* @static_cast(Query) */null;
AddressWell.AutoResolver.prototype._queue = [];
AddressWell.AutoResolver.prototype._processingQueue = false;
AddressWell.AutoResolver.prototype._queueTimerId = null;

Object.defineProperty(AddressWell.AutoResolver.prototype, "workPending", { get: function () { return this._queue.length > 0; } });

/* @constructor*/function Query() { }
Query.prototype = {
    recipient: /*@static_cast(AddressWell.Recipient)*/null,
    account: /* @static_cast(Microsoft.WindowsLive.Platform.IAccount)*/null,
};

AddressWell.AutoResolver.prototype.resolveAgainstCurrentResults = function (recipient, results) {
    /// <summary>
    /// Attempts to (synchronously) resolve a recipient against a given set of contacts.
    /// </summary>
    /// <param name="recipient" type="AddressWell.Recipient">The recipient which we need to resolve</param>
    /// <param name="results" type="Array">The set of contacts to try and resolve against.</param>
    Debug.assert(!Jx.isNullOrUndefined(recipient));
    Debug.assert(Jx.isArray(results));
    Debug.assert(recipient.state === AddressWell.RecipientState.unresolved, "We should only be resolving recipients that are in the unresolved state.");

    this._resolveAgainstResultSet(recipient, results);
};

AddressWell.AutoResolver.prototype.resolveAgainstServerAsync = function (recipient, connectedAccount) {
    /// <summary>
    /// Adds a unresolved recipient to the queue to be resolved against data retrieved from the server.
    /// </summary>
    /// <param name="recipient" type="AddressWell.Recipient">The recipient which we need to resolve</param>
    /// <param name="connectedAccount" type="Microsoft.WindowsLive.Platform.IAccount">The connected account to search for if there is one.</param>
    Debug.assert(!Jx.isNullOrUndefined(recipient));
    Debug.assert(!Jx.isNullOrUndefined(connectedAccount));
    Debug.assert(recipient.state === AddressWell.RecipientState.unresolved, "We should only be resolving recipients that are in the unresolved state.");
    ///IFDEF DEBUG
    var scenarios = /*@static_cast(Microsoft.WindowsLive.Platform.IAccountScenarios)*/connectedAccount; // JSCop doesn't believe that IAccount implements IAccountScenarios.
    Debug.assert(scenarios.peopleSearchScenarioState === Microsoft.WindowsLive.Platform.ScenarioState.connected, "The given account does not support GAL search.");
    ///ENDIF

    this._queue.push({ recipient: recipient, account: connectedAccount });
    Debug.only(Jx.log.info("AddressWell.AutoResolver.resolveAgainstServerAsync: enqueing recipient (" + recipient.emailAddress + ")"));

    if (!this._processingQueue) {
        Debug.only(Jx.log.info("AddressWell.AutoResolver.resolveAgainstServerAsync: processing queue immediately"));
        // Search immediately
        this._processQueue();
    }
};

AddressWell.AutoResolver.prototype.cancel = function () {
    /// <summary>
    /// Cancels any pending server searches and stops processing the queue.
    /// </summary>
    this._queue.length = 0;

    if (this._searchAgent !== null) {
        this._searchAgent.cancel();
    }

    if (Jx.isNumber(this._queueTimerId)) {
        clearTimeout(this._queueTimerId);
        this._queueTimerId = null;
    }
};

AddressWell.AutoResolver.prototype._processQueue = function () {
    /// <summary>
    /// Dequeues the next query from the queue, if any, and performs an async server search on it,
    /// attempting to resolve the against the returned results.
    /// </summary>
    Debug.assert(!this._processingQueue, "Already processing queue");

    if (this._queue.length > 0) {
        this._processingQueue = true;

        // Dequeue the next query, ignoring any recipients which might have been deleted while
        // sitting in the queue.
        do {
            var query = /*@static_cast(Query)*/this._queue.shift();
        } while (Jx.isObject(query) && query.recipient.state === AddressWell.RecipientState.deleted);

        if (Jx.isObject(query)) {
            this._activeQuery = query;

            var searchAgent = this._searchAgent;
            if (!searchAgent) {
                searchAgent = this._searchAgent = new AddressWell.ServerSearch(this._platform, this._log);
            }

            Debug.assert(query.recipient.state === AddressWell.RecipientState.unresolved, "We should not be attempting to auto-resolve a recipient whose state is not 'unresolved'");
            Debug.only(Jx.log.info("AddressWell.AutoResolver._processQueue: recipient = " + query.recipient.emailAddress));

            // Mark the state of the recipient as pending-resolution.
            query.recipient.updateState(AddressWell.RecipientState.pendingResolution);

            // Listen for the 'deleted' event on the recipient so that we can cancel the search.
            query.recipient.addListener(AddressWell.RecipientEvents.deleted, this._recipientDeletedHandler, this);

            // Initiate the server-side search.
            searchAgent.queryAsync(
                query.recipient.emailAddress,
                query.account,
                /*@bind(AddressWell.AutoResolver)*/function (results) {
                    Debug.only(Jx.log.info("AddressWell.AutoResolver._processQueue: queryAsync completed for recipient = " + query.recipient.emailAddress));
                    if (query.recipient.state !== AddressWell.RecipientState.deleted) {
                        this._resolveAgainstResultSet(query.recipient, results);
                        // If the state of the recipient is still pending, we were unable to resolve it.
                        // Switch the state to unresolvable.
                        if (query.recipient.state === AddressWell.RecipientState.pendingResolution) {
                            query.recipient.updateState(AddressWell.RecipientState.unresolvable);
                        }
                    }
                    this._postProcessQueue();
                }.bind(this)/*onComplete*/,
                /*@bind(AddressWell.AutoResolver)*/function (errorCode) {
                    if (query.recipient.state !== AddressWell.RecipientState.deleted) {
                        query.recipient.updateState(AddressWell.RecipientState.unresolvable);
                    }
                    this._postProcessQueue();
                    Jx.log.error("AddressWell.AutoResolver._processQueue failed at queryAsync() with errorCode = " + errorCode);
                }.bind(this)/*onError*/);
        } else {
            // The queue is empty, clear the _processingQueue flag.
            this._processingQueue = false;
        }
    }
};

AddressWell.AutoResolver.prototype._postProcessQueue = function () {
    /// <summary>
    /// Invoked by _processQueue after the async server search has returned (success or failure), 
    /// and handlers reprocessing the queue.
    /// </summary>

    Debug.assert(this._activeQuery, "The active query should not be null.");
    if (this._activeQuery) {
        this._activeQuery.recipient.removeListener(AddressWell.RecipientEvents.deleted, this._recipientDeletedHandler, this);
    }

    this._processingQueue = false;
    this._activeQuery = null;

    if (this._queue.length > 0) {
        var processQueueFn = this._processQueue.bind(this);
        this._queueTimerId = setTimeout(processQueueFn, 50);
    }
};

AddressWell.AutoResolver.prototype._recipientDeletedHandler = function (/*@dynamic*/eventData) {
    /// <summary>
    /// Handler for the AddressWell.RecipientEvents.deleted event
    /// </summary>
    Debug.assert(!Jx.isNullOrUndefined(this._activeQuery));
    Debug.only(Jx.log.info("AddressWell.AutoResolver handling Recipient.deleted event"));
    Debug.assert(eventData.sender.emailAddress === this._searchAgent._lvInput);

    Debug.assert(this._activeQuery.recipient.state === AddressWell.RecipientState.deleted);
    // Cancel the current search.
    this._searchAgent.cancel();
};

AddressWell.AutoResolver.prototype._resolveAgainstResultSet = function (unresolvedRecipient, results) {
    /// <summary>
    /// Attempts to resolve a recipient against a given static set of contacts. This function is used by both resolveAgainstCurrentResults()
    /// and resolveAgainstServerAsync(). In the latter case, this function is invoked after the async server call returns its results. Note:
    /// if this function finds no matches, it will not return a failure. The state of the recipient will simply remain unchanged.
    /// </summary>
    /// <param name="unresolvedRecipient" type="AddressWell.Recipient">The recipient which we need to resolve</param>
    /// <param name="results" type="Array">The set of contacts to try and resolve against.</param>
    var alias = /*@static_cast(String)*/unresolvedRecipient.emailAddress.toLowerCase();
    Debug.assert(alias.indexOf("@") === -1, "Aliases should not have '@' symbols");

    var matchedRecipients = [];

    results.forEach(/*@bind(AddressWell.Controller)*/function (/* @type(AddressWell.Contact)*/ contact) {
        var person = /*@static_cast(Microsoft.WindowsLive.Platform.IContact)*/contact.person;
        if (person.objectType === "SearchPerson") {
            if (alias === person.alias.toLowerCase()) {
                Debug.assert(contact.recipients.length === 1);
                matchedRecipients.push(contact.recipients[0]);
            }
        } else {
            contact.recipients.forEach(/*@bind(AddressWell.Controller)*/function (/* @type(Microsoft.WindowsLive.Platform.IRecipient)*/recipient) {
                var userName = recipient.emailAddress.substring(0, recipient.emailAddress.indexOf("@")).toLowerCase();
                if (alias === userName) {
                    matchedRecipients.push(recipient);
                }
            }, this);
        }
    }, this);

    if (matchedRecipients.length >= 1) {
        // Eliminate duplicates
        var recipientEmail = matchedRecipients[0].emailAddress.toLowerCase();
        if (matchedRecipients.every(function (/* @type(Microsoft.WindowsLive.Platform.IRecipient)*/recipient) {
                return recipient.emailAddress.toLowerCase() === recipientEmail;
        })) {
            unresolvedRecipient.updateState(AddressWell.RecipientState.resolved, matchedRecipients[0]);
            Debug.only(Jx.log.info("AddressWell.AutoResolver._resolveAgainstResultSet: resolve recipient (" + alias + ")"));
        } else {
            // More than one username matched. Unable to automatically disambiguate.
            unresolvedRecipient.updateState(AddressWell.RecipientState.unresolvable);
            Debug.only(Jx.log.info("AddressWell.AutoResolver._resolveAgainstResultSet: unresolvable recipient (" + alias + ")"));
        }
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="AddressWell.dep.js" />

/*jshint browser:true*/
/*global msSetImmediate,requestAnimationFrame,Windows,Microsoft,WinJS,Debug,NoShip,Jx,People,AddressWell*/

AddressWell.Controller = /*@constructor*/function (idPrefix, recipients, contactsPlatform, showSuggestions, hintText, contactSelectionMode, allowViewProfile) {
    /// <summary>
    /// Constructor for the AddressWellController component.
    /// This component constructs the AddressWellInput and the AddressWellDropDown components.
    /// This component is a Jx component and it has dependency on Jx.js
    /// This component also has dependencies on WinJS/base.js and WinJS/ui.js for animation effects.
    /// </summary>
    /// <param name="idPrefix" type="String">
    /// HTML element id prefix for the control.
    /// This value must not be null or an empty string since the control relies on it in order to generate unique ids for its DOM elements.
    /// </param>
    /// <param name="recipients" type="Array">
    /// An array of IRecipient objects.
    /// This array will be passed to the address well input to prepopulate it with contact recipients.
    /// Null if there is no recipient to prepopulate.
    /// </param>
    /// <param name="contactsPlatform" type="Microsoft.WindowsLive.Platform.Client">
    /// This is the contacts platform's object of type Microsoft.WindowsLive.Platform.Client.
    /// It is passed in by the hosting app since contacts platform is created only once per instance of WWAHost process, 
    /// and there can be multiple address well controls on the same page.
    /// </param>
    /// <param name="showSuggestions" type="Boolean">
    /// True if the suggestion drop down should display when the control has focus. False, to always hide suggestions.
    /// </param>
    /// <param name="hintText" type="String" optional="true">
    /// Text to be shown in the address well intially when the control is empty.  Caller is required to passed in localized text.
    /// </param>
    /// <param name="contactSelectionMode" type="AddressWell.ContactSelectionMode" optional="true">
    /// This determines what type of contacts will be displayed in the well. Defaults to email contacts.
    /// </param>
    /// <param name="allowViewProfile" type="Boolean" optional="true">
    /// This determines whether the "view profile" option will be available in the context menu.
    /// </param>

    // Verify that idPrefix is not null or an empty string
    if (!Jx.isNonEmptyString(idPrefix)) {
        throw new Error("idPrefix parameter must be not null and non empty");
    }

    if (!Jx.isArray(recipients)) {
        recipients = [];
    }
    
    if (Jx.isNonEmptyString(contactSelectionMode)) {
        this._contactSelectionMode = contactSelectionMode;
    } else {
        this._contactSelectionMode = AddressWell.ContactSelectionMode.emailContacts;
    }

    this._animationMetrics = Windows.UI.Core.AnimationMetrics;

    this._showSuggestions = !!showSuggestions;

    if (!Jx.isBoolean(allowViewProfile)) {
        Debug.assert(Jx.isNullOrUndefined(allowViewProfile), 'AddressWell.Controller - allowViewProfile must be a boolean, null, or undefined');
        allowViewProfile = true;
    }

    // Set up its own instance of Jx.Log
    this._log = new Jx.Log();
    this._log.enabled = true;
    this._log.level = Jx.LOG_VERBOSE;

    // Check for null values and convert to arrray of AddressWell.Recipients
    recipients = recipients.filter(function (recipient) {
        return !Jx.isNullOrUndefined(recipient);
    }).map(function (recipient) {
        return new AddressWell.Recipient(recipient);
    });

    var buttonType = AddressWell.DropDownButtonType.none;
    if (this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts) {
        buttonType = AddressWell.DropDownButtonType.roomsSelector;
    }

    // Set up child components
    this._input = new AddressWell.Input(idPrefix, recipients, contactsPlatform, this._log, hintText, allowViewProfile);
    this._dropDown = new AddressWell.DropDown(idPrefix, this._log, buttonType);

    // Enable search-on-enter when in room-finder mode.
    this._input.setSearchOnEnter(this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts);

    this._peoplePicker = new AddressWell.PeoplePicker();

    this.initComponent();
    // Build the component tree.
    this.append(this._input, this._dropDown);

    this._id = idPrefix + "AWT"; // This is needed by Jx to remove UI from DOM
    this._containerId = idPrefix + "AWC";
    this._platform = contactsPlatform;

    // Define events that this component can trigger.
    Debug.Events.define(/* @static_cast(Object) */this, 
        AddressWell.Events.addressWellBlur, 
        AddressWell.Events.recipientsAdded,
        AddressWell.Events.recipientRemoved,
        AddressWell.Events.beforeRecipientsAdded,
        AddressWell.Events.autoResolveSuccessful
    );

    // Add bici value for pre-filled contacts
    if (recipients.length !== 0) {
        Jx.bici.addToStream(AddressWell.selectionBiciId, AddressWell.RecipientAddMethod.preFilled, recipients.length /* number of recipients */);
    }
};

Jx.augment(AddressWell.Controller, Jx.Component);
Jx.augment(AddressWell.Controller, Jx.Events);

// Member variables
AddressWell.Controller.prototype._input = /* @static_cast(AddressWell.Input) */null;
AddressWell.Controller.prototype._dropDown = /* @static_cast(AddressWell.DropDown) */null;
AddressWell.Controller.prototype._peoplePicker = /* @static_cast(AddressWell.PeoplePicker) */null;
AddressWell.Controller.prototype._containerElement = /* @static_cast(HTMLElement) */null;
AddressWell.Controller.prototype._containerFocus = /* @static_cast(Function) */null; // Bound method for _containerFocusHandler (saved for removeEventListener)
AddressWell.Controller.prototype._containerBlur = /* @static_cast(Function) */null; // Bound method for _containerBlurHandler (saved for removeEventListener)
AddressWell.Controller.prototype._containerId = "";
AddressWell.Controller.prototype._uiInitialized = false; // Indicates whether the UI is available
AddressWell.Controller.prototype._platform = /* @static_cast(Microsoft.WindowsLive.Platform.Client) */null; // Contacts platform's object
AddressWell.Controller.prototype._peopleManager = /* @static_cast(Microsoft.WindowsLive.Platform.IPeopleManager) */null; // Contacts platform's people manager object
AddressWell.Controller.prototype._accountManager = /* @static_cast(Microsoft.WindowsLive.Platform.IAccountManager) */null; // Contacts platform's account manager object
AddressWell.Controller.prototype._showSuggestions = false;
AddressWell.Controller.prototype._log = /* @static_cast(Jx.Log) */null;
AddressWell.Controller.prototype._inputPane = /* Windows.UI.ViewManagement.InputPane */null;
AddressWell.Controller.prototype._inputPaneShowingHandler = /* @static_cast(Function) */null; // Bound method for when the input pane showing event is fired
AddressWell.Controller.prototype._inputPaneHidingHandler = /* @static_cast(Function) */null; // Bound method for when the input pane hiding event is fired
AddressWell.Controller.prototype._scrollableElement = /* @static_cast(HTMLElement) */null;
AddressWell.Controller.prototype._inputPaneShowingTimeout = /*@static_cast(Number)*/null;
AddressWell.Controller.prototype._animationMetrics = Windows.UI.Core.AnimationMetrics;
AddressWell.Controller.prototype._contactSelectionMode = "";
AddressWell.Controller.prototype._isDisabled = false;
AddressWell.Controller.prototype._contextualAccount = /* @static_cast(Microsoft.WindowsLive.Platform.IAccount) */null;
AddressWell.Controller.prototype._wordWheelSearchOp = /* @static_cast(Windows.Foundation.IAsyncOperation) */null;
AddressWell.Controller.prototype._autoSuggestOnFocus = true;
AddressWell.Controller.prototype._firstRecipientAdded = false;
AddressWell.Controller.prototype._scrollsIntoView = true;

// Member variables for listview wordwheel/GAL results
AddressWell.Controller.prototype._lvCollection = /* @static_cast(Microsoft.WindowsLive.Platform.ICollection) */ null;
AddressWell.Controller.prototype._lvCollectionChangedHandler = /* @static_cast(Function) */ null;
AddressWell.Controller.prototype._lvInput = "";
AddressWell.Controller.prototype._lvResults = []; // The resulting array of AddressWell.Contacts object 
AddressWell.Controller.prototype._lvCompleteCallback = /* @static_cast(Function) */null; // The callback function when the async search operation is finished
AddressWell.Controller.prototype._lvSearchId = 0;
AddressWell.Controller.prototype._lvSearchType = 0; // Corresponds to AddressWell.ListViewSearchType
AddressWell.Controller.prototype._lvSearchErrorType = AddressWell.SearchErrorType.none;
AddressWell.Controller.prototype._lvConnectedAccount = /* @static_cast(Microsoft.WindowsLive.Platform.IAccount) */null;
AddressWell.Controller.prototype._lvSearchPromise = /* @static_cast(WinJS.Promise) */null;
AddressWell.Controller.prototype._serverSearchAgent = /* @static_cast(AddressWell.ServerSearch) */null;
AddressWell.Controller.prototype._autoResolver = /* @static_cast(AddressWell.AutoResolver)*/null;

AddressWell.Controller.prototype.getUI = function (ui) {
    /// <summary>
    /// Constructs the UI object for this component.
    /// </summary>
    /// <param name="ui" type="JxUI">The UI object to set properties on.</param>

    var uiInput = Jx.getUI(this._input);
    var uiDropDown = Jx.getUI(this._dropDown);
    var disabledProperty = "";

    if (this._isDisabled) {
        disabledProperty = ' aria-disabled="true"';
    }

    ui.html = '<div id="' + this._id + '" class="aw-root"' + disabledProperty + '>' +
                    '<div id="' + this._containerId + '" class="aw-iddContainer">' + uiInput.html + uiDropDown.html + '</div>' +
                '</div>';
};

AddressWell.Controller.prototype.activateUI = function () {
    /// <summary>
    /// Logic after UI has been initialized.
    /// </summary>

    Jx.Component.prototype.activateUI.call(this);

    if (!this._uiInitialized) {

        // Bind event handlers
        var proto = AddressWell.Controller.prototype;
        this._resizeHelper = proto._resizeHelper.bind(this);
        this.resize = proto.resize.bind(this);

        this._containerElement = document.getElementById(this._containerId);

        // Binds input's "highlightArea" to drop down's "highlightArea", two way binding
        this._input.bindAttr2Way(AddressWell.highlightAreaAttr, /*@static_cast(Jx.Attr)*/this._dropDown, AddressWell.highlightAreaAttr);

        // Binds dropdown's "highlightId" to input's "highlightId", one way binding
        this._dropDown.bindAttr(AddressWell.highlightIdAttr, /*@static_cast(Jx.Attr)*/this._input, AddressWell.highlightIdAttr);

        // Binds dropdown's "dropDownVisible" to input's "dropDownVisible" attribute, one way binding
        this._dropDown.bindAttr(AddressWell.dropDownVisibleAttr, /*@static_cast(Jx.Attr)*/this._input, AddressWell.dropDownVisibleAttr);

        // Binds dropdown's "firstDropDownItemId" to input's "firstDropDownItemId" attribute, one way binding
        this._dropDown.bindAttr(AddressWell.firstDropDownItemId, /*@static_cast(Jx.Attr)*/this._input, AddressWell.firstDropDownItemId);

        // The following are using Jx.Events pattern for attaching simple direct events.

        // Listens on input's userInputChanged event, and binds that to its function
        this._input.addListener(AddressWell.Events.userInputChanged, this._userInputChanged, this);

        // Listens on input's focus event.
        this._input.addListener(AddressWell.Events.focus, this._onInputFocus, this);

        // Listens on the input container's click event.
        this._input.addListener(AddressWell.Events.msGestureTap, this._onInputClick, this);

        // Listens on input's EscapeKey event, and binds to its handler
        this._input.addListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this);

        // Listens on input's arrow key event, and binds that to drop down's arrow key handler
        this._input.addListener(AddressWell.Events.arrowKey, this._onArrowKey, this);

        // Listens on input's page up/down key event, and binds that to drop down's page key handler
        this._input.addListener(AddressWell.Events.pageKey, this._dropDown.handlePageUpDownKey, this._dropDown);

        // Listens to the input's "complete" key event, and binds that to the drop down's complete key handler
        this._input.addListener(AddressWell.Events.addressWellCompleteKey, this._dropDown.handleCompleteKey, this._dropDown);

        // Listens on input's tab key event, and binds to its global click handler
        this._input.addListener(AddressWell.Events.addressWellTabKey, this._handleTab, this /* pass current context to the function */);

        // Listens on input's scroll into view event, and binds to its handler
        this._input.addListener(AddressWell.Events.scrollIntoView, this._scrollIntoView, this);

        // Listens on addRecipient/removeRecipients, and forward them on.
        this._input.addListener(AddressWell.Events.recipientsAdded, this._onRecipientsAdded, this);
        this._input.addListener(AddressWell.Events.recipientRemoved, /*@bind(AddressWell.Controller)*/function () { this.raiseEvent(AddressWell.Events.recipientRemoved); }, this);

        this._input.addListener(AddressWell.Events.showingContextMenu, this._onContextMenu, this);

        // Listens on input's viewProfile request event
        this._input.addListener(AddressWell.Events.viewProfile, this._viewProfileHandler, this);

        this._input.addListener(AddressWell.Events.inputOffsetAdjusted, this._inputOffsetAdjusted, this);
        this._input.addListener(AddressWell.Events.imeWindowHeightUpdated, this._inputImeWindowHeightUpdated, this);

        // Listens to the drop down's recipientsSelected event, and binds that to the event handler (which calls the input)
        this._dropDown.addListener(AddressWell.Events.recipientsSelected, this._addDropDownRecipients, this);

        // Listens to the drop down's container key down event, and binds that to the input's event handler
        this._dropDown.addListener(AddressWell.Events.dropDownKeyDown, this._input.containerKeyDownHandler, this._input);

        // Listens on drop-down's EscapeKey event, and binds to its handler
        this._dropDown.addListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this);

        // Listens on drop-down's scroll into view event, and binds to its handler
        this._dropDown.addListener(AddressWell.Events.dropDownReady, this._dropDownReadyHandler, this);
        
        // Hook events specific to email contact mode
        if (this._contactSelectionMode === AddressWell.ContactSelectionMode.emailContacts || this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts) {
            // Listen on input's search for the first connected account event, and binds to its function
            this._input.addListener(AddressWell.Events.searchFirstConnectedAccount, this._searchFirstConnectedAccount, this);

            // Listen on input's autoResolveRecipient event, and binds to its function. This event signals a request to perform attempt an auto-resolution.
            this._input.addListener(AddressWell.Events.autoResolve, this._autoResolveRecipient, this);

            // Listen on drop down's search link selected event, and binds to its function
            this._dropDown.addListener(AddressWell.Events.searchLinkSelected, this._searchConnectedAccountId, this);
        }

        // Listen on people picker's add event, and binds it to is function
        this._peoplePicker.addListener(AddressWell.Events.addPeopleFromPicker, this._addRecipientsByPeoplePickerResults, this);

        // Set up aria relationships between the input and the dropdown
        this._input.setAriaControls(this._dropDown.getAriaControlledId());
        this._dropDown.setAriaControls(this._input.getAriaControlledId());

        // Because the focus event does not bubble, this would require a listener attached to each of the focusable children inside the control.
        // Another option is to use event capturing by setting the parameter to true such that the event is always fired from the container
        // as long as any of its child component is firing the event, which is the ideal scenario we are trying to achieve here
        // to indicate that the control is receiving user interaction and focus.
        this._containerFocus = this._containerFocusHandler.bind(this);
        this._containerElement.addEventListener(AddressWell.Events.focus, this._containerFocus, true /* isCapture */);

        // Attach a handler to respond to the resize event appropriately when the touch keyboard comes up.
        this._inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
        this._inputPaneShowingHandler = this._inputPaneShowing.bind(this);
        this._inputPaneHidingHandler = this._inputPaneHiding.bind(this);
        this._inputPane.addEventListener("showing", this._inputPaneShowingHandler);
        this._inputPane.addEventListener("hiding", this._inputPaneHidingHandler);

        // Attach a handler to respond to the window's resize event (e.g. as a result of application view state changes into snap view)
        window.addEventListener(AddressWell.Events.resize, this.resize, false);
    
        this._uiInitialized = true;
    }
};

AddressWell.Controller.prototype.deactivateUI = function () {
    /// <summary>
    /// Logic to detach component from UI interaction.
    /// </summary>

    Jx.Component.prototype.deactivateUI.call(this);

    if (this._uiInitialized) {
        this._input.removeListener(AddressWell.Events.userInputChanged, this._userInputChanged, this);
        this._input.removeListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this);
        this._input.removeListener(AddressWell.Events.arrowKey, this._onArrowKey, this);
        this._input.removeListener(AddressWell.Events.addressWellCompleteKey, this._dropDown.handleCompleteKey, this._dropDown);
        this._input.removeListener(AddressWell.Events.pageKey, this._dropDown.handlePageUpDownKey, this._dropDown);
        this._input.removeListener(AddressWell.Events.addressWellTabKey, this._handleTab, this);
        this._input.removeListener(AddressWell.Events.scrollIntoView, this._scrollIntoView, this);
        this._input.removeListener(AddressWell.Events.viewProfile, this._viewProfileHandler, this);
        this._input.removeListener(AddressWell.Events.recipientsAdded, this._onRecipientsAdded, this);
        this._input.removeListener(AddressWell.Events.showingContextMenu, this._onContextMenu, this);
        this._input.removeListener(AddressWell.Events.focus, this._onInputFocus, this);
        this._input.removeListener(AddressWell.Events.msGestureTap, this._onInputClick, this);
        this._input.removeListener(AddressWell.Events.inputOffsetAdjusted, this._inputOffsetAdjusted, this);
        this._input.removeListener(AddressWell.Events.imeWindowHeightUpdated, this._inputImeWindowHeightUpdated, this);
        this._dropDown.removeListener(AddressWell.Events.recipientsSelected, this._addDropDownRecipients, this);
        this._dropDown.removeListener(AddressWell.Events.dropDownKeyDown, this._input.containerKeyDownHandler, this._input);
        this._dropDown.removeListener(AddressWell.Events.addressWellEscapeKey, this._inputEscapeKeyHandler, this);
        this._dropDown.removeListener(AddressWell.Events.dropDownReady, this._dropDownReadyHandler, this);
        if (this._contactSelectionMode === AddressWell.ContactSelectionMode.emailContacts ||
            this._contactSelectionMode === AddressWell.ContactSelectionMode.roomContacts) {
            this._input.removeListener(AddressWell.Events.searchFirstConnectedAccount, this._searchFirstConnectedAccount, this);
            this._input.removeListener(AddressWell.Events.autoResolve, this._autoResolveRecipient, this);
            this._dropDown.removeListener(AddressWell.Events.searchLinkSelected, this._searchConnectedAccountId, this);
        }
        this._peoplePicker.removeListener(AddressWell.Events.addPeopleFromPicker, this._addRecipientsByPeoplePickerResults, this);

        // Remove all event listeners
        this._containerElement.removeEventListener(AddressWell.Events.focus, this._containerFocus, true /* isCapture */);
        this._inputPane.removeEventListener("showing", this._inputPaneShowingHandler);
        this._inputPane.removeEventListener("hiding", this._inputPaneHidingHandler);
        this._inputPane = null;
        window.removeEventListener(AddressWell.Events.resize, this.resize, false);
        this._removeContainerListener();

        this.resize = null;
        this._resizeHelper = null;

        // Remove all timeout functions
        this._clearInputPaneShowingTimeout();
        this._clearProcessInputTimeout();

        // Clean up list view collection object
        this._lvCollectionDispose();

        this.cancelPendingSearches();

        this._uiInitialized = false;
    }
};

AddressWell.Controller.prototype.addRecipientsByString = function (recipientsString) {
    /// <summary>
    /// Loops through a string and add entries as IRecipient objects to the address well collection.
    /// This function will always terminate the string entry with an entry separator such that "entryA; entryB" will be translated as "entryA; entryB;", which will result into two recipients.
    /// </summary>
    /// <param name="recipientsString" type="String">
    /// A string of email/name entries separated by semicolon or comma according to MIME formats.
    ///     Examples:
    ///     <![CDATA[jiamin@hotmail.com; <jiamin@hotmail.com>, Jiamin Zhu <jiamin@hotmail.com>; "Jiamin Zhu" <jiamin@hotmail.com>]]>
    /// </param>

    this._input.addRecipientsByString(
        recipientsString + ";", /* The actual helper function will handle duplicate entry separators, string parsing and trimming */
        AddressWell.RecipientAddMethod.preFilled /* This function is only called as a result of prefilling the addresswell, hence we will collect bici data point under the scenario for prefilling recipients */);
};

AddressWell.Controller.prototype.addRecipients = function (recipients, isPrefilled) {
    /// <summary>
    /// Adds the recipients as IRecipient objects to the address well collection and optionally tracks how they were added.
    /// </summary>
    /// <param name="recipients" type="Array">The AddressWell.Recipient objects.</param>
    /// <param name="isPrefilled" type="Boolean">
    /// True sets a bici data point value to indicate prefilled.  False records no data.
    /// </param>
    /// See AddressWellConstants.js for possible values of AddressWell.RecipientAddMethod e.g. preFilled

    if (isPrefilled) {
        this._input.addRecipients(recipients, AddressWell.RecipientAddMethod.preFilled);
    } else {
        this._input.addRecipients(recipients);
    }
};

AddressWell.Controller.prototype.getRecipients = function () {
    /// <summary>
    /// Returns an array of IRecipient objects.
    /// Note: Some returned objects may have been constructed in JS and are not suitable for passing through WinRT APIs.
    /// </summary>
    /// <returns type="Array">An array of IRecipient objects.</returns>

    return this._input.getRecipients(false); // false: don't filter out recipients that shouldn't be passed to the platform
};

AddressWell.Controller.prototype.getRecipientsStringInNameEmailPairs = function () {
    /// <summary>
    /// Returns the recipients in a string of name/email pairs in the format of <![CDATA["Display Name" <email@email.com>; <noName@email.com>;]]>.
    /// This string is used to interface with Mail API.
    /// </summary>
    /// <returns type="String">
    /// Returns a single string.
    /// </returns>

    return this._input.getRecipientsStringInNameEmailPairs();
};

AddressWell.Controller.prototype.deleteRecipientByEmail = function (email) {
    /// <summary>
    /// Deletes all matching recipients from the AddressWell.
    /// </summary>
    /// <param name="email" type="String">The given email address of the recipient.</param>

    this._input.deleteRecipientByEmail(email);
};

AddressWell.Controller.prototype.getError = function () {
    /// <summary>
    /// Gets the error string to display if there is an error to show.
    /// </summary>
    /// <returns type="String">Returns the localized error string if there is an error to show, null otherwise.</returns>
    return this._input.getError();
};

AddressWell.Controller.prototype.focusInput = function (force) {
    /// <summary>
    /// Allows the caller put focus on the input field.
    /// Note: This behavior will cause the touch keyboard to come up on the screen.
    /// </summary>
    /// <param name="force" type="Boolean" optional="true">Passthrough, see Input for details.</param>
    this._input.focus(force);
};

AddressWell.Controller.prototype.getIsDirty = function () {
    /// <summary>
    /// Returns whether there has been changes in the address well in the following scenarios:
    /// 1. When user types a character that invokes list view
    /// 2. When user adds a recipient
    /// 3. When user removes a recipient
    /// </summary>
    /// <returns type="Boolean">True if there has been at least a change from any of the above scenarios.</returns>

    return this._input.isDirty;
};

AddressWell.Controller.prototype.resetIsDirty = function () {
    /// <summary>
    /// Resets the value for the isDirty flag in case the caller wishes to reset the state in terms of checking for updates in the control.
    /// </summary>

    this._input.isDirty = false;
};

AddressWell.Controller.prototype.getInputElementId = function () {
    /// <summary>
    /// Gets the id to the HTML input element.
    /// </summary>
    /// <returns type="String">The id of the HTML input element</returns>

    return this._input.getInputElementId();
};

AddressWell.Controller.prototype.resize = function () {
    /// <summary>
    /// Event handler for resize
    /// Performs logic to re-calculate UI when the window has been resized.
    /// The hosting component can also call into this method to manually resize the control if necessary.
    /// </summary>

    Jx.log.verbose("AddressWell.Controller.resize has occurred");

    // Sometimes the element sizes aren't finished when the resize event fires.
    // This delays the calculation until the next layout pass.
    requestAnimationFrame(this._resizeHelper);
};

AddressWell.Controller.prototype._resizeHelper = function () {
    /// <summary>
    /// Helper for resize event handler
    /// </summary>

    // Whenever a resize event occurs, the length of the input field needs to be ajusted to fill the container.
    this._input.adjustInputFieldLength(false /* shouldUseCachedContainerWidth */);
};

AddressWell.Controller.prototype.clearInput = function () {
    /// <summary>
    /// Removes all the recipients.
    /// </summary>

    this._input.clear();
    this.resetIsDirty();
    this.cancelPendingSearches();
};

AddressWell.Controller.prototype.clear = function () {
    /// <summary>
    /// Removes all the recipients and resets the state of the control.
    /// </summary>

    this.clearInput();
    this._navigateAway();

    this._firstRecipientAdded = false;
};

AddressWell.Controller.prototype.cancelPendingSearches = function () {
    /// <summary>
    /// Cancels any pending server-searches and clears the auto-resolve queue.
    /// </summary>
    var autoResolver = /*@static_cast(AddressWell.AutoResolver)*/this._autoResolver;
    if (!Jx.isNullOrUndefined(autoResolver)) {
        autoResolver.cancel();
    }

    this._cancelExplicitServerSearch();
    this._cancelWordWheelSearch();
};

AddressWell.Controller.prototype.launchPeoplePicker = function () {
    /// <summary>
    /// Launches the people picker and feeds the results to the input.
    /// </summary>
    this._peoplePicker.launchPeoplePicker();
};

AddressWell.Controller.prototype.setLabelledBy = function (labelElementId) {
    /// <summary>
    /// Sets the aria-labelledby attribute on the input field with the id of the label element
    /// Note: Please call this function when the UI is ready (e.g. during Jx.activateUI)
    /// </summary>
    /// <param name="labelElementId" type="String">An ID to the HTML element containing the text for the label on the control.</param>

    if (Jx.isHTMLElement(this._input._inputElement)) {
        this._input._inputElement.setAttribute("aria-labelledby", labelElementId);
    } else {
        Debug.assert(false, "AddressWell.Controller.setLabelledBy is being called when the input element is not set up");
    }
};

AddressWell.Controller.prototype.setAriaLabel = function (labelString) {
    /// <summary>
    /// Sets the aria-label accessibility attribute on the input field
    /// Note: Please call this function when the UI is ready (e.g. during Jx.activateUI)
    /// Note: If you already have a visible label (and it isn't actionable) you should prefer setLabelledBy instead.
    /// </summary>
    /// <param name="labelString" type="String">Localized label string for the AddressWell</param>

    if (Jx.isHTMLElement(this._input._inputElement)) {
        this._input._inputElement.setAttribute("aria-label", labelString);
    } else {
        Debug.assert(false, "AddressWell.Controller.setAriaLabel is being called when the input element is not set up");
    }
};
AddressWell.Controller.prototype.setAriaFlow = function (flowFrom, flowTo) {
    /// <summary> Pass-through to Input.setAriaFlow() </summary>
    this._input.setAriaFlow(flowFrom, flowTo);
};


AddressWell.Controller.prototype.hasFocus = function () {
    /// <summary>
    /// Indicates whether the control currently has focus
    /// </summary>
    /// <returns type="Boolean">Whether the control has focus</returns>

    return this._input.hasFocus();
};

AddressWell.Controller.prototype.setDisabled = function (disabled) {
    /// <summary>
    /// Disables or enables the control.
    /// </summary>
    /// <param name="disabled" type="Boolean">True-disable, False-enable</param>
    if (this.hasUI()) {
        var control = document.getElementById(this._id);
        control.setAttribute("aria-disabled", String(disabled));
    }

    if (this._input) {
        this._input.setDisabled(disabled);
    }

    this._isDisabled = disabled;
};

AddressWell.Controller.prototype.setContextualAccount = function (account) {
    /// <summary>
    /// Sets the contextual account, the one relevant to the recipients in the well.
    /// </summary>
    /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount"/>
    Debug.assert(!Jx.isNullOrUndefined(account));
    this._contextualAccount = account;
};

AddressWell.Controller.prototype.setAutoSuggestOnFocus = function (suggestOnFocus) {
    /// <summary>
    /// Sets the internal flag which controls whether or not suggestions will automatically
    /// show when the AddressWell gains focus. Note: this flag will automatically be
    /// reset every time the addresswell is cleared via .clear() or loses focus.
    /// </summary>
    /// <param name="suggestOnFocus" type="Boolean"/>
    this._autoSuggestOnFocus = suggestOnFocus;
};

AddressWell.Controller.prototype.setScrollsIntoView = function (scrollsIntoView) {
    /// <summary>
    /// Sets whether or not the AddressWell will scroll itself into view when the drop down menu appears.
    /// Defaults to "true" if left unset.
    /// </summary>
    /// <param name="scrollsIntoView" type="Boolean"/>
    this._scrollsIntoView = scrollsIntoView;
};

AddressWell.Controller.prototype._addRecipientsByPeoplePickerResults = function (pickerResults) {
    /// <summary>
    /// Loops through a string and add entries as IRecipient objects to the address well collection.
    /// This function will always terminate the string entry with an entry separator such that "entryA; entryB" will be translated as "entryA; entryB;", which will result into two recipients.
    /// </summary>
    /// <param name="pickerResults" type="Array">Array of Windows.ApplicationModel.Contacts.ContactInformation objects, as returned by the ContactPicker</param>
    AddressWell.markStart("Controller.addRecipientsByPickerResults");

    if (pickerResults) {
        var recipients = [];
        var /*@type(Windows.ApplicationModel.Contacts.ContactField)*/email = null;
        // Loop through the results
        for (var i = 0, len = pickerResults.length; i < len; i++) {

            // Although we requested email addresses, we are still not guaranteed all our results have them
            email = pickerResults[i].emails[0];
            if (!Jx.isNullOrUndefined(email) && Jx.isNonEmptyString(email.address) && Jx.isNonEmptyString(pickerResults[i].displayName)) {
                recipients.push(AddressWell.Recipient.fromEmail(email.address, pickerResults[i].displayName, this._platform));
            } else {
                Jx.log.error("Error in AddressWell.PeoplePicker._pickerResults: Contact selected from the People Picker that did not have a name and email address.  This does not break any code, but does mean the contact provider did not respect the requested fields.");
            }
        }

        Debug.assert(recipients.length > 0);
        this._input.addRecipients(recipients, AddressWell.RecipientAddMethod.peoplePicker);
    }

    AddressWell.markStop("Controller.addRecipientsByPickerResult");
};

AddressWell.Controller.prototype._getScrollableElement = function () {
    /// <summary>
    /// Returns the scrollable parent container that is hosting the control, which will be used for scrollIntoView calculation later.
    /// </summary>
    /// <returns type="HTMLElement">The scrollable parent container that is hosting the control.</returns>

    if (!Jx.isHTMLElement(this._scrollableElement)) {
        // Normally the scrollable element would be the larger browser window viewport, 
        // but its height is not accurate in the case the caller sets ensuredFocusedElementInView = true when the input pane is shown.
        // The following logic to locate the scrollable element works well in all of the control's consumers, where a top level scrollable region is found within the app.
        // However we may consider a more robust implementation to have the caller specifies its scrollable region if this design doesn't work well with other apps.
        this._scrollableElement = this._containerElement;

        var currentStyle;
        var overflowStyle;
        do {
            this._scrollableElement = this._scrollableElement.parentNode;

            if (!Jx.isNullOrUndefined(this._scrollableElement)) {
                currentStyle = this._scrollableElement.currentStyle;
                if (!Jx.isNullOrUndefined(currentStyle)) {
                    overflowStyle = this._scrollableElement.currentStyle.overflowY;
                } else {
                    break;
                }
            } else {
                break;
            }
        } while (overflowStyle !== "scroll" && overflowStyle !== "auto");
    }


    if (!Jx.isHTMLElement(this._scrollableElement)) {
        // If we were unable to find a scrollable parent, just fall back to the body element
        // This happens if we made it to the parentNode of the HTMLElement, which is the Document object, which is no longer an element and doesn't have a currentStyle
        // This probably means we're not going to scroll 100% correctly in all cases, so log it.
        Jx.log.info("AddressWell.Controller._getScrollableElement: Unable to find scrollable element, defaulting to body tag");
        this._scrollableElement = document.body;
    }
    return this._scrollableElement;
};

AddressWell.Controller.prototype._navigateAway = function () {
    /// <summary>
    /// Treat this as if the user were clicking out - resolve user input and hide the dropdown.
    /// </summary>

    Jx.log.verbose("AddressWell.Controller._navigateAway " + this._id);

    this._input.completeUserInput(false /* shouldSignal */);

    this._clearProcessInputTimeout();

    // Hide the dropdown and indicate that it's no longer "live"
    this._dropDown.removeAriaLive();
    this._dropDown.hide();

    // Cancel non-autoresolving searches.
    this._lvCollectionDispose();
    this._cancelExplicitServerSearch();
    this._cancelWordWheelSearch();

    this._input.clearHighlight();

    // We are no longer interacting with the control, remove event listeners
    this._removeContainerListener();

    // Remove the focus style from the AddressWell
    this._input.removeFocusFromContainer();

    // Fire an event to notify the host that the user has navigated away from the control
    this.raiseEvent(AddressWell.Events.addressWellBlur);

    // Reset the flag which allows suggestion to auto-display in response to gaining focus. 
    this._autoSuggestOnFocus = true;
};

AddressWell.Controller.prototype._cancelExplicitServerSearch = function () {
    /// <summary>
    /// If the user has explicitly invoked a server search, this function will cancel it.
    /// </summary>

    var searchAgent = /*@static_cast(AddressWell.ServerSearch)*/this._serverSearchAgent;
    if (!Jx.isNullOrUndefined(searchAgent) && searchAgent.searchPending) {
        searchAgent.cancel();
        this._dropDown.hide();
    }
};

AddressWell.Controller.prototype._cancelWordWheelSearch = function () {
    /// <summary>
    /// Cancels the pending wordwheel search, if any.
    /// </summary>
    Jx.log.verbose("AddressWell.Controller._cancelWordWheelSearch");
    if (this._wordWheelSearchOp) {
        this._wordWheelSearchOp.cancel();
        this._wordWheelSearchOp = null;
        AddressWell.markStop("_wordWheelSearch");
    }
};

AddressWell.Controller.prototype._handleTab = function (ev) {
    /// <summary>
    /// Handle the tab key event.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>

    var isVisible = this._dropDown.isVisible();
    // If the dropdown is visible, and something is highlighted, and the dropdown's bottom-button
    // is disabled/hidden, select the highlighted item and re-focus the input.
    if (isVisible && !Jx.isNullOrUndefined(this._dropDown.getAttr(AddressWell.highlightIdAttr)) && !this._dropDown.bottomButtonEnabled) {
        this._dropDown.handleCompleteKey();
        this.focusInput();
        //We have handled the event, prevent the event from navigating away
        ev.preventDefault();
    } else if (this._input.isImeActive() && isVisible) {
        //When IME is active and dropdown is visible, do nothing and prevent tab key to be processed
        ev.preventDefault();
    }else if (this._dropDown.bottomButtonEnabled){
        // Clear the highlighted recipient in the dropdown
        this._dropDown.setAttr(AddressWell.highlightAreaAttr, null);
    } 
};

AddressWell.Controller.prototype._containerFocusHandler = function () {
    /// <summary>
    /// User is interacting with the control and we need to attach listeners on the control.
    /// </summary>
    this._attachContainerListener();
};

AddressWell.Controller.prototype._containerBlurHandler = function (ev) {
    /// <summary>
    /// A blur event has occured from the control, since we are using event capturing mode to capture the event,
    /// the event can occur as a result of a child component losing focus to another child component of the control, 
    /// or it can also occur as a result of a child component losing focus to anything outside of the control.
    /// This function is going to pinpoint the element that is currenly receiving the new focus as a result of the blur event, 
    /// and then determine if the focus is still inside the control or outside of the control in order to respond appropriately.
    /// </summary>
    /// <param name="ev" type="Event">The DOM event.</param>

    if (this._isFocusInControl()) {
        // If the blur occurs from the input field, it indicates that the input field originally had focus.
        // If the element receiving new focus comes from the list view, at this point we expect that the user can
        // access keyboard at all times and hence ensure that the input field has focus.
        if (!Jx.isNullOrUndefined(ev) &&
            !Jx.isNullOrUndefined(ev.target) &&
            ev.target.id === this._input._inputFieldId && /* This indicates that input field element lost focus */
            (this._dropDown.currentView === AddressWell.DropDownView.peopleSearchList ||
             this._dropDown.currentView === AddressWell.DropDownView.connectedAccountList ||
             this._dropDown.currentView === AddressWell.DropDownView.suggestionsList)) {
            
            // Unless the user is tabbing to the dropdown bottom-button, set focus back on the input control.
            if (!this._dropDown.bottomButtonEnabled || (document.activeElement.id !== this._dropDown.bottomButtonId)) {
                this.focusInput();
            }
        }
            
    } else {
        // The element receiving new focus is not from the control and we should navigate away as a result
        this._navigateAway();
    }
};

AddressWell.Controller.prototype._isFocusInControl = function () {
    /// <summary>
    /// Checks if document.activeElement belongs the the AddressWell.
    /// </summary>
    /// <returns type="Boolean"/>

    // Trace the current focused element up to the address well
    var activeElement = document.activeElement;
    var isFocusedElementInsideControl = false;

    // The event may come from a child component inside the address well
    // Check up the tree a little in case we find it
    for (var i = 0; i < AddressWell.maxChildrenLayer; i++) {
        if (!Jx.isNullOrUndefined(activeElement)) {
            if (activeElement.id === this._input._id || activeElement.id === this._dropDown._id) {
                // We have located the element under either input or drop down
                isFocusedElementInsideControl = true;
                break;
            } else {
                // Keep looking
                activeElement = activeElement.parentNode;
            }
        }
    }
    return isFocusedElementInsideControl;
};

AddressWell.Controller.prototype._viewProfileHandler = function (recipient) {
    /// <summary>
    /// Handler view-profile request event from the Input control.
    /// </summary>
    /// <param name="recipient" type="AddressWell.Recipient">The recipient whose profile will be launched</param>
    /// <disable>JS3058.DeclareVariablesBeforeUse,JS3092.DeclarePropertiesBeforeUse</disable>
    Debug.assert(Jx.isObject(People), "The shared People code should have been loaded by the hosting app.");
    Debug.assert(Jx.isObject(People.ContactCard));
    Debug.assert(Jx.isObject(recipient.person), 'Jx.isObject(recipient.person)');
    
    People.ContactCard.show(recipient.person, recipient.item, this._contextualAccount);
    /// <enable>JS3058.DeclareVariablesBeforeUse,JS3092.DeclarePropertiesBeforeUse</enable>
};

AddressWell.Controller.prototype._onContextMenu = function () {
    /// <summary>
    /// Handler for the AddressWell.Events.showingContextMenu event, fired by the Input control.
    /// </summary>
    this._dropDown.hide();
};

AddressWell.Controller.prototype._onRecipientsAdded = function () {
    /// <summary>
    /// Handler for the AddressWell.Events.recipientAdded event, fired by the Input control.
    /// </summary>
    this._firstRecipientAdded = true;

    this.raiseEvent(AddressWell.Events.recipientsAdded);
};

AddressWell.Controller.prototype._addDropDownRecipients = function (ev) {
    /// <summary>
    /// Handler for adding multiple recipients from the drop down given an array of recipients.
    /// </summary>
    /// <param name="recipients" type="Array">An array of platform Recipient objects.</param>

    var recipients = ev.recipients;
    var evnt = { recipients: recipients, cancelled: false };
    // Fire the beforeRecipientsAdded to allow the host to preempt the operation. This
    // is done is cases where the hosts use the AddressWell like a recipient picker and
    // don't want to leave the recipients in the well.
    this.raiseEvent(AddressWell.Events.beforeRecipientsAdded, evnt);
        
    if (!evnt.cancelled) {
        recipients = recipients.map(function (recipient) {
            return new AddressWell.Recipient(recipient);
        });

        this._input.addRecipients(recipients, AddressWell.RecipientAddMethod.wordWheel);
    }
};

AddressWell.Controller.prototype._autoResolveRecipient = function (/* @dynamic */eventData) {
    /// <summary>
    /// Adds key and its associated values to the personId dictionary.
    /// </summary>
    /// <param name="eventData">The event data object encapsulating the key and the associated value to be added to the dictionary</param>
    var unresolvedRecipient = /*@static_cast(AddressWell.Recipient)*/eventData.recipient;
    var wordwheelResults = this._lvResults || [];

    if (!this._autoResolver) {
        this._autoResolver = new AddressWell.AutoResolver(this._platform, this._log);
    }

    this._autoResolver.resolveAgainstCurrentResults(unresolvedRecipient, wordwheelResults);
    if (unresolvedRecipient.state === AddressWell.RecipientState.unresolved) {
        // If the recipient is still unresolved after attempting to resolve against the word-wheel results,
        // trying resolving against the GAL.
        var connectedAccount = this._getConnectedAccount();
        if (connectedAccount) {
            unresolvedRecipient.addListener(AddressWell.RecipientEvents.stateChanged, this._onRecipientStateChanged, this);

            this._autoResolver.resolveAgainstServerAsync(unresolvedRecipient, connectedAccount);
        } else {
            // We failed to resolve against the GAL results, and there's not server to search, mark
            // the recipient as 'unresolvable'.
            unresolvedRecipient.updateState(AddressWell.RecipientState.unresolvable);
        }
    }
};

AddressWell.Controller.prototype._inputEscapeKeyHandler = function () {
    /// <summary>
    /// Handler for the escape key being pressed in the input field.
    /// </summary>

    // Clean up list view collection object
    this._lvCollectionDispose();
    this._cancelExplicitServerSearch();
    this._cancelWordWheelSearch();

    this._input.clearHighlight();
    this._dropDown.hide();
};

AddressWell.Controller.prototype._queryRelevantContacts = function (desiredNumber, currentRecipients) {
    /// <summary>
    /// Queries the Contact Platform given the number of relevant contacts to display and a list of current recipients in the relevant context.
    /// </summary>
    /// <param name="desiredNumber" type="Number">The given number of relevant contacts desired.</param>
    /// <param name="currentRecipients" type="Array">An array of IRecipient objects to be considered in the relevant context.</param>
    /// <returns type="Array">A collection of contacts</returns>

    if (!this._peopleManager) {
        this._peopleManager = this._platform.peopleManager;
    }

    // Fetch relevant contacts given the number of desired tiles to display in the context of the current recipients
    var suggestions = /*@static_cast(Array)*/this._peopleManager.getSuggestions(currentRecipients,
                                                    Microsoft.WindowsLive.Platform.RelevanceScenario.toLine,
                                                    this._contextualAccount,
                                                    desiredNumber);

    var contacts = [];
    for (var i = 0, count = suggestions.length; i < count; i++) {
        var recipient = /*@static_cast(Microsoft.WindowsLive.Platform.IRecipient)*/suggestions[i];
        var person = /*@static_cast(Microsoft.WindowsLive.Platform.IPerson)*/recipient.person;
        contacts.push(new AddressWell.Contact(person, [recipient], AddressWell.getUserTileUrl(person, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall)));
    }

    return contacts;
};

AddressWell.Controller.prototype._queryContactsByInputAsync = function (input, searchType, connectedAccount) {
    /// <summary>
    /// Queries Contacts Platform to perform wordwheel search based on given input.
    /// </summary>
    /// <param name="input" type="String">The given user input to search.</param>
    /// <param name="searchType" type="Number">The type of AddressWell.ListViewSearchType to perform.</param>
    /// <param name="connectedAccount" type="Microsoft.WindowsLive.Platform.IAccount">The connected account to search for if there is one.  Null if not applicable.</param>
    /// <returns type="WinJS.Promise">Returns a promise which completes once the results are populated.</returns>

    this._lvInput = input;
    this._lvSearchType = searchType;
    this._lvConnectedAccount = connectedAccount;

    var initFunction = this._queryContactsByInputInit.bind(this);
    var cancelFunction = this._queryContactsByInputCancel.bind(this);
    return new WinJS.Promise(
        /* init */ initFunction,
        /* onCancel */ cancelFunction);
};

AddressWell.Controller.prototype._queryContactsByInputInit = function (complete) {
    /// <summary>
    /// Initialize the process to perform wordwheel search.
    /// </summary>
    ///<param name="complete" type="Function">Completed callback</param>

    // Save the call back functions
    this._lvCompleteCallback = complete;

    // The resulting array of AddressWell.Contacts object
    this._lvResults = [];

    // Reset error type
    this._lvSearchErrorType = AddressWell.SearchErrorType.none;

    // Assign a new value to the search ID in order to keep track of the current search in process
    if (this._lvSearchId > AddressWell.maxSearchCounter) {
        this._lvSearchId = 0; // Restart from 0
    } else {
        this._lvSearchId++;
    }

    // Logging for performance counter on AddressWell's time to return results
    if (this._lvSearchType === AddressWell.ListViewSearchType.people) {
        NoShip.only(AddressWell.markStart("Controller_WordWheel"));
    }

    if (Jx.isWWA && this._platform !== null) {
        if (this._peopleManager === null) {
            // Caches the people manager object
            Jx.log.verbose("AddressWell.Controller - setting peopleManager");

            this._peopleManager = this._platform.peopleManager;
        }
        if (this._peopleManager !== null) {

            // Clean up first in case there's already a search in progress
            this._lvCollectionDispose();
            var searchAgent = /*@static_cast(AddressWell.ServerSearch)*/this._serverSearchAgent;
            if (searchAgent) {
                searchAgent.cancel();
            }

            Debug.assert(this._lvSearchType === AddressWell.ListViewSearchType.people);
            Debug.assert(this._contactSelectionMode === AddressWell.ContactSelectionMode.chatContacts);

            // Initiate search asyn operation
            this._chatSearch();

        } else {
            Jx.log.error("Error in AddressWell.Controller._queryContactsByInputInit - null peopleManager");
            this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
            this._queryContactsByInputEnd();
        }
    } else {
        Jx.log.error("Error in AddressWell.Controller._queryContactsByInputInit - null contacts platform");
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputEnd();
    }
};

AddressWell.Controller.prototype._queryContactsByInputEnd = function () {
    /// <summary>
    /// End the process to perform wordwheel search, and cleanup all variables.
    /// </summary>

    // We are done with enumerating wordwheel results, signal the callback
    if (Jx.isFunction(this._lvCompleteCallback)) {
        Jx.log.verbose("AddressWell.Controller._queryContactsByInputEnd is calling completeCallback function");

        // Note: msSetImmediate can be fired at a later time frame, as a result, hold on to the _lvCollection and the current search ID until the callback is actually being invoked
        this._lvCompleteCallback(this._lvSearchId);
    }

    // Logging for performance counter on AddressWell's time to return results
    NoShip.only(AddressWell.markStop("Controller_WordWheel"));
};

AddressWell.Controller.prototype._queryContactsByInputCancel = function () {
    /// <summary>
    /// Cancels the process to perform list view search, and cleanup all variables.
    /// This is usually called in the case the queryContactsByInput promise is cancelled (e.g. timeout event)
    /// </summary>

    Jx.log.verbose("AddressWell.Controller._queryContactsByInputCancel");
    // Log the error as no results
    this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
    this._queryContactsByInputEnd();
};

AddressWell.Controller.prototype._wordWheelSearch = function (input) {
    /// <summary>
    /// Initiate a word-wheels search of the user's addressbook.
    /// </summary>
    AddressWell.markStart("_wordWheelSearch");

    if (!this._peopleManager) {
        this._peopleManager = this._platform.peopleManager;
    }

    var currentRecipients = this._input.getRecipients(true); // true: Filter to platform-appropriate recipients

    this._wordWheelSearchOp = /*@static_cast(Windows.Foundation.IAsyncOperation)*/
        this._peopleManager.addressWellSearchAsync(
            input,
            Windows.Globalization.Language.currentInputMethodLanguageTag.toString(),
            Microsoft.WindowsLive.Platform.RelevanceScenario.toLine,
            this._contextualAccount,
            AddressWell.maxWordWheelContacts,
            currentRecipients).then(
            /*@bind(AddressWell.Controller)*/this._onWordWheelSearchComplete.bind(this)/*onCompleted*/,
            /*@bind(AddressWell.Controller)*/this._onWordWheelSearchError.bind(this)/*onError*/);
};

AddressWell.Controller.prototype._onWordWheelSearchComplete = function (results) {
    /// <summary>
    /// Handler for the onCompleted callback of the addressWellSearchAsync() operation.
    /// </summary>
    ///<param name="results" type="Array"/>
    Debug.assert(results.length <= AddressWell.maxWordWheelContacts);

    this._wordWheelSearchOp = null;
    var contacts = [];

    // Process the array of IRecipient objects, putting them into AddressWell.Contact objects that
    // the dropdown can handle.
    for (var i = 0, count = results.length; i < count; i++) {
        var recipient = /*@static_cast(Microsoft.WindowsLive.Platform.IRecipient)*/results[i];
        var person = /*@static_cast(Microsoft.WindowsLive.Platform.IPerson)*/recipient.person;
        contacts.push(new AddressWell.Contact(person, [recipient], AddressWell.getUserTileUrl(person, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall)));
    }

    this._dropDown.render(AddressWell.DropDownView.peopleSearchList, contacts, this._getConnectedAccount(), this._input.isImeActive());

    this._lvResults = contacts;
    AddressWell.markStop("_wordWheelSearch");
};

AddressWell.Controller.prototype._onWordWheelSearchError = function (error) {
    /// <summary>
    /// Handler for the onError callback of the addressWellSearchAsync() operation.
    /// </summary>
    ///<param name="error" type="Error"/>
    this._wordWheelSearchOp = null;
    this._dropDown.hide();
    Jx.log.exception("addressWellSearchAsync returned an error", error);
    AddressWell.markStop("_wordWheelSearch");
};

AddressWell.Controller.prototype._chatSearch = function () {
    /// <summary>
    /// Initiate the process to search the user's IMable contacts
    /// This function sets up _lvCollection and _lvCollectionChangedHandler.
    /// </summary>
    Debug.assert(this._contactSelectionMode === AddressWell.ContactSelectionMode.chatContacts, "Wrong selectionMode");

    Jx.log.verbose("AddressWell.Controller._chatSearch");
    try {
        this._lvCollection = this._peopleManager.search(Microsoft.WindowsLive.Platform.PeopleSearchType.chatAddressWell,
                                                        this._lvInput,
                                                        Windows.Globalization.Language.currentInputMethodLanguageTag.toString(),
                                                        AddressWell.maxWordWheelContacts);
        this._lvCollectionChangedHandler = this._lvCollectionChanged.bind(this);
        this._lvCollection.addEventListener("collectionchanged", this._lvCollectionChangedHandler);
        this._lvCollection.unlock();
    } catch (e) {
        Jx.fault("AddressWell.AddressWellController.js", "_chatSearch", e);
        // People search doesn't really care about _lvSearchErrorType being set here since it ignores it
        this._queryContactsByInputEnd();
    }
};

AddressWell.Controller.prototype._lvCollectionDispose = function () {
    /// <summary>
    /// Dispose the listview collection object and its collectionChanged handler if they are not null.
    /// Additionally reset the current promise object.
    /// </summary>

    if (this._lvCollection !== null) {
        Jx.log.verbose("AddressWell.Controller._lvCollectionDispose resetting collection object and its collectionChanged handler");
        try {
            // A new collection object is created as a result of the search query, and it needs to be disposed. 
            // Not disposing collections will cause Microsoft.WindowsLive.Platform.Server.exe not shutting down.
            this._lvCollection.removeEventListener("collectionchanged", this._lvCollectionChangedHandler);
            this._lvCollection.dispose();
        } catch (e) {
            Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionDispose", e);
        } finally {
            this._lvCollection = /* @static_cast(Microsoft.WindowsLive.Platform.ICollection) */null;
            this._lvCollectionChangedHandler = /* @static_cast(Function) */ null;
        }
    }
    if (this._lvSearchPromise !== null) {
        // Cancels and resets the ongoing promise object if there's one
        Jx.log.verbose("AddressWell.Controller._lvCollectionDispose cancelling current _lvSearchPromise");
        this._lvSearchPromise.cancel();
        this._lvSearchPromise = null;
    }
};

AddressWell.Controller.prototype._lvCollectionChanged = function (eventArgs) {
    /// <summary>
    /// Handler for the collectionChanged event being fired on the listview collection.
    /// </summary>
    ///<param name="eventArgs" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs">The arguments that are set on the event when it's fired.</param>

    var collectionChangeType = /* @static_cast(Number) */eventArgs.eType;
    Jx.log.verbose("AddressWell.Controller._lvCollectionChanged invoked with eventArgs.eType: " + collectionChangeType.toString());
    if (collectionChangeType === Microsoft.WindowsLive.Platform.CollectionChangeType.localSearchComplete) {
        Jx.log.verbose("AddressWell.Controller._lvCollectionChanged invoked with localSearchComplete");
        this._lvCollectionChangedSearchComplete(eventArgs);
    } else if (collectionChangeType === Microsoft.WindowsLive.Platform.CollectionChangeType.batchEnd) {
        Jx.log.verbose("AddressWell.Controller._lvCollectionChanged invoked with batchEnd");
        this._lvCollectionChangedBatchEnd();
    }
};

AddressWell.Controller.prototype._lvCollectionChangedSearchComplete = function () {
    /// <summary>
    /// Handler for the search complete event.
    /// </summary>

    try {
        NoShip.log("AddressWell.Controller._lvCollectionChangedSearchComplete invoked with totalCount: " + this._lvCollection.totalCount.toString());
        NoShip.log("AddressWell.Controller._lvCollectionChangedSearchComplete invoked with count: " + this._lvCollection.count.toString());
        Debug.assert(this._lvSearchType === AddressWell.ListViewSearchType.people);

        // In a people search scenario, we need to manually fire an event to fetch more items in order to populate the collection
        if (this._lvCollection.totalCount > 0) {
            this._lvCollection.fetchMoreItems(AddressWell.maxWordWheelContacts);
        } else {
            // We don't have any more item to fetch at this point, terminate the search
            this._queryContactsByInputEnd();
        }
    } catch (e) {
        Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionChangedSearchComplete", e);
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        this._queryContactsByInputEnd();
    }
};

AddressWell.Controller.prototype._lvCollectionChangedBatchEnd = function () {
    /// <summary>
    /// Handler for the batch end event.
    /// </summary>

    // Only listen to batch end during people search, this event is ignored when searching in connected accounts
    Debug.assert(this._lvSearchType === AddressWell.ListViewSearchType.people);
    try {
        NoShip.log("AddressWell.Controller._lvCollectionChangedBatchEnd invoked with totalCount: " + this._lvCollection.totalCount.toString());
        NoShip.log("AddressWell.Controller._lvCollectionChangedBatchEnd invoked with count: " + this._lvCollection.count.toString());
    } catch (e) {
        Jx.fault("AddressWell.AddressWellController.js", "_lvCollectionChangedBatchEnd", e);
    } finally {
        this._loopThroughCollection();
    }
};

AddressWell.Controller.prototype._loopThroughCollection = function () {
    /// <summary>
    /// Helper function that loops through the collection of people objects to populate the resulting list of AddressWell.Contact objects.
    /// </summary>
    Debug.assert(this._lvSearchType === AddressWell.ListViewSearchType.people);

    var maxItems = AddressWell.maxWordWheelContacts;
    try {
        var /* @type(Number) */peopleCount = this._lvCollection.count;
        NoShip.log("AddressWell.Controller _loopThroughCollection with input '" + this._lvInput + "' - returns " + peopleCount.toString() + " items");
        if (peopleCount > 0) {
            var person = null;
            for (var count = 0; count < peopleCount; count++) {
                person = /* @static_cast(Microsoft.WindowsLive.Platform.IPerson) */this._lvCollection.item(count);
                if (this._processChatPerson(this._lvResults, person) >= maxItems) {
                    break;
                }
            }
        }
    } catch (e) {
        this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        Jx.fault("AddressWell.AddressWellController.js", "_loopThroughCollection", e);
    } finally {
        this._queryContactsByInputEnd();
    }
};

AddressWell.Controller.prototype._processChatPerson = function (contactResults, person) {
    /// <summary>
    /// Populates the given people results array with an AddressWell.Contact object if the given person is a valid chat contact.
    /// </summary>
    /// <param name="contactResults" type="Array">
    ///     The contact results array that we would like to populate.
    ///     This parameter is passed by reference.
    ///     </param>
    /// <param name="person" type="Microsoft.WindowsLive.Platform.IPerson">The person object from the Contacts Platform.</param>
    /// <returns type="Number">The number of items in the people results array.</returns>

    // Filter out the MeContact
    if (person.objectType !== "MeContact") {
        var tileUrl = AddressWell.getUserTileUrl(person, Microsoft.WindowsLive.Platform.UserTileSize.extraSmall);

        // Add the person to the results, as a recipient

        // List of recipients can't be empty, and the email address also can't be empty, so we have a fake email address. Bug 626123 tracks fixing this.
        var fakeChatRecipient = /*@static_cast(Microsoft.WindowsLive.Platform.IRecipient)*/{
            calculatedUIName: person.calculatedUIName,
            emailAddress: "",
            person: person,
            isJsRecipient: true
        };
        contactResults.push(new AddressWell.Contact(person, [fakeChatRecipient], tileUrl));
    }
    return contactResults.length;
};

AddressWell.Controller.prototype._onRecipientStateChanged = function (ev) {
    var recipient = /*@static_cast(AddressWell.Recipient)*/ev.sender;

    if (recipient.state === AddressWell.RecipientState.resolved) {
        this.raiseEvent(AddressWell.Events.autoResolveSuccessful, { recipient: recipient });
    }

    if (recipient.state !== AddressWell.RecipientState.pendingResolution) {
        // Stop listening to state changes for this recipient.
        recipient.removeListener(AddressWell.RecipientEvents.stateChanged, this._onRecipientStateChanged, this);
    }
};

AddressWell.Controller.prototype._onInputFocus = function () {
    /// <summary>
    /// Handler for the focus event fired by the Input control. We
    /// listen for it to invoke suggestions, when it's appropriate.
    /// </summary>

    // Indicate that the drop down is a live region.
    // Note: we are setting it here instead of always setting in the HTML is to avoid over using ara-live attribute per Narrator guidance
    this._dropDown.addAriaLive();

    if (this._autoSuggestOnFocus && !this._dropDown.isShowing()) {
        this._displaySuggestionsView(AddressWell.SuggestionInvocationType.explicit);
        // Only auto-suggest on focus once per focus session of the control.
        this._autoSuggestOnFocus = false;
    }
};

AddressWell.Controller.prototype._onInputClick = function () {
    /// <summary>
    /// Handler for the click event fired by the Input control. We
    /// listen for it to invoke suggestions, when it's appropriate.
    /// </summary>

    // Check to see if the input has text.
    if ((this._input.getUserInput().length === 0) && !this._dropDown.isShowing()) {
        this._displaySuggestionsView(AddressWell.SuggestionInvocationType.explicit);
    }
};

AddressWell.Controller.prototype._onArrowKey = function (key) {
    /// <summary>
    /// Handler for the AddressWell.Events.arrowKey event fired by the Input control. We
    /// listen for it to invoke suggestions, when it's appropriate.
    /// </summary>

    if (this._dropDown.isVisible()) {
        // If the up-arrow key is pressed, suggestions are showing, and one of
        // the drop-down items is not highlighted, dismiss the drop-down.
        if (key === AddressWell.Key.arrowUp &&
            this._dropDown.currentView === AddressWell.DropDownView.suggestionsList &&
            this._dropDown.getAttr(AddressWell.highlightAreaAttr) !== AddressWell.HighlightArea.dropDown) {
            this._dropDown.hide();
        } else {
            if (this._input.isImeActive()) {
                this._input.finalizeInput();
            }

            // Let the drop-down handle it.
            this._dropDown.handleArrowKey(key);
        }
    } else if (key === AddressWell.Key.arrowDown && this._input.getUserInput().length === 0) {
        // Show suggestions, if enabled.
        this._displaySuggestionsView(AddressWell.SuggestionInvocationType.explicit);
    }
};

AddressWell.Controller.prototype._clearProcessInputTimeout = function () {
    Jx.log.verbose("AddressWell.Controller._clearProcessInputTimeout");
    if (this._queueProcessTimeout) {
        clearTimeout(this._queueProcessTimeout);
        this._queueProcessTimeout = null;
    }
};

AddressWell.Controller.prototype._userInputChanged = function () {
    /// <summary>
    /// Handles the logic when user input has changed, as well as rendering the dropdown if it's not already visible.
    /// </summary>
    Jx.log.verbose("AddressWell.Controller._userInputChanged");

    this._clearProcessInputTimeout();
    Debug.assert(!this._queueProcessTimeout, "this._queueProcessTimeout should have been cleared");

    // Cancel any pending, explicit searches.
    this._lvCollectionDispose();
    this._cancelWordWheelSearch();
    this._cancelExplicitServerSearch();

    var userInput = this._input.getUserInput().trim();
    if (Jx.isNonEmptyString(userInput)) {
        // If the user is typing rapidly, we don't want to send off the changes faster
        // than they can be proccessed. Reset timeout and wait for user's typing to pause
        // for the desired threshold before processing the changes.
        this._queueProcessTimeout = setTimeout(this._processInputChanges.bind(this, userInput), 150);
    } else {
        // In the case of the user clearing the input, there's nothing to search for. We'll just
        // send this one through. It will either show suggestions, or hide the drop-down is suggestions
        // are disabled.
        this._processInputChanges(userInput);
    }
};

AddressWell.Controller.prototype._processInputChanges = function (userInput) {
    Jx.log.verbose("AddressWell.Controller._processInputChanges");

    if (Jx.isNonEmptyString(userInput)) {
        // If the user input is not empty, the drop down will be rendered in list view
        this._displayListView(userInput);
    } else {
        // If the user input is empty, the drop down will be rendered in tile view
        this._displaySuggestionsView(AddressWell.SuggestionInvocationType.implicit);
    }
};

AddressWell.Controller.prototype._displaySuggestionsView = function (invocationType) {
    /// <summary>
    /// Renders the drop down in list view with platform-provided suggestions.
    /// </summary>
    /// <param name="invocationType" type="AddressWell.SuggestionInvocationType"></param>

    // Only display tile view if we are configed to do so
    if (this._showSuggestions) {
        if ((invocationType === AddressWell.SuggestionInvocationType.implicit && !this._firstRecipientAdded) ||
            (invocationType === AddressWell.SuggestionInvocationType.explicit)) {
            // Get the current list of recipients
            var currentRecipients = this._input.getRecipients(true); // true: Filter to platform-appropriate recipients

            // Retrieve the list of relevant suggestions.
            var contacts = this._queryRelevantContacts(AddressWell.maxSuggestions, currentRecipients);

            // Render the suggestions list
            this._dropDown.render(AddressWell.DropDownView.suggestionsList, contacts, null /* connectedAccounts */);
        } else {
            // Can't display suggestions, make sure previous results are hidden.
            this._dropDown.hide();
        }

    } else if (this._dropDown.isVisible()) {
        // If we are hiding suggestions, we still need to refresh the view by rendering no contacts.
        this._dropDown.hide();
    }
};

AddressWell.Controller.prototype._displayListView = function (input) {
    /// <summary>
    /// Performs people search and renders the drop down in list view with data.
    /// </summary>
    /// <param name="input" type="String">The given user input.</param>

    switch (this._contactSelectionMode) {
        case AddressWell.ContactSelectionMode.emailContacts:
            this._wordWheelSearch(input);
            break;
        case AddressWell.ContactSelectionMode.chatContacts:
            // List view displays contacts as a result of word wheeling
            var me = this;

            // Note: Wrap the callbacks inside msSetImmediate so that it removes the callback from the promise call stack, allowing errors to propagate up to the global window error handler.
            this._queryContactsByInputAsync(input, AddressWell.ListViewSearchType.people, null /* connectedAccount */).done(
                /* onComplete */function ControllerDisplayListViewOnComplete(searchId) {
                    /// <param name="searchId" type="Number">The current ID to identify the search in progress.</param>
                    msSetImmediate(me._queryContactsByInputOnComplete.bind(me), searchId);
                },
                /* onError */function ControllerDisplayListViewOnError(e) {
                    /// <param name="e" type="String">The error string.</param>
                    msSetImmediate(me._queryContactsByInputOnError.bind(me), e);
                });
            break;
        default:
            Debug.assert(false, "Unsupported selectionMode");
            break;
    }
};

AddressWell.Controller.prototype._displayListViewForConnectedAccount = function (account) {
    /// <summary>
    /// Peroforms a search under the given connected account, and renders the drop down in list view with search results.
    /// </summary>
    /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount">The connected account.</param>

    var userInput = this._input.getUserInput();

    // Check if the account is valid and user input is not empty
    if (account !== null && Jx.isNonEmptyString(userInput.trim())) {
        if (!this._serverSearchAgent) {
            this._serverSearchAgent = new AddressWell.ServerSearch(this._platform, this._log);
        } else {
            this._serverSearchAgent.cancel();
        }

        // Render the progress UI
        this._dropDown.renderProgress();

        this._serverSearchAgent.queryAsync(userInput, account, /*@bind(AddressWell.Controller)*/function (/*@type(Array)*/results) {
            Debug.assert(Jx.isArray(results));
            if (results !== null && results.length === 1) {
                var contact = /* @static_cast(AddressWell.Contact) */ results[0];
                this._addDropDownRecipients({ recipients: [contact.recipients[0]], inputMethod: AddressWell.InputMethod.unknown });
            } else if (results !== null && this._dropDown.isVisible() && this._isFocusInControl()) {
                // At this stage we can render the drop down with a list of results
                this._dropDown.render(AddressWell.DropDownView.connectedAccountList, results, null);
            }
        }.bind(this) /*onComplete*/,
        /*@bind(AddressWell.Controller)*/function (error) {
            // We check to make sure the drop-down is visible. This also tells us if the UI is available,
            // which it might not be if the searched was cancelled because the addresswell went away.
            if (this._dropDown.isVisible() && AddressWell.SearchErrorType.cancelled !== error) {
                var errorString = AddressWell.convertSearchErrorToString(error, account.displayName);
                this._dropDown.renderText(errorString);
            }
        }.bind(this) /*onError*/ );

    }
};

AddressWell.Controller.prototype._queryContactsByInputOnComplete = function (searchId) {
    /// <summary>
    /// The onComplete function to render the drop down in list view with data.
    /// </summary>
    /// <param name="searchId" type="Number">The current ID to identify the search in progress.</param>

    // Before rendering list view, we need to ensure that:
    // 1. We still have a valid search collection object (e.g. It's not disposed as a result of cleaning up)
    // 2. We are still performing the same search (e.g. The control has not started a different search since the callback)
    // 3. We might have error text to display in the case of a connected account search
    Jx.log.verbose("AddressWell.Controller._queryContactsByInputOnComplete with searchId: " + searchId.toString() + " and this._lvSearchId: " + this._lvSearchId.toString());

    // In order to proceed, the callback's search id must match the id of the current search in progress
    if (searchId === this._lvSearchId) {

        if (this._lvCollection !== null) {
            // Check if we still have a valid search collection object
            Debug.assert(this._lvSearchType === AddressWell.ListViewSearchType.people);

            // At this stage we can render the drop down with a list of results
            if (this._lvResults.length === 0) {
                // Display 'no result' text
                this._dropDown.renderText(Jx.res.getString(AddressWell.stringsPrefix + "awSearchNoResults"));
            } else {
                this._dropDown.render(AddressWell.DropDownView.peopleSearchList, this._lvResults, null);
            }
        }

        // Disposes the collection object and its handler in case it's not null
        this._lvCollectionDispose();
    }
};

AddressWell.Controller.prototype._queryContactsByInputOnError = function (e) {
    /// <summary>
    /// The onError function to render the drop down with error string.
    /// This is usually called in the case the queryContactsByInput promise is cancelled (e.g. timeout event)
    /// </summary>
    /// <param name="e" type="String">The error string.</param>

    Jx.log.exception("AddressWell.Controller._queryContactsByInputOnError is invoked with exception.", e);

    this._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
    // Call onComplete function to render the drop down regardless
    this._queryContactsByInputOnComplete(this._lvSearchId);
};

AddressWell.Controller.prototype._searchFirstConnectedAccount = function () {
    /// <summary>
    /// Renders the drop down in list view with search results from the first connected account, if there is any.
    /// </summary>

    this._displayListViewForConnectedAccount(this._getConnectedAccount());
};

AddressWell.Controller.prototype._searchConnectedAccountId = function (connectedAccountId) {
    /// <summary>
    /// Renders the drop down in list view with search results from the given connected account ID.
    /// </summary>
    /// <param name="connectedAccountId" type="String">The connected account's object ID.</param>
    Debug.assert(connectedAccountId === this._contextualAccount.objectId);

    this._displayListViewForConnectedAccount(this._contextualAccount);
};

AddressWell.Controller.prototype._getConnectedAccount = function () {
    /// <summary>
    /// If the contextual account supports server-search, it will be returned, otherwise null.
    /// </summary>
    /// <returns type="Microsoft.WindowsLive.Platform.IAccount"/>
    if (this._contextualAccount) {
        var scenarios = /*@static_cast(Microsoft.WindowsLive.Platform.IAccountScenarios)*/this._contextualAccount; // JSCop doesn't believe that IAccount implements IAccountScenarios.
        if (scenarios.peopleSearchScenarioState === Microsoft.WindowsLive.Platform.ScenarioState.connected) {
            return this._contextualAccount;
        }
    }
    
    return null;
};

AddressWell.Controller.prototype._attachContainerListener = function () {
    /// <summary>
    /// If not already attached, this function will attach event listener to the top level container.
    /// </summary>
    
    // If the containerBlur handler is null, then this is the first time this event has fired since the user last started interacting with the control
    if (this._containerBlur === null) {
        // Because the blur event does not bubble, this would require a listener attached to each of the focusable children inside the control,
        // or a traveling listener that is always attached to the currently focused element inside the control in order to capture the event.
        // Another option is to use event capturing by setting the parameter to true such that the event is always fired from the container
        // as long as any of its child component is firing the event, which is the ideal scenario we are trying to achieve here.
        this._containerBlur = this._containerBlurHandler.bind(this);
        this._containerElement.addEventListener(AddressWell.Events.blur, this._containerBlur, true /* isCapture */);
    }
};

AddressWell.Controller.prototype._removeContainerListener = function () {
    /// <summary>
    /// If not already removed, this function will remove event listeners from the top level container.
    /// </summary>

    if (this._containerBlur !== null) {
        this._containerElement.removeEventListener(AddressWell.Events.blur, this._containerBlur, true /* isCapture */);
        // Reset to null
        this._containerBlur = null;
    }
};

AddressWell.Controller.prototype._inputPaneShowing = function (e) {
    /// <summary>
    /// Performs logic when the touch keyboard is starting to animate into view.
    /// </summary>
    /// <param name="e" type="Windows.UI.ViewManagement.InputPaneVisibilityEventArgs"/>

    // This handler is triggered when the touch keyboard's showing event is triggered,
    // at this point the touch keyboard is animating into view but the window size is not yet updated.
    // Due to the way InputPane does not expose an API that we can call back after
    // the keyboard has been completely shown and the window is fully resized, 
    // we need to rely on a timeout event to manually re-layout our elements into view.

    // Alternatively we can subscribe to the subsequent window.resize event.  Unfortunately this event
    // is never fired if the caller has set e.ensuredFocusedElementInView = true and hence not reliable.

    this._dropDown.setInputPaneTop(e.occludedRect.y);

    // Proceed only if the following conditions are met:
    // - If there is a valid scrollable container that we can scroll in
    // - If the input pane is not already shown
    if (Jx.isHTMLElement(this._getScrollableElement()) &&
        this._inputPaneShowingTimeout === null) {

        // Determine the duration of the input pane showing animation
        var /* @type(Windows.UI.Core.AnimationMetrics.IPropertyAnimation) */ inputPaneShowAnimation = this._animationMetrics.AnimationDescription(this._animationMetrics.AnimationEffect.showPanel, this._animationMetrics.AnimationEffectTarget.primary).animations[0];
        var duration = inputPaneShowAnimation.duration;

        // In case animation is disabled, use the maximum duration for the keyboard to be fully shown
        // When a timer is set with timeout value <= 10ms, IE will switch to use high frequency timer.
        if (duration <= 10) {
            duration = AddressWell.maxInputPaneShowing;
        }
        this._inputPaneShowingTimeout = window.setTimeout(this._inputPaneFullyShown.bind(this), duration + 50);
    }
};

AddressWell.Controller.prototype._inputPaneHiding = function () {
    this._dropDown.clearInputPaneTop();
};

AddressWell.Controller.prototype._inputPaneFullyShown = function () {
    /// <summary>
    /// At this point the touch keyboard is fully shown on the screen and window size has been updated.
    /// We will perform scroll into view logic and reset the timeout handler since we are done with it.
    /// </summary>

    this._clearInputPaneShowingTimeout();
    if (this.hasFocus()) {
        this._scrollIntoView();
    }
};

AddressWell.Controller.prototype._clearInputPaneShowingTimeout = function () {
    /// <summary>
    /// This function clears the _inputPaneShowingTimeout
    /// </summary>

    if (Jx.isNumber(this._inputPaneShowingTimeout)) {
        window.clearTimeout(this._inputPaneShowingTimeout);
        this._inputPaneShowingTimeout = null;
    }
};

AddressWell.Controller.prototype._scrollIntoView = function () {
    /// <summary>
    /// This functions takes into consideration the priority order of the elements to be in view and calls scrollIntoView accordingly.
    /// </summary>

    // Ignore scroll-into-view requests if we're currently waiting for the on-screen keyboard
    // to finish showing or we don't have focus.
    if (!this._scrollsIntoView || this._inputPaneShowingTimeout !== null || !this.hasFocus()) {
        return;
    }

    AddressWell.markStart("Input.scrollIntoView");

    var scrollableElement = this._getScrollableElement();
    if (Jx.isHTMLElement(scrollableElement)) {
        var inputElement = this._input.getRootElement();
        var inputHeight = inputElement.offsetHeight;
        var dropDownHeight = this._dropDown.getRootElement().offsetHeight;

        // If the caller has set ensuredFocusedElementInView = true we need a more accurate height of the view port by taking the minimum of the following values
        var viewPortHeight = Math.min(window.innerHeight, scrollableElement.offsetHeight);

        Debug.log("AddressWell.scrollIntoView Math. DropDownHeight: " + /*@static_cast(String)*/dropDownHeight + ", viewPortHeight: " + /*@static_cast(String)*/viewPortHeight + ", inputHeight: " + /*@static_cast(String)*/inputHeight);

        // First checks to see if the entire height of the control cannot fit onto screen
        if ((inputHeight + dropDownHeight) > viewPortHeight) {
            // If the whole control won't fit on the screen, we'll scroll so that the bottom part of the input element is on the screen, to show the maximum amount of the dropdown.
            Jx.log.verbose("AddressWell.scrollIntoView: entire control will not fit in viewport, scrolling the top of the input element");

            // We've got a "scrollTo" element in the input box that helps us keep only some part of the input box in view if it's got multiple lines
            var scrollToElement =  document.getElementById(this._input._scrollToId);
            if (inputHeight < scrollToElement.offsetHeight) {
                // The idea here is to make sure some minimum amount of a multiline address well shows - not add space at the top.  
                // If the whole input box is less than the min-height, just use the input box.
                scrollToElement = inputElement;
            }

            // Force scroll the element to the top of the page - even if it's already in view.  This will show as much of the dropdown as possible.
            scrollToElement.scrollIntoView(true);

        } else {
            // Everything fits.

            if (dropDownHeight > 0) {
                Jx.log.verbose("AddressWell.scrollIntoView: Everything fits - making sure bottom of the dropdown is in view.");
                // If everything can fit onto screen, and there's a dropdown, ensure that the bottom of the drop down container is in view
                AddressWell.scrollIntoViewIfNotInView(this._dropDown._bottomElement, false, scrollableElement);
            } else {
                Jx.log.verbose("AddressWell.scrollIntoView: Everything fits - making sure input element is in view (no dropdown).");
                // If everything can fit onto screen, and there's no dropdown, ensure that the bottom of the input container is in view
                AddressWell.scrollIntoViewIfNotInView(inputElement, false, scrollableElement);
            }

        }
    }
    AddressWell.markStop("Input.scrollIntoView");
};


AddressWell.Controller.prototype._dropDownReadyHandler = function () {
    /// <summary>
    /// Handler for the AddressWell.Events.dropDownReady event, invoked by the drop-down
    /// when it's fully shown and ready for user interaction.
    /// </summary>
    // Ensure the input has focus. This might be neccessary if the drop-down
    // was invoked in response to a click in the container and not the focus being set
    // in the input.
    this._input._inputElement.blur(); // TODO (BLUE#336044): remove this workaround.
    this.focusInput();
    this._scrollIntoView();
};

AddressWell.Controller.prototype._inputOffsetAdjusted = function (ev) {
    /// <summary>
    /// Handler for the AddressWell.Events.inputOffsetAdjusted event, invoked when the left offset for the input control changes.
    /// </summary>
    var addresswellWidth = this._input.getRootElement().offsetWidth;
    // calculation should match that for .aw-ddContainer in addresswellDropdown.css. (Can't use getComputedStyle as it would return 85%/100%(Mail/Calendar) or 340px, 240px based on condition.)
    var dropDownWidth = Math.max(240, (Math.min(340, addresswellWidth * AddressWell.dropdownToContainerWidthPercentage)));
        
    // In LTR, if the dropdown should be left aligned with input, use the value passed in. If the dropdown should be right aligned with the container, use the calculated value.
    // In RTL, the passed in offset value(ev) is the right position of the input element. So the left offset of the dropdown should should be the right position of input 
    // minus the dropdown width and its left/right borders if it's right aligned with input. Otherwise, it should just be left aligned with the container.
    var inputLeftOffset = Jx.isRtl() ? Math.max(ev - dropDownWidth - 2* AddressWell.dropDownBorderWidthOffset, -AddressWell.dropDownBorderWidthOffset): 
            Math.min(ev, addresswellWidth - dropDownWidth - AddressWell.dropDownBorderWidthOffset);
    this._dropDown.setDropdownLeftOffset(inputLeftOffset);
};

AddressWell.Controller.prototype._inputImeWindowHeightUpdated = function (ev) {
    /// <summary>
    /// Handler for the AddressWell.Events.inputImeWindowHeightUpdated event, invoked when the IME window for input control show/hides.
    /// </summary>
    this._dropDown.adjustImeOffset(ev);
};
//
// Copyright (C) Microsoft. All rights reserved.
//

});
