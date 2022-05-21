
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Include.js"/>
/// <reference path="../JSUtil/Namespace.js"/>
/// <reference path="IdentityControl.js"/>
/// <reference path="SelectionManager.ref.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "IdentityElements", function () {
    
    "use strict";
    var P = window.People;
    var IdentityControl = P.IdentityControl;
    var addClassNameToOptions = IdentityControl.addClassNameToOptions;
    var getOption = IdentityControl.getOption;
    var Plat = Microsoft.WindowsLive.Platform;

    var Elements = P.IdentityElements = {};

    var makeElement = Elements.makeElement = function (type, locator, className, options, content) {
        return makeElementWithAttributes(type, locator, className, options, "", content);
    };
    var makeElementWithAttributes = Elements.makeElementWithAttributes = function (type, locator, className, options, attributes, content) {
        ///<summary>Creates an HTML string for an element</summary>
        ///<param name='type' type='String'>The type of element (div/span/img)</param>
        ///<param name='locator' type='String'>A class name used to locate this element</param>
        ///<param name='className' type='String'>The CSS class for this element</param>
        ///<param name='options' type='Object'>An options structure from which an additional CSS class will
        ///be extracted</param>
        ///<param name='content' type='String'>The innerHTML of this element</param>
        ///<returns type='String'/>
        Debug.assert(Jx.isNonEmptyString(type));
        Debug.assert(Jx.isNonEmptyString(locator));
        Debug.assert(Jx.isString(className));
        Debug.assert(Jx.isNullOrUndefined(options) || Jx.isObject(options));
        Debug.assert(Jx.isString(content));
        return "<" + type + " class='" + locator + " " + className + " " + getOption(options, "className", "") + "' " + getOption(options, "attributes", "") + " " + attributes + ">" +
            content +
        "</" + type + ">";
    };

    var BaseElement = Elements.BaseElement = /*@constructor*/function () {
        ///<summary>BaseElement provides noop implementations of the optional element functions</summary>
    };
    BaseElement.prototype.getUI = function (host, locator, options) { Debug.assert(false, "getUI must be overriden by derived classes"); };
    BaseElement.prototype.clone = function (host) {
        ///<summary>Clone can be called in place of getUI for faster HTML creation.  Elements should initialize themselves
        ///to the same state as they would have after getUI was called.  Most elements don't do initialize anything until
        ///activateUI, so this function is simple.  Elements with more complex needs will override this method.</summary>
        ///<returns type="BaseElement"/>
        return new this.constructor();
    };
    BaseElement.prototype.activateUI = function (host, node) { };
    BaseElement.prototype.shutdownUI = function (host) { };
    BaseElement.prototype.getTooltip = function (host, dataSource) { return ""; };

    var Name = Elements.Name = /*@constructor*/function () {
        ///<summary>The Name element renders the calculatedUIName</summary>
        this._textNode = /*@static_cast(HTMLNode)*/null;
        this._value = "";
        Debug.only(Object.seal(this));
    };
    Jx.inherit(Name, BaseElement);
    Name.prototype.getUI = function (host, locator, options) {

        // Get the initial name value from the data object
        var dataObject = host.getDataObject();
        var name = this._value = dataObject ? Name.getName(dataObject, true /*fast*/) : null;
        return makeElement("span", locator, "ic-name", options, name ? Jx.escapeHtml(name) : " ");
    };
    Name.prototype.activateUI = function (host, node) {
        this._textNode = node.firstChild;
        host.bind(this._setName, this, P.Priority.synchronous);
    };
    Name.prototype.shutdownUI = function (host) {
        this._textNode = null;
    };
    Name.getName = function (dataObject, fast) {
        /// <param name="fast" type="Boolean" optional="true">Recipients are slow at retrieving the name, passing true gets a fast-but-sometimes-incorrect value</param>
        var name;
        switch (dataObject.objectType) {
            case "Person":
            case "MeContact":
                name = dataObject.calculatedUIName;
                break;
            case "Contact":
                name = dataObject.calculatedUIName || Jx.res.getString("/strings/person_calculatedUIName_unnamed");
                break;
            case "literal":
                name = dataObject.name;
                break;
            case "Recipient":
                if (fast) {
                    name = dataObject.fastName;
                    Debug.assert(Jx.isNonEmptyString(name), "Recipient has no name");
                } else {
                    name = dataObject.calculatedUIName;
                    // The recipient doesn't fire changes when its name changes, so we'll piggybck
                    // notifications on the person object.  Accessing and discarding those properties will
                    // get us the subscriptions we need.
                    var person = dataObject.person;
                    if (person) {
                        person.calculatedUIName;
                    }
                }
                break;
        }

        return name;
    };
    Name.prototype._setName = function (dataObject) {
        var name = Name.getName(dataObject);
        if (name !== this._value) {
            this._value = name;
            setNodeText(this._textNode, name);
        }
    };

    var Networks = Elements.Networks = /*@constructor*/function () {
        ///<summary>The Networks element renders a comma delimited list of network names</summary>
        this._textNode = /*@static_cast(HTMLNode)*/null;
        this._priority = P.Priority.slowData;
        Debug.only(Object.seal(this));
    };
    Jx.inherit(Networks, BaseElement);
    Networks.prototype.getUI = function (host, locator, options) {
        this._priority = getOption(options, "priority", P.Priority.slowData);
        return makeElement("span", locator, "ic-name", options, " ");
    };
    Networks.prototype.clone = function (host) {
        var clone = new Networks();
        clone._priority = this._priority;
        return clone;
    };
    Networks.prototype.activateUI = function (host, node) {
        this._textNode = node.firstChild;
        host.bind(this._clear, this, P.Priority.synchronous);
        host.bind(this._setNetworks, this, this._priority);
    };
    Networks.prototype.shutdownUI = function (host) {
        this._textNode = null;
    };
    Networks.getNetworks = function (dataObject) {
        var contacts;
        switch (dataObject.objectType) {
            case "Person":
            case "MeContact":
                contacts = dataObject.linkedContacts;
                break;
            case "Recipient":
                var person = dataObject.person;
                if (person) {
                    contacts = person.linkedContacts;
                }
                break;
            case "Contact":
                contacts = [dataObject];
                break;
            case "literal":
                return dataObject.networkDisplayName || "";
            default:
                break;
        }

        var networks = [];
        if (contacts) {
            contacts.forEach(function (contact) {
                var account = contact.account;
                if (account) {
                    var name = account.displayName;
                    if (Jx.isNonEmptyString(name) && networks.indexOf(name) === -1) {
                        networks.push(name);
                    }
                }
            });
        }
        return networks.join(Jx.res.getString("/identityControl/icNetworkSeperator"));
    };
    Networks.prototype._setNetworks = function (dataObject) {
        setNodeText(this._textNode, Networks.getNetworks(dataObject));
    };
    Networks.prototype._clear = function (databject) {
        setNodeText(this._textNode, "");
    };
    Networks.prototype.getTooltip = function (host, node) {
        return this._textNode.nodeValue;
    };

    var StatusIndicator = Elements.StatusIndicator = /*@constructor*/function () {
        ///<summary>The StatusIndicator element translates the onlineStatus property into a background color</summary>
        this._node = /* @static_cast(HTMLElement)*/null;
        this._baseClassName = "";
        this._currentStatusClass = "";
        this._status = Microsoft.WindowsLive.Platform.ContactStatus.offline;
        Debug.only(Object.seal(this));
    };
    Jx.inherit(StatusIndicator, BaseElement);
    StatusIndicator.prototype.getUI = function (host, locator, options) {
        this._baseClassName = "ic-status " + getOption(options, "className", "");
        return makeElement("div", locator, "ic-status", options, "");
    };
    StatusIndicator.prototype.clone = function (host) {
        var clone = new StatusIndicator();
        clone._baseClassName = this._baseClassName;
        return clone;
    };
    StatusIndicator.prototype.activateUI = function (host, node) {
        this._node = node;
        host.bind(this._setStatus, this, P.Priority.synchronous);
    };
    StatusIndicator.prototype._setStatus = function (dataObject) {
        var value = dataObject.onlineStatus;

        var statusClass = ""; // No class for offline, it is the the default state
        switch (value) {
            case Plat.ContactStatus.online:
                statusClass = "ic-status-online";
                break;
            case Plat.ContactStatus.away:
                statusClass = "ic-status-away";
                break;
            case Plat.ContactStatus.busy:
                statusClass = "ic-status-busy";
                break;
        }

        this._status = value;
        if (this._currentStatusClass !== statusClass) {
            this._currentStatusClass = statusClass;
            this._node.className = this._baseClassName + " " + statusClass;
        }
    };
    StatusIndicator.prototype.getTooltip = function (host, node) {
        return StatusText.getStatusText(this._status);
    };

    var StatusText = Elements.StatusText = /*@constructor*/function () {
        ///<summary>The StatusText element renders the onlineStatus property as a string</summary>
        this._textNode = /*@static_cast(HTMLNode)*/null;
        Debug.only(Object.seal(this));
    };
    Jx.inherit(StatusText, BaseElement);
    StatusText.prototype.getUI = function (host, locator, options) {
        return makeElement("span", locator, "ic-statusText", options, " ");
    };
    StatusText.prototype.activateUI = function (host, node) {
        this._textNode = node.firstChild;
        host.bind(this._setStatus, this, P.Priority.synchronous);
    };
    StatusText.prototype.shutdownUI = function (host) {
        this._textNode = null;
    };
    StatusText.prototype._setStatus = function (dataObject) {
        var value = dataObject.onlineStatus,
            isMe = dataObject.objectType === "MeContact";
        setNodeText(this._textNode, StatusText.getStatusText(value, true /* show offline values*/, isMe));
    };
    StatusText.getStatusText = function (statusValue, showOfflineValues, isMe) {
        /// <summary>Gets a text string representing the given status</summary>
        /// <param name="statusValue" type="Plat.ContactStatus"/>
        /// <param name="showOfflineValues" type="Boolean" optional="true"/>
        /// <param name="isMe" type="Boolean" optional="true"/>
        var resource;
        if (!Jx.isNullOrUndefined(statusValue)) {
            switch (statusValue) {
                case Plat.ContactStatus.online: resource = "/identityControl/icStatusOnline"; break;
                case Plat.ContactStatus.busy: resource = "/identityControl/icStatusBusy"; break;
                case Plat.ContactStatus.away: if (showOfflineValues) { resource = "/identityControl/icStatusAway"; } break;
                case Plat.ContactStatus.offline: if (showOfflineValues) { resource = isMe ? "/identityControl/isStatusMeOffline" : "/identityControl/icStatusOffline"; } break;
                case Plat.ContactStatus.appearOffline: if (showOfflineValues) { resource = "/identityControl/icStatusAppearOffline"; } break;
                default: Debug.assert(false, "Unrecognized status value: " + status); break;
            }
            if (resource) {
                return Jx.res.getString(resource);
            }
        }
        return "";
    };

    var Tile = Elements.Tile = /*@constructor*/function () {
        ///<summary>The Tile element renders the usertile image.  It supports: {
        ///      size:            220
        /// }
        ///</summary>
        this._node = /*@static_cast(HTMLElement)*/null;
        this._style = /*@static_cast(HTMLStyle)*/null;
        this._path = "";
        this._url = "";
        this._clampedSize = 220;
        this._tilePriority = P.Priority.synchronous;
        this._collapse = false;
        this._defaultImage = null;
        this._download = false;
        this._userTileBinder = /*@static_cast(P.PlatformObjectBinder)*/null;
        this._userTile = /*@static_cast(Microsoft.WindowsLive.Platform.UserTile)*/null;
        this._imgToVerify = /*@static_cast(Image)*/null;
        this._imgListener = /*@static_cast(Function)*/null;
        this._entranceAnimation = false;
        this._animation = /*@static_cast(WinJS.Promise)*/null;
        this._animatingNode = /*@static_cast(HTMLElement)*/null;
        this._pendingUrl = "";

        Debug.only(Object.seal(this));
    };
    Jx.inherit(Tile, BaseElement);
    var UserTileSize = Microsoft.WindowsLive.Platform.UserTileSize;
    var platformTileSizes = { // The platform takes T-shirt sizes, valued 0-5.  So we need to convert pixels to that.
        32: UserTileSize.tiny,
        40: UserTileSize.extraSmall,
        60: UserTileSize.small,
        95: UserTileSize.medium,
        100: UserTileSize.large,
        220: UserTileSize.extraLarge
    };
    var clampSize = function (desiredSize) {
        ///<summary>Given a desired size picks the best size from the built in values</summary>
        ///<param name="desiredSize" type="Number"/>
        ///<returns type="Number"/>
        var clampedSize;
        for (var availableSize in platformTileSizes) {
            clampedSize = parseInt(availableSize);
            if (clampedSize >= desiredSize) {
                break;
            }
        }
        
        Debug.assert(clampedSize);
        if (clampedSize !== desiredSize) {
            Jx.log.warning("Clamping non-standard usertile size " + desiredSize + " to " + clampedSize);
        }
        
        return clampedSize;
    };
    Tile.prototype.getUI = function (host, locator, options) {
        var size = getOption(options, "size", 220);
        this._clampedSize = clampSize(size);
        this._tilePriority = getOption(options, "tilePriority", P.Priority.synchronous);
        this._collapse = getOption(options, "collapse", false);
        this._entranceAnimation = getOption(options, "animate", false);
        this._defaultImage = getOption(options, "defaultImage", null);
        this._download = false;
        return makeElementWithAttributes("div", locator, "ic-tile", options, "style='width:" + size + "px; height:" + size + "px;'", "");
    };
    Tile.prototype.clone = function (host) {
        var clone = new Tile();
        clone._clampedSize = this._clampedSize;
        clone._tilePriority = this._tilePriority;
        clone._collapse = this._collapse;
        clone._entranceAnimation = this._entranceAnimation;
        clone._defaultImage = this._defaultImage;
        return clone;
    };
    Tile.prototype.activateUI = function (host, node) {
        this._node = node;
        this._style = node.style;
        host.bind(this._reset, this, P.Priority.synchronous);
        host.bind(this._setDataObject, this, this._tilePriority);
        host.bind(this._downloadTile, this, P.Priority.userTileDownload);
    };
    Tile.prototype._setDataObject = function (dataObject) {
        /// <summary>Called when we get a new data source (Person/Contact/etc)</summary>
        /// <param name="dataObject">The person/contact/object literal/recipient</param>

        this._disposeTile(); // If we already have a usertile object, discard it.

        if (dataObject.objectType === "literal") { // Object literals have an URL property.  Just use it directly.
            var url = dataObject.userTile;
            if (this._clampedSize > 100 && Jx.isNonEmptyString(dataObject.largeUserTile)) {
                url = dataObject.largeUserTile;
            }
            this._setUrl(url);
        } else { // Other types will have platform usertile objects.

            if (dataObject.objectType === "Recipient") { // Recipients that match Person objects get tiles from them
                dataObject = dataObject.person;
            }

            if (dataObject) {
                NoShip.only(msWriteProfilerMark("Retrieving usertile [ person=" + dataObject.getPlatformObject().objectId + "  size=" + platformTileSizes[this._clampedSize] + "  cached=" + !this._download + " ]"));
                this._userTileBinder = dataObject.getUserTile(platformTileSizes[this._clampedSize], !this._download);

                if (this._userTileBinder) { // If we got a tile, grab an accessor to it and bind changes to _setPath
                    this._userTile = this._userTileBinder.createAccessor(this._setPath.bind(this));
                    NoShip.only(msWriteProfilerMark("Retrieved usertile [ tile=" + this._userTile.objectId + " ]"));
                }
            }

            this._setPath(); // Whether we got a tile or not, update the UI
        }

        if (this._download) {
            this._verifyImage(this._url);
        }
    };
    Tile.prototype._setPath = function () {
        /// <summary>Looks at the usertile object, extracts a URL from it and applies it.  Called to get our first
        /// tile, and when the tile changes.</summary>
        var path = this._userTile ? this._userTile.appdataURI : null;
        if (!this._url || this._path !== path) { // path is invalid or has changed
            NoShip.only(msWriteProfilerMark("New tile path [ tile=" + (this._userTile && this._userTile.objectId) + " newPath=" + path + " oldPath=" + this._path + " ]"));

            this._path = path;

            this._setUrl(path);
        }
    };
    Tile.prototype._setUrl = function (value) {
        /// <summary>Called to apply a usertile URL to the UI</summary>
        /// <param name="value" type="String" optional="true"/>
        if (!Jx.isNonEmptyString(value)) {
            if (this._defaultImage === null) {
                this._defaultImage = Include.replacePaths("$(imageResources)/ic-default-" + this._clampedSize + ".png");
            }
            value = this._defaultImage;

            if (!this._url && this._collapse) {
                // If there is no tile, the user has requested collapse, and this is our first tile update for this user,
                // hide the tile.  Display will be reset in _reset if this IC is reused.
                Jx.addClass(this._node, "ic-collapsed");
            }
        }
        if (this._url !== value) {

            if (this._animation) {
                // An animation is already in progress.  We'll store this value and call _setUrl again in _onAnimationComplete.
                this._pendingUrl = value;
            } else {
                var animation;
                if (!this._url && value) {
                    // If we had no previous value and are just now setting one, play an entrance animation if requested.
                    if (this._entranceAnimation) {
                        animation = WinJS.UI.Animation.fadeIn(this._node);
                    }
                } else if (this._url) {
                    // If we had a previous value, put it onto a child node and fade that out for a smooth transition to the updated tile.
                    var animatingNode = this._animatingNode = document.createElement("div");
                    animatingNode.style.backgroundImage = this._style.backgroundImage;
                    animatingNode.className = "ic-tile-fade";
                    this._node.insertBefore(animatingNode, this._node.firstChild);
                    animation = WinJS.UI.Animation.fadeOut(animatingNode);
                }

                this._style.backgroundImage = "url(" + value + ")";
                this._url = value;
                this._verifyImage(value);

                if (animation) {
                    this._animation = animation;
                    animation.done(this._onAnimationComplete.bind(this));
                }
            }
        }
        NoShip.People.etw("abIdentityControl_end");
    };
    Tile.prototype._onAnimationComplete = function () {
        this._animation = null;
    
        this._removeAnimatingNode();

        // If another change happened while we were animating, apply it now.
        var pendingUrl = this._pendingUrl;
        if (pendingUrl) {
            this._pendingUrl = null;
            this._setUrl(pendingUrl);
        }
    };
    Tile.prototype._verifyImage = function (url) {
        /// <summary>Verifies that the specified URL can be downloaded, falls back to the default if it cannot</summary>
        /// <param name="url" type="String"/>
        this._stopVerification();
        if (Jx.isNonEmptyString(url) && url.substr(0,4) === "http") { // We only verify web images, not local ones
            var imgToVerify = this._imgToVerify = new Image();
            var imgListener = this._imgListener;
            if (!imgListener) {
                imgListener = this._imgListener = this._onVerificationError.bind(this);
            }
            imgToVerify.addEventListener("error", imgListener);
            imgToVerify.src = url;
        }
    };
    Tile.prototype._onVerificationError = function (ev) {
        /// <summary>Hooked to the onerror event of this._imgToVerify, resets our image URL to the default</summary>
        /// <param name="ev" type="Event"/>
        Debug.assert(this._imgToVerify === ev.srcElement);
        Jx.log.error("Failed to download usertile");
        Jx.log.pii(this._imgToVerify.src);
        this._setUrl(null);
    };
    Tile.prototype._stopVerification = function () {
        /// <summary>Halt verification of any image (either due to shutdown or a new image being set)</summary>
        var imgToVerify = this._imgToVerify;
        if (imgToVerify) {
            imgToVerify.removeEventListener("error", this._imgListener);
            imgToVerify.src = "";
            this._imgToVerify = null;
        }
    };
    Tile.prototype._downloadTile = function (dataObject) {
        /// <summary>Called at idle to request download of the usertile</summary>
        /// <param name="dataObject">The person/contact/recipient/etc</param>
        this._download = true;
        this._setDataObject(dataObject);
    };
    Tile.prototype._disposeTile = function () {
        /// <summary>Discards the platform usertile object and unhooks it for notifications.</summary>
        if (this._userTileBinder) {
            this._userTileBinder.dispose();
            this._userTileBinder = this._userTile = null;
        }
    };
    Tile.prototype._removeAnimatingNode = function () {
        /// <summary>Cleans up the temporary node used for animations</summary>
        var animatingNode = this._animatingNode;
        if (animatingNode) {
            this._animatingNode = null;

            var parentElement = animatingNode.parentElement;
            if (parentElement) { // The consuming component may have destroyed the HTML already
                parentElement.removeChild(animatingNode);
            }
        }
    };
    Tile.prototype._cleanup = function () {
        /// <summary>Terminates out any ongoing activity (animations, event hooks, etc).</summary>
        this._stopVerification();

        this._disposeTile();

        this._pendingUrl = "";

        var animation = this._animation;
        if (animation) {
            this._animation = null;
            animation.cancel();
        }

    };
    Tile.prototype._reset = function (host, dataSource) {
        /// <summary>Called synchronously when we are being recycled.  Clears out any existing tile, and resets the UX
        /// for reuse.</summary> 
        this._download = false;

        this._cleanup();

        if (this._url) {
            this._url = this._style.backgroundImage = "";
            if (this._collapse) {
                Jx.removeClass(this._node, "ic-collapsed");
            }
        }

        this._removeAnimatingNode();
    };
    Tile.prototype.shutdownUI = function () {
        this._cleanup();
    };

    function createLayoutChild(host, /*@dynamic*/elementOverride, defaultElement, defaultOptions) {
        ///<summary>This function is used by layouts to create child element HTML.  It handles checking the options
        ///for overrides and applying the necessary CSS class</summary>
        ///<param name='host' type='IdentityControlElementHost'/>
        ///<param name='elementOverride' optional='true'>An option value in the layout that overrides the default type for this element</param>
        ///<param name='defaultElement' optional='true' type='Function'>The type of element to create if no override is present
        ///in the options</param>
        ///<param name='defaultOptions' type='Object' optional='true'>The options to apply if the defaultElement is created.  If the element
        ///is overriden, the className property of this options struct will still be applied.</param>
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isNullOrUndefined(elementOverride) || Jx.isObject(elementOverride) || Jx.isFunction(elementOverride));
        Debug.assert(Jx.isNullOrUndefined(defaultElement) || Jx.isFunction(defaultElement));
        Debug.assert(Jx.isNullOrUndefined(defaultOptions) || Jx.isObject(defaultOptions));

        var elementType = defaultElement;
        var elementOptions = defaultOptions;

        if (elementOverride !== undefined) {
            if (Jx.isFunction(elementOverride)) {
                // A parameterless override can be specified as:
                //     { primaryContent:  People.IdentityElements.Name }
                elementType = elementOverride;
                elementOptions = null;
            } else {
                // Parameters are specified as:
                //     { primaryContent:  { element: People.IdentityElements.Name, className: "brightGreen" } }
                Debug.assert(Jx.isObject(elementOverride) || elementOverride === null);
                elementType = getOption(elementOverride, "element");
                Debug.assert(Jx.isFunction(elementType) || elementOverride === null);
                elementOptions = elementOverride;
            }

            if (elementType && defaultOptions && defaultOptions.className) {
                // The caller specified a CSS class and it must be applied to overriden elements, to ensure
                // proper layout.
                elementOptions = addClassNameToOptions(defaultOptions.className, elementOptions);
            }
        }

        if (elementType) {
            return host.getUI(elementType, elementOptions);
        } else {
            return "";
        }
    }

    function createLayoutChildren(host, elementArray) {
        ///<summary>This function is used by layouts to create child element HTML from arrays.</summary>
        ///<param name='host' type='IdentityControlElementHost'/>
        ///<param name='elementArrayOverride' type='Array' optional='true'>An array of elements to create</param>
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isNullOrUndefined(elementArray) || Jx.isArray(elementArray));

        var html = "";
        if (elementArray) {
            for (var i = 0; i < elementArray.length; ++i) {
                html += createLayoutChild(host, elementArray[i]);
            }
        }

        return html;
    }

    var BillboardLayout = Elements.BillboardLayout = /*@constructor*/function () {
        ///<summary>The BillboardLayout provides the following options: { 
        ///         size:             60, // can be 40, 60 or 100
        ///         fontSize:         "medium", // can be "medium" or "normal"
        ///         tile:             Elements.Tile,
        ///         statusIndicator:  Elements.StatusIndicator,
        ///         primaryContent:   Elements.Name,
        ///         secondaryContent: null
        ///}</summary>
        this._isSelected = /*@static_cast(Boolean)*/null; // initially null, updateSelection will run to set the correct state
        this._selectionManager = /*@static_cast(SelectionManager)*/null;
        this._selectionNode = /*@static_cast(HTMLElement)*/null;
        this._selectionHost = /*@static_cast(IdentityControlElementHost)*/null;
        this._selectionOnParent = false;
        this._observer = null;
        Debug.only(Object.seal(this));
    };
    Jx.inherit(BillboardLayout, BaseElement);
    BillboardLayout.prototype.getUI = function (host, locator, options) {
        var size = getOption(options, "size", 60);
        Debug.assert(size === 40 || size === 60 || size === 100, "Invalid size specified for BillboardLayout");
        var fontSize = getOption(options, "fontSize", "medium");
        Debug.assert(fontSize === "medium" || fontSize === "normal", "Invalid fontSize specified for BillboardLayout");

        // The tile is on the left of a billboard IC.
        var tile = createLayoutChild(host, getOption(options, "tile"), Elements.Tile, {
            className: "ic-billboardLayout-tile",
            size: size,
            statusIndicator: getOption(options, "statusIndicator"),
            tilePriority: getOption(options, "tilePriority")
        });

        // Usually, the "primary area" just contains the primaryContent text.
        var primaryContent = createLayoutChild(host, getOption(options, "primaryContent"), Elements.Name, {
            className: "ic-billboardLayout-primaryContent ic-billboardLayout-primaryContent-" + fontSize + " singleLineText"
        });
        var primaryArea = primaryContent;

        // When a selection manager is provided, it also contains a selection glyph.
        var selectionBackground = "";
        if (host.getSelectionManager()) {
            selectionBackground = "<div class='ic-billboardLayout-selection ic-billboardLayout-selectionBackground'></div>";

            // The selectionMark is unicode character U+E081.  This is private character that is rendered as a check mark in Segoe UI Symbol.
            primaryArea = "<div class='ic-billboardLayout-primaryArea'>" +
                primaryContent +
                "<div class='ic-billboardLayout-selection ic-billboardLayout-selectionMark'>\ue081</div>" +
            "</div>";

            this._selectionOnParent = getOption(options, "selectionOnParent", false);
        }

        // The "text area" is a vertical flow: a line for the primary area and a line for the secondary
        var textArea =
            "<div class='ic-billboardLayout-textArea ic-billboardLayout-textArea-" + size + " ic-billboardLayout-textArea-" + fontSize + "'>" +
                primaryArea +
                createLayoutChild(host, getOption(options, "secondaryContent"), null, {
                    className: "ic-billboardLayout-secondaryContent singleLineText"
                }) +
            "</div>";

        // We apply a bunch of classes to the billboard IC so that it can set its width correctly
        var className =
            "ic-billboardLayout" +
            " ic-billboardLayout-" + size +
            " ic-billboardLayout-" + fontSize;

        return makeElement("div", locator, className, options,
            selectionBackground +
            tile +
            textArea
        );
    };
    BillboardLayout.prototype.clone = function (host) {
        var clone = new BillboardLayout();
        clone._selectionOnParent = this._selectionOnParent;
        return clone;
    };
    BillboardLayout.prototype.activateUI = function (host, node) {
        var selectionManager = this._selectionManager = host.getSelectionManager();
        if (selectionManager) {
            this._selectionHost = host;
            this._selectionNode = this._selectionOnParent ? node.parentElement : node;
            this._observer = Jx.observeAttribute(this._selectionNode, "aria-selected", this._onAttrChange, this);
            selectionManager.addListener("selectionchange", this._onSelectionChange, this);
            host.bind(this._initializeSelection, this, P.Priority.synchronous);
        }
    };
    BillboardLayout.prototype.shutdownUI = function (host) {
        var selectionManager = this._selectionManager;
        if (selectionManager) {
            this._selectionManager = null;
            selectionManager.removeListener("selectionchange", this._onSelectionChange, this);
        }
        var observer = this._observer;
        if (observer) {
            this._observer = null;
            observer.disconnect();
        }
    };
    BillboardLayout.prototype._initializeSelection = function () {
        this._updateSelection(false /*do not animate*/);
    };
    BillboardLayout.prototype._onSelectionChange = function () {
        /// <summary>Called when the selection manager informs us that the selection has been changed</summary>
        this._updateSelection(true /*animate*/);
    };
    BillboardLayout.prototype._updateSelection = function (animate) {
        /// <summary>Updates the selection visuals for this item</summary>
        /// <param name="animate" type="Boolean">True if we should animate the selection change
        ///  (based on user action).  False or not present if we should not animate (when initializing or recycling
        ///  the element).</param>
        Debug.assert(Jx.isBoolean(animate), "invalid parameter - animate");
        var dataObject = this._selectionHost.getDataObject();
        if (dataObject) {
            var isSelected = this._selectionManager.isSelected(dataObject);
            if (isSelected !== this._isSelected) {
                this._isSelected = isSelected;
                this._selectionNode.setAttribute("aria-selected", isSelected.toString());
                Jx.setClass(this._selectionNode, "win-selected", isSelected);
                if (animate && (!P.Animation || !P.Animation.disabled)) {
                    WinJS.UI.Animation[isSelected ? "swipeSelect" : "swipeDeselect"](null, this._selectionNode.querySelectorAll(".ic-billboardLayout-selection"));
                }
            }
        }
    };
    BillboardLayout.prototype._onAttrChange = function (ev) {
        var node = this._selectionNode;
        if (node.getAttribute("aria-selected") !== this._isSelected.toString()) {
            msSetImmediate(function () { node.click(); });
        }
    };

    var PickerLayout = Elements.PickerLayout = /*@constructor*/function () {
        ///<summary>The PickerLayout adds a secondary hit target to the right side of the billboard layout.  It provides all of the options the billboard provides, plus one: {
        ///    secondaryHitTarget: null
        ///}</summary>
        Debug.only(Object.seal(this));
    };
    Jx.inherit(PickerLayout, BaseElement);
    PickerLayout.prototype.getUI = function (host, locator, options) {
        // The picker layout will pass through its options to the billboard layout
        Debug.assert(getOption(options, "size", 60) === 60);
        Debug.assert(getOption(options, "fontSize", "medium") === "medium");

        // All of the options but className pass down to the billboard layout
        var billboardOptions = Object.create(options);
        billboardOptions.className = "";
        billboardOptions.selectionOnParent = true;

        return makeElement(
            "div",
            locator,
            "ic-pickerLayout",
            options,
            host.getUI(BillboardLayout, billboardOptions) +
            createLayoutChild(host, getOption(options, "secondaryHitTarget"), null, {
                className: "ic-pickerLayout-secondaryHitTarget"
            })
        );
    };
    PickerLayout.prototype.activateUI = function (host, node) {
        // Prevent clicks/touches from propagating to the IC from the secondary hit target
        var billboard = node.querySelector(".ic-billboardLayout");
        P.Animation.addPressStyling(billboard);

        var secondaryHitTarget = node.querySelector(".ic-pickerLayout-secondaryHitTarget");
        secondaryHitTarget.setAttribute("role", "button");
        secondaryHitTarget.setAttribute("aria-label", Jx.res.getString("/identityControl/icSecondaryHitTarget"));
        secondaryHitTarget.setAttribute("aria-haspopup", "true");
        secondaryHitTarget.addEventListener("click", function (ev) { ev.stopPropagation(); }, false);
        secondaryHitTarget.addEventListener("MSPointerDown", function (ev) { ev.stopPropagation(); }, false);
        secondaryHitTarget.addEventListener("mousedown", function (ev) { ev.stopPropagation(); }, false);
        P.Animation.addPressStyling(secondaryHitTarget);
    };

    var TileLayout = Elements.TileLayout = /*@constructor*/function () {
        ///<summary>The TileLayout provides the following options: { 
        ///         tile:                   Elements.Tile,
        ///         primaryContent:         Elements.Name,
        ///         secondaryContent:       null,
        ///         snap:                   false
        ///}</summary>
        Debug.only(Object.seal(this));
    };
    Jx.inherit(TileLayout, BaseElement);
    TileLayout.prototype.getUI = function (host, locator, options) {
        var tileSize = getOption(options, "size", 220);
        var tileContent = "<div class='ic-tileContainer'>" +
            createLayoutChild(host, getOption(options, "tile"), Elements.Tile, {
                className: "ic-tileLayout-tile",
                size: tileSize,
                tilePriority: getOption(options, "tilePriority"),
                defaultImage: getOption(options, "defaultImage")
            }) +
            "</div>";

        var primaryContent = createLayoutChild(host, getOption(options, "primaryContent"), Elements.Name, { className: "ic-tileLayout-primaryText" });
        if (Jx.isNonEmptyString(primaryContent)) {  // don't bother creating the wrapper div (and margin) if there is no content
            primaryContent = "<div class='ic-tileLayout-primary'>" + primaryContent + "</div>";
        }

        var secondaryContent = createLayoutChild(host, getOption(options, "secondaryContent"), null, { className: "ic-tileLayout-secondary" });

        var innerHighlight = "";
        if (getOption(options, "useInnerHighlight", false)) {
            var dimension = tileSize - 4;
            var style = "'position:absolute; top:2px; left:2px; width:" + dimension + "px; height:" + dimension + "px; outline-style:solid; outline-width:2px'";
            innerHighlight = "<div class='ic-tile-innerHighlight' style=" + style + "></div>";
        }

        var snapClassName = getOption(options, "snap") ? "ic-tileLayout-snap" : "";
        var portraitClassName = getOption(options, "portrait") ? "ic-tileLayout-portrait" : "";

        return makeElement("div", locator, "ic-tileLayout " + snapClassName + " " + portraitClassName, options, tileContent + primaryContent + secondaryContent + innerHighlight);
    };

    function setNodeText(node, text) {
        /// <summary>Sets text into a TextNode.  Setting text this way is twice as fast as setting innerText</summary>
        /// <param name="node" type="Node"/>
        /// <param name="text" type="String"/>
        if (node.parentNode) {
            node.nodeValue = text || "";
        }
        
        if (!node.parentNode) {
            Jx.log.warning("Attempting to set text on a TextNode that has been destroyed.  This may indicate a leak, or may simply be due to a delayed call to identityControl.shutdownUI.\ntext=" + text);
        }
        
    }

});
